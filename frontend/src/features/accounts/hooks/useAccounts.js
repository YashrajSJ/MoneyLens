import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "../../../constants/queryKeys";
import { accountsApi } from "../api/accountsApi";

const invalidateAccountData = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
};

export const useAccounts = () => {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: accountsApi.getAccounts,
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountsApi.createAccount,
    onSuccess: () => {
      invalidateAccountData(queryClient);
      toast.success("Account created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create account");
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountsApi.updateAccount,
    onSuccess: () => {
      invalidateAccountData(queryClient);
      toast.success("Account updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update account");
    },
  });
};

export const useSetDefaultAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountsApi.setDefaultAccount,
    onSuccess: () => {
      invalidateAccountData(queryClient);
      toast.success("Default account updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update default account");
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountsApi.deleteAccount,
    onSuccess: () => {
      invalidateAccountData(queryClient);
      toast.success("Account deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete account");
    },
  });
};