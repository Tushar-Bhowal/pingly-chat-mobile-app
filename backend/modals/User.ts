import mongoose, { Schema } from "mongoose";
import { UserProps } from "../types";

const UserSchema = new Schema<UserProps>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatar: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    bio: {
      type: String,
      default: "Hey there! I'm using Pingly",
      maxlength: 150,
    },
    // Online presence
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    // OTP Verification
    verifyOTP: {
      type: String,
    },
    verifyOTPExpiredAt: {
      type: Number,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Push Notifications
    pushTokens: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for text search on name
UserSchema.index({ name: "text" });

const User = mongoose.model<UserProps>("User", UserSchema);

export default User;
