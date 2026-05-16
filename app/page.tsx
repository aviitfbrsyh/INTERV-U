'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, History, CheckCircle, Mic } from 'lucide-react';
import { CrossMatchData } from '@/lib/cross-match';
import { runEvaluation, EvaluationData } from '@/lib/evaluate';
import { useAuth } from '@/contexts/AuthContext';
import { saveSession } from '@/lib/session-store';
import Onboarding from '@/components/Onboarding';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { VideoBackground } from '@/components/ui/VideoBackground';

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
    <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: state !== 'landing' ? '#0a0a0f' : 'transparent' }}>

      {state === 'landing' && <VideoBackground src="/untitled_Export_2026-05-14_07-44-09.mp4" crossfade={1.8} />}

      {state !== 'landing' && (
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: 600, height: 600, background: 'rgba(37,99,235,0.09)', borderRadius: '50%', filter: 'blur(120px)' }} />
          <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: 800, height: 800, background: 'rgba(124,58,237,0.09)', borderRadius: '50%', filter: 'blur(150px)' }} />
        </div>
      )}

      {state === 'landing' && <Onboarding />}

      <div style={{ position: 'relative', zIndex: 10 }}>
        <AnimatePresence mode="wait">

          {/* ═══════════════════════════ LANDING ═══════════════════════════ */}
          {state === 'landing' && (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -16 }} style={{ fontFamily: SF }}>

              {/* Vignette */}
              <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'radial-gradient(ellipse at 50% -5%, transparent 35%, rgba(130,110,160,0.12) 100%)', pointerEvents: 'none' }} />

              <div style={{ position: 'relative', zIndex: 2, paddingBottom: 60 }}>

                {/* ─────── NAV ─────── */}
                <div style={{ position: 'sticky', top: 16, zIndex: 50, padding: '0 20px' }}>
                  <div style={{ maxWidth: 980, margin: '0 auto' }}>
                    <GlassCard tint={0.30} blur={18} radius={9999}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 9px 9px 9px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 6 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: 'linear-gradient(145deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(37,99,235,0.38)' }}>
                            <Sparkles size={13} color="#fff" />
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.025em', color: 'rgba(14,14,22,0.85)' }}>
                            interv<span style={{ color: '#2563eb' }}>you</span>
                          </span>
                        </div>

                        <div style={{ display: 'none', gap: 2 }} className="lg:flex">
                          {[['Fitur', '#fitur'], ['Cara Kerja', '#cara-kerja'], ['Persona', '#persona'], ['Harga', '#harga'], ['FAQ', '#faq']].map(([label, href]) => (
                            <a key={label} href={href} style={{ fontSize: 13, fontWeight: 500, color: 'rgba(14,14,22,0.54)', padding: '6px 14px', borderRadius: 9999, textDecoration: 'none' }}>
                              {label}
                            </a>
                          ))}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <GlassButton size="sm" theme="light" onClick={handleMulai} style={{ fontFamily: SF, letterSpacing: '-0.012em' }}>Mulai</GlassButton>
                          {user && (() => { const a = getAvatar(user.displayName ?? user.email ?? '?'); return <ProfileMenu initials={a.initials} bg={a.bg} name={user.displayName ?? ''} onHistory={() => router.push('/history')} onLogout={logout} />; })()}
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </div>

                {/* ─────── HERO ─────── */}
                <section style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 28px 40px' }}>
                  <div className="grid lg:grid-cols-2" style={{ gap: 40, alignItems: 'center', minHeight: '78vh' }}>

                    {/* LEFT — Text */}
                    <div style={{ position: 'relative', zIndex: 3 }}>
                      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={{ marginBottom: 24 }}>
                        <GlassBadge dot="#3b82f6" pulse theme="light" style={{ fontFamily: SF }}>
                          ✦  AI Interview Simulator
                        </GlassBadge>
                      </motion.div>

                      <motion.h1
                        initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        style={{ fontSize: 'clamp(48px, 6.5vw, 92px)', fontWeight: 800, letterSpacing: '-0.045em', color: 'rgba(14,14,22,0.90)', lineHeight: 0.98, margin: '0 0 18px' }}
                      >
                        Latihan Interview,<br />
                        <span style={{ background: 'linear-gradient(120deg, #2563eb 0%, #8b5cf6 50%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                          Seperti Aslinya.
                        </span>
                      </motion.h1>

                      <motion.p
                        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
                        style={{ fontSize: 17, color: 'rgba(14,14,22,0.52)', lineHeight: 1.6, maxWidth: 480, margin: '0 0 32px', letterSpacing: '-0.012em' }}
                      >
                        Simulasi wawancara suara yang mengenal CV dan karir kamu — dipandu AI persona HR profesional.
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
                        style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}
                      >
                        <GlassButton size="lg" theme="light" icon={<ArrowRight size={17} />} onClick={handleMulai} style={{ fontFamily: SF, letterSpacing: '-0.015em' }}>
                          Mulai Simulasi
                        </GlassButton>
                        <GlassButton size="lg" theme="light" style={{ fontFamily: SF, letterSpacing: '-0.015em' }}>
                          Tonton Demo
                        </GlassButton>
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ display: 'flex' }}>
                          {['#6366f1', '#ec4899', '#f97316'].map((c, i) => (
                            <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: '2px solid rgba(255,255,255,0.55)', marginLeft: i === 0 ? 0 : -8, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} />
                          ))}
                        </div>
                        <span style={{ fontSize: 12, color: 'rgba(14,14,22,0.48)', letterSpacing: '-0.008em' }}>
                          1.200+ kandidat sudah berlatih
                        </span>
                      </motion.div>
                    </div>

                    {/* RIGHT — Floating 3D Scene */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                      style={{ position: 'relative', width: '100%', minHeight: 540, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {/* Ambient glow behind scene */}
                      <div aria-hidden style={{ position: 'absolute', inset: '10% 10%', background: 'radial-gradient(circle at 50% 50%, rgba(139,92,246,0.22) 0%, transparent 60%)', filter: 'blur(60px)' }} />

                      {/* Main 3D character */}
                      <Float3D
                        src="/3d/hero-character.png"
                        alt="AI Persona"
                        floatY={10}
                        duration={6}
                        style={{ position: 'relative', width: '80%', maxWidth: 460, zIndex: 2 }}
                      />

                      {/* Floating CV card top-left */}
                      <motion.div
                        initial={{ opacity: 0, x: -20, y: -10 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 0.6 }}
                        style={{ position: 'absolute', top: '12%', left: 0, width: 200, zIndex: 3 }}
                      >
                        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}>
                          <GlassCard tint={0.36} blur={14} radius={18}>
                            <div style={{ padding: '12px 14px' }}>
                              <Float3D src="/3d/hero-cv-card.png" alt="CV preview" style={{ width: '100%', height: 'auto', marginBottom: 8, borderRadius: 12 }} />
                              <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: 'rgba(14,14,22,0.85)', margin: 0, letterSpacing: '-0.01em' }}>CV Analysis Preview</p>
                              <p style={{ fontFamily: SF, fontSize: 9, color: 'rgba(14,14,22,0.45)', margin: '2px 0 0' }}>Realtime extraction</p>
                            </div>
                          </GlassCard>
                        </motion.div>
                      </motion.div>

                      {/* Floating voice card mid-right */}
                      <motion.div
                        initial={{ opacity: 0, x: 20, y: 10 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 0.75 }}
                        style={{ position: 'absolute', top: '32%', right: 0, width: 210, zIndex: 3 }}
                      >
                        <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}>
                          <GlassCard tint={0.36} blur={14} radius={18}>
                            <div style={{ padding: '12px 14px' }}>
                              <Float3D src="/3d/hero-voice-card.png" alt="Voice viz" style={{ width: '100%', height: 'auto', marginBottom: 8, borderRadius: 12 }} />
                              <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: 'rgba(14,14,22,0.85)', margin: 0, letterSpacing: '-0.01em' }}>Real-time Voice</p>
                              <p style={{ fontFamily: SF, fontSize: 9, color: 'rgba(14,14,22,0.45)', margin: '2px 0 0' }}>Low latency</p>
                            </div>
                          </GlassCard>
                        </motion.div>
                      </motion.div>

                      {/* Floating avatar chips */}
                      <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.95 }} style={{ position: 'absolute', top: '8%', right: '10%', zIndex: 4 }}>
                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}>
                          <Float3D src="/3d/hero-avatar-1.png" alt="" style={{ width: 50, height: 50, borderRadius: '50%' }} />
                        </motion.div>
                      </motion.div>
                      <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.05 }} style={{ position: 'absolute', top: '22%', right: '4%', zIndex: 4 }}>
                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
                          <Float3D src="/3d/hero-avatar-2.png" alt="" style={{ width: 44, height: 44, borderRadius: '50%' }} />
                        </motion.div>
                      </motion.div>

                      {/* Live transcript pill — bottom of scene */}
                      <motion.div
                        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
                        style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', zIndex: 5, width: '90%', maxWidth: 380 }}
                      >
                        <GlassCard tint={0.32} blur={14} radius={14}>
                          <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                              <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 1.8, repeat: Infinity }} style={{ position: 'absolute', inset: -2, borderRadius: '50%', background: '#10b981' }} />
                              <span style={{ position: 'relative', display: 'block', width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
                            </div>
                            <p style={{ fontFamily: SF, fontSize: 11, color: 'rgba(14,14,22,0.70)', margin: 0, lineHeight: 1.45, letterSpacing: '-0.008em' }}>
                              Live holographic text stream — premium simulation preview.
                            </p>
                          </div>
                        </GlassCard>
                      </motion.div>
                    </motion.div>
                  </div>
                </section>

                {/* ─────── BENTO FEATURES ─────── */}
                <section id="fitur" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 28px 100px' }}>
                  <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <GlassBadge theme="light" style={{ fontFamily: SF }}>Fitur Unggulan</GlassBadge>
                    <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', fontWeight: 800, letterSpacing: '-0.035em', color: 'rgba(14,14,22,0.90)', margin: '16px 0 8px', lineHeight: 1.05 }}>
                      Teknologi yang <em style={{ fontStyle: 'italic', fontWeight: 600 }}>benar-benar</em> bekerja.
                    </h2>
                    <p style={{ fontSize: 15, color: 'rgba(14,14,22,0.46)', maxWidth: 460, margin: '0 auto', letterSpacing: '-0.008em', lineHeight: 1.55 }}>
                      Setiap fitur dirancang untuk pengalaman sedekat mungkin dengan interview sesungguhnya.
                    </p>
                  </div>

                  <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: 'minmax(220px, auto)', gap: 14 }}>

                    {/* Card 1 — Deep CV Analysis (wide) */}
                    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} style={{ gridColumn: 'span 2' }}>
                      <GlassCard tint={0.24} blur={12} radius={24} interactive strong>
                        <div style={{ padding: '26px 26px 0', position: 'relative', overflow: 'hidden', height: '100%', minHeight: 260 }}>
                          <Float3D src="/3d/feat-document.png" alt="" floatY={6} duration={5.5} style={{ position: 'absolute', right: -10, top: 30, width: 240, height: 'auto', zIndex: 1 }} />
                          <div style={{ position: 'relative', zIndex: 2, maxWidth: '55%' }}>
                            <GlassBadge theme="light" style={{ fontFamily: SF, fontSize: 9 }}>Gemini Pro 2.0</GlassBadge>
                            <h3 style={{ fontFamily: SF, fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', color: 'rgba(14,14,22,0.90)', margin: '14px 0 8px' }}>Deep CV Analysis</h3>
                            <p style={{ fontFamily: SF, fontSize: 13, color: 'rgba(14,14,22,0.50)', lineHeight: 1.55, margin: 0, letterSpacing: '-0.008em' }}>
                              AI membaca CV & Job Desc setingkat Director HR — menemukan setiap nuansa pengalaman, skill, dan gap.
                            </p>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>

                    {/* Card 2 — Voice AI Session */}
                    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}>
                      <GlassCard tint={0.22} blur={10} radius={24} interactive>
                        <div style={{ padding: '22px 20px 0', position: 'relative', overflow: 'hidden', height: '100%', minHeight: 260 }}>
                          <Float3D src="/3d/feat-microphone.png" alt="" floatY={8} duration={4.8} style={{ position: 'absolute', right: -20, bottom: -10, width: 160, zIndex: 1 }} />
                          <div style={{ position: 'relative', zIndex: 2 }}>
                            <h3 style={{ fontFamily: SF, fontSize: 17, fontWeight: 700, letterSpacing: '-0.022em', color: 'rgba(14,14,22,0.88)', margin: '0 0 6px' }}>Voice AI Session</h3>
                            <p style={{ fontFamily: SF, fontSize: 12, color: 'rgba(14,14,22,0.48)', lineHeight: 1.55, margin: 0, letterSpacing: '-0.006em' }}>
                              Bicara langsung, low latency. Natural seperti telepon dengan rekruter.
                            </p>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>

                    {/* Card 3 — Instant Evaluation */}
                    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}>
                      <GlassCard tint={0.22} blur={10} radius={24} interactive>
                        <div style={{ padding: '22px 20px 0', position: 'relative', overflow: 'hidden', height: '100%', minHeight: 260 }}>
                          <Float3D src="/3d/feat-evaluation.png" alt="" floatY={6} duration={5} style={{ position: 'absolute', right: -10, bottom: -10, width: 170, zIndex: 1 }} />
                          <div style={{ position: 'relative', zIndex: 2 }}>
                            <h3 style={{ fontFamily: SF, fontSize: 17, fontWeight: 700, letterSpacing: '-0.022em', color: 'rgba(14,14,22,0.88)', margin: '0 0 6px' }}>Instant Evaluation</h3>
                            <p style={{ fontFamily: SF, fontSize: 12, color: 'rgba(14,14,22,0.48)', lineHeight: 1.55, margin: 0, letterSpacing: '-0.006em' }}>
                              Laporan evaluasi mendalam — kekuatan, kelemahan, dan saran actionable.
                            </p>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>

                    {/* Card 4 — Performance Heatmap */}
                    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}>
                      <GlassCard tint={0.22} blur={10} radius={24} interactive>
                        <div style={{ padding: '22px 20px 0', position: 'relative', overflow: 'hidden', height: '100%', minHeight: 240 }}>
                          <Float3D src="/3d/feat-heatmap.png" alt="" floatY={8} duration={5.5} style={{ position: 'absolute', right: -10, bottom: -10, width: 150, zIndex: 1 }} />
                          <div style={{ position: 'relative', zIndex: 2 }}>
                            <h3 style={{ fontFamily: SF, fontSize: 17, fontWeight: 700, letterSpacing: '-0.022em', color: 'rgba(14,14,22,0.88)', margin: '0 0 6px' }}>Performance Heatmap</h3>
                            <p style={{ fontFamily: SF, fontSize: 12, color: 'rgba(14,14,22,0.48)', lineHeight: 1.55, margin: 0, letterSpacing: '-0.006em' }}>
                              Visualisasi area yang perlu dilatih lebih lanjut.
                            </p>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>

                    {/* Card 5 — Weakness Detection */}
                    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}>
                      <GlassCard tint={0.22} blur={10} radius={24} interactive>
                        <div style={{ padding: '22px 20px 0', position: 'relative', overflow: 'hidden', height: '100%', minHeight: 240 }}>
                          <Float3D src="/3d/feat-brain.png" alt="" floatY={8} duration={5} style={{ position: 'absolute', right: -10, bottom: -10, width: 160, zIndex: 1 }} />
                          <div style={{ position: 'relative', zIndex: 2 }}>
                            <h3 style={{ fontFamily: SF, fontSize: 17, fontWeight: 700, letterSpacing: '-0.022em', color: 'rgba(14,14,22,0.88)', margin: '0 0 6px' }}>Weakness Detection</h3>
                            <p style={{ fontFamily: SF, fontSize: 12, color: 'rgba(14,14,22,0.48)', lineHeight: 1.55, margin: 0, letterSpacing: '-0.006em' }}>
                              Identifikasi pola jawaban lemah & filler words otomatis.
                            </p>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>

                    {/* Card 6 — AI HR Personas (wide) */}
                    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.4, ease: [0.22, 1, 0.36, 1] }} style={{ gridColumn: 'span 2' }}>
                      <GlassCard tint={0.24} blur={12} radius={24} interactive strong>
                        <div style={{ padding: '24px 24px 0', position: 'relative', overflow: 'hidden', height: '100%', minHeight: 240 }}>
                          <Float3D src="/3d/feat-personas.png" alt="" floatY={6} duration={5.5} style={{ position: 'absolute', right: 10, bottom: -20, width: 280, zIndex: 1 }} />
                          <div style={{ position: 'relative', zIndex: 2, maxWidth: '52%' }}>
                            <GlassBadge theme="light" style={{ fontFamily: SF, fontSize: 9 }}>3 Persona</GlassBadge>
                            <h3 style={{ fontFamily: SF, fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', color: 'rgba(14,14,22,0.90)', margin: '14px 0 8px' }}>AI HR Personas</h3>
                            <p style={{ fontFamily: SF, fontSize: 13, color: 'rgba(14,14,22,0.50)', lineHeight: 1.55, margin: 0, letterSpacing: '-0.008em' }}>
                              Pilih gaya interview — santai, profesional, atau tekanan tinggi.
                            </p>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>

                  </div>
                </section>

                {/* ─────── SPATIAL TIMELINE ─────── */}
                <section id="cara-kerja" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 28px 100px' }}>
                  <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', fontWeight: 800, letterSpacing: '-0.035em', color: 'rgba(14,14,22,0.90)', margin: '0 0 10px', lineHeight: 1.05 }}>
                      Mulai dalam <span style={{ background: 'linear-gradient(90deg, #2563eb, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>4 langkah.</span>
                    </h2>
                    <p style={{ fontSize: 15, color: 'rgba(14,14,22,0.46)', maxWidth: 380, margin: '0 auto', letterSpacing: '-0.008em' }}>
                      Dari upload sampai evaluasi, semua dalam satu alur.
                    </p>
                  </div>

                  <div style={{ position: 'relative', minHeight: 320 }}>
                    {/* SVG curve */}
                    <svg viewBox="0 0 1000 280" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }} aria-hidden>
                      <defs>
                        <linearGradient id="timeline-grad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                          <stop offset="35%" stopColor="#8b5cf6" stopOpacity="0.85" />
                          <stop offset="70%" stopColor="#ec4899" stopOpacity="0.85" />
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0.4" />
                        </linearGradient>
                        <filter id="timeline-glow" x="-20%" y="-50%" width="140%" height="200%">
                          <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
                        </filter>
                      </defs>
                      <path d="M 80 200 Q 230 60, 380 160 T 700 130 T 920 90" stroke="url(#timeline-grad)" strokeWidth="2.5" fill="none" filter="url(#timeline-glow)" />
                      <path d="M 80 200 Q 230 60, 380 160 T 700 130 T 920 90" stroke="url(#timeline-grad)" strokeWidth="1.2" fill="none" opacity="0.9" />
                    </svg>

                    {/* Step nodes */}
                    <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, alignItems: 'start' }}>
                      {[
                        { n: 1, src: '/3d/timeline-doc.png', label: 'Upload CV', desc: 'Paste atau upload dokumen', top: 140 },
                        { n: 2, src: '/3d/timeline-persona.png', label: 'Pilih AI Persona', desc: 'Santai, profesional, atau tekanan', top: 60 },
                        { n: 3, src: '/3d/timeline-mic.png', label: 'Live Wawancara', desc: 'Bicara langsung via mic', top: 120 },
                        { n: 4, src: '/3d/timeline-chart.png', label: 'Get Evaluation', desc: 'Laporan instan di akhir sesi', top: 30 },
                      ].map(({ n, src, label, desc, top }, i) => (
                        <motion.div
                          key={n}
                          initial={{ opacity: 0, scale: 0.7, y: 16 }}
                          whileInView={{ opacity: 1, scale: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                          style={{ paddingTop: top, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                        >
                          <div style={{ position: 'relative', marginBottom: 14 }}>
                            <div style={{ position: 'absolute', inset: -12, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)', filter: 'blur(12px)' }} />
                            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }} style={{ position: 'relative' }}>
                              <GlassCard tint={0.34} blur={12} radius={9999}>
                                <div style={{ width: 92, height: 92, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                  <Float3D src={src} alt={label} floatY={4} duration={3.5} style={{ width: 64, height: 64 }} />
                                  <span style={{ position: 'absolute', bottom: -4, right: -4, background: 'linear-gradient(145deg, #3b82f6, #8b5cf6)', color: '#fff', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, fontFamily: SF, boxShadow: '0 4px 10px rgba(59,130,246,0.45)', border: '2px solid rgba(255,255,255,0.4)' }}>
                                    {n}
                                  </span>
                                </div>
                              </GlassCard>
                            </motion.div>
                          </div>
                          <h4 style={{ fontFamily: SF, fontSize: 14, fontWeight: 700, letterSpacing: '-0.018em', color: 'rgba(14,14,22,0.88)', margin: '0 0 4px' }}>{label}</h4>
                          <p style={{ fontFamily: SF, fontSize: 11, color: 'rgba(14,14,22,0.46)', lineHeight: 1.5, margin: 0, maxWidth: 160, letterSpacing: '-0.006em' }}>{desc}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* ─────── AI PERSONA CARDS ─────── */}
                <section id="persona" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 28px 100px' }}>
                  <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <GlassBadge theme="light" style={{ fontFamily: SF }}>AI Persona</GlassBadge>
                    <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', fontWeight: 800, letterSpacing: '-0.035em', color: 'rgba(14,14,22,0.90)', margin: '16px 0 8px', lineHeight: 1.05 }}>
                      Pilih gaya interviewer.
                    </h2>
                    <p style={{ fontSize: 15, color: 'rgba(14,14,22,0.46)', maxWidth: 460, margin: '0 auto', letterSpacing: '-0.008em' }}>
                      Tiga persona dengan pendekatan berbeda — pilih yang paling cocok untuk persiapanmu.
                    </p>
                  </div>

                  <div className="grid lg:grid-cols-3" style={{ gap: 18 }}>
                    {[
                      { name: 'Siti Rahayu', src: '/3d/persona-siti.png', role: 'Director HR', tone: 'Profesional', tags: ['Hangat', 'Tajam', 'Detail'], color: '#8b5cf6', rotate: -2 },
                      { name: 'Kak Rina', src: '/3d/persona-maya.png', role: 'HR Lead', tone: 'Santai', tags: ['Friendly', 'Casual', 'Supportif'], color: '#ec4899', rotate: 0 },
                      { name: 'Pak Arief', src: '/3d/persona-alex.png', role: 'Senior Recruiter', tone: 'Tekanan', tags: ['Challenging', 'Probing', 'Tegas'], color: '#3b82f6', rotate: 2 },
                    ].map((p, i) => (
                      <motion.div
                        key={p.name}
                        initial={{ opacity: 0, y: 30, rotate: 0 }}
                        whileInView={{ opacity: 1, y: 0, rotate: p.rotate }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ rotate: 0, scale: 1.03, y: -4 }}
                      >
                        <GlassCard tint={0.30} blur={14} radius={28} strong>
                          <div style={{ padding: '24px 22px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                              <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
                                <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', background: `radial-gradient(circle, ${p.color}40 0%, transparent 70%)`, filter: 'blur(8px)' }} />
                                <Float3D src={p.src} alt={p.name} floatY={3} duration={4} style={{ position: 'relative', width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
                              </div>
                              <div>
                                <h4 style={{ fontFamily: SF, fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', color: 'rgba(14,14,22,0.90)', margin: '0 0 2px' }}>{p.name}</h4>
                                <p style={{ fontFamily: SF, fontSize: 11, color: 'rgba(14,14,22,0.50)', margin: 0, letterSpacing: '-0.006em' }}>{p.role}</p>
                              </div>
                              <div style={{ marginLeft: 'auto' }}>
                                <GlassBadge theme="light" style={{ fontFamily: SF, fontSize: 9 }}>{p.tone}</GlassBadge>
                              </div>
                            </div>

                            {/* Voice waveform */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 28, marginBottom: 14, padding: '0 4px' }}>
                              {Array.from({ length: 28 }).map((_, idx) => (
                                <motion.div
                                  key={idx}
                                  animate={{ height: [4, 6 + ((idx * 5 + i) % 18), 4] }}
                                  transition={{ duration: 1.2 + (idx % 4) * 0.15, repeat: Infinity, delay: idx * 0.05, ease: 'easeInOut' }}
                                  style={{ width: 2.5, borderRadius: 2, background: `linear-gradient(to top, ${p.color}40, ${p.color})`, flex: 1 }}
                                />
                              ))}
                            </div>

                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {p.tags.map(t => (
                                <span key={t} style={{ fontFamily: SF, fontSize: 10, fontWeight: 500, color: 'rgba(14,14,22,0.60)', background: 'rgba(255,255,255,0.40)', padding: '4px 10px', borderRadius: 9999, letterSpacing: '-0.005em' }}>{t}</span>
                              ))}
                            </div>
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* ─────── PRICING DOCK ─────── */}
                <section id="harga" style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 28px 100px' }}>
                  <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', fontWeight: 800, letterSpacing: '-0.035em', color: 'rgba(14,14,22,0.90)', margin: '0 0 10px', lineHeight: 1.05 }}>
                      Mulai <span style={{ background: 'linear-gradient(90deg, #2563eb, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>gratis.</span>
                    </h2>
                    <p style={{ fontSize: 14, color: 'rgba(14,14,22,0.44)', letterSpacing: '-0.008em' }}>Investasi kecil, lonjakan karir yang besar.</p>
                  </div>

                  <div className="grid lg:grid-cols-3" style={{ gap: 14, alignItems: 'center' }}>
                    {[
                      { tier: 'Gratis', price: 'Rp 0', per: 'selamanya', features: ['1 Sesi / Hari', 'Analisis CV Dasar', 'Feedback Teks'], accent: false, scale: 1 },
                      { tier: 'Profesional', price: 'Rp 99rb', per: 'per bulan', features: ['Sesi Tanpa Batas', 'Analisis Mendalam', 'Voice Persona', 'Riwayat Tersimpan'], accent: true, scale: 1.04 },
                      { tier: 'Elite', price: 'Rp 299rb', per: 'sekali bayar', features: ['Lifetime Access', 'Semua Fitur Pro', 'Priority Support'], accent: false, scale: 1 },
                    ].map(({ tier, price, per, features, accent, scale }, i) => (
                      <motion.div
                        key={tier}
                        initial={{ opacity: 0, y: 26 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08, duration: 0.5 }}
                        style={{ transform: `scale(${scale})`, position: 'relative' }}
                      >
                        {accent && (
                          <div aria-hidden style={{ position: 'absolute', inset: -8, borderRadius: 28, background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.30) 0%, transparent 70%)', filter: 'blur(16px)', pointerEvents: 'none' }} />
                        )}
                        <GlassCard tint={accent ? 0.34 : 0.20} blur={accent ? 14 : 8} radius={24} strong={accent}>
                          <div style={{ padding: '28px 22px', position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                              <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', color: accent ? '#2563eb' : 'rgba(14,14,22,0.38)', textTransform: 'uppercase' as const, margin: 0 }}>{tier}</p>
                              {accent && <GlassBadge theme="light" style={{ fontFamily: SF, fontSize: 9 }}>Terpopuler ✦</GlassBadge>}
                            </div>
                            <p style={{ fontFamily: SF, fontSize: 38, fontWeight: 800, letterSpacing: '-0.04em', color: 'rgba(14,14,22,0.90)', margin: '0 0 2px', lineHeight: 1 }}>{price}</p>
                            <p style={{ fontFamily: SF, fontSize: 12, color: 'rgba(14,14,22,0.32)', margin: '0 0 22px' }}>{per}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
                              {features.map(f => (
                                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <span style={{ fontSize: 13, color: accent ? '#2563eb' : 'rgba(14,14,22,0.38)' }}>{accent ? '✦' : '✓'}</span>
                                  <span style={{ fontFamily: SF, fontSize: 13, color: accent ? 'rgba(14,14,22,0.72)' : 'rgba(14,14,22,0.54)', fontWeight: accent ? 500 : 400, letterSpacing: '-0.008em' }}>{f}</span>
                                </div>
                              ))}
                            </div>
                            <GlassButton fullWidth size="md" theme="light" onClick={handleMulai} style={{ fontFamily: SF, letterSpacing: '-0.012em' }}>
                              {tier === 'Gratis' ? 'Mulai Gratis' : tier === 'Elite' ? 'Pilih Elite' : 'Mulai Langganan'}
                            </GlassButton>
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* ─────── FAQ ─────── */}
                <section id="faq" style={{ maxWidth: 680, margin: '0 auto', padding: '40px 28px 80px' }}>
                  <h2 style={{ fontFamily: SF, fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'rgba(14,14,22,0.90)', margin: '0 0 32px', textAlign: 'center' }}>
                    Pertanyaan Umum
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { q: 'Apakah ini benar-benar suara AI?', a: 'Ya, kami menggunakan Google Gemini Live API — suara real-time dengan latensi sangat rendah dan respons alami.' },
                      { q: 'Berapa lama durasi per sesi?', a: 'Standar 10–15 menit, tapi kamu bisa akhiri kapan saja setelah cukup feedback.' },
                      { q: 'Apakah data CV saya aman?', a: 'CV hanya digunakan selama sesi berlangsung dan tidak disimpan di server kami setelah sesi berakhir.' },
                      { q: 'Bisa pilih bahasa lain?', a: 'Saat ini fokus Bahasa Indonesia untuk akurasi terbaik. Dukungan Bahasa Inggris segera hadir.' },
                    ].map(({ q, a }, i) => (
                      <GlassCard key={q} tint={openFaq === i ? 0.28 : 0.18} blur={8} radius={18}>
                        <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '18px 22px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                            <p style={{ fontFamily: SF, fontSize: 14, fontWeight: 600, letterSpacing: '-0.015em', color: 'rgba(14,14,22,0.86)', margin: 0 }}>{q}</p>
                            <motion.span animate={{ rotate: openFaq === i ? 45 : 0 }} transition={{ duration: 0.25 }} style={{ fontSize: 18, color: 'rgba(14,14,22,0.40)', flexShrink: 0, fontWeight: 300 }}>+</motion.span>
                          </div>
                          <AnimatePresence>
                            {openFaq === i && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} style={{ overflow: 'hidden' }}>
                                <p style={{ fontFamily: SF, fontSize: 13, color: 'rgba(14,14,22,0.50)', lineHeight: 1.6, margin: '10px 0 0', letterSpacing: '-0.008em' }}>{a}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>
                      </GlassCard>
                    ))}
                  </div>
                </section>

                {/* ─────── FOOTER DOCK ─────── */}
                <footer style={{ padding: '0 28px 40px', maxWidth: 980, margin: '0 auto' }}>
                  <GlassCard tint={0.24} blur={14} radius={9999}>
                    <div style={{ padding: '12px 12px 12px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 7, background: 'linear-gradient(145deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Sparkles size={11} color="#fff" />
                        </div>
                        <span style={{ fontFamily: SF, fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em', color: 'rgba(14,14,22,0.68)' }}>
                          interv<span style={{ color: '#2563eb' }}>you</span>
                        </span>
                        <span style={{ fontFamily: SF, fontSize: 11, color: 'rgba(14,14,22,0.28)', marginLeft: 4 }}>© 2026</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {['Pricing', 'Terms', 'Twitter', 'Privacy'].map(l => (
                          <a key={l} href="#" style={{ fontFamily: SF, fontSize: 12, fontWeight: 500, color: 'rgba(14,14,22,0.50)', textDecoration: 'none', letterSpacing: '-0.005em', padding: '6px 12px', borderRadius: 9999 }}>{l}</a>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                </footer>

              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════ SETUP ═══════════════════════════ */}
          {state === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.4 }} className="py-12 px-4 min-h-screen flex flex-col">
              <nav className="max-w-7xl mx-auto py-8 flex items-center gap-2 mb-12 w-full">
                <button onClick={() => setState('landing')} className="flex items-center gap-2 group cursor-pointer">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold tracking-tighter text-white">interv<span className="text-blue-500">you</span></span>
                  <span className="text-xs text-slate-500 ml-4 hidden sm:inline px-3 py-1 border border-white/10 rounded-full">Setup Phase</span>
                </button>
              </nav>
              <div className="flex-grow flex items-center">
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
