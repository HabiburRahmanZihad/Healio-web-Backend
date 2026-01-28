import { Router } from "express";
import {
    createOrder,
    getMyOrders,
    getOrderDetails,
    updateOrderStatus,
    getSellerStats,
    cancelOrder,
} from "./order.controller";
import authMiddleware, { UserRole } from "../../middleware/authentication";

const router = Router();

// Seller only
router.get("/seller/stats", authMiddleware(UserRole.SELLER), getSellerStats);

// Customer only
router.post("/", authMiddleware(UserRole.CUSTOMER), createOrder);
router.patch("/:id/cancel", authMiddleware(UserRole.CUSTOMER), cancelOrder);

// Common route for all roles (internal logic filters)
router.get("/", authMiddleware(), getMyOrders);
router.get("/:id", authMiddleware(), getOrderDetails);

// Seller and Admin
router.patch("/:id/status", authMiddleware(UserRole.SELLER, UserRole.ADMIN), updateOrderStatus);

// Seller specific routes (to be mounted at /api/seller/orders)
export const sellerOrderRouter = Router();
sellerOrderRouter.get("/", authMiddleware(UserRole.SELLER), getMyOrders);
sellerOrderRouter.patch("/:id", authMiddleware(UserRole.SELLER), updateOrderStatus);

export const orderRouter = router;
