"use server";

import { NotificationType } from "@/generated/prisma";
import prisma from "../config/prisma";
import { serverSession } from "@/lib/auth-server";

/**
 * Get all notifications for a user.
 * Optional: filter by NotificationType
 */
export async function getUserNotificationsAction({
  type,
}: {
  type?: NotificationType;
}) {
  const session = await serverSession();
  const currentUser = session?.user;

  if (!currentUser) {
    return [];
  }

  return prisma.notification.findMany({
    where: {
      userId: currentUser?.id,
      ...(type ? { type } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      actor: { select: { id: true, name: true, image: true, username: true } },
      character: { select: { id: true, name: true } },
    },
  });
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsReadAction(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsReadAction() {
  const session = await serverSession();
  const currentUser = session?.user;

  return prisma.notification.updateMany({
    where: { userId: currentUser?.id, isRead: false },
    data: { isRead: true },
  });
}

/**
 * Delete a notification by id
 */
export async function deleteNotificationAction(notificationId: string) {
  return prisma.notification.delete({
    where: { id: notificationId },
  });
}

export async function getUnreadNotificationsCountAction({
  type,
}: {
  type?: NotificationType;
} = {}) {
  const session = await serverSession();
  const currentUser = session?.user;

  if (!currentUser) {
    return 0;
  }

  const count = await prisma.notification.count({
    where: {
      userId: currentUser.id,
      isRead: false,
      ...(type ? { type } : {}),
    },
  });

  return count;
}
