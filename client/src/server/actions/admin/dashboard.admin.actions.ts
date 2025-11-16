"use server";
import prisma from "@/server/config/prisma";
import { cache } from "react";

export const getDashboardStatsAction = async () => {
  const allSuccessedPayments = await prisma.payment.findMany({
    where: {
      status: "SUCCESS",
    },
  });

  const [usersCount, totalRevenue, charactersCount, messagesCount] =
    await Promise.all([
      prisma.user.count(),
      allSuccessedPayments.reduce((sum, item) => sum + Number(item.amount), 0),
      prisma.character.count(),
      prisma.message.count(),
    ]);

  return {
    usersCount: {
      value: usersCount,
      change: ((100 / 100) * 100).toFixed(1),
      changeType: "percentage",
    },
    totalRevenue: {
      value: totalRevenue,
      change: (100).toFixed(1),
      changeType: "percentage",
    },
    charactersCount: {
      value: charactersCount,
      change: ((charactersCount / 10) * 100).toFixed(1),
      changeType: "percentage",
    },
    messagesCount: {
      value: messagesCount,
      change: ((messagesCount / 10) * 100).toFixed(1),
      changeType: "percentage",
    },
  };
};

export const getPaymentsAction = cache(async () => {
  const payments = await prisma.payment.findMany({
    select: {
      amount: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return payments;
});
