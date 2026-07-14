import { PiggyBank } from "lucide-react";

import { formatCurrency } from "../../../utils/formatters";

const getStatusClassName = (status) => {
  if (status === "EXCEEDED") {
    return "bg-red-50 text-red-600 ring-red-100";
  }

  if (status === "WARNING") {
    return "bg-amber-50 text-amber-700 ring-amber-100";
  }

  return "bg-emerald-50 text-emerald-700 ring-emerald-100";
};

const getBarClassName = (status) => {
  if (status === "EXCEEDED") return "bg-red-500";
  if (status === "WARNING") return "bg-amber-500";
  return "bg-emerald-600";
};

export const BudgetProgressCard = ({ data }) => {
  if (!data?.budget || !data?.progress) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white/90 p-5 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <PiggyBank size={19} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-950">Budget progress</h2>
            <p className="mt-1 text-sm text-slate-500">
              No budget found for the selected account/month.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const { budget, progress } = data;
  const rawPercentage = Number(progress.percentageUsed || 0);
  const cappedPercentage = Math.min(rawPercentage, 100);
  const percentageLabel = Math.round(rawPercentage);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-950">Budget progress</h2>
          <p className="mt-1 text-sm text-slate-500">
            Current month spending against selected budget.
          </p>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${getStatusClassName(
            progress.status,
          )}`}
        >
          {progress.status}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-3xl font-semibold text-slate-950">
          {formatCurrency(progress.currentExpenses || 0)}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          spent of {formatCurrency(progress.budgetAmount || budget.amount || 0)}
        </p>
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-slate-500">Usage</span>
          <span className="font-semibold text-slate-800">
            {percentageLabel}%
          </span>
        </div>

        <div className="h-3 rounded-full bg-slate-100">
          <div
            className={`h-3 rounded-full ${getBarClassName(progress.status)}`}
            style={{ width: `${cappedPercentage}%` }}
          />
        </div>
      </div>

      <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
        Remaining amount:{" "}
        <span className="font-semibold text-slate-900">
          {formatCurrency(progress.remainingAmount || 0)}
        </span>
      </p>
    </section>
  );
};