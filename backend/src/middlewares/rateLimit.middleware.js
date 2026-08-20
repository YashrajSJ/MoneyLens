import { redisConnection } from "../db/redis.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

import { RATE_LIMITS } from "../modules/security/security.constants.js";

const getClientIp = (req) => {
  return req.ip || req.socket?.remoteAddress || "unknown";
};

const redisRateLimiter = ({
  keyPrefix,
  windowSeconds,
  maxRequests,
  identity,
  failClosed = false,
}) => {
  return async (req, res, next) => {
    try {
      const identifier = identity ? identity(req) : getClientIp(req);
      const key = `rate-limit:${keyPrefix}:${identifier}`;

      const pipeline = redisConnection.pipeline();
      pipeline.incr(key);
      pipeline.ttl(key);
      const results = await pipeline.exec();

      const current = results[0][1];
      let ttl = results[1][1];

      if (ttl === -1) {
        // Key has no TTL yet, so start the fixed window.
        await redisConnection.expire(key, windowSeconds);
        ttl = windowSeconds;
      }

      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader(
        "X-RateLimit-Remaining",
        Math.max(maxRequests - current, 0),
      );
      res.setHeader("X-RateLimit-Reset", ttl);

      if (current > maxRequests) {
        res.setHeader("Retry-After", ttl);
        throw new ApiError(429, "Too many requests. Please try again later.");
      }

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        return next(error);
      }

      logger.error({ err: error, keyPrefix }, "Rate limiter failed");

      if (failClosed) {
        return next(new ApiError(503, "Rate limiter unavailable"));
      }

      next();
    }
  };
};

const globalRateLimiter = redisRateLimiter({
  keyPrefix: "global",
  windowSeconds: 60,
    maxRequests: 120,
});

const authRateLimiter = redisRateLimiter({
  keyPrefix: "auth",
  ...RATE_LIMITS.AUTH,
});

const aiRateLimiter = redisRateLimiter({
  keyPrefix: "ai",
  ...RATE_LIMITS.AI,
  identity: (req) => req.user?._id || getClientIp(req),
});

const emailRateLimiter = redisRateLimiter({
  keyPrefix: "email",
  ...RATE_LIMITS.EMAIL,
  identity: (req) => req.user?._id || getClientIp(req),
});

const jobsRateLimiter = redisRateLimiter({
  keyPrefix: "jobs",
  ...RATE_LIMITS.JOBS,
  identity: (req) => req.user?._id || getClientIp(req),
});

export {
  redisRateLimiter,
  globalRateLimiter,
  authRateLimiter,
  aiRateLimiter,
  emailRateLimiter,
  jobsRateLimiter,
};
