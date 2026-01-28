import { Router } from "express";
import { createReview, getMedicineReviews } from "./review.controller";
import authMiddleware, { UserRole } from "../../middleware/authentication";

const router = Router();

// Public route to view reviews
router.get("/:medicineId", getMedicineReviews);

// Customer route to leave a review
router.post("/", authMiddleware(UserRole.CUSTOMER), createReview);

export const reviewRouter = router;
