import { formatCurrency } from "../../../utils/formatters";

const getMonthName = (month) => {
  return new Date(Date.UTC(2000, Number(month) - 1, 1)).toLocaleString(
    "en-US",
    {
      month: "short",
    },
  );
};

export const MonthlyTrendChart = ({ trends = [] }) => {
  const maxValue = Math.max(
    ...trends.map((trend) =>
      Math.max(Number(trend.income || 0), Number(trend.expenses || 0)),
    ),
    1,
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
      <div>
        <h2 className="font-semibold text-slate-950">Monthly trend</h2>
        <p className="mt-1 text-sm text-slate-500">
          Income, expenses, and net savings across recent months.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {trends.map((trend) => {
          const incomeWidth = `${Math.max(
            (Number(trend.income || 0) / maxValue) * 100,
            trend.income ? 4 : 0,
          )}%`;

          const expenseWidth = `${Math.max(
            (Number(trend.expenses || 0) / maxValue) * 100,
            trend.expenses ? 4 : 0,
          )}%`;

          return (
            <div key={`${trend.year}-${trend.month}`}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <p className="font-medium text-slate-700">
                  {getMonthName(trend.month)} {trend.year}
                </p>
                <p className="text-slate-500">
                  Net:{" "}
                  <span
                    className={
                      Number(trend.netSavings || 0) >= 0
                        ? "font-semibold text-emerald-600"
                        : "font-semibold text-red-500"
                    }
                  >
                    {formatCurrency(trend.netSavings || 0)}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>Income</span>
                    <span>{formatCurrency(trend.income || 0)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: incomeWidth }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>Expenses</span>
                    <span>{formatCurrency(trend.expenses || 0)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-red-400"
                      style={{ width: expenseWidth }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {trends.length === 0 && (
          <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
            No monthly trend data for this period.
          </div>
        )}
      </div>
    </section>
  );
};