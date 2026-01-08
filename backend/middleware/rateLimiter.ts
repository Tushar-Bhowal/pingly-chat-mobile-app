import { Request, Response, NextFunction } from "express";
import cache from "../utils/cache";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string; // Custom error message
}

/**
 * Create a rate limiter middleware with custom configuration
 * @param config - Rate limit configuration
 */
export const createRateLimiter = (config: RateLimitConfig) => {
  const { windowMs, maxRequests, message } = config;

  return (req: Request, res: Response, next: NextFunction): void => {
    // Get client IP (consider X-Forwarded-For for proxies)
    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
      req.ip ||
      "unknown";

    // Create a unique key for this route + IP combination
    const key = `ratelimit:${req.path}:${clientIp}`;

    // Get current request count
    const currentCount = cache.get<number>(key) || 0;

    if (currentCount >= maxRequests) {
      res.status(429).json({
        message: message || "Too many requests. Please try again later.",
        retryAfter: Math.ceil(windowMs / 1000),
      });
      return;
    }

    // Increment count
    if (currentCount === 0) {
      // First request in this window
      cache.set(key, 1, Math.ceil(windowMs / 1000));
    } else {
      // Increment without resetting TTL
      cache.set(key, currentCount + 1, cache.getTtl(key) as number);
    }

    next();
  };
};

// Pre-configured rate limiters

/**
 * Login rate limiter: 5 attempts per minute
 */
export const loginRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  message: "Too many login attempts. Please try again after 1 minute.",
});

/**
 * OTP rate limiter: 30 requests per 15 minutes
 */
export const otpRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 30,
  message: "Too many OTP requests. Please try again after 15 minutes.",
});

/**
 * General API rate limiter: 100 requests per minute
 */
export const generalRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: "Rate limit exceeded. Please slow down.",
});
