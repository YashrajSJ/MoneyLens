import {
  Bell,
  BrainCircuit,
  Check,
  Mail,
  PiggyBank,
  Trash2,
} from "lucide-react";

import { formatDate } from "../../../utils/formatters";
import {
  getNotificationTypeClassName,
  getNotificationTypeLabel,
} from "../constants/notificationConstants";

const NotificationIcon = ({ type }) => {
  if (type === "BUDGET_ALERT") {
    return <PiggyBank size={19} />;
  }

  if (type === "MONTHLY_REPORT" || type === "TEST_EMAIL") {
    return <Mail size={19} />;
  }

  if (type === "AI_INSIGHT") {
    return <BrainCircuit size={19} />;
  }

  return <Bell size={19} />;
};

export const NotificationCard = ({
  notification,
  onMarkRead,
  onDelete,
  isMarkingRead,
  isDeleting,
}) => {
  const isUnread = !notification.isRead;

  return (
    <article
      className={
        isUnread
          ? "rounded-2xl border border-emerald-200 bg-white/95 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
          : "rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={
              isUnread
                ? "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"
                : "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"
            }
          >
            <NotificationIcon type={notification.type} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-950">
                {notification.title}
              </h3>

              {isUnread && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                  Unread
                </span>
              )}

              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${getNotificationTypeClassName(
                  notification.type,
                )}`}
              >
                {getNotificationTypeLabel(notification.type)}
              </span>
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {notification.message}
            </p>

            <p className="mt-3 text-xs text-slate-400">
              {formatDate(notification.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isUnread && (
            <button
              type="button"
              onClick={() => onMarkRead(notification._id)}
              disabled={isMarkingRead}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check size={15} />
              Read
            </button>
          )}

          <button
            type="button"
            onClick={() => onDelete(notification)}
            disabled={isDeleting}
            className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
};