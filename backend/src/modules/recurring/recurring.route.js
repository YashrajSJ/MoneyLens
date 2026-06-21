import { Router } from "express";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validator.middleware.js";

import {
  getDueRecurringTransactions,
  getRecurringTransactions,
  pauseRecurringTransaction,
  processDueRecurringTransactions,
  processRecurringTransaction,
  resumeRecurringTransaction,
} from "./recurring.controller.js";

import {
  dueRecurringTransactionsValidator,
  getRecurringTransactionsValidator,
  processRecurringTransactionValidator,
  transactionIdValidator,
} from "./recurring.validator.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/")
  .get(getRecurringTransactionsValidator(), validate, getRecurringTransactions);

router
  .route("/due")
  .get(dueRecurringTransactionsValidator(), validate, getDueRecurringTransactions);

router
  .route("/process-due")
  .post(dueRecurringTransactionsValidator(), validate, processDueRecurringTransactions);

router
  .route("/:transactionId/process")
  .post(processRecurringTransactionValidator(), validate, processRecurringTransaction);

router
  .route("/:transactionId/pause")
  .patch(transactionIdValidator(), validate, pauseRecurringTransaction);

router
  .route("/:transactionId/resume")
  .patch(transactionIdValidator(), validate, resumeRecurringTransaction);

export default router;