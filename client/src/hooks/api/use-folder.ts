import {
  createNewFolder,
  getFolders,
  deleteFolder,
} from "@/server/actions/folder.actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetFoldersQuery = () => {
  return useQuery({
    queryFn: async () => getFolders(),
    queryKey: ["folders"],
  });
};

export const useCreateNewFolderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      chatIds,
      theme,
      title,
    }: {
      chatIds: any[];
      theme: string;
      title: string;
    }) => createNewFolder({ chatIds, theme, title }),
    onSuccess: ({ success, error, message }) => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      if (success) {
        toast.message(message);
      } else {
        toast.error(error?.message);
      }
    },
  });
};

export const useDeleteFolderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (folderId: string) => deleteFolder({ folderId }),
    onSuccess: ({ success, error, message }) => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      if (success) {
        toast.message(message);
      } else {
        toast.error(error?.message);
      }
    },
  });
};

export const useFetchChatMessages = () => {};
