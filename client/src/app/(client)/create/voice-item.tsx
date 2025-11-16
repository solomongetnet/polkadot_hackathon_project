"use client";

import { Avatar } from "@/components/shared/avatar";
import { Button } from "@/components/ui/button";
import { Play, Pause, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
interface VoiceItemProps {
  voice: {
    voice_id: string;
    name: string;
    preview_url?: string;
  };
  onSelect: (voice: { name: string; voice_id: string }) => void;
  isSelected: boolean;
  currentPlayingId: string | null;
  setCurrentPlayingId: (id: string | null) => void;
}

export function VoiceItem({
  voice,
  onSelect,
  isSelected,
  currentPlayingId,
  setCurrentPlayingId,
}: VoiceItemProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlaying = currentPlayingId === voice.voice_id;

  const handlePlayPause = () => {
    if (!voice.preview_url) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setCurrentPlayingId(null);
    } else {
      setCurrentPlayingId(voice.voice_id);
      audioRef.current?.play();
    }
  };

  useEffect(() => {
    if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isPlaying]);

  const handleSelect = () => {
    onSelect({ name: voice.name, voice_id: voice.voice_id });
  };

  return (
    <div className="group relative flex items-center gap-4 rounded-lg p-2 pr-4 transition-colors hover:bg-neutral-800">
      <div className="flex relative">
        <Avatar
          fallback={voice.name}
          className="h-10 w-10 rounded-md"
          size={"lg"}
          showFallbackText={false}
        />
        <div className="absolute inset-0 z-10 grid place-content-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
            onClick={handlePlayPause}
            disabled={!voice.preview_url}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current" />
            )}
          </Button>
        </div>
      </div>

      <span>{voice.name}</span>

      {isSelected && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-green-500">
          <Check className="h-5 w-5" />
          <span className="text-sm">Selected</span>
        </div>
      )}

      <Button
        variant="secondary"
        size="sm"
        className="absolute right-4 top-1/2 -translate-y-1/2"
        onClick={handleSelect}
      >
        Select
      </Button>

      {voice.preview_url && (
        <audio
          ref={audioRef}
          src={voice.preview_url}
          onEnded={() => setCurrentPlayingId(null)}
        />
      )}
    </div>
  );
}
