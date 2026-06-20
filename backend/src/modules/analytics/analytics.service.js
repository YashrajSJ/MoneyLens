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

const buildTransactionFilter = ({
  userId,
  accountId,
  from,
  to,
}) => {
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

const getCategoryBreakdownService = async ({
  userId,
  query,
  limit,
}) => {
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
                    $or: [ { $eq: ["$category", null] }, { $eq: ["$category", ""] }, ]
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
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)
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
      }
    );
  }

  return result;
};

const getMonthlyTrendService = async ({
  userId,
  query,
  monthsOverride,
}) => {
  await ensureOwnedAccount({
    userId,
    accountId: query.accountId,
  });

 const months = monthsOverride || Number(query.months) || DEFAULT_TREND_MONTHS;  const now = new Date();

  const startDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months + 1, 1)
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
    transactionStats.map((stat) => [String(stat._id), stat])
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
]);

return {
  summary,
  accounts,
  categories,
  trends,
  recentTransactions,
  budgetProgress,
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
};