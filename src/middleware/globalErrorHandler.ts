import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma";

// ================================
// Global Error Handler
// ================================
function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        let statusCode = err.statusCode || err.status || 500;
        let message = err.message || "Internal Server Error";
        let details: any = null;

        // Safely check for Prisma errors without assuming Prisma is correctly loaded
        if (err && typeof err === 'object') {
            const constructorName = err.constructor?.name;

            if (constructorName?.includes('PrismaClientValidationError')) {
                statusCode = 400;
                message = "Invalid request data";
                details = err.message;
            } else if (constructorName?.includes('PrismaClientKnownRequestError')) {
                switch (err.code) {
                    case "P2002":
                        statusCode = 409;
                        message = "Duplicate value violates unique constraint";
                        details = err.meta;
                        break;
                    case "P2025":
                        statusCode = 404;
                        message = "Requested record not found";
                        details = err.meta;
                        break;
                    default:
                        statusCode = 400;
                        message = "Database request error";
                        details = err.meta;
                }
            } else if (constructorName?.includes('PrismaClientInitializationError')) {
                statusCode = 500;
                message = "Database connection failed";
            }
        }

        // Always return JSON
        return res.status(statusCode).json({
            success: false,
            message,
            details,
            stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
        });
    } catch (handlerError) {
        console.error("CRITICAL ERROR IN ERROR HANDLER:", handlerError);
        // Last resort fallback
        return res.status(500).json({
            success: false,
            message: "A critical internal server error occurred.",
        });
    }
}

export default errorHandler;