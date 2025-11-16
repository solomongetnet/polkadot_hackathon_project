"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Heart,
  Globe,
  Lock,
  Calendar,
  AlertCircle,
  Share2,
} from "lucide-react";
import { useGetSingleCharacterProfileQuery } from "@/hooks/api/use-character";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { UsernameLink } from "@/components/shared/username";
import { Avatar } from "@/components/shared/avatar";
import StartChatButton from "@/components/shared/start-chat-button";
import { ShareDialog } from "@/components/shared/share-dialog";
import CharacterLikeButton from "@/components/shared/character-like-button";

export default function CharacterProfileModal() {
  const router = useRouter();
  const handleClose = () => router.back();
  const params = useParams();
  const characterId = params.id as string;
  const { data, isLoading, isError } = useGetSingleCharacterProfileQuery(
    characterId!,
    {
      enabled: !!characterId,
    }
  );
  const character = data?.character;

  // Open modal if characterId exists in URL
  if (!characterId) return null;

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(dateObj);
  };

  return (
    <>
      {characterId && (
        <div
          className="fixed inset-0 z-40 bg-white/10 backdrop-blur-sm transition-all duration-300"
          onClick={handleClose}
        />
      )}

      <Dialog open={true} onOpenChange={(open) => !open && handleClose?.()}>
        <DialogContent
          className=" md:rounded-3xl sm:max-w-md p-0 gap-0 bg-background/80 backdrop-blur-xl border-border shadow-2xl z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          style={
            {
              "--tw-backdrop-blur": "none",
            } as React.CSSProperties
          }
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Character Profile</DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <CharacterLoadingSkeleton />
          ) : isError ? (
            <div className="py-20 grid place-content-center">
              Failed to load character profile. Please try again.
            </div>
          ) : (
            character && (
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <Avatar
                    size={"2xl"}
                    className="w-24 h-24"
                    alt=""
                    src={character.avatarUrl || ""}
                    loading="eager"
                    interactive
                    fallback={character.name}
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-semibold text-foreground">
                        {character.name}
                      </h2>
                    </div>
                    <p className="text-sm text-muted-foreground ">
                      {character.tagline}
                    </p>
                    <UsernameLink
                      prefix="By"
                      username={character.creator.username!}
                      size={"sm"}
                      className="mb-2"
                    />

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(character.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* About */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2 text-foreground">
                    About
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {character.description}
                  </p>
                </div>

                {/* Personality */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2 text-foreground">
                    Personality
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {character.personality.split(",").map((trait, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Voice Style */}
                {character.voiceStyle && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2 text-foreground">
                      Voice Style
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      Default
                    </Badge>
                  </div>
                )}
                {/* Actions */}
                <div className="space-y-3">
                  {/* start chat */}
                  <StartChatButton
                    characterId={character.id}
                    className="w-full rounded-full"
                  />

                  <div className="flex gap-2">
                    <CharacterLikeButton characterId={character.id} />
                    <ShareDialog
                      url={`/character/${character.id}`}
                      title="Share profile"
                    >
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent  rounded-full"
                      >
                        <Share2 />
                        Share
                      </Button>
                    </ShareDialog>
                  </div>
                </div>
              </div>
            )
          )}
          {!character && !isLoading && !isError && (
            <div className="p-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Character not found or no longer available.
                </AlertDescription>
              </Alert>
              <Button onClick={handleClose} className="w-full mt-4">
                Close
              </Button>
            </div>
          )}
        </DialogContent>{" "}
      </Dialog>
    </>
  );
}

// Loading Skeleton Component
export const CharacterLoadingSkeleton = () => (
  <div className="p-6">
    {/* Header Skeleton */}
    <div className="flex items-start gap-4 mb-6">
      <Skeleton className="w-16 h-16 rounded-full" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>

    {/* About Skeleton */}
    <div className="mb-4">
      <Skeleton className="h-4 w-16 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-3/4 mb-1" />
      <Skeleton className="h-4 w-1/2" />
    </div>

    {/* Personality Skeleton */}
    <div className="mb-4">
      <Skeleton className="h-4 w-20 mb-2" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-18" />
      </div>
    </div>

    {/* Voice Style Skeleton */}
    <div className="mb-6">
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-6 w-24" />
    </div>

    {/* Actions Skeleton */}
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </div>
  </div>
);
