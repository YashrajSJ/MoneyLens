import { param, query } from "express-validator";

import { RECURRING_STATUSES } from "../transaction/transaction.constants.js";

import {
  MAX_RECURRING_PROCESS_LIMIT,
  MAX_RECURRING_LIST_LIMIT
} from "./recurring.constants.js";

const transactionIdValidator = () => [
  param("transactionId")
    .isMongoId()
    .withMessage("Invalid transaction id"),
];

const getRecurringTransactionsValidator = () => [
  query("status")
    .optional()
    .isIn(RECURRING_STATUSES)
    .withMessage("Invalid recurring status"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be at least 1")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: MAX_RECURRING_LIST_LIMIT })
    .withMessage(`Limit must be between 1 and ${MAX_RECURRING_LIST_LIMIT}`)
    .toInt(),
];

const dueRecurringTransactionsValidator = () => [
  query("asOf")
    .optional()
    .isISO8601()
    .withMessage("Invalid asOf date")
    .toDate(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: MAX_RECURRING_PROCESS_LIMIT })
    .withMessage(`Limit must be between 1 and ${MAX_RECURRING_PROCESS_LIMIT}`)
    .toInt(),
];

const processRecurringTransactionValidator = () => [
  ...transactionIdValidator(),

  query("asOf")
    .optional()
    .isISO8601()
    .withMessage("Invalid asOf date")
    .toDate(),
];

export {
  transactionIdValidator,
  getRecurringTransactionsValidator,
  dueRecurringTransactionsValidator,
  processRecurringTransactionValidator,
};