import { apiClient } from "../../../api/apiClient";
import { endpoints } from "../../../api/endpoints";

export const receiptsApi = {
  getReceipts: async (filters = {}) => {
    const response = await apiClient.get(endpoints.receipts.base, {
      params: filters,
    });

    return response.data.data;
  },

  getReceiptById: async (receiptId) => {
    const response = await apiClient.get(endpoints.receipts.byId(receiptId));
    return response.data.data;
  },

  scanReceipt: async (file) => {
    const formData = new FormData();
    formData.append("receipt", file);

    const response = await apiClient.post(endpoints.receipts.scan, formData);

    return response.data.data;
  },

  retryParsing: async (receiptId) => {
    const response = await apiClient.post(
      endpoints.receipts.retryParsing(receiptId),
    );

    return response.data.data;
  },

  prepareTransaction: async ({ receiptId, accountId }) => {
    const response = await apiClient.post(
      endpoints.receipts.prepareTransaction(receiptId),
      {},
      {
        params: accountId ? { accountId } : {},
      },
    );

    return response.data.data;
  },

  deleteReceipt: async (receiptId) => {
    const response = await apiClient.delete(endpoints.receipts.byId(receiptId));
    return response.data.data;
  },
};
