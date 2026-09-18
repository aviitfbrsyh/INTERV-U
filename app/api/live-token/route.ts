import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function GET() {
  try {
    const rawKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    const apiKey = rawKey.replace(/[^\x20-\x7E]/g, '').trim().replace(/^["']|["']$/g, '');
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

    const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: 'v1alpha' } });

    const expireTime = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const token = await ai.authTokens.create({
      config: { uses: 1, expireTime },
    });

    if (!token.name) return NextResponse.json({ error: 'Token generation failed' }, { status: 500 });

    return NextResponse.json({ token: token.name });
  } catch (err: any) {
    console.error('[/api/live-token]', err);
    return NextResponse.json({ error: err.message ?? 'Token generation failed' }, { status: 500 });
  }
}
