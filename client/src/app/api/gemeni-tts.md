// app/api/route.ts

import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

import wav from "wav";

async function saveWaveFile(
  filename,
  pcmData,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
) {
  return new Promise((resolve, reject) => {
    const writer = new wav.FileWriter(filename, {
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    writer.on("finish", resolve);
    writer.on("error", reject);

    writer.write(pcmData);
    writer.end();
  });
}

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt) {
    return new Response("Prompt is required", { status: 400 });
  }

  const ai = new GoogleGenAI({
    apiKey: 'AIzaSyCIzTJo5fg-tJyyE8F6zMiZsIsglI2sJqE',
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: "Kore" },
        },
      },
    },
  });

  const base64 =
    response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!base64) {
    return new Response("No audio returned", { status: 500 });
  }

  const buffer = Buffer.from(base64, "base64");

  const fileName = "ou2t.wav";
  await saveWaveFile(fileName, buffer);

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": buffer.length.toString(),
    },
  });
}
