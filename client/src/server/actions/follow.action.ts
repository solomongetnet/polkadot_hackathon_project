"use server";

import { serverSession } from "@/lib/auth-server";
import prisma from "../config/prisma";
import { handleErrorResponse } from "../helper/error-utils";
import { revalidatePath } from "next/cache";
import { createNotificationHelper } from "../helper/notification.helpers";

// toggle follow this use for both follow and unfollow
export async function toggleFollowAction(targetUserId: string) {
  try {
    const session = await serverSession();
    const userId = session?.user.id;

    if (!userId) {
      return {
        success: false,
        error: {
          message: "Please login to follow or unfollow users.",
          code: "LOGIN_REQUIRED",
        },
      };
    }

    // Check if the user is already following the target user
    let existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow logic
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });

      revalidatePath(`/profile/${targetUserId}`);
      return { success: true, message: "Unfollow successful" };
    } else {
      if (targetUserId === userId) {
        return {
          error: {
            message: "You can't follow yourself",
          },
          success: false,
        };
      }

      await prisma.$transaction(
        async (prisma) => {
          // Follow logic
          await prisma.follow.create({
            data: {
              followerId: userId,
              followingId: targetUserId,
            },
          });

          // send notification for the user;
          await createNotificationHelper({
            type: "USER_FOLLOW",
            recipientId: targetUserId,
            actorId: userId,
          });
        },
        { timeout: 20_000 }
      );

      revalidatePath(`/profile/${targetUserId}`);
      return { success: true, message: "Follow successful" };
    }
  } catch (err) {
    return {
      success: false,
      error: {
        message: handleErrorResponse(err).message || "Something went wrong.",
      },
    };
  }
}

export const removeFollowerAction = async (userIdToRemove: string) => {
  try {
    const session = await serverSession();
    const currentUserId = session?.user.id;

    if (!currentUserId) {
      return {
        success: false,
        error: {
          message: "Please login to follow or unfollow users.",
          code: "LOGIN_REQUIRED",
        },
      };
    }

    // Check if the user is already following the target user
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userIdToRemove,
          followingId: currentUserId,
        },
      },
      select: {
        following: {
          select: { id: true },
        },
      },
    });

    if (existingFollow?.following.id !== currentUserId) {
      throw new Error("You can't remove this user!");
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: userIdToRemove,
          followingId: currentUserId,
        },
      },
    });

    revalidatePath(`/profile/${currentUserId}`);
    return { success: true, message: "Remove successful" };
  } catch (err) {
    return {
      success: false,
      error: {
        message: handleErrorResponse(err).message || "Something went wrong.",
      },
    };
  }
};

// Get users I follow, with isFollowing: true
export async function getMyFollowingAction() {
  const session = await serverSession();
  const userId = session?.user.id;

  if (!userId) {
    return {
      success: false,
      error: {
        message: "Please login to view following list.",
        code: "LOGIN_REQUIRED",
      },
    };
  }

  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: true,
    },
  });

  const users = following.map(({ following }) => ({
    ...following,
    isFollowing: true,
  }));

  return { success: true, users };
}

// Get my followers, each with isFollowing: true/false
export async function getMyFollowersAction() {
  const session = await serverSession();
  const userId = session?.user.id;

  if (!userId) {
    return {
      success: false,
      error: {
        message: "Please login to view followers.",
        code: "LOGIN_REQUIRED",
      },
    };
  }

  const [followers, myFollowing] = await Promise.all([
    prisma.follow.findMany({
      where: { followingId: userId },
      include: { follower: true },
    }),
    prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    }),
  ]);

  const followingIdsSet = new Set(myFollowing.map((f) => f.followingId));

  const users = followers.map(({ follower }) => ({
    ...follower,
    isFollowing: followingIdsSet.has(follower.id),
  }));

  return { success: true, users };
}

// Get any user’s following with isFollowing info for me
export async function getUserFollowingAction(targetUserId: string) {
  const session = await serverSession();
  const myId = session?.user.id;

  const following = await prisma.follow.findMany({
    where: { followerId: targetUserId },
    include: { following: true },
  });

  let followingIdsSet = new Set<string>();

  if (myId) {
    const myFollowing = await prisma.follow.findMany({
      where: { followerId: myId },
      select: { followingId: true },
    });
    followingIdsSet = new Set(myFollowing.map((f) => f.followingId));
  }

  const users = following.map(({ following }) => ({
    ...following,
    isFollowing: followingIdsSet.has(following.id),
  }));

  return { success: true, users };
}

// Get any user’s followers with isFollowing info for me
export async function getUserFollowersAction(targetUserId: string) {
  const session = await serverSession();
  const myId = session?.user.id;

  const followers = await prisma.follow.findMany({
    where: { followingId: targetUserId },
    include: { follower: true },
  });

  let followingIdsSet = new Set<string>();

  if (myId) {
    const myFollowing = await prisma.follow.findMany({
      where: { followerId: myId },
      select: { followingId: true },
    });
    followingIdsSet = new Set(myFollowing.map((f) => f.followingId));
  }

  const users = followers.map(({ follower }) => ({
    ...follower,
    isFollowing: followingIdsSet.has(follower.id),
  }));

  console.log("-------------followers-------------", users);
  return { success: true, users };
}

export async function isUserFollowingAction(targetUserId: string) {
  const session = await serverSession();
  const currentUserId = session?.user.id;

  if (!currentUserId || currentUserId === targetUserId) {
    return { isFollowing: false };
  }

  const isFollowing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    },
    select: { followerId: true }, // lightweight query
  });

  return { isFollowing: Boolean(isFollowing) };
}
