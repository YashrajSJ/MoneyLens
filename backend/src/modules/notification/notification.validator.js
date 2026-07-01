import { body, param, query } from "express-validator";

import {
  MAX_NOTIFICATION_LIMIT,
  NOTIFICATION_TYPE_VALUES,
} from "./notification.constants.js";

const getNotificationsValidator = () => [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be at least 1")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: MAX_NOTIFICATION_LIMIT })
    .withMessage(`Limit must be between 1 and ${MAX_NOTIFICATION_LIMIT}`)
    .toInt(),

  query("isRead")
    .optional()
    .isBoolean()
    .withMessage("isRead must be a boolean")
    .toBoolean(),

  query("type")
    .optional()
    .isIn(NOTIFICATION_TYPE_VALUES)
    .withMessage("Invalid notification type"),
];

const notificationIdValidator = () => [
  param("notificationId")
    .isMongoId()
    .withMessage("Invalid notification id"),
];

const updateNotificationPreferenceValidator = () => [
  body("emailEnabled")
    .optional()
    .isBoolean()
    .withMessage("emailEnabled must be a boolean")
    .toBoolean(),

  body("budgetAlerts")
    .optional()
    .isBoolean()
    .withMessage("budgetAlerts must be a boolean")
    .toBoolean(),

  body("monthlyReports")
    .optional()
    .isBoolean()
    .withMessage("monthlyReports must be a boolean")
    .toBoolean(),

  body("aiInsights")
    .optional()
    .isBoolean()
    .withMessage("aiInsights must be a boolean")
    .toBoolean(),
];

const monthlyReportValidator = () => [
  body("month")
    .isInt({ min: 1, max: 12 })
    .withMessage("Month must be between 1 and 12")
    .toInt(),

  body("year")
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Year must be valid")
    .toInt(),
];

export {
  getNotificationsValidator,
  notificationIdValidator,
  updateNotificationPreferenceValidator,
  monthlyReportValidator,
};