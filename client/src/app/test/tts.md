"use client";

import { generateAwsTTS, getAwsVoicesWithSamples } from "@/server/actions/tts";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { toast } from "sonner";

export default function TTSPage() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const voicesQuery = useQuery({
    queryFn: () => getAwsVoicesWithSamples(),
    queryKey: ["aws-voices"],
  });

  // To play sample audio
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const synthesize = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setAudioUrl(null);
    setError("");

    const res = await generateAwsTTS(text, voiceId || "Joanna");

    if (res.audioUrl) {
      setAudioUrl(res.audioUrl);
    } else {
      toast.error("Something went wrong");
    }

    setLoading(false);
  };

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const selectVoice = (id: string) => {
    setVoiceId(id);
    setDropdownOpen(false);
  };

  const playSample = (src: string) => {
    if (!audioRef.current) return;
    audioRef.current.src = src;
    audioRef.current.play().catch(() => {
      toast.error("Failed to play sample audio");
    });
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AWS Polly Text-to-Speech</h1>

      <textarea
        className="w-full border rounded p-2 mb-4"
        rows={5}
        placeholder="Enter text to speak..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="relative mb-4">
        <button
          onClick={toggleDropdown}
          className="w-full border rounded p-2 text-left flex justify-between items-center"
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
          type="button"
        >
          {voiceId || "Select a voice"}
          <span className="ml-2">&#9662;</span>
        </button>

        {dropdownOpen && (
          <div
            role="listbox"
            tabIndex={-1}
            className="absolute z-10 mt-1 w-full max-h-60 overflow-auto border rounded bg-white shadow"
          >
            {voicesQuery.isLoading && (
              <div className="p-2 text-center text-gray-500">Loading voices...</div>
            )}
            {voicesQuery.isError && (
              <div className="p-2 text-center text-red-600">Failed to load voices</div>
            )}
            {voicesQuery.data?.map((voice: any) => (
              <div
                key={voice.Id}
                role="option"
                aria-selected={voiceId === voice.Id}
                tabIndex={0}
                className={`flex justify-between items-center p-2 cursor-pointer hover:bg-blue-100 ${
                  voiceId === voice.Id ? "bg-blue-200 font-semibold" : ""
                }`}
                onClick={() => selectVoice(voice.Id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    selectVoice(voice.Id);
                  }
                }}
              >
                <span>
                  {voice.Id} ({voice.LanguageName})
                </span>
                {voice.localSrc && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playSample(voice.localSrc);
                    }}
                    className="ml-2 px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                    aria-label={`Play sample for ${voice.Id}`}
                  >
                    ▶️
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 w-full"
        disabled={loading || !text.trim() || !voiceId}
        onClick={synthesize}
      >
        {loading ? "Synthesizing..." : "Speak"}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {audioUrl && (
        <div className="mt-4">
          <audio controls src={audioUrl} className="w-full" ref={audioRef} />
        </div>
      )}

      {/* Hidden audio element for playing samples */}
      <audio ref={audioRef} hidden />
    </div>
  );
}
