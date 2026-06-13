import { body, param, query } from "express-validator";

import {
  MAX_BUDGET_ALERT_THRESHOLD,
  MAX_BUDGET_AMOUNT,
  MIN_BUDGET_ALERT_THRESHOLD,
} from "./budget.constants.js";

const createBudgetValidator = () => [
  body("accountId")
    .notEmpty()
    .withMessage("Account id is required")
    .isMongoId()
    .withMessage("Invalid account id"),

  body("month")
    .notEmpty()
    .withMessage("Month is required")
    .isInt({ min: 1, max: 12 })
    .withMessage("Month must be between 1 and 12")
    .toInt(),

  body("year")
    .notEmpty()
    .withMessage("Year is required")
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Invalid budget year")
    .toInt(),

  body("amount")
    .notEmpty()
    .withMessage("Budget amount is required")
    .isFloat({ min: 0.01, max: MAX_BUDGET_AMOUNT })
    .withMessage(`Budget amount must be between 0.01 and ${MAX_BUDGET_AMOUNT}`)
    .toFloat(),

  body("alertThreshold")
    .optional()
    .isFloat({
      min: MIN_BUDGET_ALERT_THRESHOLD,
      max: MAX_BUDGET_ALERT_THRESHOLD,
    })
    .withMessage("Alert threshold must be between 1 and 100")
    .toFloat(),
];

const updateBudgetValidator = () => [
  body("amount")
    .optional()
    .isFloat({ min: 0.01, max: MAX_BUDGET_AMOUNT })
    .withMessage(`Budget amount must be between 0.01 and ${MAX_BUDGET_AMOUNT}`)
    .toFloat(),

  body("alertThreshold")
    .optional()
    .isFloat({
      min: MIN_BUDGET_ALERT_THRESHOLD,
      max: MAX_BUDGET_ALERT_THRESHOLD,
    })
    .withMessage("Alert threshold must be between 1 and 100")
    .toFloat(),
];

const budgetIdValidator = () => [
  param("budgetId").isMongoId().withMessage("Invalid budget id"),
];

const getBudgetsValidator = () => [
  query("accountId")
    .optional()
    .isMongoId()
    .withMessage("Invalid account id"),

  query("month")
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage("Month must be between 1 and 12")
    .toInt(),

  query("year")
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Invalid budget year")
    .toInt(),
];

const getCurrentBudgetValidator = () => [
  query("accountId")
    .notEmpty()
    .withMessage("Account id is required")
    .isMongoId()
    .withMessage("Invalid account id"),

  query("month")
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage("Month must be between 1 and 12")
    .toInt(),

  query("year")
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Invalid budget year")
    .toInt(),
];

export {
  createBudgetValidator,
  updateBudgetValidator,
  budgetIdValidator,
  getBudgetsValidator,
  getCurrentBudgetValidator,
};