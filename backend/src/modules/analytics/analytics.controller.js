import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  getAccountSummaryService,
  getCategoryBreakdownService,
  getDashboardAnalyticsService,
  getMonthlyTrendService,
  getRecentTransactionsService,
  getSummaryService,
  getTopMerchantsService,
  getBudgetProgressService,
} from "./analytics.service.js";

import {
  buildCacheKey,
  getCache,
  setCache,
} from "../../utils/cache.js";

import { CACHE_TTL_SECONDS } from "../security/security.constants.js";

const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const cacheKey = buildCacheKey([
    "analytics",
    "dashboard",
    req.user._id,
    req.originalUrl,
  ]);

  const cachedDashboard = await getCache(cacheKey);

  if (cachedDashboard) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          cachedDashboard,
          "Dashboard analytics fetched from cache"
        )
      );
  }

  const dashboard = await getDashboardAnalyticsService({
    userId: req.user._id,
    query: req.query,
  });

  await setCache(
    cacheKey,
    dashboard,
    CACHE_TTL_SECONDS.DASHBOARD_ANALYTICS
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        dashboard,
        "Dashboard analytics fetched successfully"
      )
    );
});

const getSummary = asyncHandler(async (req, res) => {
  const summary = await getSummaryService({
    userId: req.user._id,
    query: req.query,    
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { summary }, "Summary fetched successfully"));
});

const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const categories = await getCategoryBreakdownService({
    userId: req.user._id,
    query: req.query,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { categories },
      "Category breakdown fetched successfully"
    )
  );
});

const getMonthlyTrend = asyncHandler(async (req, res) => {
  const trends = await getMonthlyTrendService({
    userId: req.user._id,
    query: req.query,
  });

  return res.status(200).json(
    new ApiResponse(200, { trends }, "Monthly trends fetched successfully")
  );
});

const getTopMerchants = asyncHandler(async (req, res) => {
  const merchants = await getTopMerchantsService({
    userId: req.user._id,
    query: req.query,
  });

  return res.status(200).json(
    new ApiResponse(200, { merchants }, "Top merchants fetched successfully")
  );
});

const getAccountSummary = asyncHandler(async (req, res) => {
  const accounts = await getAccountSummaryService({
    userId: req.user._id,
    query: req.query,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { accounts },
      "Account summary fetched successfully"
    )
  );
});

const getRecentTransactions = asyncHandler(async (req, res) => {
  const transactions = await getRecentTransactionsService({
    userId: req.user._id,
    query: req.query,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { transactions },
      "Recent transactions fetched successfully"
    )
  );
});

const getBudgetProgress = asyncHandler(async (req, res) => {
  const result = await getBudgetProgressService({
    userId: req.user._id,
    query: req.query,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Budget progress fetched successfully"
    )
  );
});

export {
  getDashboardAnalytics,
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrend,
  getTopMerchants,
  getAccountSummary,
  getRecentTransactions,
  getBudgetProgress
};