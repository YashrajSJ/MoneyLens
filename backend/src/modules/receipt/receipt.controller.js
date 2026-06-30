import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { logger } from "../../utils/logger.js";

import {
  deleteReceiptService,
  getReceiptByIdService,
  getReceiptsService,
  scanReceiptService,
  prepareTransactionFromReceiptService,
  retryReceiptParsingService
} from "./receipt.service.js";

const scanReceipt = asyncHandler(async (req, res) => {
  const result = await scanReceiptService({
    userId: req.user._id,
    file: req.file,
  });

  return res
    .status(202)
    .json(
      new ApiResponse(
        202,
        result,
        "Receipt uploaded and parsing job queued successfully"
      )
    );
});

const getReceipts = asyncHandler(async (req, res) => {
  const result = await getReceiptsService({
    userId: req.user._id,
    query: req.query,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Receipts fetched successfully"));
});

const getReceiptById = asyncHandler(async (req, res) => {
  const receipt = await getReceiptByIdService({
    receipt: req.receipt,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { receipt }, "Receipt fetched successfully"));
});

const retryReceiptParsing = asyncHandler(async (req, res) => {
  const result = await retryReceiptParsingService({
    userId: req.user._id,
    receipt: req.receipt,
  });

  return res
    .status(202)
    .json(new ApiResponse(202, result, "Receipt parsing job queued again"));
});

const deleteReceipt = asyncHandler(async (req, res) => {
  await deleteReceiptService({
    userId: req.user._id,
    receipt: req.receipt,
  });

  logger.info(
    {
      userId: req.user._id,
      receiptId: req.receipt._id,
    },
    "Receipt deleted"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Receipt deleted successfully"));
});

const prepareTransactionFromReceipt = asyncHandler(async (req, res) => {
  const result = await prepareTransactionFromReceiptService({
    userId: req.user._id,
    receipt: req.receipt,
    accountId: req.query.accountId,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Transaction draft prepared successfully"
    )
  );
});

export { scanReceipt, getReceipts, getReceiptById, deleteReceipt, prepareTransactionFromReceipt , retryReceiptParsing};