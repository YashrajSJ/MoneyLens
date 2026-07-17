import { Loader2, Sparkles } from "lucide-react";

export const GenerateInsightsPanel = ({
  month,
  year,
  onGenerate,
  isGenerating,
  lastGeneratedResult,
}) => {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-rose-200 bg-white/90 p-5 shadow-sm backdrop-blur md:p-6">
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-rose-100/80 blur-3xl" />
      <div className="absolute bottom-0 right-24 h-24 w-24 rounded-full bg-amber-100/80 blur-3xl" />

      <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <div className="inline-flex items-center rounded-full bg-gradient-to-r from-rose-200 via-amber-200 to-emerald-200 p-px">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-800">
              <Sparkles size={14} className="text-rose-500" />
              Powered by AI
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            AI Financial Insights
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
            Generate practical spending suggestions from your accounts,
            transactions, budgets, and monthly activity.
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Generation uses the selected month and year. Type, severity, and
            read status filters only affect the saved insights list below.
          </p>

          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900">
            AI insights are suggestions, not financial advice. Always review
            them before making money decisions.
          </p>

          {lastGeneratedResult && (
            <p className="mt-3 text-sm text-slate-500">
              {lastGeneratedResult.fromCache
                ? "Recent insights were reused because generation has a cooldown."
                : "Fresh insights were generated for the selected month."}
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={isGenerating}
          onClick={() => onGenerate({ month, year })}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Sparkles size={17} />
          )}
          {isGenerating ? "Generating..." : "Generate insights"}
        </button>
      </div>
    </section>
  );
};