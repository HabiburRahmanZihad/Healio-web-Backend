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
    "http://localhost:3000", // Keep local dev accessible
    "https://healio-web.vercel.app" // Example Frontend Production URL
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

// ================================
// Body Parser
// ================================
app.use(express.json());

// ================================
// Better Auth Routes & Aliases
// ================================

// Aliases must come BEFORE the general handler to avoid shadowing
app.get("/api/auth/me", authMiddleware(), getMyProfile);

app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
        console.log("Registering user:", req.body.email);

        // 1. Proxy to better-auth sign-up
        const result = await auth.api.signUpEmail({
            body: req.body,
        });

        console.log("Signup success for:", req.body.email);

        // 2. Generate verification token manually (if not returned by signup)
        let verificationUrl: string | null = null;
        try {
            console.log("Generating verification token for:", req.body.email);
            const token = await (auth.api as any).generateVerificationToken({
                body: {
                    email: req.body.email,
                },
            });

            if (token) {
                console.log("Token generated successfully");
                verificationUrl = `${config.better_auth.url}/verify-email?token=${token.token}&callbackURL=${config.app_url}/login`;

                // 3. Try to send email in background
                import("nodemailer").then(async (nodemailer) => {
                    try {
                        const transporter = nodemailer.createTransport({
                            host: config.smtp.host || "smtp.gmail.com",
                            port: config.smtp.port || 587,
                            secure: false,
                            auth: {
                                user: config.smtp.user,
                                pass: config.smtp.pass,
                            },
                        });

                        await transporter.sendMail({
                            from: `"Healio" <no-reply@healio.com>`,
                            to: req.body.email,
                            subject: "Verify your email address",
                            html: `
                                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                                    <h1 style="color: #0f172a; font-size: 24px; font-weight: bold; margin-bottom: 16px;">Welcome to Healio!</h1>
                                    <p style="color: #475569; font-size: 16px; line-height: 24px; margin-bottom: 24px;">Please verify your email address to get started with your ${req.body.role.toLowerCase()} account.</p>
                                    <a href="${verificationUrl}" style="display: inline-block; background-color: #2563eb; color: white; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Verify Email Address</a>
                                    <p style="color: #94a3b8; font-size: 14px; margin-top: 32px;">If you didn't create an account, you can safely ignore this email.</p>
                                </div>
                            `,
                        });
                        console.log(`Verification email sent to ${req.body.email}`);
                    } catch (emailError) {
                        console.error("Failed to send email in background:", emailError);
                    }
                }).catch(err => console.error("Import error for nodemailer:", err));
            }
        } catch (tokenErr) {
            console.error("Token generation error (non-fatal):", tokenErr);
        }

        // Return combined result
        const finalResponse = {
            ...result,
            verificationUrl
        };
        console.log("Returning combined result for:", req.body.email, JSON.stringify(finalResponse).substring(0, 100) + "...");
        res.json(finalResponse);
    } catch (outerError) {
        console.error("FATAL error in /api/auth/register proxy:", outerError);
        res.status(500).json({
            error: "Internal Server Error",
            message: outerError instanceof Error ? outerError.message : String(outerError)
        });
    }
});

app.post("/api/auth/login", async (req: Request, res: Response) => {
    // Proxy to better-auth sign-in
    const result = await auth.api.signInEmail({
        body: req.body,
    });
    res.json(result);
});

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

// ================================
// Health Check
// ================================
app.get("/health", (_req: Request, res: Response) => {
    res.status(200).send("OK");
});

// ================================
// Root Route
// ================================
app.get("/", (_req: Request, res: Response) => {
    res.send("🚀 Helio Web API is running");
});

// ================================
// 404 Handler (AFTER routes)
// ================================
app.use(notFound);

// ================================
// Global Error Handler (LAST)
// ================================
app.use(errorHandler);

export default app;
