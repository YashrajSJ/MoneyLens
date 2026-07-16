import { apiClient } from "../../../api/apiClient";
import { endpoints } from "../../../api/endpoints";

export const recurringApi = {
  getRecurringTransactions: async (filters = {}) => {
    const response = await apiClient.get(endpoints.recurring.base, {
      params: filters,
    });

    return response.data.data;
  },

  getDueRecurringTransactions: async (filters = {}) => {
    const response = await apiClient.get(endpoints.recurring.due, {
      params: filters,
    });

    return response.data.data;
  },

  getGeneratedTransactions: async ({ transactionId, filters = {} }) => {
    const response = await apiClient.get(
      endpoints.recurring.generatedTransactions(transactionId),
      {
        params: filters,
      },
    );

    return response.data.data;
  },

  processDueRecurringTransactions: async (params = {}) => {
    const response = await apiClient.post(endpoints.recurring.processDue, null, {
      params,
    });

    return response.data.data;
  },

  processRecurringTransaction: async ({ transactionId, asOf }) => {
    const response = await apiClient.post(
      endpoints.recurring.processOne(transactionId),
      null,
      {
        params: asOf ? { asOf } : {},
      },
    );

    return response.data.data;
  },

  pauseRecurringTransaction: async (transactionId) => {
    const response = await apiClient.patch(endpoints.recurring.pause(transactionId));
    return response.data.data;
  },

  resumeRecurringTransaction: async (transactionId) => {
    const response = await apiClient.patch(endpoints.recurring.resume(transactionId));
    return response.data.data;
  },
};