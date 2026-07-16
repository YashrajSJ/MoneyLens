import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Repeat2 } from "lucide-react";

import { DueRecurringPanel } from "../features/recurring/components/DueRecurringPanel";
import { GeneratedTransactionsModal } from "../features/recurring/components/GeneratedTransactionsModal";
import { RecurringFilters } from "../features/recurring/components/RecurringFilters";
import { RecurringTransactionCard } from "../features/recurring/components/RecurringTransactionCard";
import {
  useDueRecurringTransactions,
  usePauseRecurringTransaction,
  useProcessDueRecurringTransactions,
  useProcessRecurringTransaction,
  useRecurringTransactions,
  useResumeRecurringTransaction,
} from "../features/recurring/hooks/useRecurring";

const initialFilters = {
  status: "",
  page: 1,
  limit: 20,
};

const DUE_RECURRING_LIMIT = 20;

const cleanFilters = (filters) => {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== "" && value !== null,
    ),
  );
};

export const RecurringPage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [lastProcessResult, setLastProcessResult] = useState(null);
  const [historyTransaction, setHistoryTransaction] = useState(null);

  const queryFilters = useMemo(() => cleanFilters(filters), [filters]);

  const { data, isLoading, isError, refetch } =
    useRecurringTransactions(queryFilters);

  const { data: dueData, isLoading: dueLoading } = useDueRecurringTransactions({
    limit: DUE_RECURRING_LIMIT,
  });

  const pauseMutation = usePauseRecurringTransaction();
  const resumeMutation = useResumeRecurringTransaction();
  const processOneMutation = useProcessRecurringTransaction();
  const processDueMutation = useProcessDueRecurringTransactions();

  const transactions = data?.transactions || [];
  const pagination = data?.pagination;
  const dueTransactions = dueData?.transactions || [];

  const activeCount = transactions.filter(
    (transaction) => transaction.recurringStatus === "ACTIVE",
  ).length;

  const pausedCount = transactions.filter(
    (transaction) => transaction.recurringStatus === "PAUSED",
  ).length;

  const isMutating =
    pauseMutation.isPending ||
    resumeMutation.isPending ||
    processOneMutation.isPending ||
    processDueMutation.isPending;

  const handleProcessDue = async () => {
    const result = await processDueMutation.mutateAsync({
      limit: 20,
    });

    setLastProcessResult(result);
  };

  const handleProcessOne = (transaction) => {
    processOneMutation.mutate({
      transactionId: transaction._id,
    });
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
          Loading recurring transactions...
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Fetching scheduled income and expenses.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white/90 p-8 text-center shadow-sm backdrop-blur">
        <p className="text-sm font-semibold text-red-600">
          Could not load recurring transactions
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
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur md:p-6">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-100/70 blur-3xl" />
          <div className="absolute bottom-0 right-24 h-24 w-24 rounded-full bg-cyan-100/70 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  Recurring workspace
                </span>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {pagination?.total || 0} schedules
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                Recurring Transactions
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                Manage scheduled income, subscriptions, bills, and automatic
                transaction processing.
              </p>
            </div>

            <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
              <Repeat2 size={24} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-emerald-200 bg-white/90 p-5 shadow-sm backdrop-blur">
            <p className="text-sm text-slate-500">Active on this page</p>{" "}
            <p className="mt-3 text-2xl font-semibold text-emerald-600">
              {activeCount}
            </p>
          </article>

          <article className="rounded-2xl border border-amber-200 bg-white/90 p-5 shadow-sm backdrop-blur">
            <p className="text-sm text-slate-500">Paused on this page</p>{" "}
            <p className="mt-3 text-2xl font-semibold text-amber-600">
              {pausedCount}
            </p>
          </article>

          <article className="rounded-2xl border border-sky-200 bg-white/90 p-5 shadow-sm backdrop-blur">
            <p className="text-sm text-slate-500">Due now</p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">
              {dueTransactions.length}
            </p>
          </article>
        </section>

        <DueRecurringPanel
          dueTransactions={dueTransactions}
          isLoading={dueLoading}
          onProcessDue={handleProcessDue}
          isProcessing={processDueMutation.isPending}
          lastResult={lastProcessResult}
        />

        <RecurringFilters
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(initialFilters)}
        />

        {transactions.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white/90 p-10 text-center shadow-sm backdrop-blur">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <CalendarClock size={26} />
            </div>

            <h2 className="mt-4 text-xl font-semibold text-slate-950">
              No recurring transactions yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Create a recurring transaction from the transaction form to start
              tracking scheduled bills or income.
            </p>

            <Link
              to="/transactions?create=true"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Create recurring transaction
            </Link>
          </section>
        ) : (
          <section className="grid gap-4 lg:grid-cols-2">
            {transactions.map((transaction) => (
              <RecurringTransactionCard
                key={transaction._id}
                transaction={transaction}
                onPause={(item) => pauseMutation.mutate(item._id)}
                onResume={(item) => resumeMutation.mutate(item._id)}
                onProcess={handleProcessOne}
                onViewHistory={setHistoryTransaction}
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

      {historyTransaction && (
        <GeneratedTransactionsModal
          transaction={historyTransaction}
          onClose={() => setHistoryTransaction(null)}
        />
      )}
    </>
  );
};
