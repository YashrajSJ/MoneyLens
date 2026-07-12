export const MONTH_OPTIONS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export const CURRENT_YEAR = new Date().getFullYear();

export const YEAR_OPTIONS = Array.from({ length: 7 }, (_, index) => {
  const year = CURRENT_YEAR - 2 + index;

  return {
    value: year,
    label: String(year),
  };
});

export const BUDGET_STATUS_STYLES = {
  SAFE: {
    label: "Safe",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    barClassName: "bg-emerald-600",
  },
  WARNING: {
    label: "Warning",
    className: "bg-amber-50 text-amber-700 ring-amber-100",
    barClassName: "bg-amber-500",
  },
  EXCEEDED: {
    label: "Exceeded",
    className: "bg-red-50 text-red-600 ring-red-100",
    barClassName: "bg-red-500",
  },
};

export const getMonthLabel = (month) => {
  return (
    MONTH_OPTIONS.find((option) => Number(option.value) === Number(month))
      ?.label || "-"
  );
};

export const getBudgetStatusStyle = (status) => {
  return BUDGET_STATUS_STYLES[status] || BUDGET_STATUS_STYLES.SAFE;
};