import { apiClient } from "../../../api/apiClient";
import { endpoints } from "../../../api/endpoints";

export const budgetsApi = {
  getBudgets: async (filters = {}) => {
    const response = await apiClient.get(endpoints.budgets.base, {
      params: filters,
    });

    return response.data.data;
  },

  getCurrentBudget: async (filters = {}) => {
    const response = await apiClient.get(endpoints.budgets.current, {
      params: filters,
    });

    return response.data.data;
  },

  getBudgetById: async (budgetId) => {
    const response = await apiClient.get(endpoints.budgets.byId(budgetId));

    return response.data.data;
  },

  createBudget: async (payload) => {
    const response = await apiClient.post(endpoints.budgets.base, payload);

    return response.data.data;
  },

  updateBudget: async ({ budgetId, payload }) => {
    const response = await apiClient.patch(
      endpoints.budgets.byId(budgetId),
      payload,
    );

    return response.data.data;
  },

  deleteBudget: async (budgetId) => {
    const response = await apiClient.delete(endpoints.budgets.byId(budgetId));

    return response.data.data;
  },
};