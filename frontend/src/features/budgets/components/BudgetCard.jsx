import { Pencil, PiggyBank, Trash2 } from "lucide-react";

import { formatCurrency } from "../../../utils/formatters";
import {
  getBudgetStatusStyle,
  getMonthLabel,
} from "../constants/budgetConstants";

export const BudgetCard = ({ budget, onEdit, onDelete, isDeleting }) => {
  const statusStyle = getBudgetStatusStyle(budget.status);
  const account = budget.accountId;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className="flex size-11 items-center justify-center rounded-xl text-white shadow-sm"
            style={{ backgroundColor: account?.color || "#0f172a" }}
          >
            <PiggyBank size={21} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-950">
                {account?.name || "Account budget"}
              </h3>

              {budget.status && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${statusStyle.className}`}
                >
                  {statusStyle.label}
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {getMonthLabel(budget.month)} {budget.year}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm text-slate-500">Monthly limit</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          {formatCurrency(budget.amount)}
        </p>
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Alert threshold</span>
          <span className="font-semibold text-slate-800">
            {budget.alertThreshold || 80}%
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEdit(budget)}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <Pencil size={15} />
          Edit
        </button>

        <button
          type="button"
          disabled={isDeleting}
          onClick={() => onDelete(budget)}
          className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 size={15} />
          Delete
        </button>
      </div>
    </article>
  );
};