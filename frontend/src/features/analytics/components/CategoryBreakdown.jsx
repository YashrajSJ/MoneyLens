import { formatCurrency } from "../../../utils/formatters";

const formatCategory = (category) => {
  if (!category) return "Uncategorized";

  return String(category)
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const CategoryBreakdown = ({ categories = [] }) => {
  const totalSpent = categories.reduce(
    (total, category) => total + Number(category.totalSpent || 0),
    0,
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
      <div>
        <h2 className="font-semibold text-slate-950">Spending by category</h2>
        <p className="mt-1 text-sm text-slate-500">
          Where most of your completed expenses went.
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {categories.map((category) => {
          const percentage =
            totalSpent > 0
              ? Math.round((Number(category.totalSpent || 0) / totalSpent) * 100)
              : 0;

          return (
            <div key={category.category}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  {formatCategory(category.category)}
                </span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(category.totalSpent || 0)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-medium text-slate-500">
                  {percentage}%
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                {category.transactionCount || 0} transactions
              </p>
            </div>
          );
        })}

        {categories.length === 0 && (
          <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
            No category spending found for this range.
          </div>
        )}
      </div>
    </section>
  );
};