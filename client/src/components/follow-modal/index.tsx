"use client";

import React, { useLayoutEffect } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import FollowersContainer from "./followers-container";
import FollowingContainer from "./following-container";

const tabs = [
  { id: "following", label: "Following", icon: Users },
  { id: "followers", label: "Followers", icon: Users },
];

const FollowModal = ({
  isOpen,
  setIsOpen,
  defaultTab = "following",
  followersCount,
  followingCount,
  userId,
  isMyAccount,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  defaultTab?: "following" | "followers";
  followersCount?: number;
  followingCount?: number;
  userId: string;
  isMyAccount: boolean;
}) => {
  const [activeTab, setActiveTab] = useState(
    defaultTab === "following" ? "following" : "followers"
  );

  useLayoutEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 b transition-all duration-300 bg-white/8 backdrop-blur-lg"
          onClick={() => setIsOpen(false)}
        />
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className=" max-sm:w-[90%] max-w-4xl mx-auto  bg-white/90 dark:bg-white/8 backdrop-blur-2xl"
          showCloseButton
        >
          <div className="text-foreground">
            <div className="max-w-4xl mx-auto">
              {/* Tab Navigation */}
              <div className="relative flex justify-center space-x-3">
                {tabs.map((tab) => {
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex items-center space-x-2 px-1 py-4 text-sm font-medium transition-colors duration-200 ${
                        activeTab === tab.id
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center">
                        {tab.label}{" "}
                        {tab.id === "followers"
                          ? followersCount || 0
                          : followingCount || 0}
                      </div>

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

              {/* Content Area */}
              <div className="mt-8 min-h-[60dvh] max-h-[60dvh] overflow-y-scroll">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === "following" && (
                    <FollowingContainer userId={userId} />
                  )}

                  {activeTab === "followers" && (
                    <FollowersContainer
                      userId={userId}
                      isMyAccount={isMyAccount}
                    />
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FollowModal;
