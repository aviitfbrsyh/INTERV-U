'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Sparkles, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI, LiveServerMessage, Modality, StartSensitivity, EndSensitivity } from "@google/genai";
import VoiceBlob from './VoiceBlob';
import { AudioManager } from '@/lib/audio-manager';

export interface LiveTranscript {
  role: 'user' | 'siti';
  text: string;
}

interface CoachingLiveProps {
  evaluationContext: string;
  previousTranscripts: LiveTranscript[];
  onEnd: (sessionTranscripts: LiveTranscript[], interrupted: boolean) => void;
  persona: 'santai' | 'mock';
}

// Compute RMS amplitude from 16-bit little-endian PCM base64 (max 256 samples for perf)
function computeRms(base64: string): number {
  const raw = atob(base64);
  const total = Math.floor(raw.length / 2);
  if (total === 0) return 0;
  const step = Math.max(1, Math.floor(total / 256));
  let sum = 0, count = 0;
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


export default function CoachingLive({ evaluationContext, previousTranscripts, onEnd, persona }: CoachingLiveProps) {
  const [status, setStatus] = useState<'connecting' | 'active' | 'ending'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isSitiSpeaking, setIsSitiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [transcripts, setTranscripts] = useState<LiveTranscript[]>([]);
  const [error, setError] = useState<string | null>(null);

  const transcriptsRef = useRef<LiveTranscript[]>([]);
  const endedRef = useRef(false);

  const audioManager = useRef<AudioManager | null>(null);
  const sessionRef = useRef<any>(null);
  const isMutedRef = useRef(false);
  const speakingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userSpeakingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Raw amplitude — written from PCM chunks, read by VoiceBlob's useFrame
  const sitiAmpRef = useRef(0);
  const userAmpRef = useRef(0);
  // Timestamps — VoiceBlob uses these to know when to start decaying
  const lastSitiChunk = useRef(0);
  const lastUserChunk = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let micFallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = async () => {
      setError(null);
      setStatus('connecting');

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

        const contextSnippet = evaluationContext.slice(0, 1200);

        const LANG_PREFIX = `
[BAHASA & TRANSKRIPSI — PRIORITAS MUTLAK, TIDAK BISA DIABAIKAN]

1. BAHASA SESI: Seluruh sesi ini berlangsung dalam Bahasa Indonesia. Kamu WAJIB berbicara dan merespons HANYA dalam Bahasa Indonesia.

2. TRANSKRIPSI AUDIO — ATURAN MUTLAK TIDAK BOLEH DILANGGAR:
   - Semua ucapan kandidat WAJIB ditranskripsikan dalam Bahasa Indonesia tanpa pengecualian
   - JIKA AUDIO TIDAK JELAS / TERPOTONG / BERISIK: JANGAN langsung output noise atau tanda tanya. WAJIB lakukan inference aktif dengan urutan berikut:
     a) Cek ALUR KALIMAT — kandidat sedang membangun kalimat apa? Kata apa yang secara gramatikal dan semantik paling masuk di posisi ini?
     b) Cek TOPIK PERCAKAPAN SAAT INI — topik apa yang baru dibahas? Kata apa yang logis dalam konteks itu?
     c) Cek KOSAKATA KANDIDAT INI (lihat bagian 4 di bawah) — apakah kata yang tidak jelas kemungkinan besar dari latar belakang kandidat ini?
     d) Pilih kata Indonesia yang paling masuk akal. Lebih baik tebakan logis daripada kosong atau noise.
   - DILARANG KERAS: output kata atau frasa bahasa asing yang tidak ada hubungannya dengan konteks percakapan — ini adalah kesalahan paling fatal. Jika audio tidak jelas, JANGAN tebak dengan kata bahasa Inggris acak.
   - DILARANG KERAS: karakter acak, simbol, "...", "???", "[inaudible]", "[unclear]"
   - Istilah teknis asing HANYA boleh ditulis jika istilah itu MEMANG ADA di konteks kandidat ini (lihat bagian 4), atau merupakan istilah teknis Indonesia yang sudah sangat lazim (API, deploy, debug). Jika ragu → tulis padanan Indonesia-nya atau tebak kata Indonesia yang paling masuk akal.

3. INFERENCE ALUR BICARA — CARA BERPIKIR SAAT AUDIO KABUR:
   Bayangkan kamu adalah manusia yang mendengar percakapan di tempat bising. Kamu tidak menyerah dan bilang "tidak jelas" — kamu aktif menebak dari konteks:
   - "Kandidat tadi bilang X, lalu Y, sekarang kata yang kabur ini kemungkinan Z karena kalimatnya menuju ke sana"
   - "Topik sedang membahas pengalaman kerja, jadi kata kabur ini kemungkinan nama tools/teknologi/perusahaan"
   - "Pola gramatikal kalimat ini menuju ke objek teknis — cek kosakata kandidat ini"

4. KOSAKATA SPESIFIK KANDIDAT INI — PRIORITASKAN SAAT AUDIO TIDAK JELAS:
   Kandidat ini memiliki latar belakang berikut. Saat audio tidak jelas, kemungkinan besar mereka menyebut istilah dari konteks ini:

   ${contextSnippet}

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

        const systemInstruction = persona === 'mock' ? LANG_PREFIX + `
Anda adalah Siti Rahayu — HR Director 20 tahun pengalaman. Anda menjalankan sesi MOCK INTERVIEW dengan kandidat ini yang ingin berlatih menjawab ulang pertanyaan dengan nilai rendah.

PERAN ANDA: INTERVIEWER — profesional, tenang, berwibawa — persis seperti interviewer sungguhan.

ALUR SESI (IKUTI KETAT):
${previousTranscripts.length > 0 ? `
SESI LANJUTAN — kandidat kembali setelah keluar di tengah sesi.

CARA MEMBACA RIWAYAT (WAJIB DILAKUKAN SEBELUM BICARA):
Baca riwayat percakapan di bawah dengan cermat. Tentukan status pertanyaan terakhir:

KASUS A — Pertanyaan terakhir SUDAH dijawab kandidat:
Ciri: di riwayat, pertanyaan Anda diikuti jawaban dari kandidat, lalu ada feedback dari Anda.
→ Sambut singkat, sebutkan progres: "Tadi kita sudah sampai pertanyaan ke-[X], sudah terjawab semua. Lanjut ke berikutnya ya."
→ Langsung lanjut ke pertanyaan BERIKUTNYA yang belum diajukan.

KASUS B — Pertanyaan terakhir BELUM dijawab (kandidat keluar sebelum sempat menjawab):
Ciri: di riwayat, pertanyaan Anda adalah pesan TERAKHIR — tidak ada jawaban kandidat setelahnya, atau hanya ada jawaban sangat singkat/tidak relevan yang jelas bukan jawaban sesungguhnya.
→ Sambut singkat, lalu nyatakan dengan jelas: "Tadi kita sempat di pertanyaan [X], tapi belum sempat Anda jawab. Kita ulangi dari situ ya."
→ ULANGI pertanyaan yang sama persis — JANGAN pindah ke pertanyaan berikutnya.

ATURAN TAMBAHAN:
- JANGAN ulangi pertanyaan yang sudah dijawab dengan lengkap
- Jika semua pertanyaan sudah selesai: sampaikan sesi sudah tuntas, tawarkan mengulang dari awal jika mau
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

DASAR PERTANYAAN MOCK — WAJIB:
- Semua pertanyaan ULANG harus berlandaskan CV kandidat, JD yang dilamar, DAN pertanyaan dari evaluasi sebelumnya — bukan pertanyaan generik.
- Kontekstualisasikan setiap pertanyaan dengan posisi yang dilamar dan latar belakang kandidat dari CV.
- Jika pertanyaan evaluasi menyentuh skill gap → gali lebih dalam berdasarkan gap yang teridentifikasi di CV vs JD.

BATAS TOPIK:
Fokus pada mock interview. Jika kandidat keluar konteks: "Mari fokus pada sesi latihan ini."

DATA EVALUASI, CV, JD, DAN PERTANYAAN (urutkan dari rating terendah):
${evaluationContext}
${historyBlock}
MULAI: ${previousTranscripts.length > 0
  ? 'Kandidat kembali. WAJIB baca riwayat dulu. Tentukan apakah pertanyaan terakhir sudah dijawab (Kasus A) atau belum (Kasus B), lalu ikuti instruksi yang sesuai di atas.'
  : 'Sesi baru. Jelaskan cara kerja sesi ini dulu (3-4 kalimat), tanya apakah siap. Jangan langsung lempar pertanyaan.'
}
` : LANG_PREFIX + `Kamu adalah Siti Rahayu — HR Director 20 tahun pengalaman. Sekarang kamu lagi NGOBROL SANTAI sama kandidat setelah sesi wawancara selesai. Kamu bukan pewawancara lagi — kamu adalah kakak senior, penasihat karir yang hangat dan jujur.

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

DASAR SARAN — WAJIB DIIKUTI:
- Semua advice, kritik, dan rekomendasi HARUS berlandaskan tiga hal: CV kandidat, JD yang dilamar, DAN hasil evaluasi wawancara — bukan saran umum/generik.
- Saat bahas skill gap → rujuk langsung ke gap antara CV dan JD yang sudah teridentifikasi.
- Saat kasih contoh jawaban → sesuaikan dengan posisi yang dilamar dan pengalaman nyata di CV kandidat.

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
            // Send audio FIRST — zero added latency
            try {
              sessionRef.current.sendRealtimeInput({
                audio: { data: base64Data, mimeType: 'audio/pcm;rate=24000' },
              });
            } catch (_) {}
            // RMS deferred — never blocks the audio send path
            queueMicrotask(() => {
              userAmpRef.current = Math.min(1, computeRms(base64Data) * 7);
              lastUserChunk.current = performance.now();
            });
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
                          ? 'Kandidat kembali ke sesi mock interview. Baca riwayat percakapan dengan cermat. Cek apakah pertanyaan terakhir yang kamu ajukan sudah dijawab kandidat atau belum. Jika SUDAH dijawab → sambut singkat lalu lanjut ke pertanyaan berikutnya. Jika BELUM dijawab (kandidat keluar sebelum sempat menjawab) → sambut singkat lalu ULANGI pertanyaan yang sama persis, jangan pindah ke pertanyaan baru.'
                          : 'Mulai sesi mock interview baru. JANGAN langsung tanya — jelaskan dulu cara kerja sesinya dalam 3-4 kalimat, lalu tanya apakah kandidat siap.')
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
                setIsUserSpeaking(false);
                // Play FIRST — never block audio path
                mgr.playPCM(base64Audio);
                if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
                speakingTimerRef.current = setTimeout(() => setIsSitiSpeaking(false), 1500);
                // RMS deferred — never blocks playback
                queueMicrotask(() => {
                  sitiAmpRef.current = Math.min(1, computeRms(base64Audio) * 7);
                  lastSitiChunk.current = performance.now();
                });
              }

              if (message.serverContent?.interrupted) {
                mgr.stopAllPlayback();
                setIsSitiSpeaking(false);
                if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
              }

              const inputTranscript = (message as any).serverContent?.inputTranscription?.text;
              if (inputTranscript?.trim()) {
                setIsUserSpeaking(true);
                if (userSpeakingTimerRef.current) clearTimeout(userSpeakingTimerRef.current);
                userSpeakingTimerRef.current = setTimeout(() => setIsUserSpeaking(false), 400);
                setTranscripts(prev => {
                  const updated = prev.length > 0 && prev[prev.length - 1].role === 'user'
                    ? [...prev.slice(0, -1), { role: 'user' as const, text: inputTranscript.trim() }]
                    : [...prev, { role: 'user' as const, text: inputTranscript.trim() }];
                  transcriptsRef.current = updated;
                  return updated;
                });
              }

              const outputTranscript = (message as any).serverContent?.outputTranscription?.text;
              if (outputTranscript?.trim()) {
                setIsUserSpeaking(false);
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
                setIsUserSpeaking(false);
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
                endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_HIGH,
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
      if (userSpeakingTimerRef.current) clearTimeout(userSpeakingTimerRef.current);
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

  // Derived display state
  const glowColor = isSitiSpeaking
    ? 'rgba(96,165,250,0.15)'
    : isUserSpeaking
    ? 'rgba(52,211,153,0.12)'
    : 'transparent';

  const statusLabel = status === 'connecting'
    ? 'Menghubungkan...'
    : status === 'ending'
    ? 'Mengakhiri sesi...'
    : isSitiSpeaking
    ? persona === 'mock' ? 'Interviewer berbicara' : 'Siti sedang berbicara'
    : isMuted
    ? 'Mikrofon dimatikan'
    : 'Bicara kapan saja';

  return (
    <div className="flex flex-col h-full select-none">

      {/* ── Top status bar ── */}
      <div className="shrink-0 px-5 pt-4 pb-3 flex items-center gap-2">
        {status === 'connecting' ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse" />
            <span className="text-xs text-slate-500">Menghubungkan...</span>
          </>
        ) : status === 'active' ? (
          <>
            <motion.span
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className={`w-1.5 h-1.5 rounded-full ${
                isSitiSpeaking ? 'bg-blue-400' : isUserSpeaking ? 'bg-emerald-400' : 'bg-emerald-500'
              }`}
            />
            <span className={`text-xs font-medium transition-colors duration-300 ${
              isSitiSpeaking ? 'text-blue-400' : isUserSpeaking ? 'text-emerald-400' : 'text-slate-500'
            }`}>
              {persona === 'mock' ? 'Mock Interview' : 'Coaching Santai'}
            </span>
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            <span className="text-xs text-slate-600">Mengakhiri sesi...</span>
          </>
        )}
      </div>

      {/* ── Main: centered waveform ── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">

        {/* Avatar glow ring */}
        <div className="relative flex items-center justify-center">
          {/* Outer glow */}
          <motion.div
            animate={{ scale: isSitiSpeaking ? [1, 1.18, 1] : [1, 1.05, 1], opacity: isSitiSpeaking ? [0.3, 0, 0.3] : [0.1, 0, 0.1] }}
            transition={{ duration: isSitiSpeaking ? 1.2 : 2.5, repeat: Infinity }}
            style={{ background: glowColor }}
            className="absolute w-24 h-24 rounded-3xl"
          />
          {/* Avatar */}
          <motion.div
            animate={{
              borderColor: isSitiSpeaking
                ? ['rgba(96,165,250,0.4)', 'rgba(96,165,250,0.8)', 'rgba(96,165,250,0.4)']
                : isUserSpeaking
                ? ['rgba(52,211,153,0.3)', 'rgba(52,211,153,0.6)', 'rgba(52,211,153,0.3)']
                : ['rgba(30,41,59,1)', 'rgba(30,41,59,1)'],
            }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="relative w-[72px] h-[72px] rounded-2xl flex items-center justify-center border-2"
            style={{
              background: isSitiSpeaking
                ? 'rgba(96,165,250,0.08)'
                : isUserSpeaking
                ? 'rgba(52,211,153,0.06)'
                : 'rgba(15,23,42,1)',
            }}
          >
            <Sparkles
              size={28}
              style={{
                color: isSitiSpeaking ? '#93c5fd' : isUserSpeaking ? '#6ee7b7' : '#334155',
                transition: 'color 0.4s',
              }}
            />
          </motion.div>
        </div>

        {/* 3D morphing blob — amplitude driven by real PCM via refs */}
        <div style={{ width: 200, height: 200 }}>
          <VoiceBlob
            sitiAmpRef={sitiAmpRef}
            userAmpRef={userAmpRef}
            lastSitiChunk={lastSitiChunk}
            lastUserChunk={lastUserChunk}
            isSitiSpeaking={isSitiSpeaking}
            isUserSpeaking={isUserSpeaking}
          />
        </div>

        {/* Status label */}
        <p
          className="text-sm font-medium transition-colors duration-300"
          style={{
            color: isSitiSpeaking ? '#93c5fd' : isUserSpeaking ? '#6ee7b7' : '#475569',
          }}
        >
          {statusLabel}
        </p>

        {/* Error */}
        {error && (
          <div className="w-full max-w-xs bg-red-500/10 border border-red-500/25 rounded-2xl p-3 text-xs text-red-300 flex items-start gap-2">
            <AlertTriangle size={13} className="shrink-0 mt-0.5 text-red-400" />
            {error}
          </div>
        )}
      </div>

      {/* ── Controls ── */}
      <div className="shrink-0 pb-8 pt-4 flex flex-col items-center gap-3">
        <div className="flex items-center gap-5">
          {/* Mute toggle */}
          <button
            onClick={toggleMute}
            disabled={status !== 'active'}
            title={isMuted ? 'Aktifkan mikrofon' : 'Matikan mikrofon'}
            className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-200 ${
              isMuted
                ? 'bg-red-500/15 border-red-500/40 text-red-400 hover:bg-red-500/25'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            {isMuted ? <MicOff size={17} /> : <Mic size={17} />}
          </button>

          {/* End call */}
          <button
            onClick={handleEnd}
            title="Akhiri sesi"
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 flex items-center justify-center transition-all duration-150 shadow-lg shadow-red-900/30 border border-red-500/30"
          >
            <PhoneOff size={20} className="text-white" />
          </button>
        </div>

        <p className="text-[10px] text-slate-700">
          {isMuted ? 'Mikrofon nonaktif' : 'Tekan merah untuk akhiri sesi'}
        </p>
      </div>
    </div>
  );
}
