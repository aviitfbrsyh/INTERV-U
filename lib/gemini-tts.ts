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

function pcmToWav(pcmData: Uint8Array, sampleRate = 24000, channels = 1, bitDepth = 16): Blob {
  const byteRate = sampleRate * channels * (bitDepth / 8);
  const blockAlign = channels * (bitDepth / 8);
  const dataSize = pcmData.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const write = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  write(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  write(8, 'WAVE');
  write(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  write(36, 'data');
  view.setUint32(40, dataSize, true);
  new Uint8Array(buffer, 44).set(pcmData);

  return new Blob([buffer], { type: 'audio/wav' });
}

export async function generateSitiHighlight(
  question: string,
  userAnswer: string,
  suggestion: string,
  hack: string
): Promise<string> {
  const ai = getAI();

  const prompt = `Kamu adalah Siti Rahayu — HR Director 20 tahun, ngomongnya blak-blakan kayak kakak senior yang beneran peduli. Kamu baru dengerin jawaban kandidat dan langsung mau kasih feedback jujur dari hati. INI AKAN DIBACAIN KERAS, jadi tulis kayak kamu lagi ngomong langsung, bukan nulis laporan.

GAYA BICARA (WAJIB IKUTI):
- Pakai "kamu", jangan "Anda"
- Boleh mulai dengan ekspresi reaksi yang natural: "Oke jadi...", "Nah ini...", "Hmm, jujur ya...", "Hei, dengerin dulu ya...", "Ya ampun...", "Wah, lumayan nih..." — sesuaikan reaksi dengan kualitas jawaban
- Boleh ekspresif: kalau jawabannya bagus bilang apa yang bikin kamu terkesan, kalau kurang bilang apa yang bikin kamu geleng-geleng
- Nggak bertele-tele, tapi juga nggak kering
- Boleh pakai: "nah", "jadi", "tuh", "oke", "beneran", "makanya", "justru itu", "serius deh"

STRUKTUR (100–130 kata, ngalir natural kayak lagi ngomong):
Buka dengan reaksi jujur terhadap jawaban — satu kalimat yang langsung nunjukin kamu dengerin beneran. Sebutin 1-2 hal konkret yang perlu diperbaiki dan kenapa itu penting buat HR. Kasih 1-2 contoh frasa atau cara ngomong yang lebih kuat yang bisa langsung dipakai. Tutup dengan satu kalimat pendek yang nge-push mereka, bisa tegas, bisa menyemangati, tergantung konteks.

DATA:
Pertanyaan: ${question}
Jawaban kandidat: ${userAnswer}
Saran perbaikan: ${suggestion}
Hack kunci: ${hack}

Langsung mulai, jangan perkenalkan diri:`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return (response.text || '').trim();
}

export async function generateSitiSpeech(text: string): Promise<string> {
  const ai = getAI();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: text,
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: 'Kore',
          },
        },
      },
    } as Record<string, unknown>,
  });

  const part = response.candidates?.[0]?.content?.parts?.[0];
  const audioData = (part as { inlineData?: { data?: string; mimeType?: string } })?.inlineData?.data;
  const mimeType = (part as { inlineData?: { data?: string; mimeType?: string } })?.inlineData?.mimeType || 'audio/wav';

  if (!audioData) throw new Error('Tidak ada data audio yang diterima dari Gemini.');

  const audioBytes = atob(audioData);
  const audioArray = new Uint8Array(audioBytes.length);
  for (let i = 0; i < audioBytes.length; i++) {
    audioArray[i] = audioBytes.charCodeAt(i);
  }

  let blob: Blob;
  if (mimeType.includes('L16') || mimeType.includes('pcm')) {
    const rateMatch = mimeType.match(/rate=(\d+)/);
    const sampleRate = rateMatch ? parseInt(rateMatch[1]) : 24000;
    blob = pcmToWav(audioArray, sampleRate);
  } else {
    blob = new Blob([audioArray], { type: mimeType });
  }

  return URL.createObjectURL(blob);
}
