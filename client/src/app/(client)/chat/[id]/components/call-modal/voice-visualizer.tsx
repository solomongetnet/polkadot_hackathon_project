"use client"

import { motion } from "framer-motion"
import { Mic, Loader2, MessageSquareText } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoiceVisualizerProps {
  status: "idle" | "listening" | "thinking" | "responding" | 'calling'
  level: number // 0-100
}

export function VoiceVisualizer({ status, level }: VoiceVisualizerProps) {
  const baseSize = 230 // Original size from user's snippet

  const ringVariants = {
    listening: (i: number) => ({
      scale: [1, 1 + level / 200 + i * 0.1], // Scale based on level and index
      opacity: [0, 0.3 - i * 0.05], // Fade out further rings
      transition: {
        duration: 0.8,
        ease: "easeOut",
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
        delay: i * 0.15, // Staggered delay for ripple effect
      },
    }),
    thinking: {
      scale: [1, 1.05, 1],
      opacity: [0.1, 0.2, 0.1],
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
      },
    },
    responding: {
      scale: [1, 1.02, 1],
      opacity: [0.1, 0.15, 0.1],
      transition: {
        duration: 0.6,
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
      },
    },
    idle: {
      scale: 1,
      opacity: 0,
      transition: { duration: 0.5 },
    },
  }

  const iconMap = {
    idle: <Mic className="h-8 w-8 text-gray-400" />,
    listening: <Mic className="h-8 w-8 text-blue-500" />,
    thinking: <Loader2 className="h-8 w-8 animate-spin text-purple-500" />,
    responding: <MessageSquareText className="h-8 w-8 text-green-500" />,
  }

  const statusTextMap = {
    idle: "Tap to speak",
    listening: "Listening...",
    thinking: "Thinking...",
    responding: "AI is responding...",
  }

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Background for the visualizer */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Rings */}
        {status !== "idle" &&
          Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "absolute rounded-full pointer-events-none",
                "bg-gradient-to-br backdrop-blur-xl",
                status === "listening" && "from-blue-500/50 to-purple-500/50",
                status === "thinking" && "from-purple-500/50 to-pink-500/50",
                status === "responding" && "from-green-500/50 to-teal-500/50",
              )}
              initial="idle"
              animate={status}
              // variants={ringVariants}
              custom={i}
              style={{
                width: `${baseSize + i * 50}px`, // Rings get larger
                height: `${baseSize + i * 50}px`,
              }}
            />
          ))}

        {/* Central Microphone/Status Icon */}
        <div className="relative z-10 flex flex-col items-center justify-center bg-white/10 backdrop-blur-md rounded-full p-6 shadow-lg">
          {iconMap[status]}
          <p className="mt-2 text-sm font-medium text-gray-300">{statusTextMap[status]}</p>
        </div>
      </div>
    </div>
  )
}
