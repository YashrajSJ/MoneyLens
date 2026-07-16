import { useMemo, useState } from "react";
import { FileImage } from "lucide-react";
import { toast } from "sonner";

import { ReceiptCard } from "../features/receipts/components/ReceiptCard";
import { ReceiptDraftModal } from "../features/receipts/components/ReceiptDraftModal";
import { ReceiptFilters } from "../features/receipts/components/ReceiptFilters";
import { ReceiptUploadPanel } from "../features/receipts/components/ReceiptUploadPanel";
import {
  useDeleteReceipt,
  usePrepareReceiptTransaction,
  useReceipts,
  useRetryReceiptParsing,
  useScanReceipt,
} from "../features/receipts/hooks/useReceipts";

const initialFilters = {
  status: "",
  page: 1,
  limit: 12,
};

const cleanFilters = (filters) => {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== "" && value !== null,
    ),
  );
};

export const ReceiptsPage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [draftState, setDraftState] = useState(null);

  const queryFilters = useMemo(() => cleanFilters(filters), [filters]);

  const { data, isLoading, isError, refetch } = useReceipts(queryFilters);
  const scanMutation = useScanReceipt();
  const retryMutation = useRetryReceiptParsing();
  const deleteMutation = useDeleteReceipt();
  const prepareMutation = usePrepareReceiptTransaction();

  const receipts = data?.receipts || [];
  const pagination = data?.pagination;

  const isMutating =
    scanMutation.isPending ||
    retryMutation.isPending ||
    deleteMutation.isPending ||
    prepareMutation.isPending;

  const handlePrepareDraft = async (receipt) => {
    try {
      const result = await prepareMutation.mutateAsync({
        receiptId: receipt._id,
      });

      setDraftState({
        receipt,
        draft: result,
      });

      toast.success("Transaction draft prepared");
    } catch {
      // Error toast is handled by the mutation hook.
    }
  };

  const handleRetry = (receipt) => {
    retryMutation.mutate(receipt._id);
  };

  const handleDelete = (receipt) => {
    const confirmed = window.confirm(
      `Delete "${receipt.originalName || "this receipt"}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    deleteMutation.mutate(receipt._id);
  };

  const goToPage = (page) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      page,
    }));
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 text-center shadow-sm backdrop-blur">
        <p className="text-sm font-medium text-slate-700">
          Loading receipts...
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Checking uploaded receipt images and parsing status.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white/90 p-8 text-center shadow-sm backdrop-blur">
        <p className="text-sm font-semibold text-red-600">
          Could not load receipts
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Please retry once. If the issue continues, check your session.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <ReceiptUploadPanel
          onUpload={(file) => scanMutation.mutateAsync(file)}
          isUploading={scanMutation.isPending}
        />

        <ReceiptFilters
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(initialFilters)}
        />

        {receipts.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white/90 p-10 text-center shadow-sm backdrop-blur">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <FileImage size={26} />
            </div>

            <h2 className="mt-4 text-xl font-semibold text-slate-950">
              No receipts yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Upload a receipt image and MoneyLens will extract a transaction
              draft for review.
            </p>
          </section>
        ) : (
          <section className="grid gap-4">
            {receipts.map((receipt) => (
              <ReceiptCard
                key={receipt._id}
                receipt={receipt}
                onPrepareDraft={handlePrepareDraft}
                onRetry={handleRetry}
                onDelete={handleDelete}
                isMutating={isMutating}
              />
            ))}
          </section>
        )}

        {pagination?.totalPages > 1 && (
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => goToPage(pagination.page - 1)}
              className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => goToPage(pagination.page + 1)}
              className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {draftState && (
        <ReceiptDraftModal
          receipt={draftState.receipt}
          draft={draftState.draft}
          onClose={() => setDraftState(null)}
        />
      )}
    </>
  );
};
