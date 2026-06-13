export const MAX_BUDGET_AMOUNT = 1000000000;

export const MIN_BUDGET_ALERT_THRESHOLD = 1;
export const MAX_BUDGET_ALERT_THRESHOLD = 100;

export const BUDGET_STATUSES = {
  SAFE: "SAFE",
  WARNING: "WARNING",
  EXCEEDED: "EXCEEDED",
};

export const createBudgetAllowedFields = [
  "accountId",
  "month",
  "year",
  "amount",
  "alertThreshold",
];

export const updateBudgetAllowedFields = ["amount", "alertThreshold"];
