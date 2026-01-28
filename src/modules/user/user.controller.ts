import { Request, Response } from "express";
import { UserService } from "./user.service";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";

export const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await UserService.getProfile(user.id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Profile fetched successfully",
        data: result,
    });
});

export const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { name, image, phone } = req.body;
    const result = await UserService.updateProfile(user.id, { name, image, phone });

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Profile updated successfully",
        data: result,
    });
});
