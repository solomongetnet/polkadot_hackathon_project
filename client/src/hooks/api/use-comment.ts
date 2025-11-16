import {
  createCharacterCommentAction,
  deleteMyCommentAction,
  getCharacterCommentsAction,
  toggleCharacterCommentLikeAction,
} from "@/server/actions/comment.actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useErrorToast } from "../use-error-toast";

export const useGetCharacterCommentsQuery = ({
  characterId,
  enabled,
}: {
  characterId: string;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ["comments", characterId],
    queryFn: () => getCharacterCommentsAction({ characterId }),
    enabled,
  });
};

export const useCreateCharacterCommentMutation = () => {
  const queryClient = useQueryClient();
  const { showErrorToast } = useErrorToast();
  const toastId = "create_character";

  return useMutation({
    mutationFn: (input: { content: string; characterId: string }) =>
      createCharacterCommentAction(input),
    onSuccess: ({ success, error, message }, { characterId }) => {
      if (success) {
        queryClient.invalidateQueries({
          queryKey: ["comments", characterId],
        });
        queryClient.invalidateQueries({
          queryKey: ["comments", characterId],
        });
        toast.message(message, { id: toastId });
      } else {
        if (error?.code) {
          showErrorToast({
            code: error.code as any,
            message: error.message,
          });
          return;
        }

        toast.error(error?.message, { id: toastId });
      }
    },
  });
};

export const useDeleteMyCommentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId }: { commentId: string; characterId: string }) =>
      deleteMyCommentAction({ commentId }),
    onSuccess: ({ success, error, message }, { characterId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", characterId] });
      if (success) {
        toast.message(message);
      } else {
        toast.error(error?.message);
      }
    },
  });
};

export const useToggleCharacterCommentLikeMutation = () => {
  const queryClient = useQueryClient();
  const errorToast = useErrorToast();

  return useMutation({
    mutationFn: ({ commentId }: { commentId: string; characterId: string }) =>
      toggleCharacterCommentLikeAction({ commentId }),

    onSuccess: ({ success, error, message }, { characterId }) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", characterId],
      });

      if (success) {
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
