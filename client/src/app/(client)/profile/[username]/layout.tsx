import { Metadata } from "next";
import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import { getUserProfileAction } from "@/server/actions/user.action";
import { ReactNode } from "react";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> => {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  const { username } = await params;
  const profileData = await getUserProfileAction(username); // You should replace with actual data fetching logic

  if (!profileData) {
    return {
      title: "User Not Found",
      description: "This profile does not exist.",
    };
  }

  const { user, isMyAccount, } = profileData;

  const title = isMyAccount
    ? `My Profile - @${user.username}`
    : `${user.name} (@${user.username}) • Profile`;

  const description = isMyAccount
    ? `Your profile overview. You have ${user._count.characters} characters and ${user._count.followers} followers.`
    : `${user.name} has ${user._count.characters} characters and ${user._count.followers} followers. Follow and connect!`;

  const imageUrl = user.image || `https://yourdomain.com/default-profile.png`; // fallback image

  const pageUrl = `https://yourdomain.com/u/${user.username}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "YourSite",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Profile image of ${user.name}`,
        },
      ],
      locale: "en_US",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
};

export default async function Layout({
  authenticated,
  unautenticated,
  params,
}: {
  authenticated: ReactNode;
  unautenticated: ReactNode;
  params: Promise<{ username: string }>;
}) {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });
  const { username } = await params;

  if (username === session.data?.user?.username) {
    return authenticated;
  }

  return unautenticated;
}
