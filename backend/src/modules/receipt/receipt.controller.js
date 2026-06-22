import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { logger } from "../../utils/logger.js";

import {
  deleteReceiptService,
  getReceiptByIdService,
  getReceiptsService,
  scanReceiptService,
  prepareTransactionFromReceiptService,
} from "./receipt.service.js";

const scanReceipt = asyncHandler(async (req, res) => {
  const receipt = await scanReceiptService({
    userId: req.user._id,
    file: req.file,
  });

  const message =
  receipt.status === "FAILED"
    ? "Receipt uploaded, but parsing failed"
    : "Receipt scanned successfully";

return res
  .status(201)
  .json(new ApiResponse(201, { receipt }, message));
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

export { scanReceipt, getReceipts, getReceiptById, deleteReceipt, prepareTransactionFromReceipt };