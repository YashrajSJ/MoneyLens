import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "../../../constants/queryKeys";
import { budgetsApi } from "../api/budgetsApi";

const invalidateBudgetData = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ["budgets"] });
  queryClient.invalidateQueries({ queryKey: ["currentBudget"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  queryClient.invalidateQueries({ queryKey: ["analytics"] });
};

export const useBudgets = (filters) => {
  return useQuery({
    queryKey: queryKeys.budgets(filters),
    queryFn: () => budgetsApi.getBudgets(filters),
  });
};

export const useCurrentBudget = (filters) => {
  return useQuery({
    queryKey: queryKeys.currentBudget(filters),
    queryFn: () => budgetsApi.getCurrentBudget(filters),
    enabled: Boolean(filters?.accountId),
    retry: false,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: budgetsApi.createBudget,
    onSuccess: () => {
      invalidateBudgetData(queryClient);
      toast.success("Budget created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create budget");
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: budgetsApi.updateBudget,
    onSuccess: () => {
      invalidateBudgetData(queryClient);
      toast.success("Budget updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update budget");
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: budgetsApi.deleteBudget,
    onSuccess: () => {
      invalidateBudgetData(queryClient);
      toast.success("Budget deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete budget");
    },
  });
};