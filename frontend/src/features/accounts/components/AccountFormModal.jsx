import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { ACCOUNT_COLORS, ACCOUNT_TYPES } from "../constants/accountConstants";

const initialForm = {
  name: "",
  type: "SAVINGS",
  balance: "",
  isDefault: false,
  institutionName: "",
  color: "#059669",
};

export const AccountFormModal = ({
  open,
  account,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const isEditing = Boolean(account);

  const getInitialForm = (account) => {
    if (!account) {
      return initialForm;
    }

    return {
      name: account.name || "",
      type: account.type || "SAVINGS",
      balance: account.balance ?? "",
      isDefault: Boolean(account.isDefault),
      institutionName: account.institutionName || "",
      color: account.color || "#059669",
    };
  };

  const [form, setForm] = useState(() => getInitialForm(account));

  if (!open) return null;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      type: form.type,
      isDefault: form.isDefault,
      institutionName: form.institutionName.trim() || undefined,
      color: form.color,
    };

    if (!isEditing) {
      const balance = Number(form.balance || 0);

      if (Number.isNaN(balance) || balance < 0) {
        toast.error("Opening balance must be a valid positive number");
        return;
      }

      payload.balance = balance;
    }

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <section className="max-h-[calc(100vh-7rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              {isEditing ? "Edit account" : "New account"}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              {isEditing ? "Update account details" : "Add a financial account"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Accounts help organize your balances, transactions, budgets, and
              reports.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
            aria-label="Close account form"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="accountName"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Account name
            </label>
            <input
              id="accountName"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={50}
              placeholder="HDFC Savings"
              value={form.name}
              onChange={handleChange}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="accountType"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Account type
              </label>
              <select
                id="accountType"
                name="type"
                value={form.type}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
              >
                {ACCOUNT_TYPES.map((accountType) => (
                  <option key={accountType.value} value={accountType.value}>
                    {accountType.label}
                  </option>
                ))}
              </select>
            </div>

            {!isEditing && (
              <div>
                <label
                  htmlFor="accountBalance"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Opening balance
                </label>
                <input
                  id="accountBalance"
                  name="balance"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0"
                  value={form.balance}
                  onChange={handleChange}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
                />
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="institutionName"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Institution name
            </label>
            <input
              id="institutionName"
              name="institutionName"
              type="text"
              placeholder="Bank, wallet, or institution name"
              value={form.institutionName}
              onChange={handleChange}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Account color
            </p>

            <div className="flex flex-wrap gap-2">
              {ACCOUNT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      color,
                    }))
                  }
                  className={
                    form.color === color
                      ? "size-8 rounded-full ring-2 ring-slate-950 ring-offset-2"
                      : "size-8 rounded-full ring-1 ring-slate-200 ring-offset-2"
                  }
                  style={{ backgroundColor: color }}
                  aria-label={`Choose color ${color}`}
                />
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
            <input
              name="isDefault"
              type="checkbox"
              checked={form.isDefault}
              onChange={handleChange}
              className="size-4 rounded border-slate-300 text-emerald-600"
            />
            Set as default account
          </label>

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
                  : "Create account"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
