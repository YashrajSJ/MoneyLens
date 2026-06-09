import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

const connectDB = async (retries = 5) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const connection = await mongoose.connect(process.env.MONGO_URI);

      logger.info(
        { host: connection.connection.host },
        "MongoDB connected successfully"
      );

      return;
    } catch (error) {
      logger.warn(
        {
          attempt,
          retries,
          err: error,
        },
        "MongoDB connection attempt failed"
      );

      if (attempt === retries) {
        logger.error({ err: error }, "MongoDB connection failed permanently");
        process.exit(1);
      }

      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
    }
  }
};

export default connectDB;