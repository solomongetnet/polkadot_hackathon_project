import { Avatar } from "@/components/shared/avatar";
import StartChatButton from "@/components/shared/start-chat-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSimilarCharactersQuery } from "@/hooks/api/use-character";
import { useChatStore } from "@/store";
import { useCharacterProfileSidebar } from "@/store/character-profile-sidebar-store";
import React from "react";

const SimilarCharactersTab = () => {
  const characterId = useChatStore(
    (state) => state.activeChatData?.character?.id
  );
  const { isCharacterProfileSidebarOpen } = useCharacterProfileSidebar();
  const {
    data: similarCharacters,
    isLoading,
    isFetching,
  } = useGetSimilarCharactersQuery({
    characterId: characterId!,
    enabled: isCharacterProfileSidebarOpen,
  });

  return (
    <div className="px-4 md:px-4 py-6 overflow-y-scroll">
      <header className="space-y-3">
        <h2 className="text-base font-semibold">Similar Characters </h2>
      </header>

      <main className="py-5 w-full">
        {isLoading  ? (
          <div className="w-full flex flex-col gap-3 overflow-hidden">
            <Skeleton className="w-full h-[45px]" />
            <Skeleton className="w-full h-[45px]" />
            <Skeleton className="w-full h-[45px]" />
            <Skeleton className="w-full h-[45px]" />
            <Skeleton className="w-full h-[45px]" />
            <Skeleton className="w-full h-[45px]" />
          </div>
        ) : similarCharacters?.length === 0 ? (
          <div className="py-16 w-full flex justify-center items-center text-muted-foreground text-center italic">
            <p>There is no similar characters</p>
          </div>
        ) : (
          <ul className="w-full flex flex-col gap-3 ">
            {similarCharacters?.map((c) => (
              <li
                className="flex justify-between items-center w-full p-2 h-[55px] rounded-lg hover:bg-accent cursor-pointer"
                key={c.id}
              >
                <div className="flex gap-2">
                  <Avatar
                    className="size-[40px] rounded-full"
                    src={c.avatarUrl || ""}
                    fallback={c.name}
                    size={"xs"}
                  />

                  <div className="flex flex-col ">
                    <h2 className="text-sm leading-snug"> {c.name}</h2>
                    <h2 className="text-xs leading-none opacity-80">
                      {" "}
                      {c.tagline}
                    </h2>
                  </div>
                </div>

                <StartChatButton
                  characterId={c.id}
                  variant={"outline"}
                  size={"sm"}
                  className="rounded-full text-xs"
                >
                  Chat now
                </StartChatButton>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default SimilarCharactersTab;
