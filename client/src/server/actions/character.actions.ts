"use server";

import { serverSession } from "@/lib/auth-server";
import * as yup from "yup";
import prisma from "../config/prisma";
import { handleErrorResponse } from "../helper/error-utils";
import { uploadToCloudinary } from "../config/cloudinary";
import { aiConfig } from "../config/ai";
import { aiPrompts } from "../ai-prompts";
import { getGuestIdFromCookie } from "../helper/guest-user";
import { revalidatePath } from "next/cache";
import { enforceLimit } from "../helper/plan.helpers";

const newCharacterSchema = yup.object({
  name: yup.string().min(2).max(50).required(),
  description: yup.string().min(10).max(500).required(),
  tagline: yup.string().min(2).max(100).required(),
  personality: yup.string().min(2).max(200).required(),
  prompt: yup.string().min(10).max(1000).required(),
  avatarFile: yup
    .mixed()
    .nullable()
    .test("is-file", "Avatar must be a file", (value) => {
      return (
        value === null || (typeof File !== "undefined" && value instanceof File)
      );
    }),

  voiceStyle: yup.string().max(100).nullable(),
  backgroundUrl: yup.string().nullable(),
  themeId: yup.string().nullable(),
  visibility: yup
    .mixed<"PUBLIC" | "PRIVATE">()
    .oneOf(["PUBLIC", "PRIVATE"])
    .default("PUBLIC"),
});

const updateCharacterSchema = yup.object({
  name: yup.string().min(2).max(50).required(),
  description: yup.string().min(10).max(500).required(),
  tagline: yup.string().min(2).max(100).required(),
  personality: yup.string().min(2).max(200).required(),
  prompt: yup.string().min(10).max(1000).required(),
  avatarUrl: yup.string(),
  avatarFile: yup
    .mixed()
    .nullable()
    .test("is-file", "Avatar must be a file", (value) => {
      return (
        value === null || (typeof File !== "undefined" && value instanceof File)
      );
    }),

  voiceStyle: yup.string().max(100).nullable(),
  backgroundUrl: yup.string().nullable(),
  themeId: yup.string().nullable(),
  visibility: yup
    .mixed<"PUBLIC" | "PRIVATE">()
    .oneOf(["PUBLIC", "PRIVATE"])
    .default("PUBLIC"),
});

type NewCharacterInput = yup.InferType<typeof newCharacterSchema>;
type UpdateCharacterInput = yup.InferType<typeof updateCharacterSchema>;

// export const getCharactersAction = async ({
//   category,
//   limit = 12,
//   page = 1,
// }: {
//   category?: string;
//   limit?: number;
//   page?: number | string;
// }) => {
//   // Ensure numbers
//   const pageNumber = parseInt(String(page), 10) || 1;
//   const limitNumber = parseInt(String(limit), 10) || 12;

//   const totalCharactersCount = await prisma.character.count({
//   });

//   const totalPages = Math.ceil(totalCharactersCount / limitNumber);
//   const hasMore = pageNumber < totalPages;
//   const previousPage = pageNumber > 1 ? pageNumber - 1 : null;
//   const nextPage = hasMore ? pageNumber + 1 : null;

//   const characters = await prisma.character.findMany({
//     include: {
//       creator: {
//         select: { id: true, name: true, username: true },
//       },
//       _count: {
//         select: { messages: true, likes: true },
//       },
//     },
//     skip: (pageNumber - 1) * limitNumber, // must always be a number
//     take: limitNumber,                     // must always be a number
//   });

//   return {
//     characters,
//     pagination: {
//       currentPage: pageNumber,
//       totalPages,
//       totalItems: totalCharactersCount,
//       limit: limitNumber,
//       hasMore,
//       previousPage,
//       nextPage,
//     },
//   };
// };

export const getCharactersAction = async ({
  limit = 12,
  excludeIds = [],
}: {
  limit?: number;
  excludeIds: string[];
}) => {
  // Fetch more than needed (for better randomness)
  const results = await prisma.character.findMany({
    where: {
      id: {
        notIn: excludeIds,
      },
    },
    // ❌ removed createdAt: "desc" — that was making first load identical
    take: limit * 3, // grab extra, then shuffle down
    include: {
      creator: {
        select: { id: true, name: true, username: true },
      },
      _count: {
        select: { messages: true, likes: true },
      },
    },
  });

  // Shuffle in JS
  const shuffled = results
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item)
    .slice(0, limit); // keep only requested limit

  // Count unseen characters
  const totalUnseen = await prisma.character.count({
    where: {
      id: {
        notIn: excludeIds,
      },
    },
  });

  return {
    data: shuffled,
    hasMore: totalUnseen > shuffled.length,
  };
};

export const createCharacterAction = async (data: NewCharacterInput) => {
  const session = await serverSession();
  const userId = session?.user.id;

  if (!userId) {
    return {
      success: false,
      error: {
        code: "LOGIN_REQUIRED",
        message: "Please sign in to create a character.",
      },
    };
  }

  try {
    const userCharactersCount = await prisma.character.count({
      where: {
        creatorId: userId,
      },
    });

    const limitCheck = await enforceLimit({
      currentCount: userCharactersCount,
      type: "createdCharacters",
    });

    if (limitCheck.success === false) {
      return limitCheck;
    }

    const validatedData = await newCharacterSchema.validate(data);

    const avatarFile = validatedData.avatarFile;

    let avatarUrl;

    if (avatarFile) {
      const cloudinaryResponse = await uploadToCloudinary(avatarFile as Blob);

      avatarUrl = cloudinaryResponse?.secure_url;
    }

    delete validatedData.avatarFile;

    await prisma.character.create({
      data: {
        ...validatedData,
        avatarUrl,
        creatorId: userId,
      },
    });

    revalidatePath("/");
    return {
      success: true,
      message: "Character created successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message:
          handleErrorResponse(error).message ||
          "Failed to create new character.",
      },
    };
  }
};

export const getSingleCharacterProfileAction = async ({
  characterId,
  withSimilarCharacters,
}: {
  characterId: string;
  withSimilarCharacters?: boolean;
}) => {
  const session = await serverSession();
  const userId = session?.user.id;
  const guestId = await getGuestIdFromCookie();
  let hasPreviousChat;

  const character = await prisma.character.findUnique({
    where: { id: characterId },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      _count: {
        select: {
          messages: true,
          likes: true,
        },
      },
    },
  });

  if (userId) {
    hasPreviousChat = await prisma.chat.findFirst({
      where: {
        characterId: characterId,
        userId: userId,
      },
    });
  } else if (guestId) {
    hasPreviousChat = await prisma.chat.findFirst({
      where: {
        characterId: characterId,
        guestId: guestId,
      },
    });
  }

  let similarCharactersWithInteractions;

  if (withSimilarCharacters) {
    const similarCharacters = await prisma.character.findMany({
      take: 6,
      where: {
        avatarUrl: {
          not: null,
        },
      },
    });

    similarCharactersWithInteractions = similarCharacters;
  }

  if (!character) return null;

  return {
    character: {
      ...character,
      hasPreviousChat: !!hasPreviousChat,
    },
    similarCharacters: similarCharactersWithInteractions,
  };
};

export async function getSimilarCharactersAction(characterId: string) {
  if (!characterId) return [];

  // Fetch the original character to compare
  const originalCharacter = await prisma.character.findUnique({
    where: { id: characterId },
    select: {
      id: true,
      personality: true,
      tagline: true,
      themeId: true,
    },
  });

  if (!originalCharacter) return [];

  // Find similar characters based on personality, tagline, or theme
  const similarCharacters = await prisma.character.findMany({
    where: {
      id: { not: characterId },
      OR: [
        {
          personality: {
            contains: originalCharacter.personality,
          },
        },
        {
          tagline: { contains: originalCharacter.tagline },
        },
        {
          themeId: originalCharacter.themeId
            ? { equals: originalCharacter.themeId }
            : undefined,
        },
      ],
      visibility: "PUBLIC",
    },
    take: 10, // return at least 10
    orderBy: {
      createdAt: "desc",
    },
  });

  return similarCharacters;
}

export const getUserCharactersAction = async ({
  username,
  skip = 0,
  limit = 20,
}: {
  username: string;
  skip?: number;
  limit?: number;
}) => {
  if (!username) {
    return { characters: [], hasMore: false };
  }

  const characters = await prisma.character.findMany({
    where: {
      creator: {
        username: username,
      },
    },
    include: {
      creator: {
        select: { id: true, name: true, username: true },
      },
      _count: {
        select: { messages: true },
      },
    },
    skip,
    take: limit + 1, // Fetch one extra to check if there's more
  });

  const hasMore = characters.length > limit;

  return {
    characters: hasMore ? characters.slice(0, limit) : characters,
    hasMore,
  };
};

export const updateCharacterVisibilityAction = async ({
  characterId,
  visibility,
}: {
  characterId: string;
  visibility: "PUBLIC" | "PRIVATE";
}) => {
  const session = await serverSession();
  const userId = session?.user.id;
  if (!userId) {
    return {
      success: false,
      error: {
        message: "Unauthorized: Please sign in to update character visibility.",
      },
    };
  }
  try {
    const character = await prisma.character.findUnique({
      where: { id: characterId, creatorId: userId },
      select: {
        id: true,
        visibility: true,
      },
    });
    if (!character) {
      return {
        success: false,
        error: {
          message:
            "Character not found or you do not have permission to update it.",
        },
      };
    }
    const updatedCharacter = await prisma.character.update({
      where: { id: characterId, creatorId: userId },
      data: { visibility },
    });

    return {
      success: true,
      message: "Character visibility updated successfull",
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message:
          handleErrorResponse(error).message ||
          "Failed to update character visibility.",
      },
    };
  }
};

// 👇 TS enforces that at least one of characterId or chatId is required
export const getCharacterProfileForChatAction = async ({
  chatId,
}: {
  chatId: string;
}) => {
  const session = await serverSession();
  const userId = session?.user.id;
  const guestId = await getGuestIdFromCookie();

  if (!userId && !guestId) {
    return null;
  }

  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
    },
  });

  const character = await prisma.character.findFirst({
    where: {
      chats: { some: { id: chatId } },
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
  });

  if (userId && chat?.userId !== userId) {
    return null;
  } else if (guestId && !userId && chat?.guestId !== guestId) {
    return null;
  }

  return character;
};

export const updateCharacterAction = async ({
  characterId,
  data,
}: {
  characterId: string;
  data: UpdateCharacterInput;
}) => {
  const session = await serverSession();
  const userId = session?.user.id;

  if (!userId) {
    return {
      success: false,
      error: {
        code: "LOGIN_REQUIRED",
        message: "Please sign in to update this character.",
      },
    };
  }

  try {
    // 1. Validate the input data
    const validatedData = await updateCharacterSchema.validate(data);

    // upload avatar if there is new
    if (validatedData.avatarFile) {
      const cloudinaryResponse = await uploadToCloudinary(
        validatedData.avatarFile as Blob
      );
      validatedData.avatarUrl = cloudinaryResponse?.secure_url;
    }

    // 2. Check if the character exists and belongs to the user
    const existingCharacter = await prisma.character.findUnique({
      where: {
        id: characterId,
        creatorId: userId,
      },
    });

    if (!existingCharacter) {
      return {
        success: false,
        error: {
          message:
            "Character not found or you do not have permission to update it.",
        },
      };
    }

    if (existingCharacter.creatorId !== userId) {
      return {
        success: false,
        error: {
          message: "You can't update this charcater!",
        },
      };
    }

    // 3. Update the character in the database
    await prisma.character.update({
      where: {
        id: characterId,
        creatorId: userId,
      },
      data: {
        avatarUrl: validatedData?.avatarUrl,
        backgroundUrl: validatedData.backgroundUrl,
        description: validatedData.description,
        name: validatedData.name,
        personality: validatedData.personality,
        tagline: validatedData.tagline,
        prompt: validatedData.prompt,
        themeId: validatedData.themeId,
        visibility: validatedData.visibility,
        voiceStyle: validatedData.voiceStyle,
      },
    });

    return {
      success: true,
      message: "Character updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message:
          handleErrorResponse(error).message || "Failed to update character.",
      },
    };
  }
};

export const getCharacterForUpdate = async ({
  characterId,
}: {
  characterId: string;
}) => {
  const characterDoc = await prisma.character.findFirst({
    where: { id: characterId },
  });

  return characterDoc;
};

export const generateCharacterPromptAction = async (data: {
  name: string;
  description: string;
  personality: string;
  tagline: string;
}) => {
  try {
    const aiResponsne = await aiConfig.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: {
        text: aiPrompts.generateCharacterPrompt(data),
      },
    });

    return { success: true, prompt: aiResponsne.text?.trim() };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message:
          handleErrorResponse(error).message || "Failed to generate prompt.",
      },
    };
  }
};

export const getRandomCharactersAction = async ({
  limit = 2,
}: {
  limit: number;
}) => {
  // 1. Count exactly the rows we'll query later
  const total = await prisma.character.count({
    where: {
      visibility: "PUBLIC",
      avatarUrl: { not: null },
    },
  });

  if (total === 0) return [];

  // 2. Pick a random offset that still leaves `limit` rows
  const maxOffset = Math.max(0, total - limit);
  const skip = Math.floor(Math.random() * (maxOffset + 1)); // +1 so offset=maxOffset is reachable

  // 3. Fetch characters
  const characters = await prisma.character.findMany({
    where: {
      visibility: "PUBLIC",
      avatarUrl: { not: null },
    },
    skip,
    take: limit,
    include: {
      creator: {
        select: { id: true, name: true, username: true },
      },
    },
  });

  return characters;
};

export async function getTrendingOrSearchCharactersAction(query?: string) {
  try {
    if (query && query.trim().length > 0) {
      // 1️⃣ Search characters
      const characters = await prisma.character.findMany({
        where: {
          visibility: "PUBLIC",
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
            { tagline: { contains: query } },
            { personality: { contains: query } },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
      });

      // 2️⃣ Extract personalities from same query pool
      const personalitiesRaw = await prisma.character.findMany({
        where: {
          visibility: "PUBLIC",
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
            { tagline: { contains: query } },
            { personality: { contains: query } },
          ],
        },
        select: { personality: true },
        take: 50,
      });

      const personalities = Array.from(
        new Set(
          personalitiesRaw
            .flatMap((p) => p.personality?.split(",") || [])
            .map((p) => p.trim())
            .filter(Boolean)
        )
      ).slice(0, 6);

      return { characters, personalities };
    }

    // ------------------ TRENDING MODE ------------------
    // 1️⃣ Get trending characters by message count
    const trendingChars = await prisma.character.findMany({
      where: { visibility: "PUBLIC" },
      orderBy: {
        messages: {
          _count: "desc",
        },
      },
      take: 6,
    });

    // 2️⃣ Get trending personalities from message-heavy characters
    const trendingPersonasRaw = await prisma.character.findMany({
      where: { visibility: "PUBLIC" },
      orderBy: {
        messages: {
          _count: "desc",
        },
      },
      select: { personality: true },
      take: 50,
    });

    const trendingPersonalities = Array.from(
      new Set(
        trendingPersonasRaw
          .flatMap((p) => p.personality?.split(",") || [])
          .map((p) => p.trim())
          .filter(Boolean)
      )
    ).slice(0, 6);

    return { characters: trendingChars, personalities: trendingPersonalities };
  } catch (error) {
    return { characters: [], personalities: [] };
  }
}

export const getCharactersSearchResultAction = async ({
  query,
  sortBy,
}: {
  query?: string;
  sortBy: "likes" | "popular" | "newest";
}) => {
  const hasQuery = query && query.trim() !== "";
  let orderBy: any = {};

  switch (sortBy && sortBy?.toLowerCase()) {
    case "likes":
      orderBy = { likes: { _count: "desc" } };
      break;

    case "popular":
      orderBy = { chats: { _count: "desc" } };
      break;

    case "newest":
    default:
      // If no query or sortBy is "newest", fallback to createdAt
      orderBy = { createdAt: "desc" };
      break;
  }

  if (!hasQuery) {
    return [];
  }

  const characters = await prisma.character.findMany({
    where: {
      visibility: "PUBLIC",
      ...(hasQuery && {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { tagline: { contains: query } },
          { personality: { contains: query } },
        ],
      }),
    },
    orderBy,
    take: 10,
    include: {
      _count: {
        select: {
          likes: true,
          chats: true,
          messages: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
  });

  return characters;
};

export const getCharacterDetailAction = async ({
  characterId,
}: {
  characterId: string;
}) => {
  const characterDoc = await prisma.character.findFirst({
    where: {
      id: characterId,
    },
    include: {
      _count: {
        select: {
          messages: true,
          likes: true,
        },
      },
    },
  });

  return characterDoc;
};

export const getNftCharactersForSell = async () => { 
  const characters = await prisma.character.findMany({
    where: {
      // isListedForSale: true,
    },
    include: {
      creator: {
        select: { id: true, name: true, username: true },
      },
      _count: {
        select: { messages: true },
      },
    },
    take: 15,
  });

  return { characters };
};
