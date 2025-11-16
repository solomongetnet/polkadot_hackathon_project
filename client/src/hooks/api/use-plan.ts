import {
  expireOverdueUserPlansForAdminAction,
  getPlansForAdminAction,
  getUserPlansForAdminAction,
} from "@/server/actions/admin/plan.admin.actions";
import {
  getActiveUserPlanAction,
  getPlansAction,
  initPlansAction,
  upgradeUserPlanAction,
} from "@/server/actions/plan.actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useInitPlansMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => initPlansAction(),
    onSuccess: ({ success, error, message }) => {
      if (success) {
        toast.message(message);
        queryClient.invalidateQueries({ queryKey: ["plans"] });
      } else {
        toast.error(error?.message);
      }
    },
  });
};

export const useUpgradeUserPlanMutation = () => {
  return useMutation({
    mutationFn: (data: { plan: "PLUS"; txRef: string }) =>
      upgradeUserPlanAction(data),
    onSuccess: ({ success, error }) => {
      if (!success) {
        toast.error(error?.message);
      }
    },
  });
};

export const useGetPlansQuery = () => {
  return useQuery({
    queryFn: getPlansAction,
    queryKey: ["plans"],
  });
};

export const useGetActiveUserPlanQuery = () => {
  return useQuery({
    queryFn: getActiveUserPlanAction,
    queryKey: ["user_plan"],
  });
};

// -----------------admin------------------
export const useGetPlansForAdminQuery = (params: {
  page: number;
  limit: number;
  sortField: any | undefined;
  sortDirection: any | undefined;
  role: any | undefined;
  status: any | undefined;
  search: string | undefined;
}) => {
  return useQuery({
    queryFn: () => getPlansForAdminAction(params),
    queryKey: ["plans"],
  });
};

export const useGetUserPlansForAdminQuery = (params: {
  page: number;
  limit: number;
  status: any;
  search: string;
}) => {
  return useQuery({
    queryFn: () => getUserPlansForAdminAction({ ...params }),
    queryKey: ["plans"],
  });
};

export const useExpireOverdueUserPlansMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => expireOverdueUserPlansForAdminAction(),
    onSuccess: ({ success, message, error }) => {
      if (success) {
        toast.success(message || "Expired overdue user plans successfully");
        queryClient.invalidateQueries({ queryKey: ["plans"] });
      } else {
        toast.error(error?.message || "Failed to expire overdue user plans");
      }
    },
    onError: (err: any) => {
      console.error("Mutation error:", err);
      toast.error("Unexpected error while expiring user plans");
    },
  });
};
