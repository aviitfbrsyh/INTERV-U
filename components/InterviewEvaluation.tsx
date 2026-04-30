'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Target, AlertTriangle, CheckCircle, RefreshCcw, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GoogleGenAI } from "@google/genai";
import { CrossMatchData } from '@/lib/cross-match';

interface InterviewEvaluationProps {
  history: string;
  cvText: string;
  jdText: string;
  crossMatchData?: CrossMatchData | null;
  onReset: () => void;
}

export default function InterviewEvaluation({ history, cvText, jdText, crossMatchData, onReset }: InterviewEvaluationProps) {
  const [evaluation, setEvaluation] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateEvaluation = async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

      const callWithRetry = async (prompt: string, retries = 3, delayMs = 5000): Promise<string> => {
        for (let i = 0; i < retries; i++) {
          try {
            const response = await ai.models.generateContent({
              model: "gemini-3-flash-preview",
              contents: prompt,
            });
            return response.text || 'Gagal menghasilkan evaluasi.';
          } catch (err: any) {
            const isRetryable = err?.status === 429 || err?.status === 503
              || err?.message?.includes('429') || err?.message?.includes('503')
              || err?.message?.includes('RESOURCE_EXHAUSTED') || err?.message?.includes('UNAVAILABLE');
            if (!isRetryable || i === retries - 1) throw err;
            await new Promise(res => setTimeout(res, delayMs * (i + 1)));
          }
        }
        throw new Error('Max retries reached');
      };

      try {
        const crossMatchContext = crossMatchData ? `
          HASIL PRE-ANALYSIS CROSS-MATCHING (Gunakan sebagai acuan evaluasi):
          - Skor Kesesuaian Awal: ${crossMatchData.match_score}/100
          - Skills yang Cocok dengan JD: ${crossMatchData.matched_skills.join(', ') || '-'}
          - Skill Gap yang Teridentifikasi: ${crossMatchData.skill_gaps.join(', ') || 'Tidak ada'}
          - Penilaian Pengalaman: ${crossMatchData.experience_verdict}
          - Area yang Seharusnya Digali: ${crossMatchData.focus_areas.join('; ')}
          - Ringkasan Awal: ${crossMatchData.summary}
        ` : '';

        const prompt = `
          Anda adalah LLM-as-a-Judge — seorang HR Expert Senior yang melakukan evaluasi objektif dan terstruktur berdasarkan transkrip wawancara berikut.

          DATA:
          - CV Kandidat: ${cvText}
          - Job Description: ${jdText}
          - Transkrip Wawancara: ${history}
          ${crossMatchContext}

          FORMAT EVALUASI (Gunakan Markdown dengan tepat):

          ## 1. Skor Keseluruhan
          Berikan skor akhir 1–100 beserta justifikasi singkat 2–3 kalimat.

          ## 2. Evaluasi Metrik ConCISE
          ConCISE adalah metrik evaluasi kelugasan komunikasi kandidat. Nilai setiap dimensi dengan skor 1–10 dan berikan penjelasan singkat berbasis bukti dari transkrip.

          Gunakan tabel berikut:

          | Dimensi | Skor (1–10) | Penjelasan Berbasis Transkrip |
          |---|---|---|
          | **Consistency** — Apakah jawaban kandidat konsisten dengan pertanyaan yang diajukan dan tidak keluar dari konteks? | | |
          | **Clarity** — Apakah penyampaian kandidat jelas, tidak bertele-tele, dan mudah dipahami? | | |
          | **Information** — Apakah jawaban mengandung informasi yang cukup dalam dan relevan? | | |
          | **Structure** — Apakah jawaban terstruktur dengan baik (misal mengikuti pola narasi yang logis)? | | |
          | **Effectiveness** — Apakah jawaban efektif menjawab inti pertanyaan pewawancara? | | |

          **Skor ConCISE Total: XX/50** (jumlah kelima dimensi)

          ## 3. Deteksi Pola Narasi STAR
          Untuk setiap jawaban kunci kandidat yang mengandung cerita atau pengalaman, identifikasi komponen STAR yang hadir atau absen secara eksplisit.

          **Panduan deteksi:**
          - **S — Situation**: Kandidat menyebutkan konteks atau latar belakang kejadian
          - **T — Task**: Kandidat menjelaskan tugas atau tantangan yang dihadapi
          - **A — Action**: Kandidat mendeskripsikan tindakan konkret yang diambil
          - **R — Result**: Kandidat menyebutkan hasil, dampak, atau pelajaran dari tindakannya

          Untuk setiap jawaban kunci, gunakan format ini:

          **Pertanyaan: "[kutip pertanyaan pewawancara]"**
          | Komponen | Hadir? | Bukti dari Transkrip |
          |---|---|---|
          | S — Situation | ✓ / ✗ | [kutipan singkat atau "-" jika tidak ada] |
          | T — Task | ✓ / ✗ | [kutipan singkat atau "-" jika tidak ada] |
          | A — Action | ✓ / ✗ | [kutipan singkat atau "-" jika tidak ada] |
          | R — Result | ✓ / ✗ | [kutipan singkat atau "-" jika tidak ada] |
          **Skor STAR jawaban ini: X/4**

          (Ulangi tabel di atas untuk setiap jawaban kunci yang ditemukan di transkrip)

          **Rekapitulasi STAR Keseluruhan:**
          - Total jawaban yang dianalisis: X
          - Rata-rata skor kelengkapan STAR: X/4
          - Komponen yang paling sering absen: [S / T / A / R]
          - Interpretasi: [apakah kandidat cenderung skip konteks, atau skip hasil, dst.]

          ## 4. Analisis Kesesuaian CV-JD
          Berdasarkan skill gap yang teridentifikasi, seberapa baik kandidat mengisi gap tersebut selama wawancara?

          ## 5. Kekuatan Utama
          Minimal 3 poin kekuatan spesifik yang didukung kutipan atau parafrase dari transkrip.

          ## 6. Kelemahan & Area Pengembangan
          Minimal 3 poin kelemahan, fokus pada dimensi ConCISE yang rendah, komponen STAR yang sering absen, dan skill gap yang tidak terjawab.

          ## 7. Feedback Per Pertanyaan
          Analisis singkat untuk setiap pertanyaan kunci: apa yang dijawab dengan baik dan apa yang kurang.

          ## 8. Kesimpulan Akhir
          Rekomendasikan atau tidak? Berikan alasan berbasis data dari evaluasi di atas.

          Gunakan Bahasa Indonesia yang profesional. Setiap penilaian harus didukung bukti dari transkrip, bukan opini umum.
        `;

        const result = await callWithRetry(prompt);
        setEvaluation(result);
      } catch (err) {
        console.error(err);
        setEvaluation('Terjadi kesalahan saat membuat evaluasi.');
      } finally {
        setLoading(false);
      }
    };

    generateEvaluation();
  }, [cvText, jdText, history]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity }
          }}
          className="p-6 bg-slate-900 rounded-[2.5rem] border border-blue-500/30 shadow-2xl shadow-blue-500/10"
        >
          <Target className="w-12 h-12 text-blue-500" />
        </motion.div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-white tracking-tight">Menganalisis Performa...</h3>
          <p className="text-slate-500 font-medium">HR Engine sedang meninjau transkrip & intonasi Anda.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Top Bento Row: Stats & Summary */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-8 bento-accent p-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/40">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Wawancara Selesai</h1>
              <p className="text-blue-300 font-medium uppercase tracking-widest text-[10px] mt-1">Laporan Evaluasi Kandidat #8291</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <button 
              onClick={() => window.print()}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10 flex items-center gap-2 text-sm font-bold"
            >
              <Download size={18} />
              SAVE PDF
            </button>
            <button 
              onClick={onReset}
              className="px-5 py-3 bg-white text-blue-900 rounded-xl hover:bg-slate-100 transition-all shadow-xl shadow-white/10 flex items-center gap-2 text-sm font-bold"
            >
              <RefreshCcw size={18} />
              RETRY
            </button>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 bento-card flex flex-col justify-center items-center text-center p-8 bg-slate-900/60 border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Confidence Match</span>
            <div className="text-4xl font-mono text-emerald-400 font-bold tracking-tighter">SUCCESS</div>
            <div className="mt-4 flex gap-1">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1.5 h-6 bg-emerald-500 rounded-full" />)}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Main Report Column */}
        <div className="col-span-12 lg:col-span-9 space-y-4">
          <section className="bento-card bg-slate-900/40 p-10 border-slate-800/50">
            <div className="prose prose-invert prose-slate max-w-none 
              prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:border-b prose-h2:border-slate-800 prose-h2:pb-4 prose-h2:mb-8
              prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-lg
              prose-strong:text-blue-400 prose-strong:font-black
              prose-ul:list-none prose-ul:pl-0
              prose-li:bg-slate-950/40 prose-li:border prose-li:border-slate-800/50 prose-li:p-4 prose-li:rounded-2xl prose-li:mb-3 prose-li:text-slate-300
              prose-table:w-full prose-table:border-collapse
              prose-th:bg-blue-600/10 prose-th:p-4 prose-th:text-xs prose-th:uppercase prose-th:tracking-widest prose-th:text-blue-400 prose-th:border prose-th:border-slate-800
              prose-td:p-4 prose-td:border prose-td:border-slate-800 prose-td:text-slate-400
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {evaluation}
              </ReactMarkdown>
            </div>
          </section>
        </div>

        {/* Actionable Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="bento-card bg-emerald-500/5 border-emerald-500/20 p-6 space-y-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-white" size={20} />
            </div>
            <div>
                <h4 className="font-bold text-white uppercase tracking-tighter">Rekomendasi</h4>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    Performa Anda menunjukkan kesiapan teknis yang kuat. Fokus pada narasi kepemimpinan untuk level senior.
                </p>
            </div>
          </div>

          <div className="bento-card bg-amber-500/5 border-amber-500/20 p-6 space-y-4">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                <AlertTriangle className="text-white" size={20} />
            </div>
            <div>
                <h4 className="font-bold text-white uppercase tracking-tighter">Area Fokus</h4>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    Beberapa jawaban terkesan terlalu teknis; cobalah untuk menyeimbangkan dengan dampak bisnis.
                </p>
            </div>
          </div>

          <div className="bento-card bg-blue-500/5 border-blue-500/20 p-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4">Metadata Sesi</h4>
            <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-500">DURASI</span>
                    <span className="text-white">12:44</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-500">SENTIMEN</span>
                    <span className="text-emerald-400">POSITIF</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
