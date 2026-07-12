import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PiggyBank, Plus } from "lucide-react";

import { useAccounts } from "../features/accounts/hooks/useAccounts";
import { BudgetCard } from "../features/budgets/components/BudgetCard";
import { BudgetFilters } from "../features/budgets/components/BudgetFilters";
import { BudgetFormModal } from "../features/budgets/components/BudgetFormModal";
import { BudgetProgressPanel } from "../features/budgets/components/BudgetProgressPanel";
import {
  useBudgets,
  useCreateBudget,
  useCurrentBudget,
  useDeleteBudget,
  useUpdateBudget,
} from "../features/budgets/hooks/useBudgets";
import { CURRENT_YEAR } from "../features/budgets/constants/budgetConstants";

const initialFilters = {
  accountId: "",
  month: "",
  year: "",
};

const cleanFilters = (filters) => {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== "" && value !== null,
    ),
  );
};

export const BudgetsPage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const isCreateFromUrl = searchParams.get("create") === "true";
  const shouldShowForm = isFormOpen || isCreateFromUrl;

  const queryFilters = useMemo(() => cleanFilters(filters), [filters]);

  const { data: accountData, isLoading: accountsLoading } = useAccounts();
  const { data, isLoading, isError, refetch } = useBudgets(queryFilters);

  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();

  const accounts = accountData?.accounts || [];
  const budgets = data?.budgets || [];

  const selectedAccountId =
    filters.accountId ||
    accounts.find((account) => account.isDefault)?._id ||
    accounts[0]?._id ||
    "";

  const selectedMonth = Number(filters.month) || new Date().getMonth() + 1;
  const selectedYear = Number(filters.year) || CURRENT_YEAR;

  const {
    data: currentBudgetData,
    isLoading: currentBudgetLoading,
    isError: currentBudgetError,
  } = useCurrentBudget({
    accountId: selectedAccountId,
    month: selectedMonth,
    year: selectedYear,
  });

  const openCreateForm = () => {
    setSelectedBudget(null);
    setIsFormOpen(true);
  };

  const openEditForm = (budget) => {
    setSelectedBudget(budget);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setSelectedBudget(null);
    setIsFormOpen(false);

    if (isCreateFromUrl) {
      setSearchParams({});
    }
  };

  const handleSubmit = async (payload) => {
    if (selectedBudget) {
      await updateBudgetMutation.mutateAsync({
        budgetId: selectedBudget._id,
        payload,
      });
      closeForm();
      return;
    }

    await createBudgetMutation.mutateAsync(payload);
    closeForm();
  };

  const handleDelete = (budget) => {
    const confirmed = window.confirm(
      `Delete this ${budget.month}/${budget.year} budget? This cannot be undone.`,
    );

    if (!confirmed) return;

    deleteBudgetMutation.mutate(budget._id);
  };

  if (isLoading || accountsLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 text-center shadow-sm backdrop-blur">
        <p className="text-sm font-medium text-slate-700">Loading budgets...</p>
        <p className="mt-1 text-sm text-slate-500">
          Fetching your budget workspace.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white/90 p-8 text-center shadow-sm backdrop-blur">
        <p className="text-sm font-semibold text-red-600">
          Could not load budgets
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
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-amber-100/80 blur-3xl" />
          <div className="absolute bottom-0 right-24 h-24 w-24 rounded-full bg-emerald-100/70 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                  Budget workspace
                </span>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {budgets.length} budgets
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                Budgets
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                Set monthly spending limits, track progress, and catch overspending before it becomes a habit.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 text-sm font-medium text-amber-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-100 hover:shadow-md"
            >
              <Plus size={17} />
              Create Budget
            </button>
          </div>
        </section>

        <BudgetProgressPanel
          accountId={selectedAccountId}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          currentBudgetData={currentBudgetData}
          isLoading={currentBudgetLoading}
          isError={currentBudgetError}
        />

        <BudgetFilters
          filters={filters}
          accounts={accounts}
          onChange={setFilters}
          onReset={() => setFilters(initialFilters)}
        />

        {budgets.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white/90 p-10 text-center shadow-sm backdrop-blur">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <PiggyBank size={26} />
            </div>

            <h2 className="mt-4 text-xl font-semibold text-slate-950">
              No budgets yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Create a monthly budget for your main account to start tracking spending limits.
            </p>

            <button
              type="button"
              onClick={openCreateForm}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus size={17} />
              Create Budget
            </button>
          </section>
        ) : (
          <section className="grid gap-4 lg:grid-cols-2">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget._id}
                budget={budget}
                onEdit={openEditForm}
                onDelete={handleDelete}
                isDeleting={deleteBudgetMutation.isPending}
              />
            ))}
          </section>
        )}
      </div>

      {shouldShowForm && (
        <BudgetFormModal
          key={selectedBudget?._id || "create-budget"}
          budget={selectedBudget}
          accounts={accounts}
          onClose={closeForm}
          onSubmit={handleSubmit}
          isSubmitting={
            createBudgetMutation.isPending || updateBudgetMutation.isPending
          }
        />
      )}
    </>
  );
};