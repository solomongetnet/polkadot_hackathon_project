import { Avatar } from "@/components/shared/avatar";
import { UsernameLink } from "@/components/shared/username";
import { Button } from "@/components/ui/button";
import { getUserProfileAction } from "@/server/actions/user.action";
import {  Share2 } from "lucide-react";
import React, { Suspense } from "react";
import SettingModalWrapper from "./setting-button";
import TabsContainer from "./tabs-container";
import StatusContainer from "./status-container";
import { ShareDialog } from "@/components/shared/share-dialog";

const Page = async ({ params }: { params: Promise<{ username: string }> }) => {
  const username = (await params).username;
  const userProfileQuery = await getUserProfileAction(username);
  const userProfile = userProfileQuery?.user;
  const totalCharactersCount = userProfileQuery?.totalCharactersCount;
  const isMyAccount = userProfileQuery?.isMyAccount;

  if (!userProfile) {
    return <div className="py-100">User not found</div>;
  }

  return (
    <div className="min-h-screen w-full dark:bg-[#18181B] py-[65px] px-2 sm:px-8 md:px-[200px] xl:px-[285px]">
      <Suspense fallback={<div>Loading...</div>}>
        <div className="w-full flex flex-col">
          {/* top contents */}
          <div className="w-full flex flex-col gap-1 items-center">
            <Avatar
              fallback={userProfile?.username!}
              src={userProfile?.image || ""}
              size="2xl"
              className="size-28 sm:size-30"
            />

            {/* username and name */}
            <div className="mt-4 flex flex-col items-center text-center">
              <span className="text-xl md:text-3xl font-medium ">
                {userProfile.name}
              </span>
              <UsernameLink
                size={"xs"}
                variant={"muted"}
                username={userProfile.username!}
              />
            </div>

            {/* some status like following, followers, interaction */}
            <StatusContainer
              followersCount={userProfile._count.followers}
              followingCount={userProfile._count.following}
              totalCharactersCount={totalCharactersCount || 0}
              userId={userProfile.id}
              isMyAccount={!!isMyAccount}
            />

            {/* actions like settings and share */}
            <div className="w-full flex justify-center gap-2 items-center mt-2">
              <SettingModalWrapper />

              <ShareDialog url={`/profile/${username}`} title="Share profile">
                <Button
                  variant={"default"}
                  size={"icon"}
                  className="rounded-full"
                >
                  <Share2 />
                </Button>
              </ShareDialog>
            </div>
          </div>

          {/* tabs with user datas like characters... */}
          <TabsContainer />
        </div>
      </Suspense>{" "}
    </div>
  );
};

export default Page;
