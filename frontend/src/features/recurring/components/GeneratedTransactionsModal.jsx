import { useState } from "react";
import { X } from "lucide-react";

import { formatCurrency, formatDate } from "../../../utils/formatters";
import { getCategoryLabel } from "../../transactions/constants/transactionConstants";
import { useGeneratedRecurringTransactions } from "../hooks/useRecurring";

export const GeneratedTransactionsModal = ({ transaction, onClose }) => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError } = useGeneratedRecurringTransactions({
    transactionId: transaction?._id,
    filters,
  });

  const generatedTransactions = data?.transactions || [];
  const pagination = data?.pagination;

  const goToPage = (page) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      page,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
      <section className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Generated history
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              {transaction?.description || "Recurring transaction"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Transactions created from this recurring template.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[62vh] overflow-y-auto p-5">
          {isLoading && (
            <p className="text-sm font-medium text-slate-600">
              Loading generated transactions...
            </p>
          )}

          {isError && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
              Could not load generated transactions.
            </div>
          )}

          {!isLoading && !isError && generatedTransactions.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <p className="font-semibold text-slate-900">
                No generated transactions yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Once this template is processed, generated entries will appear
                here.
              </p>
            </div>
          )}

          {!isLoading && !isError && generatedTransactions.length > 0 && (
            <div className="space-y-3">
              {generatedTransactions.map((item) => (
                <article
                  key={item._id}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <p className="font-medium text-slate-950">
                        {item.description || "Generated transaction"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {getCategoryLabel(item.category)} -{" "}
                        {formatDate(item.date)}
                      </p>

                      <span
                        className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          item.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700"
                            : item.status === "FAILED"
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p
                      className={`text-lg font-semibold ${
                        item.type === "INCOME"
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      {item.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {pagination?.totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 border-t border-slate-200 p-4">
            <span className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => goToPage(pagination.page - 1)}
              className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => goToPage(pagination.page + 1)}
              className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
