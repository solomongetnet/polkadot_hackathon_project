"use server";

import { serverSession } from "@/lib/auth-server";
import prisma from "../config/prisma";
import { handleErrorResponse } from "../helper/error-utils";
import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";
import { createNotificationHelper } from "../helper/notification.helpers";

export const toggleCharacterLikeAction = async ({
  characterId,
}: {
  characterId: string;
}) => {
  try {
    const session = await serverSession();
    const currentUser = session?.user;
    const characterDoc = await prisma.character.findUnique({
      where: {
        id: characterId,
      },
      include: {
        creator: { select: { id: true } },
      },
    });

    if (!currentUser) {
      return {
        success: false,
        error: {
          message: "Please login to like this character.",
          code: "LOGIN_REQUIRED",
        },
      };
    }

    if (!characterDoc || !characterId) {
      return {
        success: false,
        error: {
          message: "Character not found",
        },
      };
    }

    const existingLike = await prisma.characterLike.findFirst({
      where: {
        AND: {
          userId: currentUser.id,
          characterId,
        },
      },
    });

    if (!existingLike) {
      await prisma.$transaction(
        async (prisma) => {
          await prisma.characterLike.create({
            data: {
              userId: currentUser.id,
              characterId,
            },
          });

          // send notification for the user;
          await createNotificationHelper({
            type: "CHARACTER_LIKE",
            recipientId: characterDoc.creator.id,
            actorId: currentUser.id,
          });
        },
        { timeout: 20_000 }
      );

      revalidatePath(`/profile/${currentUser.id}`);
      revalidatePath(`/character/${characterId}`);
      return { success: true, message: "Character liked successfull" };
    } else {
      await prisma.characterLike.delete({
        where: {
          id: existingLike.id,
        },
      });

      revalidatePath(`/profile/${currentUser.id}`);
      revalidatePath(`/character/${characterId}`);
      return { success: true, message: "Character unliked successfull" };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: handleErrorResponse(error).message,
      },
    };
  }
};

export async function isUserLikeCharacterAction({
  characterId,
}: {
  characterId: string;
}) {
  try {
    const session = await serverSession();
    const currentUser = session?.user;

    if (!currentUser) {
      return { isLiked: false };
    }

    const isLiked = await prisma.characterLike.findFirst({
      where: {
        AND: {
          userId: currentUser.id,
          characterId,
        },
      },
    });

    return { isLiked: Boolean(isLiked) };
  } catch (error) {
    return { isLiked: false };
  }
}

export async function getCharacterLikesCountAction({
  characterId,
}: {
  characterId: string;
}) {
  const likesCount = await prisma.characterLike.count({
    where: { characterId },
  });

  return likesCount;
}

export async function getUserLikedCharactersAction() {
  noStore(); // 🚀 prevents Next.js from caching this result

  const session = await serverSession();
  const currentUser = session?.user;

  const likedCharacters = await prisma.character.findMany({
    where: {
      likes: {
        some: {
          userId: currentUser?.id,
        },
      },
    },
  });

  const currentUserChats = await prisma.chat.findMany({
    where: {
      userId: currentUser?.id,
    },
  });

  const characterIdsFromUserChat = currentUserChats.map((chat) => {
    return chat.characterId;
  });

  const charactersDoc = likedCharacters.map((chara) => {
    return {
      ...chara,
      hasPreviousChat: characterIdsFromUserChat.includes(chara.id) || false,
    };
  });

  return charactersDoc;
}
