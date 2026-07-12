import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BadgeIndianRupee, Landmark, Plus } from "lucide-react";

import { AccountCard } from "../features/accounts/components/AccountCard";
import { AccountFormModal } from "../features/accounts/components/AccountFormModal";
import {
  useAccounts,
  useCreateAccount,
  useDeleteAccount,
  useSetDefaultAccount,
  useUpdateAccount,
} from "../features/accounts/hooks/useAccounts";
import { formatCurrency } from "../utils/formatters";

export const AccountsPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const isCreateFromUrl = searchParams.get("create") === "true";
  const shouldShowForm = isFormOpen || isCreateFromUrl;

  const { data, isLoading, isError, refetch } = useAccounts();
  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();
  const setDefaultMutation = useSetDefaultAccount();
  const deleteAccountMutation = useDeleteAccount();

  const accounts = data?.accounts || [];

  const totalBalance = accounts.reduce(
    (total, account) => total + Number(account.balance || 0),
    0,
  );

  const openCreateForm = () => {
    setSelectedAccount(null);
    setIsFormOpen(true);
  };

  const openEditForm = (account) => {
    setSelectedAccount(account);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setSelectedAccount(null);
    setIsFormOpen(false);

    if (isCreateFromUrl) {
      setSearchParams({});
    }
  };

  const handleSubmit = async (payload) => {
    if (selectedAccount) {
      await updateAccountMutation.mutateAsync({
        accountId: selectedAccount._id,
        payload,
      });
      closeForm();
      return;
    }

    await createAccountMutation.mutateAsync(payload);
    closeForm();
  };

  const handleDelete = (account) => {
    const confirmed = window.confirm(
      `Delete "${account.name}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    deleteAccountMutation.mutate(account._id);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 text-center shadow-sm backdrop-blur">
        <p className="text-sm font-medium text-slate-700">
          Loading accounts...
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Fetching your financial accounts.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white/90 p-8 text-center shadow-sm backdrop-blur">
        <p className="text-sm font-semibold text-red-600">
          Could not load accounts
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
                  Account workspace
                </span>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {accounts.length} linked accounts
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                Your accounts
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                Keep your bank accounts, wallets, cash, and cards organized in
                one place.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-3.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
            >
              <Plus size={17} />
              Add Account
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Total balance</p>
              <BadgeIndianRupee size={18} className="text-slate-500" />
            </div>

            <p className="mt-4 text-3xl font-semibold text-slate-950">
              {formatCurrency(totalBalance)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Across all active accounts
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Default account</p>
              <Landmark size={18} className="text-emerald-600" />
            </div>

            <p className="mt-4 text-2xl font-semibold text-slate-950">
              {accounts.find((account) => account.isDefault)?.name || "Not set"}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Used for quick transaction entry
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Account count</p>
              <Plus size={18} className="text-slate-500" />
            </div>

            <p className="mt-4 text-3xl font-semibold text-slate-950">
              {accounts.length}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Accounts connected to MoneyLens
            </p>
          </article>
        </section>

        {accounts.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white/90 p-10 text-center shadow-sm backdrop-blur">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Landmark size={26} />
            </div>

            <h2 className="mt-4 text-xl font-semibold text-slate-950">
              No accounts yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Add your bank account, wallet, or cash balance so MoneyLens knows
              where your money is.
            </p>

            <button
              type="button"
              onClick={openCreateForm}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus size={17} />
              Add Account
            </button>
          </section>
        ) : (
          <section className="grid gap-4 lg:grid-cols-2">
            {accounts.map((account) => (
              <AccountCard
                key={account._id}
                account={account}
                canDelete={accounts.length > 1}
                onEdit={openEditForm}
                onDelete={handleDelete}
                onSetDefault={(accountId) =>
                  setDefaultMutation.mutate(accountId)
                }
                isSettingDefault={setDefaultMutation.isPending}
                isDeleting={deleteAccountMutation.isPending}
              />
            ))}
          </section>
        )}
      </div>

      {shouldShowForm && (
        <AccountFormModal
          key={selectedAccount?._id || "create-account"}
          open={shouldShowForm}
          account={selectedAccount}
          onClose={closeForm}
          onSubmit={handleSubmit}
          isSubmitting={
            createAccountMutation.isPending || updateAccountMutation.isPending
          }
        />
      )}
    </>
  );
};