import { Eye, FileText, RefreshCcw, Trash2 } from "lucide-react";

import { formatCurrency, formatDate } from "../../../utils/formatters";
import {
  getConfidenceLabel,
  getReceiptStatusClassName,
  getReceiptStatusLabel,
} from "../constants/receiptConstants";

export const ReceiptCard = ({
  receipt,
  onPrepareDraft,
  onRetry,
  onDelete,
  isMutating,
}) => {
  const data = receipt.extractedData || {};
  const canPrepareDraft = receipt.status === "PARSED" && !receipt.transactionId;
  const canRetry = receipt.status === "FAILED";
  const canDelete = receipt.status !== "PROCESSING" && !receipt.transactionId;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="grid gap-0 md:grid-cols-[13rem_1fr]">
        <div className="h-52 bg-slate-100 md:h-full">
          <img
            src={receipt.imageUrl}
            alt={receipt.originalName || "Receipt"}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getReceiptStatusClassName(
                  receipt.status,
                )}`}
              >
                {getReceiptStatusLabel(receipt.status)}
              </span>

              <h3 className="mt-3 text-lg font-semibold text-slate-950">
                {data.merchantName || receipt.originalName || "Receipt"}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Uploaded {formatDate(receipt.createdAt)}
              </p>
            </div>

            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <FileText size={19} />
            </div>
          </div>

          {receipt.status === "PROCESSING" && (
            <p className="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-3 text-sm text-sky-800">
              AI parsing is running in the background. This card refreshes automatically.
            </p>
          )}

          {receipt.status === "FAILED" && (
            <p className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
              {receipt.errorMessage || "Receipt parsing failed. You can retry once."}
            </p>
          )}

          {receipt.status === "PARSED" && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Amount</p>
                <p className="mt-1 font-semibold text-slate-950">
                  {formatCurrency(data.amount || 0)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Date</p>
                <p className="mt-1 font-semibold text-slate-950">
                  {formatDate(data.date)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Category</p>
                <p className="mt-1 font-semibold text-slate-950">
                  {data.category || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">AI confidence</p>
                <p className="mt-1 font-semibold text-slate-950">
                  {getConfidenceLabel(data.confidence)}
                </p>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {canPrepareDraft && (
              <button
                type="button"
                disabled={isMutating}
                onClick={() => onPrepareDraft(receipt)}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Eye size={15} />
                Review draft
              </button>
            )}

            {canRetry && (
              <button
                type="button"
                disabled={isMutating}
                onClick={() => onRetry(receipt)}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-medium text-sky-800 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCcw size={15} />
                Retry parsing
              </button>
            )}

            <button
              type="button"
              disabled={!canDelete || isMutating}
              onClick={() => onDelete(receipt)}
              className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              title={
                !canDelete
                  ? "Processing or linked receipts cannot be deleted"
                  : "Delete receipt"
              }
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};