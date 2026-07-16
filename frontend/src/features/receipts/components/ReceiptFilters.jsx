import { RECEIPT_STATUSES } from "../constants/receiptConstants";

export const ReceiptFilters = ({ filters, onChange, onReset }) => {
  const updateFilter = (field, value) => {
    onChange((currentFilters) => ({
      ...currentFilters,
      [field]: value,
      page: 1,
    }));
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-300 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 p-4 shadow-sm">
      <div className="relative grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <label htmlFor="receiptStatus" className="mb-1.5 block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="receiptStatus"
            value={filters.status}
            onChange={(event) => updateFilter("status", event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
          >
            {RECEIPT_STATUSES.map((status) => (
              <option key={status.value || "all"} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Reset
        </button>
      </div>
    </section>
  );
};