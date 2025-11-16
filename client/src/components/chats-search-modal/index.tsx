"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGetChatsForSearchQuery } from "@/hooks/api/use-chat";
import SearchResults from "./search-results";

interface ChatItem {
  id: string;
  title: string;
  timestamp?: string;
}

interface SearchModalProps {
  children: React.ReactNode;
}

export function ChatsSearchModal({ children }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  const chatsQuery = useGetChatsForSearchQuery();

  const onOpenChange = (bool: boolean) => {
    setIsOpen(bool);
  };
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[40] bg-white/10 backdrop-blur-sm transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent
          className="h-[70dvh] w-full md:h-[60dvh] md:w-[600px] p-0 flex flex-col gap-0 bg-white/70 dark:bg-black/50 backdrop-blur-3xl overflow-hidden"
          showCloseButton={false}
        >
          <DialogHeader className="py-0 pb-0 mb-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-5 h-full w-full bg-transparent border-0 outline-0 ring-0 focus:right-0 focus:outline-0 focus:border-0 rounded-none"
                autoFocus
              />
              <Button
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                variant={"ghost"}
                size={"icon"}
                onClick={() => setIsOpen(false)}
              >
                <X className=" text-muted-foreground h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {chatsQuery.isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : chatsQuery.data?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No chats found{" "}
            </div>
          ) : (
            chatsQuery.data && (
              <SearchResults
                setIsSearchModalOpen={setIsOpen}
                chats={chatsQuery?.data}
                searchQuery={searchQuery}
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
