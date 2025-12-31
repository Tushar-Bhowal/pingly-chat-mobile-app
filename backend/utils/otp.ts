import crypto from "crypto";
import cache from "./cache";

/**
 * Generate a 6-digit OTP
 * @returns 6-digit OTP string
 */
export const generateOTP = (): string => {
  // Generate a random 6-digit number between 100000 and 999999
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
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
