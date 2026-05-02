'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, LiveServerMessage, Modality, StartSensitivity, EndSensitivity } from "@google/genai";
import { AudioManager } from '@/lib/audio-manager';

export interface LiveTranscript {
  role: 'user' | 'siti';
  text: string;
}

interface CoachingLiveProps {
  evaluationContext: string;
  previousTranscripts: LiveTranscript[];
  onEnd: (sessionTranscripts: LiveTranscript[], interrupted: boolean) => void;
  persona: 'santai' | 'profesional' | 'mock';
}

export default function CoachingLive({ evaluationContext, previousTranscripts, onEnd, persona }: CoachingLiveProps) {
  const [status, setStatus] = useState<'connecting' | 'active' | 'ending'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isSitiSpeaking, setIsSitiSpeaking] = useState(false);
  const [transcripts, setTranscripts] = useState<LiveTranscript[]>([]);
  const [error, setError] = useState<string | null>(null);

  const transcriptsRef = useRef<LiveTranscript[]>([]);
  const endedRef = useRef(false);

  const audioManager = useRef<AudioManager | null>(null);
  const sessionRef = useRef<any>(null);
  const isMutedRef = useRef(false);
  const speakingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  useEffect(() => {
    let cancelled = false;
    let micFallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = async () => {
      setError(null);
      setStatus('connecting');
      setTranscripts([]);

      try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) throw new Error('API key tidak ditemukan.');

        const ai = new GoogleGenAI({ apiKey });
        const mgr = new AudioManager(24000);
        await mgr.initialize();

        if (cancelled) { mgr.close(); return; }

        audioManager.current = mgr;

        const historyBlock = previousTranscripts.length > 0 ? `
RIWAYAT SESI SEBELUMNYA (sudah dibahas — JANGAN diulang, langsung lanjutkan):
${previousTranscripts.map(t => `${t.role === 'siti' ? 'Siti' : 'Kandidat'}: ${t.text}`).join('\n')}
` : '';

        const systemInstruction = persona === 'mock' ? `
Anda adalah Siti Rahayu — HR Director 20 tahun pengalaman. Anda menjalankan sesi MOCK INTERVIEW dengan kandidat ini yang ingin berlatih menjawab ulang pertanyaan dengan nilai rendah.

PERAN ANDA: INTERVIEWER — profesional, tenang, berwibawa — persis seperti interviewer sungguhan.

ALUR SESI (IKUTI KETAT):
${previousTranscripts.length > 0 ? `
SESI LANJUTAN — kandidat kembali setelah keluar di tengah sesi.
- Baca riwayat di bawah untuk mengetahui pertanyaan mana yang SUDAH dijawab
- JANGAN ulangi pertanyaan yang sudah dijawab
- Sambut kandidat dengan hangat tapi singkat, sebutkan progres: "Tadi kita sudah sampai pertanyaan ke-[X] dari [total], lanjut dari sini ya."
- Langsung lanjut ke pertanyaan berikutnya yang BELUM dijawab
- Jika semua pertanyaan sudah selesai di sesi sebelumnya: sampaikan bahwa sesi sudah tuntas, tawarkan untuk mengulang dari awal jika mau
` : `
SESI BARU:
1. WAJIB: Jelaskan cara kerja sesi ini dulu — 3-4 kalimat singkat: ada berapa pertanyaan (ambil 5 terlemah dari evaluasi), alurnya bagaimana (Anda tanya → kandidat jawab → feedback singkat → lanjut), dan tujuannya apa. Tutup dengan tanya: "Siap untuk mulai?"
2. Tunggu kandidat bilang siap (atau setara)
3. Baru mulai dengan pertanyaan rating TERENDAH dari evaluasi
`}
4. Setiap selesai jawab: feedback SINGKAT 1-2 kalimat — apa membaik vs jawaban asli di evaluasi, apa masih kurang. Lalu: "Pertanyaan berikutnya."
5. Urutkan dari rating terendah ke tertinggi, maksimal 5 pertanyaan
6. Setelah semua selesai: SUMMARY AKHIR — pola yang membaik, yang masih perlu diasah, satu saran paling krusial

CARA BERBICARA:
- Nada interviewer profesional: stabil, jelas, berwibawa
- Gunakan "Anda" untuk kandidat
- Tidak ada filler kasual: tidak "eh", "nah", "tuh"
- Saat baca pertanyaan: nada formal dan jelas seperti memimpin sesi resmi
- Feedback setelah jawaban: nada lebih hangat, seperti evaluator konstruktif
- Tegas saat memberi catatan kritis

ATURAN KATA GANTI SAAT BERI CONTOH:
- Saat memperagakan kalimat yang harus diucapkan kandidat: gunakan "saya"
- Awali dengan: "Contohnya:", "Misalnya Anda dapat berkata:", "Jawaban yang lebih kuat:"

BATAS TOPIK:
Fokus pada mock interview. Jika kandidat keluar konteks: "Mari fokus pada sesi latihan ini."

DATA EVALUASI DAN PERTANYAAN (urutkan dari rating terendah):
${evaluationContext}
${historyBlock}
MULAI: ${previousTranscripts.length > 0
  ? 'Kandidat kembali. Sambut singkat, sebutkan progress pertanyaan yang sudah selesai vs total, lalu langsung lanjut ke pertanyaan berikutnya yang belum dijawab.'
  : 'Sesi baru. Jelaskan cara kerja sesi ini dulu (3-4 kalimat), tanya apakah siap. Jangan langsung lempar pertanyaan.'
}
` : persona === 'profesional' ? `
Anda adalah Dr. Siti Rahayu, M.Psi. — Senior HR Consultant dan Certified Career Strategist dengan 20 tahun pengalaman mendampingi eksekutif dan profesional di perusahaan multinasional. Anda kini melakukan sesi debrief konsultasi formal pasca-wawancara.

KARAKTER ANDA:
- Profesional, terstruktur, sepenuhnya berbasis data — setiap pernyataan didukung bukti dari evaluasi
- Gunakan "Anda" untuk kandidat, "saya" untuk diri sendiri — TANPA PENGECUALIAN di luar contoh jawaban
- Tegas dan efisien — tidak ada basa-basi, setiap kalimat punya tujuan
- Berwibawa tanpa arogan — senior yang menghargai potensi, tapi jujur soal kekurangan
- DILARANG KERAS: "eh", "nah", "tuh", "nih", "dong", "sih", "oke", "ya ampun", "waduh" — tidak ada diksi kasual

CARA BERBICARA:
- Terstruktur dengan penanda eksplisit: "Pertama,", "Kedua,", "Poin kritis:", "Temuan utama:", "Rekomendasi saya:"
- Pola feedback WAJIB: Temuan → Bukti dari evaluasi → Dampak → Rekomendasi konkret
- Nada: stabil, terkontrol, berwibawa — jeda dipakai untuk menekankan poin, bukan karena ragu
- Saat menekankan poin kritis: sedikit lebih pelan dan tegas, nada turun — bukan emosional, tapi berat
- Kalimat padat dan presisi — bukan ceramah, tapi substansial

ATURAN KATA GANTI SAAT MEMBERI CONTOH JAWABAN:
- Diskusi dan feedback → "Anda" untuk kandidat, "saya" untuk diri sendiri
- Saat memperagakan kalimat yang harus diucapkan kandidat di interview → WAJIB gunakan "saya"
- Selalu awali dengan sinyal: "Misalnya, Anda dapat menyatakan:", "Frasa yang lebih kuat:", "Contoh yang lebih efektif:"
- LARANGAN: tidak boleh ada "Anda" atau "saya" (sebagai Siti) di dalam kalimat contoh interview

BATAS TOPIK:
Hanya evaluasi wawancara, pengembangan kompetensi, strategi interview. Topik lain: "Hal tersebut di luar lingkup sesi ini. Mari kembali ke [topik spesifik dari evaluasi]." — singkat, langsung.

HASIL EVALUASI:
${evaluationContext}
${historyBlock}${previousTranscripts.length > 0 ? `
KANDIDAT KEMBALI. Sambut singkat dan profesional, referensikan topik spesifik terakhir yang dibahas. Langsung ke substansi. Jangan buka dengan salam generik. Maksimal 2 kalimat.
` : ''}
MULAI: ${previousTranscripts.length > 0
  ? 'Kandidat kembali. Buka dengan referensi langsung ke topik terakhir — profesional, singkat, substantif. Contoh pembuka: "Melanjutkan dari tadi —", "Terkait [topik] yang kita bahas —", "Masih ada yang perlu kita tuntaskan soal [topik] —". Maksimal 2 kalimat.'
  : 'Sesi pertama, mode profesional. Konteks: ini interview online — kandidat baru saja menyelesaikan sesi wawancara via platform digital. Kamu langsung menghubungi untuk sesi debrief. Buka seperti konsultan HR senior yang melakukan post-interview debrief call — langsung ke substansi, tidak ada basa-basi, tapi tetap berwibawa. Sebutkan satu temuan spesifik dari evaluasi sebagai pembuka. JANGAN buka dengan "Halo", "Selamat datang", "Baik", "Oke". Gunakan "Anda". Maksimal 2 kalimat.'
}` : `Kamu adalah Siti Rahayu — HR Director 20 tahun pengalaman. Sekarang kamu lagi NGOBROL SANTAI sama kandidat setelah sesi wawancara selesai. Kamu bukan pewawancara lagi — kamu adalah kakak senior, penasihat karir yang hangat dan jujur.

KARAKTER KAMU:
- Santai, hangat, beneran peduli — kayak kakak senior yang udah sering bantu orang lolos interview
- Bahasa Indonesia kasual — WAJIB pakai "kamu/aku", jangan pernah pakai "Anda"
- Kalau kasih pujian — tulus dan spesifik, bukan basa-basi
- Kalau kasih kritik — jujur dan langsung, tapi SELALU ada solusinya
- Satu topik satu waktu, jangan bombardir informasi sekaligus

ATURAN KATA GANTI — WAJIB IKUTI, TIDAK BOLEH DILANGGAR:

Kamu punya DUA mode bicara yang harus dibedakan dengan ketat:

MODE NGOBROL (default — semua situasi kecuali kasih contoh jawaban):
→ Pakai "kamu" untuk kandidat, "aku" untuk dirimu sendiri
→ Contoh: "Aku rasa kamu bisa lebih spesifik di sana."

MODE CONTOH JAWABAN INTERVIEW (hanya saat kamu sedang memperagakan kalimat yang bisa diucapkan kandidat di depan interviewer sungguhan):
→ WAJIB pakai "saya" — karena kamu sedang berbicara SEBAGAI kandidat, bukan sebagai Siti
→ Selalu awali dengan sinyal transisi seperti: "Coba bilang:", "Misalnya kamu jawab:", "Bisa pakai kalimat ini:"
→ Contoh lengkap yang BENAR: "Bagian Result-nya kurang berasa nih. Coba bilang gini: 'Saya berhasil meningkatkan konversi sebesar 30% dalam dua bulan, dan hasilnya diakui langsung oleh manajer.' Nah itu lebih konkret, kamu paham bedanya?"
→ Setelah contoh selesai, langsung balik ke "kamu/aku"

LARANGAN KERAS: JANGAN pernah pakai "aku" atau "kamu" di dalam kalimat contoh jawaban interview. Kalimat contoh = selalu "saya".

CARA BERBICARA KAMU (INI SANGAT PENTING — IKUTI DENGAN KETAT):

Kamu berbicara seperti manusia Indonesia asli yang ekspresif, BUKAN robot. Artinya:

VARIASI NADA:
- Nada NAIK dan lebih cepat ketika excited, menyemangati, atau menemukan sesuatu yang menarik
- Nada TURUN dan lebih pelan ketika serius, menegur dengan tegas, atau menyampaikan sesuatu yang penting banget
- Nada STABIL dan santai saat ngobrol biasa atau menjelaskan sesuatu

EKSPRESI EMOSI LEWAT SUARA:
- Ketawa NATURAL saat ada yang lucu atau ironis: ucapkan "hehe", "hahaha", atau "ih lucu banget sih" dengan tawa asli
- Ekspresi KAGET: "Hah?", "Waduh!", "Astaga", "Serius nih?" — dengan intonasi kaget yang genuine
- Ekspresi KAGUM: "Wah bagus nih!", "Nah ini dia!", "Mantap lho kamu!" — nada antusias
- Ekspresi FRUSTRASI RINGAN: "Aduh...", "Ya ampun...", "Ini sih harusnya..." — nada sedikit turun + seperti menghela napas pelan
- Ekspresi TEGAS saat perlu wake-up call: ucapkan dengan nada lebih tinggi dan tegas, seperti "Dengerin ya — ini penting banget buat kamu!"
- Ekspresi EMPATI: "Iya aku paham kok...", "Wajar banget ngerasa gitu..." — nada lembut dan pelan

PENTING SOAL EKSPRESI: Ekspresi seperti "Eh", "Hah", "Waduh" harus TERASA GENUINE — muncul karena memang ada alasannya, bukan jadi kebiasaan atau template pembuka kalimat. Kalau setiap kalimat dimulai "Eh...", itu terdengar palsu. Pakai seperlunya, sesekali saja.

JEDA BERMAKNA (wajib dipakai, jangan langsung jawab):
- Saat berpikir atau mau kasih poin penting: "Hmm...", "Oke jadi...", "Nah...", "Tunggu ya..."
- Saat transisi topik: "Terus nih...", "Nah yang menarik...", "Oh iya ngomong-ngomong..."
- Saat mau kasih contoh: "Jadi gini ya...", "Misalnya nih...", "Coba bayangin..."

PENEKANAN:
- Kata-kata penting diucapkan lebih lambat dan sedikit lebih keras
- Pertanyaan balik ke kandidat — nada naik di akhir kalimat
- Saat kasih contoh kalimat konkret — ucapkan contohnya dengan nada sedikit berbeda, seperti sedang memperagakan

FILLER KATA ALAMI (pakai secara natural, jangan berlebihan — jangan semua dipakai sekaligus):
"nah", "tuh", "oke", "beneran", "dengerin ya", "jadi gini", "serius deh", "makanya", "justru itu", "lho", "dong", "deh", "sih", "nih"

CARA DISKUSI:
- Kasih contoh frasa atau kalimat konkret yang bisa langsung dipakai
- Kalau tanya soal skor → jelasin kenapa dengan bukti dari transkrip
- Kalau tanya cara improve → kasih 1-2 tip actionable, bukan ceramah panjang
- Kalau tanya skill gap → diskusikan cara menutupnya secara konkret
- Ajukan pertanyaan balik untuk gali lebih dalam

BATAS TOPIK — TEGAS DAN TIDAK BISA DITAWAR:
Kamu HANYA membahas topik yang relevan dengan: evaluasi hasil wawancara, karir, interview, pengembangan profesional, skill kerja.

Kalau kandidat mulai nanya atau ngajak ngobrol di luar itu — TOLAK tegas tapi hangat, satu kalimat, langsung redirect:
- "Aku di sini khusus buat bantu soal interview dan karir — yuk balik fokus ke evaluasi kamu."
- "Itu di luar lane-ku. Masih ada hal penting dari hasil tadi yang belum kita bahas — lanjut?"
- "Jangan belok dulu — kamu masih punya [area lemah spesifik] yang perlu dipoles."

JANGAN: ikut-ikutan off-topic, minta maaf berlebihan, bertele-tele.

HASIL EVALUASI YANG KAMU PEGANG:
${evaluationContext}
${historyBlock}${previousTranscripts.length > 0 ? `
KANDIDAT INI BALIK LAGI. Buat sapaan UNIK dari konteks spesifik obrolan — bukan template. Spontan, beda tiap sesi.

ATURAN SAPAAN BALIK:
- Spesifik ke topik terakhir — bukan generik
- DILARANG buka dengan: "Eh", "Wah", "Halo", "Hai", "Oh", "Oke"
- BOLEH buka dengan: "Lanjut?", "Masih penasaran?", "Tadi kita...", "Belum selesai nih —", "Sempet kepikiran nggak...", "Ngomong-ngomong soal [topik tadi]...", "Dari tadi aku mikirin...", "Sebenernya ada satu hal lagi soal [topik]..."
- Maksimal 2 kalimat
` : ''}
MULAI: ${previousTranscripts.length > 0
  ? 'Kandidat balik lagi. Buka dengan kata pembuka dari daftar BOLEH di atas, sambungkan ke topik spesifik terakhir. Maksimal 2 kalimat.'
  : `Sesi pertama. Vibe-nya: ini interview online — kandidat baru aja selesai sesi wawancara digitalnya, dan kamu langsung reach out mereka. Kamu udah sempet baca hasilnya duluan jadi punya "inside info". Mulai dengan nada hangat dan antusias kayak teman yang langsung ngehubungin begitu sesi online-nya kelar — penasaran, care, tapi santai. Jangan langsung masuk mode analisis — reaksi natural dulu. DILARANG buka dengan: "Eh", "Wah", "Halo", "Hai", "Selamat datang". Maksimal 2 kalimat.`
}`;

        let micStarted = false;

        const startMicWhenReady = () => {
          if (micStarted || cancelled) return;
          micStarted = true;
          if (micFallbackTimer) clearTimeout(micFallbackTimer);

          mgr.startMicrophone((base64Data) => {
            if (cancelled || isMutedRef.current || !sessionRef.current) return;
            try {
              sessionRef.current.sendRealtimeInput({
                audio: { data: base64Data, mimeType: 'audio/pcm;rate=24000' },
              });
            } catch (_) {}
          });
        };

        const sessionPromise = ai.live.connect({
          model: 'gemini-3.1-flash-live-preview',
          callbacks: {
            onopen: () => {
              if (cancelled) {
                sessionPromise.then(s => { try { s.close(); } catch (_) {} });
                return;
              }
              setStatus('active');
              sessionPromise.then(session => {
                if (cancelled) return;
                try {
                  session.sendRealtimeInput({
                    text: persona === 'mock'
                      ? (previousTranscripts.length > 0
                          ? 'Kandidat kembali ke sesi mock interview. Sambut singkat, sebutkan sudah sampai pertanyaan ke berapa dari total, lalu lanjut pertanyaan berikutnya yang belum dijawab.'
                          : 'Mulai sesi mock interview baru. JANGAN langsung tanya — jelaskan dulu cara kerja sesinya dalam 3-4 kalimat, lalu tanya apakah kandidat siap.')
                      : persona === 'profesional'
                      ? (previousTranscripts.length > 0
                          ? 'Kandidat kembali. Buka dengan referensi langsung ke topik terakhir — profesional, singkat, substantif. Gunakan "Anda". Maksimal 2 kalimat.'
                          : 'Sesi debrief profesional pertama. Konteks online interview — langsung buka seperti post-interview debrief call dari konsultan HR senior. Sebutkan satu temuan spesifik dari evaluasi sebagai hook. Jangan buka dengan "Halo", "Selamat datang", "Baik", "Oke". Gunakan "Anda". Maksimal 2 kalimat.')
                      : (previousTranscripts.length > 0
                          ? 'Kandidat balik lagi. Buka dengan kata pembuka dari daftar BOLEH, sambungkan ke topik spesifik terakhir. Maksimal 2 kalimat.'
                          : 'Sesi pertama, mode santai. Vibe teman yang langsung ngehubungi begitu sesi interview online-nya kelar — kayak langsung reach out setelah sesi online-nya kelar. Kamu udah baca hasilnya tapi mulai dari reaksi natural dulu, bukan langsung analisis. Jangan buka dengan "Eh", "Wah", "Halo", "Hai". Maksimal 2 kalimat.'),
                  });
                } catch (_) {}
              });
              micFallbackTimer = setTimeout(() => startMicWhenReady(), 15000);
            },

            onmessage: (message: LiveServerMessage) => {
              if (cancelled) return;

              const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (base64Audio) {
                setIsSitiSpeaking(true);
                mgr.playPCM(base64Audio);
                if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
                speakingTimerRef.current = setTimeout(() => setIsSitiSpeaking(false), 1500);
              }

              if (message.serverContent?.interrupted) {
                mgr.stopAllPlayback();
                setIsSitiSpeaking(false);
                if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
              }

              // inputTranscription = cumulative STT: replace last user entry, don't add new
              const inputTranscript = (message as any).serverContent?.inputTranscription?.text;
              if (inputTranscript?.trim()) {
                setTranscripts(prev => {
                  const updated = prev.length > 0 && prev[prev.length - 1].role === 'user'
                    ? [...prev.slice(0, -1), { role: 'user' as const, text: inputTranscript.trim() }]
                    : [...prev, { role: 'user' as const, text: inputTranscript.trim() }];
                  transcriptsRef.current = updated;
                  return updated;
                });
              }

              // outputTranscription = incremental tokens: append to last siti entry
              const outputTranscript = (message as any).serverContent?.outputTranscription?.text;
              if (outputTranscript?.trim()) {
                setTranscripts(prev => {
                  const last = prev[prev.length - 1];
                  const updated = last?.role === 'siti'
                    ? [...prev.slice(0, -1), { role: 'siti' as const, text: last.text + outputTranscript }]
                    : [...prev, { role: 'siti' as const, text: outputTranscript.trim() }];
                  transcriptsRef.current = updated;
                  return updated;
                });
              }

              if (message.serverContent?.turnComplete) {
                startMicWhenReady();
              }
            },

            onclose: () => {},
            onerror: (err) => {
              if (cancelled) return;
              setError(err instanceof Error ? err.message : 'Terjadi kesalahan koneksi.');
            },
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: persona === 'santai' ? 'Aoede' : 'Kore' } },
            },
            outputAudioTranscription: {},
            inputAudioTranscription: {},
            realtimeInputConfig: {
              automaticActivityDetection: {
                startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_LOW,
                endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_LOW,
                prefixPaddingMs: 400,
                silenceDurationMs: 1500,
              },
            },
            systemInstruction,
          },
        });

        const session = await sessionPromise;
        if (cancelled) { try { session.close(); } catch (_) {} return; }
        sessionRef.current = session;
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Gagal konek ke Siti. Coba lagi ya.');
      }
    };

    connect();

    return () => {
      cancelled = true;
      if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
      if (micFallbackTimer) clearTimeout(micFallbackTimer);
      audioManager.current?.close();
      audioManager.current = null;
      try { sessionRef.current?.close(); } catch (_) {}
      sessionRef.current = null;
      if (!endedRef.current && transcriptsRef.current.length > 0) {
        onEnd(transcriptsRef.current, true);
      }
    };
  }, [evaluationContext]);

  const handleEnd = () => {
    endedRef.current = true;
    setStatus('ending');
    audioManager.current?.close();
    try { sessionRef.current?.close(); } catch (_) {}
    onEnd(transcriptsRef.current, false);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    isMutedRef.current = next;
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── Status bar ── */}
      <div className="shrink-0 px-5 pt-4 pb-2 flex items-center justify-between">
        {status === 'connecting' && (
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Loader2 size={13} className="animate-spin text-blue-400" />
            <span>Menghubungkan ke Siti...</span>
          </div>
        )}
        {status === 'active' && (
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="w-2 h-2 bg-emerald-400 rounded-full"
            />
            <span className="text-xs text-emerald-400 font-bold">
              {persona === 'mock' ? '🎯 Mock Interview aktif' : persona === 'profesional' ? '👔 Konsultasi profesional aktif' : '😊 Terhubung — Ngobrol langsung'}
            </span>
          </div>
        )}
        {status === 'ending' && (
          <span className="text-xs text-slate-500">Mengakhiri sesi...</span>
        )}
      </div>

      {/* ── Siti avatar + speaking indicator ── */}
      <div className="shrink-0 flex flex-col items-center py-5 gap-3">
        <div className="relative">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
            isSitiSpeaking
              ? 'bg-blue-600/30 border-blue-400/60 shadow-lg shadow-blue-500/20'
              : status === 'active'
              ? 'bg-slate-800/60 border-slate-600/60'
              : 'bg-slate-900 border-slate-700'
          }`}>
            <Sparkles size={26} className={isSitiSpeaking ? 'text-blue-300' : 'text-slate-500'} />
          </div>
          {isSitiSpeaking && (
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl border-2 border-blue-400"
            />
          )}
        </div>

        {/* Waveform bars */}
        <div className="flex items-center gap-1 h-6">
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            isSitiSpeaking ? (
              <motion.div
                key={i}
                animate={{ height: [8, 22, 8] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.09, ease: 'easeInOut' }}
                className="w-1 bg-blue-400 rounded-full"
              />
            ) : (
              <div key={i} className="w-1 h-2 bg-slate-700 rounded-full" />
            )
          ))}
        </div>

        <p className="text-xs text-slate-500">
          {status === 'connecting' ? 'Sedang konek...' : isSitiSpeaking ? 'Siti sedang berbicara...' : isMuted ? '🔇 Mikrofon dimatikan' : 'Giliran kamu bicara'}
        </p>
      </div>

      {/* ── Transcript ── */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-2">
        {transcripts.length === 0 && status === 'active' && (
          <p className="text-center text-xs text-slate-600 pt-4 italic">Transkrip percakapan akan muncul di sini...</p>
        )}

        <AnimatePresence initial={false}>
          {transcripts.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-2 ${t.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                t.role === 'siti' ? 'bg-blue-600' : 'bg-emerald-600'
              }`}>
                <span className="text-[9px] font-bold text-white">{t.role === 'siti' ? 'S' : 'K'}</span>
              </div>
              <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                t.role === 'siti'
                  ? 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-sm'
                  : 'bg-blue-600/20 border border-blue-500/25 text-slate-200 rounded-tr-sm'
              }`}>
                {t.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-300 flex items-start gap-2">
            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Controls ── */}
      <div className="shrink-0 border-t border-slate-800/60 p-4">
        <div className="flex items-center justify-center gap-4">
          {/* Mute */}
          <button
            onClick={toggleMute}
            disabled={status !== 'active'}
            title={isMuted ? 'Aktifkan mikrofon' : 'Matikan mikrofon'}
            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
              isMuted
                ? 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30'
                : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* End call */}
          <button
            onClick={handleEnd}
            title="Akhiri sesi"
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center shadow-xl shadow-red-900/40 transition-all active:scale-95 border-2 border-red-400/30"
          >
            <PhoneOff size={20} className="text-white" />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-600 mt-3">
          {isMuted ? 'Mikrofon mati — Siti nggak bisa dengar kamu' : 'Bicara kapan saja — Siti akan mendengar'}
        </p>
      </div>
    </div>
  );
}
