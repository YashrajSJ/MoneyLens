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
  resolveAccount,
  sanitizeBody,
} from "../../middlewares/account.middleware.js";

import {
  accountIdValidator,
  createAccountValidator,
  updateAccountValidator,
} from "./account.validator.js";

const router = Router();

const accountAllowedFields = [
  "name",
  "type",
  "balance",
  "isDefault",
  "institutionName",
  "color",
];

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
    deleteAccount,
  );

router
  .route("/:accountId/default")
  .patch(accountIdValidator(), validate, resolveAccount, setDefaultAccount);

export default router;
