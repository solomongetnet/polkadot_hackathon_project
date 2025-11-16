"use server";

import { serverSession } from "@/lib/auth-server";
import prisma from "../config/prisma";
import { handleErrorResponse } from "../helper/error-utils";
import * as yup from "yup";
import { createNotificationHelper } from "../helper/notification.helpers";

const validateNewCharacterComment = yup.object({
  characterId: yup.string().required(),
  content: yup.string().required(),
});

export async function createCharacterCommentAction(input: {
  characterId: string;
  content: string;
}) {
  try {
    const session = await serverSession();
    const userId = session?.user.id;

    if (!userId) {
      return {
        success: false,
        error: {
          message: "Please login to write comment",
          code: "LOGIN_REQUIRED",
        },
      };
    }

    const { characterId, content } = await validateNewCharacterComment.validate(
      input
    );

    const characterDoc = await prisma.character.findFirst({
      where: {
        id: characterId,
      },
    });

    if (!characterDoc) {
      return {
        success: false,
        error: {
          message: "Character not found",
        },
      };
    }

    await prisma.characterComment.create({
      data: {
        characterId,
        content,
        userId,
      },
      include: {
        user: true, // include user info
      },
    });

    await createNotificationHelper({
      recipientId: characterDoc?.creatorId,
      actorId: userId,
      type: "CHARACTER_COMMENT",
    });

    return { success: true, message: "Comment success" };
  } catch (err) {
    return {
      success: false,
      error: {
        message: handleErrorResponse(err).message || "Something went wrong.",
      },
    };
  }
}

export const getCharacterCommentsAction = async ({
  characterId,
}: {
  characterId: string;
}) => {
  const session = await serverSession();
  const userId = session?.user.id;

  const comments = await prisma.characterComment.findMany({
    where: {
      characterId,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          image: true,
        },
      },
      likes: {
        select: {
          userId: true,
          id: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!userId) {
    return comments.map((c) => {
      return { isLikedByMe: false, ...c };
    });
  }

  return comments.map((c) => {
    const userIds = c.likes.map((l) => l.userId);

    if (userIds.includes(userId)) {
      return { isLikedByMe: true, ...c };
    }

    return { isLikedByMe: false, ...c };
  });
};

export const deleteMyCommentAction = async ({
  commentId,
}: {
  commentId: string;
}) => {
  try {
    const session = await serverSession();
    const userId = session?.user.id;

    if (!userId) {
      return {
        success: false,
        error: {
          message: "Please login to write comment",
          code: "LOGIN_REQUIRED",
        },
      };
    }

    const commentDoc = await prisma.characterComment.findFirst({
      where: {
        id: commentId,
      },
    });

    if (!commentDoc || commentDoc.userId !== userId) {
      return {
        success: false,
        error: {
          message: "Can't delete this comment",
        },
      };
    }

    await prisma.characterComment.delete({
      where: {
        id: commentId,
      },
    });
    return { success: true, message: "Deleted" };
  } catch (err) {
    return {
      success: false,
      error: {
        message: handleErrorResponse(err).message || "Something went wrong.",
      },
    };
  }
};

export const toggleCharacterCommentLikeAction = async ({
  commentId,
}: {
  commentId: string;
}) => {
  try {
    const session = await serverSession();
    const currentUser = session?.user;

    const commentDoc = await prisma.characterComment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!currentUser) {
      return {
        success: false,
        error: {
          message: "Please login to like this comment",
          code: "LOGIN_REQUIRED",
        },
      };
    }

    if (!commentDoc || !commentId) {
      return {
        success: false,
        error: {
          message: "Comment not found",
        },
      };
    }

    const existingLike = await prisma.characterCommentLike.findFirst({
      where: {
        AND: {
          userId: currentUser.id,
          commentId,
        },
      },
    });

    if (!existingLike) {
      await prisma.$transaction(
        async (prisma) => {
          await prisma.characterCommentLike.create({
            data: {
              userId: currentUser.id,
              commentId,
            },
          });

          // send notification for the user;
          await createNotificationHelper({
            type: "CHARACTER_COMMENT_LIKE",
            recipientId: commentDoc.userId,
            actorId: currentUser.id,
          });
        },
        { timeout: 20_000 }
      );

      return { success: true, message: "Liked" };
    } else {
      await prisma.characterCommentLike.delete({
        where: {
          id: existingLike.id,
        },
      });

      return { success: true, message: "Unliked" };
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
