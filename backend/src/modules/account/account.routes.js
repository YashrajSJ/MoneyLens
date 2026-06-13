import { Router } from "express";

import {
  createAccount,
  deleteAccount,
  getAccountById,
  getAccounts,
  setDefaultAccount,
  updateAccount,
} from "./account.controller.js";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validator.middleware.js";

import {
  preventDefaultDeletion,
  preventAccountDeletionWithTransactions,
  preventAccountDeletionWithBudgets,
  resolveAccount,
  sanitizeBody,
} from "../../middlewares/account.middleware.js";

import {
  accountIdValidator,
  createAccountValidator,
  updateAccountValidator,
} from "./account.validator.js";

import { accountAllowedFields } from "./account.constants.js";

const router = Router();



router.use(verifyJWT);

router
  .route("/")
  .post(
    sanitizeBody(accountAllowedFields),
    createAccountValidator(),
    validate,
    createAccount,
  )
  .get(getAccounts);

router
  .route("/:accountId")
  .get(accountIdValidator(), validate, resolveAccount, getAccountById)
  .patch(
    accountIdValidator(),
    sanitizeBody(accountAllowedFields),
    updateAccountValidator(),
    validate,
    resolveAccount,
    updateAccount,
  )
  .delete(
    accountIdValidator(),
    validate,
    resolveAccount,
    preventDefaultDeletion,
    preventAccountDeletionWithTransactions,
    preventAccountDeletionWithBudgets,
    deleteAccount,
  );

router
  .route("/:accountId/default")
  .patch(accountIdValidator(), validate, resolveAccount, setDefaultAccount);

export default router;
