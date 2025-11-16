import { Avatar } from "@/components/shared/avatar";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { UsernameLink } from "@/components/shared/username";
import { useChatStore } from "@/store";
import clsx from "clsx";
import { MoreHorizontal, Text } from "lucide-react";
import React from "react";
import { useCharacterProfileSidebar } from "@/store/character-profile-sidebar-store";

const ChatHeader = () => {
  const { isMobile, open, openMobile, setOpenMobile, setOpen } = useSidebar();
  const { toggleCharacterProfileSidebar, isCharacterProfileSidebarOpen } =
    useCharacterProfileSidebar();
  const { activeChatData } = useChatStore();

  return (
    <header
      className={clsx(
        "max-md:border-b-2 max-md:bg-background/55 max-md:backdrop-blur-2xl px-3 md:px-4 fixed top-0 z-50 flex h-[70px] md:h-[60px] transition-all",
        open && !isMobile
          ? [`left-[16rem]`, `w-[calc(100%-16rem)]`]
          : ["left-0 w-full"]
      )}
    >
      {/* large screen */}
      {!isMobile && (
        <div className="w-full flex justify-between items-center">
          {!open ? (
            <span onClick={() => setOpen(true)} className="">
              <Text className="text-[30px]" />
            </span>
          ) : (
            <div />
          )}

          {!isCharacterProfileSidebarOpen && (
            <Button
              disabled={!activeChatData}
              size={"icon"}
              className="rounded-full self-end max-md:hidden cursor-pointer z-[100] border border-black"
              onClick={() => toggleCharacterProfileSidebar()}
            >
              <MoreHorizontal className="w-4" />
            </Button>
          )}
        </div>
      )}

      {/* small device */}
      {isMobile && (
        <div className="w-full flex justify-between items-center">
          {/* left contents */}
          <div className="flex gap-4 items-center flex-1">
            <span onClick={() => setOpenMobile(true)} className="">
              <Text className="text-[30px]" />
            </span>

            {activeChatData && (
              <div className="flex gap-2 items-center flex-1">
                <Avatar
                  src={activeChatData?.character?.avatarUrl || ""}
                  fallback={activeChatData?.character?.name}
                  size={"lg"}
                />

                <div className="flex flex-col">
                  <h2 className="m-0 leading-none text-xs font-semibold truncate">
                    {activeChatData?.character?.name}
                  </h2>
                  <div className="-mt-1">
                    <UsernameLink
                      prefix="By"
                      variant="muted"
                      size={"xs"}
                      turncateUsername
                      username={activeChatData?.character?.creator.username!}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button
            disabled={!activeChatData}
            size={"icon"}
            className="rounded-full cursor-pointer border border-black"
            onClick={() => toggleCharacterProfileSidebar()}
          >
            <MoreHorizontal className="w-4" />
          </Button>
        </div>
      )}
    </header>
  );
};

export default ChatHeader;
