"use client";

import { Users, UserCheck, UserX, UserPlus, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { getUserStatsAction } from "@/server/actions/admin/users.admin.actions";

const StatsContainer = () => {
  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-stats"],
    queryFn: getUserStatsAction,
    retry: 5,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchInterval: 8000,
  });

  if (isLoading)
    return (
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );

  if (isError)
    return (
      <p className="text-sm text-destructive py-20 flex justify-center items-center">
        Failed to load stats
      </p>
    );

  if (!stats) return;

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <DashboardCard
        title="Total Users"
        value={stats.totalUsers.value}
        change={`${stats.totalUsers.change}%`}
        changeType={
          stats.totalUsers.changeType === "increase" ? "positive" : "negative"
        }
        icon={Users}
        description="All registered users"
      />

      <DashboardCard
        title="Active Users"
        value={stats.activeUsers.value}
        change={`${stats.activeUsers.change}%`}
        changeType="neutral"
        icon={UserCheck}
        description="Currently active users"
      />

      <DashboardCard
        title="Banned Users"
        value={stats.bannedUsers.value}
        change={`${stats.bannedUsers.change}%`}
        changeType="neutral"
        icon={UserX}
        description="Users banned permanently"
      />

      <DashboardCard
        title="New Users This Month"
        value={stats.newUsersThisMonth.value}
        change={`${stats.newUsersThisMonth.change}%`}
        changeType={
          stats.newUsersThisMonth.changeType === "increase"
            ? "positive"
            : "negative"
        }
        icon={UserPlus}
        description="New signups compared to last month"
      />

      <DashboardCard
        title="PLUS Users"
        value={stats.plusUsers.value}
        change={`${stats.plusUsers.change}%`}
        changeType="neutral"
        icon={Crown}
        description="Users with active PLUS plan"
      />
    </div>
  );
};

export default StatsContainer;
