import { apiClient } from "../../../api/apiClient";
import { endpoints } from "../../../api/endpoints";

export const authApi = {
  getCurrentUser: async () => {
    const response = await apiClient.get(endpoints.auth.currentUser);
    return response.data.data;
  },

  login: async (payload) => {
    const response = await apiClient.post(endpoints.auth.login, payload);
    return response.data.data;
  },

  register: async (payload) => {
    const response = await apiClient.post(endpoints.auth.register, payload);
    return response.data.data;
  },

  logout: async () => {
    const response = await apiClient.post(endpoints.auth.logout);
    return response.data;
  },

  forgotPassword: async (payload) => {
    const response = await apiClient.post(endpoints.auth.forgotPassword, payload);
    return response.data;
  },

  resetPassword: async (payload) => {
    const response = await apiClient.post(endpoints.auth.resetPassword, payload);
    return response.data;
  },

  verifyEmail: async (payload) => {
    const response = await apiClient.post(endpoints.auth.verifyEmail, payload);
    return response.data;
  },

  resendEmailVerification: async () => {
    const response = await apiClient.post(endpoints.auth.resendEmailVerification);
    return response.data;
  },
};