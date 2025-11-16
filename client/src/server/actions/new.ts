// lib/actions/geminiTtsAction.ts

import { GoogleGenAI } from "@google/genai";

export async function geminiTtsAction(prompt: string) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            {
              speaker: "Joe",
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: "Kore" },
              },
            },
            {
              speaker: "Jane",
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: "Puck" },
              },
            },
          ],
        },
      },
    },
  });

  const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64) throw new Error("No audio data returned from Gemini");

  const buffer = Buffer.from(base64, "base64");
  console.log(buffer)
  return buffer;
}
