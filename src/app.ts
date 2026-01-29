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
import { prisma } from "./lib/prisma";
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
    console.log(">>> [REG_PROXY] START:", req.body?.email);
    res.setHeader('Content-Type', 'application/json');

    try {
        // 1. Better Auth Sign Up
        console.log(">>> [REG_PROXY] Calling Better Auth signUpEmail...");
        const result = await auth.api.signUpEmail({
            body: req.body,
        });

        const data = result as any;
        if (data?.error) {
            console.warn(">>> [REG_PROXY] Better Auth returned an error:", data.error);
            return res.status(200).json({ error: data.error }); // Return 200 with error object to prevent proxy-level 500s
        }

        if (data?.user) {
            console.log(">>> [REG_PROXY] SUCCESS: User created:", data.user.email);

            let verificationUrl: string | null = null;
            try {
                // Generate a token manually using Prisma as a safe fallback 
                console.log(">>> [REG_PROXY] Generating fallback verification token...");
                const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

                // Create verification record in DB (Don't let this failure block the whole response, but log it)
                prisma.verification.create({
                    data: {
                        identifier: data.user.email,
                        value: token,
                        expiresAt,
                    }
                }).then(() => {
                    console.log(">>> [REG_PROXY] DB verification record created successfully");
                }).catch(e => {
                    console.error(">>> [REG_PROXY] DB verification record creation FAILED:", (e as any).message);
                });

                verificationUrl = `${config.better_auth.url}/verify-email?token=${token}&callbackURL=${config.app_url}/login`;
                console.log(">>> [REG_PROXY] Verification URL generated:", verificationUrl);

                // Trigger official verification email in background
                console.log(">>> [REG_PROXY] Scheduling official verification email...");
                auth.api.sendVerificationEmail({
                    body: { email: data.user.email }
                }).catch(e => console.error(">>> [REG_PROXY] Background email trigger FAILED (non-fatal):", (e as any).message));

            } catch (innerError: any) {
                console.error(">>> [REG_PROXY] ERROR in verification logic:", innerError.message);
            }

            console.log(">>> [REG_PROXY] Sending final SUCCESS JSON response");
            return res.json({
                user: { id: data.user.id, email: data.user.email, name: data.user.name },
                session: data.session || null,
                verificationUrl: verificationUrl
            });
        }

        console.log(">>> [REG_PROXY] Sending fallthrough result");
        return res.json(result);

    } catch (err: any) {
        console.error(">>> [REG_PROXY] CRITICAL CATCH:", err);
        return res.status(500).json({
            error: {
                message: err.message || "An internal error occurred in the registration proxy",
                code: "PROXY_FATAL"
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
