import { body, param, query } from "express-validator";

import {
  MAX_RECEIPT_PAGE_SIZE,
  RECEIPT_STATUS_VALUES,
} from "./receipt.constants.js";

import {
  ALL_CATEGORIES,
  MAX_TRANSACTION_AMOUNT,
  PAYMENT_METHODS,
  TRANSACTION_TYPES,
} from "../transaction/transaction.constants.js";

const receiptIdValidator = () => [
  param("receiptId").isMongoId().withMessage("Invalid receipt id"),
];

const getReceiptsValidator = () => [
  query("status")
    .optional()
    .isIn(RECEIPT_STATUS_VALUES)
    .withMessage("Invalid receipt status"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be at least 1")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: MAX_RECEIPT_PAGE_SIZE })
    .withMessage(`Limit must be between 1 and ${MAX_RECEIPT_PAGE_SIZE}`)
    .toInt(),
];

const prepareTransactionValidator = () => [
  param("receiptId").isMongoId().withMessage("Invalid receipt id"),

  query("accountId").optional().isMongoId().withMessage("Invalid account id"),
];

const confirmReceiptTransactionValidator = () => [
  param("receiptId").isMongoId().withMessage("Invalid receipt id"),

  body("accountId")
    .notEmpty()
    .withMessage("Account id is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid account id"),

  body("type")
    .notEmpty()
    .withMessage("Transaction type is required")
    .bail()
    .isIn(TRANSACTION_TYPES)
    .withMessage("Invalid transaction type"),

  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .bail()
    .isFloat({ min: 0.01, max: MAX_TRANSACTION_AMOUNT })
    .withMessage(`Amount must be between 0.01 and ${MAX_TRANSACTION_AMOUNT}`)
    .toFloat(),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .bail()
    .isIn(ALL_CATEGORIES)
    .withMessage("Invalid category"),

  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .bail()
    .isISO8601()
    .withMessage("Invalid transaction date")
    .toDate(),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Description must be at most 200 characters"),

  body("merchantName")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Merchant name must be at most 100 characters"),

  body("paymentMethod")
    .optional()
    .isIn(PAYMENT_METHODS)
    .withMessage("Invalid payment method"),
];

export {
  receiptIdValidator,
  getReceiptsValidator,
  prepareTransactionValidator,
  confirmReceiptTransactionValidator,
};
