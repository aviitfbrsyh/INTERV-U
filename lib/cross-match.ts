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

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 1500): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      const isRetryable = err?.status === 503 || err?.message?.includes('503') || err?.message?.includes('UNAVAILABLE');
      if (!isRetryable || i === retries - 1) throw err;
      await new Promise(res => setTimeout(res, delayMs * (i + 1)));
    }
  }
  throw new Error('Max retries reached');
}

export interface CrossMatchData {
  match_score: number;
  matched_skills: string[];
  skill_gaps: string[];
  experience_verdict: string;
  focus_areas: string[];
  summary: string;
}

export async function crossMatch(cvText: string, jdText: string): Promise<CrossMatchData> {
  const ai = getAI();

  const response = await withRetry(() => ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Lakukan analisis cross-matching antara profil kandidat dan kebutuhan pekerjaan berikut. Identifikasi kesesuaian skill, gap kompetensi, dan area spesifik yang perlu digali lebih dalam dalam sesi wawancara.

CV KANDIDAT:
${cvText}

JOB DESCRIPTION:
${jdText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          match_score: {
            type: Type.NUMBER,
            description: "Skor kesesuaian keseluruhan kandidat dengan posisi, skala 0-100",
          },
          matched_skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Daftar skill kandidat yang sesuai dengan requirements JD",
          },
          skill_gaps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Skill atau kualifikasi yang dibutuhkan JD namun tidak ditemukan di CV kandidat",
          },
          experience_verdict: {
            type: Type.STRING,
            description: "Penilaian singkat kesesuaian pengalaman kerja kandidat dengan kebutuhan posisi",
          },
          focus_areas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Area spesifik yang perlu digali lebih dalam dalam sesi wawancara berdasarkan gap yang ditemukan",
          },
          summary: {
            type: Type.STRING,
            description: "Ringkasan singkat kesesuaian kandidat secara keseluruhan dengan posisi yang dilamar",
          },
        },
        required: ["match_score", "matched_skills", "skill_gaps", "experience_verdict", "focus_areas", "summary"],
      },
    },
  }));

  return JSON.parse(response.text || '{}');
}
