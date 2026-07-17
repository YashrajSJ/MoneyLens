import { useMemo, useState } from "react";
import { BrainCircuit } from "lucide-react";
import { toast } from "sonner";

import { GenerateInsightsPanel } from "../features/insights/components/GenerateInsightsPanel";
import { InsightCard } from "../features/insights/components/InsightCard";
import { InsightFilters } from "../features/insights/components/InsightFilters";
import { MonthlySummaryPanel } from "../features/insights/components/MonthlySummaryPanel";
import {
  getCurrentMonthYear,
  isValidInsightPeriod,
} from "../features/insights/constants/insightConstants";
import {
  useDeleteInsight,
  useGenerateInsights,
  useInsights,
  useMarkInsightAsRead,
  useMonthlyInsightSummary,
} from "../features/insights/hooks/useInsights";

const currentMonthYear = getCurrentMonthYear();

const initialFilters = {
  type: "",
  severity: "",
  isRead: "",
  month: currentMonthYear.month,
  year: currentMonthYear.year,
  page: 1,
  limit: 20,
};

const cleanFilters = (filters) => {
  const cleaned = Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );

  if (
    !isValidInsightPeriod({
      month: cleaned.month,
      year: cleaned.year,
    })
  ) {
    delete cleaned.month;
    delete cleaned.year;
  }

  return cleaned;
};

export const InsightsPage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [lastGeneratedResult, setLastGeneratedResult] = useState(null);

  const selectedPeriodValid = isValidInsightPeriod({
    month: filters.month,
    year: filters.year,
  });

  const queryFilters = useMemo(() => cleanFilters(filters), [filters]);

  const { data, isLoading, isError, refetch } = useInsights(queryFilters);

  const {
    data: summaryData,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useMonthlyInsightSummary(
    {
      month: Number(filters.month),
      year: Number(filters.year),
    },
    {
      enabled: selectedPeriodValid,
    },
  );

  const generateMutation = useGenerateInsights();
  const markReadMutation = useMarkInsightAsRead();
  const deleteMutation = useDeleteInsight();

  const insights = data?.insights || [];
  const pagination = data?.pagination;

  const hasListFilters =
    Boolean(filters.type) || Boolean(filters.severity) || Boolean(filters.isRead);

  const handleGenerate = async ({ month, year }) => {
    const numericMonth = Number(month);
    const numericYear = Number(year);

    if (
      !isValidInsightPeriod({
        month: numericMonth,
        year: numericYear,
      })
    ) {
      toast.error("Please select a valid month and year");
      return;
    }

    try {
      const result = await generateMutation.mutateAsync({
        month: numericMonth,
        year: numericYear,
      });

      setLastGeneratedResult(result);
    } catch {
      // Error toast is handled by the mutation hook.
    }
  };

  const handleMarkRead = (insight) => {
    markReadMutation.mutate(insight._id);
  };

  const handleDelete = (insight) => {
    const confirmed = window.confirm(
      `Delete "${insight.title || "this insight"}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    deleteMutation.mutate(insight._id);
  };

  const goToPage = (page) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      page,
    }));
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 text-center shadow-sm backdrop-blur">
        <p className="text-sm font-medium text-slate-700">
          Loading AI insights...
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Fetching saved recommendations and monthly context.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white/90 p-8 text-center shadow-sm backdrop-blur">
        <p className="text-sm font-semibold text-red-600">
          Could not load insights
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Please retry once. If the issue continues, check your session.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GenerateInsightsPanel
        month={filters.month}
        year={filters.year}
        onGenerate={handleGenerate}
        isGenerating={generateMutation.isPending}
        lastGeneratedResult={lastGeneratedResult}
      />

      <MonthlySummaryPanel
        summaryData={summaryData}
        isLoading={summaryLoading}
        isError={summaryError}
        isPeriodInvalid={!selectedPeriodValid}
      />

      <InsightFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(initialFilters)}
      />

      {insights.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/90 p-10 text-center shadow-sm backdrop-blur">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <BrainCircuit size={26} />
          </div>

          <h2 className="mt-4 text-xl font-semibold text-slate-950">
            {hasListFilters ? "No matching insights" : "No insights yet"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {hasListFilters
              ? "No insights match the selected filters. Try resetting filters or generate insights for this month."
              : "Generate insights for the selected month to get spending alerts, budget warnings, and saving suggestions."}
          </p>
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {insights.map((insight) => (
            <InsightCard
              key={insight._id}
              insight={insight}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
              isMarkingRead={markReadMutation.isPending}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </section>
      )}

      {pagination?.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-slate-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => goToPage(pagination.page - 1)}
            className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => goToPage(pagination.page + 1)}
            className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};