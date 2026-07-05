import { Router } from "express";

import {
  forgotPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetPassword,
  verifyEmail,
} from "./auth.controller.js";

import {
  forgotPasswordValidator,
  resetPasswordValidator,
  userLoginValidator,
  userRegisterValidator,
  verifyEmailValidator,
} from "./auth.validator.js";

import { validate } from "../../middlewares/validator.middleware.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import {
  authRateLimiter,
  emailRateLimiter,
} from "../../middlewares/rateLimit.middleware.js";

const router = Router();

router
  .route("/register")
  .post(authRateLimiter, userRegisterValidator(), validate, registerUser);

router
  .route("/login")
  .post(authRateLimiter, userLoginValidator(), validate, loginUser);

router
  .route("/forgot-password")
  .post(authRateLimiter, forgotPasswordValidator(), validate, forgotPassword);

router
  .route("/reset-password")
  .post(authRateLimiter, resetPasswordValidator(), validate, resetPassword);

router
  .route("/verify-email")
  .post(authRateLimiter, verifyEmailValidator(), validate, verifyEmail);

router
  .route("/resend-email-verification")
  .post(verifyJWT, emailRateLimiter, resendEmailVerification);

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(authRateLimiter, refreshAccessToken);

router.route("/current-user").get(verifyJWT, getCurrentUser);

export default router;