import { redisConnection } from "../db/redis.js";
import { logger } from "./logger.js";

const buildCacheKey = (parts = []) => {
  return parts
    .filter((part) => part !== undefined && part !== null && part !== "")
    .map((part) => String(part))
    .join(":");
};

const getCache = async (key) => {
  try {
    const cached = await redisConnection.get(key);

    if (!cached) return null;

    return JSON.parse(cached);
  } catch (error) {
    logger.error({ err: error, key }, "Cache read failed");
    return null;
  }
};

const setCache = async (key, value, ttlSeconds) => {
  try {
    await redisConnection.set(
      key,
      JSON.stringify(value),
      "EX",
      ttlSeconds
    );
  } catch (error) {
    logger.error({ err: error, key }, "Cache write failed");
  }
};

// cache keys or keeping per-user cache key sets to avoid broad pattern scans.

const deleteCacheByPattern = async (pattern) => {
  try {
    let cursor = "0";

    do {
      const [nextCursor, keys] = await redisConnection.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100
      );

      cursor = nextCursor;

      if (keys.length > 0) {
        await redisConnection.del(...keys);
      }
    } while (cursor !== "0");
  } catch (error) {
    logger.error({ err: error, pattern }, "Cache invalidation failed");
  }
};

const deleteUserAnalyticsCache = async (userId) => {
  await deleteCacheByPattern(`analytics:dashboard:${userId}:*`);
};

export {
  buildCacheKey,
  getCache,
  setCache,
  deleteCacheByPattern,
  deleteUserAnalyticsCache,
};