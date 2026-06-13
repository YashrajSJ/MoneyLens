import { Router } from "express";

import {
  createBudget,
  deleteBudget,
  getBudgetById,
  getBudgets,
  getCurrentBudget,
  updateBudget,
} from "./budget.controller.js";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validator.middleware.js";

import {
  resolveBudget,
  sanitizeBudgetBody,
} from "./budget.middleware.js";

import {
  budgetIdValidator,
  createBudgetValidator,
  getBudgetsValidator,
  getCurrentBudgetValidator,
  updateBudgetValidator,
} from "./budget.validator.js";

import {createBudgetAllowedFields, updateBudgetAllowedFields} from "./budget.constants.js";

const router = Router();


router.use(verifyJWT);

router
  .route("/")
  .post(
    sanitizeBudgetBody(createBudgetAllowedFields),
    createBudgetValidator(),
    validate,
    createBudget
  )
  .get(getBudgetsValidator(), validate, getBudgets);

router
  .route("/current")
  .get(getCurrentBudgetValidator(), validate, getCurrentBudget);

router
  .route("/:budgetId")
  .get(budgetIdValidator(), validate, resolveBudget, getBudgetById)
  .patch(
    budgetIdValidator(),
    sanitizeBudgetBody(updateBudgetAllowedFields),
    updateBudgetValidator(),
    validate,
    resolveBudget,
    updateBudget
  )
  .delete(budgetIdValidator(), validate, resolveBudget, deleteBudget);

export default router;