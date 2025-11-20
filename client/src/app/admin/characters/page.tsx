
import { Suspense } from "react";
import CharactersTableContainer from "./characters-container";
import StatsContainer from "./stats-container";

export default function UsersPage() {
  return (
    <Suspense>
      <div className="flex min-h-screen">
        <main className="w-full h-full px-6 py-8">
          <StatsContainer />

          <CharactersTableContainer />
        </main>
      </div>
    </Suspense>
  );
}
