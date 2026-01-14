import mongoose, { Schema } from "mongoose";
import { ConversationProps } from "../types";

const conversationSchema = new Schema<ConversationProps>(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
    },
    name: String,
    description: String,
    avatar: String,
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: Date,
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    lastReadAt: {
      type: Map,
      of: Date,
      default: new Map(),
    },
    typingUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isMuted: {
      type: Map,
      of: Boolean,
      default: new Map(),
    },
  },
  { timestamps: true }
);

// Index for fetching user's conversations sorted by latest
conversationSchema.index({ participants: 1, lastMessageAt: -1 });

const Conversation = mongoose.model<ConversationProps>(
  "Conversation",
  conversationSchema
);
export default Conversation;
