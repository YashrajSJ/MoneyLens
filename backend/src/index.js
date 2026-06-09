import dotenv from "dotenv";
import { validateEnv } from "./utils/validateEnv.js";
import { logger } from "./utils/logger.js";

dotenv.config({
  path: "./.env",
});

validateEnv();


import app from "./app.js";
import connectDB from "./db/database.js";

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info({ port: PORT }, "Server is running");
    });
  })
  .catch((error) => {
    logger.error({ err: error }, "MongoDB connection failed");
    process.exit(1);
  });