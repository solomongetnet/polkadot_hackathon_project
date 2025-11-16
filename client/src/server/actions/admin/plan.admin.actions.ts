"use server";

import { UserPlanStatus } from "@/generated/prisma";
import prisma from "@/server/config/prisma";

import { z } from "zod";

// Example schema for admin plan query
const getPlansSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortField: z.string().default("createdAt"), // Plan field to sort by
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  isActive: z.enum(["ALL", "ACTIVE", "INACTIVE"]).optional(),
  search: z.string().optional(),
});

export async function getPlansForAdminAction(
  params: z.infer<typeof getPlansSchema>
) {
  const { page, limit, sortField, sortDirection, isActive, search } =
    getPlansSchema.parse(params);

  const where: any = {};

  // Filter by active status
  if (isActive) {
    if (isActive !== "ALL") {
      where.isActive = isActive === "ACTIVE";
    }
  }

  // Search by name or description
  if (search) {
    if (search !== "") {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
  }

  // Total matching plans
  const totalItems = await prisma.plan.count({ where });

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / limit);
  const skip = (page - 1) * limit;
  const hasMore = page < totalPages;
  const previousPage = page > 1 ? page - 1 : null;
  const nextPage = hasMore ? page + 1 : null;

  // Fetch plans with pagination, sorting, and relations
  const plans = await prisma.plan.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      [sortField]: sortDirection,
    },
    include: {
      userPlans: {
        select: {
          userId: true,
        },
      },
      payments: true,
    },
  });

  // Return structured response
  return {
    data: plans,
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
      isActive,
      search,
    },
  };
}

function getPercentageChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

export async function getPlanStatsAction() {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalPlans,
    activePlans,
    plansThisMonth,
    plansLastMonth,
    userPlansCount,
  ] = await Promise.all([
    prisma.plan.count(),
    prisma.plan.count({ where: { isActive: true } }),
    prisma.plan.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.plan.count({
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    prisma.userPlan.count(),
  ]);

  return {
    totalPlans: {
      value: totalPlans,
      change: getPercentageChange(plansThisMonth, plansLastMonth).toFixed(1),
      changeType: plansThisMonth >= plansLastMonth ? "increase" : "decrease",
    },
    activePlans: {
      value: activePlans,
      change: ((activePlans / totalPlans) * 100).toFixed(1),
      changeType: "percentage",
    },
    newPlansThisMonth: {
      value: plansThisMonth,
      change: getPercentageChange(plansThisMonth, plansLastMonth).toFixed(1),
      changeType: plansThisMonth >= plansLastMonth ? "increase" : "decrease",
    },
    totalUserPlans: {
      value: userPlansCount,
      change: ((userPlansCount / totalPlans) * 100).toFixed(1),
      changeType: "percentage",
    },
  };
}

// user plans;
export const getUserPlansForAdminAction = async (input: {
  status?: UserPlanStatus | "";
  page: number;
  limit: number;
  search: string;
}) => {
  let where: any = {};

  if (input.status == null || input.status == "") {
    where = {};
  }

  if (input.search !== "") {
    where.user = {
      name: {
        contains: input.search,
      },
    };
  }

  if (input.status) {
    where = { status: input.status };
  }

  // Total matching plans
  const totalItems = await prisma.userPlan.count({ where });

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / input.limit);
  const skip = (input.page - 1) * input.limit;
  const hasMore = input.page < totalPages;
  const previousPage = input.page > 1 ? input.page - 1 : null;
  const nextPage = hasMore ? input.page + 1 : null;

  const userPlans = await prisma.userPlan.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      plan: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    skip,
    take: input.limit,
    where,
  });

  // Return structured response
  return {
    data: userPlans,
    pagination: {
      currentPage: input.page,
      totalPages,
      totalItems,
      limit: input.limit,
      hasMore,
      previousPage,
      nextPage,
    },
    filters: {
      search: input.search,
      status: input.status,
    },
  };
};

export async function getUserPlansStatsAction() {
  const now = new Date();

  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalPlans,
    activePlans,
    pendingPlans,
    cancelledPlans,
    expiredPlans,
    plansThisMonth,
    plansLastMonth,
  ] = await Promise.all([
    prisma.userPlan.count(),
    prisma.userPlan.count({ where: { status: "ACTIVE" } }),
    prisma.userPlan.count({ where: { status: "PENDING" } }),
    prisma.userPlan.count({ where: { status: "CANCELLED" } }),
    prisma.userPlan.count({ where: { status: "EXPIRED" } }),
    prisma.userPlan.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.userPlan.count({
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
  ]);

  return {
    totalUserPlans: {
      value: totalPlans,
      change: getPercentageChange(plansThisMonth, plansLastMonth).toFixed(1),
      changeType: plansThisMonth >= plansLastMonth ? "increase" : "decrease",
    },
    activeUserPlans: {
      value: activePlans,
      change: ((activePlans / totalPlans) * 100).toFixed(1),
      changeType: "percentage",
    },
    pendingUserPlans: {
      value: pendingPlans,
      change: ((pendingPlans / totalPlans) * 100).toFixed(1),
      changeType: "percentage",
    },
    cancelledPlansUserPlans: {
      value: cancelledPlans,
      change: ((cancelledPlans / totalPlans) * 100).toFixed(1),
      changeType: "percentage",
    },
    expiredPlansUserPlans: {
      value: expiredPlans,
      change: ((expiredPlans / totalPlans) * 100).toFixed(1),
      changeType: "percentage",
    },
    newPlansThisMonth: {
      value: plansThisMonth,
      change: getPercentageChange(plansThisMonth, plansLastMonth).toFixed(1),
      changeType: plansThisMonth >= plansLastMonth ? "increase" : "decrease",
    },
  };
}

export const expireOverdueUserPlansForAdminAction = async () => {
  try {
    const currentDate = new Date();

    const result = await prisma.userPlan.updateMany({
      where: {
        status: "ACTIVE",
        endDate: { lt: currentDate },
      },
      data: { status: "EXPIRED" },
    });

    return {
      success: true,
      message: `Successfully expired ${result.count} user plan(s).`,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: "Something went wrong",
      },
    };
  }
};
