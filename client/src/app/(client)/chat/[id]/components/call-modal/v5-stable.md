"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { respondToCharacterCallAction } from "@/server/actions/call.actions";
import { generateTTS } from "@/server/actions/tts";
import { transcribeAudioAction } from "@/server/actions/stt";

type Status = "calling" | "idle" | "listening" | "responding" | "thinking";

interface Message {
  role: "USER" | "ASSISTANT";
  content: string;
}

interface Options {
  onError?: (e: Error) => void;
  silenceTimeoutMs?: number;
  voiceId: string;
  characterId: string;
}

export function useVoiceChat({
  onError,
  silenceTimeoutMs = 4000,
  voiceId,
  characterId,
}: Options) {
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [soundLevel, setSoundLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const meterTick = useRef<NodeJS.Timeout | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const speakTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimeout = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const started = useRef(false);
  const restarting = useRef(false);

  const respondTocMessageMutation = useMutation({
    mutationFn: ({ message }: { message: string }) =>
      respondToCharacterCallAction({ messages, message, characterId }),
  });

  const transcribeMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await transcribeAudioAction(formData);
    },
  });

  const playAudioBuffer = (buffer: any) => {
    const blob = new Blob([buffer], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudioRef.current = audio;
    audio.play();
  };

  const cleanupAudio = () => {
    if (meterTick.current) clearInterval(meterTick.current);
    if (analyserRef.current) analyserRef.current.disconnect();
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    setSoundLevel(0);
  };

  const startSoundMeter = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micStreamRef.current = stream;

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    src.connect(analyser);
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);
    meterTick.current = setInterval(() => {
      analyser.getByteFrequencyData(data);
      const level = Math.max(...data) / 255;
      setSoundLevel(level);

      // Silence detection fix:
      if (level < 0.02) {
        if (!silenceTimeout.current) {
          silenceTimeout.current = setTimeout(() => {
            stopRecordingAndTranscribe();
          }, silenceTimeoutMs);
        }
      } else {
        if (silenceTimeout.current) {
          clearTimeout(silenceTimeout.current);
          silenceTimeout.current = null;
        }
      }
    }, 100);
  };

  const stopRecordingAndTranscribe = () => {
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.stop();
    }
  };

  const startRecording = async () => {
    try {
      const stream = micStreamRef.current!;
      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;
      audioChunks.current = [];

      recorder.ondataavailable = (e) => audioChunks.current.push(e.data);

      recorder.onstop = async () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");

        try {
          setStatus("thinking");
          const result = await transcribeMutation.mutateAsync(formData);

          if (!result.success || !result.text || isMuted) return restart();

          const text = result.text;

          setTranscript("");
          setMessages((prev) => [...prev, { role: "USER", content: text }]);

          const res = await respondTocMessageMutation.mutateAsync({
            message: text,
          });

          if (!res.success || !res.response) {
            onError?.(new Error(res.error?.message || "AI response failed"));
            return restart();
          }

          const response = res.response;
          setMessages((prev) => [
            ...prev,
            { role: "ASSISTANT", content: response },
          ]);
          setAiResponse(response);
          setStatus("responding");

          await speak(response);
        } catch (e) {
          onError?.(e as Error);
          restart();
        }
      };

      recorder.start();
      setStatus("listening");
    } catch (e) {
      onError?.(new Error("Unable to record audio"));
    }
  };

  const speak = async (text: string) => {
    try {
      const result = await generateTTS(text, voiceId);
      if ("error" in result) throw new Error(result.error);

      playAudioBuffer(result);

      speakTimeoutRef.current = setTimeout(() => {
        restart();
      }, 2000);
    } catch (e: any) {
      onError?.(e);
      restart();
    }
  };

  const restart = () => {
    if (restarting.current) return;
    restarting.current = true;

    if (silenceTimeout.current) clearTimeout(silenceTimeout.current);

    setTranscript("");
    setAiResponse(null);

    setTimeout(() => {
      restarting.current = false;
      startRecording();
    }, 500);
  };

  const start = async () => {
    if (started.current) return;
    started.current = true;

    try {
      await startSoundMeter();
      setStatus("calling");
      speakTimeoutRef.current = setTimeout(() => startRecording(), 1000);
    } catch {
      onError?.(new Error("Mic permission denied"));
    }
  };

  const end = () => {
    if (speakTimeoutRef.current) clearTimeout(speakTimeoutRef.current);
    if (silenceTimeout.current) clearTimeout(silenceTimeout.current);

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = "";
      currentAudioRef.current = null;
    }

    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.stop();
    }

    cleanupAudio();
    setMessages([]);
    setTranscript("");
    setAiResponse(null);
    setStatus("idle");
    started.current = false;
  };

  const toggleMute = () => setIsMuted((m) => !m);

  useEffect(() => {
    return () => end();
  }, []);

  return {
    status,
    transcript,
    aiResponse,
    soundLevel,
    isMuted,
    toggleMute,
    start,
    end,
    messages,
  };
}
