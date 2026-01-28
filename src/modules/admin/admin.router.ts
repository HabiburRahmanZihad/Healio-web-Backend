import { Router } from "express";
import { getStats, getUsers, updateUserStatus } from "./admin.controller";
import authMiddleware, { UserRole } from "../../middleware/authentication";

const router = Router();

// All admin routes
router.use(authMiddleware(UserRole.ADMIN));

router.get("/users", getUsers);
router.patch("/users/:id", updateUserStatus);
router.get("/stats", getStats);

export const adminRouter = router;
