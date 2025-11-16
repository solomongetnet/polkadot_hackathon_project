"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bot, Crown, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserInsightsAction } from "@/server/actions/admin/users.admin.actions";

const UserPlansInsightCard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-insights"],
    queryFn: getUserInsightsAction,
    retry: 3,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg">User Insights</CardTitle>
          <CardDescription>Key metrics and user behavior patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg">User Insights</CardTitle>
          <CardDescription>Key metrics and user behavior patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load insights</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg">User Insights</CardTitle>
        <CardDescription>Key metrics and user behavior patterns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
          <div className="flex items-center gap-3">
            <Bot className="h-5 w-5 text-tertiary" />
            <span className="text-sm font-medium">Most Popular Character</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {data.mostPopularCharacter?.name || "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-tertiary" />
            <span className="text-sm font-medium">Avg. Conversations/User</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {data.avgConversationsPerUser}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-tertiary" />
            <span className="text-sm font-medium">Premium Conversion</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {data.premiumConversion}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPlansInsightCard;
