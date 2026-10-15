import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { executeWithKeyRotation } from '@/lib/gemini-keys';

export const maxDuration = 60;

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1500): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      const msg = err?.message || '';
      
      // Do not retry if the free tier quota is permanently exhausted on this key
      if (msg.includes('Quota exceeded') || msg.includes('quota') || msg.includes('limit: 20') || msg.includes('RESOURCE_EXHAUSTED')) {
        throw err;
      }
      
      const isRetryable = err?.status === 429 || err?.status === 503
        || msg.includes('429') || msg.includes('503')
        || msg.includes('UNAVAILABLE')
        || msg.includes('fetch failed') || msg.includes('ECONNRESET') || msg.includes('ETIMEDOUT');
        
      if (!isRetryable || i === retries - 1) throw err;
      console.warn(`[Retry ${i + 1}/${retries}] Retrying due to error: ${msg}`);
      await new Promise(res => setTimeout(res, delayMs * (i + 1)));
    }
  }
  throw new Error('Max retries reached');
}

async function generateWithFallback(ai: GoogleGenAI, parts: any[], config: any) {
  try {
    return await withRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config
    }));
  } catch (err: any) {
    console.warn(`[Fallback] gemini-3-flash-preview failed, falling back to gemini-3.5-flash-lite:`, err?.message);
    return await withRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: { parts },
      config
    }));
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, input } = await request.json() as {
      type: 'cv' | 'jd';
      input: { text?: string; file?: { base64: string; mimeType: string } };
    };

    const parts: any[] = [];

    if (type === 'cv') {
      if (input.file) {
        parts.push({ inlineData: { data: input.file.base64, mimeType: input.file.mimeType } });
        parts.push({ text: "Extract information from this CV into a structured JSON format. Be extremely accurate and preserve all details. If something is missing, use empty strings or empty arrays. Ensure responsibilities are clearly split into an array of strings." });
      } else {
        parts.push({ text: `Extract information from this CV text into a structured JSON format: ${input.text}. Be extremely accurate and preserve all details. If something is missing, use empty strings or empty arrays. Ensure responsibilities are clearly split into an array of strings.` });
      }

      const response = await executeWithKeyRotation('Extract CV', async (ai) => {
        return await generateWithFallback(ai, parts, {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              profile: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  email: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  location: { type: Type.STRING },
                },
                required: ["name", "email", "phone", "location"],
              },
              experience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    role: { type: Type.STRING },
                    company: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["role", "company", "duration", "responsibilities"],
                },
              },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    degree: { type: Type.STRING },
                    institution: { type: Type.STRING },
                    year: { type: Type.STRING },
                  },
                  required: ["degree", "institution", "year"],
                },
              },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              projects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["name", "description"],
                },
              },
              certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["profile", "experience", "education", "skills", "projects", "certifications"],
          },
        });
      });

      return NextResponse.json(JSON.parse(response.text || '{}'));
    } else {
      const jdPrompt = `Anda adalah Senior HR & Industrial Organizational Psychologist.
Tugas Anda adalah mengekstrak informasi Job Description (JD) dan MEMETAKAN TUGAS/REQUIREMENTS TERSEBUT KE DALAM KAMUS KOMPETENSI SPENCER & SPENCER (1993).

ACUAN UTAMA: KAMUS KOMPETENSI SPENCER & SPENCER (Fokus 7 Inti IT):
1. EXP - Technical/Professional Expertise: Penguasaan keahlian teknis pemrograman, database, infrastruktur, atau tools.
2. AT - Analytical Thinking: Kemampuan analisis logis, debugging terstruktur, dan penelusuran akar masalah (root cause).
3. CT - Conceptual Thinking: Perancangan arsitektur sistem, pola modul (design patterns), dan pemahaman sistem menyeluruh.
4. ACH - Achievement Orientation: Dorongan efisiensi, optimasi performa sistem, pemenuhan target sprint dan standar tinggi.
5. CO - Concern for Order, Quality and Accuracy: Disiplin clean code, ketelitian pengujian/testing, dan meminimalkan celah bug.
6. TW - Teamwork and Cooperation: Kolaborasi tim Scrum/Agile, penerimaan feedback code review, dan saling membantu.
7. INT - Initiative: Proaktif refactoring, automasi alur kerja, dan pencegahan risiko teknis sebelum terjadi.
(Sertakan juga kode Spencer & Spencer lain jika relevan, misal INFO untuk Information Seeking atau CSO untuk Customer Service Orientation).

INSTRUKSI:
1. Ekstrak role, requirements, responsibilities, dan qualifications secara terstruktur.
2. Dari butir-butir tugas dan syarat tersebut, tentukan 4 sampai 7 kompetensi Spencer & Spencer yang paling esensial ('target_competencies').
3. Jelaskan alasan keterkaitan (rationale) dan perilaku konkret apa yang perlu digali saat wawancara (behavioral_focus).`;

      if (input.file) {
        parts.push({ inlineData: { data: input.file.base64, mimeType: input.file.mimeType } });
        parts.push({ text: jdPrompt });
      } else {
        parts.push({ text: `${jdPrompt}\n\nTEKS JOB DESCRIPTION:\n${input.text}` });
      }

      const response = await executeWithKeyRotation('Extract JD', async (ai) => {
        return await generateWithFallback(ai, parts, {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              role: { type: Type.STRING },
              requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
              responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
              qualifications: { type: Type.ARRAY, items: { type: Type.STRING } },
              target_competencies: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    code: { type: Type.STRING },
                    name: { type: Type.STRING },
                    cluster: { type: Type.STRING },
                    importance: { type: Type.STRING },
                    rationale: { type: Type.STRING },
                    behavioral_focus: { type: Type.STRING },
                  },
                  required: ["code", "name", "cluster", "importance", "rationale", "behavioral_focus"],
                },
              },
            },
            required: ["role", "requirements", "responsibilities", "qualifications", "target_competencies"],
          },
        });
      });

      return NextResponse.json(JSON.parse(response.text || '{}'));
    }
  } catch (err: any) {
    console.error('[/api/extract]', err, 'Cause:', err.cause);
    
    let errMsg = err.message ?? 'Extraction failed';
    if (errMsg.includes('fetch failed')) {
      errMsg = 'Gagal terhubung ke server AI (Timeout/Network Error). Pastikan koneksi stabil atau ukuran file tidak terlalu besar.';
    }
    
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
