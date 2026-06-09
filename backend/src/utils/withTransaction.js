import mongoose from "mongoose";
import { logger } from "./logger.js";

export const withTransaction = async (operation, errorMessage = "Transaction failed") => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const result = await operation(session);

    await session.commitTransaction();

    return result;
  } catch (error) {
    await session.abortTransaction();

   logger.error({ err: error }, errorMessage);

    throw error;
  } finally {
    session.endSession();
  }
};