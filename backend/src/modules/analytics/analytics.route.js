import { Router } from "express";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validator.middleware.js";

import {
  getAccountSummary,
  getCategoryBreakdown,
  getDashboardAnalytics,
  getMonthlyTrend,
  getRecentTransactions,
  getSummary,
  getTopMerchants,
  getBudgetProgress
} from "./analytics.controller.js";

import {
  accountSummaryValidator,
  categoryBreakdownValidator,
  dashboardAnalyticsValidator,
  monthlyTrendValidator,
  recentTransactionsValidator,
  summaryValidator,
  topMerchantsValidator,
  budgetProgressValidator
} from "./analytics.validator.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/dashboard")
  .get(dashboardAnalyticsValidator(), validate, getDashboardAnalytics);

router
  .route("/summary")
  .get(summaryValidator(), validate, getSummary);

router
  .route("/category-breakdown")
  .get(categoryBreakdownValidator(), validate, getCategoryBreakdown);

router
  .route("/monthly-trend")
  .get(monthlyTrendValidator(), validate, getMonthlyTrend);

router
  .route("/top-merchants")
  .get(topMerchantsValidator(), validate, getTopMerchants);

router
  .route("/account-summary")
  .get(accountSummaryValidator(), validate, getAccountSummary);

router
  .route("/recent-transactions")
  .get(recentTransactionsValidator(), validate, getRecentTransactions);

router
  .route("/budget-progress")
  .get(budgetProgressValidator(), validate, getBudgetProgress);

export default router;