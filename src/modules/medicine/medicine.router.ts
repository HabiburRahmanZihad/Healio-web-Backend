import { Router } from "express";
import {
    createMedicine,
    deleteMedicine,
    getMedicineDetails,
    getMedicines,
    getSellerMedicines,
    updateMedicine,
} from "./medicine.controller";
import authMiddleware, { UserRole } from "../../middleware/authentication";

const router = Router();

// Specific seller routes first
router.get("/seller/all", authMiddleware(UserRole.SELLER), getSellerMedicines);

// Public routes
router.get("/", getMedicines);
router.get("/:id", getMedicineDetails);

// Parametric seller routes (PATCH/DELETE)
router.post("/", authMiddleware(UserRole.SELLER), createMedicine);
router.patch("/:id", authMiddleware(UserRole.SELLER), updateMedicine);
router.delete("/:id", authMiddleware(UserRole.SELLER), deleteMedicine);

export const medicineRouter = router;
