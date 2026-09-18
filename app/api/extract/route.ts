import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

export const maxDuration = 60;

async function withRetry<T>(fn: () => Promise<T>, retries = 4, delayMs = 2000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      const msg = err?.message || '';
      
      // Do not retry if the free tier quota is permanently exhausted
      if (msg.includes('Quota exceeded') || msg.includes('quota') || msg.includes('limit: 20')) {
        throw err;
      }
      
      const isRetryable = err?.status === 429 || err?.status === 503
        || msg.includes('429') || msg.includes('503')
        || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('UNAVAILABLE')
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
    console.warn(`[Fallback] gemini-3-flash-preview failed, falling back to gemini-2.5-flash:`, err?.message);
    return await withRetry(() => ai.models.generateContent({
      model: "gemini-2.5-flash",
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

    const rawKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    const apiKey = rawKey.replace(/[^\x20-\x7E]/g, '').trim().replace(/^["']|["']$/g, '');
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

    const ai = new GoogleGenAI({ apiKey });
    const parts: any[] = [];

    if (type === 'cv') {
      if (input.file) {
        parts.push({ inlineData: { data: input.file.base64, mimeType: input.file.mimeType } });
        parts.push({ text: "Extract information from this CV into a structured JSON format. Be extremely accurate and preserve all details. If something is missing, use empty strings or empty arrays. Ensure responsibilities are clearly split into an array of strings." });
      } else {
        parts.push({ text: `Extract information from this CV text into a structured JSON format: ${input.text}. Be extremely accurate and preserve all details. If something is missing, use empty strings or empty arrays. Ensure responsibilities are clearly split into an array of strings.` });
      }

      const response = await generateWithFallback(ai, parts, {
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
        }
      );

      return NextResponse.json(JSON.parse(response.text || '{}'));
    } else {
      if (input.file) {
        parts.push({ inlineData: { data: input.file.base64, mimeType: input.file.mimeType } });
        parts.push({ text: "Extract Job Description information from this document." });
      } else {
        parts.push({ text: `Extract Job Description information from this text: ${input.text}` });
      }

      const response = await generateWithFallback(ai, parts, {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              role: { type: Type.STRING },
              requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
              responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
              qualifications: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["role", "requirements", "responsibilities", "qualifications"],
          },
        }
      );

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
