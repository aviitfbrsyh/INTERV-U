import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { executeWithKeyRotation } from '@/lib/gemini-keys';

export async function GET() {
  try {
    const token = await executeWithKeyRotation('LiveToken', async (_ai, apiKey) => {
      const liveAi = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: 'v1alpha' } });
      const expireTime = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const res = await liveAi.authTokens.create({
        config: { uses: 1, expireTime },
      });

      if (!res.name) throw new Error('Token generation failed (empty token)');
      return res.name;
    });

    return NextResponse.json({ token });
  } catch (err: any) {
    console.error('[/api/live-token]', err);
    return NextResponse.json({ error: err.message ?? 'Token generation failed' }, { status: 500 });
  }
}
