export const endpoints = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    logout: "/auth/logout",
    currentUser: "/auth/current-user",
    refreshToken: "/auth/refresh-token",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    verifyEmail: "/auth/verify-email",
    resendEmailVerification: "/auth/resend-email-verification",
  },

  accounts: {
    base: "/account",
    byId: (accountId) => `/account/${accountId}`,
    setDefault: (accountId) => `/account/${accountId}/default`,
  },

  transactions: {
    base: "/transaction",
    byId: (transactionId) => `/transaction/${transactionId}`,
    bulkDelete: "/transaction/bulk-delete",
  },

  budgets: {
    base: "/budgets",
    current: "/budgets/current",
    byId: (budgetId) => `/budgets/${budgetId}`,
  },

  analytics: {
    dashboard: "/analytics/dashboard",
    summary: "/analytics/summary",
    categoryBreakdown: "/analytics/category-breakdown",
    monthlyTrend: "/analytics/monthly-trend",
    topMerchants: "/analytics/top-merchants",
    accountSummary: "/analytics/account-summary",
    recentTransactions: "/analytics/recent-transactions",
    cashflowTrend: "/analytics/cashflow-trend",
    budgetProgress: "/analytics/budget-progress",
  },

  recurring: {
    base: "/recurring",
    due: "/recurring/due",
    processDue: "/recurring/process-due",
    processOne: (transactionId) => `/recurring/${transactionId}/process`,
    generatedTransactions: (transactionId) =>
      `/recurring/${transactionId}/generated-transactions`,
    pause: (transactionId) => `/recurring/${transactionId}/pause`,
    resume: (transactionId) => `/recurring/${transactionId}/resume`,
  },

  receipts: {
    base: "/receipts",
    scan: "/receipts/scan",
    byId: (receiptId) => `/receipts/${receiptId}`,
    retryParsing: (receiptId) => `/receipts/${receiptId}/retry-parsing`,
    prepareTransaction: (receiptId) =>
      `/receipts/${receiptId}/prepare-transaction`,
  },

  insights: {
    base: "/insights",
    generate: "/insights/generate",
    monthlySummary: "/insights/monthly-summary",
    markRead: (insightId) => `/insights/${insightId}/read`,
    byId: (insightId) => `/insights/${insightId}`,
  },

  notifications: {
    base: "/notifications",
    unreadCount: "/notifications/unread-count",
    preferences: "/notifications/preferences",
    readAll: "/notifications/read-all",
    markRead: (notificationId) => `/notifications/${notificationId}/read`,
    byId: (notificationId) => `/notifications/${notificationId}`,
    testEmail: "/notifications/test-email",
    monthlyReport: "/notifications/monthly-report",
  },

  jobs: {
    status: (queueName, jobId) => `/jobs/${queueName}/${jobId}`,
  },
};
