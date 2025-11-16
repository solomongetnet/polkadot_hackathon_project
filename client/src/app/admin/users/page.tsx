"use client";

import UsersContainer from "./users-container";
import StatsContainer from "./stats-container";
import UserInsightCard from "./user-insights-card";
import QuickActionsCard from "./quick-actions-card";

export default function UsersPage() {
  return (
    <div className="flex min-h-screen">
      <main className="w-full h-full px-6 py-8">
        <StatsContainer />

        <div className="space-y-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <QuickActionsCard />
            <UserInsightCard />
          </div>

          <UsersContainer />
        </div>
      </main>
    </div>
  );
}
