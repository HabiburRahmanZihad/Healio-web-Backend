import { Request, Response } from "express";
import { AdminService } from "./admin.service";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";

export const getUsers = catchAsync(async (_req: Request, res: Response) => {
    const result = await AdminService.getAllUsers();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Users fetched successfully",
        data: result,
    });
});

export const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isBlocked } = req.body;

    if (!id || isBlocked === undefined) {
        return res.status(400).json({ success: false, message: "ID and isBlocked are required" });
    }

    const result = await AdminService.updateUserStatus(id, !!isBlocked);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User status updated successfully",
        data: result,
    });
});

export const getStats = catchAsync(async (_req: Request, res: Response) => {
    const result = await AdminService.getDashboardStats();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Dashboard stats fetched successfully",
        data: result,
    });
});
