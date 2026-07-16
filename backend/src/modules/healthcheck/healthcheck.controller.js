import mongoose from "mongoose";

import { redisConnection } from "../../db/redis.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  const mongoReady = mongoose.connection.readyState === 1;
  const redisReady = redisConnection.status === "ready";

  const isHealthy = mongoReady && redisReady;
  const statusCode = isHealthy ? 200 : 503;

  return res.status(statusCode).json(
    new ApiResponse(
      statusCode,
      {
        service: "MoneyLens API",
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        dependencies: {
          mongodb: mongoReady ? "ready" : "unavailable",
          redis: redisReady
            ? "ready"
            : redisConnection.status || "unavailable",
        },
      },
      isHealthy
        ? "MoneyLens API is healthy"
        : "MoneyLens API is not ready",
    ),
  );
});

export { healthcheck };