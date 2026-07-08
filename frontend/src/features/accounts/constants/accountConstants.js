export const ACCOUNT_TYPES = [
  {
    label: "Savings",
    value: "SAVINGS",
  },
  {
    label: "Current",
    value: "CURRENT",
  },
  {
    label: "Credit Card",
    value: "CREDIT_CARD",
  },
  {
    label: "Cash",
    value: "CASH",
  },
  {
    label: "Investment",
    value: "INVESTMENT",
  },
];

export const ACCOUNT_COLORS = [
  "#059669",
  "#0f766e",
  "#0284c7",
  "#4f46e5",
  "#9333ea",
  "#dc2626",
  "#d97706",
  "#334155",
];

export const getAccountTypeLabel = (type) => {
  return ACCOUNT_TYPES.find((accountType) => accountType.value === type)?.label || type;
};