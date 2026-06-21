import { Transaction } from "./transaction.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const sanitizeTransactionBody = (allowedFields = []) => {
  return (req, res, next) => {
    const sanitizedBody = {};
    const body = req.body || {};

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        sanitizedBody[field] = body[field];
      }
    });

    req.body = sanitizedBody;
    next();
  };
};

const resolveTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findOne({
    _id: req.params.transactionId,
    userId: req.user._id,
  });

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  req.transaction = transaction;
  next();
});

export { sanitizeTransactionBody, resolveTransaction };