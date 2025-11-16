"use client";

import { Users, UserPlus, Eye, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { getUserPlansStatsAction } from "@/server/actions/admin/plan.admin.actions";

const PlansStatsContainer = () => {
  const {
    data: stats,
    isLoading,
    isError,
    isFetching,
    isPending,
  } = useQuery({
    queryKey: ["plan-stats"],
    queryFn: getUserPlansStatsAction,
    retry: 5,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchInterval: 8000,
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
        value={stats.totalUserPlans.value}
        change={`${stats.totalUserPlans.change}%`}
        changeType={
          stats.totalUserPlans.changeType === "increase"
            ? "positive"
            : "negative"
        }
        icon={Users}
        description="All available User plans"
      />

      <DashboardCard
        title="Active Plans"
        value={stats.activeUserPlans.value}
        change={`${stats.activeUserPlans.change}%`}
        changeType="neutral"
        icon={Eye}
        description="User plans currently active"
      />

      <DashboardCard
        title="Pending Plans"
        value={stats.pendingUserPlans.value}
        change={`${stats.pendingUserPlans.change}%`}
        changeType="neutral"
        icon={Eye}
        description="User plans currently pending"
      />

      <DashboardCard
        title="Cancelled Plans"
        value={stats.cancelledPlansUserPlans.value}
        change={`${stats.cancelledPlansUserPlans.change}%`}
        changeType="neutral"
        icon={Eye}
        description="User plans currently cancelled"
      />

      <DashboardCard
        title="Expired Plans"
        value={stats.expiredPlansUserPlans.value}
        change={`${stats.expiredPlansUserPlans.change}%`}
        changeType="neutral"
        icon={Eye}
        description="User plans currently expired"
      />

      <DashboardCard
        title="New Plans This Month"
        value={stats.newPlansThisMonth.value}
        change={`${stats.newPlansThisMonth.change}%`}
        changeType={
          stats.newPlansThisMonth.changeType === "increase"
            ? "positive"
            : "negative"
        }
        icon={UserPlus}
        description="Compared to last month"
      />

      <DashboardCard
        title="Total Subscriptions"
        value={stats.totalUserPlans.value}
        change={`${stats.totalUserPlans.change}%`}
        changeType="neutral"
        icon={Crown}
        description="Total active user subscriptions"
      />
    </div>
  );
};

export default PlansStatsContainer;
