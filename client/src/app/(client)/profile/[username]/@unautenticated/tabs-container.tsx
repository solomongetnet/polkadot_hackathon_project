"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Users, Mic, Film, Sun, Moon } from "lucide-react";
import CharacetrsContainer from "./tabs/characters-container";

const tabs = [
  { id: "characters", label: "Characters", icon: Users },
  { id: "liked", label: "Liked", icon: Heart },
  { id: "scenes", label: "Scenes", icon: Film },
];

export default function TabsContainer() {
  const [activeTab, setActiveTab] = useState("characters");

  return (
    <div className="min-h-screen text-foreground max-md:mt-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Tab Navigation */}
        <div className="relative flex justify-center space-x-8 ">
          {tabs.map((tab) => {
            const Icon = tab.icon;
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
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>

                {/* Active tab underline */}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
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
        <div className="mt-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "characters" && <CharacetrsContainer />}

            {activeTab === "liked" && (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Your liked items will appear here
                </p>
              </div>
            )}

            {activeTab === "personas" && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Your personas will appear here
                </p>
              </div>
            )}

            {activeTab === "voices" && (
              <div className="text-center py-12">
                <Mic className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Your voices will appear here
                </p>
              </div>
            )}

            {activeTab === "scenes" && (
              <div className="text-center py-12">
                <Film className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Your scenes will appear here
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
