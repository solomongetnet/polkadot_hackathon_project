import { Avatar } from "@/components/shared/avatar";
import StartChatButton from "@/components/shared/start-chat-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetUserCharactersQuery } from "@/hooks/api/use-character";
import { RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

const CharacetrsContainer = () => {
  const limit = 6; // your requested limit
  const [skip, setSkip] = useState(0);
  const [allCharacters, setAllCharacters] = useState<any[]>([]);
  const params = useParams();
  const username = params.username as string;

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
  });

  const userCharactersQuery = useGetUserCharactersQuery({
    username,
    skip,
    limit,
  });

  // Merge newly fetched characters into allCharacters
  useEffect(() => {
    if (userCharactersQuery.data?.characters) {
      setAllCharacters((prev) => {
        const newChars = userCharactersQuery.data.characters.filter(
          (c: any) => !prev.find((p) => p.id === c.id)
        );
        return [...prev, ...newChars];
      });
    }
  }, [userCharactersQuery.data]);

  // Trigger fetching next page when in view
  useEffect(() => {
    if (inView && userCharactersQuery.data?.hasMore) {
      setSkip((prev) => prev + limit);
    }
  }, [inView, userCharactersQuery.data?.hasMore]);

  if (userCharactersQuery.isLoading && allCharacters.length === 0) {
    return (
      <div className="w-full flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton key={idx} className="w-full h-[70px] rounded-lg" />
        ))}
      </div>
    );
  }

  if (userCharactersQuery.isError && allCharacters.length === 0) {
    return (
      <div className="w-full pt-10 flex flex-col gap-1 items-center">
        <h2 className="text-base">Something went wrong. Please try again.</h2>
        <Button size="icon" variant="outline" onClick={() => setSkip(0)}>
          <RefreshCw
            className={`${userCharactersQuery.isFetching && "animate-spin"}`}
          />
        </Button>
      </div>
    );
  }

  if (allCharacters.length === 0) {
    return (
      <div className="w-full pt-10 flex flex-col gap-1 items-center">
        <h2 className="text-base">No saved characters yet!</h2>
      </div>
    );
  }

  return (
    <ul className="w-full flex flex-col items-center gap-3">
      {allCharacters.map((character, idx) => (
        <li
          className="relative flex justify-between items-center w-full p-2 h-[70px] rounded-lg hover:bg-accent "
          key={character.id}
        >
          <div className="flex gap-2 ">
            <Avatar
              className="h-[60px] w-[60px] aspect-square rounded-md"
              src={character.avatarUrl || ""}
              fallback={character.name}
            />

            <div className="flex flex-col ">
              <h2 className="text-base leading-snug"> {character.name}</h2>
              <h2 className="text-sm leading-none opacity-80">
                {" "}
                {character.tagline}
              </h2>
            </div>
          </div>

          <div className="flex gap-2">
            <StartChatButton
              characterId={character.id}
              className="px-5 rounded-full text-xs"
              variant="outline"
              size="sm"
            />
          </div>
        </li>
      ))}

      {/* Invisible element for infinite scroll */}
      {userCharactersQuery.data?.hasMore && (
        <div ref={loadMoreRef} className="h-2 w-full" />
      )}

      {userCharactersQuery.isFetching && (
        <div className="py-3 text-center text-muted-foreground">Loading...</div>
      )}
    </ul>
  );
};

export default CharacetrsContainer;
