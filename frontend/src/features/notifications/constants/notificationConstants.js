export const NOTIFICATION_TYPES = [
  { label: "Budget Alert", value: "BUDGET_ALERT" },
  { label: "Monthly Report", value: "MONTHLY_REPORT" },
  { label: "AI Insight", value: "AI_INSIGHT" },
  { label: "System", value: "SYSTEM" },
  { label: "Test Email", value: "TEST_EMAIL" },
];

export const READ_FILTERS = [
  { label: "All", value: "" },
  { label: "Unread", value: "false" },
  { label: "Read", value: "true" },
];

export const PREFERENCE_FIELDS = [
  {
    key: "emailEnabled",
    label: "Email notifications",
    description: "Allow MoneyLens to send account emails and reports.",
  },
  {
    key: "budgetAlerts",
    label: "Budget alerts",
    description: "Receive alerts when spending crosses budget thresholds.",
  },
  {
    key: "monthlyReports",
    label: "Monthly reports",
    description: "Receive monthly financial summary emails.",
  },
  {
    key: "aiInsights",
    label: "AI insights",
    description: "Receive notifications related to AI-generated insights.",
  },
];

export const MONTH_OPTIONS = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

export const CURRENT_MONTH = new Date().getMonth() + 1;
export const CURRENT_YEAR = new Date().getFullYear();

export const YEAR_OPTIONS = Array.from({ length: 5 }, (_, index) => {
  return CURRENT_YEAR - index;
});

export const getNotificationTypeLabel = (type) => {
  return NOTIFICATION_TYPES.find((item) => item.value === type)?.label || type;
};

export const getNotificationTypeClassName = (type) => {
  if (type === "BUDGET_ALERT") {
    return "bg-amber-50 text-amber-700 ring-amber-100";
  }

  if (type === "MONTHLY_REPORT") {
    return "bg-sky-50 text-sky-700 ring-sky-100";
  }

  if (type === "AI_INSIGHT") {
    return "bg-violet-50 text-violet-700 ring-violet-100";
  }

  if (type === "TEST_EMAIL") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  }

  return "bg-slate-100 text-slate-600 ring-slate-200";
};