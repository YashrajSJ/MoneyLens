import { useMemo, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";

import { NotificationCard } from "../features/notifications/components/NotificationCard";
import { NotificationEmailPanel } from "../features/notifications/components/NotificationEmailPanel";
import { NotificationFilters } from "../features/notifications/components/NotificationFilters";
import { NotificationPreferencesPanel } from "../features/notifications/components/NotificationPreferencesPanel";
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationPreferences,
  useNotifications,
  useQueueMonthlyReport,
  useQueueTestEmail,
  useUnreadNotificationCount,
  useUpdateNotificationPreferences,
} from "../features/notifications/hooks/useNotifications";

const initialFilters = {
  type: "",
  isRead: "",
  page: 1,
  limit: 10,
};

const cleanFilters = (filters) => {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== "" && value !== null,
    ),
  );
};

export const NotificationsPage = () => {
  const [filters, setFilters] = useState(initialFilters);

  const queryFilters = useMemo(() => cleanFilters(filters), [filters]);

  const { data, isLoading, isError, refetch } = useNotifications(queryFilters);
  const { data: unreadData } = useUnreadNotificationCount();
  const { data: preferenceData, isLoading: preferencesLoading } =
    useNotificationPreferences();

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const deleteMutation = useDeleteNotification();
  const updatePreferencesMutation = useUpdateNotificationPreferences();
  const queueTestEmailMutation = useQueueTestEmail();
  const queueMonthlyReportMutation = useQueueMonthlyReport();

  const notifications = data?.notifications || [];
  const pagination = data?.pagination;
  const unreadCount = unreadData?.unreadCount || 0;
  const preferences = preferenceData?.preferences;

  const handleDelete = (notification) => {
    const confirmed = window.confirm(
      `Delete "${notification.title}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    deleteMutation.mutate(notification._id, {
      onSuccess: () => {
        if (notifications.length === 1 && filters.page > 1) {
          setFilters((currentFilters) => ({
            ...currentFilters,
            page: currentFilters.page - 1,
          }));
        }
      },
    });
  };

  const goToPage = (page) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      page,
    }));
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 text-center shadow-sm backdrop-blur">
        <p className="text-sm font-medium text-slate-700">
          Loading notifications...
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Fetching alerts, reports, and email activity.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white/90 p-8 text-center shadow-sm backdrop-blur">
        <p className="text-sm font-semibold text-red-600">
          Could not load notifications
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Please retry once. If the issue continues, check your session.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur md:p-6">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-100/70 blur-3xl" />
        <div className="absolute bottom-0 right-24 h-24 w-24 rounded-full bg-cyan-100/70 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                Notification center
              </span>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {unreadCount} unread
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              Notifications
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
              Review budget alerts, monthly reports, AI insight updates, and
              email delivery activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => markAllReadMutation.mutate()}
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-3.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCheck size={17} />
            Mark all read
          </button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <NotificationFilters
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(initialFilters)}
          />

          {notifications.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white/90 p-10 text-center shadow-sm backdrop-blur">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Bell size={26} />
              </div>

              <h2 className="mt-4 text-xl font-semibold text-slate-950">
                No notifications found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Budget alerts, monthly reports, and email updates will appear
                here.
              </p>
            </section>
          ) : (
            <section className="space-y-3">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification._id}
                  notification={notification}
                  onMarkRead={(notificationId) =>
                    markReadMutation.mutate(notificationId)
                  }
                  onDelete={handleDelete}
                  isMarkingRead={
                    markReadMutation.isPending &&
                    markReadMutation.variables === notification._id
                  }
                  isDeleting={
                    deleteMutation.isPending &&
                    deleteMutation.variables === notification._id
                  }
                />
              ))}
            </section>
          )}

          {pagination?.totalPages > 1 && (
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm text-slate-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => goToPage(pagination.page - 1)}
                className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => goToPage(pagination.page + 1)}
                className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <NotificationEmailPanel
            onQueueTestEmail={() => queueTestEmailMutation.mutate()}
            onQueueMonthlyReport={(payload) =>
              queueMonthlyReportMutation.mutate(payload)
            }
            isQueueingTestEmail={queueTestEmailMutation.isPending}
            isQueueingMonthlyReport={queueMonthlyReportMutation.isPending}
          />

          {preferencesLoading ? (
            <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 text-sm text-slate-500 shadow-sm backdrop-blur">
              Loading preferences...
            </section>
          ) : (
            <NotificationPreferencesPanel
              preferences={preferences}
              onToggle={(payload) => updatePreferencesMutation.mutate(payload)}
              isUpdating={updatePreferencesMutation.isPending}
            />
          )}
        </aside>
      </section>
    </div>
  );
};
