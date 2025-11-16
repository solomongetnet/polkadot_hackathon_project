// app/characters/[id]/page.tsx
import { getSingleCharacterProfileAction } from "@/server/actions/character.actions";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Avatar } from "@/components/shared/avatar";
import { UsernameLink } from "@/components/shared/username";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import StartChatButton from "@/components/shared/start-chat-button";
import { Suspense } from "react";
import ChatStarters from "./chat-starters";
import { ShareDialog } from "@/components/shared/share-dialog";
import CharacterLikeButton from "@/components/shared/character-like-button";

type Props = {
  params: {
    id: string;
  };
};

// Dynamic metadata for SEO + OG image support
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  const data = await getSingleCharacterProfileAction({ characterId: id });
  const character = data?.character;

  if (!character) return {};

  return {
    title: `${character.name} — AI Character`,
    description: character.tagline || character.description.slice(0, 160),
    openGraph: {
      title: character.name,
      description: character.tagline || character.description,
      images: [
        {
          url: character.avatarUrl || "/og-default.png",
          width: 1200,
          height: 630,
          alt: character.name,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: character.name,
      description: character.tagline || character.description,
      images: [character.avatarUrl || "/og-default.png"],
    },
  };
}

// Page
export default async function CharacterPage({ params }: Props) {
  const id = await params.id;
  const data = await getSingleCharacterProfileAction({
    characterId: id,
    withSimilarCharacters: true,
  });
  const character = data?.character;
  const similarCharacters = data?.similarCharacters;

  if (!character) return notFound();

  return (
    <Suspense fallback={null}>
      <div className="w-full dark:bg-[#18181B] py-[65px] px-4 sm:px-8 lg:px-[150px] xl:px-[185px]">
        <main className="flex max-md:flex-col gap-6">
          {/* left content */}

          <div className="w-full flex flex-col flex-1">
            {/* top avatar container */}
            <div className="w-full flex flex-col">
              <Avatar
                src={character.avatarUrl || ""}
                fallback={character.name}
                size={"2xl"}
                className="size-32 sm:size-36 self-center"
              />

              <div className="pt-4 flex flex-col items-center text-center">
                <h2 className="text-2xl font-medium">{character.name}</h2>
                <UsernameLink
                  className="font-medium"
                  variant={"muted"}
                  prefix="By"
                  username={character.creator.username!}
                />
              </div>

              {/* actions */}
              <div className="w-full pt-4 flex gap-2">
                <StartChatButton
                  characterId={character.id}
                  className="flex-1 rounded-full py-5"
                >
                  Chat now{" "}
                </StartChatButton>

                <ShareDialog
                  url={`/character/${character.id}`}
                  title="Share profile"
                >
                  <Button
                    variant={"outline"}
                    className="flex-1 rounded-full py-5"
                  >
                    Share
                  </Button>
                </ShareDialog>
              </div>

              {/* interactions */}
              <div className="pt-4 flex gap-3 max-sm:text-center max-sm:justify-center">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4" />
                  <h2>{character._count.messages} Interactions</h2>
                </div>

                <span>|</span>

                <div className="flex items-center gap-1">
                  <CharacterLikeButton
                    characterId={character.id}
                    variant="ghost"
                  />
                  <h2>{character._count.likes} Likes</h2>
                </div>
              </div>

              {/* personality */}
              <div className="space-y-2 pt-4">
                <h2 className="text-base font-[600]">Personality</h2>

                <div className="flex gap-2 flex-wrap">
                  {character.personality.split(",").map((p, idx) => (
                    <Badge
                      variant={"outline"}
                      className="rounded-xs"
                      key={p + idx}
                    >
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* about */}
              <div className="pt-4">
                <h2 className="text-base opacity-85 ">
                  {character.description}
                </h2>
              </div>
            </div>
          </div>

          <Separator className="md:hidden" />

          {/* right contents */}
          <div className="flex-1 h-screen w-full space-y-5">
            {/* chat starts container */}
            <Suspense>
              <ChatStarters characterId={character.id} />
            </Suspense>

            <Separator className="mt-1" />

            {/* similar Characters*/}
            {similarCharacters && similarCharacters.length !== 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-xl font-[600]">Similar characters</h2>

                <ul className="flex flex-col gap-2">
                  {similarCharacters?.map((c) => (
                    <li
                      className="flex justify-between items-center w-full p-2 h-[70px] rounded-lg hover:bg-accent cursor-pointer"
                      key={c.id}
                    >
                      <div className="flex gap-2">
                        <Avatar
                          className="size-[50px] rounded-md"
                          src={c.avatarUrl || ""}
                          fallback={c.name}
                        />

                        <div className="flex flex-col ">
                          <h2 className="text-base leading-snug"> {c.name}</h2>
                          <h2 className="text-sm leading-none opacity-80">
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
              </div>
            )}
          </div>
        </main>
      </div>
    </Suspense>
  );
}
