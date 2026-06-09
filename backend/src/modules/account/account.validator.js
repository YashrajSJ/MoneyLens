import { body, param } from "express-validator";
import {
  ACCOUNT_TYPES,
  MAX_ACCOUNT_BALANCE,
} from "./account.constants.js";

const createAccountValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Account name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Account name must be between 2 and 50 characters"),

    body("type")
      .notEmpty()
      .withMessage("Account type is required")
      .isIn(ACCOUNT_TYPES)
      .withMessage("Invalid account type"),

    body("balance")
      .optional()
      .isFloat({ min: 0, max: MAX_ACCOUNT_BALANCE })
      .withMessage(`Balance must be between 0 and ${MAX_ACCOUNT_BALANCE}`)
      .toFloat(),

    body("isDefault")
      .optional()
      .isBoolean()
      .withMessage("isDefault must be true or false")
      .toBoolean(),

    body("institutionName").optional().trim(),

    body("color")
      .optional()
      .trim()
      .matches(/^#([0-9A-F]{3}){1,2}$/i)
      .withMessage("Color must be a valid hex color"),
  ];
};

const updateAccountValidator = () => {
  return [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Account name must be between 2 and 50 characters"),

    body("type")
      .optional()
      .isIn(ACCOUNT_TYPES)
      .withMessage("Invalid account type"),

    body("balance")
      .optional()
      .isFloat({ min: 0, max: MAX_ACCOUNT_BALANCE })
      .withMessage(`Balance must be between 0 and ${MAX_ACCOUNT_BALANCE}`)
      .toFloat(),

    body("isDefault")
      .optional()
      .isBoolean()
      .withMessage("isDefault must be true or false")
      .toBoolean(),

    body("institutionName").optional().trim(),

    body("color")
      .optional()
      .trim()
      .matches(/^#([0-9A-F]{3}){1,2}$/i)
      .withMessage("Color must be a valid hex color"),
  ];
};

const accountIdValidator = () => {
  return [param("accountId").isMongoId().withMessage("Invalid account id")];
};

export { createAccountValidator, updateAccountValidator, accountIdValidator };
