import { Router } from "express";
import {
  register,
  login,
  verifyOTP,
  forgotPassword,
  resetPassword,
  logout,
  getMe,
} from "../controllers/auth.controller";

const router = Router();

// Define routes
router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);
router.get("/me", getMe);

export default router;
