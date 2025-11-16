import { CharacterSearch } from "@/components/character-search";
import { Badge } from "@/components/ui/badge";
import React, { Suspense } from "react";
import FilterModal from "./filter-modal";
import { Loader2 } from "lucide-react";
import ResultsContainer from "./results-container";

const SearchPage = async ({ searchParams }: { searchParams: any }) => {
  const query = await searchParams.q;
  const sortBy = await searchParams.sortBy;

  return (
    <div className="min-h-screen w-full dark:bg-[#18181B] py-[65px] px-2 sm:px-8 md:px-[210px] xl:px-[300px]">
      <header className="w-full flex flex-col gap-4">
        <CharacterSearch
          mainContainerClassName="w-full"
          instantApply
          inputContainerClassName="h-[50px]"
        />

        <div className="flex justify-between">
          <Badge className="text-sm font-semibold rounded-full px-5 py-2">
            Characters
          </Badge>

          {/* sort button */}
          <FilterModal />
        </div>
      </header>

      {/* search results */}
      <Suspense
        fallback={
          <div className="h-[60dvh] flex items-center justify-center">
            <Loader2 className="text-3xl animate-spin" />
          </div>
        }
      >
        <ResultsContainer query={query} sortBy={sortBy} />
      </Suspense>
    </div>
  );
};

export default SearchPage;
