import { body, param, query } from "express-validator";

import {
  ALL_CATEGORIES,
  MAX_PAGE_SIZE,
  MAX_TRANSACTION_AMOUNT,
  PAYMENT_METHODS,
  RECURRING_INTERVALS,
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
} from "./transaction.constants.js";

const commonValidators = [
  body("accountId").optional().isMongoId().withMessage("Invalid account id"),

  body("type")
    .optional()
    .isIn(TRANSACTION_TYPES)
    .withMessage("Invalid transaction type"),

  body("amount")
    .optional()
    .isFloat({ min: 0.01, max: MAX_TRANSACTION_AMOUNT })
    .withMessage(`Amount must be between 0.01 and ${MAX_TRANSACTION_AMOUNT}`)
    .toFloat(),

  body("category")
    .optional()
    .isIn(ALL_CATEGORIES)
    .withMessage("Invalid category"),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("Invalid transaction date")
    .toDate(),

  body("description").optional().trim().isLength({ max: 200 }),

  body("merchantName").optional().trim().isLength({ max: 100 }),

  body("paymentMethod")
    .optional()
    .isIn(PAYMENT_METHODS)
    .withMessage("Invalid payment method"),

  body("status")
    .optional()
    .isIn(TRANSACTION_STATUSES)
    .withMessage("Invalid transaction status"),

  body("isRecurring")
    .optional()
    .isBoolean()
    .withMessage("isRecurring must be boolean")
    .toBoolean(),

  body("recurringInterval")
    .optional()
    .isIn(RECURRING_INTERVALS)
    .withMessage("Invalid recurring interval"),
];

const createTransactionValidator = () => [
  body("accountId").notEmpty().withMessage("Account id is required"),
  body("type").notEmpty().withMessage("Transaction type is required"),
  body("amount").notEmpty().withMessage("Amount is required"),
  body("category").notEmpty().withMessage("Category is required"),
  body("date").notEmpty().withMessage("Date is required"),
  ...commonValidators,
];

const updateTransactionValidator = () => commonValidators;

const transactionIdValidator = () => [
  param("transactionId").isMongoId().withMessage("Invalid transaction id"),
];

const getTransactionsValidator = () => [
  query("accountId").optional().isMongoId().withMessage("Invalid account id"),
  query("type").optional().isIn(TRANSACTION_TYPES),
  query("category").optional().isIn(ALL_CATEGORIES),
  query("status").optional().isIn(TRANSACTION_STATUSES),
  query("from").optional().isISO8601().withMessage("Invalid from date"),
  query("to").optional().isISO8601().withMessage("Invalid to date"),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: MAX_PAGE_SIZE }).toInt(),
];

const bulkDeleteValidator = () => [
  body("transactionIds")
    .isArray({ min: 1, max: 100 })
    .withMessage("transactionIds must be a non-empty array"),

  body("transactionIds.*")
    .isMongoId()
    .withMessage("Every transaction id must be valid"),
];

export {
  createTransactionValidator,
  updateTransactionValidator,
  transactionIdValidator,
  getTransactionsValidator,
  bulkDeleteValidator,
};