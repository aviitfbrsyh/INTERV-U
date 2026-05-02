import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API key is not configured.');
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const ai = getAI();
  const arrayBuffer = await audioBlob.arrayBuffer();
  const base64 = arrayBufferToBase64(arrayBuffer);
  const mimeType = audioBlob.type.split(';')[0] || 'audio/webm';

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{
      parts: [
        {
          text: "Transkripsi audio berikut dengan akurat. Kembalikan HANYA teks yang diucapkan dalam Bahasa Indonesia, tanpa label, tanpa penjelasan, tanpa tanda kutip pembuka/penutup.",
        },
        {
          inlineData: { mimeType, data: base64 },
        },
      ],
    }],
  });

  return (response.text || '').trim();
}
