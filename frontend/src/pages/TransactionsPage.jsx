import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, Plus } from "lucide-react";

import { TransactionFilters } from "../features/transactions/components/TransactionFilters";
import { TransactionFormModal } from "../features/transactions/components/TransactionFormModal";
import { TransactionTable } from "../features/transactions/components/TransactionTable";
import {
  useBulkDeleteTransactions,
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from "../features/transactions/hooks/useTransactions";
import { useAccounts } from "../features/accounts/hooks/useAccounts";
import { formatCurrency } from "../utils/formatters";

const initialFilters = {
  accountId: "",
  type: "",
  category: "",
  status: "",
  from: "",
  to: "",
  search: "",
  page: 1,
  limit: 20,
};

const cleanFilters = (filters) => {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== "" && value !== null,
    ),
  );
};

export const TransactionsPage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const isCreateFromUrl = searchParams.get("create") === "true";
  const shouldShowForm = isFormOpen || isCreateFromUrl;

  const queryFilters = useMemo(() => cleanFilters(filters), [filters]);

  const { data, isLoading, isError, refetch } = useTransactions(queryFilters);
  const { data: accountData } = useAccounts();

  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();
  const bulkDeleteMutation = useBulkDeleteTransactions();

  const transactions = data?.transactions || [];
  const pagination = data?.pagination;
  const accounts = accountData?.accounts || [];

  const pageIncome = transactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);

  const pageExpenses = transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);

  const openCreateForm = () => {
    setSelectedTransaction(null);
    setIsFormOpen(true);
  };

  const openEditForm = (transaction) => {
    setSelectedTransaction(transaction);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setSelectedTransaction(null);
    setIsFormOpen(false);

    if (isCreateFromUrl) {
      setSearchParams({});
    }
  };

  const handleSubmit = async (payload) => {
    if (selectedTransaction) {
      await updateTransactionMutation.mutateAsync({
        transactionId: selectedTransaction._id,
        payload,
      });
      closeForm();
      return;
    }

    await createTransactionMutation.mutateAsync(payload);
    closeForm();
  };

  const handleDelete = (transaction) => {
    const confirmed = window.confirm(
      `Delete "${transaction.description || "this transaction"}"? This will update account balance if needed.`,
    );

    if (!confirmed) return;

    deleteTransactionMutation.mutate(transaction._id);
  };

  const toggleSelect = (transactionId) => {
    setSelectedIds((currentIds) =>
      currentIds.includes(transactionId)
        ? currentIds.filter((id) => id !== transactionId)
        : [...currentIds, transactionId],
    );
  };

  const toggleSelectAll = () => {
    const allSelected =
      transactions.length > 0 &&
      transactions.every((transaction) =>
        selectedIds.includes(transaction._id),
      );

    if (allSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(transactions.map((transaction) => transaction._id));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedIds.length} selected transactions? Balances will be recalculated by the backend.`,
    );

    if (!confirmed) return;

    await bulkDeleteMutation.mutateAsync(selectedIds);
    setSelectedIds([]);
  };

  const goToPage = (page) => {
    setSelectedIds([]);
    setFilters((currentFilters) => ({
      ...currentFilters,
      page,
    }));
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 text-center shadow-sm backdrop-blur">
        <p className="text-sm font-medium text-slate-700">
          Loading transactions...
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Fetching your transaction history.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white/90 p-8 text-center shadow-sm backdrop-blur">
        <p className="text-sm font-semibold text-red-600">
          Could not load transactions
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
                  Transaction workspace
                </span>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {pagination?.total || 0} records
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                Transactions
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                Track income, expenses, recurring entries, payment methods, and
                merchant activity from one place.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-3.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
            >
              <Plus size={17} />
              Add Transaction
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
            <p className="text-sm text-slate-500">Page income</p>
            <p className="mt-3 text-2xl font-semibold text-emerald-600">
              {formatCurrency(pageIncome)}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
            <p className="text-sm text-slate-500">Page expenses</p>
            <p className="mt-3 text-2xl font-semibold text-red-500">
              {formatCurrency(pageExpenses)}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
            <p className="text-sm text-slate-500">Net movement</p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">
              {formatCurrency(pageIncome - pageExpenses)}
            </p>
          </article>
        </section>

        <TransactionFilters
          filters={filters}
          accounts={accounts}
          onChange={setFilters}
          onReset={() => {
            setSelectedIds([]);
            setFilters(initialFilters);
          }}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing page {pagination?.page || 1} of{" "}
            {pagination?.totalPages || 1}
          </p>

          <div className="flex flex-wrap gap-2">
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
                className="inline-flex h-10 items-center justify-center rounded-xl px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Delete selected ({selectedIds.length})
              </button>
            )}

            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <Download size={16} />
              Export CSV later
            </button>
          </div>
        </div>

        <TransactionTable
          transactions={transactions}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />

        {pagination?.totalPages > 1 && (
          <div className="flex items-center justify-end gap-2">
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

      {shouldShowForm && (
        <TransactionFormModal
          key={selectedTransaction?._id || "create-transaction"}
          open={shouldShowForm}
          transaction={selectedTransaction}
          accounts={accounts}
          onClose={closeForm}
          onSubmit={handleSubmit}
          isSubmitting={
            createTransactionMutation.isPending ||
            updateTransactionMutation.isPending
          }
        />
      )}
    </>
  );
};