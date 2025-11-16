"use client";

import { useEffect } from "react";
import { useGetCharacterProfileForChatQuery } from "@/hooks/api/use-character";
import { useChatHelpers } from "@/hooks/use-chat-helpers";
import { UsernameLink } from "@/components/shared/username";
import { motion } from "framer-motion";
import { Avatar } from "@/components/shared/avatar";
import { ShareDialog } from "@/components/shared/share-dialog";
import CharacterLikeButton from "@/components/shared/character-like-button";

// ================== Character Profile Skeleton ==================
function CharacterProfileSkeleton() {
  return (
    <div className="w-full pt-6 md:pt-8 pb-4 flex justify-center">
      <div className="flex flex-col text-center items-center animate-pulse">
        <div className="w-[100px] aspect-square rounded-full bg-gray-300 dark:bg-gray-700 mb-3"></div>
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-1"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
      </div>
    </div>
  );
}

const CharacterProfile = () => {
  const { selectedChatId } = useChatHelpers();
  const {
    data: character,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetCharacterProfileForChatQuery(
    { chatId: selectedChatId! },
    { enabled: !!selectedChatId }
  );

  useEffect(() => {
    refetch();
  }, [selectedChatId]);

  if (isLoading || isFetching) {
    return <CharacterProfileSkeleton />;
  }

  if (!character || isError) {
    return null;
  }

  if (character) {
    return (
      <motion.div
        className="w-full pt-6 md:pt-8 pb-4 flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col text-center items-center">
          <Avatar
            size={"xl"}
            className="md:w-20 md:h-20"
            alt=""
            src={character.avatarUrl || ""}
            loading="eager"
            interactive
            fallback={character.name}
          />
          <span className="text-md font-semibold ">{character.name}</span>
          {/* tagline here */}
          <div className="flex flex-col text-center items-center">
            <h2 className="text-sm ">{character.tagline}</h2>
            <UsernameLink
              prefix="By"
              username={character.creator.username!}
              size={"sm"}
              variant={"muted"}
            />
          </div>
        </div>

        <div className="mt-2 flex gap-2 items-center">
          <CharacterLikeButton characterId={character.id} className="rounded-full"/>
          <ShareDialog url={`/character/${character.id}`} />
        </div>
      </motion.div>
    );
  }
};

export default CharacterProfile;
