"use server";

import { serverSession } from "@/lib/auth-server";
import { handleErrorResponse } from "../helper/error-utils";
import * as yup from "yup";
import { uploadToCloudinary } from "../config/cloudinary";
import prisma from "../config/prisma";

const updateUserSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  username: yup
    .string()
    .nullable()
    .transform((value) => value || null)
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters"),
});

export const updateUserAction = async (data: {
  name: string;
  username: string;
  profileImage: File | Blob | null;
}) => {
  try {
    const session = await serverSession();
    const userId = session?.user.id;

    if (!userId) {
      throw new Error("Please login first");
    }

    const validatedData = await updateUserSchema.validate(data);
    let avatarUrl;

    if (data.profileImage) {
      const uploadResponse = await uploadToCloudinary(data.profileImage);
      avatarUrl = uploadResponse?.secure_url;
    }

    const isUsernameTaken = await prisma?.user.findFirst({
      where: {
        id: {
          not: { equals: userId },
        },
        username: validatedData.username,
      },
    });

    if (isUsernameTaken) {
      throw new Error("Username already taken please try another");
    }

    await prisma?.user.update({
      where: {
        id: userId,
      },
      data: {
        name: validatedData.name,
        username: validatedData.username,
        image: avatarUrl,
      },
    });

    return { success: true, message: "Profile Updated Successfully" };
  } catch (error) {
    return {
      success: false,
      error: {
        message: handleErrorResponse(error).message,
      },
    };
  }
};

export const getUserForUpdateAction = async () => {
  const session = await serverSession();
  const userId = session?.user.id;

  if (!userId) {
    throw new Error("Please login");
  }

  const userDoc = await prisma?.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      image: true,
      name: true,
      email: true,
      id: true,
      username: true,
    },
  });

  return userDoc;
};

export const getUserProfileAction = async (username: string) => {
  const session = await serverSession();
  const currentUserId = session?.user.id;

  const userDoc = await prisma?.user.findFirst({
    where: {
      username: {
        equals: username,
      },
    },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          characters: true,
          chats: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  const totalCharactersCount = await prisma?.character.count({
    where: {
      creator: {
        username: {
          equals: username,
        },
      },
    },
  });

  if (!userDoc) {
    return null;
  }

  if (!currentUserId) {
    return {
      user: userDoc,
      isFollowing: false,
      totalCharactersCount,
      isMyAccount: false,
    };
  }

  const isFollowing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: userDoc.id,
      },
    },
    select: { followerId: true }, // lightweight query
  });

  return {
    user: userDoc,
    totalCharactersCount: totalCharactersCount || 0,
    isFollowing: !!isFollowing?.followerId,
    isMyAccount: !!(currentUserId === userDoc.id),
  };
};
