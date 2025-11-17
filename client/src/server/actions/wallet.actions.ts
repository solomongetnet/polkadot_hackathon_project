"use server";
import prisma from "../config/prisma";
import { getUserSession } from "../helper/session";

export const connectWalletAddressToUserAction = async ({
  address,
}: {
  address: string;
}) => {
  const user = await getUserSession();

  if (!address) {
    return {
      error: {
        message: "Wallet address is requierd",
      },
      success: false,
    };
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: user?.id,
    },
    data: {
      walletAddress: address,
      walletNetwork: "moonbeam",
    },
  });

  return {
    message: "Wallet connected to your account successfully",
    success: true,
  };
};

export const disconnectWalletAddressFromUserAction = async () => {
  const user = await getUserSession();

  if (!user?.id) {
    return {
      error: {
        message: "User not found or not authenticated",
      },
      success: false,
    };
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      walletAddress: null,
      walletNetwork: null,
    },
  });

  return {
    message: "Wallet disconnected from your account successfully",
    success: true,
  };
};
