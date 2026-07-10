export const TRANSACTION_TYPES = [
  { label: "Income", value: "INCOME" },
  { label: "Expense", value: "EXPENSE" },
];

export const TRANSACTION_STATUSES = [
  { label: "Completed", value: "COMPLETED" },
  { label: "Pending", value: "PENDING" },
  { label: "Failed", value: "FAILED" },
];

export const PAYMENT_METHODS = [
  { label: "Card", value: "CARD" },
  { label: "Cash", value: "CASH" },
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
  { label: "UPI", value: "UPI" },
  { label: "Other", value: "OTHER" },
];

export const RECURRING_INTERVALS = [
  { label: "Daily", value: "DAILY" },
  { label: "Weekly", value: "WEEKLY" },
  { label: "Monthly", value: "MONTHLY" },
  { label: "Yearly", value: "YEARLY" },
];

export const INCOME_CATEGORIES = [
  { label: "Salary", value: "salary" },
  { label: "Freelance", value: "freelance" },
  { label: "Investments", value: "investments" },
  { label: "Business", value: "business" },
  { label: "Rental", value: "rental" },
  { label: "Other Income", value: "other-income" },
];

export const EXPENSE_CATEGORIES = [
  { label: "Housing", value: "housing" },
  { label: "Transportation", value: "transportation" },
  { label: "Groceries", value: "groceries" },
  { label: "Utilities", value: "utilities" },
  { label: "Entertainment", value: "entertainment" },
  { label: "Food", value: "food" },
  { label: "Shopping", value: "shopping" },
  { label: "Healthcare", value: "healthcare" },
  { label: "Education", value: "education" },
  { label: "Personal", value: "personal" },
  { label: "Travel", value: "travel" },
  { label: "Insurance", value: "insurance" },
  { label: "Gifts", value: "gifts" },
  { label: "Bills", value: "bills" },
  { label: "Other Expense", value: "other-expense" },
];

export const getCategoriesByType = (type) => {
  return type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
};

export const getCategoryLabel = (category) => {
  const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  return allCategories.find((item) => item.value === category)?.label || category;
};

export const getPaymentMethodLabel = (method) => {
  return PAYMENT_METHODS.find((item) => item.value === method)?.label || method;
};