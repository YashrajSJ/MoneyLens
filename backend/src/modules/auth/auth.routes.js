import { Router } from "express";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "./auth.controller.js";

import {
  userLoginValidator,
  userRegisterValidator,
} from "./auth.validator.js";

import { validate } from "../../middlewares/validator.middleware.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { authRateLimiter } from "../../middlewares/rateLimit.middleware.js";

const router = Router();

router.route("/register").post(authRateLimiter,userRegisterValidator(), validate, registerUser);

router.route("/login").post(authRateLimiter,userLoginValidator(), validate, loginUser);

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/current-user").get(verifyJWT, getCurrentUser);

export default router;