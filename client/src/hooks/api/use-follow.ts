import {
  getUserFollowingAction,
  getUserFollowersAction,
  isUserFollowingAction,
  toggleFollowAction,
  removeFollowerAction,
} from "@/server/actions/follow.action";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useErrorToast } from "../use-error-toast";

export const useRemoveFollowerMutation = () => {
  const queryClient = useQueryClient();
  const toastId = "follow_unfollow_toast";

  return useMutation({
    mutationFn: ({ userIdToRemove }: { userIdToRemove: string }) =>
      removeFollowerAction(userIdToRemove),
    onSuccess: ({ success, error, message }) => {
      if (success && message) {
        queryClient.invalidateQueries({
          queryKey: ["my_following"],
        });
        queryClient.invalidateQueries({
          queryKey: ["my_followers"],
        });
        toast.message(message, { id: toastId });
      } else {
        toast.error(error?.message, { id: toastId });
      }
    },
  });
};

export const useToggleFollowMutation = () => {
  const queryClient = useQueryClient();
  const toastId = "follow_unfollow_toast";
  const { showErrorToast } = useErrorToast();

  return useMutation({
    mutationFn: ({ targetUserId }: { targetUserId: string }) =>
      toggleFollowAction(targetUserId),
    onSuccess: ({ success, error, message }) => {
      if (success && message) {
        queryClient.invalidateQueries({
          queryKey: ["my_following"],
          type: "all",
        });
        queryClient.invalidateQueries({
          queryKey: ["my_followers"],
          type: "all",
        });

        toast.message(message, { id: toastId });
      } else {
        if (error?.code) {
          showErrorToast({
            code: error.code as any,
            message: error.message,
          });
          return;
        }

        toast.error(error?.message, { id: toastId });
      }
    },
  });
};

export const useGetUserFollowersQuery = ({ userId }: { userId: string }) => {
  return useQuery({
    queryFn: () => getUserFollowersAction(userId),
    queryKey: ["my_followers"],
  });
};

export const useGetUserFollowingQuery = ({ userId }: { userId: string }) => {
  return useQuery({
    queryFn: () => getUserFollowingAction(userId),
    queryKey: ["my_following"],
  });
};

export const useIsUserFollowingQuery = ({
  targetUserId,
}: {
  targetUserId: string;
}) => {
  return useQuery({
    queryFn: () => isUserFollowingAction(targetUserId),
    queryKey: ["is_following", targetUserId],
    enabled: !!targetUserId,
  });
};
