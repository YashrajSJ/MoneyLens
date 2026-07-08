import { apiClient } from "../../../api/apiClient";
import { endpoints } from "../../../api/endpoints";

export const accountsApi = {
  getAccounts: async () => {
    const response = await apiClient.get(endpoints.accounts.base);
    return response.data.data;
  },

  createAccount: async (payload) => {
    const response = await apiClient.post(endpoints.accounts.base, payload);
    return response.data.data;
  },

  updateAccount: async ({ accountId, payload }) => {
    const response = await apiClient.patch(
      endpoints.accounts.byId(accountId),
      payload,
    );

    return response.data.data;
  },

  setDefaultAccount: async (accountId) => {
    const response = await apiClient.patch(
      endpoints.accounts.setDefault(accountId),
    );

    return response.data.data;
  },

  deleteAccount: async (accountId) => {
    const response = await apiClient.delete(endpoints.accounts.byId(accountId));
    return response.data.data;
  },
};