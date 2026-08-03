import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "../../../constants/queryKeys";
import { notificationsApi } from "../api/notificationsApi";

const invalidateNotificationList = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ["notifications"] });
  queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotifications });
};

const invalidateNotificationPreferences = (queryClient) => {
  queryClient.invalidateQueries({
    queryKey: queryKeys.notificationPreferences,
  });
};

export const useNotifications = (filters) => {
  return useQuery({
    queryKey: queryKeys.notifications(filters),
    queryFn: () => notificationsApi.getNotifications(filters),
    placeholderData: keepPreviousData,
  });
};

export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: queryKeys.unreadNotifications,
    queryFn: notificationsApi.getUnreadCount,
  });
};

export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: queryKeys.notificationPreferences,
    queryFn: notificationsApi.getPreferences,
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.updatePreferences,
    onSuccess: () => {
      invalidateNotificationPreferences(queryClient);
      toast.success("Notification preferences updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update preferences");
    },
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => {
      invalidateNotificationList(queryClient);
      toast.success("Notification marked as read");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to mark notification as read");
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      invalidateNotificationList(queryClient);
      toast.success("Notification marked as read");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to mark notifications as read");
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.deleteNotification,
    onSuccess: () => {
      invalidateNotificationList(queryClient);
      toast.success("Notification marked as read");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete notification");
    },
  });
};

export const useQueueTestEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.queueTestEmail,
    onSuccess: () => {
      invalidateNotificationList(queryClient);
      toast.success("Test email queued");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to queue test email");
    },
  });
};

export const useQueueMonthlyReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.queueMonthlyReport,
    onSuccess: () => {
      invalidateNotificationList(queryClient);
      toast.success("Monthly report email queued");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to queue monthly report");
    },
  });
};
