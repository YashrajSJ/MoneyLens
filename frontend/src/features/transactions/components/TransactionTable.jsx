import {
  ArrowDownRight,
  ArrowUpRight,
  Pencil,
  Trash2,
} from "lucide-react";

import { formatCurrency, formatDate } from "../../../utils/formatters";
import {
  getCategoryLabel,
  getPaymentMethodLabel,
} from "../constants/transactionConstants";

const getStatusClassName = (status) => {
  if (status === "COMPLETED") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  }

  if (status === "FAILED") {
    return "bg-red-50 text-red-600 ring-red-100";
  }

  return "bg-amber-50 text-amber-700 ring-amber-100";
};

export const TransactionTable = ({
  transactions,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
}) => {
  const allSelected =
    transactions.length > 0 &&
    transactions.every((transaction) => selectedIds.includes(transaction._id));

  if (transactions.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white/90 p-10 text-center shadow-sm backdrop-blur">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <ArrowDownRight size={26} />
        </div>

        <h2 className="mt-4 text-xl font-semibold text-slate-950">
          No transactions found
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          Add your first income or expense transaction to start building your
          financial history.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="size-4 rounded border-slate-300"
                  aria-label="Select all transactions"
                />
              </th>
              <th className="px-4 py-3">Transaction</th>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {transactions.map((transaction) => {
              const isIncome = transaction.type === "INCOME";
              const account = transaction.accountId;

              return (
                <tr key={transaction._id} className="transition hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(transaction._id)}
                      onChange={() => onToggleSelect(transaction._id)}
                      className="size-4 rounded border-slate-300"
                      aria-label={`Select ${transaction.description || "transaction"}`}
                    />
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={
                          isIncome
                            ? "flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"
                            : "flex size-9 items-center justify-center rounded-full bg-red-50 text-red-600"
                        }
                      >
                        {isIncome ? (
                          <ArrowUpRight size={16} />
                        ) : (
                          <ArrowDownRight size={16} />
                        )}
                      </div>

                      <div>
                        <p className="font-medium text-slate-900">
                          {transaction.description || "Untitled transaction"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {transaction.merchantName ||
                            getPaymentMethodLabel(transaction.paymentMethod)}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {account?.name || "Account"}
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {getCategoryLabel(transaction.category)}
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {formatDate(transaction.date)}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${getStatusClassName(
                        transaction.status,
                      )}`}
                    >
                      {transaction.status}
                    </span>
                  </td>

                  <td
                    className={
                      isIncome
                        ? "px-4 py-4 text-right font-semibold text-emerald-600"
                        : "px-4 py-4 text-right font-semibold text-red-500"
                    }
                  >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(transaction)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                        aria-label="Edit transaction"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(transaction)}
                        className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                        aria-label="Delete transaction"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};