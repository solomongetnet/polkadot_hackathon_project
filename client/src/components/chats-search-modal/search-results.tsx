import { Button } from "@/components/ui/button";
import { useChatHelpers } from "@/hooks/use-chat-helpers";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { MessageSquare } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Avatar } from "../shared/avatar";

interface Chat {
  id: string;
  createdAt: Date;
  title: string;
  character: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}
const SearchResults = ({
  searchQuery,
  chats,
  setIsSearchModalOpen,
}: {
  searchQuery: string;
  chats: Chat[];
  setIsSearchModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [filtredChats, setFiltredChats] = useState(chats.slice(0, 5));
  const { handleOpenChat } = useChatHelpers();

  const handleSelectChat = (chatId: string) => {
    handleOpenChat({ chatId,  });
    setIsSearchModalOpen(false);
  };

  useEffect(() => {
    if (searchQuery) {
      const _filtredChats = chats.filter((chat) => {
        return chat.title.toLowerCase().includes(searchQuery.toLowerCase());
      });

      setFiltredChats(_filtredChats);
    } else {
      setFiltredChats(chats.slice(0, 5));
    }
  }, [chats, searchQuery]);

  if (filtredChats.length >= 1) {
    return (
      <>
        <ScrollArea className="h-full md:max-h-96 overflow-y-scroll">
          <div className="p-4 pt-3">
            {!searchQuery && (
              <div className="text-sm font-medium text-muted-foreground mb-3">
                Recent
              </div>
            )}

            <div className="space-y-1">
              {filtredChats.map((chat) => (
                <Button
                  onClick={() => handleSelectChat(chat.id)}
                  key={chat.id}
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10 px-3 text-left"
                >
                    <Avatar
                      src={chat.character.avatarUrl || ""}
                      size={"sm"}
                      fallback={chat.character.name}
                    />
                  <span className="truncate">{chat.character.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </ScrollArea>
      </>
    );
  } else {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No chats found for "{searchQuery}"
      </div>
    );
  }
};

export default SearchResults;
