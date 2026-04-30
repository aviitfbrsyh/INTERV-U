import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is not configured.');
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

async function withRetry<T>(fn: () => Promise<T>, retries = 4, delayMs = 2000): Promise<T> {
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

export interface CVData {
  profile: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  experience: {
    role: string;
    company: string;
    duration: string;
    responsibilities: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  skills: string[];
  projects: {
    name: string;
    description: string;
  }[];
  certifications: string[];
}

export interface JDData {
  role: string;
  requirements: string[];
  responsibilities: string[];
  qualifications: string[];
}

export async function extractCV(input: { text?: string, file?: { base64: string, mimeType: string } }): Promise<CVData> {
  const parts: any[] = [];
  const ai = getAI();

  if (input.file) {
    parts.push({
      inlineData: {
        data: input.file.base64,
        mimeType: input.file.mimeType,
      },
    });
    parts.push({ text: "Extract information from this CV into a structured JSON format. Be extremely accurate and preserve all details. If something is missing, use empty strings or empty arrays. Ensure responsibilities are clearly split into an array of strings." });
  } else {
    parts.push({ text: `Extract information from this CV text into a structured JSON format: ${input.text}. Be extremely accurate and preserve all details. If something is missing, use empty strings or empty arrays. Ensure responsibilities are clearly split into an array of strings.` });
  }

  const response = await withRetry(() => ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
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
                responsibilities: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
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
          skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
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
          certifications: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["profile", "experience", "education", "skills", "projects", "certifications"],
      },
    },
  }));

  return JSON.parse(response.text || '{}');
}

export async function extractJD(textOrFile: { text?: string, file?: { base64: string, mimeType: string } }): Promise<JDData> {
  const parts: any[] = [];
  const ai = getAI();

  if (textOrFile.file) {
    parts.push({
      inlineData: {
        data: textOrFile.file.base64,
        mimeType: textOrFile.file.mimeType,
      },
    });
    parts.push({ text: "Extract Job Description information from this document." });
  } else {
    parts.push({ text: `Extract Job Description information from this text: ${textOrFile.text}` });
  }

  const response = await withRetry(() => ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
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
    },
  }));

  return JSON.parse(response.text || '{}');
}
