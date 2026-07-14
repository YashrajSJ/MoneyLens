import { Filter, RotateCcw } from "lucide-react";

import { MONTH_OPTIONS, YEAR_OPTIONS } from "../constants/budgetConstants";

export const BudgetFilters = ({ filters, accounts, onChange, onReset }) => {
  const updateFilter = (field, value) => {
    onChange((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-300 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 p-4 shadow-sm">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 -top-28 h-64 w-64 rounded-full bg-slate-300/60 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-6rem] top-[-5rem] h-64 w-64 rounded-full bg-zinc-300/55 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-7rem] left-[30%] h-60 w-60 rounded-full bg-slate-400/25 blur-3xl"
      />

      <div className="relative">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Filter size={17} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-950">
              Budget filters
            </h2>
            <p className="text-xs text-slate-500">
              Filter budgets by account and month.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <select
            value={filters.accountId}
            onChange={(event) => updateFilter("accountId", event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
          >
            <option value="">All accounts</option>
            {accounts.map((account) => (
              <option key={account._id} value={account._id}>
                {account.name}
              </option>
            ))}
          </select>

          <select
            value={filters.month}
            onChange={(event) => updateFilter("month", event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
          >
            <option value="">All months</option>
            {MONTH_OPTIONS.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          <select
            value={filters.year}
            onChange={(event) => updateFilter("year", event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
          >
            <option value="">All years</option>
            {YEAR_OPTIONS.map((year) => (
              <option key={year.value} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>
    </section>
  );
};
