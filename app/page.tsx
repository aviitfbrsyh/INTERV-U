'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Sparkles, History, CheckCircle } from 'lucide-react';
import { CrossMatchData } from '@/lib/cross-match';
import { runEvaluation, EvaluationData } from '@/lib/evaluate';
import { useAuth } from '@/contexts/AuthContext';
import { saveSession } from '@/lib/session-store';
import Onboarding from '@/components/Onboarding';
import Landing from '@/components/Landing';
import AmbientBackground from '@/components/AmbientBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassBadge } from '@/components/ui/GlassBadge';

const InterviewSetup = dynamic(() => import('@/components/InterviewSetup'), { ssr: false });
const LiveInterview = dynamic(() => import('@/components/LiveInterview'), { ssr: false });
const InterviewEvaluation = dynamic(() => import('@/components/InterviewEvaluation'), { ssr: false });

type AppState = 'landing' | 'setup' | 'interview' | 'evaluation';
type InterviewMode = 'supportif' | 'profesional' | 'pressure';

const SF = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif`;

/* ─────────────────────────── HELPERS ─────────────────────────── */

function getAvatar(name: string): { initials: string; bg: string } {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';
  const palette = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6','#06b6d4'];
  const bg = palette[name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length];
  return { initials, bg };
}

function ProfileMenu({ initials, bg, name, onHistory, onLogout }: {
  initials: string; bg: string; name: string;
  onHistory: () => void; onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [open]);

  return (
    <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(o => !o)} style={{ width: 34, height: 34, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 800, fontFamily: SF, cursor: 'pointer', border: '2.5px solid rgba(255,255,255,0.32)', flexShrink: 0 }}>
        {initials}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.94, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: -6 }} transition={{ duration: 0.14 }} style={{ position: 'absolute', right: 0, top: 44, width: 200, zIndex: 50 }}>
            <GlassCard tint={0.34} blur={14} radius={18}>
              <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid rgba(14,14,22,0.07)' }}>
                <p style={{ fontFamily: SF, fontSize: 12, fontWeight: 700, color: 'rgba(14,14,22,0.80)', margin: 0 }}>{name}</p>
                <p style={{ fontFamily: SF, fontSize: 10, color: 'rgba(14,14,22,0.36)', margin: '2px 0 0' }}>Akun tersambung</p>
              </div>
              <div style={{ padding: '6px' }}>
                <button onClick={() => { setOpen(false); onHistory(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 11, fontFamily: SF, fontSize: 13, fontWeight: 500, color: 'rgba(14,14,22,0.70)', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <History size={14} style={{ opacity: 0.65 }} /> Riwayat Sesi
                </button>
                <button onClick={() => { setOpen(false); onLogout(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 11, fontFamily: SF, fontSize: 13, fontWeight: 500, color: 'rgba(200,30,30,0.72)', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontSize: 14, lineHeight: 1 }}>↩</span> Keluar
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function extractField(text: string, keys: string[]): string {
  for (const key of keys) {
    const m = text.match(new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`, 'i'));
    if (m?.[1]?.trim()) return m[1].trim();
  }
  return text.split('\n').find(l => { const t = l.trim(); return t.length > 2 && !t.startsWith('{') && !t.startsWith('"') && !t.startsWith('['); })?.trim() ?? '';
}

/* Floating 3D image — hides itself gracefully if file is missing */
function Float3D({ src, alt, style, delay = 0, duration = 5, floatY = 12 }: { src: string; alt: string; style?: React.CSSProperties; delay?: number; duration?: number; floatY?: number }) {
  return (
    <motion.img
      src={src}
      alt={alt}
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0'; }}
      animate={{ y: [0, -floatY, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
      style={{ pointerEvents: 'none', userSelect: 'none', filter: 'drop-shadow(0 18px 36px rgba(60,40,120,0.25))', ...style }}
      draggable={false}
    />
  );
}

/* ─────────────────────────── MAIN PAGE ─────────────────────────── */

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<AppState>('landing');
  const [cvText, setCvText] = useState('');
  const [jdText, setJdText] = useState('');
  const [history, setHistory] = useState('');
  const [crossMatchData, setCrossMatchData] = useState<CrossMatchData | null>(null);
  const [prefetchedEvaluation, setPrefetchedEvaluation] = useState<EvaluationData | null>(null);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [prefetchError, setPrefetchError] = useState<string | null>(null);
  const [interviewMode, setInterviewMode] = useState<InterviewMode>('profesional');
  const [savedToast, setSavedToast] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const savedRef = useRef(false);

  useEffect(() => {
    if (!prefetchedEvaluation || isPrefetching || !user || savedRef.current) return;
    savedRef.current = true;
    const jobTitle = extractField(jdText, ['role', 'title', 'position', 'job_title', 'posisi', 'jabatan']);
    const candidateName = extractField(cvText, ['name', 'nama', 'full_name', 'fullName']);
    saveSession({ userId: user.uid, evaluation: prefetchedEvaluation, cvText, jdText, history, crossMatchData, jobTitle, candidateName }).then(() => {
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 4000);
    }).catch(console.error);
  }, [prefetchedEvaluation, isPrefetching, user, cvText, jdText, history, crossMatchData]);

  const handleStart = (cv: string, jd: string, matchData: CrossMatchData, mode: InterviewMode) => {
    setCvText(cv); setJdText(jd); setCrossMatchData(matchData); setInterviewMode(mode);
    setState('interview');
  };

  const handleEnd = (conversationHistory: string) => {
    setHistory(conversationHistory);
    setPrefetchedEvaluation(null); setPrefetchError(null); setIsPrefetching(true);
    runEvaluation(conversationHistory, cvText, jdText, crossMatchData)
      .then(result => { setPrefetchedEvaluation(result); setIsPrefetching(false); })
      .catch(err => { setPrefetchError(err?.message || 'Terjadi kesalahan saat membuat evaluasi.'); setIsPrefetching(false); });
    setState('evaluation');
  };

  useEffect(() => {
    if (authLoading || !user) return;
    const intent = sessionStorage.getItem('loginIntent');
    if (intent === 'setup') { sessionStorage.removeItem('loginIntent'); setState('setup'); }
  }, [authLoading, user]);

  const handleMulai = () => {
    if (user) setState('setup');
    else { sessionStorage.setItem('loginIntent', 'setup'); router.push('/login'); }
  };

  const handleReset = () => {
    setState('setup'); setHistory(''); setCrossMatchData(null);
    setPrefetchedEvaluation(null); setPrefetchError(null); setIsPrefetching(false);
    savedRef.current = false;
  };

  return (
    <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: state !== 'landing' ? '#060608' : '#fdfdfd' }}>

      {state === 'evaluation' && (
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(90, 120, 255, 0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(120, 60, 200, 0.08) 0%, transparent 60%), #060608' }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: 500, height: 500, background: 'rgba(90, 120, 255, 0.06)', borderRadius: '50%', filter: 'blur(100px)' }} />
          <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: 600, height: 600, background: 'rgba(120, 60, 200, 0.05)', borderRadius: '50%', filter: 'blur(120px)' }} />
        </div>
      )}

      {/* ═══════════════════════════ LANDING ═══════════════════════════ */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <AnimatePresence mode="wait">
          {state === 'landing' && <Landing onStart={handleMulai} />}

          {/* ═══════════════════════════ SETUP ═══════════════════════════ */}
          {state === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.35 }} className="relative min-h-screen flex flex-col">
              <AmbientBackground />
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.4 }}
                onClick={() => setState('landing')}
                className="absolute top-6 left-6 z-20 flex items-center gap-1.5 rounded-full border-0 bg-white/[0.95] px-3.5 py-[7px] pl-2.5 text-[#060608] text-xs font-bold shadow-[0_4px_14px_rgba(0,0,0,0.25)] transition-all hover:bg-white hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
                style={{ fontFamily: SF, letterSpacing: '-0.01em' }}
              >
                <ArrowLeft size={13} strokeWidth={2.5} />
                Kembali
              </motion.button>
              <div className="relative z-10 flex-grow px-4 sm:px-6 pt-16 pb-8">
                <InterviewSetup onStart={handleStart} />
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════ INTERVIEW ═══════════════════════════ */}
          {state === 'interview' && (
            <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 overflow-hidden">
              <LiveInterview cvText={cvText} jdText={jdText} crossMatchData={crossMatchData} interviewMode={interviewMode} onEnd={handleEnd} />
            </motion.div>
          )}

          {/* ═══════════════════════════ EVALUATION ═══════════════════════════ */}
          {state === 'evaluation' && (
            <motion.div key="evaluation" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="py-12 px-4 min-h-screen flex flex-col">
              <nav className="max-w-7xl mx-auto py-8 flex items-center justify-between mb-12 w-full">
                <button onClick={() => setState('landing')} className="flex items-center gap-2 cursor-pointer">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold tracking-tighter text-white">interv<span className="text-blue-500">you</span></span>
                  <span className="text-xs text-slate-500 ml-4 hidden sm:inline px-3 py-1 border border-white/10 rounded-full">Evaluation</span>
                </button>
                {user && (
                  <button onClick={() => router.push('/history')} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-3 py-2 border border-white/10 rounded-xl">
                    <History size={14} /> Riwayat
                  </button>
                )}
              </nav>

              <AnimatePresence>
                {savedToast && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-emerald-950 border border-emerald-500/40 text-emerald-300 px-5 py-3 rounded-full shadow-2xl text-sm font-bold">
                    <CheckCircle size={16} /> Sesi tersimpan ke riwayatmu
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-grow w-full">
                <InterviewEvaluation history={history} cvText={cvText} jdText={jdText} crossMatchData={crossMatchData} onReset={handleReset} prefetchedEvaluation={prefetchedEvaluation} isPrefetching={isPrefetching} prefetchError={prefetchError} />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}
