import mongoose, { Schema } from "mongoose";
import { RefreshTokenProps } from "../types";

const RefreshTokenSchema = new Schema<RefreshTokenProps>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    createdIp: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// TTL Index: Automatically deletes document from MongoDB when 'expires' time is reached
RefreshTokenSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

// Index for faster lookups by owner
RefreshTokenSchema.index({ owner: 1 });

// Index for token lookup
RefreshTokenSchema.index({ token: 1 });

const RefreshToken = mongoose.model<RefreshTokenProps>(
  "RefreshToken",
  RefreshTokenSchema
);

export default RefreshToken;
