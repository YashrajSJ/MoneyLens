import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";

import { Account } from "../account/account.model.js";
import { Budget } from "../budget/budget.model.js";
import { Transaction } from "../transaction/transaction.model.js";

import { ApiError } from "../../utils/ApiError.js";
import { logger } from "../../utils/logger.js";

import {
  AI_INSIGHT_COOLDOWN_MINUTES,
  AI_INSIGHT_LIMIT,
  DEFAULT_INSIGHT_PAGE_SIZE,
  INSIGHT_SEVERITIES,
  INSIGHT_TYPES,
} from "./insight.constants.js";

import { Insight } from "./insight.model.js";

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const getMonthDateRange = ({ month, year }) => {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));

  return { startDate, endDate };
};

const extractJsonFromAiText = (text) => {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");

  if (start === -1 || end === -1 || end <= start) {
    throw new ApiError(502, "AI response did not contain valid JSON array");
  }

  return cleaned.slice(start, end + 1);
};

const normalizeInsight = (insight) => {
  const type = INSIGHT_TYPES.includes(insight.type)
    ? insight.type
    : "GENERAL_TIP";

  const severity = INSIGHT_SEVERITIES.includes(insight.severity)
    ? insight.severity
    : "LOW";

  return {
    type,
    severity,
    title: String(insight.title || "Financial Insight")
      .trim()
      .slice(0, 120),
    message: String(insight.message || "")
      .trim()
      .slice(0, 500),
    metadata: insight.metadata || {},
  };
};

const validateInsight = (insight) => {
  if (!insight.title) {
    throw new ApiError(422, "Insight title is required");
  }

  if (!insight.message) {
    throw new ApiError(422, "Insight message is required");
  }
};

const generateRuleBasedInsights = ({ context }) => {
  const insights = [];

  if (context.summary.expenses > context.summary.income) {
    insights.push({
      type: "SPENDING_ALERT",
      severity: "HIGH",
      title: "Expenses exceeded income",
      message:
        "Your expenses are higher than your income for this month. Review major spending categories and reduce non-essential expenses.",
      metadata: {
        income: context.summary.income,
        expenses: context.summary.expenses,
      },
    });
  }

  const topCategory = context.categoryBreakdown?.[0];

  if (topCategory && topCategory.totalSpent > 0) {
    insights.push({
      type: "CATEGORY_TREND",
      severity: "MEDIUM",
      title: `High spending on ${topCategory.category}`,
      message: `${topCategory.category} is your highest spending category this month. Consider setting a smaller weekly limit for this category.`,
      metadata: {
        category: topCategory.category,
        totalSpent: topCategory.totalSpent,
      },
    });
  }

  const riskyBudget = context.budgetProgress?.find(
    (budget) => budget.isExceeded || budget.isOverThreshold,
  );

  if (riskyBudget) {
    insights.push({
      type: "BUDGET_WARNING",
      severity: riskyBudget.isExceeded ? "HIGH" : "MEDIUM",
      title: riskyBudget.isExceeded
        ? "Budget exceeded"
        : "Budget nearing limit",
      message: `${riskyBudget.accountName || "An account"} has used ${
        riskyBudget.usagePercent
      }% of its monthly budget.`,
      metadata: {
        accountId: riskyBudget.accountId,
        budgetAmount: riskyBudget.budgetAmount,
        spent: riskyBudget.spent,
        usagePercent: riskyBudget.usagePercent,
      },
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: "GENERAL_TIP",
      severity: "LOW",
      title: "Keep tracking your finances",
      message:
        "You do not have enough unusual activity this month. Continue tracking income, expenses, and budgets for better insights.",
      metadata: {},
    });
  }

  return insights.slice(0, AI_INSIGHT_LIMIT).map((insight) => {
    const normalized = normalizeInsight(insight);
    validateInsight(normalized);
    return normalized;
  });
};

const getFinancialContext = async ({ userId, month, year }) => {
  const { startDate, endDate } = getMonthDateRange({ month, year });

  const match = {
    userId: toObjectId(userId),
    status: "COMPLETED",
    date: {
      $gte: startDate,
      $lt: endDate,
    },
  };

  const [
    accounts,
    transactionSummary,
    categoryBreakdown,
    budgets,
    recentTransactions,
  ] = await Promise.all([
    Account.find({ userId })
      .select("name type balance isDefault")
      .sort({ isDefault: -1, createdAt: -1 })
      .lean(),

    Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),

    Transaction.aggregate([
      {
        $match: {
          ...match,
          type: "EXPENSE",
        },
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
          totalSpent: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalSpent: 1,
          count: 1,
        },
      },
    ]),

    Budget.find({
      userId,
      month,
      year,
    })
      .select("accountId amount alertThreshold month year")
      .populate("accountId", "name type")
      .lean(),

    Transaction.find(match)
      .select("type amount description category date merchantName")
      .sort({ date: -1 })
      .limit(10)
      .lean(),
  ]);

  const budgetAccountIds = budgets
    .map((budget) => budget.accountId?._id || budget.accountId)
    .filter(Boolean);

  let budgetProgress = [];

  if (budgetAccountIds.length > 0) {
    const budgetSpending = await Transaction.aggregate([
      {
        $match: {
          userId: toObjectId(userId),
          accountId: {
            $in: budgetAccountIds.map((id) => toObjectId(id)),
          },
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
          _id: "$accountId",
          spent: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const spendingMap = new Map(
      budgetSpending.map((item) => [String(item._id), item.spent]),
    );

    budgetProgress = budgets.map((budget) => {
      const accountId = budget.accountId?._id || budget.accountId;
      const spent = spendingMap.get(String(accountId)) || 0;
      const usagePercent =
        budget.amount > 0
          ? Number(((spent / budget.amount) * 100).toFixed(2))
          : 0;

      return {
        accountId,
        accountName: budget.accountId?.name,
        budgetAmount: budget.amount,
        spent,
        remainingAmount: Math.max(budget.amount - spent, 0),
        usagePercent,
        alertThreshold: budget.alertThreshold,
        isOverThreshold: usagePercent >= budget.alertThreshold,
        isExceeded: spent >= budget.amount,
      };
    });
  }

  const income =
    transactionSummary.find((item) => item._id === "INCOME")?.total || 0;

  const expenses =
    transactionSummary.find((item) => item._id === "EXPENSE")?.total || 0;

  return {
    month,
    year,
    accounts,
    summary: {
      income,
      expenses,
      netSavings: income - expenses,
    },
    categoryBreakdown,
    budgets,
    budgetProgress,
    recentTransactions,
  };
};

const generateInsightsWithAI = async ({ context }) => {
  if (!process.env.AI_API_KEY) {
    throw new ApiError(500, "AI API key is not configured");
  }

  const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: process.env.AI_MODEL || "gemini-1.5-flash",
  });

  const prompt = `
You are analyzing a user's personal finance data.

Return only valid JSON array. Do not include markdown.

Generate at most ${AI_INSIGHT_LIMIT} insights.

Allowed insight types:
${INSIGHT_TYPES.join(", ")}

Allowed severities:
${INSIGHT_SEVERITIES.join(", ")}

Each insight must follow this schema:
[
  {
    "type": "SPENDING_ALERT | BUDGET_WARNING | SAVING_OPPORTUNITY | CATEGORY_TREND | GENERAL_TIP",
    "severity": "LOW | MEDIUM | HIGH",
    "title": "short title",
    "message": "specific, practical advice in 1-2 sentences",
    "metadata": {}
  }
]

Rules:
- Use only the provided data.
- Do not invent bank accounts or transactions.
- Do not give investment, tax, or legal advice.
- Keep advice simple and actionable.
- If data is limited, return general but honest insights.

Financial data:
${JSON.stringify(context, null, 2)}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const parsed = JSON.parse(extractJsonFromAiText(text));

  if (!Array.isArray(parsed)) {
    throw new ApiError(502, "AI response must be an array");
  }

  return parsed.slice(0, AI_INSIGHT_LIMIT).map((item) => {
    const normalized = normalizeInsight(item);
    validateInsight(normalized);
    return normalized;
  });
};

const getRecentGeneratedInsights = async ({ userId, month, year }) => {
  const cooldownStart = new Date(
    Date.now() - AI_INSIGHT_COOLDOWN_MINUTES * 60 * 1000,
  );

  return await Insight.find({
    userId,
    month,
    year,
    createdAt: {
      $gte: cooldownStart,
    },
  })
    .sort({ createdAt: -1 })
    .lean();
};

const generateInsightsService = async ({ userId, query }) => {
  const now = new Date();

  const month = query.month || now.getUTCMonth() + 1;
  const year = query.year || now.getUTCFullYear();

  const recentInsights = await getRecentGeneratedInsights({
    userId,
    month,
    year,
  });

  if (recentInsights.length > 0) {
    return {
      insights: recentInsights,
      fromCache: true,
    };
  }

  const context = await getFinancialContext({
    userId,
    month,
    year,
  });

  let generatedInsights;

  try {
    generatedInsights = await generateInsightsWithAI({
      context,
    });
  } catch (error) {
    logger.error(
      {
        err: error,
        userId,
        month,
        year,
      },
      "AI insight generation failed, using rule-based fallback",
    );

    generatedInsights = generateRuleBasedInsights({
      context,
    });
  }

  if (!generatedInsights.length) {
    generatedInsights = generateRuleBasedInsights({
      context,
    });
  }

  const insightsToCreate = generatedInsights.map((insight) => ({
    userId,
    month,
    year,
    ...insight,
  }));

  const insights = await Insight.insertMany(insightsToCreate);

  logger.info(
    {
      userId,
      month,
      year,
      count: insights.length,
    },
    "AI insights generated",
  );

  return {
    insights,
    fromCache: false,
  };
};

const getInsightsService = async ({ userId, query }) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || DEFAULT_INSIGHT_PAGE_SIZE;
  const skip = (page - 1) * limit;

  const filter = {
    userId,
  };

  if (query.type) {
    filter.type = query.type;
  }

  if (query.severity) {
    filter.severity = query.severity;
  }

  if (query.month) {
    filter.month = query.month;
  }

  if (query.year) {
    filter.year = query.year;
  }

  if (query.isRead !== undefined) {
    filter.isRead = query.isRead === true || query.isRead === "true";
  }

  const [insights, total] = await Promise.all([
    Insight.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),

    Insight.countDocuments(filter),
  ]);

  return {
    insights,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getInsightByIdService = async ({ insight }) => {
  return insight;
};

const getMonthlySummaryService = async ({ userId, query }) => {
  const now = new Date();

  const month = query.month || now.getUTCMonth() + 1;
  const year = query.year || now.getUTCFullYear();

  return await getFinancialContext({
    userId,
    month,
    year,
  });
};

const markInsightAsReadService = async ({ userId, insightId }) => {
  const insight = await Insight.findOneAndUpdate(
    {
      _id: insightId,
      userId,
    },
    {
      $set: {
        isRead: true,
      },
    },
    {
      new: true,
    },
  ).lean();

  if (!insight) {
    throw new ApiError(404, "Insight not found");
  }

  return insight;
};

const deleteInsightService = async ({ userId, insightId }) => {
  const result = await Insight.deleteOne({
    _id: insightId,
    userId,
  });

  if (result.deletedCount === 0) {
    throw new ApiError(404, "Insight not found");
  }
};

export {
  generateInsightsService,
  getInsightsService,
  getInsightByIdService,
  getMonthlySummaryService,
  markInsightAsReadService,
  deleteInsightService,
};
