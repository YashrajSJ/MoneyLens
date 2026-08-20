import { X } from "lucide-react";

import {
  NOTIFICATION_TYPES,
  READ_FILTERS,
} from "../constants/notificationConstants";

export const NotificationFilters = ({ filters, onChange, onReset }) => {
  const updateFilter = (field, value) => {
    onChange({ 
      ...filters,
      [field]: value,
      page: 1,
    });
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

      <div className="relative grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <select
          value={filters.type}
          onChange={(event) => updateFilter("type", event.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
        >
          <option value="">All notification types</option>
          {NOTIFICATION_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        <select
          value={filters.isRead}
          onChange={(event) => updateFilter("isRead", event.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
        >
          {READ_FILTERS.map((filter) => (
            <option key={filter.label} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <X size={16} />
          Reset
        </button>
      </div>
    </section>
  );
};