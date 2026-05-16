'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy, Target, AlertTriangle, CheckCircle, RefreshCcw, Download,
  MessageSquare, User, Sparkles, Lightbulb, Zap, TrendingUp,
  FileSearch, ListChecks, X, Check, Volume2, Pause, Edit3,
  Send, Loader2, MessageCircle, Mic, Square, Info
} from 'lucide-react';
import { CrossMatchData } from '@/lib/cross-match';
import { runEvaluation, EvaluationData as EvaluationDataType, QAAnalysis as QAAnalysisType, CandidateArchetype as CandidateArchetypeType } from '@/lib/evaluate';
import { retryAnswer, RetryResult } from '@/lib/practice-retry';
import { askSiti, ChatMessage } from '@/lib/coaching-chat';
import { generateSitiSpeech, generateSitiHighlight } from '@/lib/gemini-tts';
import { transcribeAudio } from '@/lib/voice-transcribe';
import { detectFillers, fillerLevelMeta } from '@/lib/filler-words';
import CoachingLive, { LiveTranscript } from '@/components/CoachingLive';
import { generateEvaluationReport } from '@/lib/generate-report';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type QAAnalysis = QAAnalysisType;
type CandidateArchetype = CandidateArchetypeType;
type EvaluationData = EvaluationDataType;

interface InterviewEvaluationProps {
  history: string;
  cvText: string;
  jdText: string;
  crossMatchData?: CrossMatchData | null;
  onReset: () => void;
  prefetchedEvaluation?: EvaluationData | null;
  isPrefetching?: boolean;
  prefetchError?: string | null;
}

export default function InterviewEvaluation({
  history, cvText, jdText, crossMatchData, onReset,
  prefetchedEvaluation, isPrefetching, prefetchError,
}: InterviewEvaluationProps) {
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(prefetchedEvaluation ?? null);
  const [loading, setLoading] = useState(prefetchedEvaluation ? false : true);
  const [error, setError] = useState<string | null>(prefetchError ?? null);
  const [activeTab, setActiveTab] = useState<'interview' | 'cvmatch'>('interview');
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (prefetchedEvaluation) {
      setEvaluation(prefetchedEvaluation);
      setLoading(false);
      setError(null);
      return;
    }
    if (prefetchError) {
      setError(prefetchError);
      setLoading(false);
      return;
    }
    if (isPrefetching) {
      setLoading(true);
      return;
    }

    const generateEvaluation = async () => {
      try {
        const result = await runEvaluation(history, cvText, jdText, crossMatchData);
        setEvaluation(result);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'Terjadi kesalahan saat membuat evaluasi.');
      } finally {
        setLoading(false);
      }
    };

    generateEvaluation();
  }, [prefetchedEvaluation, isPrefetching, prefetchError, cvText, jdText, history, crossMatchData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
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
          <p className="text-slate-500 font-medium">HR Engine sedang membedah setiap jawaban Anda dengan metrik ConCISE & STAR.</p>
        </div>
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center max-w-md mx-auto">
        <div className="p-6 bg-red-500/10 rounded-[2rem] border border-red-500/30">
          <AlertTriangle className="w-12 h-12 text-red-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">Gagal Membuat Evaluasi</h3>
          <p className="text-slate-400 text-sm">{error || 'Data tidak tersedia.'}</p>
        </div>
        <button
          onClick={onReset}
          className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-all"
        >
          Mulai Ulang
        </button>
      </div>
    );
  }

  const verdictColor = {
    recommended: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    conditional: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    not_recommended: 'text-red-400 bg-red-500/10 border-red-500/30',
  }[evaluation.recommendation_verdict] || 'text-slate-400 bg-slate-500/10 border-slate-500/30';

  const verdictLabel = {
    recommended: 'Direkomendasikan',
    conditional: 'Bersyarat',
    not_recommended: 'Belum Direkomendasikan',
  }[evaluation.recommendation_verdict] || 'Belum Dievaluasi';

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* HEADER */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 flex items-center justify-between border border-blue-400/20 shadow-2xl shadow-blue-900/40">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Laporan Evaluasi Wawancara</h1>
              <p className="text-blue-200 font-medium uppercase tracking-widest text-[10px] mt-1">
                Powered by LLM-as-a-Judge · ConCISE Metric · STAR Detection
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => generateEvaluationReport(evaluation, cvText, jdText)}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/20 flex items-center gap-2 text-sm font-bold"
            >
              <Download size={16} />
              PDF
            </button>

            <button
              onClick={onReset}
              className="px-4 py-3 bg-white text-blue-900 rounded-xl hover:bg-slate-100 transition-all shadow-xl flex items-center gap-2 text-sm font-bold"
            >
              <RefreshCcw size={16} />
              Ulang
            </button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-[2rem] p-8 flex flex-col justify-center items-center text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Skor Keseluruhan</span>
          <div className={`text-6xl font-black tracking-tighter ${evaluation.overall_score >= 80 ? 'text-emerald-400' : evaluation.overall_score >= 60 ? 'text-blue-400' : evaluation.overall_score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
            {evaluation.overall_score}
          </div>
          <div className="text-xs text-slate-500 font-mono mt-1">/ 100</div>
          <div className={`mt-4 px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${verdictColor}`}>
            {verdictLabel}
          </div>
        </div>
      </div>

      {/* OVERALL SUMMARY */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">Ringkasan Performa</h3>
            <p className="text-slate-300 leading-relaxed">{evaluation.overall_summary}</p>
          </div>
        </div>
      </div>

      {/* FILLER AGGREGATE */}
      {(() => {
        const all = evaluation.qa_analysis.map(q => detectFillers(q.answer));
        const totalFillers = all.reduce((s, r) => s + r.total, 0);
        const worstIdx = all.reduce((best, r, i) => r.total > all[best].total ? i : best, 0);
        const allWords: Record<string, number> = {};
        all.forEach(r => r.found.forEach(f => { allWords[f.word] = (allWords[f.word] ?? 0) + f.count; }));
        const topWords = Object.entries(allWords).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const overallLevel = totalFillers === 0 ? 'clean' : totalFillers <= evaluation.qa_analysis.length * 2 ? 'minimal' : totalFillers <= evaluation.qa_analysis.length * 5 ? 'moderate' : 'heavy';
        const meta = fillerLevelMeta[overallLevel];
        return (
          <div className={`border rounded-2xl p-4 ${meta.bg} ${meta.border}`}>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${meta.color}`}>
                🗣 Analisis Filler Word
                <FillerInfoPopover />
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${meta.color} ${meta.bg} ${meta.border}`}>
                {totalFillers === 0 ? 'Bersih ✓' : `${totalFillers} total · ${meta.label}`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-black/20 rounded-xl p-3 text-center">
                <div className={`text-2xl font-black ${meta.color}`}>{totalFillers}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Total filler semua jawaban</div>
              </div>
              <div className="bg-black/20 rounded-xl p-3 text-center">
                <div className={`text-2xl font-black ${meta.color}`}>{(totalFillers / evaluation.qa_analysis.length).toFixed(1)}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Rata-rata per jawaban</div>
              </div>
            </div>
            {topWords.length > 0 && (
              <div>
                <p className="text-[10px] text-slate-500 mb-1.5">Filler paling sering dipakai:</p>
                <div className="flex flex-wrap gap-1.5">
                  {topWords.map(([word, count]) => (
                    <span key={word} className="px-2 py-0.5 bg-black/25 rounded-full text-[10px] font-mono font-bold text-slate-300">
                      &ldquo;{word}&rdquo; <span className="text-slate-500">×{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {totalFillers === 0 && (
              <p className={`text-[11px] ${meta.color}`}>Tidak ada filler word terdeteksi di semua jawaban — komunikasi sangat bersih dan profesional.</p>
            )}
            {totalFillers > 0 && (
              <p className={`text-[11px] mt-2 ${meta.color}`}>Jawaban #{worstIdx + 1} memiliki filler terbanyak ({all[worstIdx].total}×) — perlu perhatian lebih saat latihan.</p>
            )}
          </div>
        );
      })()}

      {/* TAB SWITCHER */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-1.5 inline-flex gap-1">
        <button
          onClick={() => setActiveTab('interview')}
          className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
            activeTab === 'interview'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare size={16} />
          Analisis Wawancara
        </button>
        <button
          onClick={() => setActiveTab('cvmatch')}
          className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
            activeTab === 'cvmatch'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileSearch size={16} />
          Kesesuaian CV vs JD
        </button>
      </div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        {activeTab === 'interview' ? (
          <motion.div
            key="interview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <InterviewAnalysisView evaluation={evaluation} />
          </motion.div>
        ) : (
          <motion.div
            key="cvmatch"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <CVMatchView evaluation={evaluation} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING CHAT BUTTON */}
      {!chatOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-5 py-4 rounded-full shadow-2xl shadow-blue-900/50 flex items-center gap-3 font-bold border-2 border-blue-400/30 hover:shadow-blue-500/40 transition-shadow"
        >
          <div className="relative">
            <MessageCircle size={22} />
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-blue-700"
            />
          </div>
          <span className="hidden sm:inline">Tanya Siti</span>
        </motion.button>
      )}

      {/* COACHING CHAT PANEL */}
      <CoachingChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        evaluation={evaluation}
        history={history}
        cvText={cvText}
        jdText={jdText}
        crossMatchData={crossMatchData}
      />
    </div>
  );
}

// =================== INTERVIEW ANALYSIS VIEW ===================
function InterviewAnalysisView({ evaluation }: { evaluation: EvaluationData }) {
  if (!evaluation.qa_analysis || evaluation.qa_analysis.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-12 text-center">
        <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">Tidak ada data percakapan yang dapat dianalisis.</p>
      </div>
    );
  }

  // Aggregate ConCISE averages
  const avgConcise = {
    consistency: evaluation.qa_analysis.reduce((s, q) => s + q.concise.consistency.score, 0) / evaluation.qa_analysis.length,
    clarity: evaluation.qa_analysis.reduce((s, q) => s + q.concise.clarity.score, 0) / evaluation.qa_analysis.length,
    information: evaluation.qa_analysis.reduce((s, q) => s + q.concise.information.score, 0) / evaluation.qa_analysis.length,
    structure: evaluation.qa_analysis.reduce((s, q) => s + q.concise.structure.score, 0) / evaluation.qa_analysis.length,
    effectiveness: evaluation.qa_analysis.reduce((s, q) => s + q.concise.effectiveness.score, 0) / evaluation.qa_analysis.length,
  };
  const avgStar = evaluation.qa_analysis.reduce((s, q) => s + q.star.score, 0) / evaluation.qa_analysis.length;

  return (
    <>
      {/* AGGREGATE METRICS */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center">
              <ListChecks size={18} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Rata-rata Metrik ConCISE</h3>
              <p className="text-xs text-slate-500">Skor agregat dari semua jawaban</p>
            </div>
          </div>
          <div className="space-y-3.5">
            {[
              { name: 'Consistency', desc: 'Seberapa konsisten jawaban dengan pertanyaan yang diajukan', value: avgConcise.consistency, color: 'bg-blue-500', textColor: 'text-blue-400' },
              { name: 'Clarity', desc: 'Kejelasan penyampaian — apakah mudah dipahami dan tidak ambigu', value: avgConcise.clarity, color: 'bg-cyan-500', textColor: 'text-cyan-400' },
              { name: 'Information', desc: 'Kedalaman & kelengkapan informasi yang diberikan dalam jawaban', value: avgConcise.information, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
              { name: 'Structure', desc: 'Keteraturan alur jawaban — pembukaan, isi, dan penutup yang rapi', value: avgConcise.structure, color: 'bg-amber-500', textColor: 'text-amber-400' },
              { name: 'Effectiveness', desc: 'Seberapa tepat jawaban menyasar inti pertanyaan HR', value: avgConcise.effectiveness, color: 'bg-pink-500', textColor: 'text-pink-400' },
            ].map((m) => {
              const scoreColor = m.value >= 8 ? m.textColor : m.value >= 6 ? 'text-slate-300' : m.value >= 4 ? 'text-amber-400' : 'text-red-400';
              return (
                <div key={m.name} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300">{m.name}</span>
                    <span className={`text-xs font-mono font-bold ${scoreColor}`}>{m.value.toFixed(1)} / 10</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.value * 10}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full ${m.color} rounded-full`}
                    />
                  </div>
                  <p className="text-[10px] text-slate-600 italic leading-snug">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Rata-rata Skor STAR</h3>
              <p className="text-xs text-slate-500">Kelengkapan struktur narasi</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-6">
            <div className="relative">
              <svg className="w-32 h-32 -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="none" className="text-slate-800" />
                <motion.circle
                  cx="64" cy="64" r="56"
                  stroke="currentColor" strokeWidth="10" fill="none"
                  strokeLinecap="round"
                  className="text-amber-500"
                  initial={{ strokeDasharray: '0 352' }}
                  animate={{ strokeDasharray: `${(avgStar / 4) * 352} 352` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{avgStar.toFixed(1)}</span>
                <span className="text-xs text-slate-500 font-mono">/ 4</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 text-center leading-relaxed">
            {avgStar >= 3 ? 'Narasi sangat lengkap — Anda secara konsisten menyampaikan konteks, aksi, dan hasil.'
              : avgStar >= 2 ? 'Narasi cukup — namun beberapa komponen STAR masih sering terlewat.'
                : 'Narasi kurang lengkap — banyak jawaban yang melewatkan komponen kunci STAR.'}
          </p>
        </div>
      </div>

      {/* CANDIDATE ARCHETYPE CARD */}
      <ArchetypeCard archetype={evaluation.candidate_archetype} />

      {/* PER-QUESTION ANALYSIS */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
            <MessageSquare size={18} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Analisis Per Pertanyaan</h2>
            <p className="text-sm text-slate-500">{evaluation.qa_analysis.length} pasang tanya-jawab dianalisis</p>
          </div>
        </div>

        {evaluation.qa_analysis.map((qa, idx) => (
          <QACard key={idx} qa={qa} index={idx + 1} />
        ))}
      </div>

      {/* STRENGTHS & WEAKNESSES */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-white" size={18} />
            </div>
            <h3 className="text-lg font-bold text-white">Kekuatan Anda</h3>
          </div>
          <ul className="space-y-2">
            {evaluation.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300 leading-relaxed">
                <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-12 md:col-span-6 bg-amber-500/5 border border-amber-500/20 rounded-[2rem] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <AlertTriangle className="text-white" size={18} />
            </div>
            <h3 className="text-lg font-bold text-white">Area Pengembangan</h3>
          </div>
          <ul className="space-y-2">
            {evaluation.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300 leading-relaxed">
                <AlertTriangle size={14} className="text-amber-400 mt-1 shrink-0" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* FINAL RECOMMENDATION — ALERT STYLE */}
      <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-rose-800 border-2 border-red-400/60 rounded-[2rem] p-8 overflow-hidden shadow-2xl shadow-red-900/50">
        {/* Pulsing background accent */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -right-20 w-64 h-64 bg-red-400 rounded-full blur-3xl pointer-events-none"
        />

        {/* Alert stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/80 to-transparent" />

        <div className="relative flex items-start gap-4">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-yellow-500/60 ring-2 ring-yellow-300/50"
          >
            <AlertTriangle className="text-black fill-yellow-400" size={24} strokeWidth={2.5} />
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-100">Rekomendasi Akhir HR</h3>
              <span className="text-[9px] font-bold uppercase tracking-widest text-white bg-white/20 border border-white/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
                Penting
              </span>
            </div>
            <p className="text-white leading-relaxed text-lg font-medium drop-shadow-sm">{evaluation.final_recommendation}</p>
          </div>
        </div>
      </div>
    </>
  );
}

// =================== COACHING CHAT PANEL ===================
function CoachingChatPanel({
  open,
  onClose,
  evaluation,
  history,
  cvText,
  jdText,
  crossMatchData,
}: {
  open: boolean;
  onClose: () => void;
  evaluation: EvaluationData;
  history: string;
  cvText: string;
  jdText: string;
  crossMatchData?: CrossMatchData | null;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [liveActive, setLiveActive] = useState(false);
  const [voicePersona, setVoicePersona] = useState<'santai' | 'mock'>('santai');
  const [liveHistorySantai, setLiveHistorySantai] = useState<LiveTranscript[]>([]);
  const [liveHistoryMock, setLiveHistoryMock] = useState<LiveTranscript[]>([]);
  const [audioMap, setAudioMap] = useState<Record<number, string>>({});
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [loadingTtsIdx, setLoadingTtsIdx] = useState<number | null>(null);

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Reset history of the persona being switched AWAY from, so next session starts fresh
  useEffect(() => {
    setLiveHistorySantai([]);
    setLiveHistoryMock([]);
  }, [voicePersona]);

  const evaluationContext = `
==== DOKUMEN KANDIDAT ====
CV KANDIDAT:
${cvText}

JOB DESCRIPTION YANG DILAMAR:
${jdText}

==== HASIL PRE-ANALYSIS CV vs JD ====
${crossMatchData ? `Match Score Awal: ${crossMatchData.match_score}/100
Skills Cocok: ${crossMatchData.matched_skills.join(', ') || '-'}
Skill Gap: ${crossMatchData.skill_gaps.join(', ') || 'Tidak ada'}
Penilaian Pengalaman: ${crossMatchData.experience_verdict}
Area yang Seharusnya Digali: ${crossMatchData.focus_areas.join('; ')}
Ringkasan: ${crossMatchData.summary}` : 'Tidak tersedia'}

==== TRANSKRIP WAWANCARA LENGKAP ====
${history}

==== HASIL EVALUASI ====
Skor Keseluruhan: ${evaluation.overall_score}/100
Verdict: ${evaluation.recommendation_verdict}
Ringkasan: ${evaluation.overall_summary}

Profil Komunikasi: ${evaluation.candidate_archetype.label} (${evaluation.candidate_archetype.type})
Deskripsi: ${evaluation.candidate_archetype.description}
Warning Level: ${evaluation.candidate_archetype.warning_level}
Bukti Kunci: ${evaluation.candidate_archetype.key_evidence.join('; ')}
Perspektif HR: ${evaluation.candidate_archetype.hr_perspective}

Kekuatan: ${evaluation.strengths.join(' | ')}
Kelemahan: ${evaluation.weaknesses.join(' | ')}

CV-JD Match Score: ${evaluation.cv_jd_match.score}/100
Skills Terbukti di Interview: ${evaluation.cv_jd_match.matched_skills_in_interview.join(', ') || '-'}
Skill Gap Sudah Dijawab: ${evaluation.cv_jd_match.skill_gaps_addressed.join(', ') || '-'}
Skill Gap Belum Terjawab: ${evaluation.cv_jd_match.skill_gaps_unaddressed.join(', ') || 'Tidak ada'}
Asesmen Match: ${evaluation.cv_jd_match.assessment}

Rekomendasi Final: ${evaluation.final_recommendation}

==== ANALISIS PER PERTANYAAN ====
${evaluation.qa_analysis.map((qa, i) => `
--- PERTANYAAN ${i + 1} ---
Pertanyaan: ${qa.question}
Jawaban Kandidat: ${qa.answer}
Rating: ${qa.rating}/10

STAR Framework (${qa.star.score}/4):
- Situation: ${qa.star.situation.present ? '✓' : '✗'} — ${qa.star.situation.evidence}
- Task: ${qa.star.task.present ? '✓' : '✗'} — ${qa.star.task.evidence}
- Action: ${qa.star.action.present ? '✓' : '✗'} — ${qa.star.action.evidence}
- Result: ${qa.star.result.present ? '✓' : '✗'} — ${qa.star.result.evidence}

ConCISE Metrics (Total: ${qa.concise.total}/50):
- Consistency ${qa.concise.consistency.score}/10: ${qa.concise.consistency.note}
- Clarity ${qa.concise.clarity.score}/10: ${qa.concise.clarity.note}
- Information ${qa.concise.information.score}/10: ${qa.concise.information.note}
- Structure ${qa.concise.structure.score}/10: ${qa.concise.structure.note}
- Effectiveness ${qa.concise.effectiveness.score}/10: ${qa.concise.effectiveness.note}

Saran Perbaikan: ${qa.suggestion}
Hack Kunci: ${qa.hack}
Contoh Jawaban Lebih Baik: ${qa.better_answer_example}
`).join('\n')}
`.trim();

  const suggestedQuestions = [
    'Kenapa rating aku rendah? Spesifik dong!',
    'Apa yang paling urgent harus aku perbaiki sekarang?',
    'Kasih contoh jawaban yang lebih baik untuk pertanyaan terlemahku',
    'Gimana cara aku menonjolkan kekuatan di interview asli?',
    'Skill gap aku yang mana yang paling bahaya?',
  ];

  const playAudio = (url: string, idx: number) => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (playingIdx === idx) { setPlayingIdx(null); return; }
    const audio = new Audio(url);
    currentAudioRef.current = audio;
    setPlayingIdx(idx);
    audio.onended = () => { setPlayingIdx(null); currentAudioRef.current = null; };
    audio.play();
  };

  const handleSend = async (questionText?: string, withVoiceReply = false) => {
    const text = (questionText ?? input).trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = { role: 'user', text };
    const msgsBefore = [...messages, userMsg];
    const sitiIdx = msgsBefore.length;

    setMessages(msgsBefore);
    setInput('');
    setSending(true);
    setError(null);

    try {
      const reply = await askSiti(text, evaluationContext, msgsBefore);
      setMessages(prev => [...prev, { role: 'siti', text: reply }]);

      if (withVoiceReply || inputMode === 'voice') {
        try {
          const url = await generateSitiSpeech(reply);
          setAudioMap(prev => ({ ...prev, [sitiIdx]: url }));
          const audio = new Audio(url);
          currentAudioRef.current = audio;
          setPlayingIdx(sitiIdx);
          audio.onended = () => { setPlayingIdx(null); currentAudioRef.current = null; };
          audio.play();
        } catch { /* TTS gagal, teks tetap tampil */ }
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal mendapat respons. Coba lagi ya.');
    } finally {
      setSending(false);
    }
  };


  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[500px] bg-slate-950 border-l border-slate-800 z-50 flex flex-col shadow-2xl"
          >
            {/* ── Header ── */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 border-b border-blue-500/30 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 relative">
                    <Sparkles size={20} className="text-white" />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold tracking-tight">Siti Rahayu</h3>
                    <p className="text-blue-200 text-xs">Penasihat karir · Online</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-colors cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-1.5 bg-black/20 rounded-xl p-1 backdrop-blur-sm">
                <button
                  onClick={() => setInputMode('text')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                    inputMode === 'text' ? 'bg-white text-blue-700 shadow-md' : 'text-blue-200 hover:text-white'
                  }`}
                >
                  <Edit3 size={13} />
                  Ketik
                </button>
                <button
                  onClick={() => { setInputMode('voice'); setError(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                    inputMode === 'voice' ? 'bg-white text-blue-700 shadow-md' : 'text-blue-200 hover:text-white'
                  }`}
                >
                  <Mic size={13} />
                  Suara
                </button>
              </div>
            </div>

            {/* ── LIVE VOICE MODE (full panel takeover) ── */}
            {inputMode === 'voice' && liveActive && (
              <div className="flex-1 overflow-hidden">
                <CoachingLive
                  evaluationContext={evaluationContext}
                  persona={voicePersona}
                  previousTranscripts={
                    voicePersona === 'mock' ? liveHistoryMock : liveHistorySantai
                  }
                  onEnd={(newTranscripts, interrupted) => {
                    if (voicePersona === 'mock') {
                      if (interrupted) setLiveHistoryMock(prev => [...prev, ...newTranscripts]);
                      else setLiveHistoryMock([]);
                    } else {
                      if (interrupted) setLiveHistorySantai(prev => [...prev, ...newTranscripts]);
                      else setLiveHistorySantai([]);
                    }
                    setLiveActive(false);
                  }}
                />
              </div>
            )}

            {/* ── VOICE MODE — not yet started ── */}
            {inputMode === 'voice' && !liveActive && (
              <div className="flex-1 flex flex-col items-center justify-center gap-5 p-6">
                <div className="text-center space-y-1">
                  <h4 className="text-white font-bold text-sm">Pilih Mode Konsultasi</h4>
                  <p className="text-slate-500 text-xs">Siti akan merespons langsung via suara, real-time</p>
                </div>

                {/* Mode cards */}
                <div className="w-full space-y-3 max-w-xs">
                  <button
                    onClick={() => setVoicePersona('santai')}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      voicePersona === 'santai'
                        ? 'bg-blue-600/15 border-blue-500/60'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-0.5">😊</span>
                      <div>
                        <p className="text-white font-bold text-xs">Santai & Kasual</p>
                        <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">Ngobrol bebas kayak teman. Siti ekspresif, hangat, pakai bahasa sehari-hari.</p>
                      </div>
                      {voicePersona === 'santai' && <Check size={14} className="text-blue-400 ml-auto shrink-0 mt-0.5" />}
                    </div>
                  </button>

                  <button
                    onClick={() => setVoicePersona('mock')}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      voicePersona === 'mock'
                        ? 'bg-violet-500/10 border-violet-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-0.5">🎯</span>
                      <div>
                        <p className="text-white font-bold text-xs">Mock Interview</p>
                        <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">Siti jadi interviewer — nanya ulang pertanyaan terlemahmu. Jawab langsung, dapat feedback real-time.</p>
                      </div>
                      {voicePersona === 'mock' && <Check size={14} className="text-violet-400 ml-auto shrink-0 mt-0.5" />}
                    </div>
                  </button>
                </div>

                <button
                  onClick={() => setLiveActive(true)}
                  className={`px-8 py-3.5 font-bold rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-2 text-white ${
                    voicePersona === 'mock'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 shadow-violet-900/40'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 shadow-blue-900/40'
                  }`}
                >
                  <Mic size={16} />
                  {voicePersona === 'mock' ? 'Mulai Mock Interview' : 'Mulai Konsultasi'}
                </button>
                <p className="text-[10px] text-slate-700">Pastikan mikrofon sudah aktif</p>
              </div>
            )}

            {/* ── TEXT MODE — Messages ── */}
            {inputMode === 'text' && (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {messages.length === 0 && (
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                          <Sparkles size={14} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-slate-800/70 border border-slate-700 rounded-2xl rounded-tl-sm p-4 text-slate-200 text-sm leading-relaxed">
                            Hei! Aku udah baca semua hasil interview kamu nih. Mau bahas yang mana dulu? Boleh tanya apapun — mau minta contoh jawaban, penjelasan skor, atau tips langsung buat persiapan interview berikutnya. Aku di sini!
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 pt-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Mau mulai dari mana?</p>
                        {suggestedQuestions.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(q)}
                            disabled={sending}
                            className="w-full text-left p-3 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-xl text-sm text-slate-400 hover:text-white transition-all disabled:opacity-40 leading-snug"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((m, i) => {
                    const isSiti = m.role === 'siti';
                    const hasAudio = audioMap[i] !== undefined;
                    return (
                      <div key={i} className={`flex gap-2.5 ${isSiti ? '' : 'flex-row-reverse'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                          isSiti ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                        }`}>
                          {isSiti ? <Sparkles size={13} className="text-white" /> : <User size={13} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className={`p-3.5 text-sm leading-relaxed ${
                            isSiti
                              ? 'bg-slate-800/70 border border-slate-700 rounded-2xl rounded-tl-sm text-slate-200'
                              : 'bg-blue-600/25 border border-blue-500/30 rounded-2xl rounded-tr-sm text-slate-100'
                          }`}>
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                                em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
                                ul: ({ children }) => <ul className="mt-1.5 mb-2 space-y-1 pl-4 list-disc marker:text-slate-500">{children}</ul>,
                                ol: ({ children }) => <ol className="mt-1.5 mb-2 space-y-1.5 pl-4 list-decimal marker:text-slate-400 marker:font-bold">{children}</ol>,
                                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                code: ({ children }) => <code className="px-1.5 py-0.5 bg-black/30 rounded text-xs font-mono text-blue-300">{children}</code>,
                                blockquote: ({ children }) => <blockquote className="border-l-2 border-blue-500/50 pl-3 italic text-slate-400 my-2">{children}</blockquote>,
                              }}
                            >
                              {m.text}
                            </ReactMarkdown>
                          </div>
                          {isSiti && (
                            <div className="flex items-center gap-2 pl-1">
                              {hasAudio ? (
                                <button
                                  onClick={() => playAudio(audioMap[i], i)}
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                    playingIdx === i
                                      ? 'bg-blue-600/30 border border-blue-500/50 text-blue-300'
                                      : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {playingIdx === i ? <><Pause size={10} /> Pause</> : <><Volume2 size={10} /> Dengarkan</>}
                                </button>
                              ) : (
                                <button
                                  disabled={loadingTtsIdx !== null}
                                  onClick={async () => {
                                    if (loadingTtsIdx !== null) return;
                                    setLoadingTtsIdx(i);
                                    try {
                                      const url = await generateSitiSpeech(m.text);
                                      setAudioMap(prev => ({ ...prev, [i]: url }));
                                      playAudio(url, i);
                                    } catch { /* ignore */ } finally {
                                      setLoadingTtsIdx(null);
                                    }
                                  }}
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                                    loadingTtsIdx === i
                                      ? 'bg-blue-600/20 border-blue-500/40 text-blue-300 cursor-wait'
                                      : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed'
                                  }`}
                                >
                                  {loadingTtsIdx === i
                                    ? <><Loader2 size={10} className="animate-spin" /> Memuat suara...</>
                                    : <><Volume2 size={10} /> Dengar Suara Siti</>}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {sending && (
                    <div className="flex gap-2.5">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shrink-0">
                        <Sparkles size={13} className="text-white" />
                      </div>
                      <div className="bg-slate-800/70 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 inline-flex items-center gap-2">
                        <div className="flex gap-1">
                          {[0, 1, 2].map(j => (
                            <motion.div key={j} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: j * 0.15 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                          ))}
                        </div>
                        <span className="text-xs text-slate-400">Siti lagi mikir...</span>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-300 flex items-start gap-2">
                      <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>

                {/* Text Input */}
                <div className="border-t border-slate-800 p-4 bg-slate-950 shrink-0">
                  <div className="flex gap-2">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                      }}
                      disabled={sending}
                      placeholder="Tanya Siti apapun tentang hasil interviewmu..."
                      rows={2}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none resize-none min-h-[56px] max-h-32 leading-relaxed"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || sending}
                      className="w-12 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all shrink-0"
                    >
                      {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-700 mt-2 text-center">Enter kirim · Shift+Enter baris baru</p>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// =================== ARCHETYPE CARD ===================
function ArchetypeCard({ archetype }: { archetype: CandidateArchetype }) {
  const styles = {
    positive: {
      gradient: 'from-emerald-600/30 via-green-700/20 to-teal-800/15',
      border: 'border-emerald-500/40',
      shadow: 'shadow-emerald-900/30',
      iconBg: 'bg-emerald-500',
      iconColor: 'text-white',
      labelColor: 'text-emerald-300',
      badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/40',
      badgeText: 'EXCELLENT',
      glowColor: 'bg-emerald-400',
      icon: Trophy,
    },
    neutral: {
      gradient: 'from-slate-600/30 via-slate-700/20 to-slate-800/15',
      border: 'border-slate-500/40',
      shadow: 'shadow-slate-900/30',
      iconBg: 'bg-slate-500',
      iconColor: 'text-white',
      labelColor: 'text-slate-300',
      badgeColor: 'text-slate-300 bg-slate-500/15 border-slate-500/40',
      badgeText: 'NETRAL',
      glowColor: 'bg-slate-400',
      icon: User,
    },
    warning: {
      gradient: 'from-amber-600/30 via-yellow-700/20 to-orange-800/15',
      border: 'border-amber-500/40',
      shadow: 'shadow-amber-900/30',
      iconBg: 'bg-amber-500',
      iconColor: 'text-white',
      labelColor: 'text-amber-300',
      badgeColor: 'text-amber-400 bg-amber-500/15 border-amber-500/40',
      badgeText: 'PERHATIAN',
      glowColor: 'bg-amber-400',
      icon: AlertTriangle,
    },
    critical: {
      gradient: 'from-red-600/30 via-rose-700/20 to-pink-800/15',
      border: 'border-red-500/40',
      shadow: 'shadow-red-900/40',
      iconBg: 'bg-red-500',
      iconColor: 'text-white',
      labelColor: 'text-red-300',
      badgeColor: 'text-red-400 bg-red-500/15 border-red-500/40',
      badgeText: 'CRITICAL',
      glowColor: 'bg-red-400',
      icon: AlertTriangle,
    },
  }[archetype.warning_level] || {
    gradient: 'from-blue-600/30 via-indigo-700/20 to-blue-800/15',
    border: 'border-blue-500/40',
    shadow: 'shadow-blue-900/30',
    iconBg: 'bg-blue-500',
    iconColor: 'text-white',
    labelColor: 'text-blue-300',
    badgeColor: 'text-blue-400 bg-blue-500/15 border-blue-500/40',
    badgeText: 'PROFIL',
    glowColor: 'bg-blue-400',
    icon: User,
  };

  const Icon = styles.icon;

  return (
    <div className={`relative bg-gradient-to-br ${styles.gradient} border-2 ${styles.border} rounded-[2rem] p-8 overflow-hidden shadow-2xl ${styles.shadow}`}>
      {/* Pulsing glow */}
      <motion.div
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute -top-32 -right-32 w-80 h-80 ${styles.glowColor} rounded-full blur-3xl pointer-events-none`}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className={`w-14 h-14 ${styles.iconBg} rounded-2xl flex items-center justify-center shrink-0 shadow-lg`}
          >
            <Icon size={26} className={styles.iconColor} strokeWidth={2.5} />
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Profil Komunikasi Kandidat</span>
              <span className={`text-[9px] font-bold uppercase tracking-widest border px-2 py-0.5 rounded-md ${styles.badgeColor}`}>
                {styles.badgeText}
              </span>
            </div>
            <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${styles.labelColor} leading-tight`}>
              {archetype.label}
            </h2>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-200 leading-relaxed text-base mb-5">
          {archetype.description}
        </p>

        {/* Key Evidence */}
        <div className="bg-black/30 border border-white/10 rounded-2xl p-5 mb-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
            <FileSearch size={12} />
            Bukti Pola dari Wawancara
          </h4>
          <ul className="space-y-2">
            {archetype.key_evidence.map((ev, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300 leading-relaxed">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${styles.iconBg}`} />
                <span>{ev}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* HR Perspective */}
        <div className="bg-black/40 border-l-4 border-white/30 rounded-r-xl p-4 italic">
          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1 not-italic">Catatan HR (Internal)</div>
          <p className="text-slate-300 text-sm leading-relaxed">
            &ldquo;{archetype.hr_perspective}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Helper: buat teks penjelasan Siti dari hasil analisis ──
function buildSitiExplanation(result: RetryResult, origRating: number): string {
  const ratingDiff = result.rating - origRating;
  const parts: string[] = [];

  if (result.is_better && ratingDiff >= 2) {
    parts.push('Nah, ini baru! Kamu dengerin saran tadi ya, kelihatan banget bedanya.');
  } else if (result.is_better) {
    parts.push('Oke, ada perbaikan nih — belum sempurna, tapi arah kamu udah bener.');
  } else {
    parts.push('Hmm, jujur ya — jawaban kamu masih kurang-lebih sama kayak sebelumnya.');
  }

  parts.push(result.improvement_note);

  if (ratingDiff > 0) {
    parts.push(`Rating kamu naik dari ${origRating} ke ${result.rating}. Progres nyata, terusin.`);
  } else if (ratingDiff < 0) {
    parts.push(`Ratingnya malah turun dari ${origRating} ke ${result.rating}. Berarti ada yang keliru di percobaan kedua ini — perlu dicermatin lagi.`);
  } else {
    parts.push(`Rating masih di ${result.rating}. Belum ada pergerakan yang signifikan.`);
  }

  const missingStar = ([
    !result.star.situation.present && 'Situation',
    !result.star.task.present && 'Task',
    !result.star.action.present && 'Action',
    !result.star.result.present && 'Result',
  ] as Array<string | false>).filter(Boolean) as string[];

  if (missingStar.length === 0) {
    parts.push('Yang bikin saya seneng, STAR kamu kali ini lengkap semua. Itu nggak gampang, lho.');
  } else {
    parts.push(`STAR masih ada yang bolong — ${missingStar.join(' sama ')} belum kamu sentuh dengan bukti konkret.`);
  }

  const dims = [
    { label: 'Konsistensi', score: result.concise.consistency.score, note: result.concise.consistency.note },
    { label: 'Kejelasan', score: result.concise.clarity.score, note: result.concise.clarity.note },
    { label: 'Informasi', score: result.concise.information.score, note: result.concise.information.note },
    { label: 'Struktur', score: result.concise.structure.score, note: result.concise.structure.note },
    { label: 'Efektivitas', score: result.concise.effectiveness.score, note: result.concise.effectiveness.note },
  ].sort((a, b) => a.score - b.score);

  if (dims[0].score < 7) {
    parts.push(`Yang paling perlu kamu garap sekarang itu ${dims[0].label.toLowerCase()} — ${dims[0].note}`);
  }

  parts.push(result.is_better
    ? 'Serius deh, tinggal dioles dikit lagi. Kamu bisa.'
    : 'Jangan nyerah ya. Rekam ulang, terapin saran tadi, lihat sendiri bedanya.');

  return parts.join(' ');
}

// =================== FILLER INFO POPOVER ===================
const FILLER_CATEGORIES = [
  {
    label: 'Vokal & Suara',
    icon: '🎙',
    color: 'text-blue-400',
    border: 'border-blue-500/25',
    bg: 'bg-blue-500/8',
    pill: 'bg-blue-500/15 text-blue-300',
    desc: 'Bunyi refleks saat otak sedang mencari kata — membuat kandidat terdengar ragu dan tidak siap.',
    words: ['eh', 'um', 'hmm', 'eee', 'err', 'em'],
  },
  {
    label: 'Kata Pengisi',
    icon: '💬',
    color: 'text-amber-400',
    border: 'border-amber-500/25',
    bg: 'bg-amber-500/8',
    pill: 'bg-amber-500/15 text-amber-300',
    desc: 'Kata tunggal tanpa nilai komunikasi — sering muncul sebagai jeda pikiran yang tidak disadari.',
    words: ['anu', 'kayak', 'semacam', 'yaa'],
  },
  {
    label: 'Frasa Informal',
    icon: '🗣',
    color: 'text-purple-400',
    border: 'border-purple-500/25',
    bg: 'bg-purple-500/8',
    pill: 'bg-purple-500/15 text-purple-300',
    desc: 'Frasa percakapan sehari-hari yang terdengar tidak profesional dalam konteks wawancara kerja.',
    words: ['apa ya', 'gimana ya', 'jadi gini', 'gitu loh', 'ya kan', 'ya gitu', 'gitu deh'],
  },
];

function FillerInfoPopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-4 h-4 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-400 transition-colors"
        aria-label="Info filler word"
      >
        <Info size={13} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 top-7 z-50 w-[520px] bg-[#0f1623] border border-white/10 rounded-2xl shadow-2xl shadow-black/70 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 bg-white/3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/15 border border-blue-500/30 rounded-xl flex items-center justify-center text-base">
                  🎯
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">Deteksi Filler Word</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">17 pola terdeteksi otomatis dari transkrip jawaban</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Why it matters */}
            <div className="px-5 py-3.5 border-b border-white/8 bg-amber-500/5">
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                <span className="font-bold text-amber-300">Mengapa penting?</span>{' '}
                Filler word yang berlebihan memberi kesan kurang percaya diri dan tidak terstruktur — dua hal yang langsung dinilai HR dalam 30 detik pertama wawancara.
              </p>
            </div>

            {/* Categories — horizontal 3 col */}
            <div className="grid grid-cols-3 gap-0 divide-x divide-white/8 px-0">
              {FILLER_CATEGORIES.map(cat => (
                <div key={cat.label} className={`p-4 ${cat.bg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base leading-none">{cat.icon}</span>
                    <span className={`text-[11px] font-bold ${cat.color}`}>{cat.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed mb-3">{cat.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {cat.words.map(w => (
                      <span
                        key={w}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold ${cat.pill}`}
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer tip */}
            <div className="px-5 py-3 border-t border-white/8 bg-white/2 flex items-center gap-2">
              <CheckCircle size={12} className="text-emerald-400 shrink-0" />
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Targetkan <span className="text-emerald-400 font-semibold">0–2 filler</span> per jawaban untuk komunikasi yang terdengar bersih dan profesional.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =================== QA CARD ===================
function QACard({ qa, index }: { qa: QAAnalysis; index: number }) {
  const fillerResult = detectFillers(qa.answer);
  const fillerMeta   = fillerLevelMeta[fillerResult.level];
  const [open, setOpen] = useState(false);
  const [innerTab, setInnerTab] = useState<'chat' | 'analysis' | 'coaching' | 'practice'>('chat');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [practiceText, setPracticeText] = useState('');
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [practiceResult, setPracticeResult] = useState<RetryResult | null>(null);
  const [practiceError, setPracticeError] = useState<string | null>(null);

  // Voice recording state
  const [voiceState, setVoiceState] = useState<'idle' | 'recording' | 'processing' | 'done'>('idle');
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Siti explanation audio (terpisah dari TTS coaching tab)
  const [sitiExplLoading, setSitiExplLoading] = useState(false);
  const [sitiExplPlaying, setSitiExplPlaying] = useState(false);
  const [sitiExplUrl, setSitiExplUrl] = useState<string | null>(null);
  const sitiExplRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!open) { setInnerTab('chat'); }
  }, [open]);

  // Stop recording if user switches away from practice tab
  useEffect(() => {
    if (innerTab !== 'practice' && mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, [innerTab]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) audioRef.current.pause();
      if (sitiExplRef.current) sitiExplRef.current.pause();
    };
  }, []);

  const startRecording = async () => {
    setPracticeError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : '';
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };

      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        setVoiceState('processing');
        try {
          // Step 1: transkripsi suara
          const text = await transcribeAudio(blob);
          // Step 2: langsung analisis (tanpa perlu klik tombol)
          const result = await retryAnswer(qa.question, qa.answer, text);
          setPracticeResult(result);
          setVoiceState('done');
          // Step 3: putar penjelasan Siti otomatis
          playSitiExplanation(result);
        } catch (err: unknown) {
          setPracticeError(err instanceof Error ? err.message : 'Gagal memproses suara Anda.');
          setVoiceState('idle');
        }
      };

      mr.start(1000);
      setVoiceState('recording');
      setRecordSeconds(0);
      timerRef.current = setInterval(() => setRecordSeconds(s => s + 1), 1000);
    } catch {
      setPracticeError('Tidak dapat mengakses mikrofon. Pastikan izin mikrofon sudah diberikan di browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
  };

  const playSitiExplanation = async (result: RetryResult) => {
    setSitiExplLoading(true);
    setSitiExplUrl(null);
    try {
      const text = buildSitiExplanation(result, qa.rating);
      const url = await generateSitiSpeech(text);
      setSitiExplUrl(url);
      const audio = new Audio(url);
      sitiExplRef.current = audio;
      audio.onplay = () => setSitiExplPlaying(true);
      audio.onended = () => setSitiExplPlaying(false);
      audio.onerror = () => setSitiExplPlaying(false);
      await audio.play();
    } catch {
      // silent fail — kartu analisis tetap tampil
    } finally {
      setSitiExplLoading(false);
    }
  };

  const toggleSitiExplanation = () => {
    if (!sitiExplRef.current || !sitiExplUrl) return;
    if (sitiExplPlaying) {
      sitiExplRef.current.pause();
      setSitiExplPlaying(false);
    } else {
      sitiExplRef.current.currentTime = 0;
      sitiExplRef.current.play();
      setSitiExplPlaying(true);
    }
  };

  const resetPractice = () => {
    if (sitiExplRef.current) { sitiExplRef.current.pause(); sitiExplRef.current = null; }
    setPracticeText('');
    setPracticeResult(null);
    setPracticeError(null);
    setVoiceState('idle');
    setRecordSeconds(0);
    setSitiExplLoading(false);
    setSitiExplPlaying(false);
    setSitiExplUrl(null);
  };

  const handlePlayAnswer = async () => {
    setTtsError(null);
    if (isSpeaking && audioRef.current) { audioRef.current.pause(); setIsSpeaking(false); return; }
    if (audioUrl && audioRef.current && !isSpeaking) { audioRef.current.currentTime = 0; audioRef.current.play(); setIsSpeaking(true); return; }
    setAudioLoading(true);
    try {
      // Step 1: Gemini tulis script coaching Siti (bukan baca teks jawaban)
      const script = await generateSitiHighlight(qa.question, qa.answer, qa.suggestion, qa.hack);
      // Step 2: TTS script tersebut
      const url = await generateSitiSpeech(script);
      setAudioUrl(url);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      await audio.play();
      setIsSpeaking(true);
    } catch (err: unknown) {
      setTtsError(err instanceof Error ? err.message : 'Gagal menghasilkan audio Siti.');
    } finally { setAudioLoading(false); }
  };

  const handlePracticeSubmit = async () => {
    if (!practiceText.trim() || practiceLoading) return;
    setPracticeLoading(true); setPracticeError(null);
    try { setPracticeResult(await retryAnswer(qa.question, qa.answer, practiceText)); }
    catch (err: any) { setPracticeError(err?.message || 'Gagal menganalisis.'); }
    finally { setPracticeLoading(false); }
  };

  const ratingColor = qa.rating >= 8 ? 'text-emerald-400' : qa.rating >= 6 ? 'text-blue-400' : qa.rating >= 4 ? 'text-amber-400' : 'text-red-400';
  const cardBorder = open ? 'border-blue-500/40 shadow-lg shadow-blue-900/20'
    : qa.rating >= 8 ? 'border-emerald-500/20 hover:border-emerald-500/40'
    : qa.rating >= 6 ? 'border-slate-800 hover:border-blue-500/30'
    : qa.rating >= 4 ? 'border-amber-500/20 hover:border-amber-500/40'
    : 'border-red-500/20 hover:border-red-500/40';

  const starItems = [
    { key: 'situation', label: 'Situation', data: qa.star.situation },
    { key: 'task',      label: 'Task',      data: qa.star.task },
    { key: 'action',    label: 'Action',    data: qa.star.action },
    { key: 'result',    label: 'Result',    data: qa.star.result },
  ];
  const conciseItems = [
    { key: 'consistency',   label: 'Consistency',   data: qa.concise.consistency },
    { key: 'clarity',       label: 'Clarity',       data: qa.concise.clarity },
    { key: 'information',   label: 'Information',   data: qa.concise.information },
    { key: 'structure',     label: 'Structure',     data: qa.concise.structure },
    { key: 'effectiveness', label: 'Effectiveness', data: qa.concise.effectiveness },
  ];
  const innerTabs = [
    { id: 'chat'     as const, label: 'Percakapan', shortLabel: '💬' },
    { id: 'analysis' as const, label: 'Analisis',   shortLabel: '📊' },
    { id: 'coaching' as const, label: 'Coaching',   shortLabel: '💡' },
    { id: 'practice' as const, label: 'Latihan',    shortLabel: '✏️' },
  ];

  return (
    <div className={`bg-slate-900/40 border rounded-[2rem] overflow-hidden transition-all ${cardBorder}`}>

      {/* ── HEADER ── */}
      <button onClick={() => setOpen(!open)} className="w-full text-left p-5 hover:bg-slate-900/60 transition-colors group cursor-pointer">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-black text-lg transition-all ${
            open ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
          }`}>{index}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Pertanyaan #{index}</span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">STAR {qa.star.score}/4</span>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/30 px-1.5 py-0.5 rounded">ConCISE {qa.concise.total}/50</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${fillerMeta.color} ${fillerMeta.bg} ${fillerMeta.border}`}>
                {fillerResult.total === 0 ? '✓ Bersih' : `⚠ ${fillerResult.total} filler`}
              </span>
            </div>
            <p className={`text-sm leading-relaxed line-clamp-2 ${open ? 'text-white' : 'text-slate-300'}`}>
              {qa.question.length > 110 ? qa.question.slice(0, 110) + '…' : qa.question}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Rating</div>
              <div className={`text-2xl font-black ${ratingColor} leading-none`}>{qa.rating}<span className="text-xs text-slate-600">/10</span></div>
            </div>
            <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}
              className={`w-9 h-9 rounded-lg flex items-center justify-center border ${open ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              <span className="text-sm">▶</span>
            </motion.div>
          </div>
        </div>
      </button>

      {/* ── EXPANDED BODY ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-800">

              {/* ── INNER TAB BAR ── */}
              <div className="flex p-2 gap-1 bg-slate-950/50 border-b border-slate-800/60">
                {innerTabs.map(t => (
                  <button key={t.id} onClick={() => setInnerTab(t.id)}
                    className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                      innerTab === t.id ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/40' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/70'
                    }`}>
                    <span className="hidden sm:inline">{t.label}</span>
                    <span className="sm:hidden">{t.shortLabel}</span>
                  </button>
                ))}
              </div>

              {/* ── TAB CONTENT ── */}
              <div className="p-5">
                <AnimatePresence mode="wait">

                  {/* ═══ TAB: PERCAKAPAN ═══ */}
                  {innerTab === 'chat' && (
                    <motion.div key="chat" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shrink-0 shadow">
                          <Sparkles size={13} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Siti Rahayu</div>
                          <div className="bg-slate-800/50 border border-slate-700/40 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-200 leading-relaxed">
                            {qa.question}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 flex-row-reverse">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shrink-0 shadow">
                          <User size={13} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1 text-right">Anda</div>
                          <div className="bg-blue-600/10 border border-blue-500/25 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-slate-200 leading-relaxed">
                            {qa.answer}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ═══ TAB: ANALISIS ═══ */}
                  {innerTab === 'analysis' && (
                    <motion.div key="analysis" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="space-y-5">

                      {/* STAR — chip rows */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5"><Zap size={11} />Deteksi STAR</span>
                          <span className="text-xs font-mono font-bold text-amber-400">{qa.star.score}<span className="text-slate-600">/4</span></span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {starItems.map(c => (
                            <div key={c.key} className={`flex items-start gap-2.5 rounded-xl p-3 border ${c.data.present ? 'bg-emerald-500/8 border-emerald-500/25' : 'bg-slate-800/25 border-slate-700/35'}`}>
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${c.data.present ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                                {c.data.present ? <Check size={10} className="text-white" /> : <X size={10} className="text-slate-500" />}
                              </div>
                              <div className="min-w-0">
                                <div className="text-[10px] font-bold text-slate-300 mb-0.5">{c.label}</div>
                                <p className="text-[10px] text-slate-500 leading-snug italic line-clamp-2">
                                  {c.data.present ? `"${c.data.evidence}"` : '— tidak ditemukan'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ConCISE — horizontal bars */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 flex items-center gap-1.5"><ListChecks size={11} />Metrik ConCISE</span>
                          <span className="text-xs font-mono font-bold text-purple-400">{qa.concise.total}<span className="text-slate-600">/50</span></span>
                        </div>
                        <div className="space-y-2.5">
                          {conciseItems.map(m => {
                            const barColor = m.data.score >= 8 ? 'bg-emerald-500' : m.data.score >= 6 ? 'bg-blue-500' : m.data.score >= 4 ? 'bg-amber-500' : 'bg-red-500';
                            const textColor = m.data.score >= 8 ? 'text-emerald-400' : m.data.score >= 6 ? 'text-blue-400' : m.data.score >= 4 ? 'text-amber-400' : 'text-red-400';
                            return (
                              <div key={m.key}>
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="text-[10px] font-bold text-slate-400 w-24 shrink-0">{m.label}</span>
                                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${m.data.score * 10}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} className={`h-full ${barColor} rounded-full`} />
                                  </div>
                                  <span className={`text-xs font-mono font-bold w-6 text-right shrink-0 ${textColor}`}>{m.data.score}</span>
                                </div>
                                {m.data.note && (
                                  <p className={`text-[10px] leading-snug pl-[6.5rem] italic ${m.data.score >= 7 ? 'text-slate-500' : 'text-amber-500/80'}`}>{m.data.note}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* ── FILLER WORDS ── */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-semibold flex items-center gap-1.5 ${fillerMeta.color}`}>
                            <span>🗣</span> Filler Words
                            <FillerInfoPopover />
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${fillerMeta.color} ${fillerMeta.bg} ${fillerMeta.border}`}>
                            {fillerResult.level === 'clean' ? 'Bersih' : `${fillerResult.total}× terdeteksi · ${fillerMeta.label}`}
                          </span>
                        </div>
                        <div className={`rounded-xl p-3 border ${fillerMeta.bg} ${fillerMeta.border}`}>
                          <p className={`text-[11px] leading-relaxed mb-2 ${fillerMeta.color}`}>{fillerMeta.text}</p>
                          {fillerResult.found.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {fillerResult.found.map(f => (
                                <span key={f.word} className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/20 rounded-full text-[10px] font-mono font-bold text-slate-300">
                                  &ldquo;{f.word}&rdquo; <span className="text-slate-500">×{f.count}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                    </motion.div>
                  )}

                  {/* ═══ TAB: COACHING ═══ */}
                  {innerTab === 'coaching' && (
                    <motion.div key="coaching" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="space-y-4">

                      {/* Saran + Hack dalam satu card */}
                      <div className="rounded-2xl border border-slate-700/50 overflow-hidden">
                        <div className="flex items-start gap-3 p-4 border-b border-slate-700/40 bg-amber-500/5">
                          <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                            <Lightbulb size={13} className="text-white" />
                          </div>
                          <div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-amber-400 mb-1">Saran Perbaikan</div>
                            <p className="text-sm text-slate-200 leading-relaxed">{qa.suggestion}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-blue-500/5">
                          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                            <Zap size={13} className="text-white" />
                          </div>
                          <div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-blue-400 mb-1">Quick Hack</div>
                            <p className="text-sm text-slate-200 leading-relaxed font-medium">{qa.hack}</p>
                          </div>
                        </div>
                      </div>

                      {/* Contoh Jawaban — langsung tampil, tanpa toggle */}
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 mb-2 flex items-center gap-1.5">
                          <MessageSquare size={10} />Contoh Jawaban Lebih Baik
                        </div>
                        <div className="bg-emerald-950/25 border border-emerald-700/25 rounded-xl px-4 py-3 text-sm text-slate-200 leading-relaxed italic mb-3">
                          &ldquo;{qa.better_answer_example}&rdquo;
                        </div>
                        <button onClick={handlePlayAnswer} disabled={audioLoading}
                          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                            audioLoading
                              ? 'bg-slate-800/80 text-slate-500 cursor-wait'
                              : isSpeaking
                              ? 'bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/20'
                              : 'bg-gradient-to-r from-indigo-600/30 to-blue-600/20 border border-indigo-500/40 text-indigo-200 hover:from-indigo-600/40 hover:to-blue-600/30'
                          }`}>
                          {audioLoading
                            ? <><Loader2 size={14} className="animate-spin" />Siti lagi nyiapin feedback kamu…</>
                            : isSpeaking
                            ? <><Pause size={14} />Hentikan</>
                            : <><Volume2 size={14} />{audioUrl ? '▶ Play Ulang · Siti Highlight' : '▶ Play Highlight Jawaban Kamu'}</>}
                        </button>
                        {ttsError && <p className="text-[10px] text-red-400 mt-1.5 text-center">{ttsError}</p>}
                      </div>
                    </motion.div>
                  )}

                  {/* ═══ TAB: LATIHAN ═══ */}
                  {innerTab === 'practice' && (
                    <motion.div key="practice" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="space-y-4">

                      {/* Pertanyaan konteks — selalu tampil */}
                      <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-3">
                        <div className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 mb-1">Pertanyaan dari Siti</div>
                        <p className="text-sm text-slate-200 italic">&ldquo;{qa.question}&rdquo;</p>
                      </div>

                      {/* ── IDLE: tombol rekam ── */}
                      {voiceState === 'idle' && (
                        <div className="flex flex-col items-center gap-3 py-5">
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startRecording}
                            className="w-20 h-20 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center shadow-xl shadow-indigo-900/50 transition-colors">
                            <Mic size={34} className="text-white" />
                          </motion.button>
                          <p className="text-sm text-slate-400 text-center">Tekan untuk mulai menjawab dengan suara</p>
                          <p className="text-[10px] text-slate-600 text-center">Rekaman akan langsung dianalisis oleh Gemini AI</p>
                          {practiceError && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-center">{practiceError}</p>}
                        </div>
                      )}

                      {/* ── RECORDING: pulse + stop + timer ── */}
                      {voiceState === 'recording' && (
                        <div className="flex flex-col items-center gap-3 py-5">
                          <div className="relative flex items-center justify-center">
                            <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.35, 0.08, 0.35] }}
                              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                              className="absolute w-20 h-20 bg-red-500 rounded-full" />
                            <button onClick={stopRecording}
                              className="relative w-20 h-20 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center shadow-xl shadow-red-900/50 z-10 transition-colors">
                              <Square size={26} className="text-white fill-white" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.div animate={{ opacity: [1, 0.15, 1] }} transition={{ duration: 1, repeat: Infinity }}
                              className="w-2 h-2 bg-red-500 rounded-full" />
                            <span className="text-sm font-mono font-bold text-red-400">
                              MEREKAM {String(Math.floor(recordSeconds / 60)).padStart(2, '0')}:{String(recordSeconds % 60).padStart(2, '0')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">Tekan tombol merah setelah selesai menjawab</p>
                        </div>
                      )}

                      {/* ── PROCESSING: transkripsi + analisis berjalan ── */}
                      {voiceState === 'processing' && (
                        <div className="flex flex-col items-center gap-4 py-8">
                          <div className="relative">
                            <Loader2 size={36} className="animate-spin text-indigo-400" />
                            <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}
                              className="absolute inset-0 rounded-full bg-indigo-500/10" />
                          </div>
                          <div className="text-center space-y-1">
                            <p className="text-sm font-medium text-slate-300">Menganalisis jawaban Anda…</p>
                            <p className="text-[10px] text-slate-500">Transkripsi → Evaluasi STAR & ConCISE → Penjelasan Siti</p>
                          </div>
                        </div>
                      )}

                      {/* ── DONE: hasil analisis + suara Siti ── */}
                      {voiceState === 'done' && practiceResult && (
                        <>
                          {/* Banner penjelasan Siti */}
                          <div className="flex items-center gap-3 px-4 py-3 bg-blue-600/10 border border-blue-500/25 rounded-xl">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shrink-0">
                              <Sparkles size={15} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[9px] font-bold uppercase tracking-widest text-blue-400 mb-0.5">Siti Rahayu</div>
                              <p className="text-xs text-slate-300">
                                {sitiExplLoading ? 'Menyiapkan penjelasan audio…'
                                  : sitiExplPlaying ? 'Sedang menjelaskan hasil analisis…'
                                  : sitiExplUrl ? 'Penjelasan selesai · Putar ulang jika perlu'
                                  : 'Penjelasan audio tidak tersedia'}
                              </p>
                            </div>
                            {sitiExplLoading ? (
                              <Loader2 size={18} className="animate-spin text-blue-400 shrink-0" />
                            ) : sitiExplUrl ? (
                              <button onClick={toggleSitiExplanation}
                                className="w-9 h-9 rounded-xl bg-blue-500/20 hover:bg-blue-500/35 flex items-center justify-center transition-colors shrink-0">
                                {sitiExplPlaying
                                  ? <Pause size={15} className="text-blue-300" />
                                  : <Volume2 size={15} className="text-blue-300" />}
                              </button>
                            ) : null}
                          </div>

                          {/* Kartu hasil analisis */}
                          <PracticeResultView
                            result={practiceResult} originalRating={qa.rating}
                            originalStarScore={qa.star.score} originalConciseTotal={qa.concise.total}
                            onReset={resetPractice}
                          />
                        </>
                      )}

                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =================== PRACTICE RESULT VIEW ===================
function DiffBadge({ diff, label, absolute, max }: { diff: number; label: string; absolute: number; max: string }) {
  const positive = diff > 0;
  const neutral = diff === 0;
  const diffDisplay = neutral ? '=' : positive ? `+${diff}` : `${diff}`;
  return (
    <div className={`flex flex-col items-center p-3 rounded-xl border ${
      neutral ? 'bg-slate-800/50 border-slate-700' :
      positive ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'
    }`}>
      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</span>
      <span className={`text-lg font-black leading-none ${
        neutral ? 'text-slate-400' :
        positive ? 'text-emerald-400' : 'text-red-400'
      }`}>
        {diffDisplay}
      </span>
      <span className="text-[9px] font-mono text-slate-500 mt-1">{absolute}/{max}</span>
    </div>
  );
}

function PracticeResultView({
  result,
  originalRating,
  originalStarScore,
  originalConciseTotal,
  onReset,
}: {
  result: RetryResult;
  originalRating: number;
  originalStarScore: number;
  originalConciseTotal: number;
  onReset: () => void;
}) {
  const ratingDiff = result.rating - originalRating;
  const starDiff = result.star.score - originalStarScore;
  const conciseDiff = result.concise.total - originalConciseTotal;

  const verdictBg = result.is_better
    ? 'bg-emerald-500/15 border-emerald-500/40'
    : 'bg-amber-500/15 border-amber-500/40';
  const verdictText = result.is_better ? 'text-emerald-300' : 'text-amber-300';

  return (
    <div className="space-y-4">
      {/* VERDICT BANNER */}
      <div className={`rounded-2xl p-4 border-2 ${verdictBg}`}>
        <div className="flex items-center gap-3 mb-2">
          {result.is_better ? (
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white" size={18} />
            </div>
          ) : (
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center">
              <AlertTriangle className="text-white" size={18} />
            </div>
          )}
          <h6 className={`font-bold ${verdictText}`}>
            {result.is_better ? 'Jawaban Anda Lebih Baik!' : 'Belum Ada Peningkatan Signifikan'}
          </h6>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">{result.improvement_note}</p>
      </div>

      {/* COMPARISON METRICS */}
      <div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">Perubahan vs Jawaban Sebelumnya</div>
        <div className="grid grid-cols-3 gap-2">
          <DiffBadge diff={ratingDiff} label="Rating" absolute={result.rating} max="10" />
          <DiffBadge diff={starDiff} label="STAR" absolute={result.star.score} max="4" />
          <DiffBadge diff={conciseDiff} label="ConCISE" absolute={result.concise.total} max="50" />
        </div>
      </div>

      {/* NEW SCORES */}
      <div className="bg-slate-950/40 border border-slate-700 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Skor Jawaban Baru</span>
          <span className="text-2xl font-black text-white">{result.rating}<span className="text-xs text-slate-500">/10</span></span>
        </div>

        {/* STAR breakdown */}
        <div className="bg-amber-500/8 border border-amber-500/25 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">STAR Framework</span>
            <span className="text-xs font-mono font-bold text-amber-400">{result.star.score}/4</span>
          </div>
          {[
            { key: 'situation', label: 'Situation', data: result.star.situation },
            { key: 'task',      label: 'Task',      data: result.star.task },
            { key: 'action',    label: 'Action',    data: result.star.action },
            { key: 'result',    label: 'Result',    data: result.star.result },
          ].map(({ key, label, data }) => (
            <div key={key} className="flex items-start gap-2">
              <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${data.present ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                {data.present ? <Check size={9} className="text-white" /> : <X size={9} className="text-slate-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-[10px] font-bold ${data.present ? 'text-emerald-400' : 'text-slate-500'}`}>{label}</span>
                {data.evidence && data.evidence !== '-' && (
                  <p className="text-[10px] text-slate-500 italic leading-snug mt-0.5 truncate" title={data.evidence}>&ldquo;{data.evidence}&rdquo;</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ConCISE total */}
        <div className="flex justify-between bg-purple-500/10 border border-purple-500/30 px-3 py-2 rounded-lg text-xs">
          <span className="text-purple-300 font-bold">Total ConCISE</span>
          <span className="text-purple-400 font-mono">{result.concise.total}/50</span>
        </div>
      </div>

      {/* CONCISE BREAKDOWN */}
      <div className="bg-slate-950/40 border border-slate-700 rounded-xl p-3 space-y-2.5">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Detail ConCISE</div>
        {[
          { key: 'consistency',   label: 'Consistency',   data: result.concise.consistency },
          { key: 'clarity',       label: 'Clarity',       data: result.concise.clarity },
          { key: 'information',   label: 'Information',   data: result.concise.information },
          { key: 'structure',     label: 'Structure',     data: result.concise.structure },
          { key: 'effectiveness', label: 'Effectiveness', data: result.concise.effectiveness },
        ].map(({ key, label, data }) => {
          const barColor = data.score >= 8 ? 'bg-emerald-500' : data.score >= 6 ? 'bg-blue-500' : data.score >= 4 ? 'bg-amber-500' : 'bg-red-500';
          const textColor = data.score >= 8 ? 'text-emerald-400' : data.score >= 6 ? 'text-blue-400' : data.score >= 4 ? 'text-amber-400' : 'text-red-400';
          return (
            <div key={key}>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold text-slate-400 w-24 shrink-0">{label}</span>
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${data.score * 10}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} className={`h-full ${barColor} rounded-full`} />
                </div>
                <span className={`text-xs font-mono font-bold w-5 text-right shrink-0 ${textColor}`}>{data.score}</span>
              </div>
              {data.note && (
                <p className={`text-[10px] leading-snug pl-[6.5rem] italic ${data.score >= 7 ? 'text-slate-600' : 'text-amber-500/70'}`}>{data.note}</p>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onReset}
        className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
      >
        <RefreshCcw size={14} />
        Coba Jawaban Lain
      </button>
    </div>
  );
}

// =================== CV MATCH VIEW ===================
function CVMatchView({ evaluation }: { evaluation: EvaluationData }) {
  const m = evaluation.cv_jd_match;

  return (
    <>
      {/* Match Score Header */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">Skor Kesesuaian</h3>
            <h2 className="text-3xl font-bold text-white tracking-tight">CV vs Job Description</h2>
            <p className="text-slate-400 text-sm mt-2 max-w-xl leading-relaxed">{m.assessment}</p>
          </div>
          <div className="flex flex-col items-center">
            <div className={`text-7xl font-black tracking-tighter ${m.score >= 80 ? 'text-emerald-400' : m.score >= 60 ? 'text-blue-400' : m.score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
              {m.score}
            </div>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
        </div>
      </div>

      {/* MATCHED SKILLS DEMONSTRATED */}
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <CheckCircle className="text-white" size={18} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Skill yang Terbukti di Wawancara</h3>
            <p className="text-xs text-slate-400">Skill di CV yang berhasil ditunjukkan dalam jawaban</p>
          </div>
        </div>
        {m.matched_skills_in_interview.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {m.matched_skills_in_interview.map((s, i) => (
              <span key={i} className="px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-lg text-sm font-medium">
                {s}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm italic">Belum ada skill spesifik yang dapat dibuktikan dari jawaban.</p>
        )}
      </div>

      {/* GAPS ADDRESSED */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-6 bg-blue-500/5 border border-blue-500/20 rounded-[2rem] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Check className="text-white" size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Gap Yang Berhasil Dijawab</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Berhasil di-cover di wawancara</p>
            </div>
          </div>
          {m.skill_gaps_addressed.length > 0 ? (
            <ul className="space-y-2">
              {m.skill_gaps_addressed.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <Check size={14} className="text-blue-400 mt-1 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-xs italic">Tidak ada gap yang teridentifikasi atau belum dijawab.</p>
          )}
        </div>

        <div className="col-span-12 md:col-span-6 bg-red-500/5 border border-red-500/20 rounded-[2rem] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
              <X className="text-white" size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Gap Yang Belum Terjawab</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Perlu dipersiapkan untuk next interview</p>
            </div>
          </div>
          {m.skill_gaps_unaddressed.length > 0 ? (
            <ul className="space-y-2">
              {m.skill_gaps_unaddressed.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <X size={14} className="text-red-400 mt-1 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-xs italic">Semua gap berhasil dijawab dengan baik.</p>
          )}
        </div>
      </div>
    </>
  );
}
