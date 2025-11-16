"use client";

import { Users, Heart, MessageCircle, Loader, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { NotificationType } from "@/generated/prisma";
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationsCountQuery,
  useMarkAllNotificationsAsReadMutation,
} from "@/hooks/api/use-notification";
import React, { useEffect, useMemo, useState } from "react";
import { NotificationCard } from "./notification-card";
import { useNotificationStore } from "@/store/notification-store";

const filterButtons = [
  {
    id: "USER_FOLLOW",
    label: "Followers",
    type: NotificationType.USER_FOLLOW,
    icon: Users,
  },
  {
    id: "CHARACTER_LIKE",
    label: "Likes",
    type: NotificationType.CHARACTER_LIKE,
    icon: Heart,
  },
  {
    id: "CHARACTER_COMMENT",
    label: "Comments",
    type: NotificationType.CHARACTER_COMMENT,
    icon: MessageCircle,
  },
] as const;

interface NotificationSheetProps {
  children: ReactNode;
}

export function NotificationSheet({ children }: NotificationSheetProps) {
  const { isNotificationsOpen, setNotificationsOpen } = useNotificationStore();
  const [activeTab, setActiveTab] = React.useState<"interactions" | "system">(
    "interactions"
  );

  const [activeFilter, setActiveFilter] = React.useState<
    "CHARACTER_LIKE" | "CHARACTER_COMMENT" | "USER_FOLLOW" | undefined
  >(undefined);
  const unreadNotificationsCountQuery = useGetUnreadNotificationsCountQuery();
  const markAllNotificationsAsReadMutation =
    useMarkAllNotificationsAsReadMutation();
  // Mark all notifications as read whenever the sheet opens

  const { data: notifications = [], isLoading } = useGetNotificationsQuery();

  const filterdNotifications = useMemo(() => {
    if (!activeFilter) return notifications;
    return notifications.filter((n) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  useEffect(() => {
    if (isNotificationsOpen && notifications.length > 0) {
      markAllNotificationsAsReadMutation.mutate();
    }
  }, [isNotificationsOpen, markAllNotificationsAsReadMutation]);

  const handleNotificationTypeTabs = (id: any) => {
    setActiveFilter(id);
  };

  return (
    <Sheet
      open={isNotificationsOpen}
      onOpenChange={(bool) => {
        setNotificationsOpen(bool);
      }}
    >
      <SheetTrigger asChild>
        <Button
          className={`relative w-full flex justify-start gap-2 py-5 px-3 rounded-full`}
          variant={"ghost"}
        >
          {" "}
          {unreadNotificationsCountQuery.isFetching ||
          unreadNotificationsCountQuery.isLoading ? (
            ""
          ) : unreadNotificationsCountQuery.data === 0 ? (
            ""
          ) : (
            <span className={`absolute right-3 text-red-500`}>
              {unreadNotificationsCountQuery.data}
            </span>
          )}
          {children}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className={cn(
          `bg-muted px-3 md:px-5 max-md:w-[100vw] max-sm:transition-none
          data-[state=open]:animate-none 
          data-[state=closed]:animate-none 
          sm:data-[state=open]:animate-in 
          sm:data-[state=closed]:animate-out`
        )}
      >
        <SheetHeader className="px-0">
          <SheetTitle className="text-lg font-medium text-white text-left">
            Notification
          </SheetTitle>

          <div className="relative">
            <div className="flex border-b border-zinc-700/50">
              <button
                onClick={() => setActiveTab("interactions")}
                className={cn(
                  "relative px-0 py-3 text-sm font-medium transition-all duration-300 ease-in-out mr-8",
                  activeTab === "interactions"
                    ? "text-white"
                    : "text-zinc-400 hover:text-zinc-300"
                )}
              >
                Interactions
                {activeTab === "interactions" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white transition-all duration-300 ease-in-out" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("system")}
                className={cn(
                  "relative px-0 py-3 text-sm font-medium transition-all duration-300 ease-in-out",
                  activeTab === "system"
                    ? "text-white"
                    : "text-zinc-400 hover:text-zinc-300"
                )}
              >
                System Notification
                {activeTab === "system" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white transition-all duration-300 ease-in-out" />
                )}
              </button>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 flex flex-col overflow-y-scroll transition-all duration-300 ease-in-out">
          {activeTab === "interactions" && (
            <div className="flex-1 flex flex-col">
              <div className="pb-6 flex flex-wrap gap-2">
                <Button
                  variant={!activeFilter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(undefined)}
                  className={cn("flex items-center gap-2 text-xs rounded-full")}
                >
                  {"All"}
                </Button>

                {filterButtons.map((filter) => {
                  const Icon = filter.icon;
                  const isActive = activeFilter === filter.id;
                  return (
                    <Button
                      key={filter.id}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleNotificationTypeTabs(filter.id)}
                      className={cn(
                        "flex items-center gap-2 text-xs rounded-full"
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {filter.label}
                    </Button>
                  );
                })}
              </div>

              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <Loader2 className="animate-spin w-7" />
                  </div>
                ) : filterdNotifications.filter((n) => n.type !== "SYSTEM")
                    ?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-16 h-16 mb-4">
                      <img
                        src="https://cdni.iconscout.com/illustration/premium/thumb/empty-notification-11167098-8944796.png"
                        alt="No notifications"
                        className="w-full h-full opacity-50"
                      />
                    </div>
                    <p className="text-zinc-400 text-sm">No notifications</p>
                  </div>
                ) : (
                  <div className="space-y-1 pb-6">
                    {filterdNotifications.map((notification) => {
                      if (notification.type === "SYSTEM") return;
                      return (
                        <NotificationCard
                          key={notification.id}
                          notification={{
                            ...notification,
                            actor: notification.actor as any,
                            character: notification.character ?? undefined,
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "system" && (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <Loader2 className="animate-spin w-7" />
                  </div>
                ) : filterdNotifications.filter((n) => n.type === "SYSTEM")
                    .length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-16 h-16 mb-4">
                      <img
                        src="https://cdni.iconscout.com/illustration/premium/thumb/empty-notification-11167098-8944796.png"
                        alt="No notifications"
                        className="w-full h-full opacity-50"
                      />
                    </div>
                    <p className="text-zinc-400 text-sm">
                      No system notification
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 pb-6">
                    {filterdNotifications.map((notification) => {
                      if (notification.type !== "SYSTEM") return;
                      return (
                        <NotificationCard
                          key={notification.id}
                          notification={{
                            ...notification,
                            actor: notification.actor as any,
                            character: notification.character ?? undefined,
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
