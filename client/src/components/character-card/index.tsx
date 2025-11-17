"use client";

import { Heart, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { UsernameLink } from "@/components/shared/username";
import Link from "next/link";
import { Avatar } from "@/components/shared/avatar";
import { useGetOrCreateChatWithCharacterMutation } from "@/hooks/api/use-chat";
import { useChatHelpers } from "@/hooks/use-chat-helpers";
import { toast } from "sonner";

export interface Character {
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  avatarUrl: string | null;
  description: string;
  tagline: string;
  personality: string;
  prompt: string;
  voiceStyle: string | null;
  creator: {
    id: string;
    name: string;
    username: string | null;
  };
  _count?: {
    messages?: number;
    likes?: number;
  };
  backgroundUrl: string | null;
  visibility: any;
  creatorId: string;
}

type Variant = "compact" | "wide" | "third";

interface BaseProps {
  character: Character;
  variant: Variant;
  directStart?: boolean | undefined;
}

interface CompactCardProps extends BaseProps {
  variant: "compact";
}

interface ThirdCardProps extends BaseProps {
  variant: "third";
}

interface WideCardProps extends BaseProps {
  variant: "wide";
  onOpen?: (id: string) => void;
}

type Props = CompactCardProps | WideCardProps | ThirdCardProps;

export function CharacterCard(props: Props) {
  const { character, variant } = props;
  const router = useRouter();

  const getOrCreateChatWithCharacter =
    useGetOrCreateChatWithCharacterMutation();
  const { handleOpenChat } = useChatHelpers();

  const handleOpenCharacter = async (characterId: any) => {
    if (props.directStart) {
      const response: any = await getOrCreateChatWithCharacter.mutateAsync({
        characterId: characterId,
      });

      if (response?.chatId) {
        // this will open new created or previous chat and close the modal also
        handleOpenChat({ chatId: response?.chatId, refresh: true });
      }
    } else {
      router.push(`/character/${characterId}`);
    }
  };

  if (variant === "compact") {
    return (
      <div className="max-sm:min-w-[340px] w-fit md:w-full flex flex-col justify-between text-muted-foreground bg-muted dark:bg-[#1c1c1f] dark:text-white rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col">
          <div className="flex items-center space-x-3 space-y-2">
            <Avatar
              size={"lg"}
              className="w-12 h-12"
              alt=""
              src={character.avatarUrl || ""}
              loading="eager"
              interactive
              fallback={character.name}
            />

            <h3 className="text-sm font-semibold">{character.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {character.description}
          </p>
        </div>
        <Link
          href={`/character/${character.id}`}
          prefetch
          className="text-xs text-gray-400 dark:text-gray-500 w-full cursor-pointer"
        >
          Reply…
        </Link>
      </div>
    );
  }
  if (variant === "third") {
    return (
      <div className="max-sm:min-w-[340px] w-fit md:w-full flex flex-col justify-between bg-muted text-muted-foreground dark:bg-[#1c1c1f] dark:text-white rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col">
          <div className="flex items-center space-x-3 space-y-2">
            <Avatar
              size={"lg"}
              className="w-12 h-12"
              alt=""
              src={character.avatarUrl || ""}
              loading="eager"
              interactive
              fallback={character.name}
            />

            <h3 className="text-sm font-semibold">{character.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {character.description}
          </p>
        </div>
        <Link
          href={`/character/${character.id}`}
          prefetch
          className="text-xs text-gray-400 dark:text-gray-500 w-full cursor-pointer"
        >
          Reply…
        </Link>
      </div>
    );
  }

  // wide variant
  return (
    <div
      onClick={() => handleOpenCharacter(character.id)}
      className="group overflow-hidden h-[130px] bg-card rounded-2xl px-2 py-2 border border-border/50 cursor-pointer transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-primary/10 hover:bg-card/80 dark:hover:shadow-primary/5"
    >
      <div className="flex items-start gap-3 h-full">
        <div className="h-full p-1">
          <Avatar
            size={"2xl"}
            className="w-22 h-full rounded-xl transition-all duration-300"
            alt=""
            src={character.avatarUrl || ""}
            loading="eager"
            interactive
            fallback={character.name}
          />
        </div>
        <div className="flex-1 h-full flex flex-col justify-between min-w-0">
          <div>
            <h3 className="text-card-foreground font-medium text-sm truncate transition-colors duration-300">
              {character.name}
            </h3>
            <UsernameLink
              prefix="By"
              username={character.creator.username!}
              size={"xs"}
              variant={"link"}
            />
            <p className="text-card-foreground/80 text-xs leading-relaxed line-clamp-2 transition-colors duration-300">
              {character.description}
            </p>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-muted-foreground transition-colors duration-300">
                <MessageCircle className="w-3 h-3" />
                <span className="text-xs">{character?._count?.messages}</span>
              </div>

              <div className="flex items-center gap-1 text-muted-foreground transition-colors duration-300">
                <Heart className="w-3 h-3" />
                <span className="text-xs">{character?._count?.likes}</span>
              </div>
            </div>
            <span className="text-xs text-foreground/70 cursor-pointer translate-y-8 group-hover:translate-y-0 transition-all">
              Start chat.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
