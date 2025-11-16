"use server";
import { serverSession } from "@/lib/auth-server";
import prisma from "../config/prisma";
import {
  FeatureFlagKey,
  planFeatureFlags,
  planLimits,
  PlanType,
} from "@/lib/plan/plan-limits";

/**
 * Get the current user's active plan.
 * - Returns null if no active paid plan exists.
 * - Automatically updates expired plans to EXPIRED.
 */
export const getCurrentUserPlanHelper = async () => {
  try {
    const session = await serverSession();
    const userId = session?.user?.id;

    if (!userId) {
      return null;
    }

    const currentDate = new Date();

    // Fetch the most recent plan (active or expired)
    const latestUserPlan = await prisma.userPlan.findFirst({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    if (!latestUserPlan) {
      return null;
    }

    // If plan is expired but status is still ACTIVE, update it
    if (
      latestUserPlan.endDate < currentDate &&
      latestUserPlan.status === "ACTIVE"
    ) {
      await prisma.userPlan.update({
        where: { id: latestUserPlan.id },
        data: { status: "EXPIRED" },
      });
      return null;
    }

    // If plan is active and not expired
    if (
      latestUserPlan.status === "ACTIVE" &&
      latestUserPlan.endDate >= currentDate
    ) {
      return latestUserPlan;
    }

    return null;
  } catch (error) {
    console.error("Error fetching current user plan:", error);
    throw new Error("Failed to fetch current user plan");
  }
};

export const checkActiveUserPlan = async ({ userId }: { userId: string }) => {
  const currentDate = new Date();

  const existingActivePlan = await prisma.userPlan.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      endDate: {
        gte: currentDate,
      },
    },
  });

  if (existingActivePlan) {
    throw new Error(
      "You already have an active plan. Please wait until it expires."
    );
  }

  return true; // Safe to create new plan
};

interface CreateUserPlanOptions {
  userId: string;
  planId: string;
  durationInDays?: number; // Default based on plan interval
  paymentId?: string; // Optional payment reference
}

/**
 * Creates a new user plan with proper validation.
 * - Checks for existing active plans.
 * - Associates payment if provided.
 */
export const createUserPlanHelper = async ({
  userId,
  planId,
  durationInDays,
  paymentId,
}: CreateUserPlanOptions) => {
  const currentDate = new Date();

  const activePlan = await prisma.userPlan.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      endDate: { gte: currentDate },
    },
    orderBy: { createdAt: "desc" },
  });

  if (activePlan) {
    throw new Error("You already have an active plan.");
  }

  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new Error("Plan not found.");
  }

  const startDate = new Date();
  const endDate = new Date(startDate);

  // 👇 Force expiration in 2 minutes for testing
  const isTesting = false;
  if (isTesting) {
    endDate.setMinutes(endDate.getMinutes() + 2);
  } else {
    const intervalDays =
      durationInDays ?? (plan.billingInterval === "MONTHLY" ? 30 : 365);
    endDate.setDate(endDate.getDate() + intervalDays);
  }

  const newUserPlan = await prisma.userPlan.create({
    data: {
      userId,
      planId,
      paymentId,
      status: "ACTIVE",
      startDate,
      endDate,
    },
    include: { plan: true },
  });

  return newUserPlan;
};

export async function enforceLimit({
  type,
  currentCount,
}: {
  type: keyof (typeof planLimits)["FREE"];
  currentCount: number;
}) {
  const session = await serverSession();
  const currentUser = session?.user;

  const currentUserActivePlan = await getCurrentUserPlanHelper();
  const userPlan = !currentUser?.id
    ? "UNAUTHENTICATED"
    : ((currentUserActivePlan?.plan.name || "FREE") as PlanType);

  const limits = planLimits[userPlan];
  const allowed = limits[type];

  if (userPlan === "UNAUTHENTICATED" && currentCount >= allowed) {
    return {
      success: false,
      error: {
        message: `You've reached the limit. Please log in or create an account to unlock more features.`,
        code: "LOGIN_REQUIRED",
      },
    };
  }

  if (currentCount >= allowed) {
    return {
      success: false,
      error: {
        message: `Limit reached. Upgrade to PLUS to get more.`,
        code: "PLUS_REQUIRED",
      },
    };
  }

  return { success: true as const };
}

export async function hasFeatureAccess(feature: FeatureFlagKey) {
  try {
    const session = await serverSession();
    const currentUser = session?.user;
    const currentUserActivePlan = await getCurrentUserPlanHelper();

    const userPlan = !currentUser?.id
      ? "UNAUTHENTICATED"
      : ((currentUserActivePlan?.plan.name || "FREE") as PlanType);

    return planFeatureFlags[userPlan][feature] ?? false;
  } catch (error) {
    throw new Error("Something went wrong please try again!");
  }
}
