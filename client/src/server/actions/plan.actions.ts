"use server";

import { serverSession } from "@/lib/auth-server";
import prisma from "../config/prisma";
import { handleErrorResponse } from "../helper/error-utils";
import {
  checkActiveUserPlan,
  getCurrentUserPlanHelper,
} from "../helper/plan.helpers";
import { initializePayment } from "./chapa.actions";
import { formatCurrency } from "@/utils";
import { chapaConfig } from "../config/chapa";

export async function initPlansAction() {
  // admin only

  try {
    await prisma.plan.createMany({
      data: [
        {
          name: "FREE",
          description: "Basic plan with limited features",
          priceCents: 0,
          currency: "ETB",
          billingInterval: "MONTHLY",
        },
        {
          name: "PLUS",
          description: "Unlock all premium features",
          priceCents: 40000, // 400 ETB (price in cents if smallest unit)
          currency: "ETB",
          billingInterval: "MONTHLY",
        },
      ],
      skipDuplicates: true, // avoid inserting if exists
    });

    return { success: true, message: "Initlize successfull" };
  } catch (err) {
    return {
      success: false,
      error: {
        message: handleErrorResponse(err).message,
      },
    };
  }
}

export const getPlansAction = async () => {
  const plans = await prisma.plan.findMany();

  return plans;
};

export const getActiveUserPlanAction = async () => {
  const userPlan = await getCurrentUserPlanHelper();

  return userPlan;
};

export const upgradeUserPlanAction = async ({
  plan,
}: {
  plan: "PLUS";
  txRef: string;
}) => {
  try {
    const session = await serverSession();
    const currentUser = session?.user;

    if (!currentUser) {
      return {
        success: false,
        error: {
          message: "Please login first",
        },
      };
    }
    const planToUpgrade = await prisma.plan.findUnique({
      where: {
        name: plan,
      },
    });

    if (!planToUpgrade) {
      return {
        success: false,
        error: {
          message: "There is no any plan",
        },
      };
    }

    // Validate no active plan exists
    await checkActiveUserPlan({ userId: currentUser.id });

    const txRef = await chapaConfig.genTxRef();

    await prisma.payment.create({
      data: {
        currency: "ETB",
        transactionRef: txRef,
        amount: +formatCurrency(planToUpgrade.priceCents, {
          withSymbol: false,
        }),
        status: "PENDING",
        userId: currentUser?.id,
        planIdToUpgrade: planToUpgrade.id,
      },
    });

    const response = await initializePayment({
      first_name: currentUser?.name.trim().split(" ")[0],
      last_name: currentUser?.name.trim().split(" ")[1] || "",
      email: currentUser?.email || "",
      phone_number: "0912345678",
      currency: "ETB",
      amount: formatCurrency(planToUpgrade.priceCents, {
        withSymbol: false,
      }).toString(),
      tx_ref: txRef,
      callback_url: `${process.env.BASE_URL}/`,
      return_url: `${process.env.BASE_URL}/`,
    });

    return {
      success: true,
      checkout_url: response.data.checkout_url,
    };
  } catch (error) {
    return {
      success: false,
      error: { message: handleErrorResponse(error).message },
    };
  }
};
