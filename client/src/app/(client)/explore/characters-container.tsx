"use client";

import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import PaginationButton from "./pagination-button";
import { useGetCharactersQuery } from "@/hooks/api/use-character";
import { useCharactersStore } from "@/store/characters-store";
import { CharacterCard } from "@/components/character-card";

const CharactersContainer = ({}: {}) => {
  const { refetch, data } = useGetCharactersQuery({
    enabled: null,
    input: { limit: 12 },
  });
  const { characters, status } = useCharactersStore();

  return (
    <div className="pt-8 space-y-4 w-full min-h-[50vh] flex flex-col ">
      {status.isLoading ? (
        <Loader />
      ) : characters.data.length === 0 ? (
        <div className="py-60 grid place-content-center">
          There no any available character
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {characters.data.map((character) => (
            <CharacterCard
              character={character}
              key={character.id}
              variant="wide"
            />
          ))}
        </div>
      )}

      <PaginationButton
        hasMore={characters.hasMore}
        refetch={refetch}
        isFetching={status.isFetching}
      />
    </div>
  );
};

export default CharactersContainer;

const Loader = () => {
  return (
    <div className="h-fit grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-2">
      {[...Array(12)].map((_, idx) => (
        <Skeleton
          key={idx}
          className="w-full h-[125px] rounded-xl bg-muted dark:bg-[#1c1c1f]"
        />
      ))}
    </div>
  );
};
