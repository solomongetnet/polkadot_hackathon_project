"use client";

import { Users, UserPlus, Eye, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { getPlanStatsAction } from "@/server/actions/admin/plan.admin.actions";

const PlansStatsContainer = () => {
  const {
    data: stats,
    isLoading,
    isError,
    isFetching,
    isPending,
  } = useQuery({
    queryKey: ["plan-stats"],
    queryFn: getPlanStatsAction,
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
        title="Total Plans"
        value={stats.totalPlans.value}
        change={`${stats.totalPlans.change}%`}
        changeType={
          stats.totalPlans.changeType === "increase" ? "positive" : "negative"
        }
        icon={Users}
        description="All available plans"
      />

      <DashboardCard
        title="Active Plans"
        value={stats.activePlans.value}
        change={`${stats.activePlans.change}%`}
        changeType="neutral"
        icon={Eye}
        description="Plans currently active"
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
