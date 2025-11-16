import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserNotificationsAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  deleteNotificationAction,
  getUnreadNotificationsCountAction,
} from "@/server/actions/notification.actions";
import { NotificationType } from "@/generated/prisma";

/**
 * Fetch notifications for current user
 */
export const useGetNotificationsQuery = (type?: NotificationType) => {
  return useQuery({
    queryKey: ["notifications", type],
    queryFn: () => getUserNotificationsAction({ type }),
    refetchInterval: 5000, // realtime-ish
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
};

/**
 * Fetch unread notifications count
 */
export const useGetUnreadNotificationsCountQuery = (
  type?: NotificationType
) => {
  return useQuery({
    queryKey: ["unread-notifications-count"],
    queryFn: () => getUnreadNotificationsCountAction({ type }),
    refetchInterval: 1000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
};

/**
 * Mark single notification as read
 */
export const useMarkNotificationAsReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsReadAction(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["unread-notifications-count"],
      });
    },
  });
};

/**
 * Mark all notifications as read
 */
export const useMarkAllNotificationsAsReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsAsReadAction(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["unread-notifications-count"],
      });
    },
  });
};

/**
 * Delete a notification
 */
export const useDeleteNotificationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      deleteNotificationAction(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["unread-notifications-count"],
      });
    },
  });
};
