import { Store } from "lucide-react";

import { formatCurrency } from "../../../utils/formatters";

export const TopMerchants = ({ merchants = [] }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
      <div>
        <h2 className="font-semibold text-slate-950">Top merchants</h2>
        <p className="mt-1 text-sm text-slate-500">
          Merchants with the highest completed expenses.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {merchants.map((merchant, index) => (
          <div
            key={merchant.merchantName}
            className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Store size={16} />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-800">
                  {index + 1}. {merchant.merchantName}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {merchant.transactionCount || 0} transactions
                </p>
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-950">
              {formatCurrency(merchant.totalSpent || 0)}
            </p>
          </div>
        ))}

        {merchants.length === 0 && (
          <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
            No merchant data found.
          </div>
        )}
      </div>
    </section>
  );
};