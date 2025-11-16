"use client";

import { useEffect } from "react";
import { MoreHorizontal, Trash2, Pin, PinOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  useDeleteChatMutation,
  useGetChatsForSidebarQuery,
  useTogglePinChatMutation,
} from "@/hooks/api/use-chat";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatHelpers } from "@/hooks/use-chat-helpers";
import { Avatar } from "../shared/avatar";
import { ChatsSearchModal } from "../chats-search-modal";
import { ShareDialog } from "../shared/share-dialog";
import { IoIosShareAlt } from "react-icons/io";

const ChatsContainer = () => {
  const { handleOpenChat, selectedChatId, handleResetActiveChat } =
    useChatHelpers();
  const chatsQuery = useGetChatsForSidebarQuery();
  const deleteChatMutation = useDeleteChatMutation();
  const togglePinChatMutation = useTogglePinChatMutation();

  useEffect(() => {
    chatsQuery.refetch();
  }, [selectedChatId]);

  const handleDeleteChat = (chatId: string) => {
    deleteChatMutation.mutateAsync(chatId).then(({ success }) => {
      if (success && chatId === selectedChatId) {
        handleResetActiveChat({ path: "/" });
      }
    });
  };

  const handleTogglePinChat = (chatId: string) => {
    togglePinChatMutation.mutateAsync({ chatId });
  };

  const handleChatSelect = ({
    chatId,
    themeId,
    backgroundUrl,
  }: {
    chatId: string;
    backgroundUrl: string | null;
    themeId: string | null;
  }) => {
    if (!!selectedChatId && selectedChatId === chatId) {
      return;
    }

    handleOpenChat({ chatId, backgroundUrl, themeId });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {chatsQuery.isLoading ? (
        <div className="flex flex-col gap-2 pt-3 px-2 md:px-4">
          <Skeleton className="rounded-sm h-[20px] w-[60px] hover:bg-accent" />
          <Skeleton className="rounded-sm h-[40px] hover:bg-accent mt-2" />
          <Skeleton className="rounded-sm h-[40px] hover:bg-accent" />
          <Skeleton className="rounded-sm h-[40px] hover:bg-accent" />
          <Skeleton className="rounded-sm h-[40px] hover:bg-accent" />
        </div>
      ) : chatsQuery.data && chatsQuery.data.length === 0 ? (
        <div className="text-center py-8 px-4">
          <p className="text-sm text-muted-foreground">No chats found</p>
        </div>
      ) : chatsQuery.data ? (
        <div className="flex flex-col w-full px-2 md:px-4 pt-2">
          <header className="pb-2 flex justify-between items-center sticky top-0 left-0 right-0 bg-background z-40">
            <h2 className="text-base font-semibold">Chats</h2>
            <ChatsSearchModal>
              <Button variant="ghost" size={"icon"}>
                <Search className="w-3" />
              </Button>
            </ChatsSearchModal>
          </header>

          <div className="flex flex-col gap-2 pt-2">
            {chatsQuery.data.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "group overflow-hidden flex items-center justify-between gap-2 rounded-md px-3 h-[50px] hover:bg-accent transition-colors cursor-pointer",
                  selectedChatId === chat.id && "bg-accent"
                )}
                onClick={() =>
                  handleChatSelect({
                    chatId: chat.id,
                    themeId: chat.character.themeId,
                    backgroundUrl:
                      chat.backgroundUrl || chat.character.backgroundUrl,
                  })
                }
              >
                <div className="relative cursor-pointer flex items-center">
                  <Avatar
                    size={"sm"}
                    alt=""
                    src={chat.character.avatarUrl || ""}
                    loading="eager"
                    interactive
                    fallback={chat.title}
                  />

                  {chat.pinned && (
                    <Pin className="absolute z-10 -top-1 -left-1 w-3.5 -rotate-45" />
                  )}
                </div>

                <p className="flex-1 text-sm font-medium truncate max-w-full line-clamp-1">
                  {chat.title}
                </p>

                {/* Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-80"
                      onClick={(e) => e.stopPropagation()} // Prevent parent click
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    onClick={(e) => e.stopPropagation()} // Prevent clicks inside menu from bubbling
                  >
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePinChat(chat.id);
                      }}
                      disabled={togglePinChatMutation.isPending}
                    >
                      {chat.pinned ? (
                        <>
                          <PinOff className="h-4 w-4 mr-2" /> Unpin chat
                        </>
                      ) : (
                        <>
                          <Pin className="h-4 w-4 mr-2" /> Pin chat
                        </>
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ChatsContainer;
