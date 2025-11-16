"use client";

import { Button } from "@/components/ui/button";
import { Activity, Bell, Plus, Search, ShoppingBag } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { SidebarHeader } from "../ui/sidebar";
import { ChatsSearchModal } from "../chats-search-modal";
import CustomSidebarTrigger from "./sidebar-trigger";
import { BrandName } from "../shared/brand-name";
import Link from "next/link";
import { NotificationSheet } from "../client-notification-sheet";
import { Suspense } from "react";

const SidebarHeaderContainer = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleExploreCharacters = () => {
    router.push("/");
  };

  return (
    <SidebarHeader className={`px-0 py-0 border-b `}>
      <div className="h-[60px] flex items-center justify-between py-4 px-2 md:px-4 border-b">
        <div className="flex items-center gap-2 justify-between">
          <BrandName size="lg" />
        </div>
        <CustomSidebarTrigger show="close" />
      </div>

      {/* Action Buttons */}
      <div className="md:pt-4 px-2 sm:px-4 pb-2 flex flex-col gap-2">
        <Link href={"/create"} prefetch>
          <Button
            className="w-full flex justify-start gap-2 py-5 px-3 rounded-full"
            variant={"default"}
          >
            <Plus className="h-4 w-4" />
            Create Character
          </Button>
        </Link>

        <Button
          onClick={() => {
            router.push("/marketplace");
          }}
          className={`w-full flex justify-start gap-2 py-5 px-3 rounded-full ${
            pathname === "/" && "bg-accent"
          }`}
          variant={"ghost"}
        >
          <ShoppingBag className="h-4 w-4" />
          Nft Marketplace
        </Button>
        <Button
          onClick={handleExploreCharacters}
          className={`w-full flex justify-start gap-2 py-5 px-3 rounded-full ${
            pathname === "/" && "bg-accent"
          }`}
          variant={"ghost"}
        >
          <Activity className="h-4 w-4" />
          Discover Characters
        </Button>

        <Suspense>
          <NotificationSheet>
            <Bell className="h-4 w-4" />
            Notifications
          </NotificationSheet>
        </Suspense>
      </div>
    </SidebarHeader>
  );
};

export default SidebarHeaderContainer;
