import mongoose from "mongoose";

import { Account } from "../account/account.model.js";
import { Transaction } from "./transaction.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { withTransaction } from "../../utils/withTransaction.js";
import { DEFAULT_PAGE_SIZE } from "./transaction.constants.js";
import { MAX_ACCOUNT_BALANCE } from "../account/account.constants.js";

import { RECURRING_STATUS } from "./transaction.constants.js";

import { deleteUserAnalyticsCache } from "../../utils/cache.js";

const getBalanceEffect = (transaction) => {
  if (transaction.status !== "COMPLETED") return 0;

  return transaction.type === "INCOME"
    ? transaction.amount
    : -transaction.amount;
};

const calculateNextRecurringDate = (date, interval) => {
  if (!interval) return undefined;

  const nextDate = new Date(date);

  if (interval === "DAILY") nextDate.setDate(nextDate.getDate() + 1);
  if (interval === "WEEKLY") nextDate.setDate(nextDate.getDate() + 7);
  if (interval === "MONTHLY") nextDate.setMonth(nextDate.getMonth() + 1);
  if (interval === "YEARLY") nextDate.setFullYear(nextDate.getFullYear() + 1);

  return nextDate;
};

const getEndDateExclusive = (to) => {
  const endDate = new Date(to);

  endDate.setUTCDate(endDate.getUTCDate() + 1);
  endDate.setUTCHours(0, 0, 0, 0);

  return endDate;
};

const ensureValidBalance = (account, balanceEffect) => {
  const resultingBalance = account.balance + balanceEffect;

  if (resultingBalance < 0) {
    throw new ApiError(400, "Insufficient account balance");
  }

  if (resultingBalance > MAX_ACCOUNT_BALANCE) {
    throw new ApiError(
      400,
      `Account balance cannot exceed ${MAX_ACCOUNT_BALANCE}`,
    );
  }

  return resultingBalance;
};

const createTransactionWithSession = async ({ userId, payload, session }) => {
  const account = await Account.findOne({
    _id: payload.accountId,
    userId,
  }).session(session);

  if (!account) {
    throw new ApiError(404, "Account not found");
  }

  if (payload.isRecurring && !payload.recurringInterval) {
    throw new ApiError(400, "Recurring interval is required");
  }

  const transactionData = {
    ...payload,
    userId,
    recurringInterval: payload.isRecurring
      ? payload.recurringInterval
      : undefined,
    nextRecurringDate: payload.isRecurring
      ? calculateNextRecurringDate(payload.date, payload.recurringInterval)
      : undefined,
    recurringStatus: payload.isRecurring ? RECURRING_STATUS.ACTIVE : undefined,
  };

  const [transaction] = await Transaction.create([transactionData], {
    session,
  });

  const balanceEffect = getBalanceEffect(transaction);

  if (balanceEffect !== 0) {
    account.balance = ensureValidBalance(account, balanceEffect);
    await account.save({ session });
  }

  return transaction;
};

const createTransactionService = async ({ userId, payload }) => {
  const transaction = await withTransaction(async (session) => {
    return await createTransactionWithSession({
      userId,
      payload,
      session,
    });
  }, "createTransaction failed");

  await deleteUserAnalyticsCache(userId);

  return transaction;
};

const getTransactionsService = async ({ userId, query }) => {
  const {
    accountId,
    type,
    category,
    status,
    from,
    to,
    search,
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
  } = query;

  const filter = {
    userId,
  };

  if (accountId) {
    filter.accountId = new mongoose.Types.ObjectId(accountId);
  }

  if (type) filter.type = type;
  if (category) filter.category = category;
  if (status) filter.status = status;

  if (from || to) {
    filter.date = {};

    if (from) {
      filter.date.$gte = new Date(from);
    }

    if (to) {
      filter.date.$lt = getEndDateExclusive(to);
    }
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const pageNumber = Number(page) || 1;
  const pageLimit = Number(limit) || DEFAULT_PAGE_SIZE;
  const skip = (pageNumber - 1) * pageLimit;

  const [transactions, total, totalsResult] = await Promise.all([
    Transaction.find(filter)
      .populate("accountId", "name type color")
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean(),

    Transaction.countDocuments(filter),

    Transaction.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$type", "INCOME"] },
                    { $eq: ["$status", "COMPLETED"] },
                  ],
                },
                "$amount",
                0,
              ],
            },
          },
          totalExpenses: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$type", "EXPENSE"] },
                    { $eq: ["$status", "COMPLETED"] },
                  ],
                },
                "$amount",
                0,
              ],
            },
          },
          transactionCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalIncome: 1,
          totalExpenses: 1,
          netMovement: {
            $subtract: ["$totalIncome", "$totalExpenses"],
          },
          transactionCount: 1,
        },
      },
    ]),
  ]);

  const totals = totalsResult[0] || {
    totalIncome: 0,
    totalExpenses: 0,
    netMovement: 0,
    transactionCount: 0,
  };

  return {
    transactions,
    pagination: {
      total,
      page: pageNumber,
      limit: pageLimit,
      totalPages: Math.ceil(total / pageLimit),
    },
    totals,
  };
};

const updateTransactionService = async ({ userId, transaction, payload }) => {
  const updatedTransaction = await withTransaction(async (session) => {
    const oldAccount = await Account.findOne({
      _id: transaction.accountId,
      userId,
    }).session(session);

    if (!oldAccount) {
      throw new ApiError(404, "Original account not found");
    }

    const newAccountId = payload.accountId || transaction.accountId;

    const newAccount =
      String(newAccountId) === String(transaction.accountId)
        ? oldAccount
        : await Account.findOne({
            _id: newAccountId,
            userId,
          }).session(session);

    if (!newAccount) {
      throw new ApiError(404, "New account not found");
    }

    const oldEffect = getBalanceEffect(transaction);

    const updatedData = {
      ...transaction.toObject(),
      ...payload,
    };

    const newEffect = getBalanceEffect(updatedData);

    if (String(oldAccount._id) === String(newAccount._id)) {
      const netEffect = newEffect - oldEffect;

      oldAccount.balance = ensureValidBalance(oldAccount, netEffect);
      await oldAccount.save({ session });
    } else {
      oldAccount.balance = ensureValidBalance(oldAccount, -oldEffect);
      newAccount.balance = ensureValidBalance(newAccount, newEffect);

      await oldAccount.save({ session });
      await newAccount.save({ session });
    }

    Object.entries(payload).forEach(([field, value]) => {
      transaction[field] = value;
    });

    if (transaction.isRecurring && transaction.recurringInterval) {
      transaction.recurringStatus =
        transaction.recurringStatus || RECURRING_STATUS.ACTIVE;

      transaction.nextRecurringDate = calculateNextRecurringDate(
        transaction.date,
        transaction.recurringInterval,
      );
    } else {
      transaction.recurringInterval = undefined;
      transaction.nextRecurringDate = undefined;

      transaction.recurringStatus = undefined;
      transaction.lastProcessedAt = undefined;
    }

    if (transaction.isRecurring && !transaction.recurringInterval) {
      throw new ApiError(400, "Recurring interval is required");
    }

    await transaction.save({ session });

    return transaction;
  }, "updateTransaction failed");

  await deleteUserAnalyticsCache(userId);

  return updatedTransaction;
};

const deleteTransactionService = async ({ userId, transaction }) => {
  const result = await withTransaction(async (session) => {
    const account = await Account.findOne({
      _id: transaction.accountId,
      userId,
    }).session(session);

    if (!account) {
      throw new ApiError(404, "Account not found");
    }

    const reverseEffect = -getBalanceEffect(transaction);

    if (reverseEffect !== 0) {
      account.balance = ensureValidBalance(account, reverseEffect);
      await account.save({ session });
    }

    await Transaction.deleteOne(
      {
        _id: transaction._id,
        userId,
      },
      { session },
    );
  }, "deleteTransaction failed");

  await deleteUserAnalyticsCache(userId);

  return result;
};

const bulkDeleteTransactionsService = async ({ userId, transactionIds }) => {
  const deleteCount = await withTransaction(async (session) => {
    const transactions = await Transaction.find({
      _id: { $in: transactionIds },
      userId,
    }).session(session);

    if (transactions.length !== transactionIds.length) {
      throw new ApiError(404, "One or more transactions were not found");
    }

    const effectsByAccount = {};

    transactions.forEach((transaction) => {
      const accountId = String(transaction.accountId);

      effectsByAccount[accountId] =
        (effectsByAccount[accountId] || 0) - getBalanceEffect(transaction);
    });

    for (const [accountId, balanceEffect] of Object.entries(effectsByAccount)) {
      const account = await Account.findOne({
        _id: accountId,
        userId,
      }).session(session);

      if (!account) {
        throw new ApiError(404, "Account not found");
      }

      account.balance = ensureValidBalance(account, balanceEffect);
      await account.save({ session });
    }

    await Transaction.deleteMany(
      {
        _id: { $in: transactionIds },
        userId,
      },
      { session },
    );

    return transactions.length;
  }, "bulkDeleteTransactions failed");

  await deleteUserAnalyticsCache(userId);

  return deleteCount;
};

export {
  getBalanceEffect,
  createTransactionService,
  createTransactionWithSession,
  getTransactionsService,
  updateTransactionService,
  deleteTransactionService,
  bulkDeleteTransactionsService,
};
