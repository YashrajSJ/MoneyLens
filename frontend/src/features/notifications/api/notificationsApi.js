import { apiClient } from "../../../api/apiClient";
import { endpoints } from "../../../api/endpoints";

export const notificationsApi = {
  getNotifications: async (filters = {}) => {
    const response = await apiClient.get(endpoints.notifications.base, {
      params: filters,
    });

    return response.data.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get(endpoints.notifications.unreadCount);
    return response.data.data;
  },

  getPreferences: async () => {
    const response = await apiClient.get(endpoints.notifications.preferences);
    return response.data.data;
  },

  updatePreferences: async (payload) => {
    const response = await apiClient.patch(
      endpoints.notifications.preferences,
      payload,
    );

    return response.data.data;
  },

  markRead: async (notificationId) => {
    const response = await apiClient.patch(
      endpoints.notifications.markRead(notificationId),
    );

    return response.data.data;
  },

  markAllRead: async () => {
    const response = await apiClient.patch(endpoints.notifications.readAll);
    return response.data.data;
  },

  deleteNotification: async (notificationId) => {
    const response = await apiClient.delete(
      endpoints.notifications.byId(notificationId),
    );

    return response.data.data;
  },

  queueTestEmail: async () => {
    const response = await apiClient.post(endpoints.notifications.testEmail);
    return response.data.data;
  },

  queueMonthlyReport: async ({ month, year }) => {
    const response = await apiClient.post(endpoints.notifications.monthlyReport, {
      month,
      year,
    });

    return response.data.data;
  },
};