"use server";

export async function generateTTS(
  text: string,
  voiceId?: string
): Promise<Buffer | { error: string }> {
  if (!text) {
    return { error: "Text is required" };
  }

  try {
    const API_KEY = process.env.ELEVENLABS_API_KEY;
    const selectedVoice = voiceId || "21m00Tcm4TlvDq8ikWAM";

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return { error: errorText };
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    return { error: "TTS failed" };
  }
}

export async function listVoices() {
  try {
    const res = await fetch(
      "https://api.elevenlabs.io/v1/voices?page_size=100",
      {
        headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY! },
      }
    );
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();

    return data.voices.map((v: any) => ({
      voice_id: v.voice_id,
      name: v.name,
      preview_url: v.preview_url || v.samples?.[0]?.preview_url,
    }));
  } catch (e: any) {
    return { error: e.message };
  }
}

import { localSamplesData } from "@/constants/voices";
import {
  DescribeVoicesCommand,
  PollyClient,
  SynthesizeSpeechCommand,
} from "@aws-sdk/client-polly";

const polly = new PollyClient({ region: "us-east-1" });

export async function generateAwsTTS(text: string, voiceId: string) {
  if (!text) return { error: "Text is required" };

  try {
    const command = new SynthesizeSpeechCommand({
      OutputFormat: "mp3",
      Text: text,
      VoiceId: (voiceId as any) || "Joanna",

      Engine: "generative",
    });

    const response = await polly.send(command);
    const arrayBuffer = await response.AudioStream?.transformToByteArray();
    const audioBuffer = Buffer.from(arrayBuffer as Buffer);

    const base64 = audioBuffer.toString("base64");
    const audioUrl = `data:audio/mp3;base64,${base64}`;

    return { audioUrl };
  } catch (err) {
    console.error("Polly error:", err);
    return { error: "Failed to synthesize speech" };
  }
}


export async function getAwsVoicesWithSamples() {
  const command = new DescribeVoicesCommand({
    Engine: "generative",
    LanguageCode: "en-US",
  });
  const response = await polly.send(command);

  // Merge each voice with its local sample if available
  const voicesWithSamples =
    response.Voices?.map((voice) => {
      const sample = localSamplesData.find((s) => s.VoiceId === voice.Id);
      return {
        ...voice,
        localSrc: sample?.localSrc || null,
      };
    }) || [];

  return voicesWithSamples;
}
