'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import InterviewSetup from '@/components/InterviewSetup';
import LiveInterview from '@/components/LiveInterview';
import InterviewEvaluation from '@/components/InterviewEvaluation';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, Shield, Cpu, Zap, Star, History, CheckCircle } from 'lucide-react';
import { CrossMatchData } from '@/lib/cross-match';
import { runEvaluation, EvaluationData } from '@/lib/evaluate';
import { useAuth } from '@/contexts/AuthContext';
import { saveSession } from '@/lib/session-store';

type AppState = 'landing' | 'setup' | 'interview' | 'evaluation';

function extractField(text: string, keys: string[]): string {
  for (const key of keys) {
    const m = text.match(new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`, 'i'));
    if (m?.[1]?.trim()) return m[1].trim();
  }
  return text.split('\n').find(l => {
    const t = l.trim();
    return t.length > 2 && !t.startsWith('{') && !t.startsWith('"') && !t.startsWith('[');
  })?.trim() ?? '';
}

export default function Home() {
  const { user, loading: authLoading, signInWithGoogle, logout } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<AppState>('landing');
  const [cvText, setCvText] = useState('');
  const [jdText, setJdText] = useState('');
  const [history, setHistory] = useState('');
  const [crossMatchData, setCrossMatchData] = useState<CrossMatchData | null>(null);
  const [prefetchedEvaluation, setPrefetchedEvaluation] = useState<EvaluationData | null>(null);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [prefetchError, setPrefetchError] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);
  const savedRef = useRef(false);

  // Auto-save to Firestore when evaluation is ready and user is logged in
  useEffect(() => {
    if (!prefetchedEvaluation || isPrefetching || !user || savedRef.current) return;
    savedRef.current = true;
    const jobTitle = extractField(jdText, ['role', 'title', 'position', 'job_title', 'posisi', 'jabatan']);
    const candidateName = extractField(cvText, ['name', 'nama', 'full_name', 'fullName']);
    saveSession({
      userId: user.uid,
      evaluation: prefetchedEvaluation,
      cvText,
      jdText,
      history,
      crossMatchData,
      jobTitle,
      candidateName,
    }).then(() => {
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 4000);
    }).catch(console.error);
  }, [prefetchedEvaluation, isPrefetching, user, cvText, jdText, history, crossMatchData]);

  const handleStart = (cv: string, jd: string, matchData: CrossMatchData) => {
    setCvText(cv);
    setJdText(jd);
    setCrossMatchData(matchData);
    setState('interview');
  };

  const handleEnd = (conversationHistory: string) => {
    setHistory(conversationHistory);
    setPrefetchedEvaluation(null);
    setPrefetchError(null);
    setIsPrefetching(true);

    runEvaluation(conversationHistory, cvText, jdText, crossMatchData)
      .then((result) => {
        setPrefetchedEvaluation(result);
        setIsPrefetching(false);
      })
      .catch((err) => {
        setPrefetchError(err?.message || 'Terjadi kesalahan saat membuat evaluasi.');
        setIsPrefetching(false);
      });

    setState('evaluation');
  };

  // Post-login: auto-redirect to setup if intent was set
  useEffect(() => {
    if (authLoading || !user) return;
    const intent = sessionStorage.getItem('loginIntent');
    if (intent === 'setup') {
      sessionStorage.removeItem('loginIntent');
      setState('setup');
    }
  }, [authLoading, user]);

  const handleMulai = () => {
    if (user) {
      setState('setup');
    } else {
      sessionStorage.setItem('loginIntent', 'setup');
      router.push('/login');
    }
  };

  const handleReset = () => {
    setState('setup');
    setHistory('');
    setCrossMatchData(null);
    setPrefetchedEvaluation(null);
    setPrefetchError(null);
    setIsPrefetching(false);
    savedRef.current = false;
  };

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {state === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-4 min-h-screen"
            >
              {/* Navigation */}
              <nav className="max-w-7xl mx-auto py-8 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50 px-6 rounded-full border border-white/5 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold tracking-tighter">interv<span className="text-blue-500">you</span></span>
                </div>

                <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-400">
                    <a href="#features" className="hover:text-white transition-colors">Fitur</a>
                    <a href="#how-it-works" className="hover:text-white transition-colors">Cara Kerja</a>
                    <a href="#pricing" className="hover:text-white transition-colors">Harga</a>
                    <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
                </div>

                <div className="flex items-center gap-3">
                  {user && (
                    <>
                      <button
                        onClick={() => router.push('/history')}
                        className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-3 py-2 border border-white/10 rounded-xl"
                      >
                        <History size={14} /> Riwayat
                      </button>
                      <img src={user.photoURL ?? ''} alt="" className="w-8 h-8 rounded-full border border-white/20" />
                      <button onClick={logout} className="text-xs text-slate-500 hover:text-white transition-colors hidden sm:block">Keluar</button>
                    </>
                  )}
                  <button
                    onClick={handleMulai}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full hover:bg-slate-200 transition-all text-sm font-bold shadow-xl shadow-white/10"
                  >
                    Mulai <ArrowRight size={14} />
                  </button>
                </div>
              </nav>

              {/* Hero Section */}
              <section className="max-w-7xl mx-auto pt-28 pb-32 flex flex-col items-center text-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="space-y-6 max-w-4xl"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                        <Zap size={12} className="fill-blue-400" /> Professional Grade Simulator
                    </div>
                  <h1 className="text-6xl md:text-8xl font-medium tracking-tight leading-[0.95] font-sans">
                    Transformasi <span className="font-serif italic text-blue-400">Karir</span> Melalui Kecerdasan Murni.
                  </h1>
                  <p className="text-slate-400 text-lg md:text-2xl font-light max-w-2xl mx-auto leading-relaxed mt-6">
                    Rasakan simulasi wawancara paling nyata di dunia. Analisis CV mendalam, evaluasi suara real-time, dan bimbingan dari persona HR profesional terbaik.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-10">
                    <button
                      onClick={handleMulai}
                      className="px-10 py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-900/40 flex items-center justify-center gap-3 active:scale-95"
                    >
                      Mulai Simulasi <ArrowRight size={20} />
                    </button>
                    <button className="px-10 py-5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">
                      Tonton Demo
                    </button>
                  </div>
                </motion.div>

                {/* Floating Preview Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="mt-24 w-full max-w-5xl relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] aspect-video overflow-hidden shadow-2xl flex items-center justify-center p-12">
                     <div className="absolute top-4 left-6 flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                     </div>
                    <div className="text-center">
                        <div className="flex justify-center gap-1.5 mb-8">
                            {[1,2,3,4,5,6,7].map(i => (
                                <motion.div 
                                    key={i}
                                    animate={{ height: [20, 60, 20] }} 
                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                                    className="w-2 bg-gradient-to-t from-blue-600 to-blue-400 rounded-full" 
                                />
                            ))}
                        </div>
                        <p className="text-3xl font-serif italic text-white/50 tracking-wide font-light">&ldquo;Selamat pagi, ceritakan tentang pencapaian terbesar Anda...&rdquo;</p>
                        <div className="mt-12 flex items-center justify-center gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500">Live Session Active</span>
                        </div>
                    </div>
                  </div>
                </motion.div>
              </section>

              {/* Logos Section */}
              <section className="max-w-7xl mx-auto py-20 border-y border-white/5 overflow-hidden">
                <p className="text-center text-[10px] uppercase tracking-[0.4em] font-bold text-slate-600 mb-12">Digunakan oleh kandidat dari perusahaan top dunia</p>
                <div className="flex justify-around items-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                    <span className="text-2xl font-bold tracking-tighter">GOOGLE</span>
                    <span className="text-2xl font-bold tracking-tighter">META</span>
                    <span className="text-2xl font-bold tracking-tighter">ALIBABA</span>
                    <span className="text-2xl font-bold tracking-tighter">GOJEK</span>
                    <span className="text-2xl font-bold tracking-tighter">SHOPEE</span>
                    <span className="text-2xl font-bold tracking-tighter">TOKOPEDIA</span>
                </div>
              </section>

              {/* Features Grid */}
              <section id="features" className="max-w-7xl mx-auto py-32">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-medium tracking-tight font-sans">Fitur <span className="font-serif italic text-blue-400">Unggulan</span></h2>
                    <p className="text-slate-500 max-w-xl mx-auto">Teknologi yang dirancang untuk mensimulasikan lingkungan profesional yang sesungguhnya.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="p-10 bg-white/5 border border-white/5 rounded-[2rem] hover:border-blue-500/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Cpu size={120} />
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-400">
                      <Cpu size={24} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Deep Extraction</h3>
                    <p className="text-slate-400 leading-relaxed">Analisis CV dan Job Desc Anda menggunakan model Gemini 1.5 Pro untuk memahami setiap nuansa pengalaman Anda.</p>
                  </div>
                  <div className="p-10 bg-white/5 border border-white/5 rounded-[2rem] hover:border-blue-500/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap size={120} />
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-400">
                      <Zap size={24} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Voice Live</h3>
                    <p className="text-slate-400 leading-relaxed">Interaksi suara real-time dengan latensi rendah. Berbicara secara alami seperti sedang menelepon rekan kerja.</p>
                  </div>
                  <div className="p-10 bg-white/5 border border-white/5 rounded-[2rem] hover:border-blue-500/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Star size={120} />
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-400">
                      <Star size={24} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Divine Eval</h3>
                    <p className="text-slate-400 leading-relaxed">Mendapat evaluasi setingkat Direktur HR di akhir sesi. Mengetahui kelemahan dan kekuatan Anda secara objektif.</p>
                  </div>
                </div>
              </section>

              {/* How it Works */}
              <section id="how-it-works" className="max-w-7xl mx-auto py-32 bg-slate-900/40 rounded-[4rem] border border-white/5 p-20">
                <div className="flex flex-col md:flex-row gap-20">
                    <div className="flex-1 space-y-6">
                        <h2 className="text-5xl font-medium tracking-tight font-sans">Bagaimana <span className="font-serif italic text-blue-400">Bekerja?</span></h2>
                        <p className="text-slate-400 text-lg">Hanya butuh 3 langkah sederhana untuk memulai perjalanan interview Anda.</p>
                        <div className="pt-8 space-y-12">
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-bold text-xl shrink-0">1</div>
                                <div>
                                    <h4 className="text-xl font-bold mb-2">Upload CV & JD</h4>
                                    <p className="text-slate-500">Masukkan dokumen Anda untuk memberikan konteks pada AI.</p>
                                </div>
                            </div>
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 rounded-full border border-white/20 text-white flex items-center justify-center font-bold text-xl shrink-0">2</div>
                                <div>
                                    <h4 className="text-xl font-bold mb-2">Mulai Sesi Suara</h4>
                                    <p className="text-slate-500">Berbicara langsung dengan Siti Rahayu melalui mikrofon Anda.</p>
                                </div>
                            </div>
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 rounded-full border border-white/20 text-white flex items-center justify-center font-bold text-xl shrink-0">3</div>
                                <div>
                                    <h4 className="text-xl font-bold mb-2">Dapatkan Review</h4>
                                    <p className="text-slate-500">Lihat analisis mendalam hasil wawancara Anda secara instan.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        <div className="absolute inset-0 bg-blue-600/20 blur-[120px] rounded-full"></div>
                        <div className="relative bg-black/40 border border-white/10 rounded-[2rem] p-8 aspect-square flex flex-col justify-center gap-4">
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl max-w-[80%]">Tolong ceritakan pengalaman Anda di Google...</div>
                            <div className="p-4 bg-blue-600/20 border border-blue-500/30 rounded-xl max-w-[80%] self-end">Tentu, saya memimpin tim engineering selama 3 tahun...</div>
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl max-w-[80%]">Apa tantangan teknis tersulit yang pernah Anda hadapi?</div>
                        </div>
                    </div>
                </div>
              </section>

              {/* Persona Section */}
              <section className="max-w-7xl mx-auto py-32 flex flex-col md:flex-row items-center gap-20">
                <div className="flex-1 space-y-8">
                  <div className="text-6xl md:text-7xl font-sans tracking-tight">Meet <span className="font-serif italic text-blue-400 underline decoration-blue-500/30">Siti Rahayu.</span></div>
                  <p className="text-xl text-slate-400 leading-relaxed">
                    Bukan sekadar bot. Siti adalah persona yang dirancang untuk menjadi mentor sekaligus penantang. Dia hangat, namun sangat tajam dalam melihat ketidakkonsistenan di dalam CV Anda.
                  </p>
                  <div className="flex gap-12">
                    <div>
                        <p className="text-3xl font-bold text-white">20 Thn</p>
                        <p className="text-xs uppercase tracking-widest text-slate-500">Exp. Director</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-white">Sharp</p>
                        <p className="text-xs uppercase tracking-widest text-slate-500">Evaluation</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-white">Divine</p>
                        <p className="text-xs uppercase tracking-widest text-slate-500">Feedback</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 w-full aspect-square bg-gradient-to-br from-blue-600/20 to-purple-800/20 border border-white/10 rounded-[3rem] p-12 flex items-center justify-center shadow-inner">
                    <div className="w-48 h-48 bg-blue-600/10 rounded-full flex items-center justify-center border border-blue-500/20 relative">
                        <div className="absolute inset-0 animate-ping bg-blue-500/10 rounded-full"></div>
                        <Sparkles className="w-20 h-20 text-blue-500" />
                    </div>
                </div>
              </section>

              {/* Pricing Section */}
              <section id="pricing" className="max-w-7xl mx-auto py-32">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-medium tracking-tight font-sans">Pilih <span className="font-serif italic text-blue-400">Paket</span> Anda</h2>
                    <p className="text-slate-500 max-w-xl mx-auto">Investasi kecil untuk lonjakan karir yang besar.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-10 bg-white/5 border border-white/5 rounded-[2.5rem] flex flex-col">
                        <h4 className="text-xl font-bold mb-2">Gratis</h4>
                        <div className="text-4xl font-bold mb-6">Rp 0 <span className="text-sm font-normal text-slate-500">/selamanya</span></div>
                        <ul className="space-y-4 flex-grow mb-8 text-slate-400">
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> 1 Sesi Wawancara / Hari</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Analisis CV Dasar</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Feedback Teks</li>
                        </ul>
                        <button onClick={handleMulai} className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all">Pilih Gratis</button>
                    </div>
                    <div className="p-10 bg-blue-600 border border-blue-400/30 rounded-[2.5rem] flex flex-col relative overflow-hidden shadow-[0_0_50px_-12px_rgba(37,99,235,0.5)]">
                        <div className="absolute top-4 right-6 px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-white">Terpopuler</div>
                        <h4 className="text-xl font-bold mb-2">Profesional</h4>
                        <div className="text-4xl font-bold mb-6">Rp 99rb <span className="text-sm font-normal text-blue-200">/bulan</span></div>
                        <ul className="space-y-4 flex-grow mb-8 text-blue-50">
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full"></div> Sesi Tanpa Batas</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full"></div> Analisis CV Mendalam</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full"></div> Voice Persona Khusus</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full"></div> Riwayat Sesi Tersimpan</li>
                        </ul>
                        <button onClick={handleMulai} className="w-full py-4 bg-white text-blue-600 hover:bg-slate-100 rounded-xl font-bold transition-all">Mulai Langganan</button>
                    </div>
                    <div className="p-10 bg-white/5 border border-white/5 rounded-[2.5rem] flex flex-col">
                        <h4 className="text-xl font-bold mb-2">Elite</h4>
                        <div className="text-4xl font-bold mb-6">Rp 299rb <span className="text-sm font-normal text-slate-500">/sekali bayar</span></div>
                        <ul className="space-y-4 flex-grow mb-8 text-slate-400">
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Lifetime Access</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Semua Fitur Profesional</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Prioritas Support 1-on-1</li>
                        </ul>
                        <button onClick={handleMulai} className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all">Pilih Elite</button>
                    </div>
                </div>
              </section>

              {/* FAQ Section */}
              <section id="faq" className="max-w-3xl mx-auto py-32 px-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl font-medium tracking-tight font-sans text-center">FAQ</h2>
                </div>
                <div className="space-y-6">
                    {[
                        { q: "Apakah ini benar-benar suara AI?", a: "Ya, kami menggunakan teknologi Multimodal Live API terbaru dari Google Gemini untuk menghasilkan respon suara yang sangat alami dengan latensi rendah." },
                        { q: "Berapa lama durasi per sesi?", a: "Sesi standar berlangsung sekitar 10-15 menit, namun Anda bisa mengakhirinya kapan saja setelah mendapatkan cukup feedback." },
                        { q: "Apakah data CV saya aman?", a: "Keamanan adalah prioritas kami. Data CV Anda hanya digunakan untuk memberikan konteks wawancara dan tidak disimpan secara permanen di server kami setelah sesi berakhir." },
                        { q: "Bisakah saya memilih bahasa lain?", a: "Saat ini kami fokus pada Bahasa Indonesia untuk memberikan akurasi evaluasi terbaik, namun kami akan segera meluncurkan dukungan bahasa Inggris." }
                    ].map((item, i) => (
                        <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/[0.07] transition-all">
                            <h4 className="text-lg font-bold mb-3">{item.q}</h4>
                            <p className="text-slate-500 text-sm leading-relaxed">{item.a}</p>
                        </div>
                    ))}
                </div>
              </section>

              {/* Footer */}
              <footer className="max-w-7xl mx-auto py-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                <p className="text-slate-600 text-xs font-mono tracking-widest uppercase">
                    Intervyou © 2026 | Developed by your AI Partner
                </p>
                <div className="flex gap-8 text-xs font-mono uppercase tracking-widest text-slate-400">
                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms</a>
                    <a href="#" className="hover:text-white transition-colors">Twitter</a>
                </div>
              </footer>
            </motion.div>
          )}

          {state === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="py-12 px-4 min-h-screen flex flex-col"
            >
              <nav className="max-w-7xl mx-auto py-8 flex items-center gap-2 mb-12 w-full">
                <button onClick={() => setState('landing')} className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tighter">interv<span className="text-blue-500">you</span></span>
                    <span className="text-xs text-slate-500 ml-4 hidden sm:inline px-3 py-1 border border-white/10 rounded-full">Setup Phase</span>
                </button>
              </nav>
              <div className="flex-grow flex items-center">
                <InterviewSetup onStart={handleStart} />
              </div>
            </motion.div>
          )}

          {state === 'interview' && (
            <motion.div
              key="interview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-hidden"
            >
              <LiveInterview
                cvText={cvText}
                jdText={jdText}
                crossMatchData={crossMatchData}
                onEnd={handleEnd}
              />
            </motion.div>
          )}

          {state === 'evaluation' && (
            <motion.div
              key="evaluation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="py-12 px-4 min-h-screen flex flex-col"
            >
                <nav className="max-w-7xl mx-auto py-8 flex items-center justify-between mb-12 w-full">
                    <button onClick={() => setState('landing')} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tighter">interv<span className="text-blue-500">you</span></span>
                        <span className="text-xs text-slate-500 ml-4 hidden sm:inline px-3 py-1 border border-white/10 rounded-full">Evaluation</span>
                    </button>
                    {user && (
                      <button
                        onClick={() => router.push('/history')}
                        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-3 py-2 border border-white/10 rounded-xl"
                      >
                        <History size={14} /> Riwayat
                      </button>
                    )}
                </nav>

                {/* Saved toast */}
                <AnimatePresence>
                  {savedToast && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-emerald-950 border border-emerald-500/40 text-emerald-300 px-5 py-3 rounded-full shadow-2xl text-sm font-bold"
                    >
                      <CheckCircle size={16} /> Sesi tersimpan ke riwayatmu
                    </motion.div>
                  )}
                </AnimatePresence>
              <div className="flex-grow w-full">
                <InterviewEvaluation
                  history={history}
                  cvText={cvText}
                  jdText={jdText}
                  crossMatchData={crossMatchData}
                  onReset={handleReset}
                  prefetchedEvaluation={prefetchedEvaluation}
                  isPrefetching={isPrefetching}
                  prefetchError={prefetchError}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
