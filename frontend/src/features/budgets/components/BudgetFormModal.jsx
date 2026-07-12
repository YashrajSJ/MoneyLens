import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { MONTH_OPTIONS, YEAR_OPTIONS } from "../constants/budgetConstants";

const getInitialForm = (budget) => {
  const now = new Date();

  return {
    accountId: budget?.accountId?._id || budget?.accountId || "",
    month: budget?.month || now.getMonth() + 1,
    year: budget?.year || now.getFullYear(),
    amount: budget?.amount ?? "",
    alertThreshold: budget?.alertThreshold ?? 80,
  };
};

export const BudgetFormModal = ({
  budget,
  accounts,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [form, setForm] = useState(() => getInitialForm(budget));

  const isEditing = Boolean(budget);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const amount = Number(form.amount);
    const alertThreshold = Number(form.alertThreshold);

    if (!isEditing && !form.accountId) {
      toast.error("Please select an account");
      return;
    }

    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Budget amount must be greater than 0");
      return;
    }

    if (
      Number.isNaN(alertThreshold) ||
      alertThreshold < 1 ||
      alertThreshold > 100
    ) {
      toast.error("Alert threshold must be between 1 and 100");
      return;
    }

    if (isEditing) {
      await onSubmit({
        amount,
        alertThreshold,
      });

      return;
    }

    await onSubmit({
      accountId: form.accountId,
      month: Number(form.month),
      year: Number(form.year),
      amount,
      alertThreshold,
    });
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              {isEditing ? "Edit budget" : "Create budget"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Set a monthly spending limit for one account.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close budget form"
          >
            <X size={19} />
          </button>
        </div>

        {accounts.length === 0 ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Create an account first before setting a budget.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="budgetAccount"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Account
              </label>
              <select
                id="budgetAccount"
                name="accountId"
                value={form.accountId}
                onChange={handleChange}
                disabled={isEditing}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 disabled:bg-slate-100 disabled:text-slate-500"
              >
                <option value="">Select account</option>
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.name}
                  </option>
                ))}
              </select>
              {isEditing && (
                <p className="mt-1 text-xs text-slate-500">
                  Account cannot be changed after budget creation.
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="budgetMonth"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Month
                </label>
                <select
                  id="budgetMonth"
                  name="month"
                  value={form.month}
                  onChange={handleChange}
                  disabled={isEditing}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 disabled:bg-slate-100 disabled:text-slate-500"
                >
                  {MONTH_OPTIONS.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="budgetYear"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Year
                </label>
                <select
                  id="budgetYear"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  disabled={isEditing}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 disabled:bg-slate-100 disabled:text-slate-500"
                >
                  {YEAR_OPTIONS.map((year) => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="budgetAmount"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Budget amount
              </label>
              <input
                id="budgetAmount"
                name="amount"
                type="text"
                inputMode="decimal"
                value={form.amount}
                onChange={handleChange}
                placeholder="10000"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
              />
            </div>

            <div>
              <label
                htmlFor="budgetAlertThreshold"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Alert threshold
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="budgetAlertThreshold"
                  name="alertThreshold"
                  type="range"
                  min="1"
                  max="100"
                  value={form.alertThreshold}
                  onChange={handleChange}
                  className="w-full accent-emerald-600"
                />
                <span className="w-12 rounded-lg bg-slate-100 px-2 py-1 text-center text-sm font-medium text-slate-700">
                  {form.alertThreshold}%
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                MoneyLens will warn when spending reaches this percentage.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-10 items-center rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                    ? "Save changes"
                    : "Create budget"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};
