"use client";

import { Button } from "@/components/ui/button";
import { Activity, ChevronDown, LogOut, Settings, Sparkle } from "lucide-react";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SidebarFooter, SidebarMenuButton } from "../ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SettingsModal from "../setting-modal";
import { Avatar } from "../shared/avatar";
import { useModalStore } from "@/store/ui-store";

const SidebarFooterContainer = () => {
  const [isSettingsModalOpen, setIsSettingModalOpen] = useState(false);
  const { data } = authClient.useSession();
  const currentUserData = data?.user;
  const router = useRouter();
  const { setUpgradeModalOpen } = useModalStore();

  const handleSignOut = async () => {
    await authClient.signOut({});
    location.replace("/");
  };

  const handleOpenUpgradeModal = () => {
    setUpgradeModalOpen(true);
  };
  
  return (
    <>
      <SidebarFooter className="border-t-2">
        {currentUserData ? (
          <>
            {currentUserData.plan.toLowerCase() === "free" && (
              <Button
                className="w-full py-5 rounded-full"
                variant={"outline"}
                onClick={() => handleOpenUpgradeModal()}
              >
                <Sparkle className="mr-2 h-4 w-4" />
                <span>Upgrade to plus</span>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="py-5 cursor-pointer flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Avatar
                      alt=""
                      src={currentUserData.image || ""}
                      size={"md"}
                      loading="eager"
                      interactive
                      fallback={currentUserData.name[0]}
                    />
                    <div className="flex flex-col gap-1.5">
                      <p className="">{currentUserData.name}</p>
                      <span className="text-muted-foreground leading-0 pb-1">
                        {currentUserData.plan.toLowerCase() === "free"
                          ? "Free"
                          : "Plus"}
                      </span>
                    </div>
                  </div>

                  <ChevronDown />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-56 bg-accent/60 backdrop-blur-lg ml-24"
                align="end"
                forceMount
              >
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-foreground">
                      {currentUserData.name}
                    </p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {currentUserData.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/profile/${currentUserData.username}`)
                  }
                >
                  <Activity className="h-4 w-4" />
                  <span>Public profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => setIsSettingModalOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Link href={"/auth"} className="w-full" prefetch>
            <Button
              size="sm"
              variant={"outline"}
              className="w-full gap-1 md:gap-2 text-xs md:text-sm py-5 rounded-full"
            >
              <span className="">Signup / Sign In</span>
            </Button>
          </Link>
        )}
      </SidebarFooter>

      <SettingsModal
        open={isSettingsModalOpen}
        setIsSettingsModalOpen={setIsSettingModalOpen}
      />
    </>
  );
};

export default SidebarFooterContainer;
