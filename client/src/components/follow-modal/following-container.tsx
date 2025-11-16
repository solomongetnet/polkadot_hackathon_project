import { useGetUserFollowingQuery } from "@/hooks/api/use-follow";
import React from "react";
import { Avatar } from "../shared/avatar";
import { UsernameLink } from "../shared/username";
import { FollowButton } from "../shared/follow-button";

const FollowingContainer = ({ userId }: { userId: string }) => {
  const followersQuery = useGetUserFollowingQuery({ userId });

  if (followersQuery.isPending) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-muted-foreground">Please wait...</h2>
      </div>
    );
  }

  if (followersQuery.isError) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-muted-foreground">Something went wrong</h2>
      </div>
    );
  }

  if (followersQuery.data.users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No following to show yet. </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col w-full gap-1.5">
      {followersQuery.data.users &&
        followersQuery.data.users.map((user) => {
          return (
            <li
              key={user.id}
              className="w-full flex justify-between items-center rounded-md py-2 px-1 hover:bg-muted/30"
            >
              <div className="flex gap-1">
                <Avatar
                  src={user.image || ""}
                  fallback={user.name}
                  size={"md"}
                  className="size-[40px]"
                />

                <div className="flex flex-col">
                  <h2 className="text-sm">{user.name}</h2>
                  <UsernameLink
                    username={user.username!}
                    turncateUsername
                    className="text-xs"
                    variant={"muted"}
                  />
                </div>
              </div>

              <FollowButton
                initialIsFollowing={user.isFollowing}
                targetUserId={user.id}
                className="text-xs px-4"
              />
            </li>
          );
        })}
    </ul>
  );
};

export default FollowingContainer;
