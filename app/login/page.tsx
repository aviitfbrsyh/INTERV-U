'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SF = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif`;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace('/');
  }, [user, loading, router]);

  // Background Canvas Effect (Interactive Particles)
  useEffect(() => {
    const canvas = document.getElementById('login-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let W: number, H: number;
    const particles: any[] = [];
    let animationId: number;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * (window.innerWidth || 1200),
        y: Math.random() * (window.innerHeight || 800),
        r: Math.random() * 1.5 + 0.4,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        alpha: Math.random() * 0.45 + 0.1,
        hue: Math.random() > 0.5 ? 210 : 265,
      });
    }

    let mx = -999, my = -999;
    const onMouseMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener('mousemove', onMouseMove);

    function draw(t: number) {
      if (!canvas.offsetParent && canvas.offsetHeight === 0) {
        animationId = requestAnimationFrame(draw);
        return;
      }
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      ctx!.clearRect(0, 0, W, H);

      // Mouse glow
      if (mx !== -999) {
        const g2 = ctx!.createRadialGradient(mx, my, 0, mx, my, 220);
        g2.addColorStop(0, 'rgba(90,140,255,0.04)');
        g2.addColorStop(1, 'rgba(0,0,0,0)');
        ctx!.fillStyle = g2;
        ctx!.fillRect(0, 0, W, H);
      }

      particles.forEach(p => {
        if (mx !== -999) {
          const dx = mx - p.x, dy = my - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            p.vx += dx * 0.000045; // attract to cursor
            p.vy += dy * 0.000045;
          }
        }
        p.vx *= 0.994; p.vy *= 0.994;
        p.x += p.vx; p.y += p.vy;
        
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        const pulse = 0.5 + 0.5 * Math.sin(t * 0.0008 + p.x * 0.01);
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${p.hue}, 80%, 75%, ${p.alpha * pulse})`;
        ctx!.fill();
      });

      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 85) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(110,150,255,${0.055 * (1 - d / 85)})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(draw);
    }
    animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleLogin = async () => {
    if (signingIn) return;
    setSigningIn(true);
    setLoginError(null);
    try {
      await signInWithGoogle();
      router.replace('/');
    } catch (err: any) {
      setSigningIn(false);
      const code = err?.code ?? '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setLoginError('Login dibatalkan. Silakan coba lagi.');
      } else if (code === 'auth/network-request-failed') {
        setLoginError('Koneksi gagal. Periksa jaringan internetmu.');
      } else if (code === 'auth/popup-blocked') {
        setLoginError('Popup diblokir browser. Aktifkan popup untuk situs ini.');
      } else {
        setLoginError('Login gagal. Silakan coba beberapa saat lagi.');
      }
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: SF,
        background: '#060608',
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 50% 0%, rgba(90, 120, 255, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 40% at 80% 80%, rgba(120, 60, 200, 0.08) 0%, transparent 60%)
        `
      }}>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { to { transform: rotate(360deg); } }
        `}} />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'relative', zIndex: 2, width: 26, height: 26, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.15)', borderTopColor: 'rgba(255,255,255,0.85)' }}
        />
      </div>
    );
  }

  return (
    <main style={{
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: SF,
      background: '#060608',
      backgroundImage: `
        radial-gradient(ellipse 80% 60% at 50% 0%, rgba(90, 120, 255, 0.12) 0%, transparent 70%),
        radial-gradient(ellipse 60% 40% at 80% 80%, rgba(120, 60, 200, 0.08) 0%, transparent 60%)
      `
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { to { transform: rotate(360deg); } }
      `}} />

      {/* Interactive Particles Background Canvas */}
      <canvas id="login-canvas" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />

      {/* Vignette Overlay */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)', pointerEvents: 'none' }} />

      {/* ── Sleek Apple Back button placed at the top-left corner of viewport (Filled Style) ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        style={{ position: 'absolute', top: 24, left: 24, zIndex: 10 }}
      >
        <button
          onClick={() => router.push('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255, 255, 255, 0.95)',
            border: 'none',
            borderRadius: 50, padding: '7px 14px 7px 10px',
            color: '#060608',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
            fontFamily: SF, transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            letterSpacing: '-0.01em',
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.35)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.25)';
          }}
        >
          <ArrowLeft size={13} strokeWidth={2.5} />
          Kembali
        </button>
      </motion.div>

      {/* Content Container */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 380, margin: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
      >

        {/* ── MacBook Window Design Login Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%' }}
        >
          <div style={{
            width: '100%',
            background: 'rgba(18, 18, 28, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            borderRadius: 22,
            backdropFilter: 'blur(28px) saturate(190%)',
            boxShadow: '0 30px 65px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            padding: '20px 28px 28px',
            position: 'relative'
          }}>
            
            {/* macOS window traffic dots */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FF5F56', border: '0.5px solid rgba(0,0,0,0.15)' }} />
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FFBD2E', border: '0.5px solid rgba(0,0,0,0.15)' }} />
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#27C93F', border: '0.5px solid rgba(0,0,0,0.15)' }} />
            </div>

            {/* Glowing App Logo Icon */}
            <motion.div
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.18, type: 'spring', stiffness: 260, damping: 18 }}
              style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(124, 58, 237, 0.18) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)'
              }}>
                <Sparkles size={24} color="#93c5fd" />
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              style={{ fontFamily: SF, fontSize: 21, fontWeight: 700, letterSpacing: '-0.025em', color: '#fff', textAlign: 'center', margin: '0 0 6px' }}
            >
              Masuk ke IntervYou
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26 }}
              style={{ fontFamily: SF, fontSize: 13, color: 'rgba(255, 255, 255, 0.48)', lineHeight: 1.5, textAlign: 'center', margin: '0 0 24px', letterSpacing: '-0.01em' }}
            >
              Simpan riwayat sesi interview kamu<br />dan akses dari mana saja.
            </motion.p>

            {/* Error Message */}
            <AnimatePresence>
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden', marginBottom: 14 }}
                >
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.22)'
                  }}>
                    <p style={{ fontFamily: SF, fontSize: 12, color: '#fca5a5', margin: 0, letterSpacing: '-0.005em', lineHeight: 1.4 }}>
                      {loginError}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Premium Apple-Vibe Google login button */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={handleLogin}
                disabled={signingIn}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  width: '100%', padding: '13px', borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  fontFamily: SF, cursor: signingIn ? 'not-allowed' : 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  letterSpacing: '-0.01em'
                }}
                onMouseEnter={e => {
                  if (!signingIn) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.25)';
                  }
                }}
                onMouseLeave={e => {
                  if (!signingIn) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }
                }}
              >
                {signingIn ? (
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.25)',
                    borderTopColor: '#fff',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                ) : (
                  <>
                    <GoogleIcon />
                    <span>Masuk dengan Google</span>
                  </>
                )}
              </button>
            </motion.div>

            {/* Fine Print */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.36 }}
              style={{ fontFamily: SF, fontSize: 11, color: 'rgba(255, 255, 255, 0.28)', textAlign: 'center', margin: '18px 0 0', lineHeight: 1.5, letterSpacing: '-0.005em' }}
            >
              Dengan masuk, kamu menyetujui penyimpanan data sesi wawancara untuk riwayat pribadimu.
            </motion.p>

          </div>
        </motion.div>

        {/* ── Feature Pills below Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}
        >
          {['AI Interviewer', 'Evaluasi Instan', 'Coaching Personal'].map((label, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.42 + i * 0.05 }}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: 50,
                padding: '6px 14px',
                color: 'rgba(255, 255, 255, 0.55)',
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '-0.01em',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}
            >
              {label}
            </motion.div>
          ))}
        </motion.div>

      </motion.div>
    </main>
  );
}
