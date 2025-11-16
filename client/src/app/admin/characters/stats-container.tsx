"use client";

import {
  Users,
  UserPlus,
  Eye,
  EyeOff,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { getCharacterStatsAction } from "@/server/actions/admin/characters.admin.actions";

const CharacterStatsContainer = () => {
  const {
    data: stats,
    isLoading,
    isError,
    isFetching,
    isPending,
  } = useQuery({
    queryKey: ["character-stats"],
    queryFn: getCharacterStatsAction,
    retry: 5,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchInterval: 8000,
  });

  if (isLoading || isFetching || isPending)
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
        Failed to load character stats
      </p>
    );

  if (!stats) return;

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <DashboardCard
        title="Total Characters"
        value={stats.totalCharacters.value}
        change={`${stats.totalCharacters.change}%`}
        changeType={
          stats.totalCharacters.changeType === "increase"
            ? "positive"
            : "negative"
        }
        icon={Users}
        description="All created characters"
      />

      <DashboardCard
        title="New Characters This Month"
        value={stats.newCharactersThisMonth.value}
        change={`${stats.newCharactersThisMonth.change}%`}
        changeType={
          stats.newCharactersThisMonth.changeType === "increase"
            ? "positive"
            : "negative"
        }
        icon={UserPlus}
        description="Compared to last month"
      />

      <DashboardCard
        title="Public Characters"
        value={stats.publicCharacters.value}
        change={`${stats.publicCharacters.change}%`}
        changeType="neutral"
        icon={Eye}
        description="Visible to everyone"
      />

      <DashboardCard
        title="Private Characters"
        value={stats.privateCharacters.value}
        change={`${stats.privateCharacters.change}%`}
        changeType="neutral"
        icon={EyeOff}
        description="Visible only to creator"
      />

      <DashboardCard
        title="Total Likes"
        value={stats.likedCharacters.value}
        change={`${stats.likedCharacters.change}%`}
        changeType="neutral"
        icon={ThumbsUp}
        description="Likes across all characters"
      />

      <DashboardCard
        title="Total Comments"
        value={stats.commentedCharacters.value}
        change={`${stats.commentedCharacters.change}%`}
        changeType="neutral"
        icon={MessageSquare}
        description="Comments across all characters"
      />
    </div>
  );
};

export default CharacterStatsContainer;
