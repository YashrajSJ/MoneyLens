import { randomUUID } from "node:crypto";

import { Account } from "../account/account.model.js";
import { MAX_ACCOUNT_BALANCE } from "../account/account.constants.js";
import { Transaction } from "../transaction/transaction.model.js";

import { RECURRING_STATUS } from "../transaction/transaction.constants.js";

import { ApiError } from "../../utils/ApiError.js";
import { logger } from "../../utils/logger.js";
import { withTransaction } from "../../utils/withTransaction.js";

import { DEFAULT_RECURRING_PROCESS_LIMIT , DEFAULT_RECURRING_LIST_LIMIT } from "./recurring.constants.js";

const calculateNextRecurringDate = (date, interval) => {
  const nextDate = new Date(date);

  if (Number.isNaN(nextDate.getTime())) {
    throw new ApiError(400, "Invalid recurring date");
  }

  switch (interval) {
    case "DAILY":
      nextDate.setUTCDate(nextDate.getUTCDate() + 1);
      break;

    case "WEEKLY":
      nextDate.setUTCDate(nextDate.getUTCDate() + 7);
      break;

    case "MONTHLY":
      nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
      break;

    case "YEARLY":
      nextDate.setUTCFullYear(nextDate.getUTCFullYear() + 1);
      break;

    default:
      throw new ApiError(400, "Invalid recurring interval");
  }

  return nextDate;
};

const getBalanceEffect = (transaction) => {
  if (transaction.status !== "COMPLETED") return 0;

  return transaction.type === "INCOME"
    ? transaction.amount
    : -transaction.amount;
};

const getRecurringTransactionsService = async ({ userId, query }) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || DEFAULT_RECURRING_LIST_LIMIT;
  const skip = (page - 1) * limit;

  const filter = {
    userId,
    isRecurring: true,
  };

  if (query.status) {
    filter.recurringStatus = query.status;
  }

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate("accountId", "name type color balance")
      .sort({ nextRecurringDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Transaction.countDocuments(filter),
  ]);

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getDueRecurringTransactionsService = async ({ userId, query }) => {

  const asOf = query.asOf ? new Date(query.asOf) : new Date();

  if (Number.isNaN(asOf.getTime())) {
    throw new ApiError(400, "Invalid asOf date");
  }

  const limit = Number(query.limit) || DEFAULT_RECURRING_PROCESS_LIMIT;

  return await Transaction.find({
    userId,
    isRecurring: true,
    recurringStatus: RECURRING_STATUS.ACTIVE,
    nextRecurringDate: {
      $lte: asOf,
    },
  })
    .populate("accountId", "name type color balance")
    .sort({ nextRecurringDate: 1 })
    .limit(limit)
    .lean();
};

const processRecurringTransactionService = async ({
  userId,
  transactionId,
  asOf = new Date(),
  jobId = randomUUID(),
}) => {
  const asOfDate = asOf ? new Date(asOf) : new Date();

  if (Number.isNaN(asOfDate.getTime())) {
    throw new ApiError(400, "Invalid asOf date");
  }

  return await withTransaction(async (session) => {
    const template = await Transaction.findOne({
      _id: transactionId,
      userId,
      isRecurring: true,
      recurringStatus: RECURRING_STATUS.ACTIVE,
      nextRecurringDate: {
        $lte: asOfDate,
      },
    }).session(session);

    if (!template) {
      throw new ApiError(404, "No due recurring transaction found");
    }

    const dueDate = template.nextRecurringDate;

    if (!template.recurringInterval) {
      throw new ApiError(400, "Recurring interval is missing");
    }

    const nextRecurringDate = calculateNextRecurringDate(
      dueDate,
      template.recurringInterval,
    );

    const account = await Account.findOne({
      _id: template.accountId,
      userId,
    }).session(session);

    if (!account) {
      throw new ApiError(404, "Account not found");
    }

    let generatedStatus = template.status;
    const balanceEffect = getBalanceEffect(template);
    const resultingBalance = account.balance + balanceEffect;

    if (
      template.status === "COMPLETED" &&
      (resultingBalance < 0 || resultingBalance > MAX_ACCOUNT_BALANCE)
    ) {
      generatedStatus = "FAILED";
    }

    const claimedTemplate = await Transaction.findOneAndUpdate(
      {
        _id: template._id,
        userId,
        isRecurring: true,
        recurringStatus: RECURRING_STATUS.ACTIVE,
        nextRecurringDate: dueDate,
      },
      {
        $set: {
          nextRecurringDate,
          lastProcessedAt: new Date(),
        },
      },
      {
        new: true,
        session,
      },
    );

    if (!claimedTemplate) {
      throw new ApiError(409, "Recurring transaction was already processed");
    }

    const [generatedTransaction] = await Transaction.create(
      [
        {
          userId,
          accountId: template.accountId,
          type: template.type,
          amount: template.amount,
          description: template.description,
          category: template.category,
          date: dueDate,
          paymentMethod: template.paymentMethod,
          merchantName: template.merchantName,
          receiptUrl: template.receiptUrl,
          status: generatedStatus,
          isRecurring: false,
          recurringParentId: template._id,
        },
      ],
      { session },
    );

    if (generatedStatus === "COMPLETED" && balanceEffect !== 0) {
      account.balance = resultingBalance;
      await account.save({ session });
    }

    logger.info(
      {
        jobId,
        userId,
        recurringTransactionId: template._id,
        generatedTransactionId: generatedTransaction._id,
        generatedStatus,
      },
      "Recurring transaction processed",
    );

    return {
      template: claimedTemplate,
      generatedTransaction,
    };
  }, "processRecurringTransaction failed");
};

const processDueRecurringTransactionsService = async ({
  userId,
  query,
  jobId = randomUUID(),
}) => {
  const dueTransactions = await getDueRecurringTransactionsService({
    userId,
    query,
  });

  const processed = [];
  const failed = [];

  const asOf = query.asOf || new Date();

  for (const transaction of dueTransactions) {
    try {
      const result = await processRecurringTransactionService({
        userId,
        transactionId: transaction._id,
        asOf,
        jobId,
      });

      processed.push({
        recurringTransactionId: transaction._id,
        generatedTransactionId: result.generatedTransaction._id,
        status: result.generatedTransaction.status,
      });
    } catch (error) {
      logger.error(
        {
          err: error,
          jobId,
          userId,
          recurringTransactionId: transaction._id,
        },
        "Recurring transaction processing failed",
      );

      failed.push({
        recurringTransactionId: transaction._id,
        message: error.message,
      });
    }
  }

  return {
    jobId,
    processedCount: processed.length,
    failedCount: failed.length,
    processed,
    failed,
  };
};

const pauseRecurringTransactionService = async ({ userId, transactionId }) => {
  const transaction = await Transaction.findOneAndUpdate(
    {
      _id: transactionId,
      userId,
      isRecurring: true,
      recurringStatus: RECURRING_STATUS.ACTIVE,
    },
    {
      $set: {
        recurringStatus: RECURRING_STATUS.PAUSED,
      },
    },
    {
      new: true,
    },
  ).lean();

  if (transaction) {
    return transaction;
  }

  const existingTransaction = await Transaction.findOne({
    _id: transactionId,
    userId,
    isRecurring: true,
  }).lean();

  if (!existingTransaction) {
    throw new ApiError(404, "Recurring transaction not found");
  }

  if (existingTransaction.recurringStatus === RECURRING_STATUS.PAUSED) {
    throw new ApiError(409, "Recurring transaction is already paused");
  }

  throw new ApiError(400, "Recurring transaction cannot be paused");
};

const resumeRecurringTransactionService = async ({ userId, transactionId }) => {


  const transaction = await Transaction.findOne({
    _id: transactionId,
    userId,
    isRecurring: true,
  });

  if (!transaction) {
    throw new ApiError(404, "Recurring transaction not found");
  }

  if (transaction.recurringStatus === RECURRING_STATUS.ACTIVE) {
  throw new ApiError(409, "Recurring transaction is already active");
  }

  if (!transaction.recurringInterval) {
    throw new ApiError(400, "Recurring interval is missing");
  }

  transaction.recurringStatus = RECURRING_STATUS.ACTIVE;

  const now = new Date();

  if (!transaction.nextRecurringDate || transaction.nextRecurringDate < now) {
    transaction.nextRecurringDate = calculateNextRecurringDate(
      now,
      transaction.recurringInterval,
    );
  }

  await transaction.save();

  return transaction;
};

export {
  getRecurringTransactionsService,
  getDueRecurringTransactionsService,
  processRecurringTransactionService,
  processDueRecurringTransactionsService,
  pauseRecurringTransactionService,
  resumeRecurringTransactionService,
};
