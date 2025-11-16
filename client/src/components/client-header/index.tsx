"use client";

import React from "react";
import clsx from "clsx";

import CustomSidebarTrigger from "../client-sidebar/sidebar-trigger";
import { useSidebar } from "../ui/sidebar";
import { Button } from "../ui/button";
import { authClient } from "@/lib/auth-client";

const ClientHeader = () => {
  const { isMobile, open, openMobile } = useSidebar();
  const { data: sessionData, isPending } = authClient.useSession();

  /* ------------------------------ MOBILE ------------------------------ */
  if (isMobile) {
    return (
      <header className="fixed top-0 left-0 right-0 z-30 grid grid-cols-2 justify-between px-4 py-4">
        <CustomSidebarTrigger show="open" />

        {openMobile && <div />}
        {isPending ||
          (!sessionData?.session && (
            <div className="flex justify-end items-center gap-4">
              <Button variant="default" size="sm" className="rounded-full px-4">
                Sign Up to Chat
              </Button>
              <Button variant="ghost" size="sm" className="transition-colors">
                Login
              </Button>
            </div>
          ))}
      </header>
    );
  }

  /* ------------------------------ DESKTOP ------------------------------ */
  return (
    <header
      className={clsx(
        "fixed top-0 z-50 grid grid-cols-[auto_1fr_auto] items-center h-[60px] transition-all backdrop-blur-sm ",
        open ? [`left-[16rem]`, `w-[calc(100%-16rem)]`] : ["left-0 w-full"]
      )}
    >
      <CustomSidebarTrigger show="open" />

      {isPending ||
        (!sessionData?.session && (
          <div className="flex items-center gap-4 absolute right-4">
            <Button variant="default" size="sm" className="rounded-full px-4">
              Sign Up to Chat
            </Button>
            <Button variant="ghost" size="sm" className="transition-colors">
              Login
            </Button>
          </div>
        ))}
    </header>
  );
};

export default ClientHeader;
