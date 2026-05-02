'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, LiveServerMessage, Modality, StartSensitivity, EndSensitivity } from "@google/genai";
import { AudioManager } from '@/lib/audio-manager';
import { CrossMatchData } from '@/lib/cross-match';

interface LiveInterviewProps {
  cvText: string;
  jdText: string;
  crossMatchData: CrossMatchData | null;
  onEnd: (history: string) => void;
}

export default function LiveInterview({ cvText, jdText, crossMatchData, onEnd }: LiveInterviewProps) {
  const [status, setStatus] = useState<'connecting' | 'active' | 'ending'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{ role: string, text: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Incrementing this triggers a reconnection attempt (used by retry button)
  const [retryCount, setRetryCount] = useState(0);

  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const audioManager = useRef<AudioManager | null>(null);
  const sessionRef = useRef<any>(null);
  const historyRef = useRef<string>("");
  const speakingTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Ref for muted state so the microphone callback always reads the latest
  // value without causing the effect to re-run on every mute toggle.
  const isMutedRef = useRef(false);
  // Latency tracking: timestamp of last user audio chunk sent, reset each AI turn.
  const lastUserAudioTime = useRef<number>(0);
  const aiTurnMeasured = useRef<boolean>(false);

  useEffect(() => {
    // `cancelled` is local to each effect invocation. React 18 Strict Mode
    // intentionally runs effects twice (mount → cleanup → mount) in development.
    // Without this flag, the first session's async callbacks would still fire
    // after cleanup, keeping an orphaned session alive alongside the second one,
    // which causes the "double voice" bug.
    let cancelled = false;
    let micFallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = async () => {
      setError(null);
      setIsAiSpeaking(false);
      setStatus('connecting');

      try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) throw new Error('Gemini API key is not configured in the environment.');

        const ai = new GoogleGenAI({ apiKey });
        const mgr = new AudioManager(24000);
        await mgr.initialize();

        // If cleanup ran while we were initializing audio, bail out immediately.
        if (cancelled) { mgr.close(); return; }

        audioManager.current = mgr;

        const systemInstruction = `
          Anda adalah "Ibu Siti Rahayu", seorang Director of Talent Acquisition dengan pengalaman 20 tahun di perusahaan Fortune 500.
          Karakter Anda adalah: Sangat Profesional, Tajam, Berwibawa, namun tetap memiliki Empati yang tinggi (Warm but Firm).

          TUGAS UTAMA:
          1. Anda adalah pemimpin sesi. Anda yang MEMBUKA wawancara pertama kali tanpa menunggu kandidat.
          2. DENGARKAN JAWABAN KANDIDAT SAMPAI TUNTAS — ini adalah kewajiban utama Anda sebagai pewawancara profesional. Jangan pernah memotong kandidat yang sedang menjawab pertanyaan Anda.

          ATURAN DETEKSI INTERUPSI (SANGAT PENTING — BACA DENGAN CERMAT):
          - INTERUPSI NYATA: Kandidat berbicara DI TENGAH kalimat Anda yang belum selesai, bukan setelah Anda selesai bicara.
          - BUKAN INTERUPSI (jangan bereaksi negatif):
            * Kandidat menjawab SETELAH Anda selesai mengajukan pertanyaan — ini giliran bicara normal.
            * Kandidat mengatakan "Hmm", "Iya", "Baik", "Oke" SAAT Anda bicara — ini tanda setuju, lanjut saja.
            * Kandidat memberikan jawaban panjang lebar — DENGARKAN SELURUHNYA tanpa memotong.
            * Ada jeda singkat di tengah jawaban kandidat — tunggu, mungkin mereka sedang berpikir.
          - Teguran HANYA boleh dilakukan jika kandidat benar-benar memotong kalimat Anda yang belum selesai secara signifikan. Jangan terlalu sensitif.

          CARA MERESPON JAWABAN KANDIDAT:
          1. Setelah kandidat selesai menjawab (termasuk jawaban panjang), akui poin-poin kunci yang mereka sampaikan: "Saya menangkap bahwa Anda menyebutkan [poin A] dan [poin B]. Menarik sekali."
          2. Baru kemudian ajukan pertanyaan lanjutan atau pertanyaan berikutnya.
          3. Jika jawaban kandidat tidak lengkap atau terlalu singkat, gali lebih dalam dengan: "Bisa Anda ceritakan lebih detail mengenai...?"
          4. Jika jawaban sangat komprehensif, apresiasi dengan: "Jawaban yang sangat terstruktur. Sekarang saya ingin beralih ke..."

          FILOSOFI WAWANCARA ANDA:
          1. Anda tidak mencari jawaban yang benar, Anda mencari kejujuran dan kedalaman pemikiran (Critical Thinking).
          2. Jika kandidat memberikan jawaban yang klise (misal: "Saya perfeksionis"), kejar dengan pertanyaan lanjutan yang skeptis namun elegan.
          3. Gunakan teknik STAR (Situation, Task, Action, Result) dalam mengevaluasi jawaban.

          GAYA BICARA & REAKSI:
          1. Gunakan Bahasa Indonesia yang sangat baik (Semi-Formal).
          2. BERIKAN REAKSI MANUSIAWI: "Hmm...", "Oke, saya mengerti poinnya...", "Ah, menarik sekali sudut pandangnya.", "Baik, saya catat itu."
          3. PACING: Berikan jeda setelah kandidat selesai bicara, seolah Anda sedang mencatat hal penting, baru kemudian merespon.

          HASIL ANALISIS CROSS-MATCHING CV vs JD (RAHASIA — PANDUAN WAWANCARA ANDA):
          ${crossMatchData ? `
          - Skor Kesesuaian Kandidat: ${crossMatchData.match_score}/100
          - Skills yang Cocok dengan JD: ${crossMatchData.matched_skills.length > 0 ? crossMatchData.matched_skills.join(', ') : 'Tidak teridentifikasi'}
          - SKILL GAP — AREA PRIORITAS UNTUK DIGALI: ${crossMatchData.skill_gaps.length > 0 ? crossMatchData.skill_gaps.join(', ') : 'Tidak ada gap signifikan'}
          - Penilaian Pengalaman: ${crossMatchData.experience_verdict}
          - Area Fokus Wawancara:
          ${crossMatchData.focus_areas.map((f, i) => `  ${i + 1}. ${f}`).join('\n          ')}
          - Ringkasan Kesesuaian: ${crossMatchData.summary}

          INSTRUKSI: Mulai dari kekuatan kandidat yang teridentifikasi, lalu secara elegan probe ke area skill gap. Jangan sebut "gap" secara eksplisit kepada kandidat.
          ` : 'Data cross-matching tidak tersedia. Gunakan CV dan JD di bawah untuk menentukan fokus pertanyaan.'}

          KONTEN DATA:
          - Pengalaman Kandidat (CV): ${cvText}
          - Kebutuhan Jabatan (JD): ${jdText}

          ATURAN EMAS:
          1. AJUKAN HANYA SATU PERTANYAAN SETIAP KALI BICARA.
          2. MULAI WAWANCARA: Sapa kandidat dengan hangat dan profesional segera setelah koneksi tersambung. Contoh: "Selamat pagi, saya Siti Rahayu. Terima kasih sudah hadir. Saya sudah meninjau resume Anda yang cukup menarik..."
          3. Pertanyaan pertama harus sangat kontekstual dengan latar belakang mereka, bukan sekadar "Perkenalkan diri Anda".
        `;

        // Microphone is started only AFTER Siti finishes her opening turn.
        // Starting it immediately in onopen causes two problems:
        //  1. sessionRef.current is still null → first audio chunks are silently dropped.
        //  2. The mic picks up Siti's own voice (echo) → model treats that as the
        //     user's first response, so the real first answer is skipped.
        let micStarted = false;

        const startMicWhenReady = () => {
          if (micStarted || cancelled) return;
          micStarted = true;
          if (micFallbackTimer) clearTimeout(micFallbackTimer);

          mgr.startMicrophone((base64Data) => {
            if (cancelled || isMutedRef.current || !sessionRef.current) return;
            try {
              sessionRef.current.sendRealtimeInput({
                audio: { data: base64Data, mimeType: 'audio/pcm;rate=24000' }
              });
              lastUserAudioTime.current = Date.now();
              aiTurnMeasured.current = false;
            } catch (_) {
              // Session may be closing — silently ignore.
            }
          });
        };

        const sessionPromise = ai.live.connect({
          model: "gemini-3.1-flash-live-preview",
          callbacks: {
            onopen: () => {
              // Guard: StrictMode may have already cleaned up this effect run.
              if (cancelled) {
                sessionPromise.then(s => { try { s.close(); } catch (_) { } });
                return;
              }

              setStatus('active');

              // Send hidden text to trigger Siti's opening greeting.
              // Microphone is NOT started here — we wait for Siti's first
              // turnComplete signal so the user's answer is never dropped.
              sessionPromise.then(session => {
                if (cancelled) return;
                try {
                  session.sendRealtimeInput({
                    text: "Mulai wawancara. Silakan sapa kandidat dan mulai pertanyaan pertama berdasarkan CV dan JD yang diberikan."
                  });
                } catch (e) {
                  console.error("Failed to send initial text", e);
                }
              });

              // Safety fallback: if turnComplete never fires within 15 s
              // (e.g. network hiccup), start the mic anyway.
              micFallbackTimer = setTimeout(() => startMicWhenReady(), 15000);
            },

            onmessage: (message: LiveServerMessage) => {
              if (cancelled) return;

              const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (base64Audio) {
                if (!aiTurnMeasured.current && lastUserAudioTime.current > 0) {
                  aiTurnMeasured.current = true;
                  setLatencyMs(Date.now() - lastUserAudioTime.current);
                }
                setIsAiSpeaking(true);
                mgr.playPCM(base64Audio);
                if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
                speakingTimerRef.current = setTimeout(() => setIsAiSpeaking(false), 1500);
              }

              if (message.serverContent?.interrupted) {
                mgr.stopAllPlayback();
                setIsAiSpeaking(false);
                if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
              }

              // User speech transcription (from inputAudioTranscription config)
              const inputTranscript = (message as any).serverContent?.inputTranscription?.text;
              if (inputTranscript?.trim()) {
                historyRef.current += `User: ${inputTranscript.trim()}\n`;
                setTranscriptions(prev => [...prev.slice(-4), { role: 'user', text: inputTranscript.trim() }]);
              }

              // AI speech transcription (from outputAudioTranscription config)
              const outputTranscript = (message as any).serverContent?.outputTranscription?.text;
              if (outputTranscript?.trim()) {
                historyRef.current += `AI: ${outputTranscript.trim()}\n`;
                setTranscriptions(prev => [...prev.slice(-4), { role: 'ai', text: outputTranscript.trim() }]);
              }

              // Fallback: capture any text parts in modelTurn (rare with AUDIO modality)
              if (message.serverContent?.modelTurn) {
                const parts = message.serverContent.modelTurn.parts || [];
                const text = parts.map((p: any) => p.text || '').join(' ').trim();
                if (text && !historyRef.current.endsWith(`AI: ${text}\n`)) {
                  historyRef.current += `AI: ${text}\n`;
                  setTranscriptions(prev => [...prev.slice(-4), { role: 'ai', text }]);
                }
              }

              // Siti finished speaking her turn → safe to start the microphone now.
              // The user's first answer will be captured cleanly.
              if (message.serverContent?.turnComplete) {
                startMicWhenReady();
              }
            },

            onclose: () => { console.log('Session closed'); },

            onerror: (err) => {
              if (cancelled) return;
              console.error('Session error:', err);
              setError(err instanceof Error ? err.message : 'Terjadi kesalahan pada sesi wawancara.');
            },
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
            },
            outputAudioTranscription: {},
            inputAudioTranscription: {},
            realtimeInputConfig: {
              automaticActivityDetection: {
                startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_LOW,
                endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_LOW,
                prefixPaddingMs: 400,
                silenceDurationMs: 1800,
              },
            },
            systemInstruction,
          },
        });

        const session = await sessionPromise;

        // Cleanup may have run while we were awaiting the session promise.
        if (cancelled) {
          try { session.close(); } catch (_) { }
          return;
        }

        sessionRef.current = session;
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to start session:', err);
        setError(err instanceof Error ? err.message : 'Gagal menghubungkan ke server AI.');
      }
    };

    connect();

    return () => {
      cancelled = true;
      if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
      if (micFallbackTimer) clearTimeout(micFallbackTimer);
      try { sessionRef.current?.close(); } catch (_) { }
      sessionRef.current = null;
      audioManager.current?.close();
      audioManager.current = null;
    };
  }, [cvText, jdText, retryCount]); // retryCount lets the retry button force a fresh connection

  const handleMuteToggle = () => {
    const next = !isMuted;
    isMutedRef.current = next;
    setIsMuted(next);
  };

  const handleHangUp = () => {
    setStatus('ending');
    try { sessionRef.current?.close(); } catch (_) { }
    audioManager.current?.close();
    onEnd(historyRef.current);
  };

  const handleRetry = () => {
    setRetryCount(c => c + 1);
  };

  return (
    <div className="fixed inset-0 bg-[#0A0C10] text-slate-100 font-sans p-6 flex flex-col overflow-hidden">
      {/* Header Navigation */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tighter">interv<span className="text-blue-500">you</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full animate-pulse ${status === 'active' ? 'bg-red-500' : 'bg-slate-500'}`}></span>
            <span className="text-xs font-medium uppercase tracking-widest">
              {status === 'active' ? 'Sesi Berlangsung' : 'Menghubungkan...'}
            </span>
          </div>
          <button
            onClick={handleHangUp}
            className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center hover:bg-red-600 transition-all group"
          >
            <PhoneOff className="w-4 h-4 text-slate-300 group-hover:text-white" />
          </button>
        </div>
      </header>

      {/* Main Bento Grid */}
      <main className="grid grid-cols-12 grid-rows-6 gap-4 flex-grow">

        {/* Large Call Interface Card */}
        <section className="col-span-8 row-span-4 bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-blue-500 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-blue-400 rounded-full"></div>
          </div>

          <div className="relative z-10 text-center">
            {/* Waveform Visualizer */}
            <div className="flex items-center justify-center gap-1 mb-8 h-24">
              {[8, 16, 24, 12, 20, 14, 10].map((h, i) => (
                <motion.div
                  key={i}
                  animate={status === 'active' ? { height: [h * 2, h * 3, h * 2] } : { height: h * 2 }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                  className="w-2 bg-blue-500 rounded-full"
                />
              ))}
            </div>

            <h2 className="text-3xl font-light mb-2">
              Siti Rahayu{' '}
              <span className="text-blue-400 italic font-serif">
                {isAiSpeaking ? 'sedang berbicara...' : ''}
              </span>
            </h2>

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl max-w-md mx-auto">
                <p className="text-red-400 text-sm font-medium">Error: {error}</p>
                <button
                  onClick={handleRetry}
                  className="mt-2 text-xs text-white underline hover:text-red-300 transition-colors"
                >
                  Coba Hubungkan Kembali
                </button>
              </div>
            )}

            {!error && (
              <div className="flex gap-2 justify-center mb-6">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50">
                  <div className="flex gap-1">
                    <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1 h-1 bg-blue-400 rounded-full" />
                    <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }} className="w-1 h-1 bg-blue-400 rounded-full" />
                    <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 1 }} className="w-1 h-1 bg-blue-400 rounded-full" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                    Siti sedang mencatat...
                  </span>
                </div>
              </div>
            )}

            <div className="max-w-md mx-auto h-24 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {transcriptions.length > 0 && (
                  <motion.p
                    key={transcriptions[transcriptions.length - 1].text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-slate-400 text-lg leading-relaxed italic"
                  >
                    &ldquo;{transcriptions[transcriptions.length - 1].text}&rdquo;
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Transcription Subtitle Overlay */}
          <div className="absolute bottom-8 left-8 right-8 py-4 px-6 bg-black/40 backdrop-blur-md border border-slate-700/50 rounded-2xl">
            <p className="text-sm text-slate-300 italic">Mendengarkan respon Anda secara otomatis...</p>
          </div>
        </section>

        {/* Job Context Card */}
        <section className="col-span-4 row-span-2 bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-slate-800 rounded-[2rem] p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Konteks Pekerjaan</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-white">Target Posisi</p>
              <p className="text-xs text-slate-400 italic overflow-hidden text-ellipsis whitespace-nowrap">{jdText.slice(0, 40)}...</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-slate-800 text-[10px] rounded-md border border-slate-700">ANALISIS</span>
              <span className="px-2 py-1 bg-slate-800 text-[10px] rounded-md border border-slate-700">SKILL GAP</span>
              <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-[10px] rounded-md border border-blue-800/50 font-bold uppercase tracking-tighter">Live AI</span>
            </div>
          </div>
        </section>

        {/* Real-time Status Card */}
        <section className="col-span-4 row-span-2 bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Evaluasi Langsung</h3>
          <div className="flex-grow flex flex-col justify-center gap-4">
            <div className="flex items-end justify-between">
              <span className="text-xs text-slate-400">Status Percakapan</span>
              <span className="text-xl font-mono text-emerald-400">{status === 'active' ? 'AKTIF' : 'WAIT'}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: status === 'active' ? '100%' : '0%' }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-emerald-500 h-full rounded-full"
              />
            </div>
            <div className="mt-2">
              <p className="text-xs text-slate-500 italic">Tip: Berikan jawaban yang terstruktur (STAR method).</p>
            </div>
          </div>
        </section>

        {/* Mic Control Card */}
        <section className="col-span-3 row-span-2 bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 flex flex-col items-center justify-center">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 self-start">Control</h3>
          <button
            onClick={handleMuteToggle}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              }`}
          >
            {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
          </button>
          <p className="mt-4 text-[10px] text-slate-400 uppercase font-bold tracking-widest">{isMuted ? 'Mic Mati' : 'Mic Aktif'}</p>
        </section>

        {/* Analysis Insights Card */}
        <section className="col-span-6 row-span-2 bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Live Insights</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl">
              <p className="text-xs font-bold text-blue-400">Analisis Suara</p>
              <p className="text-[10px] text-slate-400 mt-1">Tone & Intonasi terdeteksi secara real-time.</p>
            </div>
            <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl">
              <p className="text-xs font-bold text-emerald-400">Kesesuaian CV</p>
              <p className="text-[10px] text-slate-400 mt-1">Mencocokkan pengalaman dengan pertanyaan.</p>
            </div>
          </div>
        </section>

        {/* Engine Status Card */}
        <section className="col-span-3 row-span-2 bg-blue-600 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm font-bold uppercase tracking-tighter">AI Engine</p>
          <p className="text-[10px] opacity-80 uppercase tracking-widest text-white/70">Multimodal Live</p>
        </section>

      </main>

      {/* Footer Info */}
      <footer className="mt-6 flex justify-between items-center px-2 text-[10px] text-slate-500 font-mono">
        <div className="flex gap-6">
          <span>Latensi: <span className={latencyMs === null ? 'text-slate-500' : latencyMs < 1500 ? 'text-emerald-500' : 'text-amber-400'}>{latencyMs === null ? '--' : `${latencyMs}ms`}</span></span>
          <span>Engine: <span className="text-blue-400">GEMINI-LIVE-V3</span></span>
          <span>Status: <span className="text-white uppercase">{status}</span></span>
        </div>
        <div className="italic">Gunakan microphone berkualitas untuk hasil terbaik</div>
      </footer>
    </div>
  );
}
