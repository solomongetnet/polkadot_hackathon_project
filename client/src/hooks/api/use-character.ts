import {
  createCharacterAction,
  getSingleCharacterProfileAction,
  getCharacterProfileForChatAction,
  generateCharacterPromptAction,
  getRandomCharactersAction,
  getUserCharactersAction,
  updateCharacterVisibilityAction,
  updateCharacterAction,
  getCharacterForUpdate,
  getSimilarCharactersAction,
  getCharacterDetailAction,
  getCharactersAction,
} from "@/server/actions/character.actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useErrorToast } from "../use-error-toast";
import { useCharactersStore } from "@/store/characters-store";
import {
  deleteCharacterForAdminAction,
  getCharactersForAdminAction,
} from "@/server/actions/admin/characters.admin.actions";

interface CreateCharacterInput {
  avatarFile: File | null;
  voiceStyle: string | null | undefined;
  name: string;
  description: string;
  tagline: string;
  personality: string;
  prompt: string;
  themeId: string | null;
  backgroundUrl: string | null;
  visibility: "PUBLIC" | "PRIVATE";
}

type UpdateCharacterInput = {
  avatarFile?: Blob | File | null | undefined;
  voiceStyle?: string | null | undefined;
  backgroundUrl?: string | null | undefined;
  themeId?: string | null | undefined;
  avatarUrl?: string | undefined;
  name: string;
  description: string;
  tagline: string;
  personality: string;
  prompt: string;
  visibility: "PUBLIC" | "PRIVATE";
};

export const useGetCharactersQuery = ({
  input,
  enabled,
  clearCache,
}: {
  input: { limit: number };
  enabled: boolean | null;
  clearCache?: boolean;
}) => {
  const {
    setCharacters,
    setLoadedCharactersIds,
    setStatus,
    loadedCharacterIds,
    clearCharacters,
    clearLoadedCharactersIds,
  } = useCharactersStore();
  const _enabled = loadedCharacterIds.length === 0;
  return useQuery({
    queryKey: ["characters"],
    queryFn: async () => {
      try {
        const excludeIdsLength = loadedCharacterIds.length;
        setStatus({
          isLoading: excludeIdsLength === 0 ? true : false,
          isError: false,
          isFetching: true,
        });

        if (clearCache) {
          clearLoadedCharactersIds();
        }

        const { data, hasMore } = await getCharactersAction({
          ...input,
          excludeIds: clearCache ? [] : loadedCharacterIds,
        });

        if (data) {
          const newLoadedCharacterIds = (data as any).map((c: any) => c.id);

          if (clearCache) {
            clearLoadedCharactersIds();
            clearCharacters();
          }

          setLoadedCharactersIds({
            newLoadedCharacterIds,
          });

          setCharacters({ characters: data as any, hasMore: hasMore });
          setStatus({
            isLoading: false,
            isError: false,
            isFetching: false,
          });
        }
      } catch (error) {
        setStatus({
          isLoading: false,
          isError: true,
          isFetching: false,
        });
      }
    },
    enabled: enabled !== null ? enabled : _enabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchIntervalInBackground: false,
    staleTime: Infinity,
  });
};

export const useCreateCharacterMutation = () => {
  const { showErrorToast } = useErrorToast();

  return useMutation({
    mutationFn: (data: CreateCharacterInput) => createCharacterAction(data),
    onSuccess: ({ success, error, message }) => {
      if (success) {
        toast.success(message);
      } else {
        // if (error?.code === "LOGIN_REQUIRED") {
        //   showErrorToast({
        //     code: error?.code as any,
        //     message: error?.message,
        //     // loginCallback: "/character/new",
        //   });
        //   return;
        // }
        showErrorToast({
          code: error?.code as any,
          message: error?.message,
          // loginCallback: "/character/new",
        });
      }
    },
  });
};

export const useGetSimilarCharactersQuery = ({
  characterId,
  enabled,
}: {
  characterId: string;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ["similar_chracters"],
    queryFn: () => getSimilarCharactersAction(characterId),
    enabled: enabled,
  });
};

export const useGetCharacterDetailQuery = ({
  characterId,
  enabled,
}: {
  characterId: string;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ["character_detail", characterId],
    queryFn: () => getCharacterDetailAction({ characterId }),
    enabled: enabled,
  });
};

export const useUpdateCharacterMutation = () => {
  return useMutation({
    mutationFn: ({
      data,
      characterId,
    }: {
      data: UpdateCharacterInput;
      characterId: string;
    }) => updateCharacterAction({ data, characterId }),
    onSuccess: ({ success, error, message }) => {
      if (success) {
        toast.message(message);
      } else {
        toast.message(error?.message);
      }
    },
  });
};

export const useGetCharacterForUpdateQuery = (
  characterId: string,
  { enabled }: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["characters", characterId],
    queryFn: async () =>
      getCharacterForUpdate({
        characterId,
      }),
    enabled,
  });
};

export const useGenerateCharacterPromptMutation = () => {
  return useMutation({
    mutationFn: (data: {
      name: string;
      description: string;
      personality: string;
      tagline: string;
    }) => generateCharacterPromptAction(data),
  });
};

export const useUpdateCharacterVisibilityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      characterId,
      visibility,
    }: {
      characterId: string;
      visibility: "PUBLIC" | "PRIVATE";
    }) => updateCharacterVisibilityAction({ characterId, visibility }),
    onSuccess: ({ success, error, message }) => {
      if (success) {
        queryClient.invalidateQueries({
          queryKey: ["user_characters"],
          type: "all",
        });
        toast.message(message);
      } else {
        toast.error(error?.message || "Failed to update visibility");
      }
    },
  });
};

export const useGetSingleCharacterProfileQuery = (
  characterId: string,
  { enabled }: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["characters", characterId],
    queryFn: async () =>
      getSingleCharacterProfileAction({
        characterId,
        withSimilarCharacters: false,
      }),
    enabled,
  });
};

export const useGetRandomCharactersQuery = ({ limit }: { limit: number }) => {
  return useQuery({
    queryKey: ["random_characters"],
    queryFn: async () => getRandomCharactersAction({ limit }),
  });
};

export const useGetUserCharactersQuery = ({
  username,
  skip = 0,
  limit = 5,
}: {
  username: string;
  skip?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["user_characters", username, skip],
    queryFn: () => getUserCharactersAction({ username, skip, limit }),
    staleTime: 1000 * 60 * 5, // cache 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetCharacterProfileForChatQuery = (
  { chatId }: { chatId: string },
  { enabled }: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["characters", chatId],
    queryFn: async () => getCharacterProfileForChatAction({ chatId }),
    enabled,
  });
};

// ------------------admin----------------------
export const useGetCharactersForAdminQuery = (params: {
  page: number;
  limit: number;
  sortField: any | undefined;
  sortDirection: any | undefined;
  role: any | undefined;
  status: any | undefined;
  search: string | undefined;
}) => {
  return useQuery({
    queryKey: ["characters"],
    queryFn: () => getCharactersForAdminAction(params),
  });
};

export const useDeleteCharacterForAdminMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ characterId }: { characterId: string }) =>
      deleteCharacterForAdminAction({ characterId }),
    onSuccess: ({ success, error, message }) => {
      if (success) {
        queryClient.invalidateQueries({
          queryKey: ["characters"],
          type: "all",
        });
        toast.message(message);
      } else {
        toast.error(error?.message || "Failed!");
      }
    },
  });
};
