import { X } from "lucide-react";

import { formatCurrency, formatDate } from "../../../utils/formatters";

const formatLabel = (value) => {
  if (!value) return "-";

  return String(value)
    .toLowerCase()
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const ReceiptDraftModal = ({ draft, receipt, onClose }) => {
  if (!draft) return null;

  const transactionDraft = draft?.transactionDraft;

  if (!transactionDraft) {
    return (
      <div className="fixed inset-x-0 bottom-0 top-16 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
        <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
          <h2 className="text-lg font-semibold text-slate-950">
            Draft not available
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            MoneyLens could not prepare transaction details from this receipt.
            Please retry parsing or upload a clearer image.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Close
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              AI transaction draft
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Review extracted details
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              AI can be wrong. Check the amount, date, category, and merchant
              before creating a real transaction.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
            aria-label="Close draft"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[12rem_1fr]">
          <img
            src={receipt.imageUrl}
            alt={receipt.originalName || "Receipt"}
            className="h-48 w-full rounded-xl object-cover"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Amount</p>
              <p className="mt-1 font-semibold text-slate-950">
                {formatCurrency(transactionDraft.amount)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Date</p>
              <p className="mt-1 font-semibold text-slate-950">
                {formatDate(transactionDraft.date)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Type</p>
              <p className="mt-1 font-semibold text-slate-950">
                {formatLabel(transactionDraft.type)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Category</p>
              <p className="mt-1 font-semibold text-slate-950">
                {formatLabel(transactionDraft.category)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Payment method</p>
              <p className="mt-1 font-semibold text-slate-950">
                {formatLabel(transactionDraft.paymentMethod)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Merchant</p>
              <p className="mt-1 font-semibold text-slate-950">
                {transactionDraft.merchantName || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          This module currently prepares the draft only. Final
          receipt-to-transaction confirmation should be connected after the
          backend has an endpoint that creates the transaction and stores the
          receipt link safely.
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Done reviewing
          </button>
        </div>
      </section>
    </div>
  );
};
