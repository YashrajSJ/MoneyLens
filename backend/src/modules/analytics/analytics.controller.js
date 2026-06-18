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
} from "./analytics.service.js";

const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const analytics = await getDashboardAnalyticsService({
    userId: req.user._id,
    query: req.query,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { analytics },
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

export {
  getDashboardAnalytics,
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrend,
  getTopMerchants,
  getAccountSummary,
  getRecentTransactions,
};