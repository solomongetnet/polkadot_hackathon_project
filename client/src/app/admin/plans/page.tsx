import React from "react";
import PlansStatsContainer from "./stats-container";
import PlansContainer from "./plans-container";

const Page = () => {
  return (
    <div className="flex min-h-screen">
      <main className="w-full h-full px-6 py-8">
        <PlansStatsContainer />
        <PlansContainer />
      </main>
    </div>
  );
};

export default Page;
