import { Search, X } from "lucide-react";

import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
} from "../constants/transactionConstants";

const getDateRangePreset = (preset) => {
  const now = new Date();

  if (preset === "THIS_MONTH") {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1)   // new Date(year, month, day)
        .toISOString()
        .slice(0, 10),
      to: now.toISOString().slice(0, 10),
    };
  }

  if (preset === "LAST_MONTH") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);

    return {
      from: start.toISOString().slice(0, 10),
      to: end.toISOString().slice(0, 10),
    };
  }

  if (preset === "LAST_3_MONTHS") {
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    return {
      from: start.toISOString().slice(0, 10),
      to: now.toISOString().slice(0, 10),
    };
  }

  return {
    from: "",
    to: "",
  };
};

const getActiveDatePreset = (filters) => {
  const presets = ["THIS_MONTH", "LAST_MONTH", "LAST_3_MONTHS"];

  return presets.find((preset) => {
    const range = getDateRangePreset(preset);

    return filters.from === range.from && filters.to === range.to;
  });
};

export const TransactionFilters = ({
  filters,
  accounts,
  onChange,
  onReset,
}) => {
  const categories =
    filters.type === "INCOME"
      ? INCOME_CATEGORIES
      : filters.type === "EXPENSE"
        ? EXPENSE_CATEGORIES
        : [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  const updateFilter = (field, value) => {
    onChange({
      ...filters,
      [field]: value,
      page: 1,
    });
  };

  const applyPreset = (preset) => {
    const range = getDateRangePreset(preset);

    onChange({
      ...filters,
      from: range.from,
      to: range.to,
      page: 1,
    });
  };

  const activeDatePreset = getActiveDatePreset(filters);

  const getPresetButtonClassName = (preset) => {
    const baseClassName =
      "rounded-full px-3 py-1 text-xs font-medium transition";

    if (activeDatePreset === preset) {
      return `${baseClassName} bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100`;
    }

    return `${baseClassName} bg-slate-100 text-slate-600 hover:bg-slate-200`;
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-300 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 p-4 shadow-sm">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-7rem] top-[-7rem] h-64 w-64 rounded-full bg-slate-300/60 blur-3xl"
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
        <div className="grid gap-3 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <label className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              placeholder="Search description or merchant"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
            />
          </label>

          <select
            value={filters.accountId}
            onChange={(event) => updateFilter("accountId", event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
          >
            <option value="">All accounts</option>
            {accounts.map((account) => (
              <option key={account._id} value={account._id}>
                {account.name}
              </option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(event) =>
              onChange({
                ...filters,
                type: event.target.value,
                category: "",
                page: 1,
              })
            }
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
          >
            <option value="">All types</option>
            {TRANSACTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(event) => updateFilter("status", event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
          >
            <option value="">All statuses</option>
            {TRANSACTION_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
          <select
            value={filters.category}
            onChange={(event) => updateFilter("category", event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.from}
            onChange={(event) => updateFilter("from", event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
          />

          <input
            type="date"
            value={filters.to}
            onChange={(event) => updateFilter("to", event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
          />

          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <X size={16} />
            Reset
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPreset("THIS_MONTH")}
            className={getPresetButtonClassName("THIS_MONTH")}
          >
            This month
          </button>

          <button
            type="button"
            onClick={() => applyPreset("LAST_MONTH")}
            className={getPresetButtonClassName("LAST_MONTH")}
          >
            Last month
          </button>

          <button
            type="button"
            onClick={() => applyPreset("LAST_3_MONTHS")}
            className={getPresetButtonClassName("LAST_3_MONTHS")}
          >
            Last 3 months
          </button>
        </div>
      </div>
    </section>
  );
};
