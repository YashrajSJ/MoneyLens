import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "../../../constants/queryKeys";
import { receiptsApi } from "../api/receiptsApi";

export const useReceipts = (filters) => {
  return useQuery({
    queryKey: queryKeys.receipts(filters),
    queryFn: () => receiptsApi.getReceipts(filters),
    placeholderData: keepPreviousData,
    refetchInterval: (query) => {
      const receipts = query.state.data?.receipts || [];
      const hasProcessingReceipt = receipts.some(
        (receipt) => receipt.status === "PROCESSING",
      );

      return hasProcessingReceipt ? 5000 : false;
    },
  });
};

export const useScanReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: receiptsApi.scanReceipt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      toast.success("Receipt uploaded. Parsing has started.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload receipt");
    },
  });
};

export const useRetryReceiptParsing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: receiptsApi.retryParsing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      toast.success("Receipt parsing queued again");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to retry parsing");
    },
  });
};

export const usePrepareReceiptTransaction = () => {
  return useMutation({
    mutationFn: receiptsApi.prepareTransaction,
    onError: (error) => {
      toast.error(error.message || "Failed to prepare transaction draft");
    },
  });
};

export const useDeleteReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: receiptsApi.deleteReceipt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      toast.success("Receipt deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete receipt");
    },
  });
};
