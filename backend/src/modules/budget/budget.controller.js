import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { logger } from "../../utils/logger.js";

import {
  createBudgetService,
  deleteBudgetService,
  getBudgetByIdService,
  getBudgetsService,
  getCurrentBudgetService,
  updateBudgetService,
} from "./budget.service.js";

const createBudget = asyncHandler(async (req, res) => {
  const budget = await createBudgetService({
    userId: req.user._id,
    payload: req.body,
  });

  logger.info(
    {
      userId: req.user._id,
      budgetId: budget._id,
      accountId: budget.accountId,
    },
    "Budget created"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, { budget }, "Budget created successfully"));
});

const getBudgets = asyncHandler(async (req, res) => {
  const budgets = await getBudgetsService({
    userId: req.user._id,
    query: req.query,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { budgets }, "Budgets fetched successfully"));
});

const getCurrentBudget = asyncHandler(async (req, res) => {
  const now = new Date();

  const month = Number(req.query.month) || now.getUTCMonth() + 1;
  const year = Number(req.query.year) || now.getUTCFullYear();

  const result = await getCurrentBudgetService({
    userId: req.user._id,
    accountId: req.query.accountId,
    month,
    year,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Current budget fetched successfully"));
});

const getBudgetById = asyncHandler(async (req, res) => {
  const result = await getBudgetByIdService({
    userId: req.user._id,
    budget: req.budget,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Budget fetched successfully"));
});

const updateBudget = asyncHandler(async (req, res) => {
  const budget = await updateBudgetService({
    budget: req.budget,
    payload: req.body,
  });

  logger.info(
    {
      userId: req.user._id,
      budgetId: budget._id,
      accountId: budget.accountId,
    },
    "Budget updated"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { budget }, "Budget updated successfully"));
});

const deleteBudget = asyncHandler(async (req, res) => {
  await deleteBudgetService({
    userId: req.user._id,
    budget: req.budget,
  });

  logger.info(
    {
      userId: req.user._id,
      budgetId: req.budget._id,
      accountId: req.budget.accountId,
    },
    "Budget deleted"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Budget deleted successfully"));
});

export {
  createBudget,
  getBudgets,
  getCurrentBudget,
  getBudgetById,
  updateBudget,
  deleteBudget,
};