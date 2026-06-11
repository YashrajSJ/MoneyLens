import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { logger } from "../../utils/logger.js";

import {
  bulkDeleteTransactionsService,
  createTransactionService,
  deleteTransactionService,
  getTransactionsService,
  updateTransactionService,
} from "./transaction.service.js";

const createTransaction = asyncHandler(async (req, res) => {
  const transaction = await createTransactionService({
    userId: req.user._id,
    payload: req.body,
  });

  logger.info("Transaction created");

  return res.status(201).json(
    new ApiResponse(
      201,
      { transaction },
      "Transaction created successfully"
    )
  );
});

const getTransactions = asyncHandler(async (req, res) => {
  const result = await getTransactionsService({
    userId: req.user._id,
    query: req.query,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Transactions fetched successfully"));
});

const getTransactionById = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      { transaction: req.transaction },
      "Transaction fetched successfully"
    )
  );
});

const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await updateTransactionService({
    userId: req.user._id,
    transaction: req.transaction,
    payload: req.body,
  });

  logger.info("Transaction updated");

  return res.status(200).json(
    new ApiResponse(
      200,
      { transaction },
      "Transaction updated successfully"
    )
  );
});

const deleteTransaction = asyncHandler(async (req, res) => {
  await deleteTransactionService({
    userId: req.user._id,
    transaction: req.transaction,
  });

  logger.info("Transaction deleted");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Transaction deleted successfully"));
});

const bulkDeleteTransactions = asyncHandler(async (req, res) => {
  const deletedCount = await bulkDeleteTransactionsService({
    userId: req.user._id,
    transactionIds: req.body.transactionIds,
  });

  logger.info("Transactions bulk deleted");

  return res.status(200).json(
    new ApiResponse(
      200,
      { deletedCount },
      "Transactions deleted successfully"
    )
  );
});

export {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  bulkDeleteTransactions,
};