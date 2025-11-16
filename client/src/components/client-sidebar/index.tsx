'use client';

import { Sidebar, SidebarContent, useSidebar } from "../ui/sidebar";
import SidebarHeaderContainer from "./sidebar-header";
import SidebarFooterContainer from "./sidebar-footer";
import ChatsContainer from "./chats-container";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ClientSidebar() {
  const pathname = usePathname();
  const { openMobile, setOpenMobile } = useSidebar();
  useEffect(() => {
    if (openMobile) {
      setOpenMobile(false);
    }

  }, [pathname]);
  return (
    <Sidebar>
      <SidebarContent className="bg-background px-0 flex flex-col max-h-[100dvh] ">
        <SidebarHeaderContainer />
        <ChatsContainer />
        <SidebarFooterContainer />
      </SidebarContent>
    </Sidebar>
  );
}
