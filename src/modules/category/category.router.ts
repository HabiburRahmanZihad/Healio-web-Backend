import { Router } from "express";
import { createCategory, deleteCategory, getCategories } from "./category.controller";
import authMiddleware, { UserRole } from "../../middleware/authentication";

const router = Router();

router.get("/", getCategories);
router.post("/", authMiddleware(UserRole.ADMIN), createCategory);
router.delete("/:id", authMiddleware(UserRole.ADMIN), deleteCategory);

export const categoryRouter = router;