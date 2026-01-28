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

const app = express();

// ================================
// CORS Configuration
// ================================
app.use(cors({
    origin: process.env.APP_URL || "http://localhost:3000",
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
    // Proxy to better-auth sign-up
    const result = await auth.api.signUpEmail({
        body: req.body,
    });
    res.json(result);
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
