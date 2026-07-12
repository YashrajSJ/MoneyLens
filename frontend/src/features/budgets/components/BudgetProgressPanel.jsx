import { AlertTriangle, PiggyBank } from "lucide-react";

import { formatCurrency } from "../../../utils/formatters";
import {
  getBudgetStatusStyle,
  getMonthLabel,
} from "../constants/budgetConstants";

const getProjectedMessage = (progress) => {
  if (!progress) return null;

  if (progress.status === "EXCEEDED") {
    return "This budget has already been exceeded. Review recent spending before adding more expenses.";
  }

  if (progress.status === "WARNING") {
    return "You are close to the alert threshold. At this pace, this budget may be exceeded.";
  }

  return "Spending is currently within a comfortable range for this budget.";
};

export const BudgetProgressPanel = ({
  accountId,
  selectedMonth,
  selectedYear,
  currentBudgetData,
  isLoading,
  isError,
}) => {
  if (!accountId) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <PiggyBank size={19} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-950">Budget progress</h2>
            <p className="text-sm text-slate-500">
              Select an account to view current budget usage.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
        <p className="text-sm font-medium text-slate-700">
          Loading budget progress...
        </p>
      </section>
    );
  }

  if (isError || !currentBudgetData?.budget) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white/90 p-5 shadow-sm backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <AlertTriangle size={19} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-950">No budget found</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              No budget exists for {getMonthLabel(selectedMonth)} {selectedYear}{" "}
              on the selected account.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const { budget, progress } = currentBudgetData;
  const statusStyle = getBudgetStatusStyle(progress.status);

  const rawPercentageUsed = Number(progress.percentageUsed || 0);
  const percentageUsed = Math.min(rawPercentageUsed, 100);
  const percentageLabel = Math.round(rawPercentageUsed);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-slate-950">Budget progress</h2>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${statusStyle.className}`}
            >
              {statusStyle.label}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {budget.accountId?.name || "Selected account"} ·{" "}
            {getMonthLabel(budget.month)} {budget.year}
          </p>

          <p className="mt-4 text-3xl font-semibold text-slate-950">
            {formatCurrency(progress.spentAmount)}
            <span className="ml-2 text-sm font-medium text-slate-500">
              spent of {formatCurrency(budget.amount)}
            </span>
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Remaining:{" "}
            <span className="font-semibold text-slate-800">
              {formatCurrency(progress.remainingAmount)}
            </span>
          </p>
        </div>

        <div className="w-full lg:max-w-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Usage</span>
            <span className="font-semibold text-slate-800">
              {percentageLabel}%
            </span>
          </div>

          <div className="mt-2 h-3 rounded-full bg-slate-100">
            <div
              className={`h-3 rounded-full ${statusStyle.barClassName}`}
              style={{ width: `${percentageUsed}%` }}
            />
          </div>

          <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
            {getProjectedMessage(progress)}
          </p>
        </div>
      </div>
    </section>
  );
};
