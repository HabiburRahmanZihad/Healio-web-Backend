import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";

// ================================
// User Roles (MATCH PRISMA + AUTH)
// ================================
export enum UserRole {
    ADMIN = "ADMIN",
    SELLER = "SELLER",
    CUSTOMER = "CUSTOMER",
}

// ================================
// Extend Express Request
// ================================
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                name: string;
                email: string;
                role: UserRole;
                emailVerified: boolean;
                isBlocked: boolean;
            };
        }
    }
}

// ================================
// Authorization Middleware
// ================================
const authorize = (...roles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get session from Better Auth
            const session = await auth.api.getSession({
                headers: req.headers as any,
            });

            // Not authenticated
            if (!session || !session.user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            // Email not verified
            if (!session.user.emailVerified) {
                return res.status(403).json({ success: false, message: "Email not verified" });
            }

            // Cast user to any to access additional fields or use a specific type
            const user = session.user as any;

            // Blocked user
            if (user.isBlocked) {
                return res.status(403).json({ success: false, message: "User is blocked by admin" });
            }

            // Attach user to request
            req.user = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role as UserRole,
                emailVerified: user.emailVerified,
                isBlocked: !!user.isBlocked,
            };

            // Role-based access control
            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ success: false, message: "Forbidden" });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                details: (error as Error).message,
            });
        }
    };
};

export default authorize;