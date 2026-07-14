import { apiClient } from "../../../api/apiClient";
import { endpoints } from "../../../api/endpoints";

export const analyticsApi = {
  getDashboard: async (filters = {}) => {
    const response = await apiClient.get(endpoints.analytics.dashboard, {
      params: filters,
    });

    return response.data.data;
  },

  getSummary: async (filters = {}) => {
    const response = await apiClient.get(endpoints.analytics.summary, {
      params: filters,
    });

    return response.data.data;
  },

  getCategoryBreakdown: async (filters = {}) => {
    const response = await apiClient.get(
      endpoints.analytics.categoryBreakdown,
      {
        params: filters,
      },
    );

    return response.data.data;
  },

  getMonthlyTrend: async (filters = {}) => {
    const response = await apiClient.get(endpoints.analytics.monthlyTrend, {
      params: filters,
    });

    return response.data.data;
  },

  getTopMerchants: async (filters = {}) => {
    const response = await apiClient.get(endpoints.analytics.topMerchants, {
      params: filters,
    });

    return response.data.data;
  },

  getAccountSummary: async (filters = {}) => {
    const response = await apiClient.get(endpoints.analytics.accountSummary, {
      params: filters,
    });

    return response.data.data;
  },

  getRecentTransactions: async (filters = {}) => {
    const response = await apiClient.get(
      endpoints.analytics.recentTransactions,
      {
        params: filters,
      },
    );

    return response.data.data;
  },

  getBudgetProgress: async (filters = {}) => {
    const response = await apiClient.get(endpoints.analytics.budgetProgress, {
      params: filters,
    });

    return response.data.data;
  },
};