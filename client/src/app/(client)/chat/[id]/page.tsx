"use client";

import { useEffect } from "react";
import { useGetChatWithMessagesQuery } from "@/hooks/api/use-chat";
import { useChatHelpers } from "@/hooks/use-chat-helpers";
import { ConversationContainer } from "./components/conversation-container";
import { useChatStore } from "@/store";
import ChatHeader from "./components/chat-header";
import CharacterProfileSidebar from "./components/character-profile-sdebar";

export default function ChatPage() {
  const { setIsMessagesLoading, setActiveChatData } = useChatStore();
  const { selectedChatId, handleResetActiveChat } = useChatHelpers();

  const chatQuery = useGetChatWithMessagesQuery(selectedChatId);

  // fetch current chat data such as: chat info, intializer chat messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChatId) {
        handleResetActiveChat({ path: "/" });
        return;
      }

      setIsMessagesLoading(true); // show loading

      const { data, error } = await chatQuery.refetch();

      setIsMessagesLoading(false); // stop loading

      if (!data || error) {
        handleResetActiveChat({ path: "/" });
        return;
      }

      setActiveChatData(data);
    };

    fetchMessages();
  }, [selectedChatId]);

  return (
    <>
      <ChatHeader />
      <div className="flex-1 flex">
        <ConversationContainer />
        <CharacterProfileSidebar />
      </div>
    </>
  );
}
