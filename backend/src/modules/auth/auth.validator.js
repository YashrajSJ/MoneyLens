import { body } from "express-validator";

const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),

    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .isLowercase()
      .withMessage("Username must be lowercase"),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),

    body("fullName").optional().trim(),

    body("currency")
      .optional()
      .trim()
      .isLength({ min: 3, max: 3 })
      .withMessage("Currency must be a 3-letter code like USD or INR"),
  ];
};

const userLoginValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),

    body("password").notEmpty().withMessage("Password is required"),
  ];
};

const forgotPasswordValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
  ];
};

const resetPasswordValidator = () => {
  return [
    body("token")
      .trim()
      .notEmpty()
      .withMessage("Reset token is required"),

    body("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters long"),
  ];
};

const verifyEmailValidator = () => {
  return [
    body("token")
      .trim()
      .notEmpty()
      .withMessage("Email verification token is required"),
  ];
};

export {
  userRegisterValidator,
  userLoginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailValidator,
};