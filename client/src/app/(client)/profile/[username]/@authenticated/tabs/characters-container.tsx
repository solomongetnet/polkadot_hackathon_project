"use client";

import React, { useState, useEffect } from "react";
import { Avatar } from "@/components/shared/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInView } from "react-intersection-observer";
import {
  useGetUserCharactersQuery,
  useUpdateCharacterVisibilityMutation,
} from "@/hooks/api/use-character";
import {
  Check,
  EllipsisVertical,
  Globe,
  GlobeLock,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const UserCharactersContainer = () => {
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

  const updateCharacterVisibilityMutation =
    useUpdateCharacterVisibilityMutation();

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

  const handleChangeVisibility = ({
    characterId,
    visibility,
  }: {
    characterId: string;
    visibility: "PUBLIC" | "PRIVATE";
  }) => {
    if (!characterId) return;
    updateCharacterVisibilityMutation.mutate({ characterId, visibility });
  };

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
        <Link href="/character/new" prefetch>
          <Button className="rounded-full px-8">Create new</Button>
        </Link>
      </div>
    );
  }

  return (
    <ul className="w-full flex flex-col items-center gap-3">
      {allCharacters.map((character) => (
        <li
          key={character.id}
          className="relative flex justify-between items-center w-full p-2 h-[70px] rounded-lg hover:bg-accent"
        >
          <div className="flex gap-2">
            <Avatar
              className="h-[60px] w-[60px] aspect-square rounded-md"
              src={character.avatarUrl || ""}
              fallback={character.name}
            />
            <div className="flex flex-col">
              <h2 className="text-base leading-snug">{character.name}</h2>
              <h2 className="text-sm leading-none opacity-80">
                {character.tagline}
              </h2>
            </div>
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant={"ghost"} className="rounded-full">
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link href={`/character/update/${character.id}`} prefetch>
                    Edit character
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  className="rounded-full"
                  variant={"outline"}
                  disabled={
                    updateCharacterVisibilityMutation.variables?.characterId ===
                      character.id &&
                    updateCharacterVisibilityMutation.isPending
                  }
                >
                  {character.visibility === "PUBLIC" ? (
                    <Globe />
                  ) : (
                    <GlobeLock />
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onSelect={() =>
                    handleChangeVisibility({
                      characterId: character.id,
                      visibility: "PUBLIC",
                    })
                  }
                  className={
                    character.visibility === "PUBLIC" ? "font-semibold" : ""
                  }
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Public
                  {character.visibility === "PUBLIC" && (
                    <Check className="ml-auto h-4 w-4 text-green-500" />
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() =>
                    handleChangeVisibility({
                      characterId: character.id,
                      visibility: "PRIVATE",
                    })
                  }
                  className={
                    character.visibility === "PRIVATE" ? "font-semibold" : ""
                  }
                >
                  <GlobeLock className="mr-2 h-4 w-4" />
                  Private
                  {character.visibility === "PRIVATE" && (
                    <Check className="ml-auto h-4 w-4 text-green-500" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

export default UserCharactersContainer;
