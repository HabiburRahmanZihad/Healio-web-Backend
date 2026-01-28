import { Router } from "express";
import { getMyProfile, updateMyProfile } from "./user.controller";
import authMiddleware from "../../middleware/authentication";

const router = Router();

// Get own profile
router.get("/me", authMiddleware(), getMyProfile);

// Update own profile
router.patch("/me", authMiddleware(), updateMyProfile);

export const userRouter = router;
