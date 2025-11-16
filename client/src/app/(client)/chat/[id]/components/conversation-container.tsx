"use client";

import { ChatInput } from "./chat-input";
import MarkdownRenderer from "@/components/shared/markdown-renderer";
import { MessagesLoader } from "@/components/shared/loaders";
import CharacterProfile from "./character-profile";
import { useChatStore } from "@/store";
import { motion } from "framer-motion";
import { Avatar } from "@/components/shared/avatar";
import { useCharacterProfileSidebar } from "@/store/character-profile-sidebar-store";
import ChatStarters from "./chat-starter";

// ================== Skeleton Components ==================
function MessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`h-[100px] ${
          isUser
            ? "bg-primary/20 w-[280px] sm:w-[320px] md:w-[400px] lg:w-[450px]"
            : "bg-accent/50 w-[300px] sm:w-[350px] md:w-[450px] lg:w-[500px]"
        } rounded-xl p-3 md:p-4 animate-pulse`}
      >
        <div className="space-y-2"></div>
      </div>
    </div>
  );
}

function ConversationSkeleton() {
  return (
    <div className="space-y-4">
      <MessageSkeleton isUser={false} />
      <MessageSkeleton isUser={true} />
      <MessageSkeleton isUser={false} />
      <MessageSkeleton isUser={true} />
      <MessageSkeleton isUser={false} />
    </div>
  );
}

// ================== Assistant Message ==================
function AssistantMessage({ content }: { content: string }) {
  const { activeChatData, activeChatTheme } = useChatStore();

  return (  
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <div className="flex gap-2 items-end overflow-hidden">
        <Avatar
          size={"md"}
          className="size-[35px]"
          alt=""
          src={activeChatData?.character?.avatarUrl || ""}
          loading="eager"
          interactive
          fallback={activeChatData?.character?.name}
        />
       
        <div className="flex w-full justify-start">
          <div
            className=" max-w-[90%] md:max-w-[80%] rounded-xl p-3 md:p-4 "
            style={{
              color: activeChatTheme?.aiTextColorHex,
              backgroundColor: activeChatTheme?.aiColorHex,
            }}
          >
            <MarkdownRenderer
              markdown={content}
              textColor={activeChatTheme?.aiTextColorHex}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ================== User Message ==================
function UserMessage({ content }: { content: string }) {
  const { activeChatTheme } = useChatStore();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex w-full justify-end overflow-x-hidden">
        <div
          className="max-w-[90%] rounded-xl p-3 md:p-4"
          style={{
            color: activeChatTheme?.userTextColorHex,
            backgroundColor: activeChatTheme?.userColorHex,
          }}
        >
          <p className="break-words text-[15px] whitespace-pre-wrap">
            {content}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ================== Error Message ==================
function ErrorMessage() {
  return (
    <div className="flex w-full justify-start">
      <div className="max-w-[85%] md:max-w-[80%] rounded-lg p-3 md:p-4 bg-muted text-red-500">
        Error occured
      </div>
    </div>
  );
}

/// ================== Conversation Container ==================
export function ConversationContainer() {
  const {
    messages,
    isGeneratingResponse,
    generationError,
    isMessagesLoading,
    activeChatBackgroundUrl,
    activeChatData,
  } = useChatStore();

  return (
    <div className="relative flex-1 flex flex-col h-[100dvh] overflow-hidden">
      {/* --- Background image --- */}
      {activeChatBackgroundUrl && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20 bg-center bg-cover"
          style={{
            backgroundImage: `url(${activeChatBackgroundUrl})`,
          }}
        />
      )}

      {/* --- Dark overlay on top of image --- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10  bg-white/20 backdrop-blur-xl dark:backdrop-blur-xl dark:bg-black/50"
      />

      {/* ---------------- Chat content ---------------- */}
      <div
        id="conversation-container"
        className="flex-1 flex flex-col pt-[55px] pb-[40px] overflow-y-auto p-3 py-4 space-y-4 max-md:px-3 md:px-[60px] xl:px-[150px]"
      >
        {<CharacterProfile />}

        {!activeChatData || isMessagesLoading ? (
          <ConversationSkeleton />
        ) : activeChatData && messages.length === 0 ? (
          <ChatStarters characterId={activeChatData?.characterId!} />
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === "USER" ? (
                  <UserMessage content={message.content} />
                ) : (
                  <AssistantMessage content={message.content} />
                )}
              </div>
            ))}

            {isGeneratingResponse && (
              <div className="pt-4 flex w-full justify-start">
                <MessagesLoader />
              </div>
            )}

            {generationError && <ErrorMessage />}
          </>
        )}
      </div>
      {/* Sticky Chat Input */}
      <ChatInput
        placeholder="Type your message..."
        className="max-md:px-2 md:px-[60px] xl:px-[150px]"
      />
    </div>
  );
}
