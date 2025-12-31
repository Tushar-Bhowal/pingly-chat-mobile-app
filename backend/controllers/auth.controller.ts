import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import User from "../modals/User";
import RefreshToken from "../modals/RefreshToken";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
} from "../utils/jwt";
import { generateOTP, storeOTP, verifyCachedOTP } from "../utils/otp";

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const otpSchema = z.object({
  email: z.email("Invalid email format"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const emailSchema = z.object({
  email: z.email("Invalid email format"),
});

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: "Validation error",
        errors: validation.error.issues,
      });
      return;
    }

    const { name, email, password } = validation.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: "User already exists with this email" });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      isVerified: false,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken();

    // Save refresh token to database
    await RefreshToken.create({
      owner: user._id,
      token: refreshToken,
      expires: getRefreshTokenExpiry(),
      createdIp: req.ip,
    });

    // Return user data without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isVerified: user.isVerified,
    };

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @route POST /api/auth/login
 * @desc Login user & return tokens
 * @access Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: "Validation error",
        errors: validation.error.issues,
      });
      return;
    }

    const { email, password } = validation.data;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Update online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken();

    // Save refresh token
    await RefreshToken.create({
      owner: user._id,
      token: refreshToken,
      expires: getRefreshTokenExpiry(),
      createdIp: req.ip,
    });

    // Return user data without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isVerified: user.isVerified,
      isOnline: user.isOnline,
    };

    res.status(200).json({
      message: "Login successful",
      user: userResponse,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @route POST /api/auth/refresh-token
 * @desc Refresh access token using refresh token
 * @access Public
 */
export const refreshTokenHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: "Refresh token is required" });
      return;
    }

    // Find refresh token in database
    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken) {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    // Check if token is expired
    if (storedToken.expires < new Date()) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      res.status(401).json({ message: "Refresh token expired" });
      return;
    }

    // Token Rotation: Delete old token
    await RefreshToken.deleteOne({ _id: storedToken._id });

    // Generate new tokens
    const newAccessToken = generateAccessToken(storedToken.owner.toString());
    const newRefreshToken = generateRefreshToken();

    // Save new refresh token
    await RefreshToken.create({
      owner: storedToken.owner,
      token: newRefreshToken,
      expires: getRefreshTokenExpiry(),
      createdIp: req.ip,
    });

    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @route POST /api/auth/logout
 * @desc Logout user by deleting refresh token
 * @access Private
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Delete refresh token if provided
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken, owner: userId });
    }

    // Update user online status
    await User.findByIdAndUpdate(userId, {
      isOnline: false,
      lastSeen: new Date(),
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @route POST /api/auth/forgot-password
 * @desc Send OTP for password reset
 * @access Public
 */
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate input
    const validation = emailSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: "Validation error",
        errors: validation.error.issues,
      });
      return;
    }

    const { email } = validation.data;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists or not for security
      res.status(200).json({
        message: "If this email exists, you will receive an OTP",
      });
      return;
    }

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(email.toLowerCase(), otp, 300); // 5 minutes TTL

    // TODO: Send OTP via email (integrate with email service)
    // For now, log it (REMOVE IN PRODUCTION!)
    console.log(`OTP for ${email}: ${otp}`);

    res.status(200).json({
      message: "If this email exists, you will receive an OTP",
      // REMOVE IN PRODUCTION - only for testing
      _devOtp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @route POST /api/auth/verify-otp
 * @desc Verify OTP for password reset
 * @access Public
 */
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const validation = otpSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: "Validation error",
        errors: validation.error.issues,
      });
      return;
    }

    const { email, otp } = validation.data;

    // Verify OTP from cache
    const isValid = verifyCachedOTP(email.toLowerCase(), otp);

    if (!isValid) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    res.status(200).json({
      message: "OTP verified successfully",
      verified: true,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @route GET /api/auth/me
 * @desc Get current logged in user
 * @access Private
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
