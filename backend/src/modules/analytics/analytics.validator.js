import { query } from "express-validator";

import {
  MAX_MERCHANT_LIMIT,
  MAX_RECENT_TRANSACTION_LIMIT,
  MAX_TREND_MONTHS,
} from "./analytics.constants.js";

const dateRangeValidator = () => [
  query("from")
    .optional()
    .isISO8601()
    .withMessage("Invalid from date"),

  query("to")
    .optional()
    .isISO8601()
    .withMessage("Invalid to date"),

  query("to").custom((to, { req }) => {
    if (req.query.from && to) {
      const fromDate = new Date(req.query.from);
      const toDate = new Date(to);

      if (toDate < fromDate) {
        throw new Error("To date must be after from date");
      }
    }

    return true;
  }),
];

const accountIdQueryValidator = () => [
  query("accountId")
    .optional()
    .isMongoId()
    .withMessage("Invalid account id"),
];

const dashboardAnalyticsValidator = () => [
  ...accountIdQueryValidator(),
  ...dateRangeValidator(),
];

const summaryValidator = () => [
  ...accountIdQueryValidator(),
  ...dateRangeValidator(),
];

const categoryBreakdownValidator = () => [
  ...accountIdQueryValidator(),
  ...dateRangeValidator(),
];

const monthlyTrendValidator = () => [
  ...accountIdQueryValidator(),

  query("months")
    .optional()
    .isInt({ min: 1, max: MAX_TREND_MONTHS })
    .withMessage(`Months must be between 1 and ${MAX_TREND_MONTHS}`)
    .toInt(),
];

const topMerchantsValidator = () => [
  ...accountIdQueryValidator(),
  ...dateRangeValidator(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: MAX_MERCHANT_LIMIT })
    .withMessage(`Limit must be between 1 and ${MAX_MERCHANT_LIMIT}`)
    .toInt(),
];

const accountSummaryValidator = () => [
  ...dateRangeValidator(),
];

const recentTransactionsValidator = () => [
  ...accountIdQueryValidator(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: MAX_RECENT_TRANSACTION_LIMIT })
    .withMessage(
      `Limit must be between 1 and ${MAX_RECENT_TRANSACTION_LIMIT}`
    )
    .toInt(),
];

export {
  dashboardAnalyticsValidator,
  summaryValidator,
  categoryBreakdownValidator,
  monthlyTrendValidator,
  topMerchantsValidator,
  accountSummaryValidator,
  recentTransactionsValidator,
};