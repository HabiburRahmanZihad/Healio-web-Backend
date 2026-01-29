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

// Public routes
router.get("/", getMedicines);
router.get("/:id", getMedicineDetails);

// Seller routes
router.post("/", authMiddleware(UserRole.SELLER), createMedicine);
router.put("/:id", authMiddleware(UserRole.SELLER), updateMedicine);
router.delete("/:id", authMiddleware(UserRole.SELLER), deleteMedicine);

// Seller specific routes (to be mounted at /api/seller/medicines)
export const sellerMedicineRouter = Router();
sellerMedicineRouter.get("/", authMiddleware(UserRole.SELLER), getSellerMedicines);
sellerMedicineRouter.post("/", authMiddleware(UserRole.SELLER), createMedicine);
sellerMedicineRouter.put("/:id", authMiddleware(UserRole.SELLER), updateMedicine);
sellerMedicineRouter.delete("/:id", authMiddleware(UserRole.SELLER), deleteMedicine);

export const medicineRouter = router;
