import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { CrossMatchData } from '@/lib/cross-match';

async function callWithRetry(fn: () => Promise<any>, retries = 3, delayMs = 5000): Promise<any> {
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
    const { history, cvText, jdText, crossMatchData } = await request.json() as {
      history: string;
      cvText: string;
      jdText: string;
      crossMatchData?: CrossMatchData | null;
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

    const ai = new GoogleGenAI({ apiKey });

    const crossMatchContext = crossMatchData ? `
HASIL PRE-ANALYSIS CROSS-MATCHING:
- Match Score Awal: ${crossMatchData.match_score}/100
- Skills yang Cocok: ${crossMatchData.matched_skills.join(', ') || '-'}
- Skill Gap: ${crossMatchData.skill_gaps.join(', ') || 'Tidak ada'}
- Penilaian Pengalaman: ${crossMatchData.experience_verdict}
- Area yang Seharusnya Digali: ${crossMatchData.focus_areas.join('; ')}
- Ringkasan Awal: ${crossMatchData.summary}
` : '';

    const prompt = `Anda adalah LLM-as-a-Judge — HR Expert Senior. Lakukan evaluasi mendalam terhadap transkrip wawancara berikut dan hasilkan JSON terstruktur.

DATA:
CV: ${cvText}

JD: ${jdText}

TRANSKRIP WAWANCARA:
${history}
${crossMatchContext}

INSTRUKSI EVALUASI:

1. Pisahkan transkrip menjadi pasangan TANYA-JAWAB. Setiap pertanyaan dari "AI:" dipasangkan dengan jawaban "User:" yang mengikutinya.

2. Untuk SETIAP pasangan tanya-jawab, berikan analisis lengkap:
   - star: deteksi 4 komponen STAR (Situation/Task/Action/Result), tiap komponen tandai present (true/false) + evidence (kutipan singkat dari jawaban atau "-" jika absen). score = jumlah komponen present (0-4).
   - concise: nilai 5 dimensi ConCISE skor 1-10 + note singkat:
     * consistency: konsistensi jawaban dengan pertanyaan
     * clarity: kejelasan penyampaian
     * information: kedalaman informasi
     * structure: keterstrukturan jawaban
     * effectiveness: efektivitas menjawab inti pertanyaan
     total = jumlah kelima skor (max 50)
   - rating: skor keseluruhan jawaban ini (1-10)
   - suggestion: saran perbaikan KONKRET untuk jawaban ini, mulai dengan "Harusnya..." atau "Coba..." dalam 1-2 kalimat
   - hack: tips/trik singkat untuk wawancara berikutnya, mulai dengan kata kunci aksi seperti "Mulai dengan...", "Sebutkan angka...", "Gunakan format STAR...", dll. Maksimal 1 kalimat tegas.
   - better_answer_example: contoh jawaban yang lebih baik untuk pertanyaan ini, ditulis dalam gaya kandidat (gunakan saya/aku), 2-4 kalimat maksimal

3. cv_jd_match: analisis seberapa baik kandidat menjawab gap CV-JD selama wawancara
   - matched_skills_in_interview: skill yang TERBUKTI dari CV muncul di jawaban
   - skill_gaps_addressed: gap yang berhasil dijawab kandidat
   - skill_gaps_unaddressed: gap yang TIDAK terjawab atau dijawab buruk
   - assessment: kesimpulan 2-3 kalimat

4. overall_score: skor akhir 1-100
5. overall_summary: ringkasan 2-3 kalimat performa keseluruhan
6. candidate_archetype: KATEGORIKAN kandidat ini berdasarkan POLA ConCISE keseluruhan dari semua jawabannya. Pilih SATU yang paling sesuai:
   - "star_performer" → label "The Star Performer (Jawara Sejati)" → semua dimensi 8+, kandidat ideal
   - "solid_performer" → label "The Solid Performer (Cukup Solid)" → rata-rata 6-7, bagus tapi belum istimewa
   - "smooth_talker" → label "The Smooth Talker (Manis Bicara, Substansi Tipis)" → Clarity & Structure tinggi tapi Information & Consistency rendah → "jago ngomong tapi gak bisa kerja"
   - "rambler" → label "The Rambler (Tukang Bertele-tele)" → Clarity & Effectiveness rendah, banyak ngomong tapi inti tidak sampai
   - "inconsistent" → label "The Inconsistent (Plinplan)" → Consistency rendah, jawaban kontradiksi
   - "vague" → label "The Vague (Generik & Dangkal)" → Information & Effectiveness rendah, jawaban klise
   - "disorganized" → label "The Disorganized (Tidak Terstruktur)" → Structure rendah, loncat-loncat topik
   - "robotic" → label "The Robotic (Hapal Template)" → Structure tinggi tapi Clarity rendah, terdengar dihapal
   - "dodger" → label "The Dodger (Pengelak)" → Effectiveness & Consistency rendah, mengalihkan topik
   - "underconfident" → label "The Underconfident (Pemalu)" → Information rendah, jawaban pendek-pendek
   - "show_off" → label "The Show-Off (Pamer)" → Information tinggi tapi Effectiveness rendah, banyak namedrop tidak relevan

   Untuk archetype yang dipilih, isi:
   - type: kode archetype (e.g., "smooth_talker")
   - label: label lengkap di atas
   - description: 2-3 kalimat menjelaskan pola perilaku kandidat di wawancara ini
   - warning_level: "positive" (untuk star/solid), "neutral" (robotic/underconfident), "warning" (rambler/inconsistent/vague/disorganized/show_off), atau "critical" (smooth_talker/dodger)
   - key_evidence: 2-3 bukti spesifik dari jawaban yang menunjukkan pola ini
   - hr_perspective: 1-2 kalimat dari sudut pandang HR — apa yang HR pikirkan tentang kandidat ini, ditulis dalam gaya internal note yang jujur

7. strengths & weaknesses: minimal 3 poin masing-masing, spesifik
8. final_recommendation: rekomendasi akhir 2-3 kalimat
9. recommendation_verdict: salah satu dari: "recommended", "conditional", "not_recommended"

PENTING:
- Gunakan Bahasa Indonesia profesional
- Setiap analisis HARUS berbasis bukti dari transkrip
- Suggestion dan hack harus AKSI YANG BISA LANGSUNG DIPRAKTIKKAN
- Jika transkrip kosong atau sangat pendek, tetap buat array qa_analysis dengan minimal 1 entri menunjukkan bahwa wawancara tidak cukup data`;

    const response = await callWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overall_score: { type: Type.NUMBER },
            overall_summary: { type: Type.STRING },
            candidate_archetype: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                label: { type: Type.STRING },
                description: { type: Type.STRING },
                warning_level: { type: Type.STRING },
                key_evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
                hr_perspective: { type: Type.STRING },
              },
              required: ["type", "label", "description", "warning_level", "key_evidence", "hr_perspective"],
            },
            qa_analysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
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
                  suggestion: { type: Type.STRING },
                  hack: { type: Type.STRING },
                  better_answer_example: { type: Type.STRING },
                },
                required: ["question", "answer", "star", "concise", "rating", "suggestion", "hack", "better_answer_example"],
              },
            },
            cv_jd_match: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                matched_skills_in_interview: { type: Type.ARRAY, items: { type: Type.STRING } },
                skill_gaps_addressed: { type: Type.ARRAY, items: { type: Type.STRING } },
                skill_gaps_unaddressed: { type: Type.ARRAY, items: { type: Type.STRING } },
                assessment: { type: Type.STRING },
              },
              required: ["score", "matched_skills_in_interview", "skill_gaps_addressed", "skill_gaps_unaddressed", "assessment"],
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            final_recommendation: { type: Type.STRING },
            recommendation_verdict: { type: Type.STRING },
          },
          required: ["overall_score", "overall_summary", "candidate_archetype", "qa_analysis", "cv_jd_match", "strengths", "weaknesses", "final_recommendation", "recommendation_verdict"],
        },
      },
    }));

    return NextResponse.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.error('[/api/evaluate]', err);
    return NextResponse.json({ error: err.message ?? 'Evaluation failed' }, { status: 500 });
  }
}
