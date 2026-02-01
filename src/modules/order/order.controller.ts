import { Request, Response } from "express";
import { OrderService } from "./order.service";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";

export const createOrder = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user || user.role !== "CUSTOMER") {
        return res.status(403).json({ success: false, message: "Only customers can place orders" });
    }

    const result = await OrderService.create({
        ...req.body,
        customerId: user.id,
    });

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Order placed successfully",
        data: result,
    });
});

export const getMyOrders = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { search, page, limit } = req.query;
    const filter = {
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
    };

    let result;
    if (user.role === "CUSTOMER") {
        result = await OrderService.getCustomerOrders(user.id, filter);
    } else if (user.role === "SELLER") {
        result = await OrderService.getSellerOrders(user.id, filter);
    } else {
        result = await OrderService.getAdminOrders(filter);
    }

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Orders fetched successfully",
        meta: result.meta,
        data: result.data,
    });
});

export const getOrderDetails = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const result = await OrderService.getById(id);
    if (!result) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Check permission: customer can only see their own
    const user = req.user;
    if (user?.role === "CUSTOMER" && result.customerId !== user.id) {
        return res.status(403).json({ success: false, message: "Forbidden" });
    }

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Order details fetched successfully",
        data: result,
    });
});

export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    if (!id || !status) {
        return res.status(400).json({ success: false, message: "ID and status are required" });
    }

    if (!user || user.role === "CUSTOMER") {
        return res.status(403).json({ success: false, message: "Only sellers and admins can update order status" });
    }

    let result;
    if (user.role === "ADMIN") {
        result = await OrderService.updateStatus(id, status);
    } else {
        // It's a seller (enforced by middleware or early return above)
        result = await OrderService.updateSellerOrderStatus(id, status, user.id);
    }

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Order status updated successfully",
        data: result,
    });
});

export const getSellerStats = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user || user.role !== "SELLER") {
        return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const result = await OrderService.getSellerStats(user.id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Seller stats fetched successfully",
        data: result,
    });
});

export const cancelOrder = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;

    if (!id || !user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await OrderService.cancelOrder(id, user.id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Order cancelled successfully",
        data: result,
    });
});
