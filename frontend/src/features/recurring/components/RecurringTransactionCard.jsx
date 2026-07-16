import {
  CalendarClock,
  History,
  Pause,
  Play,
  RefreshCcw,
  WalletCards,
} from "lucide-react";

import { formatCurrency, formatDate } from "../../../utils/formatters";
import { getCategoryLabel } from "../../transactions/constants/transactionConstants";
import {
  getRecurringIntervalLabel,
  getRecurringStatusClassName,
  getRecurringStatusLabel,
  isRecurringDue,
} from "../constants/recurringConstants";

export const RecurringTransactionCard = ({
  transaction,
  onPause,
  onResume,
  onProcess,
  onViewHistory,
  isMutating,
}) => {
  const isActive = transaction.recurringStatus === "ACTIVE";
  const isDue = isRecurringDue(transaction);
  const account = transaction.accountId;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="h-1.5 bg-linear-to-r from-emerald-300 via-cyan-300 to-sky-300" />

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-950">
                {transaction.description || "Recurring transaction"}
              </h3>

              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${getRecurringStatusClassName(
                  transaction.recurringStatus,
                )}`}
              >
                {getRecurringStatusLabel(transaction.recurringStatus)}
              </span>

              {isDue && isActive && (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 ring-1 ring-red-100">
                  Due
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {getCategoryLabel(transaction.category)} -{" "}
              {getRecurringIntervalLabel(transaction.recurringInterval)}
            </p>
          </div>

          <p
            className={`text-right text-xl font-semibold ${
              transaction.type === "INCOME"
                ? "text-emerald-600"
                : "text-red-500"
            }`}
          >
            {transaction.type === "INCOME" ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </p>
        </div>

        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-slate-500">
              <CalendarClock size={16} />
              Next due date
            </div>
            <p className="mt-1 font-medium text-slate-800">
              {formatDate(transaction.nextRecurringDate)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-slate-500">
              <WalletCards size={16} />
              Account
            </div>
            <p className="mt-1 font-medium text-slate-800">
              {account?.name || "Account"}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onViewHistory(transaction)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <History size={15} />
            History
          </button>

          <button
            type="button"
            onClick={() => onProcess(transaction)}
            disabled={!isActive || !isDue || isMutating}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            title={!isDue ? "This recurring transaction is not due yet" : ""}
          >
            <RefreshCcw size={15} />
            Process
          </button>

          {isActive ? (
            <button
              type="button"
              onClick={() => onPause(transaction)}
              disabled={isMutating}
              className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Pause size={15} />
              Pause
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onResume(transaction)}
              disabled={isMutating}
              className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play size={15} />
              Resume
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
