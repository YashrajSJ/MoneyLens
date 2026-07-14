import { useMemo, useState } from "react";
import { BarChart3, Sparkles } from "lucide-react";

import { useAccounts } from "../features/accounts/hooks/useAccounts";
import { AccountSummaryList } from "../features/analytics/components/AccountSummaryList";
import { AnalyticsFilters } from "../features/analytics/components/AnalyticsFilters";
import { BudgetProgressCard } from "../features/analytics/components/BudgetProgressCard";
import { CategoryBreakdown } from "../features/analytics/components/CategoryBreakdown";
import { MonthlyTrendChart } from "../features/analytics/components/MonthlyTrendChart";
import { SummaryCards } from "../features/analytics/components/SummaryCards";
import { TopMerchants } from "../features/analytics/components/TopMerchants";
import {
  useAccountSummary,
  useBudgetProgressAnalytics,
  useCategoryBreakdown,
  useMonthlyTrend,
  useSummaryAnalytics,
  useTopMerchants,
} from "../features/analytics/hooks/useAnalytics";

const initialFilters = {
  accountId: "",
  from: "",
  to: "",
};

const cleanFilters = (filters) => {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== "" && value !== null,
    ),
  );
};

export const AnalyticsPage = () => {
  const [filters, setFilters] = useState(initialFilters);

  const queryFilters = useMemo(() => cleanFilters(filters), [filters]);

  const { data: accountData, isLoading: accountsLoading } = useAccounts();
  const accounts = accountData?.accounts || [];

  const defaultAccountId =
    filters.accountId ||
    accounts.find((account) => account.isDefault)?._id ||
    accounts[0]?._id ||
    "";

  const {
    data: summaryData,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useSummaryAnalytics(queryFilters);

  const { data: categoryData, isLoading: categoryLoading } =
    useCategoryBreakdown(queryFilters);

  const { data: trendData, isLoading: trendLoading } = useMonthlyTrend({
    accountId: filters.accountId,
    months: 6,
  });

  const { data: merchantData, isLoading: merchantLoading } = useTopMerchants({
    ...queryFilters,
    limit: 5,
  });

  const { data: accountSummaryData, isLoading: accountSummaryLoading } =
    useAccountSummary(queryFilters);

  const { data: budgetProgressData, isLoading: budgetProgressLoading } =
    useBudgetProgressAnalytics({
      accountId: defaultAccountId,
    });

  const isLoading =
    accountsLoading ||
    summaryLoading ||
    categoryLoading ||
    trendLoading ||
    merchantLoading ||
    accountSummaryLoading ||
    budgetProgressLoading;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 text-center shadow-sm backdrop-blur">
        <p className="text-sm font-medium text-slate-700">
          Loading analytics...
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Preparing your financial reports.
        </p>
      </div>
    );
  }

  if (summaryError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white/90 p-8 text-center shadow-sm backdrop-blur">
        <p className="text-sm font-semibold text-red-600">
          Could not load analytics
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Please retry once. If the issue continues, check your session.
        </p>
        <button
          type="button"
          onClick={() => refetchSummary()}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur md:p-6">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-sky-100/80 blur-3xl" />
        <div className="absolute bottom-0 right-24 h-24 w-24 rounded-full bg-emerald-100/70 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
                Analytics workspace
              </span>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                Completed transactions only
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              Analytics
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
              Understand income, expenses, budget usage, merchants, categories,
              and account cashflow in one place.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sky-800">
            <BarChart3 size={20} />
            <div>
              <p className="text-sm font-semibold">Insight-ready data</p>
              <p className="text-xs text-sky-700">
                Feeds future AI recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      <AnalyticsFilters
        filters={filters}
        accounts={accounts}
        onChange={setFilters}
        onReset={() => setFilters(initialFilters)}
      />

      <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-lg font-semibold text-slate-700 shadow-sm backdrop-blur">
        The below figures include only completed transactions inside the selected
        date range and account filter. If no date range is selected, the current
        month is used by default.
      </div>

      <SummaryCards summary={summaryData?.summary} />

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <MonthlyTrendChart trends={trendData?.trends || []} />

        <BudgetProgressCard data={budgetProgressData} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <CategoryBreakdown categories={categoryData?.categories || []} />

        <TopMerchants merchants={merchantData?.merchants || []} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <AccountSummaryList accounts={accountSummaryData?.accounts || []} />

        <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Sparkles size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-950">
                AI insight preview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                This analytics data will power spending recommendations.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-rose-100 bg-linear-to-r from-rose-50 via-amber-50 to-emerald-50 p-4">
            <p className="text-sm font-medium text-slate-800">
              MoneyLens can later explain why spending changed, which categories
              need attention, and where budget risk is increasing.
            </p>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            AI insights are suggestions, not financial advice. Final decisions
            should always stay with the user.
          </p>
        </section>
      </section>
    </div>
  );
};
