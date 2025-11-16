"use client";

import { Users, UserPlus, Eye, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { getUserPlansStatsAction } from "@/server/actions/admin/plan.admin.actions";
import { getDashboardStatsAction } from "@/server/actions/admin/dashboard.admin.actions";

const StatsContainer = () => {
  const {
    data: stats,
    isLoading,
    isError,
    isFetching,
    isPending,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStatsAction,
    retry: 5,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });

  if (isLoading || isFetching || isPending)
    return (
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );

  if (isError)
    return (
      <p className="text-sm text-destructive py-20 flex justify-center items-center">
        Failed to load plan stats
      </p>
    );

  if (!stats) return null;

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <DashboardCard
        title="Total User Plans"
        value={stats.usersCount.value}
        change={`${stats.usersCount.change}%`}
        changeType={
          stats.usersCount.changeType === "increase" ? "positive" : "negative"
        }
        icon={Users}
        description="All available User plans"
      />

      <DashboardCard
        title="Total Revenue"
        value={`${stats.totalRevenue.value.toLocaleString()} Birr`}
        change={`${stats.totalRevenue.change}%`}
        changeType="neutral"
        icon={Eye}
        description="Total revenue of all time"
      />

      <DashboardCard
        title="Total Characters"
        value={stats.charactersCount.value}
        change={`${stats.charactersCount.change}%`}
        changeType="neutral"
        icon={Eye}
        description="Count of characters"
      />

      <DashboardCard
        title="Total messages"
        value={stats.messagesCount.value}
        change={`${stats.messagesCount.change}%`}
        changeType="neutral"
        icon={Eye}
        description="Count of all messages"
      />
    </div>
  );
};

export default StatsContainer;
