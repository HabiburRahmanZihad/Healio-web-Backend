import express, { Request, Response } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

import { auth } from "./lib/auth";
import errorHandler from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";
import { categoryRouter } from "./modules/category/category.router";
import { medicineRouter, sellerMedicineRouter } from "./modules/medicine/medicine.router";
import { orderRouter, sellerOrderRouter } from "./modules/order/order.router";
import { adminRouter } from "./modules/admin/admin.router";
import { reviewRouter } from "./modules/review/review.router";
import { userRouter } from "./modules/user/user.router";
import { getMyProfile } from "./modules/user/user.controller";
import authMiddleware from "./middleware/authentication";

import { config } from "./config";

const app = express();

// ================================
// CORS Configuration
// ================================
const allowedOrigins = [
    config.app_url,
    "http://localhost:3000",
    "https://healio-web.vercel.app"
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}))

app.use(express.json());

// ================================
// Auth Proxies & Middleware
// ================================
app.get("/api/auth/me", authMiddleware(), getMyProfile);

// Custom Registration Proxy (Avoids collision with /api/auth/*)
app.post("/api/auth-registration", async (req: Request, res: Response) => {
    try {
        console.log("--> Registration hit for:", req.body.email);

        // 1. Better Auth Sign Up
        const result = await auth.api.signUpEmail({
            body: req.body,
        });

        const data = result as any;
        if (data?.error) {
            console.warn("Better Auth Error:", data.error);
            return res.json(result);
        }

        if (data?.user) {
            console.log("Success: User created:", data.user.email);

            // 2. Token Generation
            let verificationUrl: string | null = null;
            try {
                const tokenResult = await (auth.api as any).generateVerificationToken({
                    body: { email: data.user.email },
                });

                if (tokenResult) {
                    verificationUrl = `${config.better_auth.url}/verify-email?token=${tokenResult.token}&callbackURL=${config.app_url}/login`;

                    // 3. Background Email
                    import("nodemailer").then(async (nm) => {
                        try {
                            const transporter = nm.createTransport({
                                host: config.smtp.host || "smtp.gmail.com",
                                port: config.smtp.port || 587,
                                secure: false,
                                auth: { user: config.smtp.user, pass: config.smtp.pass },
                            });

                            await transporter.sendMail({
                                from: `"Healio" <no-reply@healio.com>`,
                                to: req.body.email,
                                subject: "Verify your email address",
                                html: `<div style="font-family:sans-serif; padding:20px;">
                                    <h2>Welcome to Healio!</h2>
                                    <p>Your account has been created. Click below to verify:</p>
                                    <a href="${verificationUrl}" style="background:#2563eb; color:white; padding:10px 20px; border-radius:5px; text-decoration:none; display:inline-block;">Verify Email</a>
                                    <p style="margin-top:20px; font-size:12px; color:#666;">If you can't click the button, copy this: ${verificationUrl}</p>
                                </div>`,
                            });
                            console.log("BG: Email sent successfully");
                        } catch (e) {
                            console.error("BG: Failed to send email:", e);
                        }
                    }).catch(e => console.error("BG: Failed to load nodemailer:", e));
                }
            } catch (tokenError) {
                console.error("Token generation failed:", tokenError);
            }

            return res.json({
                user: data.user,
                session: data.session,
                verificationUrl
            });
        }

        return res.json(result);

    } catch (error: any) {
        console.error("FATAL SIGNUP PROXY ERROR:", error);
        return res.status(500).json({
            error: {
                message: error.message || "Internal Server Error",
                code: "PROXY_ERROR"
            }
        });
    }
});

app.post("/api/auth/login", async (req: Request, res: Response) => {
    const result = await auth.api.signInEmail({ body: req.body });
    res.json(result);
});

// Better Auth Main Handler
app.use("/api/auth", toNodeHandler(auth));

// ================================
// Application Routes
// ================================
app.use("/api/categories", categoryRouter);
app.use("/api/medicines", medicineRouter);
app.use("/api/seller/medicines", sellerMedicineRouter);
app.use("/api/orders", orderRouter);
app.use("/api/seller/orders", sellerOrderRouter);
app.use("/api/admin", adminRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/users", userRouter);

app.get("/health", (_req, res) => res.status(200).send("OK"));

app.get("/", (_req, res) => res.send("🚀 Helio Web API is running"));

app.use(notFound);
app.use(errorHandler);

export default app;
