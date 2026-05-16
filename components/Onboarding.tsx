'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, Mic2, BarChart2, ArrowRight, X, Check } from 'lucide-react';

const STORAGE_KEY = 'intervyou_onboarded_v2';

const STEPS = [
  {
    Icon: UploadCloud,
    color: '#3b82f6',
    colorMuted: 'rgba(59,130,246,0.12)',
    colorBorder: 'rgba(59,130,246,0.28)',
    colorText: '#93c5fd',
    bg: 'from-blue-600/25 via-blue-900/15 to-transparent',
    title: 'Ceritakan dirimu lewat dokumen',
    desc: 'Unggah CV dan Job Description posisimu. Siti Rahayu — HR AI kami — membaca keduanya untuk merancang pertanyaan yang benar-benar relevan untukmu.',
    features: ['CV dalam format teks atau JSON', 'Job Description posisi yang dilamar', 'Analisis kesesuaian CV vs JD otomatis'],
  },
  {
    Icon: Mic2,
    color: '#8b5cf6',
    colorMuted: 'rgba(139,92,246,0.12)',
    colorBorder: 'rgba(139,92,246,0.28)',
    colorText: '#c4b5fd',
    bg: 'from-violet-600/25 via-violet-900/15 to-transparent',
    title: 'Wawancara senatural mungkin',
    desc: 'Jawab pertanyaan dari Siti secara langsung. Tersedia mode teks dan voice — pilih sesuai kondisimu. Rasakan simulasi yang senyata mungkin sebelum hari-H.',
    features: ['Mode teks real-time dengan AI', 'Voice mode menggunakan mikrofon', 'Pertanyaan adaptif berdasarkan jawabanmu'],
  },
  {
    Icon: BarChart2,
    color: '#10b981',
    colorMuted: 'rgba(16,185,129,0.12)',
    colorBorder: 'rgba(16,185,129,0.28)',
    colorText: '#6ee7b7',
    bg: 'from-emerald-600/25 via-emerald-900/15 to-transparent',
    title: 'Evaluasi sekelas HR profesional',
    desc: 'Setiap jawaban dianalisis secara mendalam — skor ConCISE, STAR Framework, filler word, dan rekomendasi final yang bisa langsung ditindaklanjuti.',
    features: ['Skor ConCISE & STAR per jawaban', 'Deteksi filler word otomatis', 'Laporan PDF & riwayat tersimpan'],
  },
];

export default function Onboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const t = setTimeout(() => setShow(true), 500);
        return () => clearTimeout(t);
      }
    } catch { /* noop */ }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* noop */ }
    setShow(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else dismiss();
  };

  const current = STEPS[step];
  const Icon = current.Icon;

  return (
    <AnimatePresence>
      {show && (
        /* ── Backdrop ── */
        <motion.div
          key="ob-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          style={{ background: 'rgba(2,8,20,0.75)', backdropFilter: 'blur(20px)' }}
          onClick={dismiss}
        >
          {/* ── Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 56, scale: 0.93, rotateX: 6 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: -24, scale: 0.95, filter: 'blur(6px)' }}
            transition={{ type: 'spring', stiffness: 240, damping: 24, mass: 0.9 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-2xl overflow-hidden rounded-3xl"
            style={{
              perspective: 1000,
              background: 'rgba(255,255,255,0.028)',
              backdropFilter: 'blur(48px)',
              border: '1px solid rgba(255,255,255,0.075)',
              boxShadow: `0 40px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.09) inset`,
            }}
          >
            <div className="flex flex-col md:flex-row">

              {/* ══ LEFT PANEL ══ */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`panel-${step}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`md:w-52 shrink-0 bg-gradient-to-br ${current.bg} flex flex-col items-center justify-center py-10 md:py-0 relative overflow-hidden`}
                  style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}
                >
                  {/* Pulsing glow */}
                  <motion.div
                    className="absolute rounded-full blur-3xl"
                    style={{ width: 200, height: 200, background: current.color }}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  {/* Icon box */}
                  <motion.div
                    key={`icon-${step}`}
                    initial={{ scale: 0.5, opacity: 0, rotate: -12 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 20, delay: 0.08 }}
                    className="relative w-20 h-20 rounded-3xl flex items-center justify-center"
                    style={{
                      background: current.colorMuted,
                      border: `1px solid ${current.colorBorder}`,
                      boxShadow: `0 0 40px ${current.color}35, 0 0 0 8px ${current.color}08`,
                    }}
                  >
                    <Icon size={32} style={{ color: current.color }} strokeWidth={1.5} />
                  </motion.div>

                  {/* Step number */}
                  <motion.div
                    key={`num-${step}`}
                    initial={{ opacity: 0, y: 14, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 22, delay: 0.16 }}
                    className="relative mt-6 flex flex-col items-center gap-1"
                  >
                    <span className="text-4xl font-black tabular-nums" style={{ color: current.color }}>
                      0{step + 1}
                    </span>
                    <span className="text-[10px] text-white/22 font-medium tracking-widest">
                      dari {STEPS.length}
                    </span>
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* ══ RIGHT PANEL ══ */}
              <div className="flex-1 flex flex-col min-w-0">

                {/* Logo + close */}
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="flex items-center justify-between px-7 pt-6"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center">
                      <span className="text-white text-[9px] font-black leading-none">i</span>
                    </div>
                    <span className="text-sm font-bold text-white tracking-tight">
                      interv<span className="text-blue-500">you</span>
                    </span>
                  </div>
                  <button
                    onClick={dismiss}
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white/20 hover:text-white/60 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </motion.div>

                {/* Progress bar */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="flex gap-1.5 px-7 mt-4"
                >
                  {STEPS.map((_, i) => (
                    <div key={i} className="flex-1 h-[3px] rounded-full overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: current.color }}
                        initial={false}
                        animate={{ width: i <= step ? '100%' : '0%' }}
                        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                      />
                    </div>
                  ))}
                </motion.div>

                {/* Step content — staggered */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`content-${step}`}
                    className="px-7 pt-6 pb-2 flex-1"
                  >
                    {/* Title */}
                    <motion.h2
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="text-xl font-bold text-white leading-snug mb-2"
                    >
                      {current.title}
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.07, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="text-sm leading-relaxed mb-5"
                      style={{ color: 'rgba(255,255,255,0.44)' }}
                    >
                      {current.desc}
                    </motion.p>

                    {/* Features */}
                    <ul className="space-y-2.5">
                      {current.features.map((f, i) => (
                        <motion.li
                          key={f}
                          initial={{ opacity: 0, x: -14 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.13 + i * 0.08, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                          className="flex items-center gap-3"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.18 + i * 0.08, type: 'spring', stiffness: 400, damping: 18 }}
                            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: current.colorMuted, border: `1px solid ${current.colorBorder}` }}
                          >
                            <Check size={9} style={{ color: current.colorText }} strokeWidth={2.5} />
                          </motion.div>
                          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.58)' }}>{f}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>

                {/* Footer */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28, duration: 0.3 }}
                  className="flex items-center justify-between px-7 py-5"
                >
                  {/* Dot indicators */}
                  <div className="flex items-center gap-2">
                    {STEPS.map((_, i) => (
                      <motion.button
                        key={i}
                        onClick={() => setStep(i)}
                        animate={{
                          width: i === step ? 20 : 6,
                          background: i === step ? current.color : 'rgba(255,255,255,0.14)',
                        }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="h-1.5 rounded-full"
                        style={{ minWidth: 6 }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={dismiss}
                      className="text-xs transition-colors"
                      style={{ color: 'rgba(255,255,255,0.24)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.24)')}
                    >
                      Lewati
                    </button>
                    <motion.button
                      onClick={next}
                      whileHover={{ scale: 1.04, opacity: 0.92 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl"
                      style={{
                        background: current.color,
                        boxShadow: `0 4px 24px ${current.color}50`,
                      }}
                    >
                      {step < STEPS.length - 1 ? 'Lanjut' : 'Mulai Sekarang'}
                      <motion.span
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <ArrowRight size={14} strokeWidth={2} />
                      </motion.span>
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
