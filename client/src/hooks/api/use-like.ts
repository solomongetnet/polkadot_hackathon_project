import {
  getCharacterLikesCountAction,
  getUserLikedCharactersAction,
  isUserLikeCharacterAction,
  toggleCharacterLikeAction,
} from "@/server/actions/likes.actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useErrorToast } from "../use-error-toast";

export const useToggleCharacterLikeMutation = () => {
  const queryClient = useQueryClient();
  const errorToast = useErrorToast();

  return useMutation({
    mutationFn: ({ characterId }: { characterId: string }) =>
      toggleCharacterLikeAction({ characterId }),

    // Optimistic update
    onMutate: async ({ characterId }) => {
      await queryClient.cancelQueries({ queryKey: ["user_liked_characters"] });

      const previousData = queryClient.getQueryData<any[]>([
        "user_liked_characters",
      ]);

      queryClient.setQueryData<any[]>(["user_liked_characters"], (old) => {
        if (!old) return old;
        return old.filter((char) => char.id !== characterId); // remove instantly
      });

      return { previousData };
    },
    onError: (err, { characterId }, context) => {
      // rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["user_liked_characters"],
          context.previousData
        );
      }
    },
    onSuccess: ({ success, error, message }, { characterId }) => {
      queryClient.invalidateQueries({
        queryKey: ["user_liked_characters"],
      });
      queryClient.invalidateQueries({
        queryKey: ["is_liked", characterId],
      });
      queryClient.invalidateQueries({
        queryKey: ["character_detail", characterId],
      });

      if (success && message) {
        toast.message(message);
      } else if (error?.code) {
        errorToast.showErrorToast({
          code: error.code as any,
          loginCallBack: "/",
          message: error.message,
        });
      }
    },
  });
};

export const useIsUserLikeCharacterQuery = ({
  characterId,
}: {
  characterId: string;
}) => {
  return useQuery({
    queryFn: () => isUserLikeCharacterAction({ characterId }),
    queryKey: ["is_liked", characterId],
    enabled: !!characterId,
  });
};

export const useGetCharacterLikesCount = ({
  characterId,
}: {
  characterId: string;
}) => {
  return useQuery({
    queryFn: () => getCharacterLikesCountAction({ characterId }),
    queryKey: ["character_likes_count", characterId],
    enabled: !!characterId,
  });
};

export const useGetUserLikedCharactersQuery = () => {
  return useQuery({
    queryKey: ["user_liked_characters"],
    queryFn: getUserLikedCharactersAction,
  });
};
