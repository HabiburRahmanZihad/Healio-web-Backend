import { Request, Response } from "express";
import { CategoryService } from "./category.service";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";

export const createCategory = catchAsync(async (req: Request, res: Response) => {
    const { name } = req.body;
    const result = await CategoryService.create(name);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Category created successfully",
        data: result,
    });
});

export const getCategories = catchAsync(async (_req: Request, res: Response) => {
    const result = await CategoryService.getAll();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Categories fetched successfully",
        data: result,
    });
});

export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Category id is required" });
    }
    await CategoryService.delete(id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Category deleted successfully",
        data: null,
    });
});
