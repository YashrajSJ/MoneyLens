import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  deleteNotificationService,
  getNotificationPreferenceService,
  getNotificationsService,
  getUnreadNotificationCountService,
  markAllNotificationsReadService,
  markNotificationReadService,
  queueMonthlyReportEmailService,
  queueTestEmailService,
  updateNotificationPreferenceService,
} from "./notification.service.js";

const getNotifications = asyncHandler(async (req, res) => {
  const result = await getNotificationsService({
    userId: req.user._id,
    query: req.query,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Notifications fetched successfully"));
});

const getUnreadNotificationCount = asyncHandler(async (req, res) => {
  const result = await getUnreadNotificationCountService({
    userId: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Unread notification count fetched"));
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await markNotificationReadService({
    userId: req.user._id,
    notificationId: req.params.notificationId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { notification }, "Notification marked as read"));
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await markAllNotificationsReadService({
    userId: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "All notifications marked as read"));
});

const deleteNotification = asyncHandler(async (req, res) => {
  await deleteNotificationService({
    userId: req.user._id,
    notificationId: req.params.notificationId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Notification deleted successfully"));
});

const getNotificationPreferences = asyncHandler(async (req, res) => {
  const preferences = await getNotificationPreferenceService({
    userId: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { preferences }, "Preferences fetched"));
});

const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const preferences = await updateNotificationPreferenceService({
    userId: req.user._id,
    body: req.body,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { preferences }, "Preferences updated"));
});

const queueTestEmail = asyncHandler(async (req, res) => {
  const result = await queueTestEmailService({
    user: req.user,
  });

  return res
    .status(202)
    .json(new ApiResponse(202, result, "Test email queued successfully"));
});

const queueMonthlyReportEmail = asyncHandler(async (req, res) => {
  const result = await queueMonthlyReportEmailService({
    user: req.user,
    month: req.body.month,
    year: req.body.year,
  });

  return res
    .status(202)
    .json(new ApiResponse(202, result, "Monthly report email queued"));
});

export {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  queueTestEmail,
  queueMonthlyReportEmail,
};