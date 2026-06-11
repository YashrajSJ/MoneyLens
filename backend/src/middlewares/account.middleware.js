import mongoose from "mongoose";

import { Account } from "../modules/account/account.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Transaction } from "../modules/transaction/transaction.model.js";

const sanitizeBody = (allowedFields = []) => {
  return (req, res, next) => {
    const sanitizedBody = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        sanitizedBody[field] = req.body[field];
      }
    });

    req.body = sanitizedBody;
    next();
  };
};

const resolveAccount = asyncHandler(async (req, res, next) => {
  const { accountId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    throw new ApiError(400, "Invalid account id");
  }

  const [account, accountCount] = await Promise.all([
    Account.findOne({
      _id: accountId,
      userId: req.user._id,
    }),
    Account.countDocuments({
      userId: req.user._id,
    }),
  ]);

  if (!account) {
    throw new ApiError(404, "Account not found");
  }

  req.account = account;
  req.accountCount = accountCount;

  next();
});

const preventDefaultDeletion = (req, res, next) => {
  if (req.accountCount <= 1) {
    throw new ApiError(400, "You must keep at least one account");
  }

  next();
};

const preventAccountDeletionWithTransactions = asyncHandler(
  async (req, res, next) => {
    const transactionExists = await Transaction.exists({
      accountId: req.account._id,
      userId: req.user._id,
    });

    if (transactionExists) {
      throw new ApiError(
        409,
        "Cannot delete an account containing transactions"
      );
    }

    next();
  }
);


export { sanitizeBody, resolveAccount, preventDefaultDeletion,preventAccountDeletionWithTransactions };