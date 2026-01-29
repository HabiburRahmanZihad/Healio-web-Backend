import express, { Request, Response } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

import { auth } from "./lib/auth";
import errorHandler from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";
import { categoryRouter } from "./modules/category/category.router";
import { medicineRouter } from "./modules/medicine/medicine.router";
import { orderRouter } from "./modules/order/order.router";
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
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}))

app.use(express.json());

// ================================
// Auth Proxies & Middleware
// ================================
app.get("/api/auth/me", authMiddleware(), getMyProfile);

// Custom Registration Proxy (Auto-verify email)
app.post("/api/auth-registration", async (req: Request, res: Response) => {
    console.log(">>> [REG_PROXY] START:", req.body?.email);
    res.setHeader('Content-Type', 'application/json');

    try {
        const result = await auth.api.signUpEmail({
            body: req.body,
        });

        const data = result as any;
        if (data?.error) {
            return res.status(200).json({ error: data.error });
        }

        if (data?.user) {
            console.log(">>> [REG_PROXY] User created. Verifying email...");

            // Auto-verify on registration
            await prisma.user.update({
                where: { email: data.user.email },
                data: { emailVerified: true }
            }).catch(e => console.error(">>> [REG_PROXY] Auto-verify failed:", e.message));

            return res.status(201).json({
                success: true,
                message: "Account created successfully",
                user: { ...data.user, emailVerified: true },
                session: data.session || null
            });
        }

        return res.status(200).json(result);

    } catch (err: any) {
        console.error(">>> [REG_PROXY] FATAL:", err);
        return res.status(500).json({
            error: { message: err.message || "Internal Server Error" }
        });
    }
});

// Custom Login Proxy (Auto-verify email on login)
app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
        const result = await auth.api.signInEmail({ body: req.body });
        const data = result as any;

        if (data?.user?.email) {
            console.log(">>> [LOGIN_PROXY] User logged in. Ensuring emailVerified: true");

            // Auto-verify on login (in case they were created before this change)
            await prisma.user.update({
                where: { email: data.user.email },
                data: { emailVerified: true }
            }).catch(e => console.error(">>> [LOGIN_PROXY] Auto-verify failed:", e.message));
        }

        return res.json(result);
    } catch (err: any) {
        console.error(">>> [LOGIN_PROXY] FATAL:", err);
        return res.status(500).json({
            error: { message: err.message || "Internal Server Error" }
        });
    }
});

// Better Auth Main Handler
app.use("/api/auth", toNodeHandler(auth));

// ================================
// Application Routes
// ================================
app.use("/api/categories", categoryRouter);
app.use("/api/medicines", medicineRouter);
app.use("/api/orders", orderRouter);
app.use("/api/admin", adminRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/users", userRouter);

app.get("/health", (_req, res) => res.status(200).send("OK"));

app.get("/", (_req, res) => res.send("🚀 Helio Web API is running"));

app.use(notFound);
app.use(errorHandler);

export default app;
