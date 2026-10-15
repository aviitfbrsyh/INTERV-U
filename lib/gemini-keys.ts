/**
 * HELPER: Gemini Multi-Key Rotation & Failover
 * Mendukung multiple API keys via koma (key1,key2,key3) atau variabel cadangan.
 * Jika Key 1 terkena Quota Exceeded (429), sistem otomatis beralih ke Key 2, dst.
 */
import { GoogleGenAI } from '@google/genai';

function cleanKey(raw: string): string {
  return raw.replace(/[^\x20-\x7E]/g, '').trim().replace(/^["']|["']$/g, '');
}

export function getGeminiApiKeys(): string[] {
  const keys: string[] = [];

  // 1. GEMINI_API_KEY (mendukung pemisah koma: key1,key2,key3)
  const main = process.env.GEMINI_API_KEY || '';
  if (main) {
    keys.push(...main.split(',').map(cleanKey));
  }

  // 2. NEXT_PUBLIC_GEMINI_API_KEY
  const pub = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  if (pub) {
    keys.push(...pub.split(',').map(cleanKey));
  }

  // 3. Cadangan eksplisit jika diisi terpisah di Vercel
  const b1 = process.env.GEMINI_API_KEY_BACKUP || '';
  if (b1) keys.push(...b1.split(',').map(cleanKey));

  const b2 = process.env.GEMINI_API_KEY_BACKUP_2 || '';
  if (b2) keys.push(...b2.split(',').map(cleanKey));

  // Hapus duplikat dan pastikan panjang key valid
  return Array.from(new Set(keys)).filter(k => k.length > 10);
}

export async function executeWithKeyRotation<T>(
  operationName: string,
  fn: (ai: GoogleGenAI, apiKey: string) => Promise<T>
): Promise<T> {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) {
    throw new Error('API key Gemini belum dikonfigurasi. Silakan tambahkan GEMINI_API_KEY di Vercel Environment Variables.');
  }

  let lastError: any = null;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const ai = new GoogleGenAI({ apiKey: key });

    try {
      return await fn(ai, key);
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || '';
      const isQuotaOrRateLimit =
        err?.status === 429 ||
        err?.status === 503 ||
        msg.includes('429') ||
        msg.includes('503') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('Quota exceeded') ||
        msg.includes('limit: 20');

      if (isQuotaOrRateLimit && i < keys.length - 1) {
        console.warn(`[${operationName}] Key #${i + 1} kuota limit. Beralih otomatis ke Key cadangan #${i + 2}...`);
        continue; // Coba key berikutnya
      }

      // Jika bukan error kuota atau sudah key terakhir, lempar error
      throw err;
    }
  }

  throw lastError;
}
