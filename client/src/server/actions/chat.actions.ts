"use server";

import prisma from "../config/prisma";
import { serverSession } from "@/lib/auth-server";
import { aiConfig } from "../config/ai";
import { aiPrompts } from "../ai-prompts";
import {
  generateGuestId,
  getGuestIdFromCookie,
  saveGuestIdInCookie,
} from "../helper/guest-user";
import { enforceLimit, hasFeatureAccess } from "../helper/plan.helpers";
import { handleErrorResponse } from "../helper/error-utils";

export async function getChatsForSidebarAction() {
  const session = await serverSession();

  if (!session) {
    const guestId = await getGuestIdFromCookie();

    const chats = await prisma.chat.findMany({
      where: {
        AND: {
          guestId,
          userId: null,
        },
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        backgroundUrl: true,
        themeId: true,
        pinned: true,
        character: {
          select: {
            avatarUrl: true,
            name: true,
            id: true,
            backgroundUrl: true,
            themeId: true,
          },
        },
      },
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    });

    return chats;
  }

  const chats = await prisma.chat.findMany({
    where: {
      AND: {
        userId: session.user.id,
        guestId: null,
      },
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      backgroundUrl: true,
      themeId: true,
      pinned: true,
      character: {
        select: {
          avatarUrl: true,
          name: true,
          id: true,
          backgroundUrl: true,
          themeId: true,
        },
      },
    },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });

  return chats;
}

export const getChatWithMessagesAction = async (chatId: string | null) => {
  const session = await serverSession();
  const userId = session?.user.id ?? null;
  const guestId = await getGuestIdFromCookie();

  if (!chatId) return null;

  const whereCondition = userId
    ? {
        id: chatId,
        userId, // ✅ Only allow if it matches the logged-in user
      }
    : {
        id: chatId,
        AND: {
          guestId, // ✅ Must match guest cookie
          userId: null, // ✅ Ensure it’s not a real user chat
        },
      };

  const chat = await prisma.chat.findFirst({
    where: whereCondition,
    include: {
      messages: true,
      character: {
        select: {
          id: true,
          avatarUrl: true,
          name: true,
          personality: true,
          tagline: true,
          description: true,
          createdAt: true,
          backgroundUrl: true,
          themeId: true,
          voiceStyle: true,
          creator: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      },
    },
  });

  return chat ?? null;
};

// Get all chats for a user
export async function getChatsForSelectAction() {
  const session = await serverSession();

  if (!session) {
    return null;
  }

  const chats = await prisma.chat.findMany({
    where: {
      userId: session?.user.id,
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return chats;
}

// Delete a chat
export async function deleteChatAction(chatId: string) {
  try {
    const session = await serverSession();
    const userId = session?.user.id;
    const guestId = await getGuestIdFromCookie();

    const chatToDelete = await prisma.chat.findFirst({
      where: {
        id: chatId,
      },
    });

    if (
      (userId && chatToDelete?.userId !== userId) ||
      (!userId &&
        guestId &&
        (chatToDelete?.guestId !== guestId || chatToDelete?.userId !== null))
    ) {
      throw new Error("Unable to delete this chat");
    }

    await prisma.chat.delete({
      where: {
        id: chatId,
      },
    });

    return { success: true, message: "Chat deleted successfully" };
  } catch (error) {
    return {
      success: false,
      error: {
        message: "Failed to delete chat",
      },
    };
  }
}

export const getChatsForSearchAction = async () => {
  const session = await serverSession();
  const userId = session?.user.id;

  if (!userId) {
    return null;
  }

  const chats = await prisma.chat.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      createdAt: true,
      character: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return chats;
};

export const getOrCreateChatWithCharacterAction = async ({
  characterId,
}: {
  characterId: string;
}) => {
  try {
    // 1. Get session and user info
    const session = await serverSession();
    const userId = session?.user.id ?? null;
    const personName = session?.user.name?.split(" ")?.[0] ?? "there";

    // 2. Validate character exists early
    const character = await prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      return {
        success: false,
        error: { code: "CHARACTER_NOT_FOUND", message: "Character not found" },
        chatId: null,
      };
    }

    // 3. Guest user flow: allow only one chat ever
    if (!userId) {
      let guestId = await getGuestIdFromCookie();

      if (!guestId) {
        guestId = generateGuestId();
        await saveGuestIdInCookie(guestId);
      }

      const existingGuestChat = await prisma.chat.findFirst({
        where: {
          guestId,
        },
        select: { id: true, characterId: true },
      });

      if (existingGuestChat && existingGuestChat.characterId === characterId) {
        // Guest already has a chat, require login for new ones
        return {
          success: true,
          chatId: existingGuestChat.id, // optional: return existing chat id
        };
      } else if (existingGuestChat) {
        return {
          success: false,
          chatId: null,
          error: {
            code: "LOGIN_REQUIRED",
            message: "You can only chat with one character without logging in.",
          },
        };
      }

      // Create new chat for guest
      const greeting =
        (
          await aiConfig.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: {
              text: aiPrompts.generateCharacterGreetingPrompt({
                character,
                personName,
              }),
            },
          })
        ).text?.trim() ?? `Hello there, I am ${character.name}!`;

      const newChat = await prisma.chat.create({
        data: {
          characterId,
          title: character.name,
          userId: null,
          guestId,
          messages: {
            create: {
              content: greeting,
              role: "ASSISTANT",
              characterId,
            },
          },
        },
      });

      return { success: true, chatId: newChat.id };
    }

    // 4. Logged-in user flow: check for existing chat with this character
    const existingChat = await prisma.chat.findFirst({
      where: { userId, characterId },
      select: { id: true },
    });

    if (existingChat) {
      return { success: true, chatId: existingChat.id };
    }

    const currentUserChatCount = await prisma.chat.count({
      where: {
        userId,
      },
    });

    // plan limitation
    const limitCheck = await enforceLimit({
      type: "chats",
      currentCount: currentUserChatCount,
    });

    if (limitCheck?.success === false) {
      return limitCheck;
    }

    // Create new chat for logged-in user
    const greeting =
      (
        await aiConfig.models.generateContent({
          model: "gemini-2.0-flash-lite",
          contents: {
            text: aiPrompts.generateCharacterGreetingPrompt({
              character,
              personName,
            }),
          },
        })
      ).text?.trim() ?? `Hello there, I am ${character.name}!`;

    const newChat = await prisma.chat.create({
      data: {
        characterId,
        title: character.name,
        userId,
        messages: {
          create: {
            content: greeting,
            role: "ASSISTANT",
            characterId: characterId,
          },
        },
      },
    });

    return { success: true, chatId: newChat.id };
  } catch (error) {
    return {
      success: false,
      error: { message: handleErrorResponse(error).message },
      chatId: null
    };
  }
};

export const togglePinChatAction = async ({ chatId }: { chatId: string }) => {
  try {
    const session = await serverSession();
    const currentUser = session?.user;

    const chatDoc = await prisma.chat.findFirst({
      where: {
        id: chatId,
      },
    });

    if (!chatDoc) {
      return {
        success: false,
        error: {
          message: "Chat not found",
        },
      };
    }

    if (!currentUser) {
      return {
        success: false,
        error: {
          message: "Please login first",
        },
      };
    }

    if (currentUser?.id !== chatDoc.userId) {
      return {
        success: false,
        error: {
          message: "You can't make change!",
        },
      };
    }

    if (chatDoc.pinned) {
      // let unpin the chat
      await prisma.chat.update({
        where: {
          id: chatDoc.id,
        },
        data: {
          pinned: false,
          pinnedAt: null,
        },
      });

      return { message: "Unpinned Successfull", success: true };
    } else {
      // let unpin the chat
      await prisma.chat.update({
        where: {
          id: chatDoc.id,
        },
        data: {
          pinned: true,
          pinnedAt: new Date(),
        },
      });

      return { message: "Pinned Successfull", success: true };
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

export const customizeChatThemeAction = async ({
  themeId,
  backgroundUrl,
  chatId,
}: {
  themeId: string;
  backgroundUrl: string;
  chatId: string;
}) => {
  try {
    const session = await serverSession();
    const userData = session?.user;
    const hasFeatureAccessResult = await hasFeatureAccess("themes");

    const chatDoc = await prisma.chat.findFirst({
      where: {
        id: chatId,
      },
    });

    if (!userData) {
      return {
        success: false,
        error: {
          message: `You should login to access this feature.`,
          code: "LOGIN_REQUIRED",
        },
      };
    }

    if (!chatDoc) {
      return {
        success: false,
        error: {
          message: `Chat not found!`,
        },
      };
    }

    if (!hasFeatureAccessResult) {
      return {
        success: false,
        error: {
          message: `This feature is for plus users please upgrade your free plan to access`,
          code: "PLUS_REQUIRED",
        },
      };
    }

    const result = await prisma.chat.update({
      where: {
        id: chatDoc.id,
      },
      data: {
        backgroundUrl,
        themeId,
      },
      include: {
        character: {
          select: {
            id: true,
            backgroundUrl: true,
            themeId: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Theme updated successfully",
      updatedData: {
        themeId: result.themeId || result.character.themeId,
        backgroundUrl: result.backgroundUrl || result.character.backgroundUrl,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: { message: handleErrorResponse(error).message },
    };
  }
};

export const clearChatHistoryAction = async ({
  chatId,
}: {
  chatId: string;
}) => {
  try {
    const session = await serverSession();
    const userData = session?.user;

    const chatDoc = await prisma.chat.findFirst({
      where: {
        id: chatId,
      },
    });

    if (!userData) {
      return {
        success: false,
        error: {
          message: `You should login to access this.`,
          code: "LOGIN_REQUIRED",
        },
      };
    }

    if (!chatDoc) {
      return {
        success: false,
        error: {
          message: `Chat not found!`,
        },
      };
    }

    if (chatDoc.userId !== userData.id) {
      return {
        success: false,
        error: {
          message: "Hmmm, are you sure? buddy",
        },
      };
    }

    await prisma.message.deleteMany({
      where: {
        chatId: chatDoc.id,
      },
    });

    return { success: true, message: "Cleared successfull" };
  } catch (error) {
    return {
      success: false,
      error: { message: handleErrorResponse(error).message },
    };
  }
};
