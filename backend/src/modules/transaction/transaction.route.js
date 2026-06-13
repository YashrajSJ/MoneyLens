import { Router } from "express";

import {
  bulkDeleteTransactions,
  createTransaction,
  deleteTransaction,
  getTransactionById,
  getTransactions,
  updateTransaction,
} from "./transaction.controller.js";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validator.middleware.js";

import {
  resolveTransaction,
  sanitizeTransactionBody,
} from "./transaction.middleware.js";

import {
  bulkDeleteValidator,
  createTransactionValidator,
  getTransactionsValidator,
  transactionIdValidator,
  updateTransactionValidator,
} from "./transaction.validator.js";

import {transactionAllowedFields} from "./transaction.constants.js";

const router = Router();


router.use(verifyJWT);

router
  .route("/")
  .post(
    sanitizeTransactionBody(transactionAllowedFields),
    createTransactionValidator(),
    validate,
    createTransaction
  )
  .get(getTransactionsValidator(), validate, getTransactions);

router
  .route("/bulk-delete")
  .post(bulkDeleteValidator(), validate, bulkDeleteTransactions);

router
  .route("/:transactionId")
  .get(transactionIdValidator(), validate, resolveTransaction, getTransactionById)
  .patch(
    transactionIdValidator(),
    sanitizeTransactionBody(transactionAllowedFields),
    updateTransactionValidator(),
    validate,
    resolveTransaction,
    updateTransaction
  )
  .delete(transactionIdValidator(), validate, resolveTransaction, deleteTransaction);

export default router;