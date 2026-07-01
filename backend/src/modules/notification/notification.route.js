import { Router } from "express";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validator.middleware.js";

import {
  deleteNotification,
  getNotificationPreferences,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  queueMonthlyReportEmail,
  queueTestEmail,
  updateNotificationPreferences,
} from "./notification.controller.js";

import {
  getNotificationsValidator,
  monthlyReportValidator,
  notificationIdValidator,
  updateNotificationPreferenceValidator,
} from "./notification.validator.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/")
  .get(getNotificationsValidator(), validate, getNotifications);

router
  .route("/unread-count")
  .get(getUnreadNotificationCount);

router
  .route("/preferences")
  .get(getNotificationPreferences)
  .patch(
    updateNotificationPreferenceValidator(),
    validate,
    updateNotificationPreferences
  );

router
  .route("/read-all")
  .patch(markAllNotificationsRead);

router
  .route("/test-email")
  .post(queueTestEmail);

router
  .route("/monthly-report")
  .post(monthlyReportValidator(), validate, queueMonthlyReportEmail);

router
  .route("/:notificationId/read")
  .patch(notificationIdValidator(), validate, markNotificationRead);

router
  .route("/:notificationId")
  .delete(notificationIdValidator(), validate, deleteNotification);

export default router;