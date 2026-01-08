import crypto from "crypto";
import cache from "./cache";
import nodemailer from "nodemailer";

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Generate a 4-digit OTP
 * @returns 4-digit OTP string
 */
export const generateOTP = (): string => {
  // Generate a random 4-digit number between 1000 and 9999
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  return otp;
};

/**
 * Hash an OTP using SHA-256
 * @param otp - Plain text OTP
 * @returns Hashed OTP string
 */
export const hashOTP = (otp: string): string => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

/**
 * Verify OTP by comparing hashes
 * @param inputOtp - User-provided OTP
 * @param hashedOtp - Stored hashed OTP
 * @returns Boolean indicating if OTP matches
 */
export const verifyOTPHash = (inputOtp: string, hashedOtp: string): boolean => {
  const inputHash = hashOTP(inputOtp);
  return inputHash === hashedOtp;
};

/**
 * Store OTP in cache with TTL
 * @param email - User's email as key
 * @param otp - Plain text OTP (will be hashed before storage)
 * @param ttlSeconds - Time to live in seconds (default: 300 = 5 mins)
 */
export const storeOTP = (
  email: string,
  otp: string,
  ttlSeconds: number = 300
): void => {
  const hashedOtp = hashOTP(otp);
  cache.set(`otp:${email}`, hashedOtp, ttlSeconds);
};

/**
 * Verify OTP from cache
 * @param email - User's email
 * @param inputOtp - User-provided OTP
 * @returns Boolean indicating if OTP is valid
 */
export const verifyCachedOTP = (email: string, inputOtp: string): boolean => {
  const storedHash = cache.get<string>(`otp:${email}`);

  if (!storedHash) {
    return false; // OTP expired or doesn't exist
  }

  const isValid = verifyOTPHash(inputOtp, storedHash);

  if (isValid) {
    // Delete OTP after successful verification (one-time use)
    cache.del(`otp:${email}`);
  }

  return isValid;
};

/**
 * Delete OTP from cache
 * @param email - User's email
 */
export const deleteOTP = (email: string): void => {
  cache.del(`otp:${email}`);
};

/**
 * Store temporary registration data
 * @param email - User's email as key
 * @param data - User data object
 * @param ttlSeconds - Time to live (default 600 = 10 mins)
 */
export const storeTempUser = (
  email: string,
  data: any,
  ttlSeconds: number = 600
): void => {
  cache.set(`tempOr:${email}`, data, ttlSeconds);
};

/**
 * Get temporary registration data
 * @param email - User's email
 * @returns User data or undefined
 */
export const getTempUser = (email: string): any => {
  return cache.get(`tempOr:${email}`);
};

/**
 * Send OTP via Email
 * @param email - Recipient email
 * @param otp - OTP code
 * @param type - "signup" or "reset"
 */
export const sendOTPEmail = async (
  email: string,
  otp: string,
  type: "signup" | "reset" = "signup"
): Promise<void> => {
  try {
    let subject = "";
    let htmlContent = "";

    if (type === "signup") {
      subject = "Welcome! Verify your email";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4CAF50; text-align: center;">Welcome to Mobile Chat App!</h2>
          <p style="color: #666; font-size: 16px;">Hi there,</p>
          <p style="color: #666; font-size: 16px;">Thank you for signing up. To complete your registration and verify your email address, please use the code below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="background-color: #4CAF50; color: white; padding: 15px 30px; font-size: 24px; font-weight: bold; border-radius: 5px; letter-spacing: 5px;">${otp}</span>
          </div>
          <p style="color: #666; font-size: 16px;">This code is valid for <strong>10 minutes</strong>.</p>
          <p style="color: #999; font-size: 14px; margin-top: 30px; text-align: center;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `;
    } else {
      subject = "Password Reset Request";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #FF5722; text-align: center;">Reset Your Password</h2>
          <p style="color: #666; font-size: 16px;">Hello,</p>
          <p style="color: #666; font-size: 16px;">We received a request to reset your password. Please use the verification code below to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="background-color: #FF5722; color: white; padding: 15px 30px; font-size: 24px; font-weight: bold; border-radius: 5px; letter-spacing: 5px;">${otp}</span>
          </div>
          <p style="color: #666; font-size: 16px;">This code is valid for <strong>10 minutes</strong>.</p>
          <p style="color: #999; font-size: 14px; margin-top: 30px; text-align: center;">If you didn't request a password reset, please ignore this email immediately.</p>
        </div>
      `;
    }

    const info = await transporter.sendMail({
      from: `"Mobile Chat App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent,
    });

    console.log("Message sent (%s): %s", type, info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    // Log error but don't crash standard flow (or rethrow if critical)
  }
};
