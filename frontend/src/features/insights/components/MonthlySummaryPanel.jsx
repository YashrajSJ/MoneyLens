import {
  BadgeIndianRupee,
  PiggyBank,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import { formatCurrency } from "../../../utils/formatters";
import { formatInsightLabel } from "../constants/insightConstants";

export const MonthlySummaryPanel = ({
  summaryData,
  isLoading,
  isError,
  isPeriodInvalid,
}) => {
  const summary = summaryData?.summary || {};
  const budgetProgress = summaryData?.budgetProgress || [];
  const categoryBreakdown = summaryData?.categoryBreakdown || [];
  const recentTransactions = summaryData?.recentTransactions || [];

  const income = summary.income ?? summary.totalIncome ?? 0;
  const expenses = summary.expenses ?? summary.totalExpenses ?? 0;
  const netSavings = summary.netSavings ?? income - expenses;

  const riskyBudgets = budgetProgress.filter(
    (budget) => budget.isExceeded || budget.isOverThreshold,
  );

  const topCategory = categoryBreakdown[0];

  if (isPeriodInvalid) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
        <p className="text-sm font-semibold text-amber-800">
          Select a valid month and year
        </p>
        <p className="mt-1 text-sm text-amber-700">
          Monthly summary and AI generation need a year between 2000 and 2100.
        </p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
        <p className="text-sm font-medium text-slate-700">
          Loading monthly summary...
        </p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
        <p className="text-sm font-semibold text-amber-800">
          Monthly summary could not be loaded.
        </p>
        <p className="mt-1 text-sm text-amber-700">
          You can still view saved insights below.
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Monthly financial summary
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              AI context overview
            </h2>
          </div>

          <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <BadgeIndianRupee size={21} />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs text-emerald-700">Income</p>
            <p className="mt-1 font-semibold text-slate-950">
              {formatCurrency(income)}
            </p>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-xs text-red-600">Expenses</p>
            <p className="mt-1 font-semibold text-slate-950">
              {formatCurrency(expenses)}
            </p>
          </div>

          <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
            <p className="text-xs text-sky-700">Net savings</p>
            <p className="mt-1 font-semibold text-slate-950">
              {formatCurrency(netSavings)}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          AI insights are generated from completed transactions, budgets,
          account balances, spending categories, and recent activity for the
          selected month.
        </div>
      </div>

      <div className="grid gap-4">
        <article className="rounded-2xl border border-amber-200 bg-white/90 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <PiggyBank size={19} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Budget warnings</p>
              <p className="text-xl font-semibold text-slate-950">
                {riskyBudgets.length}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-sky-200 bg-white/90 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
              <WalletCards size={19} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Top category</p>
              <p className="text-xl font-semibold text-slate-950">
                {formatInsightLabel(topCategory?.category)}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <ReceiptText size={19} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Recent entries analyzed</p>
              <p className="text-xl font-semibold text-slate-950">
                {recentTransactions.length}
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};