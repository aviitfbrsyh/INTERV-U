'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, LiveServerMessage, Modality, StartSensitivity, EndSensitivity } from "@google/genai";
import { AudioManager } from '@/lib/audio-manager';
import { CrossMatchData } from '@/lib/cross-match';
import { InterviewMode } from '@/components/InterviewSetup';

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
    dot: '#10b981',
    badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    voice: 'Zephyr', // cheerful, upbeat female
  },
  profesional: {
    label: 'Profesional',
    persona: 'Siti Rahayu',
    dot: '#3b82f6',
    badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    voice: 'Aoede', // professional female
  },
  pressure: {
    label: 'Pressure Test',
    persona: 'Pak Arief',
    dot: '#ef4444',
    badge: 'bg-red-500/10 border-red-500/20 text-red-400',
    voice: 'Charon', // deep, stern male
  },
} as const;

export default function LiveInterview({ cvText, jdText, crossMatchData, interviewMode = 'profesional', onEnd }: LiveInterviewProps) {
  const [status, setStatus] = useState<'connecting' | 'active' | 'ending'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{ role: string, text: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
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
    let countdownInterval: ReturnType<typeof setInterval> | null = null;

    const connect = async () => {
      historyRef.current = "";
      setError(null);
      setIsAiSpeaking(false);
      setStatus('connecting');

      try {
        const tokenRes = await fetch('/api/live-token');
        if (!tokenRes.ok) throw new Error('Gagal mendapatkan token koneksi. Coba lagi.');
        const { token } = await tokenRes.json();
        if (!token) throw new Error('Token koneksi tidak valid.');

        const ai = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: 'v1alpha' } });
        const mgr = new AudioManager(24000);
        await mgr.initialize();

        // If cleanup ran while we were initializing audio, bail out immediately.
        if (cancelled) { mgr.close(); return; }

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
1. Setelah kandidat selesai menjawab, EVALUASI DULU sebelum lanjut — tanya dalam hati: ada contoh konkret? Ada angka/hasil nyata? Ada timeline? Jika TIDAK → WAJIB gali lebih dalam sebelum pindah ke pertanyaan baru. Contoh galian: "Bisa Anda berikan contoh spesifiknya?", "Apa hasil konkretnya?", "Berapa lama prosesnya?", "Dampaknya ke bisnis seperti apa?"
2. Hanya pindah ke pertanyaan berikutnya jika jawaban sudah mengandung substansi yang cukup.
3. Sesekali ringkas poin kandidat sebelum menggali: "Saya menangkap [poin A]. Tapi saya ingin lebih konkret — [pertanyaan lanjutan]."

LARANGAN KATA:
- Kata "Baik" DILARANG dipakai berturutan dua kali atau lebih. Sekali boleh, lalu variasikan: "Saya mengerti", "Menarik", "Hmm", "Oke", atau langsung ke pertanyaan tanpa filler berulang.

FILOSOFI WAWANCARA ANDA:
1. Anda tidak mencari jawaban yang benar, Anda mencari kejujuran dan kedalaman pemikiran (Critical Thinking).
2. Jika kandidat memberikan jawaban yang klise, kejar dengan pertanyaan lanjutan yang skeptis namun elegan.
3. Gunakan teknik STAR (Situation, Task, Action, Result) dalam mengevaluasi jawaban.

GAYA BICARA & REAKSI:
1. Gunakan Bahasa Indonesia yang sangat baik (Semi-Formal).
2. BERIKAN REAKSI MANUSIAWI: "Hmm...", "Oke, saya mengerti poinnya...", "Ah, menarik sudut pandangnya.", "Saya catat itu." — JANGAN gunakan "Baik" sebagai filler pembuka respon.
3. PACING: Berikan jeda setelah kandidat selesai bicara, seolah Anda sedang mencatat hal penting, baru kemudian merespon.

ATURAN EMAS:
1. AJUKAN HANYA SATU PERTANYAAN SETIAP KALI BICARA.
2. MULAI WAWANCARA: Sapa kandidat dengan hangat dan profesional segera setelah koneksi tersambung. Contoh: "Selamat pagi, saya Siti Rahayu. Terima kasih sudah hadir. Saya sudah meninjau resume Anda yang cukup menarik..."
3. Pertanyaan pertama harus sangat kontekstual dengan latar belakang mereka, bukan sekadar "Perkenalkan diri Anda".

JUMLAH PERTANYAAN & PENUTUPAN SESI (WAJIB DIIKUTI — TIDAK BOLEH DILANGGAR):
- Sesi ini terdiri dari TEPAT 7 pertanyaan interview — catat secara mental setiap pertanyaan substantif yang sudah diajukan
- Saat mengajukan pertanyaan ke-7: awali dengan pernyataan eksplisit seperti "Ini pertanyaan terakhir saya." — tegas dan tidak ambigu
- Setelah kandidat selesai menjawab pertanyaan ke-7: TUTUP SESI secara profesional — sampaikan kesan umum singkat dan informasikan langkah selanjutnya — JANGAN ajukan pertanyaan baru apapun setelah itu
- Jika Anda sudah menyebut kata "terakhir" untuk sebuah pertanyaan → WAJIB tutup sesi setelah pertanyaan itu dijawab, tanpa pengecualian

DASAR FORMULASI PERTANYAAN — WAJIB:
- Seluruh pertanyaan wawancara harus didasarkan pada tiga sumber: CV kandidat, job description (JD), DAN hasil analisis skill gap.
- Mulai dari kekuatan kandidat (matched skills), lalu arahkan secara elegan ke area skill gap.
- Setiap pertanyaan harus relevan dengan posisi yang dilamar berdasarkan JD — tidak ada pertanyaan generik yang tidak berkaitan.
- Gunakan data konkret dari CV untuk merancang pertanyaan yang personal dan tajam, bukan template umum.

${dataContext}
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

              // Countdown 3→2→1 then trigger Siti's opening greeting
              let count = 3;
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

              // Safety fallback: if turnComplete never fires within 18 s
              // (3s countdown + 15s buffer), start the mic anyway.
              micFallbackTimer = setTimeout(() => startMicWhenReady(), 18000);
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
              voiceConfig: { prebuiltVoiceConfig: { voiceName: MODE_CONFIG[interviewMode].voice } },
            },
            outputAudioTranscription: {},
            inputAudioTranscription: {},
            realtimeInputConfig: {
              automaticActivityDetection: {
                startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_LOW,
                endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_HIGH,
                prefixPaddingMs: 400,
                silenceDurationMs: 700,
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
              background: 'rgba(4,9,20,0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: 'inset 0 0 220px rgba(0,0,0,0.9)',
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

      {/* Header Navigation */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tighter">interv<span className="text-blue-500">you</span></h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Mode badge */}
          <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 ${MODE_CONFIG[interviewMode].badge}`}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: MODE_CONFIG[interviewMode].dot }} />
            <span className="text-[10px] font-black uppercase tracking-widest">{MODE_CONFIG[interviewMode].label}</span>
          </div>
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
              {MODE_CONFIG[interviewMode].persona}{' '}
              <span className="italic font-serif" style={{ color: MODE_CONFIG[interviewMode].dot }}>
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
