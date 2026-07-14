import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../../constants/queryKeys";
import { analyticsApi } from "../api/analyticsApi";

export const useDashboardAnalytics = (filters) => {
  return useQuery({
    queryKey: queryKeys.analytics("dashboard", filters),
    queryFn: () => analyticsApi.getDashboard(filters),
  });
};

export const useSummaryAnalytics = (filters) => {
  return useQuery({
    queryKey: queryKeys.analytics("summary", filters),
    queryFn: () => analyticsApi.getSummary(filters),
  });
};

export const useCategoryBreakdown = (filters) => {
  return useQuery({
    queryKey: queryKeys.analytics("categoryBreakdown", filters),
    queryFn: () => analyticsApi.getCategoryBreakdown(filters),
  });
};

export const useMonthlyTrend = (filters) => {
  return useQuery({
    queryKey: queryKeys.analytics("monthlyTrend", filters),
    queryFn: () => analyticsApi.getMonthlyTrend(filters),
  });
};

export const useTopMerchants = (filters) => {
  return useQuery({
    queryKey: queryKeys.analytics("topMerchants", filters),
    queryFn: () => analyticsApi.getTopMerchants(filters),
  });
};

export const useAccountSummary = (filters) => {
  return useQuery({
    queryKey: queryKeys.analytics("accountSummary", filters),
    queryFn: () => analyticsApi.getAccountSummary(filters),
  });
};

export const useRecentAnalyticsTransactions = (filters) => {
  return useQuery({
    queryKey: queryKeys.analytics("recentTransactions", filters),
    queryFn: () => analyticsApi.getRecentTransactions(filters),
  });
};

export const useBudgetProgressAnalytics = (filters) => {
  return useQuery({
    queryKey: queryKeys.analytics("budgetProgress", filters),
    queryFn: () => analyticsApi.getBudgetProgress(filters),
  });
};