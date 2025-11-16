'use client';

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RefreshCw, History, ListChecks, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExpireOverdueUserPlansMutation } from "@/hooks/api/use-plan";

const QuickActionsCard = () => {
  const { mutate, isPending } = useExpireOverdueUserPlansMutation();

  return (
    <Card className="min-w-full w-full hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>Plan management tools and utilities</CardDescription>
      </CardHeader>

      <CardContent className="min-w-full w-full grid grid-cols-4 gap-2 md:gap-4">
        <Button
          onClick={() => mutate()}
          disabled={isPending}
          variant="outline"
          className="max-w-full h-12 sm:h-20 sm:flex-col items-center gap-2 hover:scale-105 transition-transform bg-transparent"
        >
          <ShieldAlert className="h-5 w-5" />
          <span className="text-xs">
            {isPending ? "Expiring..." : "Expire Plans"}
          </span>
        </Button>

        <Button
          variant="outline"
          className="max-w-full h-12 sm:h-20 sm:flex-col items-center gap-2 hover:scale-105 transition-transform bg-transparent"
        >
          <RefreshCw className="h-5 w-5" />
          <span className="text-xs">Renew Plans</span>
        </Button>

        <Button
          variant="outline"
          className="max-w-full h-12 sm:h-20 sm:flex-col items-center gap-2 hover:scale-105 transition-transform bg-transparent"
        >
          <ListChecks className="h-5 w-5" />
          <span className="text-xs">Active Plans</span>
        </Button>

        <Button
          variant="outline"
          className="max-w-full h-12 sm:h-20 sm:flex-col items-center gap-2 hover:scale-105 transition-transform bg-transparent"
        >
          <History className="h-5 w-5" />
          <span className="text-xs">Expired Plans</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
