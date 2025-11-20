import React, { Suspense } from "react";
import PlansStatsContainer from "./stats-container";
import PlansContainer from "./plans-container";
import QuickActionsCard from "./quick-actions-card";

const Page = () => {
  return (
    <Suspense>
      <div className="flex min-h-screen">
        <main className="w-full h-full px-6 py-8">
          <PlansStatsContainer />
          <QuickActionsCard />
          <PlansContainer />
        </main>
      </div>
    </Suspense>
  );
};

export default Page;
