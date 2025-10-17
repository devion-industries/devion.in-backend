import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { redisService } from '../services/redis.service';
import { createError } from './errorHandler';
import logger from '../utils/logger';

interface RateLimitConfig {
  windowSeconds: number; // Time window in seconds
  maxRequests: number;   // Maximum requests per window
  keyPrefix: string;     // Prefix for Redis key
  message?: string;      // Custom error message
}

/**
 * Redis-based rate limiter middleware
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // If Redis is not connected, allow request (fail open)
    if (!redisService.isReady()) {
      logger.warn('Rate limiter: Redis not available, allowing request');
      return next();
    }

    try {
      const userId = req.user?.id || req.ip || 'anonymous';
      const key = `${config.keyPrefix}:${userId}`;

      // Increment request count
      const count = await redisService.incr(key);

      // Set expiry on first request
      if (count === 1) {
        await redisService.expire(key, config.windowSeconds);
      }

      // Get remaining TTL
      const ttl = await redisService.ttl(key);

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - count));
      res.setHeader('X-RateLimit-Reset', Date.now() + ttl * 1000);

      // Check if limit exceeded
      if (count > config.maxRequests) {
        const resetTime = Math.ceil(ttl / 60);
        logger.warn(`Rate limit exceeded for user ${userId} on ${config.keyPrefix}`);
        
        throw createError(
          config.message || `Too many requests. Please try again in ${resetTime} minute(s).`,
          429
        );
      }

      next();
    } catch (error: any) {
      // If error is already a rate limit error, pass it through
      if (error.statusCode === 429) {
        next(error);
      } else {
        // For other errors, log and allow request (fail open)
        logger.error('Rate limiter error:', error);
        next();
      }
    }
  };
}

/**
 * Pre-configured rate limiters
 */

// AI Endpoints: 10 requests per hour per user
export const aiRateLimiter = createRateLimiter({
  windowSeconds: 3600, // 1 hour
  maxRequests: 10,
  keyPrefix: 'ratelimit:ai',
  message: 'You have reached your AI question limit. Please try again in an hour.',
});

// Portfolio Insights: 20 requests per hour
export const insightsRateLimiter = createRateLimiter({
  windowSeconds: 3600,
  maxRequests: 20,
  keyPrefix: 'ratelimit:insights',
  message: 'Too many portfolio insight requests. Please try again later.',
});

// Voice AI: 5 requests per 5 minutes
export const voiceRateLimiter = createRateLimiter({
  windowSeconds: 300, // 5 minutes
  maxRequests: 5,
  keyPrefix: 'ratelimit:voice',
  message: 'Voice AI limit reached. Please wait a few minutes.',
});

// General API: 100 requests per 15 minutes
export const generalRateLimiter = createRateLimiter({
  windowSeconds: 900, // 15 minutes
  maxRequests: 100,
  keyPrefix: 'ratelimit:general',
  message: 'Too many requests. Please slow down.',
});


