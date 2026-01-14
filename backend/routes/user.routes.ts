import express from "express";
import { getUsers, getUserById } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

// GET /api/users - Get all users (except current)
router.get("/", authMiddleware, getUsers);

// GET /api/users/:id - Get single user
router.get("/:id", authMiddleware, getUserById);

export default router;
