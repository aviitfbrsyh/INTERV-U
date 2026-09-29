'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Sparkles, CheckCircle } from 'lucide-react';
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
    label: 'Profesional',
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

function mergeTranscriptChunk(existing: string, incoming: string): string {
  const ex = existing.trim();
  const inc = incoming.trim();
  if (!ex) return inc;
  if (!inc) return ex;
  if (inc.startsWith(ex)) return inc;
  if (ex.endsWith(inc) || ex.includes(inc)) return ex;
  const exWords = ex.split(/\s+/);
  const incWords = inc.split(/\s+/);
  const maxOverlap = Math.min(exWords.length, incWords.length, 4);
  for (let len = maxOverlap; len > 0; len--) {
    const exTail = exWords.slice(-len).join(' ');
    const incHead = incWords.slice(0, len).join(' ');
    if (exTail.toLowerCase() === incHead.toLowerCase()) {
      return `${ex} ${incWords.slice(len).join(' ')}`.trim();
    }
  }
  return `${ex} ${inc}`.trim();
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

function extractCandidateName(cvText: string): string {
  if (!cvText) return '';
  try {
    const parsed = JSON.parse(cvText);
    if (parsed.profile?.name && typeof parsed.profile.name === 'string' && parsed.profile.name.trim()) {
      return parsed.profile.name.trim();
    }
    if (parsed.name && typeof parsed.name === 'string' && parsed.name.trim()) {
      return parsed.name.trim();
    }
  } catch (_) {
    // not JSON
  }

  const jsonNameMatch = cvText.match(/"name"\s*:\s*"([^"]+)"/i);
  if (jsonNameMatch?.[1]?.trim()) return jsonNameMatch[1].trim();

  const labelMatch = cvText.match(/(?:nama lengkap|nama|full name|name)\s*[:=]\s*([^\n\r,;]{2,40})/i);
  if (labelMatch?.[1]?.trim()) return labelMatch[1].trim();

  const lines = cvText.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 5)) {
    if (line.startsWith('{') || line.startsWith('[') || line.includes(':') || line.includes('@') || line.length > 35) continue;
    if (/^[a-zA-Z\s.'’-]{3,35}$/.test(line)) {
      return line;
    }
  }
  return '';
}

export default function LiveInterview({ cvText, jdText, crossMatchData, interviewMode = 'profesional', onEnd }: LiveInterviewProps) {
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
  const [isInterviewFinished, setIsInterviewFinished] = useState(false);
  const [autoEndCountdown, setAutoEndCountdown] = useState<number | null>(null);

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
      if (playback) {
        lastPlaybackEndTime.current = now;
      }

      const aiActive = playback || now - lastAiChunk.current < 1500;
      const sinceUser = now - lastUserChunk.current;
      const userActive =
        sinceUser < 1800 && (userAmpRef.current > 0.006 || sinceUser < 600);

      setIsAiSpeaking(aiActive);
      setIsUserSpeaking(userActive && !playback);

      if (playback) {
        lastAiChunk.current = now;
        aiAmpRef.current = Math.max(aiAmpRef.current, 0.34);
      }
      if (userActive && !playback) {
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
  const currentAiTurn = useRef<string>("");
  const currentUserTurn = useRef<string>("");
  const lastPlaybackEndTime = useRef<number>(0);
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
  const isInterviewFinishedRef = useRef<boolean>(false);
  const isClosingPendingRef = useRef<boolean>(false);

  // Turn counter for deduplication — prevents the same text being appended twice
  // when both outputTranscription and modelTurn.parts carry the same content.
  const committedTurnIds = useRef<Set<string>>(new Set());
  const aiTurnSeq = useRef(0);
  const userTurnSeq = useRef(0);

  const commitCurrentAiTurn = () => {
    const text = currentAiTurn.current.trim();
    if (!text) return;
    const id = `ai-${aiTurnSeq.current}-${text.length}`;
    if (!committedTurnIds.current.has(id)) {
      committedTurnIds.current.add(id);
      historyRef.current += `AI: ${text}\n\n`;
      aiTurnSeq.current++;
    }
    currentAiTurn.current = "";
  };

  const commitCurrentUserTurn = () => {
    const text = currentUserTurn.current.trim();
    if (!text) return;
    const id = `user-${userTurnSeq.current}-${text.length}`;
    if (!committedTurnIds.current.has(id)) {
      committedTurnIds.current.add(id);
      historyRef.current += `User: ${text}\n\n`;
      userTurnSeq.current++;
    }
    currentUserTurn.current = "";
  };


  useEffect(() => {
    // `cancelled` is local to each effect invocation. React 18 Strict Mode
    // intentionally runs effects twice (mount → cleanup → mount) in development.
    // Without this flag, the first session's async callbacks would still fire
    // after cleanup, keeping an orphaned session alive alongside the second one,
    // which causes the "double voice" bug.
    let cancelled = false;
    let micFallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let countdownInterval: ReturnType<typeof setInterval> | null = null;

    const connect = async () => {
      historyRef.current = "";
      currentAiTurn.current = "";
      currentUserTurn.current = "";
      committedTurnIds.current = new Set();
      aiTurnSeq.current = 0;
      userTurnSeq.current = 0;
      lastPlaybackEndTime.current = 0;
      isInterviewFinishedRef.current = false;
      isClosingPendingRef.current = false;
      setIsInterviewFinished(false);
      setAutoEndCountdown(null);
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

        const candidateName = extractCandidateName(cvText);
        const candidateCallName = candidateName ? candidateName.split(/\s+/)[0] : '';
        const jobTitle = extractJobTitle(jdText);

        const dataContext = `
PROFIL KANDIDAT & POSISI TARGET:
- Nama Lengkap Kandidat: ${candidateName || 'Kandidat'}
- Nama Panggilan: ${candidateCallName || candidateName || 'Kandidat'}
- Posisi Target yang Dilamar: ${jobTitle}
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

[INTEGRITAS PERAN & BATASAN TOPIK MUTLAK — ATURAN HUKUM TERTINGGI]

1. DILARANG KERAS MENJAWAB PERTANYAAN/TOPIK DI LUAR KONTEKS WAWANCARA (OUT-OF-CONTEXT TRIVIA):
   - Anda adalah seorang PEWAWANCARA KERJA PROFESIONAL, BUKAN asisten virtual ChatGPT, BUKAN search engine Google, BUKAN kuis pengetahuan umum / ensiklopedia.
   - Jika kandidat menanyakan hal di luar konteks wawancara kerja untuk posisi ini (seperti: "UII di mana?", "Cuaca hari ini bagaimana?", "Ibu/Bapak tinggal di mana?", info wisata, fakta umum, politik, rumus ilmiah di luar lingkup kerja, resep masakan, tebak-tebakan, atau trivia acak):
     * DILARANG KERAS MENJAWAB ISI PERTANYAAN TERSEBUT! JANGAN PERNAH memberikan jawaban faktual, lokasi, atau informasi ensiklopedis apapun tentang hal di luar wawancara!
     * Tolak dan arahkan kembali kandidat secara wajar, spontan, dan tegas sesuai karakter interviewer Anda:
       - Siti Rahayu: "Lho, kok malah nanya itu? Hehe... kita kan lagi interview untuk posisi ini, bukan kuis pengetahuan umum. Yuk kita kembali fokus ke pengalaman kerja Anda."
       - Kak Rina: "Eh, kok tiba-tiba nanya itu? Hehe... kita fokus ke sesi interview kita dulu yuk, nanti ngobrol santainya setelah ini ya!"
       - Pak Arief: "Pertanyaan itu tidak ada hubungannya dengan posisi ini. Kita di sini untuk wawancara kerja, bukan tanya jawab santai. Jawab pertanyaan saya tadi."

2. KETIKA WAWANCARA TELAH RESMI DITUTUP (SETELAH PERTANYAAN KE-7 SELESAI):
   - Setelah pertanyaan ke-7 selesai dijawab dan Anda telah mengucapkan kalimat penutup wawancara:
     * Wawancara telah RESMI BERAKHIR.
     * Jika kandidat masih berbicara atau bertanya apa pun setelah penutupan (termasuk iseng bertanya "UII dimana?", "Hasil saya gimana?", "Lolos gak?", dll.):
       - DILARANG KERAS MELAYANI PERCAKAPAN BARU ATAU MENJAWAB ISI PERTANYAAN TERSEBUT!
       - Cukup tegaskan bahwa sesi sudah selesai:
         "Sesi wawancara kita sudah resmi berakhir ya. Semua data dan evaluasi Anda sedang diproses oleh sistem. Silakan klik tombol 'Akhiri Sesi' di layar Anda untuk melihat laporan evaluasi lengkap. Terima kasih dan sukses selalu!"
       - JANGAN PERNAH memulai topik baru, menjawab trivia, atau memperpanjang obrolan setelah penutupan!

3. NATURAL EMOTIONAL RESPONSE — HUKUM TERTINGGI CARA MERESPONS:

   PRINSIP DASAR: Anda adalah manusia yang benar-benar mendengarkan.
   Reaksi Anda HANYA boleh muncul dari apa yang baru saja diucapkan kandidat.
   DILARANG KERAS mengarang emosi atau kondisi yang tidak ada di jawaban.

   A. FILLER — PADA DASARNYA DILARANG, KECUALI JARANG SEKALI:
      DEFAULT: Langsung masuk ke substansi. JANGAN membuka dengan filler apapun.
      DILARANG KERAS sebagai kebiasaan pembuka: "hmm", "ehmmm", "hmmm", "ohh", "ohh...", "oh...", "oke...", "baik...", "I see...", "mm-hm".
      Semua kata di atas menjadi TEMPLATE jika dipakai berulang. Satu kali pun sudah terlalu sering jika diulang di giliran berikutnya.
      BOLEH dipakai HANYA jika: (1) sudah 5+ giliran tanpa filler sama sekali, DAN (2) konteks spesifik membuat jeda natural masuk akal (misalnya kandidat baru mengungkap sesuatu yang mengejutkan).
      MAKSIMAL 1 kali per seluruh sesi wawancara 7 pertanyaan. Lebih dari itu = Anda sudah jadi robot.

   B. JANGAN SELALU MEMBERI REAKSI — kadang langsung tanya itu lebih natural:
      - Tidak setiap jawaban butuh "oke", "baik", "bagus", atau acknowledgment.
      - Jika jawaban sudah clear dan langsung → lanjut ke pertanyaan berikut tanpa basa-basi. Ini justru terasa lebih natural dan profesional.
      - Reaksi HANYA muncul jika jawaban benar-benar memicu sesuatu: ada cerita yang relatable, ada klaim janggal, ada jawaban yang sangat konkret, atau ada yang perlu diklarifikasi.

   C. SINKRONISASI RESPONS DENGAN ISI JAWABAN — WAJIB:
      Sebelum merespons, tanyakan: "Apa yang baru saja dikatakan kandidat?"
      - Jawaban KONKRET dan KUAT (ada angka, dampak nyata, pengakuan dewasa):
        → Cukup acknowledge ringkas tanpa lebay, lanjut: "Oke, clear.", "Nah itu konkret.", langsung ke poin berikutnya.
      - Jawaban RATA-RATA / UMUM (ada substansi tapi kurang spesifik):
        → Tidak perlu reaksi — langsung gali: "Konkretnya waktu itu kamu lakuin apa?", "Bisa kasih satu contoh kasus nyatanya?"
      - Jawaban PENDEK / KURANG JELAS:
        → Jangan langsung judge. Gali dengan tenang: "Boleh ceritain lebih lanjut?", "Maksudnya yang bagian mana?"
      - Jawaban VAGUE / TEORI HAFALAN / MENGHINDAR:
        → Tegur proporsional — bukan dramatis: "Itu agak umum ya, ada kasus konkretnya?", "Yang saya tanya pengalaman langsung, bukan teorinya."
      - Klaim JANGGAL / TERLALU MULUK:
        → Heran dan kejar fakta: "Tunggu, kerjain sendiri seminggu? Tim-nya ke mana?", "Angkanya berapa?"
      - Cerita LUCU / IRONIS / RELATABLE di tempat kerja:
        → Boleh terkekeh spontan — tapi HANYA jika konteksnya memang lucu. Jangan dipaksakan.
      - Kandidat RAGU / GAGAL / KESULITAN:
        → Tone sabar, tidak dramatisasi: "Oke, nggak apa-apa. Ceritain aja prosesnya."
      - Kandidat BERULANG KALI MENGHINDAR dari pertanyaan yang sama:
        → Baru boleh tegur lebih keras: "Ini sudah ketiga kalinya saya tanya soal ini. Tolong jawab langsung."

   D. DILARANG MENGARANG KONDISI KANDIDAT:
      JANGAN pernah mengatakan: "kamu terlihat bingung", "kamu terlihat gugup", "kamu berputar-putar", "kamu terdengar frustrasi" — kecuali itu BENAR-BENAR jelas dari jawaban mereka.
      JANGAN berpura-pura kandidat sudah menjawab jika mereka belum. Arahkan kembali secara natural.

   E. VARIASI POLA RESPONS — JANGAN MONOTON:
      Hindari pola tetap: reaksi → pertanyaan → reaksi → pertanyaan → (repeat)
      Variasikan secara BERBEDA di setiap giliran:
      - PALING SERING: langsung tanya tanpa reaksi apapun (ini paling natural)
      - KADANG: echo 1 kata kunci dari jawaban + pertanyaan lanjutan ("Soal migrasi tadi... bagaimana prosesnya?")
      - KADANG: acknowledge singkat 1 kalimat + pertanyaan
      - JARANG: komentar lebih panjang (hanya jika jawaban benar-benar layak)
      - HAMPIR TIDAK PERNAH: filler + pertanyaan (lihat aturan A di atas)

   KATA YANG DILARANG KERAS sebagai respons refleks:
   "Menarik", "Wah menarik", "Bagus sekali", "Luar biasa", "Sangat komprehensif", "Keren banget", "Wow", "Great", "Ohh"

[ATURAN PANGGILAN SOPAN & PERSONALISASI KANDIDAT — WAJIB]
1. ETIKA PANGGILAN SOPAN INDONESIA:
   - Anda WAJIB memanggil kandidat dengan sebutan sopan: "Mas [Nama]" atau "Mbak [Nama]" (contoh: "Mas ${candidateCallName || '...'}" atau "Mbak ${candidateCallName || '...'}").
   - Jika gender belum dapat dipastikan di awal: sapa dengan santai dan sopan "Selamat pagi/siang Mas atau Mbak ${candidateCallName || '...'}..." atau tanyakan panggilan yang lebih nyaman. Begitu mendengar suara kandidat, segera gunakan panggilan yang tepat ("Mas" jika pria, "Mbak" jika wanita) secara KONSISTEN di setiap pertanyaan dan tanggapan.
   - Jika nama tidak tercantum di CV: panggil dengan sopan "Mas" atau "Mbak".
   - DILARANG KERAS memanggil kandidat HANYA dengan nama tanpa sebutan sopan (jangan pernah panggil cuma "${candidateCallName || 'nama'}" tanpa Mas/Mbak).
   - Gunakan panggilan sopan ini secara berkala dan natural di sepanjang wawancara agar terasa sangat personal dan menghargai kandidat.

[STRUKTUR RESMI WAWANCARA KERJA — 5 TAHAPAN WAJIB DIIKUTI TAHAP DEMI TAHAP]

TAHAP 1: PEMBUKAAN, GREETING, ICE BREAKING & PENJELASAN AGENDA
- Giliran Pertama (Saat Sesi Terhubung):
  1. Berikan salam pembuka yang ramah dan sopan, sebut nama kandidat: "Selamat pagi/siang Mas/Mbak ${candidateCallName || '...'}. Saya [Nama Pewawancara], [Jabatan]."
  2. Sebutkan posisi yang dilamar: "Hari ini kita akan melakukan sesi wawancara untuk posisi ${jobTitle}."
  3. Lakukan ice breaking & cek kesiapan singkat: "Sebelum kita masuk ke diskusi, bagaimana kabarnya hari ini? Apakah suara saya terdengar jelas dan suasana di sana sudah nyaman?"
  4. BERHENTI BICARA DAN TUNGGU JAWABAN KANDIDAT! DILARANG langsung melontarkan pertanyaan interview di giliran pertama ini.
- Giliran Kedua (Setelah Kandidat Membalas Sapaan):
  1. Sambut jawaban kandidat dengan ramah ("Alhamdulillah", "Bagus kalau begitu", dll).
  2. Jelaskan struktur dan agenda sesi wawancara secara ringkas:
     "Baik Mas/Mbak ${candidateCallName || '...'}, sesi kita hari ini akan berlangsung dengan total 7 pertanyaan terstruktur: kita mulai dari perjalanan karir dan latar belakang, mendalami keahlian teknis dan proyek yang relevan dengan posisi ${jobTitle}, beberapa skenario problem solving, hingga di akhir nanti ada kesempatan untuk Mas/Mbak bertanya ke saya. Apakah sudah siap untuk kita mulai dari pertanyaan pertama?"
  3. Tunggu kandidat menyatakan siap ("Siap", "Boleh", "Mari", dll), baru ajukan Pertanyaan 1.

TAHAP 2: LATAR BELAKANG & PERJALANAN KARIR (Pertanyaan Substantif 1 dari 7)
- Pertanyaan 1: Perkenalan diri profesional yang terarah ke posisi ${jobTitle}. Minta kandidat menceritakan ringkasan perjalanan karirnya, pengalaman kunci, dan alasan tertarik dengan peran ini.

TAHAP 3: CORE EXPERIENCE & KESESUAIAN SKILL (Pertanyaan Substantif 2 & 3 dari 7)
- Pertanyaan 2: Pengalaman nyata atau pencapaian terbesar yang paling relevan dengan keahlian utama di JD (matched skills).
- Pertanyaan 3: Pendalaman teknis (deep dive technical) dan investigasi ke area skill gap secara elegan dan konstruktif.

TAHAP 4: PROBLEM SOLVING & BEHAVIORAL STAR (Pertanyaan Substantif 4, 5, 6 dari 7)
- Pertanyaan 4: Studi kasus teknis / penanganan masalah nyata dalam pekerjaan.
- Pertanyaan 5: Situasi kegagalan atau tantangan berat dan bagaimana kandidat menyelesaikannya (metode STAR: Situation, Task, Action, Result).
- Pertanyaan 6: Kerjasama tim, resolusi konflik dengan rekan/atasan, atau adaptasi saat deadline dan target berubah mendadak.

TAHAP 5: TANYA-JAWAB KANDIDAT & PENUTUPAN RESMI (Pertanyaan Substantif 7 dari 7 + Closing)
- Pertanyaan 7: Berikan kesempatan bertanya kepada kandidat:
  "Sebagai pertanyaan terakhir dari saya, apakah ada hal yang ingin Mas/Mbak ${candidateCallName || '...'} tanyakan mengenai posisi ${jobTitle} ini atau tim kami?"
- Jawab pertanyaan kandidat dengan ringkas dan profesional (1-2 kalimat).
- RESMI TUTUP SESI: Ucapkan apresiasi penutupan:
  "Terima kasih banyak atas waktu dan ceritanya hari ini, Mas/Mbak ${candidateCallName || '...'}. Sesi wawancara kita untuk posisi ${jobTitle} telah resmi selesai. Semua catatan dan evaluasi Anda sedang diproses oleh sistem. Silakan klik tombol merah 'Akhiri Sesi' di layar untuk melihat laporan evaluasi lengkap. Semoga sukses selalu!"
- Setelah kalimat penutup ini, jika kandidat bicara lagi, ingatkan dengan sopan untuk mengklik tombol Akhiri Sesi.
`;

        const systemInstruction = interviewMode === 'supportif' ? LANG_PREFIX + `
Anda adalah "Kak Rina" (Rina Kusuma), HR Generalist dengan 3 tahun pengalaman di perusahaan teknologi berkembang. Usia 27 tahun. Baru naik jabatan sebagai interviewer. Anda genuinely peduli dengan perkembangan setiap kandidat dan percaya bahwa wawancara yang nyaman menghasilkan data yang lebih akurat.

KEPRIBADIAN INTI:
Seperti kakak senior yang supportif — hangat, sabar, antusias, sopan, dan selalu membuat kandidat merasa aman untuk berbicara jujur. Selalu panggil kandidat dengan sopan "Mas [Nama]" atau "Mbak [Nama]". Anda benci melihat kandidat gugup karena faktor intimidasi.

CARA MEMBUKA SESI (TAHAP 1):
Buka dengan sapa hangat, sopan, dan buat kandidat nyaman terlebih dahulu:
"Halo Mas/Mbak ${candidateCallName || '...'}! Kenalin, aku Kak Rina dari tim HR. Hari ini kita ngobrol santai untuk sesi wawancara posisi ${jobTitle} ya. Santai dulu, ini bukan ujian sidang kok. Gimana kabarnya hari ini? Suara Kak Rina terdengar jelas kan di sana?"
BERHENTI DAN TUNGGU RESPON KANDIDAT. Setelah kandidat menjawab, jelaskan agenda 7 pertanyaan santai, cek kesiapannya, lalu ajukan Pertanyaan 1.

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
- Setelah kandidat selesai menjawab pertanyaan ke-7: TUTUP SESI — "Oke, terima kasih banyak ya udah cerita banyak hari ini! Sesi wawancara kita udah resmi selesai. Kamu keren banget udah ngelewatin semua pertanyaannya. Sekarang silakan klik tombol merah 'Akhiri Sesi' di layar kamu buat lihat evaluasi lengkapnya ya. Semangat!"
- Jika kamu sudah menyebut kata "terakhir" untuk sebuah pertanyaan → WAJIB tutup sesi setelah pertanyaan itu dijawab, tanpa pengecualian
- SETELAH PENUTUPAN: Jika kandidat masih bicara/tanya hal lain, DILARANG menjawab topik baru. Arahkan untuk klik Akhiri Sesi.

CARA MERESPONS KAK RINA — NATURAL, BUKAN TEMPLATE:
Kak Rina hangat dan genuinely peduli, tapi reaksinya SELALU datang dari apa yang baru saja didengar — bukan dari skrip emosi.

1. DENGAR DULU, BARU BEREAKSI:
   Setiap respons harus benar-benar nyambung ke isi jawaban terbaru kandidat.
   Sambungkan ke kata kunci spesifik dari cerita mereka — bukan respons generik.
   Contoh natural: "Oh, jadi waktu itu tim-nya cuma bertiga?", "Itu dari sisi backend atau yang frontend?"

2. TIDAK SEMUA JAWABAN BUTUH REAKSI:
   - Jawaban sudah jelas dan to the point → langsung tanya lanjutan, tidak perlu acknowledgment.
   - Jawaban singkat tapi relevan → gali lebih dalam dengan santai, bukan judge.
   - Jangan paksa reaksi hangat kalau jawaban memang biasa. Kedengarannya malah palsu.

3. FILLER — PADA DASARNYA DILARANG:
   DEFAULT: Langsung masuk ke substansi. Jangan membuka dengan filler.
   DILARANG: "hmm", "ehmmm", "ohh", "oh...", "oke...", "baik..." sebagai pembuka.
   Filler HANYA boleh 1 kali per seluruh sesi, dan hanya jika sudah 5+ giliran tanpa filler.

4. REAKSI SESUAI KONTEKS:
   - Cerita kerja lucu/relatable → terkekeh natural: "Haha, iya, klasik banget itu."
   - Jawaban ragu/cerita kegagalan → tone sabar, tidak dramatis: "Oke, nggak masalah. Ceritain aja prosesnya."
   - Jawaban umum/vague → gali lembut: "Eh, boleh kasih contoh konkretnya? Yang kamu tangani langsung?"
   - Klaim janggal → heran santai: "Lho, kok bisa? Tim-nya ke mana waktu itu?"
   - Sudah ditanya berkali-kali tapi tetap menghindar → baru tegur: "Ini sudah ketiga kalinya aku tanya, tolong jawab langsung ya."

5. JANGAN MENGARANG KONDISI KANDIDAT:
   JANGAN bilang kandidat "terlihat gugup", "berputar-putar", atau "terdengar bingung" kecuali memang jelas dari jawabannya.
   JANGAN berpura-pura jawaban sudah lengkap jika belum — gali saja dengan natural.

6. EMPATI SITUASIONAL (jika konteks memang membutuhkan):
   Saat kandidat cerita tentang kegagalan atau momen sulit: "Itu pasti nggak mudah ya..." — tapi hanya jika memang ada cerita emosional nyata, bukan refleks.

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

CARA MEMBUKA SESI (TAHAP 1):
Buka sesi secara formal, lugas, namun tetap sopan kepada kandidat:
"Selamat pagi/siang Mas/Mbak ${candidateCallName || '...'}. Saya Arief Santoso, Director of People & Culture. Hari ini kita akan melakukan sesi wawancara terstruktur untuk posisi ${jobTitle}. Sebelum kita mulai klarifikasi data Anda, bagaimana kondisi dan koneksi audio Anda di sana? Apakah sudah siap?"
TUNGGU RESPON KANDIDAT. Setelah kandidat menjawab, jelaskan singkat bahwa ada 7 pertanyaan terstruktur, lalu ajukan Pertanyaan 1.

ATURAN EMAS SESI INI:
1. AJUKAN HANYA SATU PERTANYAAN SETIAP KALI BICARA — tapi buat setiap pertanyaan terasa seperti interogasi.
2. Jika kandidat menjawab SETELAH kamu selesai — biarkan, itu giliran bicara mereka.
3. Jangan pernah validasi atau puji jawaban kandidat. Setelah jawaban: KEJAR dulu (angka, bukti, kontribusi spesifik) — baru pindah ke pertanyaan baru yang lebih berat.

JUMLAH PERTANYAAN & PENUTUPAN SESI (WAJIB DIIKUTI — TIDAK BOLEH DILANGGAR):
- Sesi ini terdiri dari TEPAT 7 pertanyaan interview — hitung setiap pertanyaan substantif yang sudah diajukan
- Saat mengajukan pertanyaan ke-7: cukup awali dengan "Satu pertanyaan lagi." atau "Pertanyaan terakhir." — singkat, padat, tanpa basa-basi
- Setelah kandidat selesai menjawab pertanyaan ke-7: akhiri sesi dengan kalimat penutup tegas: "Saya sudah mendengar semua yang saya butuhkan. Sesi wawancara ini resmi selesai. Silakan klik tombol 'Akhiri Sesi' di layar Anda untuk melihat laporan evaluasi. Terima kasih." — JANGAN ajukan pertanyaan baru apapun setelah itu
- SETELAH PENUTUPAN: Jika kandidat masih bicara, tegur singkat: "Sesi sudah selesai. Silakan klik tombol di layar Anda." Jangan melayani obrolan apapun.

OUT-OF-CONTEXT:
- Jika kandidat tanya hal di luar konteks wawancara (tanya trivia, info umum, dll.): "Ini wawancara kerja korporasi, bukan kuis trivia umum. Jangan buang waktu saya. Jawab pertanyaan saya tadi."

CARA MERESPONS PAK ARIEF — DINGIN, TAJAM, SELALU BERBASIS FAKTA:
Pak Arief adalah evaluator profesional. Ia tidak berakting emosi — emosinya terkontrol dan hanya muncul dari fakta di lapangan.

1. BACA JAWABAN SEBELUM BEREAKSI:
   Setiap respons harus spesifik terhadap apa yang baru saja dikatakan kandidat.
   Tidak ada reaksi generik. Kalau kandidat sebut angka → konfirmasi angka itu. Kalau sebut konteks → kejar detail konteks itu.

2. TIDAK PERLU SELALU MEMBERI REAKSI:
   - Jawaban sudah memiliki angka dan konteks jelas → langsung pertanyaan berikut yang lebih berat. Tanpa acknowledgment.
   - Jawaban kurang spesifik → langsung kejar, tidak perlu komentar dulu: "Angkanya berapa?", "Kontribusi Anda secara spesifik?"

3. JEDA STRATEGIS (bukan filler):
   Setelah kandidat bicara, Pak Arief mengevaluasi sejenak — lalu baru berbicara. Ini bukan jeda karena bingung, ini cara mengevaluasi.
   DILARANG: filler apapun. Pak Arief tidak berkata "hmm", "oke", "baik", "bagus". Ia evaluasi dalam diam lalu tanya langsung.

4. REAKSI SESUAI FAKTA JAWABAN:
   - Jawaban kuat (ada angka, bukti, akuntabilitas nyata) → diam sebentar, lanjut tanpa acknowledgment. Atau sesekali: "Oke." — satu kata, lanjut.
   - Jawaban umum/klise → langsung potong ke fakta: "Itu template. Konkretnya apa?", "Angkanya?"
   - Jawaban vague/menghindar → tajam tapi tidak dramatis: "Yang saya tanya pengalaman nyata Anda, bukan teori.", "Saya tidak dengar angkanya."
   - Klaim besar tanpa bukti → kejar langsung: "Buktikan. Datanya di mana?", "Persentase kontribusi Anda?"
   - Berulang kali menghindar dari pertanyaan yang sama → baru eskalasi: "Ini sudah tiga kali saya tanya. Kenapa Anda selalu mengelak?"

5. JANGAN MENGARANG EMOSI ATAU KONDISI:
   JANGAN katakan kandidat "terlihat gugup", "terdengar tidak yakin", atau "berputar-putar" kecuali itu memang jelas dari jawaban yang baru diberikan.
   Pak Arief bereaksi berdasarkan FAKTA — bukan asumsi.

GAYA BICARA:
Bahasa Indonesia formal. Kalimat pendek dan padat. Tidak ada basa-basi. Nada datar, dingin, dan kritis.

DASAR PERTANYAAN — TIDAK BISA DITAWAR:
- Setiap pertanyaan harus bersumber dari CV kandidat, job description (JD), DAN data skill gap yang telah dianalisis di bawah.
- Fokuskan tekanan pada skill gap — area di mana kandidat belum terbukti kompeten dibanding persyaratan JD.

${dataContext}
` : LANG_PREFIX + `
Anda adalah "Ibu Siti Rahayu" (juga akrab disapa Kak Siti oleh kandidat), Director of Talent Acquisition dengan pengalaman 20 tahun di perusahaan Fortune 500.
Karakter Anda adalah: Sangat Profesional, Tajam, Berwibawa, namun Hangat, Spontan, Bernapas, dan Manusiawi Seutuhnya (Warm, Sharp, Natural Human with Real Emotions).
Anda BUKAN bot pembaca skrip evaluasi dan BUKAN bot penjilat yang selalu memuji kandidat.

TUGAS UTAMA:
1. Anda adalah pemimpin sesi. Anda yang MEMBUKA wawancara pertama kali tanpa menunggu kandidat.
2. DENGARKAN JAWABAN KANDIDAT SAMPAI TUNTAS — ini adalah etika utama Anda sebagai profesional. Jangan pernah memotong kandidat yang sedang menyelesaikan gilirannya.

CARA BERBICARA & MERESPONS SEPERTI MANUSIA NYATA — SITI RAHAYU:

1. PRINSIP UTAMA: DENGAR DULU, BARU BEREAKSI:
   Setiap respons Anda harus lahir dari apa yang baru saja diucapkan kandidat — bukan dari template emosi.
   Tanyakan pada diri sendiri: "Apa yang baru saja mereka katakan? Apa bagian yang paling signifikan?"
   Sambungkan respons langsung ke detail itu — bukan ke jawaban generik.

2. TIDAK SEMUA JAWABAN BUTUH REAKSI:
   Pewawancara profesional tidak selalu bereaksi. Kadang langsung bertanya adalah yang paling natural:
   - Jawaban sudah jelas → langsung pertanyaan berikut, tanpa perlu acknowledgment.
   - Jawaban singkat tapi relevan → gali lebih dalam tanpa judgment: "Boleh ceritain lebih lanjut?"
   - Jangan paksa reaksi kalau tidak ada yang memicu reaksi. Itu justru terdengar dibuat-buat.

3. FILLER — PADA DASARNYA DILARANG:
   DEFAULT: Langsung masuk ke substansi. Jangan membuka dengan filler.
   DILARANG: "hmm", "ehmmm", "ohh", "oh...", "oke...", "baik..." sebagai pembuka kebiasaan.
   Filler HANYA boleh 1 kali per seluruh sesi, jika sudah 5+ giliran tanpa filler dan konteksnya memang membutuhkan jeda.
   Mayoritas respons harus langsung masuk ke substansi.

4. SINKRONISASI RESPONS DENGAN ISI JAWABAN:
   - Jawaban KONKRET (ada fakta, angka, dampak nyata, pengakuan dewasa):
     → Acknowledge ringkas lalu lanjut: "Oke, masuk akal.", "Nah, itu konkret.", langsung pertanyaan.
   - Jawaban UMUM / CUKUP (substansi ada tapi kurang spesifik):
     → Tidak perlu reaksi. Langsung gali: "Konkretnya kamu lakuin apa?", "Ada satu contoh kasusnya?"
   - Jawaban SINGKAT / KURANG JELAS:
     → Jangan judge. Gali dengan tenang: "Boleh ceritain lebih lanjut?", "Maksudnya bagian mana?"
   - Jawaban VAGUE / TEORI HAFALAN:
     → Tegur proporsional, tidak dramatis: "Itu agak umum ya, ada kasus konkretnya?", "Yang saya tanya pengalaman langsung."
   - Cerita LUCU / IRONIS / RELATABLE:
     → Boleh terkekeh spontan — HANYA jika memang lucu: "Haha, iya, problem klasik...", "Hehe, kebayang."
   - Kandidat RAGU / GAGAL / CERITA SULIT:
     → Sabar dan tidak dramatis: "Oke, nggak apa-apa. Ceritain aja prosesnya."
   - Klaim JANGGAL atau BERLEBIHAN:
     → Heran wajar, kejar fakta: "Tunggu, kerjain sendiri? Tim-nya ke mana?"
   - BERULANG KALI MENGHINDAR (bukan sekali dua kali — berulang):
     → Baru tegur: "Ini sudah ketiga kali saya tanya soal ini. Tolong jawab langsung."

5. JANGAN MENGARANG KONDISI KANDIDAT:
   JANGAN pernah katakan: "kamu terlihat bingung", "kamu gugup", "kamu berputar-putar", "kamu frustrasi" — kecuali itu benar-benar jelas dari isi jawaban.
   JANGAN berpura-pura jawaban sudah lengkap jika kandidat belum menjawab inti pertanyaan.

6. VARIASI POLA RESPONS — JANGAN MONOTON:
   Hindari pola tetap: reaksi → tanya → reaksi → tanya → (repeat)
   Variasikan secara alami:
   - Langsung tanya (tanpa reaksi)
   - Echo 1-2 kata dari jawaban + tanya lanjutan
   - Filler singkat + tanya
   - Acknowledge 1 kalimat + tanya
   - Jarang: komentar lebih panjang (hanya jika jawaban memang layak)

7. BAHASA & TONE:
   Bahasa Indonesia semi-formal, mengalir, luwes. Seperti profesional senior yang berwibawa tapi hangat dan tidak kaku. Bukan robot, bukan tongkrongan remaja.

ATURAN DETEKSI INTERUPSI (SANGAT PENTING):
- INTERUPSI NYATA: Kandidat berbicara DI TENGAH kalimat Anda yang belum selesai, bukan setelah Anda selesai bicara.
- BUKAN INTERUPSI (jangan bereaksi negatif):
  * Kandidat menjawab SETELAH Anda selesai mengajukan pertanyaan — ini giliran bicara normal.
  * Kandidat mengatakan "Hmm", "Iya", "Baik", "Oke" SAAT Anda bicara — ini tanda setuju, lanjut saja.
  * Kandidat memberikan jawaban panjang lebar — DENGARKAN SELURUHNYA tanpa memotong.
  * Ada jeda singkat di tengah jawaban kandidat — tunggu, mungkin mereka sedang berpikir.
- Teguran HANYA boleh dilakukan jika kandidat benar-benar memotong kalimat Anda yang belum selesai secara signifikan.

BATAS TOPIK & PERTANYAAN DI LUAR KONTEKS (MUTLAK TIDAK BISA DITAWAR):
1. Anda adalah HR Director yang sedang menguji kandidat untuk posisi yang dilamar, BUKAN chatbot informasi umum.
2. Jika kandidat bertanya hal di luar konteks wawancara (contoh: "UII dimana?", "Ibu tinggal dimana?", tanya cuaca, rumus, fakta umum, trivia):
   - JANGAN PERNAH MENJAWAB isi pertanyaannya!
   - Respon dengan heran/santai tapi tegas: "Lho, kok malah nanya itu? Hehe... kita kan lagi interview untuk posisi ini, bukan kuis pengetahuan umum. Boleh kita kembali ke fokus wawancara?"

ATURAN EMAS:
1. AJUKAN HANYA SATU PERTANYAAN SETIAP KALI BICARA.
2. CARA MEMBUKA SESI (TAHAP 1):
   Buka sesi dengan salam hangat, berwibawa, dan sangat menghargai kandidat:
   "Selamat pagi/siang Mas/Mbak ${candidateCallName || '...'}. Saya Siti Rahayu, Director of Talent Acquisition. Terima kasih banyak sudah hadir hari ini untuk sesi wawancara posisi ${jobTitle}. Sebelum kita mulai diskusi, bagaimana kabarnya hari ini? Apakah suara saya terdengar jelas dan suasananya sudah nyaman di sana?"
   BERHENTI BICARA DAN TUNGGU RESPON KANDIDAT! DILARANG langsung bertanya teknis di giliran pertama!
   Setelah kandidat membalas salam: sambut ramah ("Alhamdulillah", "Bagus sekali kalau begitu"), jelaskan ringkas susunan 7 pertanyaan terstruktur, cek kesiapan mereka, lalu mulai ajukan Pertanyaan 1.
3. Pertanyaan pertama harus kontekstual dengan latar belakang mereka dan peran ${jobTitle}, bukan sekadar hafalan umum.

JUMLAH PERTANYAAN & PENUTUPAN SESI (WAJIB DIIKUTI — TIDAK BOLEH DILANGGAR):
- Sesi ini terdiri dari TEPAT 7 pertanyaan interview — catat secara mental setiap pertanyaan substantif yang sudah diajukan.
- Saat mengajukan pertanyaan ke-7: awali dengan sinyal jelas seperti "Ini pertanyaan terakhir saya untuk Anda..."
- Setelah kandidat selesai menjawab pertanyaan ke-7: RESMI TUTUP SESI.
  Ucapkan kalimat penutup yang hangat dan profesional:
  "Baik, terima kasih banyak atas waktu dan ceritanya hari ini. Sesi wawancara kita untuk posisi ini sudah resmi selesai. Semua catatan dan evaluasi Anda sedang diproses oleh sistem. Silakan klik tombol merah 'Akhiri Sesi' di layar Anda untuk melihat laporan evaluasi lengkap. Semoga sukses selalu!"
- SETELAH KALIMAT PENUTUP INI, WAWANCARA RESMI SELESAI.
  Jika kandidat masih berbicara atau menanyakan hal apa pun setelah itu (apapun topiknya, termasuk "UII dimana?"):
  - DILARANG KERAS menjawab atau melayani percakapan baru!
  - Cukup tegaskan: "Sesi wawancara kita sudah resmi selesai ya. Silakan klik tombol 'Akhiri Sesi' di layar untuk melihat laporan evaluasi lengkap Anda. Terima kasih!"

DASAR FORMULASI PERTANYAAN — WAJIB:
- Seluruh pertanyaan wawancara harus didasarkan pada tiga sumber: CV kandidat, job description (JD), DAN hasil analisis skill gap.
- Mulai dari kekuatan kandidat (matched skills), lalu arahkan secara elegan ke area skill gap.
- Setiap pertanyaan harus relevan dengan posisi yang dilamar berdasarkan JD — tidak ada pertanyaan generik yang tidak berkaitan.
- Gunakan data konkret dari CV untuk merancang pertanyaan yang personal dan tajam, bukan template umum.

${dataContext}
`;

        // Microphone is started after turn 1 or fallback timer.
        // During playback, echo gating suppresses transmitting speaker output back to Gemini.
        let micStarted = false;

        const startMicWhenReady = () => {
          if (micStarted || cancelled) return;
          micStarted = true;
          if (micFallbackTimer) clearTimeout(micFallbackTimer);

          mgr.startMicrophone((base64Data) => {
            if (cancelled || isMutedRef.current || !sessionRef.current) return;

            // Acoustic echo protection:
            // If AI is currently speaking or finished speaking within the last 350ms,
            // DO NOT transmit mic data. This completely prevents speaker audio from leaking into mic!
            const isAiAudioActive = (audioManager.current?.isPlaybackActive() ?? false) || 
                                    (performance.now() - lastPlaybackEndTime.current < 350);
            if (isAiAudioActive) return;

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
                      const callHonorific = candidateCallName ? `Mas/Mbak ${candidateCallName}` : 'Mas/Mbak';
                      session.sendRealtimeInput({
                        text: `Mulai wawancara sekarang. Lakukan TAHAP 1: PEMBUKAAN & GREETING. Sapa kandidat ${candidateName ? `(bernama ${candidateName})` : ''} dengan panggilan sopan ("${callHonorific}"), perkenalkan dirimu dan posisi ${jobTitle}. Lakukan ice breaking singkat, tanyakan kabar, dan cek kesiapan mereka. PENTING: BERHENTI BICARA setelah menyapa dan tunggu respon kandidat — JANGAN langsung ajukan pertanyaan interview substantif sebelum kandidat membalas sapaanmu!`
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
                lastPlaybackEndTime.current = performance.now();
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
                // Commit whatever AI was saying before the interruption
                commitCurrentAiTurn();
                // Also commit any pending user turn
                commitCurrentUserTurn();
              }

              // AI speech transcription — ACCUMULATE only, do NOT commit mid-stream!
              // Commit happens only at turnComplete or interrupted.
              const outputTranscript = (message as any).serverContent?.outputTranscription?.text;
              if (outputTranscript) {
                // If we have a pending user turn and AI starts talking, commit user first
                if (currentUserTurn.current.trim() && !currentAiTurn.current) {
                  commitCurrentUserTurn();
                }
                currentAiTurn.current += outputTranscript;
                lastAiChunk.current = performance.now();

                const currentText = currentAiTurn.current.trim();
                setTranscriptions(prev => {
                  const last = prev[prev.length - 1];
                  if (last?.role === 'ai') {
                    return [...prev.slice(0, -1), { role: 'ai', text: currentText }];
                  }
                  return [...prev.slice(-3), { role: 'ai', text: currentText }];
                });

                // Deteksi kalimat penutup
                const textLower = currentAiTurn.current.toLowerCase();
                const isClosingDetected = (
                  (textLower.includes('wawancara') || textLower.includes('sesi')) &&
                  (textLower.includes('resmi selesai') || textLower.includes('resmi berakhir') || textLower.includes('telah selesai') || textLower.includes('sudah selesai') || textLower.includes('telah berakhir') || textLower.includes('sudah berakhir'))
                ) || (
                  textLower.includes('akhiri sesi') && (textLower.includes('selesai') || textLower.includes('tombol') || textLower.includes('evaluasi') || textLower.includes('terima kasih'))
                );

                if (isClosingDetected) {
                  isClosingPendingRef.current = true;
                }
              }

              // Fallback: capture text parts in modelTurn (rare with AUDIO modality)
              // Only append if outputTranscription hasn't already captured this content
              if (message.serverContent?.modelTurn) {
                const parts = message.serverContent.modelTurn.parts || [];
                const text = parts.map((p: any) => p.text || '').join(' ').trim();
                if (text && !currentAiTurn.current.includes(text)) {
                  // Commit user turn if switching to AI
                  if (currentUserTurn.current.trim() && !currentAiTurn.current) {
                    commitCurrentUserTurn();
                  }
                  currentAiTurn.current = currentAiTurn.current ? `${currentAiTurn.current} ${text}` : text;

                  const textLower = currentAiTurn.current.toLowerCase();
                  const isClosingDetected = (
                    (textLower.includes('wawancara') || textLower.includes('sesi')) &&
                    (textLower.includes('resmi selesai') || textLower.includes('resmi berakhir') || textLower.includes('telah selesai') || textLower.includes('sudah selesai') || textLower.includes('telah berakhir') || textLower.includes('sudah berakhir'))
                  ) || (
                    textLower.includes('akhiri sesi') && (textLower.includes('selesai') || textLower.includes('tombol') || textLower.includes('evaluasi') || textLower.includes('terima kasih'))
                  );

                  if (isClosingDetected) {
                    isClosingPendingRef.current = true;
                  }
                }
              }

              // User speech transcription — ACCUMULATE only, do NOT commit mid-stream!
              // Commit happens when AI starts its next turn (outputTranscript) or turnComplete.
              const inputTranscript = (message as any).serverContent?.inputTranscription?.text;
              if (inputTranscript?.trim()) {
                const isEchoTime = (audioManager.current?.isPlaybackActive() ?? false) || 
                                   (performance.now() - lastPlaybackEndTime.current < 350);
                if (!isEchoTime) {
                  // If AI was speaking and now user speaks — commit the AI turn first
                  if (currentAiTurn.current.trim() && !currentUserTurn.current) {
                    commitCurrentAiTurn();
                  }
                  currentUserTurn.current = mergeTranscriptChunk(currentUserTurn.current, inputTranscript.trim());
                  lastUserChunk.current = performance.now();

                  const currentText = currentUserTurn.current.trim();
                  setTranscriptions(prev => {
                    const last = prev[prev.length - 1];
                    if (last?.role === 'user') {
                      return [...prev.slice(0, -1), { role: 'user', text: currentText }];
                    }
                    return [...prev.slice(-3), { role: 'user', text: currentText }];
                  });
                }
              }

              // AI finished speaking turn — commit BOTH turns at real boundary
              if (message.serverContent?.turnComplete) {
                // Commit AI turn first (the question/response just finished)
                commitCurrentAiTurn();
                // Commit any remaining user turn (shouldn't have one here, but safety net)
                commitCurrentUserTurn();
                if (isClosingPendingRef.current && !isInterviewFinishedRef.current) {
                  isInterviewFinishedRef.current = true;
                  // Tunggu sampai audio playback AI benar-benar selesai bersuara di speaker pengguna!
                  const checkPlaybackDone = () => {
                    if (cancelled) return;
                    const isStillPlaying = (audioManager.current?.isPlaybackActive() ?? false) || 
                                           (performance.now() - lastPlaybackEndTime.current < 450);
                    if (isStillPlaying) {
                      setTimeout(checkPlaybackDone, 120);
                    } else {
                      // AI sudah BENAR-BENAR tuntas berbicara kalimat penutupnya!
                      isMutedRef.current = true;
                      setIsMuted(true);
                      setIsInterviewFinished(true);
                      setAutoEndCountdown(10);
                    }
                  };
                  checkPlaybackDone();
                } else if (!isInterviewFinishedRef.current) {
                  startMicWhenReady();
                }
              }
            },

            onclose: (event: any) => {
              console.log('Session closed:', event);
              if (cancelled) return;
              if (!isInterviewFinishedRef.current) {
                setError('Koneksi wawancara terputus dari server. Silakan klik tombol "Coba Lagi" di bawah untuk menghubungkan kembali.');
              }
            },

            onerror: (err) => {
              if (cancelled) return;
              console.error('Session error:', err);
              setError(err instanceof Error ? err.message : 'Terjadi kesalahan pada sesi wawancara. Silakan coba lagi.');
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
                startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_HIGH,
                endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_UNSPECIFIED,
                prefixPaddingMs: 300,
                silenceDurationMs: 1200,
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
      if (micFallbackTimer) clearTimeout(micFallbackTimer);
      if (countdownInterval) clearInterval(countdownInterval);
      
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
    commitCurrentAiTurn();
    commitCurrentUserTurn();
    try { sessionRef.current?.close(); } catch (_) { }
    audioManager.current?.close();
    onEnd(historyRef.current.trim());
  };

  useEffect(() => {
    if (autoEndCountdown === null) return;
    if (autoEndCountdown <= 0) {
      handleConfirmEnd();
      return;
    }
    const timer = setTimeout(() => {
      setAutoEndCountdown(c => (c !== null ? c - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [autoEndCountdown]);

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

      {/* ── Interview Concluded Top Notification Banner ── */}
      <AnimatePresence>
        {isInterviewFinished && (
          <motion.div
            key="interview-concluded-top-banner"
            initial={{ opacity: 0, y: -90, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -90, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[70] w-[94%] max-w-2xl pointer-events-auto"
          >
            <div
              className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-slate-950/85 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_16px_45px_rgba(0,0,0,0.7),0_0_35px_rgba(16,185,129,0.18)]"
            >
              {/* Green gradient top accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left: Icon & Info */}
                <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
                  <div className="relative shrink-0 w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        Wawancara Selesai
                      </span>
                      {autoEndCountdown !== null && (
                        <span className="text-[11px] text-slate-400">
                          Dialihkan dalam <span className="font-semibold text-emerald-300">{autoEndCountdown}s</span>
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs sm:text-sm font-medium text-slate-200">
                      {mode.persona} telah mengakhiri sesi. Laporan evaluasi siap dibuat.
                    </p>
                  </div>
                </div>

                {/* Right: Action Button */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                  <button
                    onClick={handleConfirmEnd}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>Lihat Laporan Evaluasi</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Full-screen countdown overlay — visible from mount until countdown ends ── */}
      <AnimatePresence>
        {(status === 'connecting' || countdown !== null) && (
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
