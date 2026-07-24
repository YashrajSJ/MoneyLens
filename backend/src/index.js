import "./config/loadEnv.js";
import { validateEnv } from "./utils/validateEnv.js";
import { logger } from "./utils/logger.js";

import { closeRedisConnection } from "./db/redis.js";
import { closeJobQueues } from "./modules/jobs/job.queue.js";
import { startJobWorkers, stopJobWorkers } from "./modules/jobs/job.worker.js";

dotenv.config({
  path: "./.env",
});

validateEnv();

import app from "./app.js";
import connectDB from "./db/database.js";

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {

    if (process.env.ENABLE_WORKERS === "true") {
      startJobWorkers();
    }

    app.listen(PORT, () => {
      logger.info({ port: PORT }, "Server is running");
    });
  })
  .catch((error) => {
    logger.error({ err: error }, "MongoDB connection failed");
    process.exit(1);
  });


const shutdown = async (signal) => {
  logger.info({ signal }, "Shutting down server");

  try {
    await stopJobWorkers();
    await closeJobQueues();
    await closeRedisConnection();

    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, "Graceful shutdown failed");
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));