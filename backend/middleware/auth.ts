import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, TokenPayload } from "../utils/jwt";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT access token from Authorization header
 * Attaches user payload to req.user
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Access denied. No token provided." });
    return;
  }

  const token = authHeader.split(" ")[1];

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    res.status(401).json({ message: "Invalid or expired token." });
    return;
  }

  req.user = decoded;
  next();
};

export default authMiddleware;
