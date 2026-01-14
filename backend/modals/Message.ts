import mongoose, { Schema } from "mongoose";
import { MessageProps } from "../types";

const messageSchema = new Schema<MessageProps>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["text", "image", "video", "audio", "file"],
      default: "text",
    },
    attachment: String,
    attachmentMetadata: {
      fileName: String,
      fileSize: Number,
      mimeType: String,
    },
    deliveredTo: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    deliveredAt: Date,
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    readAt: {
      type: Map,
      of: Date,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    deletedFor: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.model<MessageProps>("Message", messageSchema);
export default Message;
