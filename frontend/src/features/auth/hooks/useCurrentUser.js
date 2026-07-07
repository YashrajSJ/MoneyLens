import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../../constants/queryKeys";
import { authApi } from "../api/authApi";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: authApi.getCurrentUser,
    retry: false,
  });
};