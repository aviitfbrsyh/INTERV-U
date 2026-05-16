'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { VideoBackground } from '@/components/ui/VideoBackground';

const SF = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif`;

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden>
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
      <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SF }}>
        <VideoBackground src="/untitled_Export_2026-05-14_07-44-09.mp4" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'relative', zIndex: 2, width: 26, height: 26, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.35)', borderTopColor: 'rgba(255,255,255,0.85)' }}
        />
      </div>
    );
  }

  return (
    <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SF }}>

      {/* Seamless looping video */}
      <VideoBackground src="/untitled_Export_2026-05-14_07-44-09.mp4" crossfade={1.8} />

      {/* Vignette */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'radial-gradient(ellipse at center, transparent 45%, rgba(130,110,155,0.16) 100%)', pointerEvents: 'none' }} />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 360, margin: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
      >

        {/* ── Logo pill ── */}
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlassCard tint={0.28} blur={6} radius={9999}>
            {/* flex goes INSIDE content, not on GlassCard */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 18px 7px 8px' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(145deg, #3b82f6 0%, #1d4ed8 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(37,99,235,0.40)',
              }}>
                <Sparkles size={15} color="#fff" />
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.025em', color: 'rgba(18,18,30,0.85)', whiteSpace: 'nowrap' }}>
                interv<span style={{ color: '#2563eb' }}>you</span>
              </span>
            </div>
          </GlassCard>
        </motion.div>

        {/* ── Main card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%' }}
        >
          <GlassCard tint={0.24} blur={8} radius={28} strong>
            <div style={{ padding: '32px 28px 28px' }}>

              {/* Icon */}
              <motion.div
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.20, type: 'spring', stiffness: 280, damping: 20 }}
                style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}
              >
                <GlassCard tint={0.32} blur={4} radius={18}>
                  <div style={{ width: 58, height: 58, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                    🎯
                  </div>
                </GlassCard>
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26 }}
                style={{ fontFamily: SF, fontSize: 22, fontWeight: 700, letterSpacing: '-0.030em', color: 'rgba(18,18,30,0.90)', textAlign: 'center', margin: '0 0 8px' }}
              >
                Masuk ke Intervyou
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.30 }}
                style={{ fontFamily: SF, fontSize: 13, color: 'rgba(18,18,30,0.48)', lineHeight: 1.55, textAlign: 'center', margin: '0 0 26px', letterSpacing: '-0.010em' }}
              >
                Simpan riwayat sesi interview kamu<br />dan akses dari mana saja.
              </motion.p>

              {/* Error */}
              <AnimatePresence>
                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ overflow: 'hidden', marginBottom: 14 }}
                  >
                    <GlassCard tint={0.12} blur={4} radius={12}>
                      <div style={{ padding: '10px 14px' }}>
                        <p style={{ fontFamily: SF, fontSize: 12, color: 'rgba(160,20,20,0.85)', margin: 0, letterSpacing: '-0.008em' }}>
                          {loginError}
                        </p>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Google button */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34 }}
              >
                <GlassButton
                  size="lg"
                  fullWidth
                  loading={signingIn}
                  icon={<GoogleIcon />}
                  theme="light"
                  onClick={handleLogin}
                  style={{ fontFamily: SF, letterSpacing: '-0.015em' }}
                >
                  {signingIn ? 'Menghubungkan...' : 'Masuk dengan Google'}
                </GlassButton>
              </motion.div>

              {/* Fine print */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.42 }}
                style={{ fontFamily: SF, fontSize: 11, color: 'rgba(18,18,30,0.28)', textAlign: 'center', margin: '18px 0 0', lineHeight: 1.55, letterSpacing: '-0.005em' }}
              >
                Dengan masuk, kamu menyetujui penyimpanan data sesi wawancara untuk riwayat pribadimu.
              </motion.p>

            </div>
          </GlassCard>
        </motion.div>

        {/* ── Feature pills ── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.46 }}
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {['AI Interviewer', 'Evaluasi Instan', 'Coaching Personal'].map((label, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.86 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.48 + i * 0.06 }}
            >
              <GlassBadge theme="light" style={{ fontFamily: SF }}>
                {label}
              </GlassBadge>
            </motion.div>
          ))}
        </motion.div>

      </motion.div>
    </main>
  );
}
