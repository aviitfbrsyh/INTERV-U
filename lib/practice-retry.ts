import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API key is not configured.');
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export interface RetryResult {
  star: {
    situation: { present: boolean; evidence: string };
    task: { present: boolean; evidence: string };
    action: { present: boolean; evidence: string };
    result: { present: boolean; evidence: string };
    score: number;
  };
  concise: {
    consistency: { score: number; note: string };
    clarity: { score: number; note: string };
    information: { score: number; note: string };
    structure: { score: number; note: string };
    effectiveness: { score: number; note: string };
    total: number;
  };
  rating: number;
  improvement_note: string;
  is_better: boolean;
}

export async function retryAnswer(
  question: string,
  originalAnswer: string,
  newAnswer: string
): Promise<RetryResult> {
  const ai = getAI();

  const prompt = `Kamu adalah Siti Rahayu, HR Director 20 tahun — tapi ngomongnya santai kayak mentor. Kamu baru dengerin kandidat ngulang jawaban mereka, dan sekarang kamu kasih feedback jujur. Tulis \`improvement_note\` dalam gaya bicara kamu yang natural — bisa seneng kalau ada progres, bisa geleng-geleng kalau masih zonk, tapi selalu kasih arahan konkret. Pakai "kamu", pakai bahasa santai, boleh ekspresif.

PERTANYAAN HR:
${question}

JAWABAN LAMA (pembanding):
${originalAnswer}

JAWABAN BARU YANG DIEVALUASI:
${newAnswer}

Berikan analisis terstruktur untuk JAWABAN BARU saja:
- star: 4 komponen S/T/A/R, masing-masing present (boolean) + evidence (kutipan singkat dari JAWABAN BARU atau "-" jika absen). score = jumlah komponen present (0-4).
- concise: 5 dimensi (consistency, clarity, information, structure, effectiveness) skor 1-10 + note singkat berbasis fakta dari jawaban. total = jumlah kelima skor (max 50).
- rating: skor keseluruhan jawaban baru 1-10
- improvement_note: 1-2 kalimat dalam gaya bicara Siti yang santai — bandingkan jawaban baru vs lama, apa yang membaik, apa yang masih perlu dipoles. Ekspresif, jujur, actionable.
- is_better: true jika jawaban baru lebih baik dari yang lama, false jika tidak`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          star: {
            type: Type.OBJECT,
            properties: {
              situation: { type: Type.OBJECT, properties: { present: { type: Type.BOOLEAN }, evidence: { type: Type.STRING } }, required: ["present", "evidence"] },
              task: { type: Type.OBJECT, properties: { present: { type: Type.BOOLEAN }, evidence: { type: Type.STRING } }, required: ["present", "evidence"] },
              action: { type: Type.OBJECT, properties: { present: { type: Type.BOOLEAN }, evidence: { type: Type.STRING } }, required: ["present", "evidence"] },
              result: { type: Type.OBJECT, properties: { present: { type: Type.BOOLEAN }, evidence: { type: Type.STRING } }, required: ["present", "evidence"] },
              score: { type: Type.NUMBER },
            },
            required: ["situation", "task", "action", "result", "score"],
          },
          concise: {
            type: Type.OBJECT,
            properties: {
              consistency: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, note: { type: Type.STRING } }, required: ["score", "note"] },
              clarity: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, note: { type: Type.STRING } }, required: ["score", "note"] },
              information: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, note: { type: Type.STRING } }, required: ["score", "note"] },
              structure: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, note: { type: Type.STRING } }, required: ["score", "note"] },
              effectiveness: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, note: { type: Type.STRING } }, required: ["score", "note"] },
              total: { type: Type.NUMBER },
            },
            required: ["consistency", "clarity", "information", "structure", "effectiveness", "total"],
          },
          rating: { type: Type.NUMBER },
          improvement_note: { type: Type.STRING },
          is_better: { type: Type.BOOLEAN },
        },
        required: ["star", "concise", "rating", "improvement_note", "is_better"],
      },
    },
  });

  return JSON.parse(response.text || '{}');
}
