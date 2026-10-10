import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

export const maxDuration = 60;

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 1500): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      const isRetryable = err?.status === 429 || err?.status === 503
        || err?.message?.includes('429') || err?.message?.includes('503')
        || err?.message?.includes('RESOURCE_EXHAUSTED') || err?.message?.includes('UNAVAILABLE');
      if (!isRetryable || i === retries - 1) throw err;
      await new Promise(res => setTimeout(res, delayMs * (i + 1)));
    }
  }
  throw new Error('Max retries reached');
}

export async function POST(request: NextRequest) {
  try {
    const { cvText, jdText } = await request.json() as { cvText: string; jdText: string };

    const rawKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    const apiKey = rawKey.replace(/[^\x20-\x7E]/g, '').trim().replace(/^["']|["']$/g, '');
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

    const ai = new GoogleGenAI({ apiKey });

    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Lakukan analisis cross-matching antara profil kandidat (CV) dan kompetensi yang dituntut pekerjaan (JD).
Gunakan acuan Kamus Kompetensi Spencer & Spencer (1993) khususnya 7 Kompetensi Inti IT: EXP (Technical Expertise), AT (Analytical Thinking), CT (Conceptual Thinking), ACH (Achievement Orientation), CO (Concern for Order/Quality), TW (Teamwork), INT (Initiative).

Identifikasi kesesuaian kompetensi yang telah terbukti di CV, gap kompetensi yang belum tampak, dan area perilaku spesifik yang WAJIB digali (probing) dalam sesi Behavioral Event Interview (BEI) berbasis bukti nyata.

CV KANDIDAT:
${cvText}

JOB DESCRIPTION & KOMPETENSI TARGET:
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

    return NextResponse.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.error('[/api/cross-match]', err);
    return NextResponse.json({ error: err.message ?? 'Cross-match failed' }, { status: 500 });
  }
}
