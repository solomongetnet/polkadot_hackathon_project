"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VoiceItem } from "./voice-item";
import { listVoices } from "@/server/actions/tts";

interface VoiceSelectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onVoiceSelect: (voice: { name: string; voice_id: string }) => void;
  selectedVoiceId: string | null;
}

export function VoiceSelectionModal({
  isOpen,
  onOpenChange,
  onVoiceSelect,
  selectedVoiceId,
}: VoiceSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["voices"],
    queryFn: listVoices,
  });
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const voices = Array.isArray(data) ? data : (data as any)?.error ? [] : []; // Ensure data is an array or empty

  const filteredVoices = voices.filter((voice) =>
    voice.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl border-none bg-neutral-900 p-0 text-white shadow-lg">
        <DialogHeader className="relative flex flex-row items-center justify-between p-4 pb-0">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4 h-8 w-8 text-neutral-400 hover:bg-neutral-800 hover:text-white"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
          <DialogTitle className="flex-1 text-center text-lg font-semibold text-white">
            Voices
          </DialogTitle>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full px-4 py-1 text-sm"
          >
            Create
          </Button>
        </DialogHeader>
        <div className="p-4 pt-2">
          <Tabs defaultValue="discover" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-neutral-800">
              <TabsTrigger
                value="discover"
                className="data-[state=active]:bg-neutral-700 data-[state=active]:text-white"
              >
                Discover
              </TabsTrigger>
              <TabsTrigger
                value="your-voices"
                className="data-[state=active]:bg-neutral-700 data-[state=active]:text-white"
              >
                Your voices
              </TabsTrigger>
              <TabsTrigger
                value="recent"
                className="data-[state=active]:bg-neutral-700 data-[state=active]:text-white"
              >
                Recent
              </TabsTrigger>
            </TabsList>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Search"
                className="w-full rounded-lg border-none bg-neutral-800 pl-9 text-white placeholder:text-neutral-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <TabsContent value="discover" className="mt-4">
              <ScrollArea className="h-[300px] pr-2">
                {isLoading && (
                  <div className="text-center text-neutral-400">
                    Loading voices...
                  </div>
                )}
                {isError && (
                  <div className="text-center text-red-500">
                    Error loading voices:{" "}
                    {(error as any)?.message || "Unknown error"}
                  </div>
                )}
                {!isLoading && !isError && filteredVoices.length === 0 && (
                  <div className="text-center text-neutral-400">
                    No voices found.
                  </div>
                )}
                <div className="grid gap-1">
                  {filteredVoices.map((voice) => (
                    <VoiceItem
                      currentPlayingId={currentPlayingId}
                      setCurrentPlayingId={setCurrentPlayingId}
                      key={voice.voice_id}
                      voice={voice}
                      onSelect={onVoiceSelect}
                      isSelected={selectedVoiceId === voice.voice_id}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="your-voices" className="mt-4">
              <div className="text-center text-neutral-400">
                Your voices content goes here.
              </div>
            </TabsContent>
            <TabsContent value="recent" className="mt-4">
              <div className="text-center text-neutral-400">
                Recent voices content goes here.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
