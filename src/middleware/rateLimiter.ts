import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response } from 'express';

// Extend Express Request type to include rateLimit property
interface RateLimitRequest extends Request {
  rateLimit?: {
    limit: number;
    current: number;
    remaining: number;
    resetTime?: Date;
  };
}

// Strict rate limiter for authentication endpoints (signup, login)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count successful requests
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

// Moderate rate limiter for alias checking
export const aliasCheckRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 requests per minute
  message: {
    error: 'Too many alias check requests, please slow down.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many alias check requests, please slow down.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

// General API rate limiter (more lenient)
export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

// Very strict rate limiter for password reset to prevent abuse
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: {
    error: 'Too many password reset attempts, please try again after 1 hour.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many password reset attempts, please try again after 1 hour.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

// Trading rate limiter to prevent spam trading
export const tradingRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each user to 30 trades per minute
  message: {
    error: 'You are trading too fast. Please slow down.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'You are trading too fast. Please slow down.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

