import { apiClient } from "../../../api/apiClient";
import { endpoints } from "../../../api/endpoints";

export const transactionsApi = {
  getTransactions: async (filters = {}) => {
    const response = await apiClient.get(endpoints.transactions.base, {
      params: filters,
    });

    return response.data.data;
  },

  createTransaction: async (payload) => {
    const response = await apiClient.post(endpoints.transactions.base, payload);
    return response.data.data;
  },

  updateTransaction: async ({ transactionId, payload }) => {
    const response = await apiClient.patch(
      endpoints.transactions.byId(transactionId),
      payload,
    );

    return response.data.data;
  },

  deleteTransaction: async (transactionId) => {
    const response = await apiClient.delete(
      endpoints.transactions.byId(transactionId),
    );

    return response.data.data;
  },

  bulkDeleteTransactions: async (transactionIds) => {
    const response = await apiClient.post(endpoints.transactions.bulkDelete, {
      transactionIds,
    });

    return response.data.data;
  },
};