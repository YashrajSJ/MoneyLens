import IORedis from "ioredis";

import { logger } from "../utils/logger.js";

const redisConnection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  logger.info("Redis connected");
});

redisConnection.on("error", (err) => {
  logger.error({ err }, "Redis connection error");
});

const closeRedisConnection = async () => {
  await redisConnection.quit();
  logger.info("Redis connection closed");
};

export { redisConnection, closeRedisConnection };