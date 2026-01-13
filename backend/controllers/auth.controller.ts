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
import {
  generateOTP,
  storeOTP,
  verifyCachedOTP,
  sendOTPEmail,
  storeTempUser,
  getTempUser,
} from "../utils/otp";

// Validation schemas with User-Friendly Messages
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password cannot be empty"),
});

const otpSchema = z.object({
  email: z.string().email("Invalid email for verification"),
  otp: z.string().length(4, "OTP must be exactly 4 digits"), // Updated to 4 digits
  // flow is optional for backward compat but recommended
  flow: z.enum(["signup", "forgot-password"]).optional(),
});

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
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
      const errorMsg = validation.error.issues[0].message; // Friendly first error
      res.status(400).json({
        message: errorMsg,
        errors: validation.error.issues,
      });
      return;
    }

    const { name, email, password } = validation.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      if (existingUser.isVerified) {
        res
          .status(400)
          .json({ message: "User already exists with this email" });
        return;
      } else {
        // If user exists but NOT verified, we can effectively "restart" registration
        // by overwriting their temp data in the next steps (or deleting old unverified user if in DB)
        // For strict cleanliness, let's delete any unverified DB record if it exists (legacy cleanup)
        await User.deleteOne({ _id: existingUser._id });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Secure Flow: Do NOT create user in DB yet.
    // Store temporarily in Cache (TTL 10 mins)
    storeTempUser(
      email.toLowerCase(),
      {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        // Any other initial fields
      },
      600 // 10 minutes
    );

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(email.toLowerCase(), otp, 600); // 10 minutes TTL

    // Send OTP via email (Signup Template)
    await sendOTPEmail(email.toLowerCase(), otp, "signup");

    // Log for dev environment only
    if (process.env.NODE_ENV === "development") {
      console.log(`Signup OTP for ${email}: ${otp}`);
    }

    // Return success message (NO TOKENS yet)
    res.status(200).json({
      message: "Verification code sent to your email",
      email: email.toLowerCase(),
      // Frontend should navigate to OTP screen
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

    // Generate tokens (pass user object, NOT just userId)
    const accessToken = generateAccessToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isVerified: user.isVerified,
    });
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

    // Fetch user to get their data for the new token
    const user = await User.findById(storedToken.owner);
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    // Generate new tokens (pass user object)
    const newAccessToken = generateAccessToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isVerified: user.isVerified,
    });
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

    // Generate and store OTP (4 digits)
    const otp = generateOTP();
    storeOTP(email.toLowerCase(), otp, 600); // 10 minutes TTL

    // Send OTP via email (Reset Template)
    await sendOTPEmail(email.toLowerCase(), otp, "reset");

    // Log for dev environment only
    if (process.env.NODE_ENV === "development") {
      console.log(`Reset OTP for ${email}: ${otp}`);
    }

    res.status(200).json({
      message: "If this email exists, you will receive a password reset code",
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
      const errorMsg = validation.error.issues[0].message;
      res.status(400).json({
        message: errorMsg,
        errors: validation.error.issues,
      });
      return;
    }

    const { email, otp, flow } = validation.data;

    // Verify OTP from cache
    const isValid = verifyCachedOTP(email.toLowerCase(), otp);

    if (!isValid) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    // Handle Signup Verification
    if (flow === "signup" || !flow) {
      // Retrieve temp user data
      const tempUser = getTempUser(email.toLowerCase());

      if (!tempUser) {
        res.status(400).json({
          message: "Registration session expired. Please sign up again.",
        });
        return;
      }

      // Check if user was somehow created already (race condition/retry)
      let user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        // Create User Now (Verified = True)
        user = await User.create({
          name: tempUser.name,
          email: tempUser.email,
          password: tempUser.password,
          isVerified: true,
          isOnline: true,
          lastSeen: new Date(),
        });
      } else {
        // Just ensure verified is true
        user.isVerified = true;
        user.isOnline = true;
        await user.save();
      }

      // Generate Tokens (pass user object)
      const accessToken = generateAccessToken({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
      });
      const refreshToken = generateRefreshToken();

      // Save refresh token
      await RefreshToken.create({
        owner: user._id,
        token: refreshToken,
        expires: getRefreshTokenExpiry(),
        createdIp: req.ip,
      });

      // Response with Tokens
      res.status(200).json({
        message: "Email verified successfully!",
        verified: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isVerified: user.isVerified,
          isOnline: user.isOnline,
        },
        accessToken,
        refreshToken,
      });
      return;
    } else if (flow === "forgot-password") {
      // Just return success so frontend can proceed to "Reset Password" screen
      // (The OTP is verified and consumed)
      res.status(200).json({
        message: "OTP verified. You can now reset your password.",
        verified: true,
      });
    }
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

// Validation schema for profile update
const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").optional(),
  avatar: z.string().url("Avatar must be a valid URL").optional(),
});

/**
 * @route PUT /api/auth/profile
 * @desc Update user profile (name, avatar)
 * @access Private
 */
export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Validate input
    const validation = updateProfileSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: validation.error.issues[0].message,
      });
      return;
    }

    const { name, avatar } = validation.data;

    // Build update object (only include fields that were provided)
    const updateData: { name?: string; avatar?: string } = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: "No fields to update" });
      return;
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
