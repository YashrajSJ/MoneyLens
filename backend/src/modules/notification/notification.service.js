import { User } from "../auth/user.model.js";
import { getDashboardAnalyticsService } from "../analytics/analytics.service.js";

import { ApiError } from "../../utils/ApiError.js";
import { logger } from "../../utils/logger.js";

import { Notification } from "./notification.model.js";
import { NotificationPreference } from "./notificationPreference.model.js";

import {
  DEFAULT_NOTIFICATION_LIMIT,
  DEFAULT_NOTIFICATION_PAGE,
  EMAIL_TYPES,
  MAX_NOTIFICATION_LIMIT,
  NOTIFICATION_TYPES,
} from "./notification.constants.js";

import {
  generateBudgetAlertTemplate,
  generateMonthlyReportTemplate,
  generateTestEmailTemplate,
} from "./email.template.js";

import { queueEmailDeliveryService } from "./email.service.js";

const getSafePagination = (query) => {
  const page = Number(query.page) || DEFAULT_NOTIFICATION_PAGE;
  const limit = Math.min(
    Number(query.limit) || DEFAULT_NOTIFICATION_LIMIT,
    MAX_NOTIFICATION_LIMIT,
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const getNotificationPreferenceService = async ({ userId }) => {
  return await NotificationPreference.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        emailEnabled: true,
        budgetAlerts: true,
        monthlyReports: true,
        aiInsights: true,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  ).lean();
};

const updateNotificationPreferenceService = async ({ userId, body }) => {
  const allowedFields = [
    "emailEnabled",
    "budgetAlerts",
    "monthlyReports",
    "aiInsights",
  ];

  const update = {};

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      update[field] = body[field];
    }

    if (Object.keys(update).length === 0) {
      throw new ApiError(400, "At least one preference field is required");
    }
  });

  return await NotificationPreference.findOneAndUpdate(
    { userId },
    {
      $set: update,
      $setOnInsert: {
        userId,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  ).lean();
};

const createNotificationService = async ({
  userId,
  type,
  title,
  message,
  metadata = {},
  dedupeKey,
}) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      metadata,
      dedupeKey,
    });

    return {
      notification,
      created: true,
    };
  } catch (error) {
    if (error.code === 11000 && dedupeKey) {
      const existingNotification = await Notification.findOne({
        userId,
        dedupeKey,
      }).lean();

      return {
        notification: existingNotification,
        created: false,
      };
    }

    throw error;
  }
};

const getNotificationsService = async ({ userId, query }) => {
  const { page, limit, skip } = getSafePagination(query);

  const filter = {
    userId,
  };

  if (query.isRead !== undefined) {
    filter.isRead = query.isRead;
  }

  if (query.type) {
    filter.type = query.type;
  }

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Notification.countDocuments(filter),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getUnreadNotificationCountService = async ({ userId }) => {
  const unreadCount = await Notification.countDocuments({
    userId,
    isRead: false,
  });

  return {
    unreadCount,
  };
};

const markNotificationReadService = async ({ userId, notificationId }) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      userId,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
    {
      new: true,
    },
  ).lean();

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return notification;
};

const markAllNotificationsReadService = async ({ userId }) => {
  const result = await Notification.updateMany(
    {
      userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
  );

  return {
    modifiedCount: result.modifiedCount,
  };
};

const deleteNotificationService = async ({ userId, notificationId }) => {
  const result = await Notification.deleteOne({
    _id: notificationId,
    userId,
  });

  if (result.deletedCount === 0) {
    throw new ApiError(404, "Notification not found");
  }

  return {};
};

const queueTestEmailService = async ({ user }) => {
  if (!user.email) {
    throw new ApiError(400, "User email not found");
  }

  const preferences = await getNotificationPreferenceService({
    userId: user._id,
  });

  if (!preferences.emailEnabled) {
    throw new ApiError(400, "Email notifications are disabled");
  }

  const { notification } = await createNotificationService({
    userId: user._id,
    type: NOTIFICATION_TYPES.TEST_EMAIL,
    title: "Test email queued",
    message: "A test email has been queued for delivery.",
    metadata: {
      purpose: "SMTP_TEST",
    },
  });

  const template = generateTestEmailTemplate({
    name: user.fullName || user.username,
  });

  const email = await queueEmailDeliveryService({
    userId: user._id,
    to: user.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
    type: EMAIL_TYPES.TEST_EMAIL,
    metadata: {
      notificationId: notification._id,
    },
  });

  logger.info(
    {
      userId: user._id,
      notificationId: notification._id,
      emailLogId: email.emailLogId,
    },
    "Test email queued",
  );

  return {
    notification,
    email,
  };
};

const buildMonthRange = ({ month, year }) => {
  const safeMonth = String(month).padStart(2, "0");
  const from = `${year}-${safeMonth}-01`;

  const endDate = new Date(Date.UTC(year, month, 0));
  const to = endDate.toISOString().slice(0, 10);

  return {
    from,
    to,
  };
};

const queueMonthlyReportEmailService = async ({ user, month, year }) => {
  const preferences = await getNotificationPreferenceService({
    userId: user._id,
  });

  if (!preferences.emailEnabled || !preferences.monthlyReports) {
    throw new ApiError(400, "Monthly report emails are disabled");
  }

  const dedupeKey = `monthly-report:${user._id}:${year}:${month}`;

  const { notification, created } = await createNotificationService({
    userId: user._id,
    type: NOTIFICATION_TYPES.MONTHLY_REPORT,
    title: `Monthly report for ${month}/${year}`,
    message: "Your monthly financial report has been prepared.",
    dedupeKey,
    metadata: {
      month,
      year,
    },
  });

  if (!created) {
    throw new ApiError(409, "Monthly report already queued for this month");
  }

  if (!preferences.emailEnabled || !preferences.monthlyReports) {
    return {
      notification,
      emailQueued: false,
      reason: "Monthly report emails are disabled",
    };
  }

  const { from, to } = buildMonthRange({ month, year });

  const dashboard = await getDashboardAnalyticsService({
    userId: user._id,
    query: {
      from,
      to,
      month,
      year,
    },
  });

  const template = generateMonthlyReportTemplate({
    name: user.fullName || user.username,
    month,
    year,
    dashboard,
  });

  const email = await queueEmailDeliveryService({
    userId: user._id,
    to: user.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
    type: EMAIL_TYPES.MONTHLY_REPORT,
    dedupeKey,
    metadata: {
      notificationId: notification._id,
      month,
      year,
    },
  });

  logger.info(
    {
      userId: user._id,
      notificationId: notification._id,
      emailLogId: email.emailLogId,
      month,
      year,
    },
    "Monthly report email queued",
  );

  return {
    notification,
    emailQueued: true,
    email,
    dashboard,
  };
};

const createBudgetAlertNotificationService = async ({
  userId,
  budgetId,
  accountId,
  accountName,
  spentAmount,
  budgetAmount,
  percentageUsed,
  threshold,
  month,
  year,
}) => {
  const dedupeKey = `budget-alert:${budgetId}:${year}:${month}:threshold:${threshold}`;

  const { notification, created } = await createNotificationService({
    userId,
    type: NOTIFICATION_TYPES.BUDGET_ALERT,
    title: "Budget alert",
    message: `Your budget crossed ${threshold}% usage.`,
    dedupeKey,
    metadata: {
      budgetId,
      accountId,
      spentAmount,
      budgetAmount,
      percentageUsed,
      threshold,
      month,
      year,
    },
  });

  if (!created) {
    return {
      notification,
      emailQueued: false,
      duplicate: true,
    };
  }

  const preferences = await getNotificationPreferenceService({ userId });

  if (!preferences.emailEnabled || !preferences.budgetAlerts) {
    return {
      notification,
      emailQueued: false,
      reason: "Budget alert emails are disabled",
    };
  }

  const user = await User.findById(userId)
    .select("email fullName username")
    .lean();

  if (!user?.email) {
    return {
      notification,
      emailQueued: false,
      reason: "User email not found",
    };
  }

  const template = generateBudgetAlertTemplate({
    name: user.fullName || user.username,
    accountName,
    spentAmount,
    budgetAmount,
    percentageUsed,
    threshold,
  });

  const email = await queueEmailDeliveryService({
    userId,
    to: user.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
    type: EMAIL_TYPES.BUDGET_ALERT,
    dedupeKey,
    metadata: {
      notificationId: notification._id,
      budgetId,
      accountId,
      month,
      year,
    },
  });

  return {
    notification,
    emailQueued: true,
    email,
  };
};

export {
  getNotificationsService,
  getUnreadNotificationCountService,
  markNotificationReadService,
  markAllNotificationsReadService,
  deleteNotificationService,
  getNotificationPreferenceService,
  updateNotificationPreferenceService,
  queueTestEmailService,
  queueMonthlyReportEmailService,
  createBudgetAlertNotificationService,
  createNotificationService,
};
