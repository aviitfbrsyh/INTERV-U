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
      if (msg.includes('Quota exceeded') || msg.includes('quota') || msg.includes('limit: 20') || msg.includes('RESOURCE_EXHAUSTED')) {
        throw err;
      }
      const isRetryable = err?.status === 429 || err?.status === 503
        || msg.includes('429') || msg.includes('503')
        || msg.includes('UNAVAILABLE')
        || msg.includes('fetch failed');
      if (!isRetryable || i === retries - 1) throw err;
      await new Promise(res => setTimeout(res, delayMs * (i + 1)));
    }
  }
  throw new Error('Max retries reached');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'chat') {
      const { userQuestion, evaluationContext, history } = body;
      const conversationHistory = Array.isArray(history) && history.length > 0
        ? history.map((m: any) => `${m.role === 'user' ? 'Kandidat' : 'Siti'}: ${m.text}`).join('\n\n')
        : '(Belum ada percakapan sebelumnya)';

      const prompt = `Anda adalah Siti Rahayu — HR Director dengan 20 tahun pengalaman di industri, kini berperan sebagai konsultan karir dan mentor profesional. Anda baru saja menyelesaikan evaluasi mendalam terhadap kandidat ini dalam simulasi Behavioral Event Interview (BEI) berbasis Kamus Kompetensi Spencer & Spencer (1993) dan framework STAR + FACT (Feeling, Action, Context, Thinking).

KARAKTER ANDA:
- Profesional namun tetap ramah dan approachable — seperti mentor berpengalaman, bukan atasan yang kaku
- Hangat dan suportif, tapi tetap objektif dan berbasis fakta perilaku nyata kandidat
- Bahasa Indonesia semi-formal: pakai "Anda" untuk kandidat, hindari bahasa terlalu kasual
- Berikan pujian yang tulus dan spesifik ketika ada perilaku/kompetensi yang kuat
- Berikan kritik yang konstruktif — selalu disertai solusi atau langkah konkret bagaimana menaikkan level kompetensi (skala 1–5 Spencer & Spencer)
- Paham mendalam 7 kompetensi IT inti: EXP (Technical Expertise), AT (Analytical Thinking), CT (Conceptual Thinking), ACH (Achievement Orientation), CO (Concern for Order/Quality), TW (Teamwork), INT (Initiative)
- Tidak perlu bertele-tele, langsung ke inti dengan tetap sopan

GAYA PENULISAN:
- Terstruktur dan mudah dibaca — gunakan poin atau paragraf pendek bila perlu
- Pilihan kata profesional tapi tidak kaku: hindari jargon berlebihan
- Tunjukkan empati ketika kandidat tampak bingung atau kurang percaya diri
- Jika kandidat menanyakan skor atau aspek FACT (Feeling, Action, Context, Thinking), bedah secara taktis bagaimana menjawab dengan narasi yang kaya aksi konkret
- Akhiri dengan dorongan yang membangun jika relevan

KONTEKS EVALUASI KANDIDAT:
${evaluationContext}

RIWAYAT PERCAKAPAN:
${conversationHistory}

PERTANYAAN KANDIDAT:
${userQuestion}

PANDUAN MENJAWAB:
- Maksimal 200 kata — padat, jelas, dan langsung ke poin
- Dasarkan jawaban pada data evaluasi di atas
- Jika perlu contoh konkret, berikan — singkat dan langsung bisa dipraktikkan
- Jika pertanyaan di luar konteks evaluasi, tetap jawab namun kaitkan dengan profil kandidat
- Jangan buka dengan "Siti:" atau nama Anda sendiri

Jawaban Anda:`;

      const response = await executeWithKeyRotation('Coaching Chat', async (ai) => {
        try {
          return await withRetry(() => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
          }));
        } catch {
          return await withRetry(() => ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: prompt,
          }));
        }
      });

      return NextResponse.json({
        text: response.text || 'Maaf, saya tidak bisa menjawab saat ini. Coba ulangi pertanyaannya?'
      });
    }

    if (action === 'speech') {
      const { text } = body;
      const response = await executeWithKeyRotation('Coaching Speech', async (ai) => {
        return await withRetry(() => ai.models.generateContent({
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
        }));
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      const audioData = (part as { inlineData?: { data?: string; mimeType?: string } })?.inlineData?.data;
      const mimeType = (part as { inlineData?: { data?: string; mimeType?: string } })?.inlineData?.mimeType || 'audio/wav';

      if (!audioData) {
        return NextResponse.json({ error: 'Tidak ada data audio yang diterima dari Gemini.' }, { status: 500 });
      }

      return NextResponse.json({ audioData, mimeType });
    }

    if (action === 'highlight') {
      const { question, userAnswer, suggestion, hack } = body;
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

      const response = await executeWithKeyRotation('Coaching Highlight', async (ai) => {
        try {
          return await withRetry(() => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
          }));
        } catch {
          return await withRetry(() => ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: prompt,
          }));
        }
      });

      return NextResponse.json({ text: (response.text || '').trim() });
    }

    if (action === 'practice') {
      const { question, originalAnswer, newAnswer } = body;
      const prompt = `Kamu adalah Siti Rahayu, HR Director 20 tahun — tapi ngomongnya santai kayak mentor. Kamu baru dengerin kandidat ngulang jawaban mereka dalam simulasi Behavioral Event Interview (BEI). Sekarang kamu kasih feedback jujur berbasis kerangka STAR + FACT (Feeling, Action, Context, Thinking) dan kamus kompetensi Spencer & Spencer. Tulis \`improvement_note\` dalam gaya bicara kamu yang natural — bisa seneng kalau ada progres, bisa geleng-geleng kalau masih zonk, tapi selalu kasih arahan konkret (misalnya minta aksi spesifik diri sendiri, bukan cuma 'tim kami'). Pakai "kamu", pakai bahasa santai, boleh ekspresif.

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
- improvement_note: 1-2 kalimat dalam gaya bicara Siti yang santai — bandingkan jawaban baru vs lama, apa yang membaik (terutama bukti perilaku nyata), apa yang masih perlu dipoles. Ekspresif, jujur, actionable.
- is_better: true jika jawaban baru lebih baik dari yang lama, false jika tidak`;

      const response = await executeWithKeyRotation('Coaching Practice', async (ai) => {
        const config = {
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
        };

        try {
          return await withRetry(() => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config,
          }));
        } catch {
          return await withRetry(() => ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: prompt,
            config,
          }));
        }
      });

      return NextResponse.json(JSON.parse(response.text || '{}'));
    }

    if (action === 'transcribe') {
      const { base64, mimeType } = body;
      const response = await executeWithKeyRotation('Coaching Transcribe', async (ai) => {
        const contents = [{
          parts: [
            {
              text: "Transkripsi audio berikut dengan akurat. Kembalikan HANYA teks yang diucapkan dalam Bahasa Indonesia, tanpa label, tanpa penjelasan, tanpa tanda kutip pembuka/penutup.",
            },
            {
              inlineData: { mimeType: mimeType || 'audio/webm', data: base64 },
            },
          ],
        }];

        try {
          return await withRetry(() => ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents,
          }));
        } catch {
          return await withRetry(() => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents,
          }));
        }
      });

      return NextResponse.json({ text: (response.text || '').trim() });
    }

    return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 });
  } catch (err: any) {
    console.error('[/api/coaching]', err);
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan pada server coaching.' }, { status: 500 });
  }
}
