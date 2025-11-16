"use client";

import { ChevronRight } from "lucide-react";
import React, { useMemo } from "react";
import { setValueToSearchParam } from "@/utils/search-params";

const allChatStarts = [
  "Hey! Ready to dive into a new conversation with me?",
  "I've been waiting—got something fun or interesting to share?",
  "If this were the start of a story, what would our first scene be?",
  "Ask me anything, or let me surprise you 😉",
  "What’s on your mind right now?",
  "Tell me something unexpected about your day!",
  "Want to play a quick game of imagination?",
  "If you could go anywhere right now, where would it be?",
  "Should we start with something funny or something deep?",
  "I’m curious—what’s the last thing that made you laugh?",
  "Let’s start with a challenge: tell me a secret!",
  "What if this chat was a dream—how would it begin?",
  "Got a random thought? I’ll match it with one of mine!",
  "Let’s create a story together. You start, I’ll follow.",
  "If you could ask me anything, what would it be?",
  "Want me to surprise you with a question?",
  "Let’s kick things off—fun, serious, or totally random?",
  "I bet you have something interesting on your mind—spill it!",
  "Imagine we’re in a movie—what scene are we in?",
  "What kind of adventure should we jump into today?",
];

// helper to pick random unique items
function getRandomStarters(list: string[], count: number) {
  const shuffled = [...list].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

const ChatStarters = ({ characterId }: { characterId: string }) => {
  // ensures new random set is picked on each render (e.g., when chat changes)
  const chatStarts = useMemo(() => getRandomStarters(allChatStarts, 4), [characterId]);

  const handleClick = async (starter: string) => {
    if (!characterId) return;
    setValueToSearchParam(`chat_starter`, starter);
  };

  return (
    <div className="flex justify-center w-full pb-10">
      <div className="flex flex-col gap-3 w-[80vw] sm:w-[500px]">
        <h2 className="text-xl font-[600] text-center">Chat starters</h2>

        <ul className="flex flex-col gap-2">
          {chatStarts.map((s) => (
            <li
              className="w-full p-3 flex rounded-lg bg-accent cursor-pointer hover:bg-accent/70 transition"
              key={s}
              onClick={() => handleClick(s)}
            >
              <h2 className="flex-1 text-base">{s}</h2>
              <span>
                <ChevronRight className="text-muted-foreground w-4.5" />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatStarters;
