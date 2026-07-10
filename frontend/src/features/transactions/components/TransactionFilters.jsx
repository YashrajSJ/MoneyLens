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
      from: new Date(now.getFullYear(), now.getMonth(), 1)
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

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
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
          className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100"
        >
          This month
        </button>

        <button
          type="button"
          onClick={() => applyPreset("LAST_MONTH")}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
        >
          Last month
        </button>

        <button
          type="button"
          onClick={() => applyPreset("LAST_3_MONTHS")}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
        >
          Last 3 months
        </button>
      </div>
    </section>
  );
};