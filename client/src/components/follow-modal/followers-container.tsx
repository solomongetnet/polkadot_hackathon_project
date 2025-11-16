import {
  useGetUserFollowersQuery,
  useRemoveFollowerMutation,
} from "@/hooks/api/use-follow";
import React from "react";
import { Avatar } from "../shared/avatar";
import { UsernameLink } from "../shared/username";
import { FollowButton } from "../shared/follow-button";
import { Button } from "../ui/button";
import { X } from "lucide-react";

const FollowersContainer = ({
  userId,
  isMyAccount,
}: {
  userId: string;
  isMyAccount: boolean;
}) => {
  const followersQuery = useGetUserFollowersQuery({ userId });
  const removeFollowerMutation = useRemoveFollowerMutation();

  const handleRemoveFollower = (userIdToRemove: string) => {
    removeFollowerMutation.mutate({ userIdToRemove });
  };

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
        <p className="text-muted-foreground">No followers to show yet. </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col w-full gap-1.5">
      {followersQuery.data.users &&
        followersQuery.data.users.map((user) => {
          return (
            <li key={user.id} className="flex justify-between items-center">
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
                    className="text-xs"
                    turncateUsername
                  />
                </div>
              </div>

              <div className="flex gap-1 items-center">
                {isMyAccount ? (
                  <>
                    <Button
                      size="icon"
                      variant={"link"}
                      className="text-xs"
                      onClick={() => handleRemoveFollower(user.id)}
                      disabled={removeFollowerMutation.isPending}
                    >
                      <X/>
                    </Button>
                    <FollowButton
                      initialIsFollowing={user.isFollowing}
                      targetUserId={user.id}
                      className="text-xs px-4"
                      followText={"Follow back"}
                    />
                  </>
                ) : (
                  <FollowButton
                    initialIsFollowing={user.isFollowing}
                    targetUserId={user.id}
                    className="text-xs px-4"
                  />
                )}
              </div>
            </li>
          );
        })}
    </ul>
  );
};

export default FollowersContainer;
