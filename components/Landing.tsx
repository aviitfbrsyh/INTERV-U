'use client';

import React, { useEffect, useState } from 'react';
import './Landing.css';
import AmbientBackground from '@/components/AmbientBackground';

interface LandingProps {
  onStart: () => void;
}

export default function Landing({ onStart }: LandingProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeNav, setActiveNav] = useState<string>('');

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleScrollTo = (id: string) => {
    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll Reveal Effect
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Nav Scroll Effect
  useEffect(() => {
    const onScroll = () => {
      const nav = document.getElementById('main-nav');
      if (nav) {
        nav.style.background = window.scrollY > 60 ? 'rgba(5,5,8,0.9)' : 'rgba(10,10,16,0.72)';
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ✨ MacBook Dock Proximity Zoom for Steps (Ultra Smooth Lerped Animation)
  useEffect(() => {
    const container = document.querySelector('.steps-container');
    if (!container) return;

    const steps = container.querySelectorAll('.step') as NodeListOf<HTMLElement>;
    const threshold = 320; 
    const maxScale = 1.18; 
    const maxTranslateY = -15; 

    // Store state for each step to do interpolation
    const stepData = Array.from(steps).map(step => ({
      element: step,
      currentScale: 1,
      targetScale: 1,
      currentTranslateY: 0,
      targetTranslateY: 0,
    }));

    let mx = -999;
    let my = -999;
    let isInside = false;

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      isInside = true;
    };

    const handleMouseEnter = () => {
      isInside = true;
    };

    const handleMouseLeave = () => {
      isInside = false;
      stepData.forEach(data => {
        data.targetScale = 1;
        data.targetTranslateY = 0;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    let animId: number;
    const update = () => {
      if (isInside && mx !== -999) {
        stepData.forEach(data => {
          const rect = data.element.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;

          const dx = mx - cx;
          const dy = my - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < threshold) {
            const factor = Math.pow(1 - dist / threshold, 2.2);
            data.targetScale = 1 + (maxScale - 1) * factor;
            data.targetTranslateY = maxTranslateY * factor;
          } else {
            data.targetScale = 1;
            data.targetTranslateY = 0;
          }
        });
      }

      // Smoothly interpolate current towards target
      stepData.forEach(data => {
        data.currentScale += (data.targetScale - data.currentScale) * 0.12; // Lerp factor (lower is smoother)
        data.currentTranslateY += (data.targetTranslateY - data.currentTranslateY) * 0.12;

        if (Math.abs(data.currentScale - 1) > 0.001 || Math.abs(data.currentTranslateY) > 0.05) {
          data.element.style.transform = `scale(${data.currentScale.toFixed(4)}) translateY(${data.currentTranslateY.toFixed(2)}px)`;
          data.element.style.zIndex = '10';
        } else {
          data.element.style.transform = '';
          data.element.style.zIndex = '';
        }
      });

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animId);
      steps.forEach(step => {
        step.style.transform = '';
        step.style.zIndex = '';
      });
    };
  }, []);

  return (
    <div className="landing-wrapper">
      <AmbientBackground />
      {/* ─── NAV ─── */}
      <nav id="main-nav">
        <span className="nav-logo">IntervYou</span>
        <div className="nav-links">
          <button className={`nav-link ${activeNav === 'features' ? 'active' : ''}`} onClick={() => handleScrollTo('features')}>Fitur</button>
          <button className={`nav-link ${activeNav === 'how' ? 'active' : ''}`} onClick={() => handleScrollTo('how')}>Cara Kerja</button>
          <button className={`nav-link ${activeNav === 'pricing' ? 'active' : ''}`} onClick={() => handleScrollTo('pricing')}>Harga</button>
          <button className={`nav-link ${activeNav === 'personas' ? 'active' : ''}`} onClick={() => handleScrollTo('personas')}>Persona</button>
          <button className="nav-link" onClick={() => window.location.href = '/history'}>Histori</button>
        </div>
        <button className="nav-cta" onClick={onStart}>Mulai Gratis</button>
      </nav>

      {/* ─── HERO ─── */}
      <section id="hero" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: '40px', paddingTop: '80px', minHeight: '100vh' }}>
        {/* Center Title Block */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
          <div className="hero-badge">
            <div className="hero-badge-dot"></div>
            Powered by Next-Gen AI Engine · Real-time Voice AI
          </div>
          <h1 className="hero-title" style={{ margin: 0 }}>AI Interview<br />Simulator</h1>
        </div>

        {/* Bottom Details Block */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', zIndex: 2 }}>
          <div className="hero-ctas" style={{ margin: 0 }}>
            <button className="btn-primary" onClick={onStart}>Mulai Simulasi Sekarang</button>
            <button className="btn-secondary" onClick={() => handleScrollTo('dashboard-3d')}>Lihat Demo ↓</button>
          </div>

          <div className="hero-social" style={{ margin: 0 }}>
            <div className="hero-social-avatars">
              <div className="avatar-dot" style={{ background: 'linear-gradient(135deg,#a78bfa,#60a5fa)' }}>S</div>
              <div className="avatar-dot" style={{ background: 'linear-gradient(135deg,#f472b6,#fb923c)' }}>R</div>
              <div className="avatar-dot" style={{ background: 'linear-gradient(135deg,#34d399,#06b6d4)' }}>A</div>
            </div>
            <span>1.200+ kandidat sudah berlatih</span>
          </div>
        </div>
      </section>

      {/* ─── 3D DASHBOARD SHOWCASE ─── */}
      <section id="dashboard-3d">
        <div className="container" style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="section-label">Live Demo</div>
          <h2 className="section-title" style={{ margin: '0 auto', textAlign: 'center' }}>Interface yang<br />Hidup dan Nyata</h2>
        </div>

        <div id="three-container" style={{ position: 'relative' }}>
          <img
            src="/bg.webp"
            alt="Interface Wawancara"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '28px',
              display: 'block',
              boxShadow: '0 20px 80px rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          />
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features">
        <div className="container">
          <div className="section-label">Fitur</div>
          <h2 className="section-title">Teknologi yang<br />Benar-Benar Bekerja</h2>
          <p className="section-sub">Setiap fitur dirancang untuk pengalaman sedekat mungkin dengan interview sesungguhnya.</p>

          <div className="features-grid">
            <div className="feature-card reveal">
              <div className="feature-icon">🧠</div>
              <div className="feature-name">Deep CV Analysis</div>
              <div className="feature-desc">AI membaca CV dan Job Description seperti recruiter senior, mendeteksi kekuatan, gap, dan potensi tersembunyi.</div>
              <div className="feature-badges">
                <span className="badge badge-blue">Gemini Pro 2.0</span>
                <span className="badge badge-green">Real-Time</span>
              </div>
            </div>

            <div className="feature-card reveal">
              <div className="feature-icon">🎙️</div>
              <div className="feature-name">Voice AI Session</div>
              <div className="feature-desc">Percakapan suara natural dengan AI HR persona yang responsif dan adaptif terhadap jawabanmu.</div>
              <div className="feature-badges">
                <span className="badge badge-blue">Low Latency</span>
                <span className="badge badge-green">Real-Time</span>
                <span className="badge badge-purple">Natural Voice</span>
              </div>
            </div>

            <div className="feature-card reveal">
              <div className="feature-icon">🤖</div>
              <div className="feature-name">AI HR Personas</div>
              <div className="feature-desc">Pilih dari berbagai persona HR — santai, profesional, hingga tekanan tinggi untuk berbagai skenario karir.</div>
              <div className="feature-badges">
                <span className="badge badge-blue">3 Personas</span>
                <span className="badge">Adaptive</span>
              </div>
            </div>

            <div className="feature-card reveal">
              <div className="feature-icon">🔍</div>
              <div className="feature-name">Weakness Detection</div>
              <div className="feature-desc">Deteksi otomatis kata filler seperti "ee...", "emm...", "jadi..." untuk meningkatkan kefluensian bicara kamu.</div>
              <div className="feature-badges">
                <span className="badge">Auto-Detect</span>
                <span className="badge badge-purple">AI-Powered</span>
              </div>
            </div>

            <div className="feature-card large reveal">
              <div className="feature-icon">📊</div>
              <div className="feature-name">Instant Evaluation & Heatmap</div>
              <div className="feature-desc">Laporan evaluasi instan dengan visual heatmap performa. Ketahui persis di mana kamu kuat dan di mana perlu diperbaiki.</div>
              <div className="feature-metrics">
                <div className="metric">
                  <div className="metric-val" style={{ background: 'linear-gradient(135deg,#34D399,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>87</div>
                  <div className="metric-lab">STAR Score</div>
                </div>
                <div className="metric">
                  <div className="metric-val" style={{ background: 'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>92</div>
                  <div className="metric-lab">Concise Score</div>
                </div>
                <div className="metric">
                  <div className="metric-val" style={{ background: 'linear-gradient(135deg,#fbbf24,#fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>15</div>
                  <div className="metric-lab">Filler Words</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PERSONAS ─── */}
      <section id="personas">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-label">AI Personas</div>
          <h2 className="section-title" style={{ margin: '0 auto', textAlign: 'center' }}>Pilih Lawan<br />Interview-mu</h2>
          <p className="section-sub" style={{ margin: '12px auto 0', textAlign: 'center' }}>Dari yang hangat hingga yang menantang. Latihan untuk semua skenario nyata.</p>

          <div className="personas-grid reveal">
            <div className="persona-card-img-wrapper siti" onClick={onStart}>
              <img src="/kaksiti.webp" alt="Siti Rahayu" />
            </div>

            <div className="persona-card-img-wrapper rina" onClick={onStart}>
              <img src="/kakrina.webp" alt="Kak Rina" />
            </div>

            <div className="persona-card-img-wrapper arief" onClick={onStart}>
              <img src="/pakarief.webp" alt="Pak Arief" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-label">Cara Kerja</div>
          <h2 className="section-title" style={{ margin: '0 auto', textAlign: 'center' }}>4 Langkah<br />Menuju Siap</h2>

          <div className="steps-container">
            <svg className="steps-wavy-line" viewBox="0 0 1000 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="steps-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(96, 165, 250, 0.45)" />
                  <stop offset="50%" stopColor="rgba(167, 139, 250, 0.45)" />
                  <stop offset="100%" stopColor="rgba(244, 114, 182, 0.45)" />
                </linearGradient>
              </defs>
              <path 
                d="M 50,80 C 75,50 100,30 125,30 C 150,30 200,90 250,90 C 300,90 350,30 375,30 C 400,30 450,90 500,90 C 550,90 600,30 625,30 C 650,30 700,90 750,90 C 800,90 850,30 875,30 C 900,30 925,50 950,80" 
                fill="none" 
                stroke="url(#steps-grad)" 
                strokeWidth="2.5" 
                strokeDasharray="6, 6"
              />
            </svg>
            <div className="step reveal">
              <div className="step-num">01</div>
              <div className="step-icon">📄</div>
              <div className="step-title">Upload CV</div>
              <div className="step-desc">Paste atau upload CV dan Job Description. AI menganalisis kecocokan secara instan.</div>
            </div>
            <div className="step reveal">
              <div className="step-num">02</div>
              <div className="step-icon">🎭</div>
              <div className="step-title">Pilih AI Persona</div>
              <div className="step-desc">Santai, Profesional, atau Tekanan Tinggi — sesuaikan dengan targetmu.</div>
            </div>
            <div className="step reveal">
              <div className="step-num">03</div>
              <div className="step-icon">🎙️</div>
              <div className="step-title">Live Wawancara</div>
              <div className="step-desc">Berbicara langsung menggunakan mikrofon. AI merespons secara real-time.</div>
            </div>
            <div className="step reveal">
              <div className="step-num">04</div>
              <div className="step-icon">📈</div>
              <div className="step-title">Get Evaluation</div>
              <div className="step-desc">Laporan evaluasi instan dengan skor, heatmap, dan rekomendasi spesifik.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-label">Harga</div>
          <h2 className="section-title" style={{ margin: '0 auto', textAlign: 'center' }}>Investasi<br />untuk Karirmu</h2>

          <div className="pricing-grid">
            <div className="pricing-card reveal">
              <div className="pricing-name">Gratis</div>
              <div className="pricing-price">Rp 0</div>
              <div className="pricing-period">Selamanya gratis</div>
              <div className="pricing-divider"></div>
              <ul className="pricing-features">
                <li className="pricing-feature">1 Sesi / Hari</li>
                <li className="pricing-feature">Analisis CV Dasar</li>
                <li className="pricing-feature">Feedback Teks</li>
              </ul>
              <button className="btn-pricing" onClick={onStart}>Mulai Gratis</button>
            </div>

            <div className="pricing-card popular reveal">
              <div className="popular-badge">MOST POPULAR</div>
              <div className="pricing-name">Profesional</div>
              <div className="pricing-price">Rp 99rb</div>
              <div className="pricing-period">per bulan · batalkan kapan saja</div>
              <div className="pricing-divider"></div>
              <ul className="pricing-features">
                <li className="pricing-feature">Unlimited Sessions</li>
                <li className="pricing-feature">Deep CV Analysis</li>
                <li className="pricing-feature">All Voice Personas</li>
                <li className="pricing-feature">Session History</li>
                <li className="pricing-feature">Performance Heatmap</li>
              </ul>
              <button className="btn-pricing primary" onClick={onStart}>Mulai Sekarang</button>
            </div>

            <div className="pricing-card reveal">
              <div className="pricing-name">Elite</div>
              <div className="pricing-price">Rp 299rb</div>
              <div className="pricing-period">lifetime access · bayar sekali</div>
              <div className="pricing-divider"></div>
              <ul className="pricing-features">
                <li className="pricing-feature">Semua fitur Pro</li>
                <li className="pricing-feature">Lifetime Access</li>
                <li className="pricing-feature">Priority Support</li>
                <li className="pricing-feature">Early Features</li>
              </ul>
              <button className="btn-pricing" onClick={onStart}>Beli Sekarang</button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-label">FAQ</div>
          <h2 className="section-title" style={{ margin: '0 auto' }}>Pertanyaan Umum</h2>

          <div className="faq-list reveal">
            <div className={`faq-item ${openFaq === 0 ? 'open' : ''}`}>
              <div className="faq-q" onClick={() => toggleFaq(0)}>
                Apakah ini benar-benar suara AI real-time?
                <div className="faq-icon">+</div>
              </div>
              <div className="faq-a">Ya. IntervYou menggunakan teknologi voice AI dengan latency rendah, sehingga respons AI terasa natural dan langsung — seperti berbicara dengan HR sungguhan.</div>
            </div>
            <div className={`faq-item ${openFaq === 1 ? 'open' : ''}`}>
              <div className="faq-q" onClick={() => toggleFaq(1)}>
                Berapa lama durasi per sesi?
                <div className="faq-icon">+</div>
              </div>
              <div className="faq-a">Sesi standar berlangsung 15–30 menit, menyesuaikan alur wawancara. Tidak ada batasan waktu keras — kamu yang menentukan kapan selesai.</div>
            </div>
            <div className={`faq-item ${openFaq === 2 ? 'open' : ''}`}>
              <div className="faq-q" onClick={() => toggleFaq(2)}>
                Apakah data CV saya aman?
                <div className="faq-icon">+</div>
              </div>
              <div className="faq-a">Keamanan data adalah prioritas kami. CV hanya digunakan selama sesi aktif dan tidak disimpan di server kami secara permanen. Kami menggunakan enkripsi end-to-end.</div>
            </div>
            <div className={`faq-item ${openFaq === 3 ? 'open' : ''}`}>
              <div className="faq-q" onClick={() => toggleFaq(3)}>
                Bisa pilih bahasa lain?
                <div className="faq-icon">+</div>
              </div>
              <div className="faq-a">Saat ini tersedia Bahasa Indonesia dan Bahasa Inggris. Dukungan bahasa lain sedang dalam pengembangan dan akan hadir segera.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 60 }}>
        <footer>
          <div>
            <div className="footer-brand">IntervYou</div>
            <div className="footer-copy" style={{ marginTop: 4 }}>© 2026 IntervYou. All rights reserved.</div>
          </div>
          <div className="footer-links">
            <a className="footer-link" href="#pricing">Pricing</a>
            <a className="footer-link" href="#">Terms</a>
            <a className="footer-link" href="#">Privacy</a>
            <a className="footer-link" href="#">Twitter</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
