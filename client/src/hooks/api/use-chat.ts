import {
  deleteChatAction,
  getChatsForSearchAction,
  getChatsForSelectAction,
  getChatWithMessagesAction,
  getChatsForSidebarAction,
  getOrCreateChatWithCharacterAction,
  togglePinChatAction,
  customizeChatThemeAction,
  clearChatHistoryAction,
} from "@/server/actions/chat.actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useErrorToast } from "../use-error-toast";

export const useGetOrCreateChatWithCharacterMutation = () => {
  const { showErrorToast } = useErrorToast();
  return useMutation({
    mutationFn: ({ characterId }: { characterId: string }) =>
      getOrCreateChatWithCharacterAction({ characterId }),
    onSuccess: ({ error }) => {
      if (error) {
        showErrorToast({
          code: error.code as any,
          message: error.message,
        });
      }
    },
  });
};

export const useGetChatsForSidebarQuery = () => {
  return useQuery({
    queryKey: ["chats"],
    queryFn: async () => getChatsForSidebarAction(),
  });
};

export const useGetChatWithMessagesQuery = (chatId: string | null) => {
  return useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => getChatWithMessagesAction(chatId),
    enabled: !!chatId,
  });
};

export const useGetChatsForSearchQuery = () => {
  return useQuery({
    queryKey: ["chats_search"],
    queryFn: async () => getChatsForSearchAction(),
  });
};

export const useGetChatsForSelectQuery = () => {
  return useQuery({
    queryKey: ["chats"],
    queryFn: async () => getChatsForSelectAction(),
  });
};

export const useDeleteChatMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chatId: string) => deleteChatAction(chatId),
    onSuccess: ({ success, error, message }) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      if (success) {
        toast.message(message);
      } else {
        toast.error(error?.message);
      }
    },
  });
};

export const useTogglePinChatMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chatId }: { chatId: string }) =>
      togglePinChatAction({ chatId }),
    onSuccess: ({ success, error, message }) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ["chats"] });
        toast.message(message);
      } else {
        toast.error(error?.message);
      }
    },
  });
};

export const useCustomizeChatThemeMutation = () => {
  const queryClient = useQueryClient();
  const { showErrorToast } = useErrorToast();
  return useMutation({
    mutationFn: (input: {
      chatId: string;
      backgroundUrl: string;
      themeId: string;
    }) => customizeChatThemeAction(input),
    onSuccess: ({ success, error, message }, { chatId }) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: [`chat${chatId}`] });
        toast.message(message);
      } else {
        if (error?.code) {
          showErrorToast({
            code: error.code as any,
            message: error.message,
          });
          return;
        }
        toast.error(error?.message);
      }
    },
  });
};

export const useClearChatHistoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { chatId: string }) => clearChatHistoryAction(input),
    onSuccess: ({ success, error, message }, { chatId }) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: [`chat${chatId}`] });
        toast.message(message);
      } else {
        toast.error(error?.message);
      }
    },
  });
};
