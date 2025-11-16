"use client";

import React, { useState } from "react";
import { useCharacterProfileSidebar } from "@/store/character-profile-sidebar-store";
import { useChatStore } from "@/store";
import { UsernameLink } from "@/components/shared/username";
import {
  ArrowLeft,
  BookOpen,
  Heart,
  MessageCircle,
  MessageSquareQuote,
  MoreHorizontal,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/avatar";
import { ReportCharacterModal } from "./report-character-modal";
import CommentsTab from "./comments-tab";
import SimilarCharactersTab from "./similar-characters-tab";
import AvatarPlaceholder from "@/assets/images/avatar-placeholder.webp";
import { useGetCharacterDetailQuery } from "@/hooks/api/use-character";
import { Skeleton } from "@/components/ui/skeleton";
import SettingsTab from "./settings-tab";
import AboutTab from "./about-tab";

const tabs = [
  { id: "about", label: "about", icon: BookOpen },
  { id: "comments", label: "comments", icon: MessageSquareQuote },
  { id: "more", label: "More", icon: MoreHorizontal },
  { id: "settings", label: "Settings", icon: Settings },
];

const CharacterProfileSidebar = () => {
  const [activeTab, setActiveTab] = useState<
    "about" | "comments" | "more" | "settings"
  >("comments");
  const characterId = useChatStore(
    (state) => state.activeChatData?.character?.id
  );
  const { isCharacterProfileSidebarOpen, closeCharacterProfileSidebar } =
    useCharacterProfileSidebar();
  const [showProfileImage, setShowProfileImage] = useState<boolean>(true);
  const { activeChatData } = useChatStore();
  const { data: characterDetail, isLoading: isCharacterDetailLoading } =
    useGetCharacterDetailQuery({
      characterId: characterId!,
      enabled: isCharacterProfileSidebarOpen,
    });

  const handleTabsClick = () => {
    setShowProfileImage(false);
  };

  if (!isCharacterProfileSidebarOpen) return null;

  return (
    <aside
      className={`
        fixed top-0 right-0 z-50 min-h-[100dvh] max-h-[100dvh] w-full sm:w-full  
        bg-background
        flex flex-col shadow-lg
        transform transition-transform duration-300 ease-in-out
        md:relative md:w-[350px] md:shadow-none md:translate-x-0
        ${isCharacterProfileSidebarOpen ? "translate-x-0" : "translate-x-full"}
      `}
    >
      {showProfileImage && (
        <div
          className={`w-full relative ${
            activeChatData?.character?.avatarUrl
              ? "min-h-[70dvh] max-h-[70dvh]"
              : "min-h-[55dvh] max-h-[55dvh]"
          }`}
        >
          <img
            src={activeChatData?.character?.avatarUrl || AvatarPlaceholder.src}
            className="object-cover w-full h-full absolute inset-0"
          />
          <div className="absolute bottom-0 left-0 w-full h-52 bg-gradient-to-t from-white dark:from-black to-transparent" />

          {/* hide button */}
          {showProfileImage && (
            <header className="flex gap-2 py-2 px-2 sm:px-4 z-10 absolute">
              <Button
                className="rounded-full"
                onClick={() => closeCharacterProfileSidebar()}
                size={"icon"}
              >
                <ArrowLeft className="w-5" />
              </Button>
            </header>
          )}

          <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-3 ">
            {/* main profile */}
            <div className="flex flex-col gap-2 w-full px-4">
              <div className="flex flex-col">
                <div className="flex flex-col">
                  <h2 className="text-xl font-semibold">
                    {activeChatData?.character?.name}
                  </h2>
                  <UsernameLink
                    username={activeChatData?.character?.creator.username!}
                    prefix="By"
                    size={"xs"}
                  />
                </div>
              </div>

              {isCharacterDetailLoading ? (
                <div className="flex gap-4">
                  <Skeleton className="w-[30px] h-[20px] rounded-md" />
                  <Skeleton className="w-[30px] h-[20px] rounded-md" />
                </div>
              ) : (
                <div className="flex gap-4">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3" />
                    <span className="text-xs">
                      {characterDetail?._count.likes}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3" />
                    <span className="text-xs">
                      {characterDetail?._count.messages}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div
              className="w-full grid grid-cols-4 overflow-hidden"
              onClick={() => setShowProfileImage(false)}
            >
              {tabs.map((tab) => {
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`relative flex items-center justify-center space-x-2 px-1 py-4 text-sm font-medium transition-colors duration-200 ${
                      activeTab === tab.id
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {<tab.icon />}

                    {/* Active tab underline */}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="followActiveTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/*  */}
      {!showProfileImage && (
        <header className="flex flex-col py-2 px-4">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Button
                className="rounded-full"
                onClick={() => setShowProfileImage(true)}
                variant={"ghost"}
                size={"default"}
              >
                <ArrowLeft className="w-5" />
              </Button>

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

            <ReportCharacterModal />
          </div>

          {/* Tab Navigation */}
          <div
            className="w-full grid grid-cols-4 overflow-hidden"
            onClick={() => setShowProfileImage(false)}
          >
            {tabs.map((tab) => {
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative flex items-center justify-center space-x-2 px-1 py-4 text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {<tab.icon />}

                  {/* Active tab underline */}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="followActiveTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </header>
      )}

      {/* tabs */}
      <div
        className="h-full flex-1 w-full transition overflow-y-scroll"
        onScroll={() => setShowProfileImage(false)}
        onClick={handleTabsClick}
      >
        {/* tabs here */}
        {activeTab === "comments" && <CommentsTab />}
        {activeTab === "more" && <SimilarCharactersTab />}
        {activeTab === "about" && <AboutTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </aside>
  );
};

export default CharacterProfileSidebar;
