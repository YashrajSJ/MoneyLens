import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "../../../constants/queryKeys";
import { insightsApi } from "../api/insightsApi";

export const useInsights = (filters) => {
  return useQuery({
    queryKey: queryKeys.insights(filters),
    queryFn: () => insightsApi.getInsights(filters),
    placeholderData: keepPreviousData,
  });
};

export const useMonthlyInsightSummary = (filters, options = {}) => {
  return useQuery({
    queryKey: queryKeys.monthlyInsightSummary(filters),
    queryFn: () => insightsApi.getMonthlySummary(filters),
    enabled: options.enabled ?? true,
  });
};

export const useGenerateInsights = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insightsApi.generateInsights,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["insights"] });
      queryClient.invalidateQueries({ queryKey: ["monthlyInsightSummary"] });

      toast.success(
        data?.fromCache
          ? "Recent insights loaded"
          : "AI insights generated successfully",
      );
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate insights");
    },
  });
};

export const useMarkInsightAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insightsApi.markInsightAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insights"] });
      toast.success("Insight marked as read");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to mark insight as read");
    },
  });
};

export const useDeleteInsight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insightsApi.deleteInsight,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insights"] });
      toast.success("Insight deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete insight");
    },
  });
};