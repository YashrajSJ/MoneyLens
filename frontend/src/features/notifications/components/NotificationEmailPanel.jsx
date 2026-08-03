import { MailCheck, Send } from "lucide-react";
import { useState } from "react";

import {
  CURRENT_MONTH,
  CURRENT_YEAR,
  MONTH_OPTIONS,
  YEAR_OPTIONS,
} from "../constants/notificationConstants";

export const NotificationEmailPanel = ({
  onQueueTestEmail,
  onQueueMonthlyReport,
  isQueueingTestEmail,
  isQueueingMonthlyReport,
}) => {
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [year, setYear] = useState(CURRENT_YEAR);
  const selectedReportDate = new Date(year, month - 1, 1);
  const currentReportDate = new Date(CURRENT_YEAR, CURRENT_MONTH - 1, 1);
  const isFutureReportMonth = selectedReportDate > currentReportDate;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <MailCheck size={20} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            Email actions
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Queue a test email or send yourself a monthly finance report.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <button
          type="button"
          onClick={onQueueTestEmail}
          disabled={isQueueingTestEmail}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={16} />
          {isQueueingTestEmail ? "Queueing..." : "Send test email"}
        </button>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-medium text-slate-800">
            Monthly report email
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <select
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
            >
              {MONTH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
            >
              {YEAR_OPTIONS.map((yearOption) => (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              ))}
            </select>
          </div>

          {isFutureReportMonth && (
            <p className="mt-2 text-sm text-amber-700">
              Monthly reports can be queued only for the current or previous
              months.
            </p>
          )}

          <button
            type="button"
            onClick={() => onQueueMonthlyReport({ month, year })}
            disabled={isQueueingMonthlyReport || isFutureReportMonth}
            className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={16} />
            {isQueueingMonthlyReport ? "Queueing..." : "Queue monthly report"}
          </button>
        </div>
      </div>
    </section>
  );
};
