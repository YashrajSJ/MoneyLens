export const RECURRING_STATUSES = [
  { label: "Active", value: "ACTIVE" },
  { label: "Paused", value: "PAUSED" },
];

export const getRecurringStatusLabel = (status) => {
  return (
    RECURRING_STATUSES.find((item) => item.value === status)?.label || status
  );
};

export const getRecurringStatusClassName = (status) => {
  if (status === "ACTIVE") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  }

  if (status === "PAUSED") {
    return "bg-amber-50 text-amber-700 ring-amber-100";
  }

  return "bg-slate-100 text-slate-600 ring-slate-200";
};

export const getRecurringIntervalLabel = (interval) => {
  const labels = {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    YEARLY: "Yearly",
  };

  return labels[interval] || interval || "-";
};

export const isRecurringDue = (transaction) => {
  if (!transaction?.nextRecurringDate) return false;

  const nextDate = new Date(transaction.nextRecurringDate);

  if (Number.isNaN(nextDate.getTime())) return false;

  return nextDate <= new Date();
};
