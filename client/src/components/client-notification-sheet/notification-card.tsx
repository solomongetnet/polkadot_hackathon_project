import React from "react";
import { Notification } from "@/generated/prisma";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar } from "../shared/avatar";
import { useMarkNotificationAsReadMutation } from "@/hooks/api/use-notification";
import { useRouter } from "next/navigation";

interface NotificationCardProps {
  notification: Notification & {
    actor?: { name: string; image?: string; id: string; username?: string };
    character?: { name?: string; id: string };
  };
}

/**
 * Reusable NotificationCard component
 */
export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
}) => {
  const markAsReadMutation = useMarkNotificationAsReadMutation();
  const router = useRouter();

  const handleClick = async () => {
    markAsReadMutation.mutateAsync(notification.id);

    if (notification.type == "CHARACTER_LIKE") {
      router.push(`/character/${notification.characterId}`);
    } else if (notification.type === "USER_FOLLOW") {
      router.push(`/profile/${notification.actor?.username}`);
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-zinc-800/50",
        !notification.isRead && "bg-zinc-800/30"
      )}
      onClick={handleClick}
    >
      <div className="flex-shrink-0">
        <Avatar
          className="h-10 w-10"
          src={notification.actor?.image || ""}
          fallback={notification.actor?.name}
          redirectPath={`/profile/${notification.actor?.username}`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-white truncate">
            {notification.message}
          </h4>
          {!notification.isRead && (
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
          )}
        </div>
        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-zinc-500 mt-2">
          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};
