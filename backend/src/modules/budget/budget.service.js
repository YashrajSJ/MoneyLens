import { Account } from "../account/account.model.js";
import { Budget } from "./budget.model.js";
import { Transaction } from "../transaction/transaction.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { BUDGET_STATUSES } from "./budget.constants.js";

const getMonthDateRange = (month, year) => {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));

  return { startDate, endDate };
};

const calculateBudgetProgress = async ({ userId, budget }) => {
  const { startDate, endDate } = getMonthDateRange(
    budget.month,
    budget.year
  );

  const result = await Transaction.aggregate([
    {
      $match: {
        userId,
        accountId: budget.accountId,
        type: "EXPENSE",
        status: "COMPLETED",
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalExpenses: {
          $sum: "$amount",
        },
      },
    },
  ]);

  const spentAmount = result[0]?.totalExpenses || 0;
  const remainingAmount = Math.max(budget.amount - spentAmount, 0);

const percentageUsed = budget.amount > 0 ? (spentAmount / budget.amount) * 100: 0;
  let status = BUDGET_STATUSES.SAFE;

  if (percentageUsed >= 100) {
    status = BUDGET_STATUSES.EXCEEDED;
  } else if (percentageUsed >= budget.alertThreshold) {
    status = BUDGET_STATUSES.WARNING;
  }

  return {
    spentAmount,
    remainingAmount,
    percentageUsed: Number(percentageUsed.toFixed(2)),
    status,
  };
};

const ensureOwnedAccount = async ({ userId, accountId }) => {
  const account = await Account.findOne({
    _id: accountId,
    userId,
  });

  if (!account) {
    throw new ApiError(404, "Account not found");
  }

  return account;
};

const createBudgetService = async ({ userId, payload }) => {
  await ensureOwnedAccount({
    userId,
    accountId: payload.accountId,
  });

  const existingBudget = await Budget.findOne({
    userId,
    accountId: payload.accountId,
    month: payload.month,
    year: payload.year,
  });

  if (existingBudget) {
    throw new ApiError(
      409,
      "A budget already exists for this account and month"
    );
  }

  try {
    return await Budget.create({
      ...payload,
      userId,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(
        409,
        "A budget already exists for this account and month"
      );
    }

    throw error;
  }
};

const getBudgetsService = async ({ userId, query }) => {
  const filter = { userId };

  if (query.accountId) filter.accountId = query.accountId;
  if (query.month) filter.month = Number(query.month);
  if (query.year) filter.year = Number(query.year);

  const budgets = await Budget.find(filter)
    .populate("accountId", "name type color")
    .sort({ year: -1, month: -1, createdAt: -1 });

  return budgets;
};

const getCurrentBudgetService = async ({
  userId,
  accountId,
  month,
  year,
}) => {
  await ensureOwnedAccount({ userId, accountId });

  const budget = await Budget.findOne({
    userId,
    accountId,
    month,
    year,
  }).populate("accountId", "name type color");

  if (!budget) {
    throw new ApiError(404, "Budget not found for the selected period");
  }

  const progress = await calculateBudgetProgress({
    userId,
    budget,
  });

  return {
    budget,
    progress,
  };
};

const getBudgetByIdService = async ({ userId, budget }) => {
  const progress = await calculateBudgetProgress({
    userId,
    budget,
  });

  return {
    budget,
    progress,
  };
};

const updateBudgetService = async ({ budget, payload }) => {
  const allowedFields = ["amount", "alertThreshold"];

  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) {
      budget[field] = payload[field];
    }
  });

  await budget.save();

  return budget;
};

const deleteBudgetService = async ({ userId, budget }) => {
  await Budget.deleteOne({
    _id: budget._id,
    userId,
  });
};

export {
  createBudgetService,
  getBudgetsService,
  getCurrentBudgetService,
  getBudgetByIdService,
  updateBudgetService,
  deleteBudgetService,
};