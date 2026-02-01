import { Request, Response } from "express";
import { MedicineService } from "./medicine.service";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";

export const createMedicine = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user || user.role !== "SELLER") {
        return res.status(403).json({ success: false, message: "Only sellers can create medicines" });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
            success: false,
            message: "Request body is empty or missing. Please ensure you select 'JSON' in Postman (next to 'raw').",
        });
    }

    const { name, description, price, stock, image, manufacturer, categoryId } = req.body;

    if (!name || !description || price === undefined || stock === undefined || !image || !manufacturer || !categoryId) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: name, description, price, stock, image, manufacturer, and categoryId are all required.",
        });
    }

    const result = await MedicineService.create({
        ...req.body,
        sellerId: user.id,
    });

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Medicine created successfully",
        data: result,
    });
});

export const getSellerMedicines = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user || user.role !== "SELLER") {
        return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const result = await MedicineService.getBySeller(user.id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Seller medicines fetched successfully",
        data: result,
    });
});

export const getMedicines = catchAsync(async (req: Request, res: Response) => {
    const { search, category, manufacturer, minPrice, maxPrice } = req.query;

    const result = await MedicineService.getAll({
        search: search ? (search as string) : undefined,
        category: category ? (category as string) : undefined,
        manufacturer: manufacturer ? (manufacturer as string) : undefined,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
    });

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Medicines fetched successfully",
        data: result,
    });
});

export const getMedicineDetails = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ success: false, message: "ID is required" });
    }
    const result = await MedicineService.getById(id);

    if (!result) {
        return res.status(404).json({ success: false, message: "Medicine not found" });
    }

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Medicine details fetched successfully",
        data: result,
    });
});

export const updateMedicine = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;

    if (!id || !user || user.role !== "SELLER") {
        return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Filter body to only include allowed fields
    const { name, description, price, stock, image, manufacturer, categoryId, requiresPrescription } = req.body;
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (image !== undefined) updateData.image = image;
    if (manufacturer !== undefined) updateData.manufacturer = manufacturer;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (requiresPrescription !== undefined) updateData.requiresPrescription = requiresPrescription;

    const result = await MedicineService.update(id, user.id, updateData);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Medicine updated successfully",
        data: result,
    });
});

export const deleteMedicine = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;

    if (!id || !user || user.role !== "SELLER") {
        return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await MedicineService.delete(id, user.id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Medicine deleted successfully",
        data: null,
    });
});
