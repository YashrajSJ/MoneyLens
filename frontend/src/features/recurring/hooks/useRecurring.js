import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "../../../constants/queryKeys";
import { recurringApi } from "../api/recurringApi";

const invalidateRecurringData = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ["recurring"] });
  queryClient.invalidateQueries({ queryKey: ["dueRecurring"] });
  queryClient.invalidateQueries({ queryKey: ["generatedRecurringTransactions"] });
  queryClient.invalidateQueries({ queryKey: ["transactions"] });
  queryClient.invalidateQueries({ queryKey: ["accounts"] });
  queryClient.invalidateQueries({ queryKey: ["budgets"] });
  queryClient.invalidateQueries({ queryKey: ["currentBudget"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  queryClient.invalidateQueries({ queryKey: ["analytics"] });
};

export const useRecurringTransactions = (filters) => {
  return useQuery({
    queryKey: queryKeys.recurring(filters),
    queryFn: () => recurringApi.getRecurringTransactions(filters),
  });
};

export const useDueRecurringTransactions = (filters) => {
  return useQuery({
    queryKey: queryKeys.dueRecurring(filters),
    queryFn: () => recurringApi.getDueRecurringTransactions(filters),
  });
};

export const useGeneratedRecurringTransactions = ({
  transactionId,
  filters,
}) => {
  return useQuery({
    queryKey: queryKeys.generatedRecurringTransactions(transactionId, filters),
    queryFn: () =>
      recurringApi.getGeneratedTransactions({
        transactionId,
        filters,
      }),
    enabled: Boolean(transactionId),
  });
};

export const useProcessDueRecurringTransactions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recurringApi.processDueRecurringTransactions,
    onSuccess: (data) => {
      invalidateRecurringData(queryClient);
      toast.success(`Processed ${data?.processedCount || 0} recurring transactions`);
    },
    onError: (error) => {
      toast.error(error.message || "Could not process recurring transactions");
    },
  });
};

export const useProcessRecurringTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recurringApi.processRecurringTransaction,
    onSuccess: () => {
      invalidateRecurringData(queryClient);
      toast.success("Recurring transaction processed");
    },
    onError: (error) => {
      toast.error(error.message || "Could not process transaction");
    },
  });
};

export const usePauseRecurringTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recurringApi.pauseRecurringTransaction,
    onSuccess: () => {
      invalidateRecurringData(queryClient);
      toast.success("Recurring transaction paused");
    },
    onError: (error) => {
      toast.error(error.message || "Could not pause transaction");
    },
  });
};

export const useResumeRecurringTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recurringApi.resumeRecurringTransaction,
    onSuccess: () => {
      invalidateRecurringData(queryClient);
      toast.success("Recurring transaction resumed");
    },
    onError: (error) => {
      toast.error(error.message || "Could not resume transaction");
    },
  });
};