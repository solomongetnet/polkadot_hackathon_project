"use client";

import FollowModal from "@/components/follow-modal";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const StatusContainer = ({
  followersCount,
  followingCount,
  totalCharactersCount,
  userId,
  isMyAccount,
}: {
  followersCount: number;
  followingCount: number;
  totalCharactersCount: number;
  userId: string;
  isMyAccount: boolean;
}) => {
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [selectedModalTab, setSelectedModalTab] = useState<
    "following" | "followers"
  >("followers");

  const handleOpenModal = (tab: "followers" | "following") => {
    setSelectedModalTab(tab);
    setIsFollowModalOpen(true);
  };

  return (
    <>
      <div className="pt-3 flex  text-center items-center justify-center">
        <Button
          className="text-base text-foreground/70"
          variant={"link"}
          onClick={() => handleOpenModal("followers")}
        >
          {followersCount} followers
        </Button>

        <span>•</span>

        <Button
          className="text-base text-foreground/70"
          variant={"link"}
          onClick={() => handleOpenModal("following")}
        >
          {followingCount} following
        </Button>

        <span>|</span>

        <Button
          className="text-base text-foreground/70 !cursor-default"
          variant={"link"}
        >
          {totalCharactersCount} Characters
        </Button>
      </div>

      <FollowModal
        isOpen={isFollowModalOpen}
        setIsOpen={setIsFollowModalOpen}
        defaultTab={selectedModalTab}
        followersCount={followersCount}
        followingCount={followingCount}
        userId={userId}
        isMyAccount={isMyAccount}
      />
    </>
  );
};

export default StatusContainer;
