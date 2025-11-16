"use server";

import { NotificationType } from "@/generated/prisma";
import prisma from "../config/prisma";

type CreateNotificationArgs = {
  type: NotificationType;
  systemType?: "WELCOME" | "LOGGED_IN" | "PROFILE_UPDATE";
  recipientId: string; // who receives the notification
  actorId?: string; // who triggered it (user doing the action)
  characterId?: string; // target character (for likes/comments)
  customMessage?: string; // override system message if needed
};

export async function createNotificationHelper({
  type,
  systemType = "WELCOME",
  recipientId,
  actorId,
  characterId,
  customMessage,
}: CreateNotificationArgs) {
  // don't push notification if actor user is same as recipient user
  if (actorId === recipientId) {
    return null;
  }

  // Fetch actor + character names (if available)
  const actor = actorId
    ? await prisma.user.findUnique({
        where: { id: actorId },
        select: { name: true },
      })
    : null;

  const character = characterId
    ? await prisma.character.findUnique({
        where: { id: characterId },
        select: { name: true },
      })
    : null;

  let message: string;

  switch (type) {
    case "CHARACTER_LIKE":
      message = `${actor?.name ?? "Someone"} liked your character ${
        character?.name ?? "character"
      }.`;
      break;

    case "CHARACTER_COMMENT":
      message = `${actor?.name ?? "Someone"} commented on your character ${
        character?.name ?? "character"
      }.`;
      break;

    case "CHARACTER_COMMENT_LIKE":
      message = `${actor?.name ?? "Someone"} liked your comment on ${
        character?.name ?? "a character"
      }.`;
      break;

    case "USER_FOLLOW":
      message = `${actor?.name ?? "Someone"} followed you.`;
      break;

    case "SYSTEM":
      if (systemType === "LOGGED_IN") {
        message = customMessage ?? "You have successfully logged in.";
      } else if (systemType === "PROFILE_UPDATE") {
        message =
          customMessage ?? "Your profile has been updated successfully.";
      } else if (systemType === "WELCOME") {
        message =
          customMessage ?? "Welcome! You have a new system notification.";
      } else {
        message = customMessage ?? "You have a new system notification.";
      }
      break;

    default:
      message = "You have a new notification.";
  }

  return prisma.notification.create({
    data: {
      type,
      userId: recipientId,
      actorId,
      characterId,
      message,
    },
  });
}
