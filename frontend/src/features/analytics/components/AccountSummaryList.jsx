import { Landmark } from "lucide-react";

import { formatCurrency } from "../../../utils/formatters";

export const AccountSummaryList = ({ accounts = [] }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
      <div>
        <h2 className="font-semibold text-slate-950">Account performance</h2>
        <p className="mt-1 text-sm text-slate-500">
          Cashflow grouped by account for the selected range.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {accounts.map((item) => {
          const account = item.account;
          const netCashflow = Number(item.netCashflow || 0);

          return (
            <div
              key={account?._id}
              className="rounded-xl border border-slate-100 bg-white px-3 py-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className="flex size-10 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: account?.color || "#0f172a" }}
                  >
                    <Landmark size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {account?.name || "Account"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {item.transactionCount || 0} completed transactions
                    </p>
                  </div>
                </div>

                <p
                  className={
                    netCashflow >= 0
                      ? "text-sm font-semibold text-emerald-600"
                      : "text-sm font-semibold text-red-500"
                  }
                >
                  {formatCurrency(netCashflow)}
                </p>
              </div>

              <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                <div className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">
                  Income: {formatCurrency(item.totalIncome || 0)}
                </div>
                <div className="rounded-lg bg-red-50 px-3 py-2 text-red-600">
                  Expenses: {formatCurrency(item.totalExpenses || 0)}
                </div>
              </div>
            </div>
          );
        })}

        {accounts.length === 0 && (
          <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
            No account summary found.
          </div>
        )}
      </div>
    </section>
  );
};