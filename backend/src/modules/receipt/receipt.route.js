import { Router } from "express";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validator.middleware.js";

import {
  deleteReceipt,
  getReceiptById,
  getReceipts,
  scanReceipt,
  prepareTransactionFromReceipt,
  confirmReceiptTransaction,
  retryReceiptParsing,
} from "./receipt.controller.js";

import { resolveReceipt, uploadReceipt } from "./receipt.middleware.js";

import {
  getReceiptsValidator,
  receiptIdValidator,
  prepareTransactionValidator,
  confirmReceiptTransactionValidator,
} from "./receipt.validator.js";

import { aiRateLimiter } from "../../middlewares/rateLimit.middleware.js";

const router = Router();

router.use(verifyJWT); 

router.route("/scan").post(aiRateLimiter, uploadReceipt, scanReceipt);

router.route("/").get(getReceiptsValidator(), validate, getReceipts);

router
  .route("/:receiptId/retry-parsing")
  .post(aiRateLimiter,receiptIdValidator(),validate,resolveReceipt,retryReceiptParsing );

router
  .route("/:receiptId/prepare-transaction")
  .post(
    prepareTransactionValidator(),
    validate,
    resolveReceipt,
    prepareTransactionFromReceipt,
  );

router
  .route("/:receiptId/confirm-transaction")
  .post(
    confirmReceiptTransactionValidator(),
    validate,
    resolveReceipt,
    confirmReceiptTransaction,
  );


router
  .route("/:receiptId")
  .get(receiptIdValidator(), validate, resolveReceipt, getReceiptById)
  .delete(receiptIdValidator(), validate, resolveReceipt, deleteReceipt);

export default router;
