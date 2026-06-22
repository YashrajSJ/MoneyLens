import mongoose from "mongoose";
import multer from "multer";

import { Receipt } from "./receipt.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  ALLOWED_RECEIPT_MIME_TYPES,
  MAX_RECEIPT_FILE_SIZE,
} from "./receipt.constants.js";

const storage = multer.memoryStorage();

const multerUpload = multer({
  storage,
  limits: {
    fileSize: MAX_RECEIPT_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_RECEIPT_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        new ApiError(
          400,
          "Only JPEG, PNG, and WEBP receipt images are allowed"
        )
      );
    }

    cb(null, true);
  },
}).single("receipt");

const uploadReceipt = (req, res, next) => {
  multerUpload(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      return next(new ApiError(400, error.message));
    }

    if (error) {
      return next(error);
    }

    next();
  });
};

const resolveReceipt = asyncHandler(async (req, res, next) => {
  const { receiptId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(receiptId)) {
    throw new ApiError(400, "Invalid receipt id");
  }

  const receipt = await Receipt.findOne({
    _id: receiptId,
    userId: req.user._id,
  }).lean();

  if (!receipt) {
    throw new ApiError(404, "Receipt not found");
  }

  req.receipt = receipt;
  next();
});

export { uploadReceipt, resolveReceipt };