import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  forgotPasswordService,
  loginUserService,
  logoutUserService,
  refreshAccessTokenService,
  registerUserService,
  resendEmailVerificationService,
  resetPasswordService,
  verifyEmailService,
} from "./auth.service.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

const registerUser = asyncHandler(async (req, res) => {
  const result = await registerUserService({ body: req.body });

  return res
    .status(201)
    .json(new ApiResponse(201, result, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const result = await loginUserService({ body: req.body });

  return res
    .status(200)
    .cookie("accessToken", result.accessToken, cookieOptions)
    .cookie("refreshToken", result.refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: result.user },
        "User logged in successfully",
      ),
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await forgotPasswordService({ body: req.body });

  return res.status(200).json(new ApiResponse(200, {}, result.message));
});

const resetPassword = asyncHandler(async (req, res) => {
  await resetPasswordService({ body: req.body });

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  await verifyEmailService({ body: req.body });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email verified successfully"));
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  await resendEmailVerificationService({ userId: req.user._id });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Verification email sent successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  await logoutUserService({ userId: req.user._id });

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {

  const user = await getCurrentUserService({ userId: req.user._id });
  
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Current user fetched successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  const result = await refreshAccessTokenService({ incomingRefreshToken });

  return res
    .status(200)
    .cookie("accessToken", result.accessToken, cookieOptions)
    .cookie("refreshToken", result.refreshToken, cookieOptions)
    .json(new ApiResponse(200, {}, "Access token refreshed successfully"));
});

export {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendEmailVerification,
  logoutUser,
  getCurrentUser,
  refreshAccessToken,
};