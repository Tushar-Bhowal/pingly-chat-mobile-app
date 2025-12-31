import { Router } from "express";
import {
  register,
  login,
  refreshTokenHandler,
  verifyOTP,
  forgotPassword,
  logout,
  getMe,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth";
import { loginRateLimiter, otpRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", loginRateLimiter, login);
router.post("/refresh-token", refreshTokenHandler);

// OTP routes (rate limited)
router.post("/forgot-password", otpRateLimiter, forgotPassword);
router.post("/verify-otp", otpRateLimiter, verifyOTP);

// Protected routes (require authentication)
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, getMe);

export default router;
