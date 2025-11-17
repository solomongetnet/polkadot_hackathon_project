import { betterAuth, string } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import prisma from "@/server/config/prisma";
import { nanoid } from "nanoid";
import { customSession } from "better-auth/plugins";
import { deleteGuestIdFromCookie } from "@/server/helper/guest-user";
import { createNotificationHelper } from "@/server/helper/notification.helpers";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-client-ip", "x-forwarded-for"],
      disableIpTracking: false,
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 4,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    storeSessionInDatabase: true,
    cookieCache: {
      enabled: false,
    },
    preserveSessionInDatabase: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!(user as any).username && user.name) {
            const baseName = user.name
              .toLowerCase()
              .replace(/\s+/g, "")
              .replace(/[^a-z0-9]/g, "");

            const username = `${baseName}_${nanoid(6)}`; // e.g. solomon_8j3k

            return {
              data: {
                username,
              },
            };
          }

          return;
        },
        after: async (user) => {
          await createNotificationHelper({
            type: "SYSTEM",
            recipientId: user.id,
            customMessage:
              "👋 Welcome to Charapia! We’re glad to have you here.",
          });
        },
      },
    },
    session: {
      create: {
        after: async ({ userId, ipAddress }) => {
          // remove guest id from cookie
          await deleteGuestIdFromCookie();

          // Call your notification helper
          await createNotificationHelper({
            type: "SYSTEM",
            recipientId: userId,
            systemType: "LOGGED_IN",
          });
        },
      },
    },
  },
  plugins: [
    nextCookies(),
    customSession(async ({ user, session }) => {
      const userDoc = await prisma.user.findFirst({
        where: { id: user.id },
      });

      const currentDate = new Date();

      const currentActiveUserPlan = await prisma.userPlan.findFirst({
        where: {
          userId: user.id,
          status: "ACTIVE",
          endDate: {
            gte: currentDate,
          },
        },
        include: {
          plan: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (
        currentActiveUserPlan &&
        currentActiveUserPlan?.endDate < currentDate
      ) {
        await prisma.userPlan.update({
          where: { id: currentActiveUserPlan.id },
          data: { status: "EXPIRED" },
        });
      }

      return {
        user: {
          ...user,
          role: userDoc?.role,
          username: userDoc?.username,
          plan: currentActiveUserPlan?.plan.name || "Free",
          walletAddress: userDoc.walletAddress
        },
        session,
      };
    }),
  ],
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false,
        unique: true,
        input: false,
      },
    },
  },
});
