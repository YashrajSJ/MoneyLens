import {
  CreditCard,
  Landmark,
  MoreHorizontal,
  Pencil,
  Star,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { formatCurrency } from "../../../utils/formatters";
import { getAccountTypeLabel } from "../constants/accountConstants";

const AccountTypeIcon = ({ type, ...props }) => {
  if (type === "CREDIT_CARD") {
    return <CreditCard {...props} />;
  }

  if (type === "CASH") {
    return <Wallet {...props} />;
  }

  if (type === "INVESTMENT") {
    return <TrendingUp {...props} />;
  }

  return <Landmark {...props} />;
};

export const AccountCard = ({
  account,
  canDelete,
  onEdit,
  onDelete,
  onSetDefault,
  isSettingDefault,
  isDeleting,
}) => {

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: account.color || "#0f172a" }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className="flex size-11 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ backgroundColor: account.color || "#0f172a" }}
            >
              <AccountTypeIcon type={account.type} size={21} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-slate-950">
                  {account.name}
                </h3>

                {account.isDefault && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-100">
                    <Star size={12} className="fill-amber-500 text-amber-500" />
                    Default
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-slate-500">
                {getAccountTypeLabel(account.type)}
                {account.institutionName ? ` • ${account.institutionName}` : ""}
              </p>
            </div>
          </div>

          <MoreHorizontal
            size={18}
            className="text-slate-400 transition group-hover:text-slate-600"
          />
        </div>

        <div className="mt-6">
          <p className="text-sm text-slate-500">Available balance</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(account.balance)}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onEdit(account)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Pencil size={15} />
            Edit
          </button>

          {!account.isDefault && (
            <button
              type="button"
              disabled={isSettingDefault}
              onClick={() => onSetDefault(account._id)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 text-sm font-medium text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Star size={15} />
              Set default
            </button>
          )}

          <button
            type="button"
            disabled={!canDelete || isDeleting}
            onClick={() => onDelete(account)}
            className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            title={
              !canDelete
                ? "You must keep at least one account"
                : "Deletion may be blocked if this account has transactions or budgets"
            }
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
};