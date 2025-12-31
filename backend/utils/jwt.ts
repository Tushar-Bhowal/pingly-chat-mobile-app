import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_access_key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your_super_secret_refresh_key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";

// Payload type for access token
export interface TokenPayload {
  userId: string;
}

/**
 * Generate a short-lived access token (JWT)
 * @param userId - The user's MongoDB ObjectId as string
 * @returns Signed JWT access token
 */
export const generateAccessToken = (userId: string): string => {
  const payload: TokenPayload = { userId };
  // Convert string like "15m" to seconds for jwt.sign
  const expiresInSeconds = parseExpiresIn(JWT_EXPIRES_IN);
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: expiresInSeconds,
  });
};

/**
 * Parse expires in string to seconds
 * @param value - String like "15m", "1h", "7d"
 * @returns Number of seconds
 */
const parseExpiresIn = (value: string): number => {
  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // Default 15 minutes

  const num = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "s":
      return num;
    case "m":
      return num * 60;
    case "h":
      return num * 60 * 60;
    case "d":
      return num * 24 * 60 * 60;
    default:
      return 900;
  }
};

/**
 * Generate a random refresh token (hex string)
 * @returns Random 64-character hex string
 */
export const generateRefreshToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Verify and decode an access token
 * @param token - The JWT access token to verify
 * @returns Decoded payload or null if invalid
 */
export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Calculate refresh token expiry date
 * @returns Date object for when refresh token expires (default: 7 days)
 */
export const getRefreshTokenExpiry = (): Date => {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  const match = expiresIn.match(/^(\d+)([dhm])$/);

  if (!match) {
    // Default to 7 days
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  let milliseconds: number;
  switch (unit) {
    case "d":
      milliseconds = value * 24 * 60 * 60 * 1000;
      break;
    case "h":
      milliseconds = value * 60 * 60 * 1000;
      break;
    case "m":
      milliseconds = value * 60 * 1000;
      break;
    default:
      milliseconds = 7 * 24 * 60 * 60 * 1000;
  }

  return new Date(Date.now() + milliseconds);
};
