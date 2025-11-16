"use client";

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Phone } from "lucide-react";
import { useChatStore } from "@/store";
import { Avatar } from "@/components/shared/avatar";
import { useVoiceChat } from "./use-voice-chat";
import { VoiceVisualizer } from "./voice-visualizer";

/* ------------ CONSTANTS ------------- */
const GRADIENTS = [
  "from-[#10243E] via-[#1B3656] to-[#284B6E]",
  "from-[#0F2027] via-[#203A43] to-[#2C5364]",
  "from-[#16222A] via-[#3A6073] to-[#4B8792]",
  "from-[#1E2A38] via-[#2F3F50] to-[#405668]",
  "from-[#14253D] via-[#1C3A57] to-[#254D71]",
];

export default function CallModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  /* ------------ gradient ------------ */
  const gradientClass = useMemo(
    () =>
      `bg-gradient-to-br ${
        GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)]
      }`,
    []
  );

  /* ------------ chat data ------------ */
  const currentCharacter = useChatStore((s) => s.activeChatData?.character);

  /* ------------ voice hook ------------ */
  const {
    start,
    end,
    transcript,
    soundLevel,
    isMuted,
    toggleMute,
    status,
  } = useVoiceChat({
    onError: (e) => console.error(e),
    characterId: currentCharacter?.id!,
    voiceId: currentCharacter?.voiceStyle!,
  });

  useEffect(() => {
    if (isOpen) {
      start(); // ✅ ensure async and not skipped
    } else {
      end();
    }
  }, [isOpen]);

  /* ------------ derived ------------- */
  const level = Math.round(soundLevel * 100); // 0–100 for glow scale

  /* ------------ RENDER ------------- */
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="call-modal"
        className={`fixed inset-0 z-[99999] ${gradientClass} flex flex-col items-center justify-center text-white overflow-hidden p-4`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Dynamic Sound Level Ring */}
        {status === "listening" && (
          <motion.div
            animate={{
              scale: 1 + level / 300,
              opacity: 0.2 + level / 300,
            }}
            transition={{ duration: 0.2 }}
            className="absolute -bottom-[90px] rounded-full bg-[#10243E]/50 overflow-hidden   pointer-events-none backdrop-blur-3xl "
            style={{
              width: "230px",
              height: "230px",
            }}
          />
        )}

        {/* Avatar Glow + Effects */}
        <div className="z-10 flex flex-col items-center text-center">
          <div className="relative">
            {/* AI Glow Ring */}

            {status === "responding" && (
              <motion.div
                animate={{
                  scale: status === "responding" ? [1, 1.1, 1] : 1,
                  opacity: status === "responding" ? [0.4, 0.6, 0.4] : 0,
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full bg-blue-400 blur-2xl opacity-30 z-0"
                style={{
                  width: "160px",
                  height: "160px",
                  left: "-5px",
                  top: "-5px",
                }}
              />
            )}

            {/* Avatar with Float */}
            <motion.div
              initial={{ y: 0 }}
              animate={{
                y: [0, -4, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative z-10"
            >
              <Avatar
                src={currentCharacter?.avatarUrl || ""}
                alt="Character avatar"
                className="border-2 border-gray-700 object-cover size-[150px] rounded-full"
                size="2xl"
              />
            </motion.div>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-xl font-medium text-gray-200 mb-1"
          >
            {currentCharacter?.name}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Charapia.ai
          </motion.p>

          <motion.p
            className="text-lg text-gray-400 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          >
            {status === "calling" && "Calling..."}
            {status === "thinking" && "Thinking..."}
            {status === "responding" && "Responsing..."}
            {status === "listening" && "Listening..."}
          </motion.p>

          <div className="text-sm text-white/80 max-w-md px-4 break-words h-[30px]">
            {transcript}
          </div>

          <div className="flex items-center gap-8 mt-10">
            {/* --- Mute / Unmute --- */}
            <motion.div
              className="flex flex-col gap-1 items-center cursor-pointer"
              whileTap={{ scale: 0.95 }}
              onClick={toggleMute}
            >
              <div className="flex items-center justify-center rounded-full h-12 w-12 bg-white/10">
                {isMuted ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </div>
              <span className="text-xs mt-1">
                {isMuted ? "Unmute" : "Mute"}
              </span>
            </motion.div>

            {/* --- Hang up --- */}
            <motion.div
              onClick={() => {
                end();
                onClose();
              }}
              className="flex flex-col gap-1 items-center cursor-pointer"
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center justify-center rounded-full h-12 w-12 bg-black text-white">
                <Phone className="w-4 h-4 rotate-135" />
              </div>
              <span className="text-xs mt-1">Hang up</span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
