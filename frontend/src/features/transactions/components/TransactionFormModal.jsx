import { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

import {
  getCategoriesByType,
  PAYMENT_METHODS,
  RECURRING_INTERVALS,
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
} from "../constants/transactionConstants";

const today = new Date().toISOString().slice(0, 10);

const getTransactionAccountId = (transaction) => {
  if (!transaction?.accountId) return "";

  return typeof transaction.accountId === "object"
    ? transaction.accountId._id
    : transaction.accountId;
};

const getInitialForm = (transaction) => {
  if (!transaction) {
    return {
      accountId: "",
      type: "EXPENSE",
      amount: "",
      description: "",
      category: "groceries",
      date: today,
      paymentMethod: "OTHER",
      merchantName: "",
      status: "COMPLETED",
      isRecurring: false,
      recurringInterval: "MONTHLY",
    };
  }

  return {
    accountId: getTransactionAccountId(transaction),
    type: transaction.type || "EXPENSE",
    amount: transaction.amount ?? "",
    description: transaction.description || "",
    category: transaction.category || "groceries",
    date: transaction.date ? transaction.date.slice(0, 10) : today,
    paymentMethod: transaction.paymentMethod || "OTHER",
    merchantName: transaction.merchantName || "",
    status: transaction.status || "COMPLETED",
    isRecurring: Boolean(transaction.isRecurring),
    recurringInterval: transaction.recurringInterval || "MONTHLY",
  };
};

export const TransactionFormModal = ({
  open,
  transaction,
  accounts,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const isEditing = Boolean(transaction);
  const [form, setForm] = useState(() => getInitialForm(transaction));

  if (!open) return null;

  const categories = getCategoriesByType(form.type);

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleTypeChange = (type) => {
    const nextCategories = getCategoriesByType(type);

    setForm((currentForm) => ({
      ...currentForm,
      type,
      category: nextCategories[0]?.value || "",
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const amount = Number(form.amount);

    if (!form.accountId) {
      toast.error("Please select an account");
      return;
    }

    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }

    if (!form.category) {
      toast.error("Please select a category");
      return;
    }

    if (!form.date) {
      toast.error("Please select a date");
      return;
    }

    if (form.isRecurring && !form.recurringInterval) {
      toast.error("Please select recurring interval");
      return;
    }

    const payload = {
      accountId: form.accountId,
      type: form.type,
      amount,
      description: form.description.trim() || undefined,
      category: form.category,
      date: new Date(form.date).toISOString(),
      paymentMethod: form.paymentMethod,
      merchantName: form.merchantName.trim() || undefined,
      status: form.status,
      isRecurring: form.isRecurring,
      recurringInterval: form.isRecurring ? form.recurringInterval : undefined,
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <section className="max-h-[calc(100vh-7rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              {isEditing ? "Edit transaction" : "New transaction"}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              {isEditing ? "Update transaction" : "Add transaction"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Transactions update account balances only after backend validation succeeds.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
            aria-label="Close transaction form"
          >
            <X size={18} />
          </button>
        </div>

        {accounts.length === 0 ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Create an account first before adding transactions.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="transactionAccount"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Account
                </label>
                <select
                  id="transactionAccount"
                  value={form.accountId}
                  onChange={(event) => updateField("accountId", event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
                >
                  <option value="">Select account</option>
                  {accounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="transactionType"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Type
                </label>
                <select
                  id="transactionType"
                  value={form.type}
                  onChange={(event) => handleTypeChange(event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
                >
                  {TRANSACTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="transactionAmount"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Amount
                </label>
                <input
                  id="transactionAmount"
                  type="number"
                  min={0.01}
                  step="0.01"
                  value={form.amount}
                  onChange={(event) => updateField("amount", event.target.value)}
                  placeholder="0"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
                />
              </div>

              <div>
                <label
                  htmlFor="transactionDate"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Date
                </label>
                <input
                  id="transactionDate"
                  type="date"
                  value={form.date}
                  onChange={(event) => updateField("date", event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="transactionCategory"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Category
                </label>
                <select
                  id="transactionCategory"
                  value={form.category}
                  onChange={(event) => updateField("category", event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="paymentMethod"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Payment method
                </label>
                <select
                  id="paymentMethod"
                  value={form.paymentMethod}
                  onChange={(event) =>
                    updateField("paymentMethod", event.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="transactionDescription"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Description
              </label>
              <input
                id="transactionDescription"
                type="text"
                maxLength={200}
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="Grocery bill, salary, rent..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="merchantName"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Merchant name
                </label>
                <input
                  id="merchantName"
                  type="text"
                  maxLength={100}
                  value={form.merchantName}
                  onChange={(event) => updateField("merchantName", event.target.value)}
                  placeholder="Amazon, D-Mart, employer..."
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
                />
              </div>

              <div>
                <label
                  htmlFor="transactionStatus"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Status
                </label>
                <select
                  id="transactionStatus"
                  value={form.status}
                  onChange={(event) => updateField("status", event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
                >
                  {TRANSACTION_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isRecurring}
                  onChange={(event) =>
                    updateField("isRecurring", event.target.checked)
                  }
                  className="size-4 rounded border-slate-300 text-emerald-600"
                />
                Make this recurring
              </label>

              {form.isRecurring && (
                <select
                  value={form.recurringInterval}
                  onChange={(event) =>
                    updateField("recurringInterval", event.target.value)
                  }
                  className="mt-3 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
                >
                  {RECURRING_INTERVALS.map((interval) => (
                    <option key={interval.value} value={interval.value}>
                      {interval.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                    ? "Save changes"
                    : "Create transaction"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};