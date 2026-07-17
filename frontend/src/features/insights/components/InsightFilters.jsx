import {
  INSIGHT_SEVERITIES,
  INSIGHT_TYPES,
  READ_FILTERS,
  getMonthOptions,
} from "../constants/insightConstants";

const monthOptions = getMonthOptions();

export const InsightFilters = ({ filters, onChange, onReset }) => {
  const updateFilter = (field, value) => {
    onChange((currentFilters) => ({
      ...currentFilters,
      [field]: value,
      page: 1,
    }));
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-300 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 p-4 shadow-sm">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-7rem] top-[-7rem] h-64 w-64 rounded-full bg-slate-300/60 blur-3xl"
      />

      <div className="relative grid gap-3 md:grid-cols-5">
        <div>
          <label
            htmlFor="insightType"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Type
          </label>
          <select
            id="insightType"
            value={filters.type}
            onChange={(event) => updateFilter("type", event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
          >
            {INSIGHT_TYPES.map((type) => (
              <option key={type.value || "all"} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="insightSeverity"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Severity
          </label>
          <select
            id="insightSeverity"
            value={filters.severity}
            onChange={(event) => updateFilter("severity", event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
          >
            {INSIGHT_SEVERITIES.map((severity) => (
              <option key={severity.value || "all"} value={severity.value}>
                {severity.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="insightRead"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Read status
          </label>
          <select
            id="insightRead"
            value={filters.isRead}
            onChange={(event) => updateFilter("isRead", event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
          >
            {READ_FILTERS.map((filter) => (
              <option key={filter.value || "all"} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="insightMonth"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Month
          </label>
          <select
            id="insightMonth"
            value={filters.month}
            onChange={(event) =>
              updateFilter("month", Number(event.target.value))
            }
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
          >
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="insightYear"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Year
          </label>
          <input
            id="insightYear"
            type="text"
            inputMode="numeric"
            value={filters.year}
            onChange={(event) =>
              updateFilter(
                "year",
                event.target.value.replace(/\D/g, "").slice(0, 4),
              )
            }
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
          />
        </div>

        <div className="md:col-span-5">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Reset filters
          </button>
        </div>
      </div>
    </section>
  );
};