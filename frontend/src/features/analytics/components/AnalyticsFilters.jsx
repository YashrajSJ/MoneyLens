import { CalendarDays, RotateCcw } from "lucide-react";

const datePresets = [
  {
    label: "This month",
    value: "THIS_MONTH",
  },
  {
    label: "Last 30 days",
    value: "LAST_30_DAYS",
  },
  {
    label: "Last 3 months",
    value: "LAST_3_MONTHS",
  },
];

const getDatePresetRange = (preset) => {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  if (preset === "THIS_MONTH") {
    const start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))
      .toISOString()
      .slice(0, 10);

    return {
      from: start,
      to: today,
    };
  }

  if (preset === "LAST_30_DAYS") {
    const start = new Date(now);
    start.setDate(start.getDate() - 30);

    return {
      from: start.toISOString().slice(0, 10),
      to: today,
    };
  }

  if (preset === "LAST_3_MONTHS") {
    const start = new Date(now);
    start.setMonth(start.getMonth() - 3);

    return {
      from: start.toISOString().slice(0, 10),
      to: today,
    };
  }

  return {
    from: "",
    to: "",
  };
};

export const AnalyticsFilters = ({ filters, accounts, onChange, onReset }) => {
  const updateFilter = (field, value) => {
    onChange((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  };

  const applyPreset = (preset) => {
    const range = getDatePresetRange(preset);

    onChange((currentFilters) => ({
      ...currentFilters,
      ...range,
    }));
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
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CalendarDays size={17} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-950">
                Analytics filters
              </h2>
              <p className="text-xs text-slate-500">
                Filter reports by account and date range.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {datePresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => applyPreset(preset.value)}
                className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
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

          <input
            type="date"
            value={filters.from}
            onChange={(event) => updateFilter("from", event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
          />

          <input
            type="date"
            value={filters.to}
            onChange={(event) => updateFilter("to", event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
          />

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
