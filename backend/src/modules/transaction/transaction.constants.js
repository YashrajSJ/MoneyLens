export const TRANSACTION_TYPES = ["INCOME", "EXPENSE"];

export const TRANSACTION_STATUSES = ["PENDING", "COMPLETED", "FAILED"];

export const RECURRING_INTERVALS = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];

export const PAYMENT_METHODS = [
  "CARD",
  "CASH",
  "BANK_TRANSFER",
  "UPI",
  "OTHER",
];

export const INCOME_CATEGORIES = [
  "salary",
  "freelance",
  "investments",
  "business",
  "rental",
  "other-income",
];

export const EXPENSE_CATEGORIES = [
  "housing",
  "transportation",
  "groceries",
  "utilities",
  "entertainment",
  "food",
  "shopping",
  "healthcare",
  "education",
  "personal",
  "travel",
  "insurance",
  "gifts",
  "bills",
  "other-expense",
];

export const ALL_CATEGORIES = [
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
];

export const MAX_TRANSACTION_AMOUNT = 100000000;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;