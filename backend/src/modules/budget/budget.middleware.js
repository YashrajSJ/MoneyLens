import { Budget } from "./budget.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const sanitizeBudgetBody = (allowedFields = []) => {
  return (req, res, next) => {
    const sanitizedBody = {};
    const body = req.body || {};

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        sanitizedBody[field] = body[field];
      }
    });

    req.body = sanitizedBody;
    next();
  };
};

const resolveBudget = asyncHandler(async (req, res, next) => {
  const budget = await Budget.findOne({
    _id: req.params.budgetId,
    userId: req.user._id,
  });

  if (!budget) {
    throw new ApiError(404, "Budget not found");
  }

  req.budget = budget;

  next();
});

export { sanitizeBudgetBody, resolveBudget };