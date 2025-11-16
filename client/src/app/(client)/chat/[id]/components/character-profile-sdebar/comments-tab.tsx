import { Avatar } from "@/components/shared/avatar";
import { UsernameLink } from "@/components/shared/username";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/store";
import { ArrowRight, Trash } from "lucide-react";
import React, { useState } from "react";
import {
  useCreateCharacterCommentMutation,
  useDeleteMyCommentMutation,
  useGetCharacterCommentsQuery,
} from "@/hooks/api/use-comment";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth-store";
import { formatDistanceToNow } from "date-fns";
import CommentLikeButton from "@/components/shared/comment-like-button";
import { useCharacterProfileSidebar } from "@/store/character-profile-sidebar-store";

const CommentsTab = () => {
  const [commentInput, setCommentInput] = useState("");
  const characterName = useChatStore(
    (state) => state.activeChatData?.character?.name
  );
  const characterId = useChatStore(
    (state) => state.activeChatData?.character?.id
  );
  const { isCharacterProfileSidebarOpen } = useCharacterProfileSidebar();

  const {
    data: comments,
    isLoading,
    isFetching,
  } = useGetCharacterCommentsQuery({
    characterId: characterId!,
    enabled: isCharacterProfileSidebarOpen,
  });
  const createCommentMutation = useCreateCharacterCommentMutation();
  const deleteCommentMutation = useDeleteMyCommentMutation();
  const { currentUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { success } = await createCommentMutation.mutateAsync({
      content: commentInput,
      characterId: characterId!,
    });
    if (success) {
      setCommentInput("");
    }
  };

  const handleDeleteComment = (commentId: string) => {
    deleteCommentMutation.mutate({
      characterId: characterId!,
      commentId: commentId,
    });
  };

  return (
    <div className="px-4 md:px-4 py-6 overflow-y-scroll">
      <header className="space-y-3">
        <h2 className="text-base font-semibold">
          Comments{" "}
          <span className="text-muted-foreground ml-1">{comments?.length}</span>
        </h2>

        <form className="w-full flex gap-2" onSubmit={handleSubmit}>
          <Input
            className="flex-1 h-full py-3"
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder={`Write your comment about ${characterName}`}
            disabled={createCommentMutation.isPending}
            value={commentInput}
          />
          {commentInput.length >= 1 && (
            <Button
              className="rounded-full"
              size={"icon"}
              variant={"default"}
              disabled={createCommentMutation.isPending}
            >
              <ArrowRight />
            </Button>
          )}
        </form>
      </header>

      <main className="py-5">
        {isLoading ? (
          <div className="flex flex-col gap-3 overflow-hidden">
            <Skeleton className="w-full h-[45px]" />
            <Skeleton className="w-full h-[45px]" />
            <Skeleton className="w-full h-[45px]" />
            <Skeleton className="w-full h-[45px]" />
            <Skeleton className="w-full h-[45px]" />
            <Skeleton className="w-full h-[45px]" />
          </div>
        ) : comments?.length === 0 ? (
          <div className="py-16 flex justify-center items-center text-muted-foreground text-center italic">
            <p>Your comment could be the first!</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {comments?.map((c) => (
              <li className="w-full flex gap-2">
                <Avatar src={c.user.image!} size={"sm"} />

                <div className="flex flex-col gap-1">
                  <div className="flex gap-2 items-center">
                    <UsernameLink
                      turncateUsername
                      username={c.user.username!}
                      size={"xs"}
                    />

                    <span className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(c.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <p className="text-sm">{c.content}</p>

                  <div className="flex w-full gap-2 items-center">
                    <CommentLikeButton
                      characterId={characterId!}
                      commentId={c.id}
                      initialIsLiked={c.isLikedByMe}
                      likesCount={c._count.likes}
                    />

                    {currentUser.user?.id === c.userId && (
                      <Button
                        variant={"ghost"}
                        size={"sm"}
                        onClick={() => handleDeleteComment(c.id)}
                        disabled={deleteCommentMutation.isPending}
                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition"
                      >
                        <Trash className="max-w-3.5" />
                        <p className="text-xs">Delete</p>
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default CommentsTab;
