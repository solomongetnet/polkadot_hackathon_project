"use server";

import { serverSession } from "@/lib/auth-server";
import prisma from "../config/prisma";
import { aiConfig } from "../config/ai";
import { aiPrompts } from "../ai-prompts";
import { getGuestIdFromCookie } from "../helper/guest-user";
import { enforceLimit } from "../helper/plan.helpers";

async function addMessage({
  chatId,
  content,
  role,
}: {
  chatId: string;
  content: string;
  role: "USER" | "ASSISTANT";
}) {
  const session = await serverSession();
  const userId = session?.user?.id;
  const guestId = await getGuestIdFromCookie();

  // Confirm chat exists and belongs to user
  const chatDoc = await prisma.chat.findFirst({
    where: { id: chatId },
  });

  if (!chatDoc) {
    return { success: false, error: { message: "Chat not found" } };
  }

  if (chatDoc.userId && chatDoc.userId !== userId) {
  } else if (chatDoc.guestId && chatDoc.guestId !== guestId) {
    return {
      error: { message: "Sorry you can't access this chat!" },
      success: false,
    };
  }

  // Create message
  const message = await prisma.message.create({
    data: { content, role, chatId, characterId: chatDoc.characterId },
    select: { id: true, content: true, role: true, createdAt: true },
  });

  await prisma.chat.update({
    where: { id: chatId },
    data: { updatedAt: new Date() },
  });

  return { message, chatId };
}

export async function generateAIResponse({
  chatId,
  message,
}: {
  chatId: string;
  message: string;
}) {
  try {
    let chatDoc = await prisma.chat.findFirst({
      where: { id: chatId },
      select: {
        character: true,
        characterId: true,
      },
    });

    const chatMessages = await prisma.message.findMany({
      where: { chatId: chatId },
      orderBy: { createdAt: "asc" },
      select: { content: true, role: true },
    });

    const limitCheck = await enforceLimit({
      type: "messagesPerChat",
      currentCount: chatMessages.length,
    });

    if (limitCheck.success === false) {
      return limitCheck;
    }

    const characterPrompt = aiPrompts.generateMessageBasedCharacterPrompt({
      characterProfile: chatDoc?.character!,
    });

    const aiContents = [
      {
        role: "user",
        parts: [
          {
            text: `when some one ask u today date is: ${new Date()} ${characterPrompt}`,
          },
        ],
      },
      ...chatMessages.map((m) => ({
        role: m.role === "ASSISTANT" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const result = await aiConfig.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: aiContents,
    });

    const resultText =
      result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
      result.text?.trim();

    if (!resultText) {
      return { error: { message: "Some error occured please try again" } };
    }

    // 1. Add user message
    await addMessage({
      chatId,
      content: message,
      role: "USER",
    });

    // 2. Add Assistant message
    const savedAssistantMessage = await addMessage({
      chatId: chatId,
      content: resultText,
      role: "ASSISTANT",
    });

    // 3. Response assistant message using actual chatId
    return savedAssistantMessage;
  } catch (error) {
    return {
      success: false,
      error: {
        message: "Failed to generate AI response",
      },
    };
  }
}
