import { Account } from "../account/account.model.js";
import { Transaction } from "./transaction.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { withTransaction } from "../../utils/withTransaction.js";
import {DEFAULT_PAGE_SIZE} from "./transaction.constants.js";
import { MAX_ACCOUNT_BALANCE } from "../account/account.constants.js";

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

const ensureValidBalance = (account, balanceEffect) => {
  const resultingBalance = account.balance + balanceEffect;

  if (resultingBalance < 0) {
    throw new ApiError(400, "Insufficient account balance");
  }

  if (resultingBalance > MAX_ACCOUNT_BALANCE) {
    throw new ApiError(400, `Account balance cannot exceed ${MAX_ACCOUNT_BALANCE}`);
  }

  return resultingBalance;
};

const createTransactionService = async ({ userId, payload }) => {
  return await withTransaction(
    async (session) => {
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
    },
    "createTransaction failed"
  );
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

  const filter = { userId };

  if (accountId) filter.accountId = accountId;
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (status) filter.status = status;

  if (from || to) {
    filter.date = {};

    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate("accountId", "name type color")
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Transaction.countDocuments(filter),
  ]);

  return {
    transactions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateTransactionService = async ({
  userId,
  transaction,
  payload,
}) => {
  return await withTransaction(
    async (session) => {
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
        transaction.nextRecurringDate = calculateNextRecurringDate(
          transaction.date,
          transaction.recurringInterval
        );
      } else {
        transaction.recurringInterval = undefined;
        transaction.nextRecurringDate = undefined;
      }

      await transaction.save({ session });

      return transaction;
    },
    "updateTransaction failed"
  );
};

const deleteTransactionService = async ({ userId, transaction }) => {
  return await withTransaction(
    async (session) => {
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
        { session }
      );
    },
    "deleteTransaction failed"
  );
};

const bulkDeleteTransactionsService = async ({ userId, transactionIds }) => {
  return await withTransaction(
    async (session) => {
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
          (effectsByAccount[accountId] || 0) -
          getBalanceEffect(transaction);
      });

      for (const [accountId, balanceEffect] of Object.entries(
        effectsByAccount
      )) {
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
        { session }
      );

      return transactions.length;
    },
    "bulkDeleteTransactions failed"
  );
};

export {
  createTransactionService,
  getTransactionsService,
  updateTransactionService,
  deleteTransactionService,
  bulkDeleteTransactionsService,
};