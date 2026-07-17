import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  Trash2,
} from "lucide-react";

import { formatDate } from "../../../utils/formatters";
import {
  getInsightSeverityClassName,
  getInsightSeverityLabel,
  getInsightTypeClassName,
  getInsightTypeLabel,
} from "../constants/insightConstants";

const getIcon = (severity) => {
  if (severity === "HIGH") {
    return <AlertTriangle size={20} />;
  }

  if (severity === "MEDIUM") {
    return <Lightbulb size={20} />;
  }

  return <Sparkles size={20} />;
};

export const InsightCard = ({
  insight,
  onMarkRead,
  onDelete,
  isMarkingRead,
  isDeleting,
}) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
            {getIcon(insight.severity)}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getInsightTypeClassName(
                  insight.type,
                )}`}
              >
                {getInsightTypeLabel(insight.type)}
              </span>

              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getInsightSeverityClassName(
                  insight.severity,
                )}`}
              >
                {getInsightSeverityLabel(insight.severity)}
              </span>

              {!insight.isRead && (
                <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
                  Unread
                </span>
              )}
            </div>

            <h3 className="mt-3 text-lg font-semibold text-slate-950">
              {insight.title || "Financial insight"}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {insight.message || "No message available for this insight."}
            </p>

            <p className="mt-3 text-xs text-slate-400">
              Generated {formatDate(insight.createdAt)} for {insight.month}/
              {insight.year}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {!insight.isRead && (
          <button
            type="button"
            disabled={isMarkingRead}
            onClick={() => onMarkRead(insight)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 size={15} />
            Mark read
          </button>
        )}

        <button
          type="button"
          disabled={isDeleting}
          onClick={() => onDelete(insight)}
          className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 size={15} />
          Delete
        </button>
      </div>
    </article>
  );
};