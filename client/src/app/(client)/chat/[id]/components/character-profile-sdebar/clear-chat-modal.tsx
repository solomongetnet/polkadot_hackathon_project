"use client";

import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useClearChatHistoryMutation } from "@/hooks/api/use-chat";
import { useChatStore } from "@/store";

const ClearChatHistoryModal = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedChatId } = useChatStore();
  const clearChatHistoryMutation = useClearChatHistoryMutation();
  const { setMessages } = useChatStore();

  const handleClear = () => {
    if (selectedChatId() && selectedChatId() !== null) {
      clearChatHistoryMutation
        .mutateAsync({ chatId: selectedChatId()! })
        .then(({ success }) => {
          if (success) {
            setIsOpen(false);
            setMessages([]);
          }
        });
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="sm:max-w-md rounded-xl border-border p-6 overflow-hidden bg-muted"
        showCloseButton={false}
      >
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Clear conversation history?
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This will permanently delete your chat history with this AI
            character. This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={clearChatHistoryMutation.isPending}
            className="px-4 py-2 h-9 text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={handleClear}
            disabled={clearChatHistoryMutation.isPending}
            className="px-4 py-2 h-9 text-sm font-medium bg-destructive text-destructive-foreground transition-colors"
          >
            Clear
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClearChatHistoryModal;
