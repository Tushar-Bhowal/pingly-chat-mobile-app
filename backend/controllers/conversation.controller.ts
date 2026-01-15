import { Request, Response } from "express";
import Conversation from "../modals/Conversation";
import Message from "../modals/Message";
import { getIO } from "../socket/socket";

/**
 * @route POST /api/conversations
 * @desc Create a new group conversation
 * @access Private
 */
export const createConversation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { type, name, description, avatar, participants } = req.body;

    // Validation
    if (!type || !participants || !Array.isArray(participants)) {
      res.status(400).json({ message: "Type and participants are required" });
      return;
    }

    // For groups, name is required
    if (type === "group" && !name) {
      res.status(400).json({ message: "Group name is required" });
      return;
    }

    // Add creator to participants if not included
    const allParticipants = participants.includes(userId)
      ? participants
      : [userId, ...participants];

    // For direct chat, check if conversation already exists
    if (type === "direct") {
      if (allParticipants.length !== 2) {
        res
          .status(400)
          .json({ message: "Direct chat requires exactly 2 participants" });
        return;
      }

      const existing = await Conversation.findOne({
        type: "direct",
        participants: { $all: allParticipants, $size: 2 },
      }).populate("participants", "name avatar bio isOnline");

      if (existing) {
        res.status(200).json({ conversation: existing, isNew: false });
        return;
      }
    }

    // Create conversation
    const conversation = await Conversation.create({
      type,
      name: type === "group" ? name : undefined,
      description: type === "group" ? description : undefined,
      avatar: type === "group" ? avatar : undefined,
      participants: allParticipants,
      admins: type === "group" ? [userId] : undefined,
      createdBy: userId,
      lastMessageAt: new Date(),
    });

    // Populate participants
    await conversation.populate("participants", "name avatar bio isOnline");
    await conversation.populate("createdBy", "name avatar");

    // For groups, notify all other participants via socket
    if (type === "group") {
      const io = getIO();
      const otherParticipants = allParticipants.filter(
        (p: string) => p !== userId
      );

      otherParticipants.forEach((participantId: string) => {
        io.to(participantId).emit("conversationCreated", {
          conversation,
          createdBy: { _id: userId },
        });
      });
    }

    res.status(201).json({ conversation, isNew: true });
  } catch (error) {
    console.error("Create conversation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @route GET /api/conversations
 * @desc Get all conversations for current user
 * @access Private
 */
export const getConversations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name avatar bio isOnline lastSeen")
      .populate("lastMessage")
      .populate("createdBy", "name avatar")
      .sort({ lastMessageAt: -1 });

    res.status(200).json({ conversations });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @route GET /api/conversations/:id
 * @desc Get single conversation by ID
 * @access Private
 */
export const getConversationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const conversation = await Conversation.findOne({
      _id: id,
      participants: userId,
    })
      .populate("participants", "name avatar bio isOnline lastSeen")
      .populate("lastMessage")
      .populate("createdBy", "name avatar");

    if (!conversation) {
      res.status(404).json({ message: "Conversation not found" });
      return;
    }

    res.status(200).json({ conversation });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
