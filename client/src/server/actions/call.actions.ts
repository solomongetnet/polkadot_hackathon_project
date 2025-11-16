"use server";

import { aiPrompts } from "../ai-prompts";
import { aiConfig } from "../config/ai";
import prisma from "../config/prisma";
import { handleErrorResponse } from "../helper/error-utils";

interface Message {
  role: "USER" | "ASSISTANT";
  content: string;
}

export const respondToCharacterCallAction = async ({
  messages,
  characterId,
  message, // the new user input string to send
}: {
  messages: Message[];
  characterId: string;
  message: string;
}) => {
  try {
    // Fetch character details
    const character = await prisma.character.findFirst({
      where: { id: characterId },
      select: {
        name: true,
        prompt: true,
        tagline: true,
        description: true,
        personality: true,
      },
    });

    if (!character) {
      return {
        success: false,
        error: { message: "Character not found." },
      };
    }

    // Prepare base prompt from character prompt or description
    const characterPrompt = aiPrompts.generateCallCharacterPrompt(character);

    // Build the AI conversation content array as required by your AI API
    const aiContents = [
      {
        role: "user",
        parts: [
          {
            text: ` ${characterPrompt}`,
          },
        ],
      },
      // Map existing chat messages to AI format
      ...messages.map((m) => ({
        role: m.role === "ASSISTANT" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      // Add the latest user message at the end
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    // Call AI generateContent with the built contents
    const aiResponse = await aiConfig.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: aiContents,
    });

    const aiText = aiResponse.text?.trim() || "";

    return {
      success: true,
      response: aiText,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message:
          handleErrorResponse(error).message || "Failed to generate response.",
      },
    };
  }
};
