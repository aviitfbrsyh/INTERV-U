'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, ChevronRight, Briefcase, Loader2, Edit3, CheckCircle, FileUp, User, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { extractCV, extractJD, CVData, JDData } from '@/lib/gemini-extraction';
import { crossMatch, CrossMatchData } from '@/lib/cross-match';
import { CVForm, JDForm } from '@/components/StructuredDataForm';

export type InterviewMode = 'behavioral' | 'profesional' | 'supportif' | 'pressure';

interface InterviewSetupProps {
  onStart: (cvText: string, jdText: string, crossMatchData: CrossMatchData, mode: InterviewMode) => void;
}

const BEHAVIORAL_MODE = {
  id: 'behavioral' as InterviewMode,
  name: 'Behavioral Event Interview (BEI)',
  persona: 'Siti Rahayu',
  role: 'Director of Talent · 20 Tahun Pengalaman HR',
  tagline: 'Standar Baku Wawancara Kerja Berbasis Perilaku & Pengalaman Nyata',
  traits: [
    'Pertanyaan terfokus pada 7 Kompetensi Utama IT (Spencer & Spencer)',
    'Eksplorasi pengalaman nyata berbasis metode STAR + FACT',
    'Durasi simulasi terkalibrasi sekitar ±15 Menit',
  ],
  color: '#3b82f6',
  colorMuted: 'rgba(59,130,246,0.08)',
  colorBorder: 'rgba(59,130,246,0.25)',
  colorText: '#93c5fd',
  dot: 'bg-blue-500',
};

type SetupStep = 'input' | 'review';

const LOADING_STEPS = {
  cv: [
    'Membaca dokumen...',
    'Mendeteksi bagian profil...',
    'Mengekstrak pengalaman kerja...',
    'Merapikan skill & pendidikan...',
    'Menyusun struktur data...',
  ],
  jd: [
    'Membaca job description...',
    'Mengidentifikasi role & level...',
    'Mengekstrak requirement teknis...',
    'Menganalisis kualifikasi...',
    'Menyusun struktur data...',
  ],
} as const;

const SKELETON_WIDTHS = [68, 100, 84, 56, 92, 72, 44];

function CardLoadingOverlay({ variant }: { variant: 'cv' | 'jd' }) {
  const steps = LOADING_STEPS[variant];
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const progressTimer = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const eased = 12 + 81 * (1 - Math.exp(-elapsed / 5.2));
      setProgress((prev) => Math.max(prev, Math.min(94, eased)));
    }, 100);

    const stepTimer = setInterval(() => {
      setStepIdx((prev) => Math.min(prev + 1, steps.length - 1));
    }, 2400);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  }, [steps.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 z-10 flex flex-col overflow-hidden bg-[#060608]/65 backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-500/[0.04] via-transparent to-violet-500/[0.05]" />

      <div className="relative flex-1 p-5 pt-12 space-y-2.5">
        {SKELETON_WIDTHS.map((width, i) => (
          <div
            key={i}
            className="h-2.5 rounded-full bg-white/[0.04] border border-white/[0.03] overflow-hidden"
            style={{ width: `${width}%` }}
          >
            <motion.div
              className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/[0.09] to-transparent"
              animate={{ x: ['-120%', '280%'] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                delay: i * 0.12,
                ease: 'linear',
              }}
            />
          </div>
        ))}
        <div className="pt-2 flex gap-2">
          {[40, 52, 36].map((w, i) => (
            <div
              key={i}
              className="h-5 rounded-md bg-blue-400/[0.06] border border-blue-400/[0.08] overflow-hidden"
              style={{ width: `${w}%` }}
            >
              <motion.div
                className="h-full w-full bg-gradient-to-r from-transparent via-blue-300/[0.12] to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.4 + i * 0.2, ease: 'linear' }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="relative border-t border-white/[0.06] bg-white/[0.02] px-5 py-4">
        <div className="flex items-start gap-3 mb-3.5">
          <div className="relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-blue-400/10 animate-ping" />
            <span className="relative h-2 w-2 rounded-full bg-blue-400/70 shadow-[0_0_10px_rgba(96,165,250,0.45)]" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <AnimatePresence mode="wait">
              <motion.p
                key={stepIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28 }}
                className="text-sm font-medium text-white/85 truncate"
              >
                {steps[stepIdx]}
              </motion.p>
            </AnimatePresence>
            <p className="mt-0.5 text-[11px] text-white/30">
              {variant === 'cv' ? 'AI sedang merapikan CV Anda' : 'AI sedang menganalisis role'}
            </p>
          </div>
          <span className="shrink-0 font-mono text-[11px] tabular-nums text-blue-300/45">
            {Math.round(progress)}%
          </span>
        </div>

        <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.05]">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background:
                'linear-gradient(90deg, rgba(59,130,246,0.18) 0%, rgba(96,165,250,0.38) 55%, rgba(147,197,253,0.22) 100%)',
              boxShadow: '0 0 14px rgba(59,130,246,0.15)',
            }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          />
        </div>

        <div className="mt-2.5 flex gap-1">
          {steps.map((step, i) => (
            <div
              key={step}
              className="h-0.5 flex-1 rounded-full transition-colors duration-500"
              style={{
                background:
                  i <= stepIdx
                    ? 'rgba(96, 165, 250, 0.35)'
                    : 'rgba(255, 255, 255, 0.06)',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function InterviewSetup({ onStart }: InterviewSetupProps) {
  const [step, setStep] = useState<SetupStep>('input');
  const [isCvAnalyzing, setIsCvAnalyzing] = useState(false);
  const [isJdAnalyzing, setIsJdAnalyzing] = useState(false);
  
  const [cvInputMethod, setCvInputMethod] = useState<'paste' | 'upload'>('paste');
  const [jdInputMethod, setJdInputMethod] = useState<'paste' | 'upload'>('paste');

  const [cvRawText, setCvRawText] = useState('');
  const [jdRawText, setJdRawText] = useState('');

  const [cvData, setCvData] = useState<CVData | null>(null);
  const [jdData, setJdData] = useState<JDData | null>(null);
  const [isCrossMatching, setIsCrossMatching] = useState(false);

  const [interviewMode, setInterviewMode] = useState<InterviewMode>('behavioral');

  const cvFileRef = useRef<HTMLInputElement>(null);
  const jdFileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cv' | 'jd') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so re-selecting same file triggers onChange
    e.target.value = '';

    // Cek jika proses lain sedang berjalan agar tidak menabrak rate limit / concurrency Gemini
    if (type === 'jd' && isCvAnalyzing) {
      alert('Mohon tunggu CV Anda selesai diekstrak terlebih dahulu sebelum mengunggah Job Description.');
      return;
    }
    if (type === 'cv' && isJdAnalyzing) {
      alert('Mohon tunggu Job Description selesai diekstrak terlebih dahulu sebelum mengunggah CV.');
      return;
    }

    // Validasi tipe file: Gemini API hanya mendukung PDF dan Gambar langsung
    const isWordDoc = file.name.endsWith('.doc') || file.name.endsWith('.docx') || file.type.includes('word') || file.type.includes('officedocument');
    if (isWordDoc) {
      alert('Format Word (.docx / .doc) tidak didukung untuk ekstraksi file langsung oleh AI.\n\nSolusi: Buka file Word Anda, salin isinya, lalu gunakan tab "PASTE" untuk menempel teks secara langsung.');
      return;
    }

    // Validasi ukuran payload untuk Vercel (maksimum 4 MB)
    if (file.size > 4 * 1024 * 1024) {
      alert('Ukuran file terlalu besar (maksimal 4 MB di Vercel). Silakan kompres file atau gunakan tab "PASTE".');
      return;
    }

    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    if (type === 'cv') setIsCvAnalyzing(true);
    else setIsJdAnalyzing(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

      try {
        if (type === 'cv') {
          const extracted = await extractCV({ file: { base64, mimeType } });
          setCvData(extracted);
        } else {
          const extracted = await extractJD({ file: { base64, mimeType } });
          setJdData(extracted);
        }
      } catch (err: any) {
        console.error('Extraction failed:', err);
        const errMsg = err?.message || 'Gagal mengekstrak data dari file.';
        alert(`Gagal mengekstrak data:\n\n${errMsg}\n\nTips: Anda juga bisa beralih ke tab "PASTE" untuk menempel teks secara manual.`);
      } finally {
        if (type === 'cv') setIsCvAnalyzing(false);
        else setIsJdAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProcessRaw = async () => {
    const cvNeeded = !cvData && cvRawText;
    const jdNeeded = !jdData && jdRawText;

    if (!cvNeeded && !jdNeeded) {
      setStep('review');
      return;
    }

    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    if (cvNeeded) setIsCvAnalyzing(true);
    if (jdNeeded) setIsJdAnalyzing(true);

    try {
        // Jalankan secara berurutan (sequential) untuk mencegah rate-limit / concurrency spike pada Gemini Free Tier
        if (cvNeeded) {
          const cData = await extractCV({ text: cvRawText });
          setCvData(cData);
        }
        if (jdNeeded) {
          const jData = await extractJD({ text: jdRawText });
          setJdData(jData);
        }
        setStep('review');
    } catch (e: any) {
        console.error('Structuring failed:', e);
        const errMsg = e?.message || 'Gagal memproses teks.';
        alert(`Gagal memproses: ${errMsg}\n\nTetap melanjutkan ke review data.`);
        setStep('review');
    } finally {
        setIsCvAnalyzing(false);
        setIsJdAnalyzing(false);
    }
  };

  const handleFinalStart = async () => {
    const finalCV = cvData ? JSON.stringify(cvData, null, 2) : cvRawText;
    const finalJD = jdData ? JSON.stringify(jdData, null, 2) : jdRawText;

    setIsCrossMatching(true);
    try {
      const matchData = await crossMatch(finalCV, finalJD);
      onStart(finalCV, finalJD, matchData, interviewMode);
    } catch (err) {
      console.error('Cross-match analysis failed:', err);
      const fallback: CrossMatchData = {
        match_score: 0,
        matched_skills: [],
        skill_gaps: [],
        experience_verdict: 'Analisis tidak tersedia',
        focus_areas: [],
        summary: 'Tidak dapat melakukan analisis kesesuaian.',
      };
      onStart(finalCV, finalJD, fallback, interviewMode);
    } finally {
      setIsCrossMatching(false);
    }
  };

  const glassCard = 'rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm';
  const inputArea = 'w-full h-52 sm:h-56 bg-white/[0.02] border border-white/[0.08] rounded-xl p-4 text-white/70 focus:border-blue-500/40 focus:outline-none transition-all resize-none text-sm leading-relaxed placeholder:text-white/25';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.div 
            key="input-step"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            <div className="flex flex-col items-center gap-3 pt-1">
              <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/30">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div className="text-center space-y-1">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white">
                  interv<span className="text-blue-500">you</span>
                </h1>
                <p className="text-white/45 text-sm sm:text-base font-light">
                  Simulasi wawancara profesional bertenaga AI.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* CV Section */}
              <div className={`${glassCard} relative overflow-hidden`}>
                {isCvAnalyzing && <CardLoadingOverlay variant="cv" />}
                <div className={`p-5 space-y-4 ${isCvAnalyzing ? 'invisible' : ''}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 text-white">
                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <FileText className="w-4 h-4 text-blue-400" />
                    </div>
                    <h2 className="font-semibold text-base">Resume / CV</h2>
                  </div>
                  <div className="flex bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.08]">
                    <button 
                      onClick={() => setCvInputMethod('paste')}
                      className={`px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold rounded-md ${cvInputMethod === 'paste' ? 'bg-blue-600 text-white' : 'text-white/40'}`}
                    >
                      Paste
                    </button>
                    <button 
                      onClick={() => setCvInputMethod('upload')}
                      className={`px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold rounded-md ${cvInputMethod === 'upload' ? 'bg-blue-600 text-white' : 'text-white/40'}`}
                    >
                      Upload
                    </button>
                  </div>
                </div>

                {cvData ? (
                  <div className="w-full h-52 sm:h-56 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col items-center justify-center gap-2 p-6 text-center">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <CheckCircle className="text-white w-6 h-6" />
                    </div>
                    <h3 className="text-white font-bold">CV Berhasil Diekstrak</h3>
                    <p className="text-slate-400 text-sm">Data profil, pengalaman, dan skill telah terbaca.</p>
                    <button 
                      onClick={() => { setCvData(null); setCvRawText(''); }}
                      className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-4 mt-2"
                    >
                      Ganti CV
                    </button>
                  </div>
                ) : cvInputMethod === 'paste' ? (
                  <textarea
                    placeholder="Tempel teks resume lengkap Anda..."
                    className={inputArea}
                    value={cvRawText}
                    onChange={(e) => setCvRawText(e.target.value)}
                  />
                ) : (
                  <div 
                    onClick={() => {
                      if (isJdAnalyzing) {
                        alert('Mohon tunggu Job Description selesai diekstrak terlebih dahulu.');
                        return;
                      }
                      cvFileRef.current?.click();
                    }}
                    className={`w-full h-52 sm:h-56 border border-dashed border-white/[0.12] rounded-xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group ${isJdAnalyzing ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/[0.03]'}`}
                  >
                    <div className="p-3 bg-white/[0.05] rounded-full group-hover:scale-105 transition-transform">
                        <FileUp className="w-6 h-6 text-blue-400" />
                    </div>
                    <p className="text-white/50 text-sm font-medium">
                      {isJdAnalyzing ? 'Tunggu Job Description selesai...' : 'Klik untuk unggah PDF atau Gambar'}
                    </p>
                    <p className="text-[10px] text-white/25 uppercase tracking-widest">PDF, PNG, JPG</p>
                    <input type="file" ref={cvFileRef} className="hidden" accept=".pdf,image/*" disabled={isJdAnalyzing} onChange={(e) => handleFileUpload(e, 'cv')} />
                  </div>
                )}
                </div>
              </div>

              {/* JD Section */}
              <div className={`${glassCard} relative overflow-hidden`}>
                {isJdAnalyzing && <CardLoadingOverlay variant="jd" />}
                <div className={`p-5 space-y-4 ${isJdAnalyzing ? 'invisible' : ''}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 text-white">
                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <Briefcase className="w-4 h-4 text-blue-400" />
                    </div>
                    <h2 className="font-semibold text-base">Job Description</h2>
                  </div>
                  <div className="flex bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.08]">
                    <button 
                      onClick={() => setJdInputMethod('paste')}
                      className={`px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold rounded-md ${jdInputMethod === 'paste' ? 'bg-blue-600 text-white' : 'text-white/40'}`}
                    >
                      Paste
                    </button>
                    <button 
                      onClick={() => setJdInputMethod('upload')}
                      className={`px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold rounded-md ${jdInputMethod === 'upload' ? 'bg-blue-600 text-white' : 'text-white/40'}`}
                    >
                      Upload
                    </button>
                  </div>
                </div>

                {jdData ? (
                  <div className="w-full h-52 sm:h-56 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col items-center justify-center gap-2 p-6 text-center">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <CheckCircle className="text-white w-6 h-6" />
                    </div>
                    <h3 className="text-white font-bold">Job Desc Berhasil Diekstrak</h3>
                    <p className="text-slate-400 text-sm">Target role dan requirements siap direview.</p>
                    <button 
                      onClick={() => { setJdData(null); setJdRawText(''); }}
                      className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-4 mt-2"
                    >
                      Ganti Job Description
                    </button>
                  </div>
                ) : jdInputMethod === 'paste' ? (
                  <textarea
                    placeholder="Tempel deskripsi pekerjaan..."
                    className={inputArea}
                    value={jdRawText}
                    onChange={(e) => setJdRawText(e.target.value)}
                  />
                ) : (
                  <div 
                    onClick={() => {
                      if (isCvAnalyzing) {
                        alert('Mohon tunggu CV Anda selesai diekstrak terlebih dahulu.');
                        return;
                      }
                      jdFileRef.current?.click();
                    }}
                    className={`w-full h-52 sm:h-56 border border-dashed border-white/[0.12] rounded-xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group ${isCvAnalyzing ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/[0.03]'}`}
                  >
                    <div className="p-3 bg-white/[0.05] rounded-full group-hover:scale-105 transition-transform">
                        <FileUp className="w-6 h-6 text-blue-400" />
                    </div>
                    <p className="text-white/50 text-sm font-medium">
                      {isCvAnalyzing ? 'Tunggu CV selesai diproses...' : 'Klik untuk unggah Job Description'}
                    </p>
                    <p className="text-[10px] text-white/25 uppercase tracking-widest">PDF, PNG, JPG</p>
                    <input type="file" ref={jdFileRef} className="hidden" accept=".pdf,image/*" disabled={isCvAnalyzing} onChange={(e) => handleFileUpload(e, 'jd')} />
                  </div>
                )}
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-1">
              <button
                onClick={handleProcessRaw}
                disabled={((!cvRawText && !cvData) || (!jdRawText && !jdData)) || isCvAnalyzing || isJdAnalyzing}
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white/[0.95] text-black font-semibold rounded-full hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-lg shadow-white/10"
              >
                <span>Lanjut ke Review Data</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'review' && (
          <motion.div 
            key="review-step"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pb-12"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/[0.03] p-5 sm:p-6 rounded-2xl border border-white/[0.07] gap-4">
                {/* Left: back + title */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setStep('input')}
                    className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/[0.1] bg-white/[0.06] hover:bg-white/[0.1] text-white/60 hover:text-white transition-all text-xs font-semibold w-fit"
                  >
                    <ArrowLeft size={14} />
                    Kembali Edit Data
                  </button>
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
                        <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Review & Edit Data</h2>
                        <p className="text-slate-400 text-sm">Pastikan semua data sudah akurat sebelum mulai wawancara.</p>
                    </div>
                  </div>
                </div>
                <button
                    onClick={handleFinalStart}
                    disabled={isCrossMatching}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.95] text-black font-semibold rounded-full hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    {isCrossMatching ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>Menganalisis Kesesuaian CV...</span>
                        </>
                    ) : (
                        <>
                            <span>Mulai Wawancara Sekarang</span>
                            <ChevronRight size={20} />
                        </>
                    )}
                </button>
            </div>

            {/* Mode Preview — Fokus Tunggal Behavioral Interview */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-800/80" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">
                  Mode Standar Baku Wawancara
                </span>
                <div className="h-px flex-1 bg-slate-800/80" />
              </div>

              <div
                className="relative rounded-2xl p-5 sm:p-6 transition-all duration-200 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(99,102,241,0.04) 100%)',
                  border: '1.5px solid rgba(59,130,246,0.25)',
                  boxShadow: '0 0 32px rgba(59,130,246,0.10), inset 0 0 0 1px rgba(59,130,246,0.12)',
                }}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center font-bold text-blue-300 text-lg shadow-inner shrink-0">
                      SR
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white tracking-tight">Siti Rahayu</span>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Pewawancara Utama
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">Director of Talent · 20 Tahun Pengalaman HR</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      Behavioral Event Interview (BEI)
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                      ⏱️ Durasi ±15 Menit
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 pt-3 border-t border-white/[0.08]">
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Landasan Pertanyaan</p>
                    <p className="text-xs text-white/90 font-medium leading-relaxed">
                      7 Kompetensi Inti IT (Kamus Spencer & Spencer)
                    </p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Metode Penggalian</p>
                    <p className="text-xs text-white/90 font-medium leading-relaxed">
                      STAR (Situation, Task, Action, Result) + FACT Probing
                    </p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fokus Penilaian</p>
                    <p className="text-xs text-white/90 font-medium leading-relaxed">
                      Bukti tindakan & pengalaman nyata, bukan teori buku
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-6 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl w-fit">
                        <User className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Data Kandidat</span>
                    </div>
                    {cvData ? (
                        <CVForm data={cvData} onChange={setCvData} />
                    ) : (
                        <textarea 
                            className="w-full h-96 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 text-slate-300 outline-none focus:ring-1 focus:ring-blue-500"
                            value={cvRawText}
                            onChange={(e) => setCvRawText(e.target.value)}
                        />
                    )}
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-6 py-3 bg-purple-500/10 border border-purple-500/20 rounded-xl w-fit text-purple-400">
                        <Briefcase className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Job Requirements</span>
                    </div>
                    {jdData ? (
                        <JDForm data={jdData} onChange={setJdData} />
                    ) : (
                        <textarea 
                            className="w-full h-96 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 text-slate-300 outline-none focus:ring-1 focus:ring-blue-500"
                            value={jdRawText}
                            onChange={(e) => setJdRawText(e.target.value)}
                        />
                    )}
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

