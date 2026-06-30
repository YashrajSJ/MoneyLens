export const QUEUE_NAMES = {
  RECURRING: "recurring-jobs",
  INSIGHT: "insight-jobs",
  RECEIPT: "receipt-jobs",
};

export const JOB_NAMES = {
  PROCESS_DUE_RECURRING: "process-due-recurring",
  GENERATE_INSIGHTS: "generate-insights",
  PARSE_RECEIPT: "parse-receipt",
};

export const JOB_STATUSES = [
  "waiting",
  "active",
  "completed",
  "failed",
  "delayed",
  "paused",
];

export const DEFAULT_RECURRING_JOB_LIMIT = 20;

export const RECURRING_SCHEDULER_PATTERNS = {
  DAILY_2_AM: "0 2 * * *",
};