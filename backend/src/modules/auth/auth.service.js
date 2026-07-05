import crypto from "crypto";
import jwt from "jsonwebtoken";

import { redisConnection } from "../../db/redis.js";
import { ApiError } from "../../utils/ApiError.js";
import { logger } from "../../utils/logger.js";
import { queueEmailDeliveryService } from "../notification/email.service.js";
import {
  generateEmailVerificationTemplate,
  generatePasswordResetTemplate,
} from "../notification/email.template.js";
import { EMAIL_TYPES } from "../notification/notification.constants.js";

import { User } from "./user.model.js";

const USER_SAFE_SELECT =
  "-password -refreshToken -emailVerificationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry";

const PASSWORD_RESET_TOKEN_EXPIRY_SECONDS = 15 * 60;
const PASSWORD_RESET_GENERIC_MESSAGE =
  "If an account with this email exists, a password reset link has been sent";

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const getPasswordResetKey = (hashedToken) => {
  return `auth:password-reset:${hashedToken}`;
};

const getUserPasswordResetKey = (userId) => {
  return `auth:password-reset-user:${userId}`;
};

const getFrontendUrl = () => {
  return (
    process.env.FRONTEND_URL ||
    process.env.CORS_ORIGIN?.split(",")[0] ||
    "http://localhost:5173"
  ).replace(/\/$/, "");
};

const getFrontendResetPasswordUrl = (token) => {
  return `${getFrontendUrl()}/reset-password?token=${token}`;
};

const getFrontendVerifyEmailUrl = (token) => {
  return `${getFrontendUrl()}/verify-email?token=${token}`;
};

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const queueEmailVerificationService = async ({ user }) => {
  const { unhashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  const verificationUrl = getFrontendVerifyEmailUrl(unhashedToken);

  const emailTemplate = generateEmailVerificationTemplate({
    name: user.fullName || user.username,
    verificationUrl,
    token: unhashedToken,
    expiresInMinutes: 20,
  });

  await queueEmailDeliveryService({
    userId: user._id,
    to: user.email,
    subject: emailTemplate.subject,
    html: emailTemplate.html,
    text: emailTemplate.text,
    type: EMAIL_TYPES.EMAIL_VERIFICATION,
    metadata: {
      purpose: "EMAIL_VERIFICATION",
    },
  });

  logger.info({ userId: user._id }, "Email verification queued");
};

const registerUserService = async ({ body }) => {
  const normalizedEmail = body.email.trim().toLowerCase();
  const normalizedUsername = body.username.trim().toLowerCase();

  const existedUser = await User.findOne({
    $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  let user;

  try {
    user = await User.create({
      email: normalizedEmail,
      username: normalizedUsername,
      password: body.password,
      fullName: body.fullName,
      currency: body.currency,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "User with email or username already exists");
    }

    throw error;
  }

  try {
    await queueEmailVerificationService({ user });
  } catch (error) {
    logger.error(
      { err: error, userId: user._id },
      "Email verification queueing failed",
    );
  }

  const createdUser = await User.findById(user._id).select(USER_SAFE_SELECT);

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return { user: createdUser };
};

const loginUserService = async ({ body }) => {
  const normalizedEmail = body.email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new ApiError(400, "Invalid credentials");
  }

  const isPasswordValid = await user.isPasswordCorrect(body.password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(USER_SAFE_SELECT);

  return {
    user: loggedInUser,
    accessToken,
    refreshToken,
  };
};

const forgotPasswordService = async ({ body }) => {
  const normalizedEmail = body.email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return { message: PASSWORD_RESET_GENERIC_MESSAGE };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashToken(resetToken);

  const resetKey = getPasswordResetKey(hashedToken);
  const userResetKey = getUserPasswordResetKey(user._id);

  const previousHashedToken = await redisConnection.get(userResetKey);

  if (previousHashedToken) {
    await redisConnection.del(getPasswordResetKey(previousHashedToken));
  }

  await redisConnection.set(
    resetKey,
    String(user._id),
    "EX",
    PASSWORD_RESET_TOKEN_EXPIRY_SECONDS,
  );

  await redisConnection.set(
    userResetKey,
    hashedToken,
    "EX",
    PASSWORD_RESET_TOKEN_EXPIRY_SECONDS,
  );

  const resetUrl = getFrontendResetPasswordUrl(resetToken);

  const emailTemplate = generatePasswordResetTemplate({
    name: user.fullName || user.username,
    resetUrl,
    token: resetToken,
    expiresInMinutes: PASSWORD_RESET_TOKEN_EXPIRY_SECONDS / 60,
  });

  try {
    await queueEmailDeliveryService({
      userId: user._id,
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      type: EMAIL_TYPES.PASSWORD_RESET,
      metadata: {
        purpose: "PASSWORD_RESET",
      },
    });

    logger.info({ userId: user._id }, "Password reset email queued");
  } catch (error) {
    await redisConnection.del(resetKey);
    await redisConnection.del(userResetKey);

    logger.error(
      { err: error, userId: user._id },
      "Password reset email queueing failed",
    );

    throw new ApiError(500, "Unable to send password reset email");
  }

  return { message: PASSWORD_RESET_GENERIC_MESSAGE };
};

const resetPasswordService = async ({ body }) => {
  const { token, newPassword } = body;

  const hashedToken = hashToken(token);
  const resetKey = getPasswordResetKey(hashedToken);

  const userId = await redisConnection.get(resetKey);

  if (!userId) {
    throw new ApiError(400, "Password reset token is invalid or expired");
  }

  const userResetKey = getUserPasswordResetKey(userId);
  const latestHashedToken = await redisConnection.get(userResetKey);

  if (latestHashedToken !== hashedToken) {
    await redisConnection.del(resetKey);
    throw new ApiError(400, "Password reset token is invalid or expired");
  }

  const user = await User.findById(userId);

  if (!user) {
    await redisConnection.del(resetKey);
    await redisConnection.del(userResetKey);
    throw new ApiError(400, "Password reset token is invalid or expired");
  }

  const isSamePassword = await user.isPasswordCorrect(newPassword);

  if (isSamePassword) {
    throw new ApiError(400, "New password must be different from old password");
  }

  user.password = newPassword;
  user.refreshToken = undefined;

  await user.save();

  await redisConnection.del(resetKey);
  await redisConnection.del(userResetKey);

  logger.info({ userId: user._id }, "Password reset successfully");
};

const verifyEmailService = async ({ body }) => {
  const hashedToken = hashToken(body.token);

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Email verification token is invalid or expired");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;

  await user.save({ validateBeforeSave: false });

  logger.info({ userId: user._id }, "Email verified successfully");
};

const resendEmailVerificationService = async ({ userId }) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isEmailVerified) {
    throw new ApiError(409, "Email is already verified");
  }

  await queueEmailVerificationService({ user });
};

const logoutUserService = async ({ userId }) => {
  await User.findByIdAndUpdate(
    userId,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    },
  );
};

const refreshAccessTokenService = async ({ incomingRefreshToken }) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or already used");
    }

    return await generateAccessAndRefreshTokens(user._id);
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
};

export {
  registerUserService,
  loginUserService,
  forgotPasswordService,
  resetPasswordService,
  verifyEmailService,
  resendEmailVerificationService,
  logoutUserService,
  refreshAccessTokenService,
};