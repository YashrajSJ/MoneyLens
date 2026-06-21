import { randomUUID } from "node:crypto";

import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { logger } from "../../utils/logger.js";

import {
  getDueRecurringTransactionsService,
  getRecurringTransactionsService,
  pauseRecurringTransactionService,
  processDueRecurringTransactionsService,
  processRecurringTransactionService,
  resumeRecurringTransactionService,
} from "./recurring.service.js";

const getRecurringTransactions = asyncHandler(async (req, res) => {
  
  const result = await getRecurringTransactionsService({
  userId: req.user._id,
  query: req.query,
});

return res.status(200).json(
  new ApiResponse(
    200,
    result,
    "Recurring transactions fetched successfully"
  )
);

});

const getDueRecurringTransactions = asyncHandler(async (req, res) => {
  const transactions = await getDueRecurringTransactionsService({
    userId: req.user._id,
    query: req.query,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { transactions },
      "Due recurring transactions fetched successfully"
    )
  );
});

const processRecurringTransaction = asyncHandler(async (req, res) => {
  const jobId = randomUUID();

  const result = await processRecurringTransactionService({
    userId: req.user._id,
    transactionId: req.params.transactionId,
    asOf: req.query.asOf ? new Date(req.query.asOf) : new Date(),
    jobId,
  });

  logger.info(
    {
      jobId,
      userId: req.user._id,
      recurringTransactionId: req.params.transactionId,
      generatedTransactionId: result.generatedTransaction._id,
    },
    "Single recurring transaction processed"
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Recurring transaction processed successfully"
    )
  );
});

const processDueRecurringTransactions = asyncHandler(async (req, res) => {
  const jobId = randomUUID();

  const result = await processDueRecurringTransactionsService({
    userId: req.user._id,
    query: req.query,
    jobId,
  });

  logger.info(
    {
      jobId,
      userId: req.user._id,
      processedCount: result.processedCount,
      failedCount: result.failedCount,
    },
    "Due recurring transactions processed"
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Due recurring transactions processed successfully"
    )
  );
});

const pauseRecurringTransaction = asyncHandler(async (req, res) => {
  const transaction = await pauseRecurringTransactionService({
    userId: req.user._id,
    transactionId: req.params.transactionId,
  });

  logger.info(
    {
      userId: req.user._id,
      recurringTransactionId: transaction._id,
    },
    "Recurring transaction paused"
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      { transaction },
      "Recurring transaction paused successfully"
    )
  );
});

const resumeRecurringTransaction = asyncHandler(async (req, res) => {
  const transaction = await resumeRecurringTransactionService({
    userId: req.user._id,
    transactionId: req.params.transactionId,
  });

  logger.info(
    {
      userId: req.user._id,
      recurringTransactionId: transaction._id,
    },
    "Recurring transaction resumed"
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      { transaction },
      "Recurring transaction resumed successfully"
    )
  );
});

export {
  getRecurringTransactions,
  getDueRecurringTransactions,
  processRecurringTransaction,
  processDueRecurringTransactions,
  pauseRecurringTransaction,
  resumeRecurringTransaction,
};