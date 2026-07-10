import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "../../../constants/queryKeys";
import { transactionsApi } from "../api/transactionsApi";

const invalidateFinancialData = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ["transactions"] });
  queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  queryClient.invalidateQueries({ queryKey: ["analytics"] });
  queryClient.invalidateQueries({ queryKey: ["recurring"] });
};

export const useTransactions = (filters) => {
  return useQuery({
    queryKey: queryKeys.transactions(filters),
    queryFn: () => transactionsApi.getTransactions(filters),
    keepPreviousData: true,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionsApi.createTransaction,
    onSuccess: () => {
      invalidateFinancialData(queryClient);
      toast.success("Transaction created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create transaction");
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionsApi.updateTransaction,
    onSuccess: () => {
      invalidateFinancialData(queryClient);
      toast.success("Transaction updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update transaction");
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionsApi.deleteTransaction,
    onSuccess: () => {
      invalidateFinancialData(queryClient);
      toast.success("Transaction deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete transaction");
    },
  });
};

export const useBulkDeleteTransactions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionsApi.bulkDeleteTransactions,
    onSuccess: (data) => {
      invalidateFinancialData(queryClient);
      toast.success(`${data.deletedCount || 0} transactions deleted`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete transactions");
    },
  });
};