import { Router } from "express";
import {
    createMedicine,
    deleteMedicine,
    getMedicineDetails,
    getMedicines,
    updateMedicine,
} from "./medicine.controller";
import authMiddleware, { UserRole } from "../../middleware/authentication";

const router = Router();

// Public routes
router.get("/", getMedicines);
router.get("/:id", getMedicineDetails);

// Seller routes
router.post("/", authMiddleware(UserRole.SELLER), createMedicine);
router.put("/:id", authMiddleware(UserRole.SELLER), updateMedicine);
router.delete("/:id", authMiddleware(UserRole.SELLER), deleteMedicine);

export const medicineRouter = router;
