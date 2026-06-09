import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { logger } from "../../utils/logger.js";

import {
  createAccountService,
  deleteAccountService,
  getAccountsService,
  setDefaultAccountService,
  updateAccountService,
} from "./account.service.js";

const createAccount = asyncHandler(async (req, res) => {
  const account = await createAccountService({
    userId: req.user._id,
    payload: req.body,
  });

  logger.info("Account created");

  return res
    .status(201)
    .json(new ApiResponse(201, { account }, "Account created successfully"));
});

const getAccounts = asyncHandler(async (req, res) => {
  const accounts = await getAccountsService({
    userId: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { accounts }, "Accounts fetched successfully"));
});

const getAccountById = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { account: req.account },
        "Account fetched successfully"
      )
    );
});

const updateAccount = asyncHandler(async (req, res) => {
  const account = await updateAccountService({
    userId: req.user._id,
    account: req.account,
    payload: req.body,
  });

  logger.info("Account updated");

  return res
    .status(200)
    .json(new ApiResponse(200, { account }, "Account updated successfully"));
});

const setDefaultAccount = asyncHandler(async (req, res) => {
  const account = await setDefaultAccountService({
    userId: req.user._id,
    account: req.account,
  });

  logger.info( "Default account updated");

  return res
    .status(200)
    .json(new ApiResponse(200, { account }, "Default account updated"));
});

const deleteAccount = asyncHandler(async (req, res) => {
  await deleteAccountService({
    userId: req.user._id,
    account: req.account,
    requestId: req.requestId,
  });

  logger.info( "Account deleted");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Account deleted successfully"));
});

export {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  setDefaultAccount,
  deleteAccount,
};