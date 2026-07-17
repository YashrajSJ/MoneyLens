export const INSIGHT_TYPES = [
  { label: "All types", value: "" },
  { label: "Spending alert", value: "SPENDING_ALERT" },
  { label: "Budget warning", value: "BUDGET_WARNING" },
  { label: "Saving opportunity", value: "SAVING_OPPORTUNITY" },
  { label: "Category trend", value: "CATEGORY_TREND" },
  { label: "General tip", value: "GENERAL_TIP" },
];

export const INSIGHT_SEVERITIES = [
  { label: "All severities", value: "" },
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
];

export const READ_FILTERS = [
  { label: "All", value: "" },
  { label: "Unread", value: "false" },
  { label: "Read", value: "true" },
];

export const formatInsightLabel = (value) => {
  if (!value) return "-";

  return String(value)
    .toLowerCase()
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const getInsightTypeLabel = (type) => {
  return (
    INSIGHT_TYPES.find((item) => item.value === type)?.label ||
    formatInsightLabel(type)
  );
};

export const getInsightSeverityLabel = (severity) => {
  return formatInsightLabel(severity);
};

export const getInsightSeverityClassName = (severity) => {
  if (severity === "HIGH") {
    return "bg-red-50 text-red-700 ring-red-100";
  }

  if (severity === "MEDIUM") {
    return "bg-amber-50 text-amber-700 ring-amber-100";
  }

  return "bg-emerald-50 text-emerald-700 ring-emerald-100";
};

export const getInsightTypeClassName = (type) => {
  if (type === "SPENDING_ALERT") {
    return "bg-red-50 text-red-700 ring-red-100";
  }

  if (type === "BUDGET_WARNING") {
    return "bg-amber-50 text-amber-700 ring-amber-100";
  }

  if (type === "SAVING_OPPORTUNITY") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  }

  if (type === "CATEGORY_TREND") {
    return "bg-sky-50 text-sky-700 ring-sky-100";
  }

  return "bg-slate-100 text-slate-700 ring-slate-200";
};

export const getCurrentMonthYear = () => {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};

export const getMonthOptions = () => {
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const label = new Date(Date.UTC(2000, index, 1)).toLocaleString("en-US", {
      month: "long",
    });

    return {
      label,
      value: month,
    };
  });
};

export const isValidInsightPeriod = ({ month, year }) => {
  const numericMonth = Number(month);
  const numericYear = Number(year);

  return (
    !Number.isNaN(numericMonth) &&
    numericMonth >= 1 &&
    numericMonth <= 12 &&
    !Number.isNaN(numericYear) &&
    numericYear >= 2000 &&
    numericYear <= 2100
  );
};