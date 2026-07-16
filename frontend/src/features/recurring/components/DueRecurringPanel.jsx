import { AlertCircle, RefreshCcw } from "lucide-react";

export const DueRecurringPanel = ({
  dueTransactions,
  isLoading,
  onProcessDue,
  isProcessing,
  lastResult,
}) => {
  const dueCount = dueTransactions.length;

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-emerald-800">
            <AlertCircle size={18} />
            <p className="text-sm font-semibold">Due recurring transactions</p>
          </div>

          <p className="mt-2 text-sm leading-6 text-emerald-900/80">
            {isLoading
              ? "Checking due transactions..."
              : dueCount > 0
                ? `${dueCount} recurring transaction${dueCount === 1 ? "" : "s"} ready to process.`
                : "No recurring transactions are due right now."}
          </p>

          {lastResult && (
            <p className="mt-2 text-xs font-medium text-emerald-800">
              Last run: {lastResult.processedCount || 0} processed,{" "}
              {lastResult.failedCount || 0} failed,{" "}
              {lastResult.remainingDueCount || 0} still due.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onProcessDue}
          disabled={isProcessing || dueCount === 0}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCcw size={16} />
          {isProcessing ? "Processing..." : "Process due"}
        </button>
      </div>
    </section>
  );
};