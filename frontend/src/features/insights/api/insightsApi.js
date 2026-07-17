import { apiClient } from "../../../api/apiClient";
import { endpoints } from "../../../api/endpoints";

export const insightsApi = {
  getInsights: async (filters = {}) => {
    const response = await apiClient.get(endpoints.insights.base, {
      params: filters,
    });

    return response.data.data;
  },

  generateInsights: async (filters = {}) => {
    const response = await apiClient.post(endpoints.insights.generate, null, {
      params: filters,
    });

    return response.data.data;
  },

  getMonthlySummary: async (filters = {}) => {
    const response = await apiClient.get(endpoints.insights.monthlySummary, {
      params: filters,
    });

    return response.data.data;
  },

  markInsightAsRead: async (insightId) => {
    const response = await apiClient.patch(
      endpoints.insights.markRead(insightId),
    );

    return response.data.data;
  },

  deleteInsight: async (insightId) => {
    const response = await apiClient.delete(endpoints.insights.byId(insightId));
    return response.data.data;
  },
};