"use server";
import prisma from "@/server/config/prisma";
import RoleGuard from "@/server/helper/role-guard";
import { getUsersSchema } from "./validations";
import { z } from "zod";

export async function getUsersForAdminAction(
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

  // Fetch the users with pagination, sorting, and filtering
  const users = await prisma.user.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      [sortField]: sortDirection,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      image: true,
    },
  });

  // Return the paginated response
  return {
    data: users,
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
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export async function getUserStatsAction() {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalUsers,
    usersThisMonth,
    usersLastMonth,
    activeUsers,
    bannedUsers,
    newPlansThisMonth,
    newPlansLastMonth,
    plusUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.user.count({
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { status: "BANNED" } }),
    prisma.userPlan.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.userPlan.count({
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    prisma.userPlan.count({
      where: {
        plan: { name: "PLUS" },
        endDate: { gte: now },
        status: "ACTIVE",
      },
    }),
  ]);

  return {
    totalUsers: {
      value: totalUsers,
      change: getPercentageChange(usersThisMonth, usersLastMonth).toFixed(1),
      changeType: usersThisMonth >= usersLastMonth ? "increase" : "decrease",
    },
    activeUsers: {
      value: activeUsers,
      change: ((activeUsers / totalUsers) * 100).toFixed(1),
      changeType: "percentage",
    },
    bannedUsers: {
      value: bannedUsers,
      change: ((bannedUsers / totalUsers) * 100).toFixed(1),
      changeType: "percentage",
    },
    newUsersThisMonth: {
      value: usersThisMonth,
      change: getPercentageChange(usersThisMonth, usersLastMonth).toFixed(1),
      changeType: usersThisMonth >= usersLastMonth ? "increase" : "decrease",
    },
    plusUsers: {
      value: plusUsers,
      change: ((plusUsers / totalUsers) * 100).toFixed(1),
      changeType: "percentage",
    },
  };
}

export async function getUserInsightsAction() {
  try {
    const totalUsers = await prisma.user.count();
    const totalChats = await prisma.chat.count();
    const totalPremiumUsers = await prisma.userPlan.count({
      where: { plan: { name: "PLUS" }, status: "ACTIVE" },
    });

    // Avg conversations per user
    const avgConversationsPerUser = totalUsers
      ? (totalChats / totalUsers).toFixed(0)
      : "0";

    // Premium conversion %
    const premiumConversion = totalUsers
      ? ((totalPremiumUsers / totalUsers) * 100).toFixed(1)
      : "0";

    // Most popular character (by likes)
    const mostPopularCharacter = await prisma.character.findFirst({
      orderBy: { likes: { _count: "desc" } },
      include: { likes: true },
    });

    return {
      totalUsers,
      avgConversationsPerUser,
      premiumConversion,
      mostPopularCharacter: mostPopularCharacter
        ? {
            id: mostPopularCharacter.id,
            name: mostPopularCharacter.name,
            avatarUrl: mostPopularCharacter.avatarUrl,
            likes: mostPopularCharacter.likes.length,
          }
        : null,
    };
  } catch (err) {
    return {
      success: false,
      error: {
        message: "Failed to fetch user insights",
      },
    };
  }
}
