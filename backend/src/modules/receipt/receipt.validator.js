import { param, query } from "express-validator";

import {
  MAX_RECEIPT_PAGE_SIZE,
  RECEIPT_STATUS_VALUES,
} from "./receipt.constants.js";

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

  query("accountId")
    .optional()
    .isMongoId()
    .withMessage("Invalid account id"),
];

export { receiptIdValidator, getReceiptsValidator, prepareTransactionValidator };