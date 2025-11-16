"use client";

import type React from "react";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ChevronDown, Loader2, Phone, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGenerateResponseMutation } from "@/hooks/api/use-message";
import { useNotificationSound } from "@/hooks/use-notification";
import { useChatHelpers } from "@/hooks/use-chat-helpers";
import { useChatStore } from "@/store";
import { scrollToBottom } from "@/helper/scroll";
import CallModal from "./call-modal";
import { useSearchParams, useRouter } from "next/navigation";
import ScrollToBottom from "./scroll-to-bottom";
import { toast } from "sonner";
import EmojiPicker from "@/components/emoji-picker-popover";
import { useErrorToast } from "@/hooks/use-error-toast";

interface EnhancedInputProps {
  onSubmit?: (message: string) => void;
  placeholder?: string;
  className?: string;
  enableEffects?: boolean;
  initialMessage?: string;
}

export function ChatInput({ className }: EnhancedInputProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { playNotification } = useNotificationSound();
  const { selectedChatId } = useChatHelpers();
  const searchParams = useSearchParams();
  const chatStarterSearchParam =
    searchParams.get("chat_starter")?.toString() || "";
  const router = useRouter();
  const sendMessageToAiMutation = useGenerateResponseMutation();
  const errorToast = useErrorToast();

  const {
    addMessage,
    setIsGeneratingResponse,
    setGenerationError,
    activeChatData,
    isMessagesLoading,
    removeLastMessage,
  } = useChatStore();

  useLayoutEffect(() => {
    if (chatStarterSearchParam) {
      setInputMessage(chatStarterSearchParam.trim());
      router.push(`/chat/${selectedChatId}`);
    }
  }, [searchParams]);

  const handleOpenCallModal = () => {
    setIsCallModalOpen(true);
  };

  const handleCloseCallModal = () => {
    setIsCallModalOpen(false);
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [inputMessage]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e && e.preventDefault();
    if (inputMessage.trim()) {
      // add user message in state
      addMessage({
        id: Date.now().toString(),
        content: inputMessage,
        role: "USER",
        chatId: selectedChatId!,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // scroll chat container to bottom
      scrollToBottom({
        behavior: "instant",
        elementId: "conversation-container",
      });

      setInputMessage("");
      setIsGeneratingResponse(true);

      const response: any = await sendMessageToAiMutation.mutateAsync({
        message: inputMessage,
        chatId: selectedChatId!,
      });
      setIsGeneratingResponse(false);

      // scroll chat container to bottom
      scrollToBottom({
        behavior: "instant",
        elementId: "conversation-container",
      });

      playNotification();

      if (response.message) {
        setGenerationError(null);

        addMessage({
          id: response?.message?.id,
          content: response.message?.content,
          role: response.message?.role ?? "ASSISTANT",
          chatId: selectedChatId!,
          createdAt: response.message.createdAt,
          updatedAt: response.message.updatedAt,
        });
      } else if (response.error.code === "PLUS_REQUIRED") {
        removeLastMessage();

        errorToast.showErrorToast({
          code: "LOGIN_REQUIRED",
          message: response?.error.message,
        });
      } else if (response.error.code === "PLUS_REQUIRED") {
        errorToast.showErrorToast({
          code: "PLUS_REQUIRED",
          message: response.error.message,
        });
      } else if (response.error) {
        toast.message("Unable to send your message please try again");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputMessage.trim() && !sendMessageToAiMutation.isPending) {
        handleSubmit();
      }
    }
  };

  return (
    <>
      <div className={cn("sticky bottom-4 left-0 right-0 w-full ", className)}>
        <ScrollToBottom />

        <form
          onSubmit={handleSubmit}
          className="relative w-full  bg-[#fff]/70 dark:bg-[#5f5f5f]/40 backdrop-blur-3xl rounded-2xl shadow border"
        >
          <div className="relative flex flex-col">
            <div
              className={cn(
                "flex-1 flex flex-col items-start relative gap-3 pt-3 px-3 md:px-4"
              )}
            >
              <Textarea
                name="chat-input"
                id="chat-input"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="md:text-lg break-words py-3 md:placeholder:text-base flex items-center bg-white/0 min-h-[30px] md:min-h-[45px] max-h-[200px] resize-none border-0 outline-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground/60"
                rows={1}
                placeholder={`Let ${
                  activeChatData?.character?.name || "them"
                } know what's up...`}
                style={{ background: "transparent", border: "0px" }}
                autoFocus
                spellCheck={false}
              />

              <div className={cn("flex gap-2 w-full justify-end pb-3")}>
                <EmojiPicker
                  trigger={
                    <Button
                      size="icon"
                      variant="outline"
                      className="rounded-full"
                    >
                      <Smile className="size-4" />
                      <span className="sr-only">{"Insert emoji"}</span>
                    </Button>
                  }
                  columns={10}
                  onSelect={(e) => setInputMessage((m) => m + " " + e.char)}
                  title="Insert emoji"
                />

                <Button
                  type="submit"
                  size="icon"
                  variant="outline"
                  className="rounded-full bg-transparent"
                  onClick={handleOpenCallModal}
                  disabled={
                    sendMessageToAiMutation.isPending ||
                    isMessagesLoading ||
                    !activeChatData?.character
                  }
                >
                  <Phone />
                </Button>

                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full"
                  disabled={
                    sendMessageToAiMutation.isPending ||
                    !inputMessage.trim() ||
                    isMessagesLoading
                  }
                >
                  {sendMessageToAiMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Render the CallModal conditionally */}
      </div>
      {isCallModalOpen && (
        <CallModal isOpen={isCallModalOpen} onClose={handleCloseCallModal} />
      )}{" "}
    </>
  );
}
