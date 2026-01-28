import { Request, Response } from "express";
import { ReviewService } from "./review.service";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";

export const createReview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user || user.role !== "CUSTOMER") {
        return res.status(403).json({ success: false, message: "Only customers can leave reviews" });
    }

    const result = await ReviewService.create({
        ...req.body,
        userId: user.id,
    });

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Review submitted successfully",
        data: result,
    });
});

export const getMedicineReviews = catchAsync(async (req: Request, res: Response) => {
    const { medicineId } = req.params;
    if (!medicineId) {
        return res.status(400).json({ success: false, message: "Medicine ID is required" });
    }

    const result = await ReviewService.getByMedicine(medicineId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Reviews fetched successfully",
        data: result,
    });
});
