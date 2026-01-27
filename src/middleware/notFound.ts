import { Request, Response } from "express";

export function notFound(req: Request, res: Response) {
    res.status(404).json({
        success: false,
        message: "Resource not found",
        details: `Cannot ${req.method} ${req.originalUrl}`,
        timestamp: new Date().toISOString(),
    });
}
