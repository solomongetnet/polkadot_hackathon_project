"use server";

import { uploadToCloudinary } from "../config/cloudinary";

export async function transcribeAudioAction(formData: FormData) {
  try {
    const blob = formData.get("audio") as Blob;
    if (!blob) throw new Error("No audio provided");

    const text = await transcribeAudioBlob(blob); // your STT logic using AssemblyAI
    return { success: true, text };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function transcribeAudioBlob(file: Blob): Promise<string | null> {
  const uploadResponse = await uploadToCloudinary(file, "stt-voices");

  // Step 2: Transcribe with AssemblyAI
  const assemblyKey = process.env.ASSEMBLYAI_API_KEY!;
  const transcriptRes = await fetch(
    "https://api.assemblyai.com/v2/transcript",
    {
      method: "POST",
      headers: {
        authorization: assemblyKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({ audio_url: uploadResponse?.secure_url }),
    }
  );

  const { id } = await transcriptRes.json();

  while (true) {
    const polling = await fetch(
      `https://api.assemblyai.com/v2/transcript/${id}`,
      {
        headers: { authorization: assemblyKey },
      }
    );

    const data = await polling.json();
    if (data.status === "completed") return data.text;
    if (data.status === "error") throw new Error(data.error);
    await new Promise((r) => setTimeout(r, 1500));
  }
}
