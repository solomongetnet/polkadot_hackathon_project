import { Avatar } from "@/components/shared/avatar";
import CharacterLikeButton from "@/components/shared/character-like-button";
import StartChatButton from "@/components/shared/start-chat-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetUserLikedCharactersQuery } from "@/hooks/api/use-like";
import {
  RefreshCw,
} from "lucide-react";
import React from "react";

const LikesContainer = () => {
  const likedCharactersQuery = useGetUserLikedCharactersQuery();
  const refetchCharacters = () => {
    likedCharactersQuery.refetch();
  };
  
  if (likedCharactersQuery.isLoading) {
    return (
      <div className="w-full flex flex-col gap-3">
        <Skeleton className="w-full h-[70px] rounded-lg" />
        <Skeleton className="w-full h-[70px] rounded-lg" />
        <Skeleton className="w-full h-[70px] rounded-lg" />
        <Skeleton className="w-full h-[70px] rounded-lg" />
        <Skeleton className="w-full h-[70px] rounded-lg" />
      </div>
    );
  }

  if (likedCharactersQuery.isError) {
    return (
      <div className="w-full pt-10 flex flex-col gap-1 items-center">
        <h2 className="text-base">Something went wrong please try again</h2>
        <Button size="icon" variant={"outline"} onClick={refetchCharacters}>
          <RefreshCw
            className={`${likedCharactersQuery.isFetching && "animate-spin"}`}
          />
        </Button>
      </div>
    );
  }

  if (likedCharactersQuery.data && likedCharactersQuery.data?.length === 0) {
    return (
      <div className="w-full pt-10 flex flex-col gap-1 items-center">
        <h2 className="text-base">There is no any liked characters!</h2>
      </div>
    );
  }

  return (
    <ul className="w-full flex flex-col items-center gap-3">
      {likedCharactersQuery.data &&
        likedCharactersQuery.data.map((character, idx) => (
          <li
            className="relative flex justify-between items-center w-full p-2 gap-4 h-[70px] rounded-lg hover:bg-accent "
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
                <h2 className="text-sm leading-none opacity-80 line-clamp-2">
                  {" "}
                  {character.tagline}
                </h2>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <StartChatButton
                characterId={character.id}
                className="rounded-full "
                size="sm"
                variant="outline"
                hasPreviousChat={character.hasPreviousChat}
              />
              <CharacterLikeButton characterId={character.id} initialIsLiked />
            </div>
          </li>
        ))}
    </ul>
  );
};

export default LikesContainer;
