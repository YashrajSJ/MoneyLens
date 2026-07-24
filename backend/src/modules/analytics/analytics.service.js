import mongoose from "mongoose";

import { Account } from "../account/account.model.js";
import { Transaction } from "../transaction/transaction.model.js";
import { ApiError } from "../../utils/ApiError.js";

import {
  DASHBOARD_CATEGORY_LIMIT,
  DASHBOARD_RECENT_TRANSACTION_LIMIT,
  DASHBOARD_TREND_MONTHS,
  DEFAULT_MERCHANT_LIMIT,
  DEFAULT_RECENT_TRANSACTION_LIMIT,
  DEFAULT_TREND_MONTHS,
  HEALTH_SCORE_WEIGHTS,
} from "./analytics.constants.js";

import { Budget } from "../budget/budget.model.js";
import { BUDGET_STATUSES } from "../budget/budget.constants.js";

const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));

const ensureOwnedAccount = async ({ userId, accountId }) => {
  if (!accountId) return;

  const accountExists = await Account.exists({
    _id: accountId,
    userId,
  });

  if (!accountExists) {
    throw new ApiError(404, "Account not found");
  }
};

const getDateRange = ({ from, to }) => {
  const now = new Date();

  const startDate = from
    ? new Date(from)
    : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  let endDate;

  if (to) {
    endDate = new Date(to);
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    endDate.setUTCHours(0, 0, 0, 0);
  } else {
    endDate = now;
  }

  return { startDate, endDate };
};

const buildTransactionFilter = ({ userId, accountId, from, to }) => {
  const { startDate, endDate } = getDateRange({ from, to });

  const filter = {
    userId: toObjectId(userId),
    status: "COMPLETED",
    date: {
      $gte: startDate,
      $lt: endDate,
    },
  };

  if (accountId) {
    filter.accountId = toObjectId(accountId);
  }

  return filter;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const roundNumber = (value) => Number(value.toFixed(2));

const getMonthDateRange = ({ month, year }) => {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));

  return {
    startDate,
    endDate,
  };
};

const getPreviousMonth = ({ month, year }) => {
  if (month === 1) {
    return {
      month: 12,
      year: year - 1,
    };
  }

  return {
    month: month - 1,
    year,
  };
};

const getHealthScoreLabel = (score) => {
  if (score >= 80) return "Excellent financial health";
  if (score >= 65) return "Good financial rhythm";
  if (score >= 45) return "Needs attention";
  return "High risk spending pattern";
};

const getMonthlyCashflow = async ({ userId, accountId, month, year }) => {
  const { startDate, endDate } = getMonthDateRange({ month, year });

  const filter = {
    userId: toObjectId(userId),
    status: "COMPLETED",
    isRecurring: {
      $ne: true,
    },
    date: {
      $gte: startDate,
      $lt: endDate,
    },
  };

  if (accountId) {
    filter.accountId = toObjectId(accountId);
  }

  const result = await Transaction.aggregate([
    {
      $match: filter,
    },
    {
      $group: {
        _id: null,
        income: {
          $sum: {
            $cond: [{ $eq: ["$type", "INCOME"] }, "$amount", 0],
          },
        },
        expenses: {
          $sum: {
            $cond: [{ $eq: ["$type", "EXPENSE"] }, "$amount", 0],
          },
        },
      },
    },
  ]);

  const summary = result[0] || {
    income: 0,
    expenses: 0,
  };

  return {
    income: summary.income,
    expenses: summary.expenses,
    netSavings: summary.income - summary.expenses,
  };
};

const getMonthlyRecurringExpenseLoad = async ({ userId, accountId }) => {
  const filter = {
    userId,
    isRecurring: true,
    recurringStatus: "ACTIVE",
    type: "EXPENSE",
  };

  if (accountId) {
    filter.accountId = accountId;
  }

  const recurringExpenses = await Transaction.find(filter)
    .select("amount recurringInterval")
    .lean();

  return recurringExpenses.reduce((total, transaction) => {
    const amount = Number(transaction.amount) || 0;

    if (transaction.recurringInterval === "DAILY") {
      return total + amount * 30;
    }

    if (transaction.recurringInterval === "WEEKLY") {
      return total + amount * 4;
    }

    if (transaction.recurringInterval === "YEARLY") {
      return total + amount / 12;
    }

    return total + amount;
  }, 0);
};

const getBudgetUsage = async ({ userId, accountId, month, year }) => {
  const budgetFilter = {
    userId,
    month,
    year,
  };

  if (accountId) {
    budgetFilter.accountId = accountId;
  }

  const budgets = await Budget.find(budgetFilter)
    .select("accountId amount alertThreshold")
    .lean();

  if (budgets.length === 0) {
    return {
      hasBudget: false,
      percentageUsed: 0,
      alertThreshold: 80,
    };
  }

  const accountIds = budgets.map((budget) => toObjectId(budget.accountId));
  const totalBudgetAmount = budgets.reduce(
    (total, budget) => total + budget.amount,
    0,
  );

  const averageAlertThreshold =
    budgets.reduce((total, budget) => total + budget.alertThreshold, 0) /
    budgets.length;

  const { startDate, endDate } = getMonthDateRange({ month, year });

  const result = await Transaction.aggregate([
    {
      $match: {
        userId: toObjectId(userId),
        accountId: {
          $in: accountIds,
        },
        type: "EXPENSE",
        status: "COMPLETED",
        isRecurring: {
          $ne: true,
        },
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        expenses: {
          $sum: "$amount",
        },
      },
    },
  ]);

  const expenses = result[0]?.expenses || 0;

  return {
    hasBudget: true,
    percentageUsed:
      totalBudgetAmount > 0 ? (expenses / totalBudgetAmount) * 100 : 0,
    alertThreshold: averageAlertThreshold,
  };
};

const getSummaryService = async ({ userId, query }) => {
  await ensureOwnedAccount({
    userId,
    accountId: query.accountId,
  });

  const filter = buildTransactionFilter({
    userId,
    accountId: query.accountId,
    from: query.from,
    to: query.to,
  });

  const result = await Transaction.aggregate([
    {
      $match: filter,
    },
    {
      $group: {
        _id: null,

        totalIncome: {
          $sum: {
            $cond: [{ $eq: ["$type", "INCOME"] }, "$amount", 0],
          },
        },

        totalExpenses: {
          $sum: {
            $cond: [{ $eq: ["$type", "EXPENSE"] }, "$amount", 0],
          },
        },

        transactionCount: {
          $sum: 1,
        },
      },
    },
  ]);

  const summary = result[0] || {
    totalIncome: 0,
    totalExpenses: 0,
    transactionCount: 0,
  };

  return {
    totalIncome: summary.totalIncome,
    totalExpenses: summary.totalExpenses,
    netSavings: summary.totalIncome - summary.totalExpenses,
    transactionCount: summary.transactionCount,
  };
};

const getCategoryBreakdownService = async ({ userId, query, limit }) => {
  await ensureOwnedAccount({
    userId,
    accountId: query.accountId,
  });

  const filter = buildTransactionFilter({
    userId,
    accountId: query.accountId,
    from: query.from,
    to: query.to,
  });

  filter.type = "EXPENSE";

  const pipeline = [
    {
      $match: filter,
    },
    {
      $group: {
        _id: {
          $cond: [
            {
              $or: [{ $eq: ["$category", null] }, { $eq: ["$category", ""] }],
            },
            "uncategorized",
            "$category",
          ],
        },
        totalSpent: {
          $sum: "$amount",
        },
        transactionCount: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        totalSpent: -1,
      },
    },
  ];

  if (limit) {
    pipeline.push({
      $limit: limit,
    });
  }

  pipeline.push({
    $project: {
      _id: 0,
      category: "$_id",
      totalSpent: 1,
      transactionCount: 1,
    },
  });

  return await Transaction.aggregate(pipeline);
};

const fillMissingMonths = ({ trends, months }) => {
  const now = new Date();
  const trendMap = new Map();

  trends.forEach((trend) => {
    trendMap.set(`${trend.year}-${trend.month}`, trend);
  });

  const result = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1),
    );

    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const key = `${year}-${month}`;

    result.push(
      trendMap.get(key) || {
        year,
        month,
        income: 0,
        expenses: 0,
        netSavings: 0,
      },
    );
  }

  return result;
};

const getMonthlyTrendService = async ({ userId, query, monthsOverride }) => {
  await ensureOwnedAccount({
    userId,
    accountId: query.accountId,
  });

  const months = monthsOverride || Number(query.months) || DEFAULT_TREND_MONTHS;
  const now = new Date();

  const startDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months + 1, 1),
  );

  const filter = {
    userId: toObjectId(userId),
    status: "COMPLETED",
    date: {
      $gte: startDate,
      $lt: now,
    },
  };

  if (query.accountId) {
    filter.accountId = toObjectId(query.accountId);
  }

  const trends = await Transaction.aggregate([
    {
      $match: filter,
    },
    {
      $group: {
        _id: {
          year: {
            $year: "$date",
          },
          month: {
            $month: "$date",
          },
        },

        income: {
          $sum: {
            $cond: [{ $eq: ["$type", "INCOME"] }, "$amount", 0],
          },
        },

        expenses: {
          $sum: {
            $cond: [{ $eq: ["$type", "EXPENSE"] }, "$amount", 0],
          },
        },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        income: 1,
        expenses: 1,
        netSavings: {
          $subtract: ["$income", "$expenses"],
        },
      },
    },
  ]);

  return fillMissingMonths({ trends, months });
};

const getTopMerchantsService = async ({ userId, query }) => {
  await ensureOwnedAccount({
    userId,
    accountId: query.accountId,
  });

  const filter = buildTransactionFilter({
    userId,
    accountId: query.accountId,
    from: query.from,
    to: query.to,
  });

  filter.type = "EXPENSE";
  filter.merchantName = {
    $exists: true,
    $ne: "",
  };

  const limit = Number(query.limit) || DEFAULT_MERCHANT_LIMIT;

  return await Transaction.aggregate([
    {
      $match: filter,
    },
    {
      $group: {
        _id: "$merchantName",
        totalSpent: {
          $sum: "$amount",
        },
        transactionCount: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        totalSpent: -1,
      },
    },
    {
      $limit: limit,
    },
    {
      $project: {
        _id: 0,
        merchantName: "$_id",
        totalSpent: 1,
        transactionCount: 1,
      },
    },
  ]);
};

const getAccountSummaryService = async ({ userId, query }) => {
  const filter = buildTransactionFilter({
    userId,
    from: query.from,
    to: query.to,
  });

  const [accounts, transactionStats] = await Promise.all([
    Account.find({ userId })
      .select("name type balance isDefault color createdAt")
      .sort({ isDefault: -1, createdAt: -1 }),

    Transaction.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: "$accountId",

          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "INCOME"] }, "$amount", 0],
            },
          },

          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ["$type", "EXPENSE"] }, "$amount", 0],
            },
          },

          transactionCount: {
            $sum: 1,
          },
        },
      },
    ]),
  ]);

  const statsByAccount = new Map(
    transactionStats.map((stat) => [String(stat._id), stat]),
  );

  return accounts.map((account) => {
    const stats = statsByAccount.get(String(account._id));

    return {
      account,
      totalIncome: stats?.totalIncome || 0,
      totalExpenses: stats?.totalExpenses || 0,
      netCashflow: (stats?.totalIncome || 0) - (stats?.totalExpenses || 0),
      transactionCount: stats?.transactionCount || 0,
    };
  });
};

const getRecentTransactionsService = async ({ userId, query }) => {
  await ensureOwnedAccount({
    userId,
    accountId: query.accountId,
  });

  const filter = buildTransactionFilter({
    userId,
    accountId: query.accountId,
    from: query.from,
    to: query.to,
  });

  const limit = Number(query.limit) || DEFAULT_RECENT_TRANSACTION_LIMIT;

  return await Transaction.find(filter)
    .populate("accountId", "name type color")
    .sort({ date: -1, createdAt: -1 })
    .limit(limit);
};

const getBudgetProgressService = async ({ userId, query }) => {
  const now = new Date();

  const month = Number(query.month) || now.getUTCMonth() + 1;
  const year = Number(query.year) || now.getUTCFullYear();

  let accountId = query.accountId;

  if (accountId) {
    await ensureOwnedAccount({ userId, accountId });
  } else {
    const defaultAccount = await Account.findOne({
      userId,
      isDefault: true,
    });

    if (!defaultAccount) {
      return {
        budget: null,
        progress: null,
      };
    }

    accountId = defaultAccount._id;
  }

  const budget = await Budget.findOne({
    userId,
    accountId,
    month,
    year,
  });

  if (!budget) {
    return {
      budget: null,
      progress: null,
    };
  }

  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));

  const result = await Transaction.aggregate([
    {
      $match: {
        userId: toObjectId(userId),
        accountId: toObjectId(accountId),
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
        currentExpenses: {
          $sum: "$amount",
        },
      },
    },
  ]);

  const currentExpenses = result[0]?.currentExpenses || 0;
  const remainingAmount = Math.max(budget.amount - currentExpenses, 0);

  const percentageUsed =
    budget.amount > 0 ? (currentExpenses / budget.amount) * 100 : 0;

  let status = BUDGET_STATUSES.SAFE;

  if (percentageUsed >= 100) {
    status = BUDGET_STATUSES.EXCEEDED;
  } else if (percentageUsed >= budget.alertThreshold) {
    status = BUDGET_STATUSES.WARNING;
  }

  return {
    budget,
    progress: {
      budgetAmount: budget.amount,
      currentExpenses,
      remainingAmount,
      percentageUsed: Number(percentageUsed.toFixed(2)),
      status,
    },
  };
};

const getFinancialHealthScoreService = async ({ userId, query }) => {
  await ensureOwnedAccount({
    userId,
    accountId: query.accountId,
  });

  const now = new Date();

  const month = Number(query.month) || now.getUTCMonth() + 1;
  const year = Number(query.year) || now.getUTCFullYear();

  const previousMonth = getPreviousMonth({ month, year });

  const [currentCashflow, previousCashflow, budgetUsage, recurringExpenseLoad] =
    await Promise.all([
      getMonthlyCashflow({
        userId,
        accountId: query.accountId,
        month,
        year,
      }),

      getMonthlyCashflow({
        userId,
        accountId: query.accountId,
        month: previousMonth.month,
        year: previousMonth.year,
      }),

      getBudgetUsage({
        userId,
        accountId: query.accountId,
        month,
        year,
      }),

      getMonthlyRecurringExpenseLoad({
        userId,
        accountId: query.accountId,
      }),
    ]);

  const savingsRate =
    currentCashflow.income > 0
      ? (currentCashflow.netSavings / currentCashflow.income) * 100
      : 0;

  const savingsRateScore = clamp(
    (savingsRate / 30) * HEALTH_SCORE_WEIGHTS.SAVINGS_RATE,
    0,
    HEALTH_SCORE_WEIGHTS.SAVINGS_RATE,
  );

  const budgetUsageScore = budgetUsage.hasBudget
    ? budgetUsage.percentageUsed <= budgetUsage.alertThreshold
      ? HEALTH_SCORE_WEIGHTS.BUDGET_USAGE
      : clamp(
          HEALTH_SCORE_WEIGHTS.BUDGET_USAGE -
            ((budgetUsage.percentageUsed - budgetUsage.alertThreshold) /
              (100 - budgetUsage.alertThreshold)) *
              HEALTH_SCORE_WEIGHTS.BUDGET_USAGE,
          0,
          HEALTH_SCORE_WEIGHTS.BUDGET_USAGE,
        )
    : HEALTH_SCORE_WEIGHTS.BUDGET_USAGE * 0.6;

  const expenseGrowth =
    previousCashflow.expenses > 0
      ? ((currentCashflow.expenses - previousCashflow.expenses) /
          previousCashflow.expenses) *
        100
      : currentCashflow.expenses > 0
        ? 100
        : 0;

  const expenseTrendScore =
    expenseGrowth <= 0
      ? HEALTH_SCORE_WEIGHTS.EXPENSE_TREND
      : clamp(
          HEALTH_SCORE_WEIGHTS.EXPENSE_TREND -
            (expenseGrowth / 30) * HEALTH_SCORE_WEIGHTS.EXPENSE_TREND,
          0,
          HEALTH_SCORE_WEIGHTS.EXPENSE_TREND,
        );

  const recurringLoadPercentage =
    currentCashflow.income > 0
      ? (recurringExpenseLoad / currentCashflow.income) * 100
      : 0;

  const recurringLoadScore =
    recurringLoadPercentage <= 20
      ? HEALTH_SCORE_WEIGHTS.RECURRING_LOAD
      : clamp(
          HEALTH_SCORE_WEIGHTS.RECURRING_LOAD -
            ((recurringLoadPercentage - 20) / 30) *
              HEALTH_SCORE_WEIGHTS.RECURRING_LOAD,
          0,
          HEALTH_SCORE_WEIGHTS.RECURRING_LOAD,
        );

  const cashflowScore =
    currentCashflow.netSavings > 0
      ? HEALTH_SCORE_WEIGHTS.CASHFLOW
      : currentCashflow.netSavings === 0
        ? HEALTH_SCORE_WEIGHTS.CASHFLOW * 0.5
        : 0;

  const score = Math.round(
    savingsRateScore +
      budgetUsageScore +
      expenseTrendScore +
      recurringLoadScore +
      cashflowScore,
  );

  return {
    score,
    label: getHealthScoreLabel(score),
    month,
    year,
    summary: {
      income: currentCashflow.income,
      expenses: currentCashflow.expenses,
      netSavings: currentCashflow.netSavings,
      previousMonthExpenses: previousCashflow.expenses,
    },
    breakdown: {
      savingsRate: {
        score: Math.round(savingsRateScore),
        maxScore: HEALTH_SCORE_WEIGHTS.SAVINGS_RATE,
        value: roundNumber(savingsRate),
        message:
          savingsRate >= 30
            ? "Healthy savings rate"
            : savingsRate > 0
              ? "Savings rate can improve"
              : "No savings recorded this month",
      },
      budgetUsage: {
        score: Math.round(budgetUsageScore),
        maxScore: HEALTH_SCORE_WEIGHTS.BUDGET_USAGE,
        value: roundNumber(budgetUsage.percentageUsed),
        message: budgetUsage.hasBudget
          ? budgetUsage.percentageUsed <= budgetUsage.alertThreshold
            ? "Budget usage is under control"
            : "Budget usage is above alert level"
          : "No budget found, neutral score applied",
      },
      expenseTrend: {
        score: Math.round(expenseTrendScore),
        maxScore: HEALTH_SCORE_WEIGHTS.EXPENSE_TREND,
        value: roundNumber(expenseGrowth),
        message:
          expenseGrowth <= 0
            ? "Expenses decreased compared to last month"
            : "Expenses increased compared to last month",
      },
      recurringLoad: {
        score: Math.round(recurringLoadScore),
        maxScore: HEALTH_SCORE_WEIGHTS.RECURRING_LOAD,
        value: roundNumber(recurringLoadPercentage),
        message:
          recurringLoadPercentage <= 20
            ? "Recurring expense load is low"
            : "Recurring expenses take a notable part of income",
      },
      cashflow: {
        score: Math.round(cashflowScore),
        maxScore: HEALTH_SCORE_WEIGHTS.CASHFLOW,
        value: currentCashflow.netSavings,
        message:
          currentCashflow.netSavings > 0
            ? "Positive monthly cashflow"
            : currentCashflow.netSavings === 0
              ? "Cashflow is balanced"
              : "Spending exceeded income",
      },
    },
  };
};

const getDashboardAnalyticsService = async ({ userId, query }) => {
  const dashboardQuery = {
    ...query,
  };

  const [
    summary,
    accounts,
    categories,
    trends,
    recentTransactions,
    budgetProgress,
    heathScore,
  ] = await Promise.all([
    getSummaryService({ userId, query: dashboardQuery }),

    getAccountSummaryService({ userId, query: dashboardQuery }),

    getCategoryBreakdownService({
      userId,
      query: dashboardQuery,
      limit: DASHBOARD_CATEGORY_LIMIT,
    }),

    getMonthlyTrendService({
      userId,
      query: dashboardQuery,
      monthsOverride: DASHBOARD_TREND_MONTHS,
    }),

    getRecentTransactionsService({
      userId,
      query: {
        ...dashboardQuery,
        limit: DASHBOARD_RECENT_TRANSACTION_LIMIT,
      },
    }),

    getBudgetProgressService({
      userId,
      query: dashboardQuery,
    }),
    getFinancialHealthScoreService({
      userId,
      query: dashboardQuery,
    }),
  ]);

  return {
    summary,
    accounts,
    categories,
    trends,
    recentTransactions,
    budgetProgress,
    healthScore,
  };
};

export {
  getDashboardAnalyticsService,
  getSummaryService,
  getCategoryBreakdownService,
  getMonthlyTrendService,
  getTopMerchantsService,
  getAccountSummaryService,
  getRecentTransactionsService,
  getBudgetProgressService,
  getFinancialHealthScoreService,
};
