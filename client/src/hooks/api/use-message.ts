import { generateAIResponse } from "@/server/actions/message.actions";
import { useMutation,  } from "@tanstack/react-query";

export const useGenerateResponseMutation = () => {
  return useMutation({
    mutationFn: ({ message, chatId }: { message: string; chatId: string }) =>
      generateAIResponse({
        message,
        chatId,
      }),
  });
};
