export const RECEIPT_STATUSES = [
  { label: "All", value: "" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Parsed", value: "PARSED" },
  { label: "Failed", value: "FAILED" },
];

export const getReceiptStatusClassName = (status) => {
  if (status === "PARSED") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  }

  if (status === "PROCESSING") {
    return "bg-sky-50 text-sky-700 ring-sky-100";
  }

  if (status === "FAILED") {
    return "bg-red-50 text-red-600 ring-red-100";
  }

  return "bg-slate-100 text-slate-600 ring-slate-200";
};

export const getReceiptStatusLabel = (status) => {
  const item = RECEIPT_STATUSES.find((statusItem) => statusItem.value === status);
  return item?.label || status || "-";
};

export const getConfidenceLabel = (confidence) => {
  if (confidence === undefined || confidence === null) return "Not provided";

  const value = Number(confidence);

  if (Number.isNaN(value)) return "Not provided";

  const percentage = value <= 1 ? value * 100 : value;
  const safePercentage = Math.min(Math.max(percentage, 0), 100);

  return `${Math.round(safePercentage)}% confidence`;
};