'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, ChevronRight, Briefcase, Loader2, Edit3, CheckCircle, FileUp, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { extractCV, extractJD, CVData, JDData } from '@/lib/gemini-extraction';
import { crossMatch, CrossMatchData } from '@/lib/cross-match';
import { CVForm, JDForm } from '@/components/StructuredDataForm';

export type InterviewMode = 'supportif' | 'profesional' | 'pressure';

interface InterviewSetupProps {
  onStart: (cvText: string, jdText: string, crossMatchData: CrossMatchData, mode: InterviewMode) => void;
}

const MODES: {
  id: InterviewMode;
  name: string;
  persona: string;
  role: string;
  tagline: string;
  traits: string[];
  color: string;
  colorMuted: string;
  colorBorder: string;
  colorText: string;
  dot: string;
}[] = [
  {
    id: 'supportif',
    name: 'Supportif',
    persona: 'Kak Rina',
    role: 'HR Generalist · 3 Tahun',
    tagline: 'Hangat, sabar, encouraging',
    traits: ['Kasih hint kalau jawaban kurang', 'Validasi setiap jawaban bagus', 'Pace lambat & nyaman'],
    color: '#10b981',
    colorMuted: 'rgba(16,185,129,0.08)',
    colorBorder: 'rgba(16,185,129,0.25)',
    colorText: '#6ee7b7',
    dot: 'bg-emerald-500',
  },
  {
    id: 'profesional',
    name: 'Profesional',
    persona: 'Siti Rahayu',
    role: 'Director of Talent · 20 Tahun',
    tagline: 'Warm but firm — standar industri',
    traits: ['Pertanyaan adaptif dari CV & JD', 'Tegas namun tetap empati', 'Gali jawaban lebih dalam'],
    color: '#3b82f6',
    colorMuted: 'rgba(59,130,246,0.08)',
    colorBorder: 'rgba(59,130,246,0.25)',
    colorText: '#93c5fd',
    dot: 'bg-blue-500',
  },
  {
    id: 'pressure',
    name: 'Pressure Test',
    persona: 'Pak Arief',
    role: 'Director of People · 18 Tahun',
    tagline: 'Skeptis, kritis, tanpa basa-basi',
    traits: ['Potong jawaban klise langsung', 'Diam panjang setelah kamu jawab', 'Pertanyaan jebakan & challenge'],
    color: '#ef4444',
    colorMuted: 'rgba(239,68,68,0.08)',
    colorBorder: 'rgba(239,68,68,0.25)',
    colorText: '#fca5a5',
    dot: 'bg-red-500',
  },
];

type SetupStep = 'input' | 'review';

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

  const [interviewMode, setInterviewMode] = useState<InterviewMode>('profesional');

  const cvFileRef = useRef<HTMLInputElement>(null);
  const jdFileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cv' | 'jd') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'cv') setIsCvAnalyzing(true);
    else setIsJdAnalyzing(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      const mimeType = file.type;

      try {
        if (type === 'cv') {
          const extracted = await extractCV({ file: { base64, mimeType } });
          setCvData(extracted);
        } else {
          const extracted = await extractJD({ file: { base64, mimeType } });
          setJdData(extracted);
        }
      } catch (err) {
        console.error('Extraction failed:', err);
        alert('Gagal mengekstrak data dari file. Silakan coba tempel teks secara manual.');
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

    if (cvNeeded) setIsCvAnalyzing(true);
    if (jdNeeded) setIsJdAnalyzing(true);

    try {
        const promises = [];
        if (cvNeeded) {
          promises.push(extractCV({ text: cvRawText }).then(data => setCvData(data)));
        }
        if (jdNeeded) {
          promises.push(extractJD({ text: jdRawText }).then(data => setJdData(data)));
        }
        await Promise.all(promises);
        setStep('review');
    } catch (e) {
        console.error('Structuring failed:', e);
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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12">
      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.div 
            key="input-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-12"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/40">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <div className="text-center space-y-2">
                <h1 className="text-5xl font-bold tracking-tighter text-white font-sans sm:text-7xl text-center">
                  interv<span className="text-blue-500">you</span>
                </h1>
                <p className="text-slate-400 text-xl font-light">
                  Simulasi wawancara profesional bertenaga AI.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* CV Section */}
              <div className="bento-card bg-slate-900/40 border-slate-800 p-8 space-y-6 relative overflow-hidden">
                {isCvAnalyzing && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                    <p className="text-white font-bold">Mengekstrak CV...</p>
                    <p className="text-slate-400 text-xs mt-1">Kami sedang merapikan data Anda</p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-100">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <h2 className="font-semibold text-xl">Resume / CV</h2>
                  </div>
                  <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
                    <button 
                      onClick={() => setCvInputMethod('paste')}
                      className={`px-3 py-1 text-[10px] uppercase tracking-widest font-bold rounded ${cvInputMethod === 'paste' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                    >
                      Paste
                    </button>
                    <button 
                      onClick={() => setCvInputMethod('upload')}
                      className={`px-3 py-1 text-[10px] uppercase tracking-widest font-bold rounded ${cvInputMethod === 'upload' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                    >
                      Upload
                    </button>
                  </div>
                </div>

                {cvData ? (
                  <div className="w-full h-80 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center justify-center gap-3 p-8 text-center">
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
                    className="w-full h-80 bg-slate-950/50 border border-slate-800 rounded-2xl p-5 text-slate-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none resize-none text-sm leading-relaxed"
                    value={cvRawText}
                    onChange={(e) => setCvRawText(e.target.value)}
                  />
                ) : (
                  <div 
                    onClick={() => cvFileRef.current?.click()}
                    className="w-full h-80 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-slate-900/50 transition-all cursor-pointer group"
                  >
                    <div className="p-4 bg-slate-800/50 rounded-full group-hover:scale-110 transition-transform">
                        <FileUp className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Klik untuk unggah PDF atau Gambar</p>
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest">PDF, PNG, JPG</p>
                    <input type="file" ref={cvFileRef} className="hidden" accept=".pdf,image/*" onChange={(e) => handleFileUpload(e, 'cv')} />
                  </div>
                )}
              </div>

              {/* JD Section */}
              <div className="bento-accent rounded-[2rem] p-8 space-y-6 relative overflow-hidden">
                {isJdAnalyzing && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                    <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-3" />
                    <p className="text-white font-bold">Mengekstrak Role...</p>
                    <p className="text-slate-300/60 text-xs mt-1">Menganalisis kebutuhan pekerjaan</p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-100">
                    <div className="p-2.5 bg-blue-400/10 rounded-xl border border-blue-400/20">
                      <Briefcase className="w-5 h-5 text-blue-400" />
                    </div>
                    <h2 className="font-semibold text-xl">Job Description</h2>
                  </div>
                  <div className="flex bg-slate-950/30 p-1 rounded-lg border border-slate-800">
                    <button 
                      onClick={() => setJdInputMethod('paste')}
                      className={`px-3 py-1 text-[10px] uppercase tracking-widest font-bold rounded ${jdInputMethod === 'paste' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                    >
                      Paste
                    </button>
                    <button 
                      onClick={() => setJdInputMethod('upload')}
                      className={`px-3 py-1 text-[10px] uppercase tracking-widest font-bold rounded ${jdInputMethod === 'upload' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                    >
                      Upload
                    </button>
                  </div>
                </div>

                {jdData ? (
                  <div className="w-full h-80 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center justify-center gap-3 p-8 text-center">
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
                    className="w-full h-80 bg-slate-950/30 border border-slate-800/50 rounded-2xl p-5 text-slate-300 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all outline-none resize-none text-sm leading-relaxed"
                    value={jdRawText}
                    onChange={(e) => setJdRawText(e.target.value)}
                  />
                ) : (
                  <div 
                    onClick={() => jdFileRef.current?.click()}
                    className="w-full h-80 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-slate-950/20 transition-all cursor-pointer group"
                  >
                    <div className="p-4 bg-slate-950/40 rounded-full group-hover:scale-110 transition-transform">
                        <FileUp className="w-8 h-8 text-blue-400" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Klik untuk unggah Job Description</p>
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest">File apa saja</p>
                    <input type="file" ref={jdFileRef} className="hidden" onChange={(e) => handleFileUpload(e, 'jd')} />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={handleProcessRaw}
                disabled={((!cvRawText && !cvData) || (!jdRawText && !jdData)) || isCvAnalyzing || isJdAnalyzing}
                className="group relative inline-flex items-center gap-3 px-10 py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-900/20 overflow-hidden"
              >
                <span>Lanjut ke Review Data</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'review' && (
          <motion.div 
            key="review-step"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-20"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/60 p-8 rounded-[2.5rem] border border-slate-800 gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
                        <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Review & Edit Data</h2>
                        <p className="text-slate-400 text-sm">Pastikan semua data sudah akurat sebelum mulai wawancara.</p>
                    </div>
                </div>
                <button
                    onClick={handleFinalStart}
                    disabled={isCrossMatching}
                    className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
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

            {/* Mode Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-800/80" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Pilih Mode Wawancara</span>
                <div className="h-px flex-1 bg-slate-800/80" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {MODES.map((m) => {
                  const selected = interviewMode === m.id;
                  return (
                    <motion.button
                      key={m.id}
                      onClick={() => setInterviewMode(m.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                      className="relative text-left rounded-2xl p-5 transition-all duration-200 overflow-hidden"
                      style={{
                        background: selected ? m.colorMuted : 'rgba(255,255,255,0.02)',
                        border: `1.5px solid ${selected ? m.color : 'rgba(255,255,255,0.06)'}`,
                        boxShadow: selected ? `0 0 28px ${m.color}22, 0 0 0 1px ${m.color}15 inset` : 'none',
                      }}
                    >
                      {selected && (
                        <motion.div
                          layoutId="mode-glow"
                          className="absolute inset-0 rounded-2xl pointer-events-none"
                          style={{ background: `radial-gradient(ellipse at 50% 0%, ${m.color}18, transparent 70%)` }}
                        />
                      )}

                      <div className="relative z-10">
                        {/* Top row: dot + recommended badge */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${m.dot}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: m.color }}>
                              {m.name}
                            </span>
                          </div>
                          {m.id === 'profesional' && (
                            <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                              style={{ background: m.colorMuted, color: m.colorText, border: `1px solid ${m.colorBorder}` }}>
                              Default
                            </span>
                          )}
                        </div>

                        {/* Persona name */}
                        <p className="text-base font-bold text-white leading-tight">{m.persona}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 mb-3">{m.role}</p>

                        {/* Tagline */}
                        <p className="text-xs leading-relaxed mb-3" style={{ color: m.colorText }}>
                          {m.tagline}
                        </p>

                        {/* Traits */}
                        <ul className="space-y-1.5">
                          {m.traits.map((t) => (
                            <li key={t} className="flex items-start gap-1.5">
                              <span className="mt-[3px] shrink-0 w-1 h-1 rounded-full" style={{ background: m.color }} />
                              <span className="text-[10px] text-slate-400 leading-snug">{t}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Selected checkmark */}
                        {selected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: m.color }}
                          >
                            <CheckCircle className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
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

