/**
 * INTERVYOU LANDING — APPLE iOS 26 LIQUID GLASS DESIGN
 * Full production-ready landing page with all 8 sections
 *
 * Dependencies:
 *   - react
 *   - motion/react
 *   - lucide-react
 *
 * No external images required — graceful fallbacks for all 3D assets
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, ChevronDown, Music, Zap, TrendingUp, Eye, Mic } from 'lucide-react';

const SF = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif`;

/* ════════════════════════════════════════════════════════════════
   LIQUID GLASS SVG FILTERS — Apple iOS 26 style
   ════════════════════════════════════════════════════════════════ */

function LiquidGlassFilter() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} aria-hidden>
      <defs>
        {/* Strong distortion (cards) — lens effect */}
        <filter id="glass-distortion" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" />
          <feComponentTransfer in="noise" result="boosted">
            <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
            <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
            <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
          </feComponentTransfer>
          <feGaussianBlur in="boosted" stdDeviation="3" result="blurred" />
          <feSpecularLighting in="blurred" surfaceScale="5" specularConstant="1.2" specularExponent="100" lightingColor="white" result="spec">
            <fePointLight x="-200" y="-200" z="300" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceGraphic" operator="in" result="specMasked" />
          <feComposite in="SourceGraphic" in2="specMasked" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage" />
          <feDisplacementMap in="litImage" in2="blurred" scale="200" />
        </filter>

        {/* Subtle distortion (buttons, badges) */}
        <filter id="glass-distortion-sm" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.012" numOctaves="2" seed="42" result="noise" />
          <feComponentTransfer in="noise" result="boosted">
            <feFuncR type="gamma" amplitude="1" exponent="6" offset="0.5" />
            <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
            <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
          </feComponentTransfer>
          <feGaussianBlur in="boosted" stdDeviation="1.5" result="blurred" />
          <feDisplacementMap in="SourceGraphic" in2="blurred" scale="80" />
        </filter>
      </defs>
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   GLASS COMPONENTS — 3-layer construction
   ════════════════════════════════════════════════════════════════ */

type GlassCardProps = {
  children: React.ReactNode;
  tint?: number;
  blur?: number;
  radius?: number | string;
  interactive?: boolean;
  strong?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
};

function GlassCard({ children, tint = 0.28, blur = 8, radius = 24, interactive = false, strong = false, style, onClick }: GlassCardProps) {
  const r = typeof radius === 'number' ? `${radius}px` : radius;
  const filterId = strong ? 'glass-distortion' : 'glass-distortion-sm';
  return (
    <motion.div
      onClick={onClick}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: r,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)',
        cursor: interactive ? 'pointer' : 'default',
        ...style,
      }}
      whileHover={interactive ? { scale: 1.015, y: -2 } : undefined}
      whileTap={interactive ? { scale: 0.985 } : undefined}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
    >
      {/* Layer 1 — lensing distortion */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)`, filter: `url(#${filterId})`, isolation: 'isolate', zIndex: 0 }} />
      {/* Layer 2 — white tint */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', background: `rgba(255,255,255,${tint})`, zIndex: 1 }} />
      {/* Layer 3 — specular rim */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', boxShadow: 'inset 2px 2px 1px 0 rgba(255,255,255,0.55), inset -1px -1px 1px 1px rgba(255,255,255,0.40)', zIndex: 2 }} />
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 3 }}>{children}</div>
    </motion.div>
  );
}

type GlassButtonProps = {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  theme?: 'light' | 'dark';
  onClick?: () => void;
  style?: React.CSSProperties;
};

function GlassButton({ children, size = 'md', fullWidth = false, icon, theme = 'light', onClick, style }: GlassButtonProps) {
  const sizes = {
    sm: { padding: '8px 18px', fontSize: 13, radius: 14, minHeight: 36 },
    md: { padding: '13px 24px', fontSize: 15, radius: 16, minHeight: 48 },
    lg: { padding: '15px 28px', fontSize: 15, radius: 18, minHeight: 52 },
  } as const;
  const s = sizes[size];
  const tint = theme === 'light' ? 0.32 : 0.14;
  const color = theme === 'light' ? 'rgba(20,20,36,0.85)' : 'rgba(255,255,255,0.90)';
  return (
    <motion.button
      onClick={onClick}
      style={{
        position: 'relative',
        overflow: 'hidden',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        width: fullWidth ? '100%' : 'auto',
        borderRadius: s.radius,
        minHeight: s.minHeight,
        padding: s.padding,
        fontSize: s.fontSize,
        color,
        letterSpacing: '-0.01em',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)',
        border: 'none',
        ...style,
      }}
      whileHover={{ scale: 1.025, y: -1 }}
      whileTap={{ scale: 0.968 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
    >
      <span aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)', filter: 'url(#glass-distortion-sm)', isolation: 'isolate', zIndex: 0 }} />
      <span aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', background: `rgba(255,255,255,${tint})`, zIndex: 1 }} />
      <span aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', boxShadow: 'inset 2px 2px 1px 0 rgba(255,255,255,0.55), inset -1px -1px 1px 1px rgba(255,255,255,0.40)', zIndex: 2 }} />
      <span style={{ position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon}
        {children}
      </span>
    </motion.button>
  );
}

type GlassBadgeProps = {
  children: React.ReactNode;
  dot?: string;
  pulse?: boolean;
  theme?: 'light' | 'dark';
  style?: React.CSSProperties;
};

function GlassBadge({ children, dot, pulse = false, theme = 'light', style }: GlassBadgeProps) {
  const color = theme === 'light' ? 'rgba(20,20,36,0.60)' : 'rgba(255,255,255,0.70)';
  return (
    <span style={{
      position: 'relative',
      overflow: 'hidden',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 14px',
      borderRadius: 9999,
      boxShadow: '0 3px 12px rgba(0,0,0,0.08), inset 2px 2px 1px rgba(255,255,255,0.50)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.05em',
      color,
      ...style,
    }}>
      <span aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)', filter: 'url(#glass-distortion-sm)', isolation: 'isolate', zIndex: 0 }} />
      <span aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', background: 'rgba(255,255,255,0.28)', zIndex: 1 }} />
      {dot && (
        <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center' }}>
          {pulse ? (
            <span style={{ position: 'relative', display: 'inline-flex' }}>
              <motion.span animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 1.8, repeat: Infinity }} style={{ position: 'absolute', inset: -1, borderRadius: '50%', background: dot }} />
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'block' }} />
            </span>
          ) : (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'block' }} />
          )}
        </span>
      )}
      <span style={{ position: 'relative', zIndex: 2 }}>{children}</span>
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════
   AURORA BACKGROUND — Pure CSS, no video dependency
   ════════════════════════════════════════════════════════════════ */

function AuroraBackground() {
  return (
    <>
      <style>{`
        @keyframes aurora-float-1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(80px,-60px) scale(1.15); } }
        @keyframes aurora-float-2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-100px,80px) scale(1.20); } }
        @keyframes aurora-float-3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(60px,100px) scale(1.10); } }
        @keyframes aurora-float-4 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-80px,-100px) scale(1.18); } }
      `}</style>
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', background: 'linear-gradient(135deg, #e9d4ff 0%, #fce7f3 25%, #d1fae5 55%, #dbeafe 80%, #ddd6fe 100%)' }}>
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,181,253,0.65) 0%, transparent 65%)', filter: 'blur(60px)', animation: 'aurora-float-1 18s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '30%', right: '0%', width: '55%', height: '55%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,207,232,0.65) 0%, transparent 65%)', filter: 'blur(70px)', animation: 'aurora-float-2 22s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '20%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,243,208,0.55) 0%, transparent 65%)', filter: 'blur(80px)', animation: 'aurora-float-3 25s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '50%', left: '40%', width: '45%', height: '45%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(186,230,253,0.55) 0%, transparent 65%)', filter: 'blur(75px)', animation: 'aurora-float-4 20s ease-in-out infinite' }} />
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   FLOATING ELEMENT — Graceful image fallback
   ════════════════════════════════════════════════════════════════ */

function Float3D({ src, alt, style, delay = 0, duration = 5, floatY = 12 }: { src: string; alt: string; style?: React.CSSProperties; delay?: number; duration?: number; floatY?: number }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <motion.img
      src={src}
      alt={alt}
      onLoad={() => setLoaded(true)}
      onError={() => setLoaded(false)}
      animate={loaded ? { y: [0, -floatY, 0] } : { opacity: 0 }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
      style={{ pointerEvents: 'none', userSelect: 'none', filter: 'drop-shadow(0 18px 36px rgba(60,40,120,0.25))', ...style }}
      draggable={false}
    />
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN LANDING PAGE — All 8 Sections
   ════════════════════════════════════════════════════════════════ */

export default function IntervYouLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMulai = () => {
    console.log('Mulai clicked — navigate to login page');
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', fontFamily: SF }}>
      <LiquidGlassFilter />
      <AuroraBackground />

      {/* Vignette overlay */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'radial-gradient(ellipse at 50% -5%, transparent 35%, rgba(130,110,160,0.12) 100%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 1: STICKY NAVIGATION BAR
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

        <motion.div
          style={{ position: 'sticky', top: 16, zIndex: 50, padding: '0 20px' }}
          animate={{ opacity: scrolled ? 0 : 1, pointerEvents: scrolled ? 'none' : 'auto' }}
          transition={{ duration: 0.25 }}
        >
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <GlassCard tint={0.30} blur={18} radius={9999}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 9 }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 6 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(145deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(37,99,235,0.38)', flexShrink: 0 }}>
                    <Sparkles size={13} color="#fff" />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.025em', color: 'rgba(14,14,22,0.85)' }}>
                    interv<span style={{ color: '#2563eb' }}>you</span>
                  </span>
                </div>

                {/* Nav Links */}
                <div style={{ display: 'flex', gap: 2 }}>
                  {[['Fitur', 'fitur'], ['Cara Kerja', 'cara-kerja'], ['Persona', 'persona'], ['Harga', 'harga']].map(([label, id]) => (
                    <button
                      key={id}
                      onClick={() => scrollToSection(id)}
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'rgba(14,14,22,0.54)',
                        padding: '6px 14px',
                        borderRadius: 9999,
                        textDecoration: 'none',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(14,14,22,0.85)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(14,14,22,0.54)')}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* CTA */}
                <GlassButton size="sm" theme="light" onClick={handleMulai} style={{ letterSpacing: '-0.012em', fontWeight: 600 }}>Mulai</GlassButton>
              </div>
            </GlassCard>
          </div>
        </motion.div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 2: HERO
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

        <section style={{ maxWidth: 1380, margin: '0 auto', padding: '60px 28px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, alignItems: 'center', minHeight: '78vh' }}>
            {/* LEFT COLUMN */}
            <div style={{ position: 'relative', zIndex: 3 }}>
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                <GlassBadge dot="#3b82f6" pulse theme="light" style={{ fontSize: 10 }}>✦ AI Interview Simulator</GlassBadge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize: 'clamp(48px, 6.5vw, 92px)',
                  fontWeight: 800,
                  letterSpacing: '-0.045em',
                  color: 'rgba(14,14,22,0.90)',
                  lineHeight: 0.98,
                  margin: '20px 0 18px',
                }}
              >
                Latihan Interview,<br />
                <span style={{
                  background: 'linear-gradient(120deg, #2563eb 0%, #8b5cf6 50%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Seperti Aslinya.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                style={{
                  fontSize: 17,
                  color: 'rgba(14,14,22,0.52)',
                  lineHeight: 1.6,
                  maxWidth: 500,
                  margin: '0 0 32px',
                  letterSpacing: '-0.012em',
                }}
              >
                Simulasi wawancara suara yang mengenal CV dan karir kamu — dipandu AI persona HR profesional.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 }}
                style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}
              >
                <GlassButton size="lg" theme="light" icon={<ArrowRight size={17} />} onClick={handleMulai} style={{ letterSpacing: '-0.015em', fontWeight: 600 }}>Mulai Simulasi</GlassButton>
                <GlassButton size="lg" theme="light" onClick={() => scrollToSection('cara-kerja')} style={{ letterSpacing: '-0.015em', fontWeight: 600 }}>Tonton Demo</GlassButton>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div style={{ display: 'flex' }}>
                  {['#6366f1', '#ec4899', '#f97316'].map((c, i) => (
                    <div
                      key={i}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: c,
                        border: '2.5px solid rgba(255,255,255,0.55)',
                        marginLeft: i === 0 ? 0 : -10,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 13, color: 'rgba(14,14,22,0.48)', letterSpacing: '-0.008em', fontWeight: 500 }}>1.200+ kandidat sudah berlatih</span>
              </motion.div>

              {/* Stats Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 28 }}
              >
                {[
                  { metric: '98%', label: 'Siap Kerja' },
                  { metric: '< 2 Min', label: 'Setup Time' },
                  { metric: '3', label: 'AI Persona' },
                ].map((stat, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em', color: 'rgba(14,14,22,0.90)', margin: '0 0 4px' }}>{stat.metric}</p>
                    <p style={{ fontSize: 11, color: 'rgba(14,14,22,0.48)', margin: 0, letterSpacing: '-0.005em' }}>{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* RIGHT COLUMN — Interactive Preview Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'relative', width: '100%', minHeight: 540, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div aria-hidden style={{ position: 'absolute', inset: '10%', background: 'radial-gradient(circle at 50% 50%, rgba(139,92,246,0.22) 0%, transparent 60%)', filter: 'blur(60px)' }} />

              <GlassCard tint={0.32} blur={16} radius={28} strong style={{ position: 'relative', zIndex: 2, width: '95%', maxWidth: 400, minHeight: 480, padding: '20px' }}>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.6, repeat: Infinity }} style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(14,14,22,0.60)', letterSpacing: '-0.005em' }}>Live Sesi • 04:23</span>
                    </div>
                  </div>

                  {/* Persona Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '12px 14px', background: 'rgba(255,255,255,0.3)', borderRadius: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }} />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(14,14,22,0.88)', margin: 0, letterSpacing: '-0.008em' }}>Siti Rahayu</p>
                      <p style={{ fontSize: 10, color: 'rgba(14,14,22,0.50)', margin: '2px 0 0', letterSpacing: '-0.005em' }}>Director of Talent</p>
                    </div>
                  </div>

                  {/* Waveform Animation */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 2, height: 60, marginBottom: 16 }}>
                    {Array.from({ length: 28 }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [8, 28 + Math.sin(i * 0.4) * 12, 8] }}
                        transition={{
                          duration: 0.8 + (i % 4) * 0.15,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: i * 0.04,
                        }}
                        style={{
                          width: 2,
                          borderRadius: 2,
                          background: `linear-gradient(to top, rgba(139,92,246,0.4), rgba(139,92,246,0.8))`,
                          flex: 1,
                        }}
                      />
                    ))}
                  </div>

                  {/* Speech Bubble */}
                  <div style={{ marginBottom: 16, padding: '12px 14px', background: 'rgba(139,92,246,0.15)', borderRadius: 12 }}>
                    <p style={{ fontSize: 12, color: 'rgba(14,14,22,0.72)', margin: 0, lineHeight: 1.5, letterSpacing: '-0.008em' }}>
                      "Ceritakan pengalaman terbaikmu memimpin tim dalam kondisi krisis..."
                    </p>
                  </div>

                  {/* Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 'auto' }}>
                    <motion.button
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: '#ef4444',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(239,68,68,0.35)',
                      }}
                    >
                      <Mic size={20} color="#fff" />
                    </motion.button>
                    <button style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.20)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 20 }}>☎️</span>
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 3: BENTO FEATURES GRID
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

        <section id="fitur" style={{ maxWidth: 1280, margin: '0 auto', padding: '100px 28px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <GlassBadge theme="light" style={{ fontSize: 10 }}>Fitur Unggulan</GlassBadge>
            <h2
              style={{
                fontSize: 'clamp(36px, 4.5vw, 56px)',
                fontWeight: 800,
                letterSpacing: '-0.035em',
                color: 'rgba(14,14,22,0.90)',
                margin: '16px 0 12px',
                lineHeight: 1.05,
              }}
            >
              Teknologi yang <em style={{ fontStyle: 'italic', fontWeight: 600 }}>benar-benar</em> bekerja.
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(14,14,22,0.46)', maxWidth: 480, margin: '0 auto', letterSpacing: '-0.008em', lineHeight: 1.55 }}>
              Setiap fitur dirancang untuk pengalaman sedekat mungkin dengan interview sesungguhnya.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {[
              { title: 'Deep CV Analysis', desc: 'AI membaca CV setingkat Director HR', icon: '📄', wide: true },
              { title: 'Voice AI Session', desc: 'Bicara langsung, low latency', icon: '🎙️' },
              { title: 'Instant Evaluation', desc: 'Laporan mendalam 60 detik', icon: '⚡' },
              { title: 'Performance Heatmap', desc: 'Visualisasi area latihan', icon: '🔥' },
              { title: 'Weakness Detection', desc: 'Identifikasi pattern lemah', icon: '🧠' },
              { title: 'AI HR Personas', desc: 'Pilih gaya interviewer', icon: '👥', wide: true },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                style={{ gridColumn: feat.wide ? 'span 2' : 'span 1' }}
              >
                <GlassCard tint={0.24} blur={12} radius={24} interactive strong>
                  <div style={{ padding: '24px' }}>
                    <p style={{ fontSize: 24, margin: '0 0 10px' }}>{feat.icon}</p>
                    <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.022em', color: 'rgba(14,14,22,0.90)', margin: '0 0 6px' }}>{feat.title}</h3>
                    <p style={{ fontSize: 13, color: 'rgba(14,14,22,0.50)', lineHeight: 1.55, margin: 0, letterSpacing: '-0.008em' }}>{feat.desc}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 4: HOW IT WORKS — SPATIAL TIMELINE
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

        <section id="cara-kerja" style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 28px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', fontWeight: 800, letterSpacing: '-0.035em', color: 'rgba(14,14,22,0.90)', margin: '0 0 12px', lineHeight: 1.05 }}>
              Mulai dalam <span style={{ background: 'linear-gradient(90deg, #2563eb, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>4 langkah.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(14,14,22,0.46)', maxWidth: 400, margin: '0 auto', letterSpacing: '-0.008em' }}>
              Dari upload sampai evaluasi, semua dalam satu alur.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, alignItems: 'flex-start' }}>
            {[
              { n: 1, label: 'Upload CV', desc: 'Paste atau upload dokumen', icon: '📄', offset: 120 },
              { n: 2, label: 'Pilih Persona', desc: 'Santai, profesional, tekanan', icon: '🎯', offset: 40 },
              { n: 3, label: 'Live Interview', desc: 'Bicara langsung via mic', icon: '🎙️', offset: 100 },
              { n: 4, label: 'Get Evaluation', desc: 'Laporan instan di akhir', icon: '📊', offset: 20 },
            ].map(({ n, label, desc, icon, offset }, i) => (
              <motion.div key={n} initial={{ opacity: 0, scale: 0.7, y: 16 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.55 }} style={{ paddingTop: offset, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ position: 'relative', marginBottom: 16 }}>
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}>
                    <GlassCard tint={0.34} blur={12} radius={9999}>
                      <div style={{ width: 96, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42, position: 'relative' }}>
                        {icon}
                        <span
                          style={{
                            position: 'absolute',
                            bottom: -6,
                            right: -6,
                            background: 'linear-gradient(145deg, #3b82f6, #8b5cf6)',
                            color: '#fff',
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 13,
                            fontWeight: 800,
                            boxShadow: '0 4px 10px rgba(59,130,246,0.45)',
                            border: '2px solid rgba(255,255,255,0.4)',
                          }}
                        >
                          {n}
                        </span>
                      </div>
                    </GlassCard>
                  </motion.div>
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.018em', color: 'rgba(14,14,22,0.88)', margin: '0 0 4px' }}>{label}</h4>
                <p style={{ fontSize: 11, color: 'rgba(14,14,22,0.46)', lineHeight: 1.5, margin: 0, maxWidth: 160, letterSpacing: '-0.006em' }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 5: AI PERSONAS
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

        <section id="persona" style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 28px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <GlassBadge theme="light" style={{ fontSize: 10 }}>AI Persona</GlassBadge>
            <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', fontWeight: 800, letterSpacing: '-0.035em', color: 'rgba(14,14,22,0.90)', margin: '16px 0 12px', lineHeight: 1.05 }}>Pilih gaya interviewer.</h2>
            <p style={{ fontSize: 15, color: 'rgba(14,14,22,0.46)', maxWidth: 480, margin: '0 auto', letterSpacing: '-0.008em' }}>
              Tiga persona dengan pendekatan berbeda — pilih yang paling cocok untuk persiapanmu.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            {[
              { name: 'Siti Rahayu', role: 'Director HR', tone: 'Profesional', tags: ['Hangat', 'Tajam', 'Detail'], color: '#8b5cf6', rotate: -2 },
              { name: 'Kak Rina', role: 'HR Lead', tone: 'Santai', tags: ['Friendly', 'Casual', 'Supportif'], color: '#ec4899', rotate: 0 },
              { name: 'Pak Arief', role: 'Senior Recruiter', tone: 'Tekanan', tags: ['Challenging', 'Probing', 'Tegas'], color: '#3b82f6', rotate: 2 },
            ].map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 30, rotate: 0 }}
                whileInView={{ opacity: 1, y: 0, rotate: p.rotate }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.55 }}
                whileHover={{ rotate: 0, scale: 1.03, y: -4 }}
              >
                <GlassCard tint={0.30} blur={14} radius={28} strong>
                  <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                      <div style={{ width: 54, height: 54, borderRadius: '50%', background: `linear-gradient(135deg, ${p.color}40 0%, ${p.color}20 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                        {i === 0 ? '👩' : i === 1 ? '👩‍🦱' : '👨'}
                      </div>
                      <div>
                        <h4 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', color: 'rgba(14,14,22,0.90)', margin: '0 0 2px' }}>{p.name}</h4>
                        <p style={{ fontSize: 11, color: 'rgba(14,14,22,0.50)', margin: 0, letterSpacing: '-0.006em' }}>{p.role}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 28, marginBottom: 14, padding: '0 4px' }}>
                      {Array.from({ length: 24 }).map((_, idx) => (
                        <motion.div
                          key={idx}
                          animate={{ height: [4, 6 + ((idx * 5 + i) % 18), 4] }}
                          transition={{ duration: 1.2 + (idx % 4) * 0.15, repeat: Infinity, delay: idx * 0.05, ease: 'easeInOut' }}
                          style={{ width: 2, borderRadius: 1, background: `linear-gradient(to top, ${p.color}40, ${p.color})`, flex: 1 }}
                        />
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                      {p.tags.map(t => (
                        <span key={t} style={{ fontSize: 9, fontWeight: 500, color: 'rgba(14,14,22,0.60)', background: 'rgba(255,255,255,0.40)', padding: '4px 10px', borderRadius: 9999, letterSpacing: '-0.005em' }}>{t}</span>
                      ))}
                    </div>

                    <GlassBadge theme="light" style={{ fontSize: 10, width: '100%', justifyContent: 'center' }}>{p.tone}</GlassBadge>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 6: PRICING
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

        <section id="harga" style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 28px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', fontWeight: 800, letterSpacing: '-0.035em', color: 'rgba(14,14,22,0.90)', margin: '0 0 12px', lineHeight: 1.05 }}>
              Mulai <span style={{ background: 'linear-gradient(90deg, #2563eb, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>gratis.</span>
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(14,14,22,0.44)', letterSpacing: '-0.008em' }}>Investasi kecil, lonjakan karir yang besar.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, alignItems: 'center' }}>
            {[
              { tier: 'Gratis', price: 'Rp 0', per: 'selamanya', features: ['1 Sesi / Hari', 'Analisis Dasar', 'Feedback Teks'], accent: false },
              { tier: 'Profesional', price: 'Rp 99rb', per: 'per bulan', features: ['Sesi Tanpa Batas', 'Analisis Mendalam', 'Voice Persona', 'Riwayat'], accent: true },
              { tier: 'Elite', price: 'Rp 299rb', per: 'sekali bayar', features: ['Lifetime Access', 'Semua Fitur', 'Priority Support'], accent: false },
            ].map(({ tier, price, per, features, accent }, i) => (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                style={{ transform: accent ? 'scale(1.04)' : 'scale(1)', position: 'relative' }}
              >
                {accent && <div aria-hidden style={{ position: 'absolute', inset: -8, borderRadius: 28, background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.30) 0%, transparent 70%)', filter: 'blur(16px)', pointerEvents: 'none' }} />}
                <GlassCard tint={accent ? 0.34 : 0.20} blur={accent ? 14 : 8} radius={24} strong={accent}>
                  <div style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', color: accent ? '#2563eb' : 'rgba(14,14,22,0.38)', textTransform: 'uppercase', margin: 0 }}>{tier}</p>
                      {accent && <GlassBadge theme="light" style={{ fontSize: 9 }}>Terpopuler ✦</GlassBadge>}
                    </div>
                    <p style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em', color: 'rgba(14,14,22,0.90)', margin: '0 0 2px', lineHeight: 1 }}>{price}</p>
                    <p style={{ fontSize: 12, color: 'rgba(14,14,22,0.32)', margin: '0 0 22px', letterSpacing: '-0.005em' }}>{per}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
                      {features.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 13, color: accent ? '#2563eb' : 'rgba(14,14,22,0.38)' }}>{accent ? '✦' : '✓'}</span>
                          <span style={{ fontSize: 13, color: accent ? 'rgba(14,14,22,0.72)' : 'rgba(14,14,22,0.54)', fontWeight: accent ? 500 : 400, letterSpacing: '-0.008em' }}>{f}</span>
                        </div>
                      ))}
                    </div>
                    <GlassButton fullWidth size="md" theme="light" onClick={handleMulai} style={{ letterSpacing: '-0.012em', fontWeight: 600 }}>
                      {tier === 'Gratis' ? 'Mulai Gratis' : tier === 'Elite' ? 'Pilih Elite' : 'Mulai Langganan'}
                    </GlassButton>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 7: FAQ
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

        <section id="faq" style={{ maxWidth: 720, margin: '0 auto', padding: '100px 28px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'rgba(14,14,22,0.90)', margin: '0 0 40px', textAlign: 'center' }}>Pertanyaan Umum</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { q: 'Apakah ini benar-benar suara AI?', a: 'Ya, kami menggunakan Google Gemini Live API — suara real-time dengan latensi sangat rendah dan respons alami.' },
              { q: 'Berapa lama durasi per sesi?', a: 'Standar 10–15 menit, tapi kamu bisa akhiri kapan saja setelah cukup feedback.' },
              { q: 'Apakah data CV saya aman?', a: 'CV hanya digunakan selama sesi berlangsung dan tidak disimpan di server kami setelah sesi berakhir.' },
              { q: 'Bisa pilih bahasa lain?', a: 'Saat ini fokus Bahasa Indonesia untuk akurasi terbaik. Dukungan Bahasa Inggris segera hadir.' },
              { q: 'Berapa banyak sesi bisa dilakukan?', a: 'Free tier: 1 sesi per hari. Pro: unlimited sesi kapan saja. Tidak ada batas soal waktu.' },
              { q: 'Apakah ada garansi uang kembali?', a: 'Ya, 7 hari uang kembali 100% jika tidak puas tanpa pertanyaan apa pun.' },
            ].map(({ q, a }, i) => (
              <GlassCard key={q} tint={openFaq === i ? 0.28 : 0.18} blur={8} radius={18}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', padding: '18px 22px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.015em', color: 'rgba(14,14,22,0.86)', margin: 0 }}>{q}</p>
                    <motion.span
                      animate={{ rotate: openFaq === i ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ fontSize: 18, color: 'rgba(14,14,22,0.40)', flexShrink: 0, fontWeight: 300 }}
                    >
                      +
                    </motion.span>
                  </div>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p style={{ fontSize: 13, color: 'rgba(14,14,22,0.50)', lineHeight: 1.6, margin: '10px 0 0', letterSpacing: '-0.008em' }}>{a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 8: FOOTER
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

        <footer style={{ padding: '0 28px 60px', maxWidth: 1100, margin: '0 auto' }}>
          <GlassCard tint={0.24} blur={14} radius={28}>
            <div style={{ padding: '32px 28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32, marginBottom: 32 }}>
                {/* Brand */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(145deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={12} color="#fff" />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em', color: 'rgba(14,14,22,0.85)' }}>
                      interv<span style={{ color: '#2563eb' }}>you</span>
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: 'rgba(14,14,22,0.48)', margin: 0, lineHeight: 1.55, letterSpacing: '-0.005em' }}>Platform simulasi interview AI #1 Indonesia dengan teknologi Gemini terdepan.</p>
                </div>

                {/* Produk */}
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(14,14,22,0.70)', margin: '0 0 10px', letterSpacing: '-0.008em', textTransform: 'uppercase' }}>Produk</p>
                  {['Fitur', 'Pricing', 'Personas', 'Download'].map(link => (
                    <a key={link} href="#" style={{ display: 'block', fontSize: 12, color: 'rgba(14,14,22,0.50)', textDecoration: 'none', margin: '6px 0', letterSpacing: '-0.005em' }}>
                      {link}
                    </a>
                  ))}
                </div>

                {/* Legal */}
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(14,14,22,0.70)', margin: '0 0 10px', letterSpacing: '-0.008em', textTransform: 'uppercase' }}>Legal</p>
                  {['Privacy', 'Terms', 'Security', 'Contact'].map(link => (
                    <a key={link} href="#" style={{ display: 'block', fontSize: 12, color: 'rgba(14,14,22,0.50)', textDecoration: 'none', margin: '6px 0', letterSpacing: '-0.005em' }}>
                      {link}
                    </a>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '28px 0' }} />

              {/* Bottom */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                <p style={{ fontSize: 11, color: 'rgba(14,14,22,0.40)', margin: 0, letterSpacing: '-0.005em' }}>© 2025 IntervYou. Semua hak dilindungi.</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  {['Twitter', 'LinkedIn', 'Instagram'].map(social => (
                    <a key={social} href="#" style={{ fontSize: 12, color: 'rgba(14,14,22,0.50)', textDecoration: 'none', letterSpacing: '-0.005em' }}>
                      {social}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </footer>

      </div>
    </main>
  );
}
