import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

import { auth } from "./lib/auth";
import errorHandler from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";
import { categoryRouter } from "./modules/category/category.router";

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
// Better Auth Routes
// ================================
app.all('/api/auth/{*any}', toNodeHandler(auth));

// ================================
// Application Routes
// ================================
app.use("/api/categories", categoryRouter);

// ================================
// Health Check
// ================================
app.get("/health", (_req, res) => {
    res.status(200).send("OK");
});

// ================================
// Root Route
// ================================
app.get("/", (_req, res) => {
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
