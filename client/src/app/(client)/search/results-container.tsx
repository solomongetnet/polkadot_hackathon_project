import { CharacterCard } from "@/components/character-card";
import { getCharactersSearchResultAction } from "@/server/actions/character.actions";
import React from "react";

const ResultsContainer = async ({
  query,
  sortBy,
}: {
  query: string;
  sortBy: any;
}) => {
  const characters = await getCharactersSearchResultAction({
    query: query,
    sortBy: sortBy,
  });

  if (characters.length === 0) {
    return (
      <div className="h-[60dvh] flex items-center justify-center text-center px-4">
        <h2 className="text-lg font-medium text-zinc-100">
          {query
            ? `No results found for "${query}". Try refining your search!`
            : "Please type something to search for characters."}
        </h2>
      </div>
    );
  }

  return (
    <ul className="py-10 space-y-2">
      {characters.map((character) => {
        return (
          <CharacterCard
            character={character}
            directStart
            key={character.id}
            variant="wide"
          />
        );
      })}
    </ul>
  );
};

export default ResultsContainer;
