"use server";
import { serverSession } from "@/lib/auth-server";
import prisma from "../config/prisma";
import { handleErrorResponse } from "../helper/error-utils";

export const getFolders = async () => {
  const session = await serverSession();
  const userId = session?.user.id;

  if (!userId) {
    return []; // or throw new Error("Unauthorized")
  }

  const folders = await prisma.folder.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      createdAt: true,
      theme: true,
      title: true,
      updatedAt: true,
      _count: {
        select: { chats: true },
      },
    },
  });

  return folders;
};

export const createNewFolder = async ({
  theme,
  title,
  chatIds,
}: {
  theme: string;
  title: string;
  chatIds: string[];
}) => {
  try {
    const session = await serverSession();
    const userId = session?.user.id;

    if (!userId) {
      return {
        success: false,
        error: {
          message: "Please login first to access this feature",
        },
      };
    }

    // ✅ Create the folder
    const folder = await prisma.folder.create({
      data: {
        theme,
        title,
        userId,
        chats: {
          connect: chatIds.map((id) => ({ id })), // ✅ connect existing chats
        },
      },
    });

    return { success: true, message: "Folder Created Successfully" };
  } catch (error) {
    return {
      success: false,
      error: {
        message: handleErrorResponse(error).message,
      },
    };
  }
};

export const deleteFolder = async ({ folderId }: { folderId: string }) => {
  try {
    const session = await serverSession();
    const userId = session?.user.id;

    if (!userId) {
      return {
        success: false,
        error: {
          message: "Please login first to access this feature",
        },
      };
    }

    // ✅ Create the folder
    const folder = await prisma.folder.delete({
      where: {
        id: folderId,
        userId,
      },
    });

    return { success: true, message: "Folder Deleted Successfully" };
  } catch (error) {
    return {
      success: false,
      error: {
        message: handleErrorResponse(error).message,
      },
    };
  }
};
