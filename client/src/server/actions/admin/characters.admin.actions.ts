"use server";

import prisma from "@/server/config/prisma";
import { getUsersSchema } from "./validations";
import { z } from "zod";
import { serverSession } from "@/lib/auth-server";
import { handleErrorResponse } from "@/server/helper/error-utils";

export async function getCharactersForAdminAction(
  params: z.infer<typeof getUsersSchema>
) {
  // await RoleGuard({ accessedBy: ["ADMIN"] });

  const { page, limit, sortField, sortDirection, role, status, search } =
    getUsersSchema.parse(params);

  const where: any = {};

  if (role) {
    if (role == "ALL") {
      delete where.role;
    } else {
      where.role = role.toUpperCase();
    }
  }

  if (status) {
    if (status === "ALL") {
      delete where.status;
    } else {
      where.status = status.toUpperCase();
    }
  }

  if (search) {
    if (search === "") {
      delete where.OR;
    } else {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }
  }

  // Get the total count of matching records
  const totalItems = await prisma.user.count({ where });

  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / limit);
  const skip = (page - 1) * limit;
  const hasMore = page < totalPages;
  const previousPage = page > 1 ? page - 1 : null;
  const nextPage = hasMore ? page + 1 : null;

  // Fetch the characters with pagination, sorting, and filtering
  const characters = await prisma.character.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      [sortField]: sortDirection,
    },
    include: {
      _count: {
        select: {
          messages: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  console.log("characters-----------", characters);

  // Return the paginated response
  return {
    data: characters,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      limit,
      hasMore,
      previousPage,
      nextPage,
    },
    sort: {
      field: sortField,
      direction: sortDirection,
    },
    filters: {
      role,
      status,
      search,
    },
  };
}

function getPercentageChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

export async function getCharacterStatsAction() {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalCharacters,
    charactersThisMonth,
    charactersLastMonth,
    publicCharacters,
    privateCharacters,
    likedCharacters,
    commentedCharacters,
  ] = await Promise.all([
    prisma.character.count(),
    prisma.character.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.character.count({
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    prisma.character.count({ where: { visibility: "PUBLIC" } }),
    prisma.character.count({ where: { visibility: "PRIVATE" } }),
    prisma.characterLike.count(), // total likes across characters
    prisma.characterComment.count(), // total comments across characters
  ]);

  return {
    totalCharacters: {
      value: totalCharacters,
      change: getPercentageChange(
        charactersThisMonth,
        charactersLastMonth
      ).toFixed(1),
      changeType:
        charactersThisMonth >= charactersLastMonth ? "increase" : "decrease",
    },
    newCharactersThisMonth: {
      value: charactersThisMonth,
      change: getPercentageChange(
        charactersThisMonth,
        charactersLastMonth
      ).toFixed(1),
      changeType:
        charactersThisMonth >= charactersLastMonth ? "increase" : "decrease",
    },
    publicCharacters: {
      value: publicCharacters,
      change: ((publicCharacters / totalCharacters) * 100).toFixed(1),
      changeType: "percentage",
    },
    privateCharacters: {
      value: privateCharacters,
      change: ((privateCharacters / totalCharacters) * 100).toFixed(1),
      changeType: "percentage",
    },
    likedCharacters: {
      value: likedCharacters,
      change: ((likedCharacters / totalCharacters) * 100).toFixed(1),
      changeType: "percentage",
    },
    commentedCharacters: {
      value: commentedCharacters,
      change: ((commentedCharacters / totalCharacters) * 100).toFixed(1),
      changeType: "percentage",
    },
  };
}

export async function deleteCharacterForAdminAction(input: {
  characterId: string;
}) {
  try {
    // 1️⃣ Get user session
    const session = await serverSession();
    const userId = session?.user.id;

    if (!userId) {
      return {
        success: false,
        error: {
          message: "You must be logged in to delete a character",
          code: "LOGIN_REQUIRED",
        },
      };
    }

    // 2️⃣ Validate input
    // 3️⃣ Find the character
    const characterDoc = await prisma.character.findUnique({
      where: { id: input.characterId },
    });

    if (!characterDoc) {
      return {
        success: false,
        error: { message: "Character not found" },
      };
    }

    // 5️⃣ Delete the character
    await prisma.character.delete({
      where: { id: input.characterId },
    });

    return {
      success: true,
      message: "Character deleted successfully",
    };
  } catch (err) {
    return {
      success: false,
      error: {
        message: handleErrorResponse(err).message || "Something went wrong.",
      },
    };
  }
}
