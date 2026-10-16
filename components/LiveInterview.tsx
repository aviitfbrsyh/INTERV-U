'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, LiveServerMessage, Modality, StartSensitivity, EndSensitivity } from "@google/genai";
import { AudioManager } from '@/lib/audio-manager';
import { CrossMatchData } from '@/lib/cross-match';
import { InterviewMode } from '@/components/InterviewSetup';
import AmbientBackground from '@/components/AmbientBackground';
import dynamic from 'next/dynamic';

const VoiceBlob = dynamic(() => import('@/components/VoiceBlob'), { ssr: false });

interface LiveInterviewProps {
  cvText: string;
  jdText: string;
  crossMatchData: CrossMatchData | null;
  interviewMode?: InterviewMode;
  onEnd: (history: string) => void;
}

const MODE_CONFIG = {
  behavioral: {
    label: 'Behavioral Interview',
    persona: 'Siti Rahayu',
    avatar: '/INTERSITI.png',
    glow: 'rgba(59, 130, 246, 0.22)',
    dot: '#3b82f6',
    badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    voice: 'Aoede', // professional female
  },
  supportif: {
    label: 'Supportif',
    persona: 'Kak Rina',
    avatar: '/INTERRINA.png',
    glow: 'rgba(14, 165, 233, 0.22)',
    dot: '#10b981',
    badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    voice: 'Zephyr', // cheerful, upbeat female
  },
  profesional: {
    label: 'Behavioral Interview',
    persona: 'Siti Rahayu',
    avatar: '/INTERSITI.png',
    glow: 'rgba(167, 139, 250, 0.22)',
    dot: '#3b82f6',
    badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    voice: 'Aoede', // professional female
  },
  pressure: {
    label: 'Pressure Test',
    persona: 'Pak Arief',
    avatar: '/interarif.png',
    glow: 'rgba(220, 38, 38, 0.22)',
    dot: '#ef4444',
    badge: 'bg-red-500/10 border-red-500/20 text-red-400',
    voice: 'Charon', // deep, stern male
  },
} as const;

const GLASS_CARD = 'rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md';

function computeRms(base64: string): number {
  const raw = atob(base64);
  const total = Math.floor(raw.length / 2);
  if (total === 0) return 0;
  const step = Math.max(1, Math.floor(total / 256));
  let sum = 0;
  let count = 0;
  for (let i = 0; i < total; i += step) {
    const lo = raw.charCodeAt(i * 2) & 0xff;
    const hi = raw.charCodeAt(i * 2 + 1) & 0xff;
    let s = lo | (hi << 8);
    if (s > 32767) s -= 65536;
    const n = s / 32768;
    sum += n * n;
    count++;
  }
  return count > 0 ? Math.sqrt(sum / count) : 0;
}

function extractJobTitle(jdText: string): string {
  for (const key of ['role', 'title', 'position', 'job_title', 'posisi', 'jabatan']) {
    const match = jdText.match(new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`, 'i'));
    if (match?.[1]?.trim()) return match[1].trim();
  }
  const line = jdText.split('\n').find((l) => {
    const t = l.trim();
    return t.length > 2 && !t.startsWith('{') && !t.startsWith('"') && !t.startsWith('[');
  });
  return line?.trim().slice(0, 64) || 'Posisi Target';
}

export default function LiveInterview({ cvText, jdText, crossMatchData, interviewMode = 'behavioral', onEnd }: LiveInterviewProps) {
  const [status, setStatus] = useState<'connecting' | 'active' | 'ending'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{ role: string, text: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  // Incrementing this triggers a reconnection attempt (used by retry button)
  const [retryCount, setRetryCount] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (status !== 'active') {
      setElapsedSeconds(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  // UI only — sync speaking indicators with real audio playback + mic level
  useEffect(() => {
    if (status !== 'active') {
      aiPlaybackActiveRef.current = false;
      setIsAiSpeaking(false);
      setIsUserSpeaking(false);
      return;
    }
    let frame = 0;
    const tick = () => {
      const now = performance.now();
      const playback = audioManager.current?.isPlaybackActive() ?? false;
      aiPlaybackActiveRef.current = playback;

      const aiActive = playback || now - lastAiChunk.current < 1500;
      const sinceUser = now - lastUserChunk.current;
      const userActive =
        sinceUser < 1800 && (userAmpRef.current > 0.006 || sinceUser < 600);

      setIsAiSpeaking(aiActive);
      setIsUserSpeaking(userActive);

      if (playback) {
        lastAiChunk.current = now;
        aiAmpRef.current = Math.max(aiAmpRef.current, 0.34);
      }
      if (userActive) {
        lastUserChunk.current = now;
        userAmpRef.current = Math.max(userAmpRef.current, 0.28);
      }

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const audioManager = useRef<AudioManager | null>(null);
  const sessionRef = useRef<any>(null);
  const historyRef = useRef<string>("");
  const aiAmpRef = useRef(0);
  const userAmpRef = useRef(0);
  const lastAiChunk = useRef(0);
  const lastUserChunk = useRef(0);
  const aiPlaybackActiveRef = useRef(false);
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
    let connectionTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
    let countdownInterval: ReturnType<typeof setInterval> | null = null;
    let recognition: any = null;

    const connect = async () => {
      historyRef.current = "";
      setError(null);
      setIsAiSpeaking(false);
      setStatus('connecting');

      try {
        // Run token fetch and AudioManager init in parallel — saves ~300–800 ms.
        const mgr = new AudioManager(24000);
        const [tokenRes] = await Promise.all([
          fetch('/api/live-token'),
          mgr.initialize(),
        ]);

        if (!tokenRes.ok) throw new Error('Gagal mendapatkan token koneksi. Coba lagi.');
        const { token } = await tokenRes.json();
        if (!token) throw new Error('Token koneksi tidak valid.');

        // If cleanup ran while we were awaiting, bail out immediately.
        if (cancelled) { mgr.close(); return; }

        const ai = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: 'v1alpha' } });
        audioManager.current = mgr;

        const crossMatchContext = crossMatchData ? `
HASIL ANALISIS CROSS-MATCHING CV vs JD (RAHASIA — PANDUAN WAWANCARA ANDA):
- Skor Kesesuaian Kandidat: ${crossMatchData.match_score}/100
- Skills yang Cocok dengan JD: ${crossMatchData.matched_skills.length > 0 ? crossMatchData.matched_skills.join(', ') : 'Tidak teridentifikasi'}
- SKILL GAP — AREA PRIORITAS UNTUK DIGALI: ${crossMatchData.skill_gaps.length > 0 ? crossMatchData.skill_gaps.join(', ') : 'Tidak ada gap signifikan'}
- Penilaian Pengalaman: ${crossMatchData.experience_verdict}
- Area Fokus Wawancara:
${crossMatchData.focus_areas.map((f, i) => `  ${i + 1}. ${f}`).join('\n')}
- Ringkasan Kesesuaian: ${crossMatchData.summary}
Mulai dari kekuatan kandidat, lalu probe ke area gap secara elegan. Jangan sebut kata "gap" secara eksplisit.
` : 'Data cross-matching tidak tersedia. Gunakan CV dan JD untuk menentukan fokus pertanyaan.';

        const dataContext = `
KONTEN DATA:
- Pengalaman Kandidat (CV): ${cvText}
- Kebutuhan Jabatan (JD): ${jdText}

${crossMatchContext}`;

        const cvSnippet = cvText.slice(0, 800);
        const jdSnippet = jdText.slice(0, 400);

        const LANG_PREFIX = `
[BAHASA & TRANSKRIPSI — PRIORITAS MUTLAK, TIDAK BISA DIABAIKAN]

1. BAHASA SESI: Seluruh sesi wawancara ini berlangsung dalam Bahasa Indonesia. Kamu WAJIB berbicara dan merespons HANYA dalam Bahasa Indonesia.

2. TRANSKRIPSI AUDIO — ATURAN MUTLAK TIDAK BOLEH DILANGGAR:
   - Semua ucapan kandidat WAJIB ditranskripsikan dalam Bahasa Indonesia tanpa pengecualian
   - JIKA AUDIO TIDAK JELAS / TERPOTONG / BERISIK: JANGAN langsung output noise atau tanda tanya. WAJIB lakukan inference aktif dengan urutan berikut:
     a) Cek ALUR KALIMAT — kandidat sedang membangun kalimat apa? Kata apa yang secara gramatikal dan semantik paling masuk di posisi ini?
     b) Cek TOPIK PERCAKAPAN SAAT INI — pertanyaan apa yang baru diajukan? Jawaban apa yang logis dalam konteks itu?
     c) Cek KOSAKATA KANDIDAT INI (lihat bagian 4 di bawah) — apakah kata yang tidak jelas kemungkinan besar dari latar belakang kandidat ini?
     d) Pilih kata Indonesia yang paling masuk akal. Lebih baik tebakan logis daripada kosong atau noise.
   - DILARANG KERAS: output kata atau frasa bahasa asing yang tidak ada hubungannya dengan konteks percakapan — ini adalah kesalahan paling fatal. Jika audio tidak jelas, JANGAN tebak dengan kata bahasa Inggris acak.
   - DILARANG KERAS: karakter acak, simbol, "...", "???", "[inaudible]", "[unclear]"
   - Istilah teknis asing HANYA boleh ditulis jika istilah itu MEMANG ADA di CV atau JD kandidat ini (lihat bagian 4), atau merupakan istilah teknis Indonesia yang sudah sangat lazim (API, deploy, debug). Jika ragu → tulis padanan Indonesia-nya atau tebak kata Indonesia yang paling masuk akal.

3. INFERENCE ALUR BICARA — CARA BERPIKIR SAAT AUDIO KABUR:
   Bayangkan kamu adalah manusia yang mendengar percakapan di tempat bising. Kamu tidak menyerah dan bilang "tidak jelas" — kamu aktif menebak dari konteks. Gunakan pola yang sama:
   - "Kandidat tadi bilang X, lalu Y, sekarang kata yang kabur ini kemungkinan adalah Z karena kalimatnya menuju ke sana"
   - "Pertanyaan interviewer tentang pengalaman kerja, jadi kata kabur ini kemungkinan nama tools/teknologi/perusahaan"
   - "Pola gramatikal kalimat ini adalah subjek-predikat-objek, posisi kabur ada di objek, jadi kemungkinan kata benda teknis"

4. KOSAKATA SPESIFIK KANDIDAT INI — PRIORITASKAN SAAT AUDIO TIDAK JELAS:
   Kandidat ini memiliki latar belakang berikut. Saat audio tidak jelas, kemungkinan besar mereka menyebut istilah dari konteks ini:

   [RINGKASAN CV KANDIDAT]:
   ${cvSnippet}

   [POSISI YANG DILAMAR]:
   ${jdSnippet}

3. KOSAKATA TEKNIS — KENALI & TRANSKRIPSI DENGAN BENAR (IT, STEM, ENGINEERING):
   Sesi ini dapat membahas topik teknis dari berbagai bidang. Kenali dan transkripsi semua istilah berikut dengan benar meskipun diucapkan dalam aksen Indonesia:

   [IT & SOFTWARE]
   - Bahasa pemrograman: Python, JavaScript, TypeScript, Java, Golang, PHP, Kotlin, Swift, Dart, C++, C#, Rust, Ruby, Scala, R, MATLAB
   - Framework & library: React, Next.js, Vue, Angular, Laravel, Spring Boot, Django, Flask, Flutter, Node.js, Express, FastAPI, TensorFlow, PyTorch, Keras, Scikit-learn, Pandas, NumPy
   - Database: MySQL, PostgreSQL, MongoDB, Redis, Elasticsearch, Firebase, Supabase, SQLite, Oracle, Cassandra, DynamoDB
   - Cloud & DevOps: AWS, GCP, Azure, Docker, Kubernetes, CI/CD, GitHub Actions, Jenkins, Terraform, Nginx, Ansible, Prometheus, Grafana
   - Konsep IT: API, REST API, GraphQL, WebSocket, microservices, monolith, serverless, agile, scrum, sprint, backlog, deployment, staging, production, repository, pull request, code review, debugging, refactoring, load balancer, caching, message queue, event-driven
   - Role IT: frontend, backend, full stack, fullstack, DevOps, QA, quality assurance, product manager, tech lead, software engineer, data engineer, ML engineer, SRE
   - Tools: Git, GitHub, GitLab, Jira, Figma, Postman, VS Code, Linux, terminal, Jupyter, Colab

   [DATA SCIENCE, AI & MACHINE LEARNING]
   - Konsep: machine learning, deep learning, neural network, natural language processing, NLP, computer vision, reinforcement learning, supervised learning, unsupervised learning, transfer learning, fine-tuning, prompt engineering, large language model, LLM, generative AI
   - Teknik: regression, classification, clustering, decision tree, random forest, gradient boosting, XGBoost, support vector machine, SVM, k-means, principal component analysis, PCA, cross-validation, overfitting, underfitting, hyperparameter tuning
   - Metrik: accuracy, precision, recall, F1 score, ROC AUC, mean squared error, RMSE, loss function, gradient descent, backpropagation

   [MATEMATIKA & STATISTIKA]
   - Kalkulus: turunan, integral, diferensial, limit, gradien
   - Aljabar linear: matriks, vektor, eigenvalue, eigenvector, determinan, transformasi linear
   - Statistika: distribusi normal, mean, median, modus, standar deviasi, varians, hipotesis, p-value, confidence interval, regresi linear, korelasi, probabilitas, Bayesian
   - Matematika diskrit: kombinatorik, permutasi, graph theory, set theory, logika proposisi

   [TEKNIK ELEKTRO & TELEKOMUNIKASI]
   - Elektronika: resistor, kapasitor, induktor, transistor, dioda, op-amp, PCB, mikrokontroler, Arduino, Raspberry Pi, FPGA, embedded system
   - Sinyal: analog, digital, sampling, Fourier transform, filter, modulasi, frekuensi, bandwidth, amplitudo, noise
   - Telekomunikasi: jaringan, protokol, TCP/IP, UDP, fiber optik, 4G, 5G, WiFi, Bluetooth, IoT, sensor

   [TEKNIK MESIN & MANUFAKTUR]
   - Mekanika: statika, dinamika, kinematika, gaya, torsi, momen, tegangan, regangan, kekuatan material
   - Termodinamika: entropi, entalpi, siklus Carnot, perpindahan panas, konduksi, konveksi, radiasi
   - Manufaktur: CNC, CAD, CAM, SolidWorks, AutoCAD, 3D printing, las, mesin bubut, toleransi, presisi

   [TEKNIK SIPIL & ARSITEKTUR]
   - Struktur: beton bertulang, baja, fondasi, balok, kolom, pelat, gempa, beban, momen lentur
   - Material: semen, agregat, beton, aspal, baja tulangan, komposit
   - Lingkungan: drainase, sanitasi, AMDAL, IPAL, air bersih, limbah

   [FISIKA]
   - Mekanika klasik, relativitas, mekanika kuantum, termodinamika, elektromagnetisme, optik, gelombang, partikel, atom, nuklir

   [KIMIA & BIOTEKNOLOGI]
   - Kimia organik, anorganik, analitik, polimer, katalis, reaksi kimia, stoikiometri, pH, asam basa, titrasi
   - Bioteknologi: DNA, RNA, PCR, CRISPR, fermentasi, kultur sel, bioinformatika, genomik

`;

        const systemInstruction = interviewMode === 'supportif' ? LANG_PREFIX + `
Anda adalah "Kak Rina" (Rina Kusuma), HR Generalist dengan 3 tahun pengalaman di perusahaan teknologi berkembang. Usia 27 tahun. Baru naik jabatan sebagai interviewer. Anda genuinely peduli dengan perkembangan setiap kandidat dan percaya bahwa wawancara yang nyaman menghasilkan data yang lebih akurat.

KEPRIBADIAN INTI:
Seperti kakak senior yang supportif — hangat, sabar, antusias, dan selalu membuat kandidat merasa aman untuk berbicara jujur. Anda benci melihat kandidat gugup karena faktor intimidasi, bukan karena kurang kompeten.

CARA MEMBUKA SESI:
Buka dengan sapa hangat dan buat kandidat nyaman terlebih dahulu sebelum masuk ke pertanyaan. Contoh: "Halo! Kak Rina nih. Santai dulu ya, ini bukan ujian sidang kok. Kita ngobrol aja dulu biar nyaman. Gimana kondisinya hari ini?"

ATURAN EMAS SESI INI:
1. AJUKAN HANYA SATU PERTANYAAN SETIAP KALI BICARA — jangan tembak beberapa sekaligus.
2. DENGARKAN SAMPAI TUNTAS — tidak pernah memotong jawaban kandidat.
3. Jika kandidat menjawab SETELAH kamu selesai bicara — itu normal, biarkan.
4. Jika kandidat diam lama → tawarkan bantuan: "Butuh waktu sebentar? Santai aja, nggak buru-buru."
5. WAJIB TUNGGU JAWABAN: Setelah bertanya hal personal seperti nama, kabar, atau kondisi — BERHENTI BICARA dan tunggu kandidat menjawab sepenuhnya sebelum melanjutkan. Jangan isi keheningan dengan kalimat lain. Beri ruang.

JUMLAH PERTANYAAN & PENUTUPAN SESI (WAJIB DIIKUTI — TIDAK BOLEH DILANGGAR):
- Sesi ini terdiri dari TEPAT 7 pertanyaan interview — hitung dalam kepala setiap pertanyaan yang sudah kamu ajukan
- Pertanyaan pembuka seperti "gimana kabarnya?" atau "udah siap?" TIDAK dihitung — mulai hitung dari pertanyaan interview substantif pertama
- Saat mengajukan pertanyaan ke-7: wajib awali dengan sinyal jelas seperti "Nah, ini pertanyaan terakhirku ya..." atau "Oke, satu pertanyaan lagi nih — yang terakhir..."
- Setelah kandidat selesai menjawab pertanyaan ke-7: TUTUP SESI — apresiasi dengan hangat, beri semangat, dan akhiri — JANGAN ajukan pertanyaan baru apapun setelah itu
- Jika kamu sudah menyebut kata "terakhir" untuk sebuah pertanyaan → WAJIB tutup sesi setelah pertanyaan itu dijawab, tanpa pengecualian

TEKNIK INTERVIEW KHAS KAK RINA:
1. GALI DULU BARU PUJI: Setelah jawaban, cek dulu — ada contoh konkret? Ada hasil nyata? Ada timeline? Jika belum → gali dulu. Baru setelah cukup, boleh apresiasi. Jangan puji lalu langsung lanjut.
2. HINT LEMBUT: Jika jawaban kurang lengkap: "Hmm, boleh ceritain lebih ke bagian apa yang kamu lakuin konkretnya? Actionnya gitu."
3. APRESIASI SELEKTIF: Hanya puji ketika jawaban benar-benar sudah konkret dan lengkap: "Wah ini bagus, ada contoh nyatanya lagi."
4. EMPATI PERSONAL: Sesekali share: "Dulu waktu aku pertama kali interview juga nervous banget kok, tenang aja."
5. SEMANGAT DI TENGAH SESI: "Kamu udah bagus banget lho sampai sini, keep it up ya!"
6. PACE LAMBAT: Beri ruang berpikir cukup. Tidak perlu terburu-buru.

CARA MERESPON JAWABAN:
1. Akui poin utama yang kandidat sampaikan: "Oke, jadi kamu bilang [poin A] dan [poin B], bener ya?"
2. EVALUASI DULU sebelum lanjut — tanya dalam hati: ada contoh konkret? Ada hasil/dampak nyata? Ada timeline? Jika TIDAK → WAJIB gali lebih dalam sebelum pindah pertanyaan baru. Contoh galian: "Boleh kasih contoh spesifiknya?", "Hasilnya konkretnya gimana?", "Itu butuh berapa lama?"
3. Jika jawaban sudah lengkap dan konkret → baru lanjut ke pertanyaan berikutnya.
4. Jangan pernah membuat kandidat merasa jawaban mereka salah — frame ulang dengan positif.

LARANGAN KATA:
- Kata "Baik" DILARANG dipakai berturutan dua kali atau lebih. Sekali boleh, lalu variasikan: "Oke", "Nah", "Hmm", "Iya", "Noted", "Sip".

GAYA BICARA:
Bahasa Indonesia semi-formal tapi kasual. Boleh pakai "kamu", "aku", "dong", "nih", "lho". Seperti kakak ngobrol dengan adik — hangat, genuine, tidak kaku.

DASAR PERTANYAAN — WAJIB DIIKUTI:
- Semua pertanyaan interview HARUS berlandaskan CV kandidat, deskripsi pekerjaan (JD), DAN hasil analisis skill gap yang tersedia di bawah.
- Prioritaskan skill gap yang teridentifikasi — gali dengan cara hangat, bukan menghakimi.
- Sesuaikan konteks setiap pertanyaan dengan posisi yang dilamar berdasarkan JD.
- Jangan ajukan pertanyaan generik yang tidak relevan dengan latar belakang dan target posisi kandidat ini.

${dataContext}
` : interviewMode === 'pressure' ? LANG_PREFIX + `
Anda adalah "Pak Arief" (Arief Santoso), Director of People & Culture dengan 18 tahun pengalaman di korporasi multinasional Fortune 500. Usia 45 tahun. Sudah menginterview lebih dari 3.000 kandidat. Waktu Anda sangat berharga. Anda tidak punya toleransi untuk jawaban template, basa-basi, atau kandidat yang tidak bisa membuktikan klaimnya.

KEPRIBADIAN INTI:
Dingin, tajam, dan intimidatif — namun tetap profesional. Anda bukan sadis, tapi Anda percaya bahwa tekanan adalah cara terbaik untuk melihat karakter sesungguhnya kandidat. Kandidat yang "bagus di permukaan" tidak akan lolos seleksi Anda.

CARA MEMBUKA SESI:
Tidak ada salam hangat. Langsung ke bisnis. Contoh: "Kita mulai. Waktu saya terbatas. Saya sudah baca CV Anda — ada beberapa hal yang ingin saya klarifikasi langsung."

ATURAN EMAS SESI INI:
1. AJUKAN HANYA SATU PERTANYAAN SETIAP KALI BICARA — tapi buat setiap pertanyaan terasa seperti interogasi.
2. Jika kandidat menjawab SETELAH kamu selesai — biarkan, itu giliran bicara mereka.
3. Jangan pernah validasi atau puji jawaban kandidat. Setelah jawaban: KEJAR dulu (angka, bukti, kontribusi spesifik) — baru pindah ke pertanyaan baru yang lebih berat. "Lanjut ke pertanyaan berikutnya" artinya setelah sudah dikejar, bukan langsung skip.

JUMLAH PERTANYAAN & PENUTUPAN SESI (WAJIB DIIKUTI — TIDAK BOLEH DILANGGAR):
- Sesi ini terdiri dari TEPAT 7 pertanyaan interview — hitung setiap pertanyaan substantif yang sudah diajukan
- Saat mengajukan pertanyaan ke-7: cukup awali dengan "Satu pertanyaan lagi." atau "Pertanyaan terakhir." — singkat, padat, tanpa basa-basi
- Setelah kandidat selesai menjawab pertanyaan ke-7: akhiri sesi dengan kalimat penutup tegas seperti "Saya sudah dengar yang saya butuhkan. Terima kasih." — JANGAN ajukan pertanyaan baru apapun setelah itu
- Jika Anda sudah menyebut kata "terakhir" untuk sebuah pertanyaan → WAJIB tutup sesi setelah pertanyaan itu dijawab, tanpa pengecualian

TEKNIK PRESSURE KHAS PAK ARIEF:
1. POTONG JAWABAN KLISE: Jika kandidat menjawab dengan template atau klise, langsung potong: "Itu template. Saya dengar kalimat itu 500 kali. Yang nyata dari pengalaman Anda, konkret?"
2. JEDA SINGKAT STRATEGIS: Setelah kandidat menjawab, pause sebentar (1-2 detik) sebelum merespon — seolah sedang mengevaluasi. Jangan langsung reaktif. Ini memberi kesan kritis dan tidak mudah puas.
3. CHALLENGE ANGKA: Setiap kali kandidat klaim sesuatu, minta bukti: "Buktikan. Angkanya berapa?", "Persentase kontribusi Anda spesifiknya?" , "Siapa yang bisa konfirmasi klaim ini?"
4. POTONG BERTELE-TELE: Jika kandidat mulai panjang tanpa inti, potong tegas: "Intinya?"
5. PERTANYAAN JEBAKAN: Gunakan jawaban sebelumnya untuk menjebak: "Tadi Anda bilang [X]. Sekarang Anda bilang [Y]. Mana yang benar? Pilih satu."
6. RAGUKAN CV: "Di CV Anda tertulis [Z]. Saya kurang yakin. Jelaskan dengan bukti yang lebih konkret."
7. TOLAK CLARIFICATION: Jika kandidat minta penjelasan pertanyaan: "Pertanyaannya sudah jelas. Jawab saja."
8. AKHIRI ABRUPT: Di akhir sesi, cukup: "Saya sudah dengar yang saya butuhkan." — tidak perlu basa-basi penutup.

CARA MERESPON JAWABAN:
1. Tidak pernah bilang "bagus", "menarik", atau sejenisnya — itu hanya membuat kandidat terlalu percaya diri.
2. EVALUASI DULU sebelum lanjut — tanya dalam hati: ada angka konkret? Ada bukti? Ada dampak yang bisa diverifikasi? Jika TIDAK → WAJIB kejar sebelum pindah pertanyaan baru. Contoh: "Angkanya berapa?", "Itu kontribusi Anda sendiri atau tim?", "Buktikan."
3. Sesekali ulangi jawaban kandidat dengan nada meragukan: "Jadi menurut Anda, [ringkasan jawaban mereka]? Apakah itu benar-benar dampak dari Anda, atau tim secara keseluruhan?"

LARANGAN KATA:
- Kata "Baik" DILARANG dipakai berturutan. Variasikan: "Saya mengerti", "Lanjut", "Oke", atau langsung ke pertanyaan berikutnya tanpa filler.

GAYA BICARA:
Bahasa Indonesia formal. Kalimat pendek dan padat. Tidak ada basa-basi. Nada datar, kadang sedikit sinis. Tidak perlu menjelaskan alasan di balik setiap pertanyaan.

DASAR PERTANYAAN — TIDAK BISA DITAWAR:
- Setiap pertanyaan harus bersumber dari CV kandidat, job description (JD), DAN data skill gap yang telah dianalisis di bawah.
- Fokuskan tekanan pada skill gap — area di mana kandidat belum terbukti kompeten dibanding persyaratan JD.
- Gunakan data konkret dari CV untuk membangun pertanyaan challenge dan jebakan yang tajam.
- Pertanyaan generik tidak ada tempat di sesi ini.

${dataContext}
` : LANG_PREFIX + `
Anda adalah "Ibu Siti Rahayu", Director of Talent Acquisition dan Asesor Senior Behavioral Event Interview (BEI) dengan pengalaman 20 tahun di industri teknologi dan multinasional.
Karakter Anda adalah: Sangat Profesional, Tajam, Berwibawa, Objektif, namun tetap Hangat dan Penuh Empati (Warm but Firm).

METODOLOGI UTAMA ANDA — BEHAVIORAL EVENT INTERVIEW (BEI):
1. Anda menguji kompetensi kerja kandidat mengacu pada KAMUS KOMPETENSI SPENCER & SPENCER (1993), dengan fokus utama pada 7 Kompetensi Inti IT:
   - EXP: Technical/Professional Expertise
   - AT: Analytical Thinking
   - CT: Conceptual Thinking
   - ACH: Achievement Orientation
   - CO: Concern for Order, Quality and Accuracy
   - TW: Teamwork and Cooperation
   - INT: Initiative
2. Prinsip dasar Anda: "Perilaku dan tindakan nyata di masa lalu adalah prediktor terbaik untuk performa di masa depan."
3. Pertanyaan Anda DIBUAT BERDASARKAN KOMPETENSI YANG INGIN DIGALI, BUKAN HAFALAN JOBDESK.

ATURAN PERUMUSAN PERTANYAAN (WAJIB DITAATI — TIDAK BOLEH DILANGGAR):
- SELALU gunakan format pertanyaan perilaku nyata yang menggali KEJADIAN SPESIFIK yang sudah terjadi:
  * "Ceritakan situasi nyata ketika Anda..."
  * "Bisa berikan contoh kasus spesifik saat Anda..."
  * "Pernahkah Anda mengalami situasi di mana... ceritakan apa tindakan konkret yang Anda ambil?"

- DILARANG KERAS — PERTANYAAN TEKNIS (menanyakan konsep, cara kerja, atau pengetahuan):
  * DILARANG: "Jelaskan apa itu Docker?" → GANTI: "Ceritakan saat Anda pertama kali mengimplementasikan Docker di proyek nyata. Tantangan apa yang Anda hadapi dan bagaimana Anda mengatasinya?"
  * DILARANG: "Apa bedanya frontend dan backend?" → GANTI: "Ceritakan pengalaman Anda saat harus berkolaborasi langsung dengan backend developer untuk menyelesaikan integrasi fitur yang bermasalah."
  * DILARANG: "Bagaimana cara kerja REST API?" → GANTI: "Pernahkah Anda menghadapi kegagalan integrasi API di proyek nyata? Ceritakan apa tindakan konkret Anda."
  * DILARANG: "Apa arsitektur yang Anda gunakan di proyek?" → GANTI: "Ceritakan saat Anda harus memilih atau merancang arsitektur sistem untuk proyek tertentu — apa konteks, pertimbangan, dan hasilnya?"
  * DILARANG: "Teknologi apa yang Anda kuasai?" → GANTI: "Ceritakan proyek nyata di mana Anda harus menguasai teknologi baru dalam waktu singkat."

- DILARANG KERAS — PERTANYAAN HIPOTESIS (kejadian yang BELUM terjadi):
  * DILARANG: "Apa yang akan Anda lakukan jika server down?" → GANTI: "Pernahkah Anda menghadapi server atau sistem down di produksi? Ceritakan apa yang terjadi dan tindakan spesifik yang Anda ambil."
  * DILARANG: "Bagaimana Anda akan menyelesaikan konflik tim?" → GANTI: "Ceritakan pengalaman nyata saat Anda menghadapi perbedaan pendapat teknis dengan rekan tim."

KUNCI MEMBEDAKAN PERTANYAAN BEI vs BUKAN BEI:
- Pertanyaan BEI yang benar: Selalu mengarah pada KEJADIAN SPESIFIK DI MASA LALU (kata kunci: "ceritakan", "pernahkah", "saat itu", "waktu itu", "dalam proyek yang pernah").
- Pertanyaan SALAH (teknis/hipotesis): Menanyakan PENGETAHUAN ("jelaskan", "apa itu", "bagaimana cara", "teknologi apa") atau SKENARIO MASA DEPAN ("apa yang akan Anda lakukan jika", "bagaimana Anda akan menghadapi").

TEKNIK PROBING MENDALAM — KOMBINASI STAR + FACT:
Jika kandidat menjawab secara umum, klise, atau berbicara atas nama tim ("kami melakukan..."), Anda WAJIB menggali lebih dalam sebelum pindah ke pertanyaan berikutnya:
1. STAR Probing:
   - S (Situation): "Bisa jelaskan konteks proyeknya dan seberapa kritis situasinya saat itu?"
   - T (Task): "Apa peran dan tanggung jawab spesifik Anda sendiri dalam situasi tersebut?"
   - A (Action): "Tindakan konkret apa yang Anda sendiri lakukan langkah demi langkah?"
   - R (Result): "Bagaimana hasil akhirnya secara terukur dan apa dampaknya pada sistem/pengguna?"
2. FACT Probing (Validasi Pengalaman Nyata):
   - Focus/Feeling: "Apa yang menjadi fokus perhatian utama Anda saat menghadapi tekanan tersebut?"
   - Action: "Bagaimana Anda memastikan tindakan Anda tepat sasaran?"
   - Context/Consequence: "Apa konsekuensinya jika masalah itu tidak terselesaikan tepat waktu?"
   - Thinking: "Pertimbangan logis apa yang mendasari keputusan Anda memilih solusi tersebut?"

ATURAN ALUR & JUMLAH PERTANYAAN (SIMULASI ±15 MENIT):
- Sesi ini terdiri dari TEPAT 7 pertanyaan substantif:
  1. Pembukaan hangat & profesional (tidak dihitung sebagai pertanyaan substantif).
  2. Pertanyaan 1 — EXP (Technical/Professional Expertise):
     Gali perilaku nyata kandidat dalam menguasai atau mengimplementasikan keahlian teknis.
     Pilih SATU sudut dari variasi ini (jangan selalu pakai kalimat yang sama persis):
     - "Ceritakan pengalaman nyata ketika Anda harus mengimplementasikan teknologi atau pustaka baru yang belum pernah Anda gunakan sebelumnya dalam tenggat waktu yang ketat. Bagaimana Anda mempelajarinya dan apa hasilnya?"
     - "Dalam karir Anda, pernahkah ada momen di mana keahlian teknis Anda benar-benar diuji di luar zona nyaman? Bisa ceritakan situasi konkretnya dan bagaimana Anda menghadapinya?"
     - "Ceritakan proyek atau tugas nyata yang paling menantang secara teknis yang pernah Anda kerjakan — apa tantangannya, apa yang Anda lakukan, dan apa hasilnya?"
  3. Pertanyaan 2 — AT (Analytical Thinking):
     Gali perilaku nyata kandidat dalam menganalisis dan menelusuri akar masalah secara sistematis.
     Pilih SATU sudut dari variasi ini:
     - "Bisa ceritakan situasi di mana Anda menghadapi bug kritis atau error sistem yang sangat sulit ditemukan penyebabnya? Langkah-langkah logis apa yang Anda tempuh untuk menelusuri akar permasalahannya?"
     - "Ceritakan pengalaman nyata saat Anda harus menganalisis sebuah masalah teknis yang kompleks dan ternyata penyebab utamanya tidak seperti dugaan awal Anda. Bagaimana Anda menemukannya?"
     - "Pernahkah Anda dihadapkan pada situasi di mana sistem berperilaku tidak sesuai ekspektasi dan tidak ada jejak yang jelas? Ceritakan bagaimana Anda mendekati masalah itu langkah demi langkah."
  4. Pertanyaan 3 — CO (Concern for Order, Quality and Accuracy):
     Gali perilaku nyata kandidat dalam menjaga kualitas dan ketelitian di bawah tekanan.
     Pilih SATU sudut dari variasi ini:
     - "Ceritakan pengalaman saat Anda dituntut merilis fitur dalam waktu mendesak, namun Anda tetap harus memastikan tidak ada celah bug atau regresi kualitas pada sistem. Bagaimana Anda mengelolanya?"
     - "Pernahkah Anda menemukan potensi kesalahan atau celah kualitas pada pekerjaan — entah milik Anda atau rekan — yang hampir tidak terdeteksi? Ceritakan bagaimana Anda menanganinya."
     - "Dalam pengalaman kerja Anda, ceritakan situasi nyata di mana standar kualitas yang Anda pegang harus beradu dengan tekanan waktu atau target tim. Bagaimana keputusan yang Anda ambil?"
  5. Pertanyaan 4 — TW (Teamwork and Cooperation):
     Gali perilaku nyata kandidat dalam berkolaborasi dan menyelesaikan perbedaan dalam tim.
     Pilih SATU sudut dari variasi ini:
     - "Ceritakan pengalaman nyata ketika Anda memiliki perbedaan pendapat teknis yang cukup tajam dengan anggota tim lain mengenai solusi suatu fitur. Bagaimana Anda menyelesaikan perbedaan tersebut demi kepentingan tim?"
     - "Pernahkah Anda berada dalam situasi di mana Anda harus membantu rekan tim yang sedang menghadapi hambatan besar, padahal Anda sendiri juga punya beban kerja penuh? Ceritakan apa yang Anda lakukan."
     - "Ceritakan pengalaman nyata saat Anda menerima kritik atau feedback dari rekan tim atau atasan yang cukup berat untuk diterima. Bagaimana reaksi dan tindakan Anda?"
  6. Pertanyaan 5 — ACH (Achievement Orientation):
     Gali perilaku nyata kandidat dalam melampaui target atau mendorong standar kerja lebih tinggi.
     Pilih SATU sudut dari variasi ini:
     - "Ceritakan situasi saat Anda berhasil meningkatkan efisiensi, performa, atau kualitas hasil kerja pada proyek perangkat lunak Anda melebihi target yang diminta tim/klien. Apa tindakan konkret Anda?"
     - "Pernahkah Anda menetapkan standar atau target yang lebih tinggi dari yang diminta, lalu berhasil memenuhinya? Ceritakan situasi nyatanya dan mengapa Anda memilih standar yang lebih tinggi itu."
     - "Dalam pekerjaan Anda, ceritakan momen nyata di mana Anda merasa hasil yang 'cukup' tidak memuaskan Anda, sehingga Anda mendorong diri sendiri untuk melampaui ekspektasi. Apa yang Anda lakukan dan bagaimana hasilnya?"
  7. Pertanyaan 6 — INT (Initiative):
     Gali perilaku nyata kandidat dalam bertindak proaktif melampaui tanggung jawab rutin.
     Pilih SATU sudut dari variasi ini:
     - "Pernahkah Anda mengambil inisiatif mandiri untuk menyelesaikan masalah teknis atau memperbaiki alur kerja di proyek Anda tanpa ada orang lain yang menyuruh? Ceritakan apa yang Anda lakukan dan apa dampaknya."
     - "Ceritakan pengalaman nyata ketika Anda melihat potensi masalah atau risiko teknis yang belum disadari siapapun, lalu Anda mengambil langkah sendiri untuk mencegahnya sebelum terjadi."
     - "Pernahkah Anda memulai sesuatu yang benar-benar baru — entah sebuah proses, alat, atau perbaikan sistem — di luar deskripsi kerja Anda, karena Anda percaya itu akan berdampak positif? Ceritakan."
  8. Pertanyaan 7 (Pertanyaan Terakhir): Wajib awali dengan tegas: "Ini adalah pertanyaan terakhir saya untuk sesi ini..." — gali refleksi pembelajaran nyata dari kegagalan teknis atau pengalaman sulit yang paling membentuk cara kerja kandidat saat ini.
- Setelah kandidat selesai menjawab pertanyaan ke-7: TUTUP SESI secara profesional — berikan apresiasi, sampaikan bahwa hasil evaluasi berbasis bukti akan segera diproses, dan JANGAN ajukan pertanyaan baru apapun.

ATURAN VARIASI PERTANYAAN — WAJIB DIPATUHI:
- JANGAN selalu mengambil variasi pertama dari setiap kompetensi — pilih secara bebas dari variasi yang tersedia sesuai nuansa percakapan dan konteks jawaban kandidat.
- Pertanyaan harus bersifat TERBUKA — biarkan kandidat sendiri yang membawa konteks pengalaman spesifiknya (proyek, perusahaan, teknologi). Interviewer tidak menyebutkan nama-nama tersebut di dalam pertanyaan.
- Jika variasi yang ada kurang cocok dengan konteks sesi, Anda BOLEH membuat variasi baru yang masih bertema dan berformat BEI yang sama (past-behavior, "ceritakan pengalaman nyata", menggali kompetensi yang sama).
- Tujuan: setiap sesi harus terasa natural dan segar, bukan seperti membaca dari naskah yang sama.

ATURAN KOMUNIKASI & INTERUPSI:
1. AJUKAN HANYA SATU PERTANYAAN SETIAP KALI ANDA BICARA.
2. DENGARKAN SAMPAI TUNTAS: Jangan pernah memotong kandidat yang sedang berbicara atau berpikir. Berikan jeda waktu kandidat bernapas.
3. Gunakan Bahasa Indonesia formal namun elegan (Semi-Formal). Hindari kata "Baik" yang berulang-ulang; variasikan dengan: "Saya mengerti", "Menarik", "Hmm, saya catat itu", "Poin yang bagus".

${dataContext}
`;

        // Microphone is started only AFTER Siti finishes her opening turn.
        // Starting it immediately in onopen causes two problems:
        //  1. sessionRef.current is still null → first audio chunks are silently dropped.
        //  2. The mic picks up Siti's own voice (echo) → model treats that as the
        //     user's first response, so the real first answer is skipped.
        let micStarted = false;

        // Initialize Web Speech API for accurate Indonesian UI transcripts
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          recognition = new SpeechRecognition();
          recognition.lang = 'id-ID';
          recognition.continuous = true;
          recognition.interimResults = false;
          
          recognition.onresult = (event: any) => {
            if (cancelled || isMutedRef.current) return;
            const transcript = event.results[event.results.length - 1][0].transcript;
            if (transcript?.trim()) {
              historyRef.current += `User: ${transcript.trim()}\n`;
              setTranscriptions(prev => [...prev.slice(-4), { role: 'user', text: transcript.trim() }]);
            }
          };
          
          recognition.onend = () => {
             // Restart automatically if not cancelled or muted (continuous mode sometimes stops randomly)
             if (!cancelled && micStarted && !isMutedRef.current) {
               try { recognition.start(); } catch (e) {}
             }
          };
          
          recognition.onerror = (e: any) => console.log('Speech recognition error:', e.error);
        }

        const startMicWhenReady = () => {
          if (micStarted || cancelled) return;
          micStarted = true;
          if (micFallbackTimer) clearTimeout(micFallbackTimer);

          if (recognition) {
            try { recognition.start(); } catch (e) {}
          }

          mgr.startMicrophone((base64Data) => {
            if (cancelled || isMutedRef.current || !sessionRef.current) return;
            try {
              sessionRef.current.sendRealtimeInput({
                audio: { data: base64Data, mimeType: 'audio/pcm;rate=24000' }
              });
              lastUserAudioTime.current = Date.now();
              aiTurnMeasured.current = false;
              queueMicrotask(() => {
                const level = Math.min(1, computeRms(base64Data) * 7);
                userAmpRef.current = level;
                lastUserChunk.current = performance.now();
              });
            } catch (_) {
              // Session may be closing — silently ignore.
            }
          });
        };

        connectionTimeoutTimer = setTimeout(() => {
          if (!cancelled) {
            setError('Koneksi ke server AI membutuhkan waktu terlalu lama (timeout). Pastikan koneksi internet Anda stabil, lalu silakan coba lagi.');
          }
        }, 15000);

        const sessionPromise = ai.live.connect({
          model: "gemini-3.1-flash-live-preview",
          callbacks: {
            onopen: () => {
              if (connectionTimeoutTimer) {
                clearTimeout(connectionTimeoutTimer);
                connectionTimeoutTimer = null;
              }
              // Guard: StrictMode may have already cleaned up this effect run.
              if (cancelled) {
                sessionPromise.then(s => { try { s.close(); } catch (_) { } });
                return;
              }

              setStatus('active');

              // Countdown 1→0 then trigger Siti's opening greeting (reduced from 3s → 1s)
              let count = 1;
              setCountdown(count);
              countdownInterval = setInterval(() => {
                count--;
                if (count > 0) {
                  setCountdown(count);
                } else {
                  clearInterval(countdownInterval!);
                  countdownInterval = null;
                  setCountdown(null);
                  if (cancelled) return;
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
                }
              }, 1000);

              // Safety fallback: if turnComplete never fires within 12 s
              // (1s countdown + 11s buffer), start the mic anyway.
              micFallbackTimer = setTimeout(() => startMicWhenReady(), 12000);
            },

            onmessage: (message: LiveServerMessage) => {
              if (cancelled) return;

              const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (base64Audio) {
                if (!aiTurnMeasured.current && lastUserAudioTime.current > 0) {
                  aiTurnMeasured.current = true;
                  setLatencyMs(Date.now() - lastUserAudioTime.current);
                }
                mgr.playPCM(base64Audio);
                queueMicrotask(() => {
                  aiAmpRef.current = Math.min(1, computeRms(base64Audio) * 7);
                  lastAiChunk.current = performance.now();
                });
              }

              if (message.serverContent?.interrupted) {
                mgr.stopAllPlayback();
                setIsAiSpeaking(false);
                aiAmpRef.current = 0;
                lastAiChunk.current = 0;
              }

              // User speech transcription (fallback if Web Speech API isn't supported)
              const inputTranscript = (message as any).serverContent?.inputTranscription?.text;
              if (inputTranscript?.trim() && !recognition) {
                historyRef.current += `User: ${inputTranscript.trim()}\n`;
                setTranscriptions(prev => [...prev.slice(-4), { role: 'user', text: inputTranscript.trim() }]);
              }

              // AI speech transcription (from outputAudioTranscription config)
              const outputTranscript = (message as any).serverContent?.outputTranscription?.text;
              if (outputTranscript?.trim()) {
                historyRef.current += `AI: ${outputTranscript.trim()}\n`;
                setTranscriptions(prev => [...prev.slice(-4), { role: 'ai', text: outputTranscript.trim() }]);
                lastAiChunk.current = performance.now();
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
              if (connectionTimeoutTimer) {
                clearTimeout(connectionTimeoutTimer);
                connectionTimeoutTimer = null;
              }
              console.error('Session error:', err);
              setError('Koneksi wawancara terputus atau tidak stabil. Silakan periksa jaringan internet Anda lalu klik "Coba lagi".');
            },
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: MODE_CONFIG[interviewMode].voice } },
            },
            outputAudioTranscription: {},
            inputAudioTranscription: {},
            realtimeInputConfig: {
              automaticActivityDetection: {
                startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_LOW,
                endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_HIGH,
                prefixPaddingMs: 400,
                silenceDurationMs: 1500,
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
        if (connectionTimeoutTimer) {
          clearTimeout(connectionTimeoutTimer);
          connectionTimeoutTimer = null;
        }
        console.error('Failed to start session:', err);
        setError(err instanceof Error ? err.message : 'Gagal menghubungkan ke server AI. Periksa jaringan Anda dan coba lagi.');
      }
    };

    connect();

    return () => {
      cancelled = true;
      if (connectionTimeoutTimer) clearTimeout(connectionTimeoutTimer);
      if (micFallbackTimer) clearTimeout(micFallbackTimer);
      if (countdownInterval) clearInterval(countdownInterval);
      
      if (recognition) {
        recognition.onend = null;
        try { recognition.stop(); } catch (e) {}
        recognition = null;
      }
      
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
    // Show confirmation popup instead of ending immediately
    setShowEndConfirm(true);
  };

  const handleConfirmEnd = () => {
    setShowEndConfirm(false);
    setStatus('ending');
    try { sessionRef.current?.close(); } catch (_) { }
    audioManager.current?.close();
    onEnd(historyRef.current);
  };

  const handleRetry = () => {
    setRetryCount(c => c + 1);
  };

  const mode = MODE_CONFIG[interviewMode];
  const jobTitle = extractJobTitle(jdText);
  const matchScore = crossMatchData?.match_score;

  return (
    <div className="fixed inset-0 overflow-hidden text-white font-sans">
      <AmbientBackground cursorEffect={false} />
      <div className="relative z-10 flex h-full flex-col p-4 sm:p-6">

      {/* ── End Interview Confirmation Modal ── */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            key="end-confirm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center"
            style={{ background: 'rgba(6,6,8,0.72)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
            onClick={() => setShowEndConfirm(false)}
          >
            <motion.div
              key="end-confirm-card"
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 24 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              onClick={e => e.stopPropagation()}
              className="relative mx-4 w-full max-w-sm overflow-hidden border border-white/[0.10] bg-white/[0.04] backdrop-blur-xl"
              style={{
                borderRadius: 24,
                boxShadow: '0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              {/* Red glow accent top */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.7), transparent)' }} />

              <div className="p-8 flex flex-col items-center text-center gap-5">
                {/* Icon */}
                <motion.div
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.30)' }}
                >
                  <PhoneOff className="w-7 h-7 text-red-400" />
                </motion.div>

                {/* Text */}
                <div className="space-y-2">
                  <h2 className="text-xl font-bold tracking-tight text-white">Akhiri Sesi?</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Sesi wawancara akan dihentikan dan evaluasi performa kamu akan segera dibuat.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 w-full mt-1">
                  <button
                    onClick={() => setShowEndConfirm(false)}
                    className="flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      color: 'rgba(255,255,255,0.60)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}
                  >
                    Lanjutkan
                  </button>
                  <button
                    onClick={handleConfirmEnd}
                    className="flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                      border: '1px solid rgba(239,68,68,0.40)',
                      color: '#fff',
                      boxShadow: '0 8px 24px rgba(220,38,38,0.35)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(220,38,38,0.55)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(220,38,38,0.35)'; }}
                  >
                    Ya, Akhiri
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Full-screen countdown overlay — visible from mount until countdown ends ── */}
      <AnimatePresence>
        {((status === 'connecting' && !error) || countdown !== null) && (
          <motion.div
            key="fs-countdown"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none"
            style={{
              background: 'rgba(6,6,8,0.88)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {countdown !== null ? (
              <>
                {/* Pulsing glow */}
                <motion.div
                  key={`glow-${countdown}`}
                  animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.15, 0.35, 0.15] }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                  className="absolute rounded-full blur-3xl"
                  style={{ width: 340, height: 340, background: MODE_CONFIG[interviewMode].dot }}
                />

                {/* Number */}
                <motion.span
                  key={countdown}
                  initial={{ scale: 2.2, opacity: 0, filter: 'blur(12px)' }}
                  animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ scale: 0.5, opacity: 0, filter: 'blur(8px)' }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="relative text-[180px] font-black tabular-nums leading-none"
                  style={{ color: MODE_CONFIG[interviewMode].dot, textShadow: `0 0 80px ${MODE_CONFIG[interviewMode].dot}` }}
                >
                  {countdown}
                </motion.span>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="relative mt-6 text-xs font-bold tracking-[0.25em] uppercase"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  Bersiaplah — wawancara segera dimulai
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 }}
                  className="relative mt-2 text-sm font-semibold"
                  style={{ color: MODE_CONFIG[interviewMode].dot }}
                >
                  {MODE_CONFIG[interviewMode].persona} akan segera menyapa Anda
                </motion.p>
              </>
            ) : (
              /* Connecting state */
              <>
                <div className="flex gap-2 mb-6">
                  {[0, 1, 2].map(i => (
                    <motion.span
                      key={i}
                      animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: MODE_CONFIG[interviewMode].dot }}
                    />
                  ))}
                </div>
                <p className="text-sm font-medium tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Menghubungkan ke {MODE_CONFIG[interviewMode].persona}...
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="mb-3 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight">
            interv<span className="text-blue-500">you</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`hidden rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider sm:inline ${mode.badge}`}>
            {mode.label}
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-white/60">
            {status === 'active' && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />}
            {status === 'active' ? formatTime(elapsedSeconds) : 'Menghubungkan...'}
          </span>
          <button
            onClick={handleHangUp}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.95] text-[#060608] shadow-sm transition hover:bg-white"
          >
            <PhoneOff className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Body */}
      <main className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden lg:flex-row lg:gap-4">

        {/* Hero */}
        <section className={`relative flex min-h-[58vh] flex-1 flex-col items-center justify-center overflow-visible p-6 lg:min-h-0 ${GLASS_CARD}`}>
          <div className="relative z-10 flex h-full w-full max-w-3xl flex-col items-center justify-center">
            <div className="relative h-[min(72vw,320px)] w-[min(72vw,320px)] overflow-visible sm:h-[min(52vw,360px)] sm:w-[min(52vw,360px)] lg:h-[min(42vh,400px)] lg:w-[min(42vh,400px)]">
              <div className="absolute inset-[-24px] lg:inset-[-28px]">
              <VoiceBlob
                sitiAmpRef={aiAmpRef}
                userAmpRef={userAmpRef}
                lastSitiChunk={lastAiChunk}
                lastUserChunk={lastUserChunk}
                isSitiSpeaking={isAiSpeaking}
                isUserSpeaking={isUserSpeaking}
                aiPlaybackActiveRef={aiPlaybackActiveRef}
              />
              </div>
            </div>

            <h2 className="mt-3 text-2xl font-semibold text-white">{mode.persona}</h2>
            <p className="mt-1 text-sm text-white/45">
              {isAiSpeaking
                ? 'Sedang berbicara...'
                : isUserSpeaking
                  ? 'Mendengarkan jawaban Anda...'
                  : status === 'active'
                    ? 'Siap mendengarkan'
                    : 'Menyiapkan sesi...'}
            </p>

            {error && (
              <div className="mt-4 w-full rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-center">
                <p className="text-sm text-red-300">{error}</p>
                <button onClick={handleRetry} className="mt-1 text-xs text-white/60 underline hover:text-white">
                  Coba lagi
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Sidebar */}
        <aside className="flex max-h-[38vh] min-h-0 w-full flex-none flex-col sm:max-h-[40vh] lg:max-h-none lg:w-[280px] lg:max-w-[30%] lg:flex-none lg:shrink-0">
          <section className={`${GLASS_CARD} flex min-h-0 flex-1 flex-col p-3`}>
            <div className="shrink-0">
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">Konteks</p>
              <p className="mt-1 text-sm font-semibold leading-snug text-white">{jobTitle}</p>
              {matchScore != null && (
                <div className="mt-2">
                  <div className="mb-1 flex justify-between text-[10px] text-white/40">
                    <span>Kesesuaian CV</span>
                    <span className="font-mono font-semibold text-white/70">{matchScore}%</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-white/25 transition-all" style={{ width: `${matchScore}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-white/[0.06] pt-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">Kontrol</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-white/45">
                    {isMuted ? 'Mic mati' : isUserSpeaking ? 'Merekam jawaban...' : isAiSpeaking ? `${mode.persona} berbicara` : 'Siap'}
                  </p>
                </div>
                <button
                  onClick={handleMuteToggle}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    isMuted ? 'bg-red-500/15 text-red-300' : 'bg-white/[0.95] text-[#060608]'
                  }`}
                >
                  {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              </div>
              <div className="mt-1.5 flex justify-between gap-2 text-[10px] text-white/30">
                <span>{mode.persona}</span>
                <span className="shrink-0 font-mono">{latencyMs == null ? '--' : `${latencyMs}ms`}</span>
              </div>
            </div>

            {crossMatchData && crossMatchData.focus_areas.length > 0 && (
              <div className="shrink-0 border-t border-white/[0.06] pt-2.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">Fokus</p>
                <ul className="mt-1.5 space-y-1.5">
                  {crossMatchData.focus_areas.slice(0, 2).map((area) => (
                    <li key={area} className="text-[10px] leading-relaxed text-white/45">
                      <span className="text-white/25">· </span>
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex min-h-0 flex-1 flex-col border-t border-white/[0.06] pt-2.5">
              <p className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-white/30">Interviewer</p>
              <div
                className="relative mt-2 min-h-0 flex-1 overflow-hidden rounded-xl border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition-shadow duration-500"
                style={{
                  boxShadow: isAiSpeaking
                    ? `0 4px 24px rgba(0,0,0,0.35), 0 0 28px ${mode.glow}`
                    : '0 4px 24px rgba(0,0,0,0.35)',
                }}
              >
                <img
                  src={mode.avatar}
                  alt={mode.persona}
                  className="h-full w-full object-cover object-top"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#060608]/95 via-[#060608]/50 to-transparent px-3 pb-3 pt-10">
                  <p className="text-sm font-semibold leading-tight text-white">{mode.persona}</p>
                  <p className="mt-0.5 text-[10px] text-white/45">{mode.label}</p>
                </div>
                {isAiSpeaking && (
                  <div
                    className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset transition-opacity duration-300"
                    style={{ boxShadow: `inset 0 0 0 1px ${mode.glow}` }}
                  />
                )}
              </div>
            </div>
          </section>
        </aside>
      </main>
      </div>
    </div>
  );
}
