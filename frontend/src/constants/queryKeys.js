export const queryKeys = {
  currentUser: ["currentUser"],

  accounts: ["accounts"],
  account: (accountId) => ["account", accountId],

  transactions: (filters = {}) => ["transactions", filters],
  transaction: (transactionId) => ["transaction", transactionId],

  budgets: (filters = {}) => ["budgets", filters],
  currentBudget: (filters = {}) => ["currentBudget", filters],

  dashboard: (filters = {}) => ["dashboard", filters],
  analytics: (name, filters = {}) => ["analytics", name, filters],

  recurring: (filters = {}) => ["recurring", filters],
  dueRecurring: (filters = {}) => ["dueRecurring", filters],

  receipts: (filters = {}) => ["receipts", filters],
  receipt: (receiptId) => ["receipt", receiptId],

  insights: (filters = {}) => ["insights", filters],

  notifications: (filters = {}) => ["notifications", filters],
  unreadNotifications: ["unreadNotifications"],
  notificationPreferences: ["notificationPreferences"],
};