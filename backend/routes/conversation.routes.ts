import express from "express";
import {
  createConversation,
  getConversations,
  getConversationById,
} from "../controllers/conversation.controller";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

// POST /api/conversations - Create conversation
router.post("/", authMiddleware, createConversation);

// GET /api/conversations - Get all user's conversations
router.get("/", authMiddleware, getConversations);

// GET /api/conversations/:id - Get single conversation
router.get("/:id", authMiddleware, getConversationById);

export default router;
