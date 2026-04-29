# DOKUMENTASI LENGKAP PROYEK — INTERVYOUUU

> Dokumen ini merangkum seluruh arsitektur, alur kerja, perilaku AI, dan detail teknis proyek Intervyouuu secara menyeluruh.

---

## DAFTAR ISI

1. [Gambaran Umum](#1-gambaran-umum)
2. [Struktur Direktori](#2-struktur-direktori)
3. [Alur Aplikasi (State Machine)](#3-alur-aplikasi-state-machine)
4. [Kepribadian & Emosi AI — Siti Rahayu](#4-kepribadian--emosi-ai--siti-rahayu)
5. [Alur Data Teknis](#5-alur-data-teknis)
6. [Semua Komponen](#6-semua-komponen)
7. [Library & Utilitas](#7-library--utilitas)
8. [Model Data & Tipe](#8-model-data--tipe)
9. [Konfigurasi & Environment](#9-konfigurasi--environment)
10. [Desain & Sistem Styling](#10-desain--sistem-styling)
11. [Deployment & Runtime](#11-deployment--runtime)
12. [Keamanan & Privasi](#12-keamanan--privasi)
13. [Insight Teknis Kunci](#13-insight-teknis-kunci)

---

## 1. GAMBARAN UMUM

**Intervyouuu** adalah platform simulasi wawancara kerja berbasis AI yang menggunakan Google Gemini untuk:

- Mengekstrak data CV dan Job Description secara terstruktur
- Menjalankan wawancara kerja real-time via suara (voice-to-voice)
- Menghasilkan evaluasi komprehensif pasca-wawancara

Platform ini menempatkan kandidat berhadapan dengan **Siti Rahayu**, seorang interviewer AI dengan persona Director of Talent Acquisition berpengalaman 20 tahun, yang berinteraksi secara natural dalam Bahasa Indonesia.

**Stack Teknologi:**
- Framework: Next.js 15 (React 19)
- AI Engine: Google Gemini API (`@google/genai`)
- Audio: Web Audio API (native browser)
- Styling: Tailwind CSS v4
- Animasi: Framer Motion (`motion`)
- Markdown: `react-markdown` + `remark-gfm`
- Icons: `lucide-react`

---

## 2. STRUKTUR DIREKTORI

```
intervyouuu/
├── app/
│   ├── layout.tsx               ← Root layout, metadata, fonts, fetch protection
│   ├── page.tsx                 ← Landing page + state machine utama
│   └── globals.css              ← Global Tailwind styles & utility classes
│
├── components/
│   ├── InterviewSetup.tsx       ← Upload CV/JD, ekstraksi data, review
│   ├── LiveInterview.tsx        ← Wawancara suara real-time dengan Gemini
│   ├── InterviewEvaluation.tsx  ← Laporan evaluasi pasca-wawancara
│   └── StructuredDataForm.tsx   ← Form edit data CV dan JD terstruktur
│
├── hooks/
│   └── use-mobile.ts            ← Hook responsivitas mobile (<768px)
│
├── lib/
│   ├── gemini-extraction.ts     ← Ekstraksi CV/JD via Gemini, retry logic
│   ├── audio-manager.ts         ← Manajemen mikrofon & playback audio
│   ├── utils.ts                 ← cn() — merge Tailwind class names
│   └── empty-fetch-polyfill.js  ← Stub polyfill untuk melindungi native fetch
│
├── .env.local                   ← NEXT_PUBLIC_GEMINI_API_KEY (tidak di-commit)
├── .env.example                 ← Contoh variabel environment
├── next.config.ts               ← Konfigurasi Next.js (standalone, turbopack)
├── package.json                 ← Dependencies & scripts
├── tsconfig.json                ← Konfigurasi TypeScript
├── postcss.config.mjs           ← PostCSS / Tailwind config
├── metadata.json                ← Metadata app untuk AI Studio
├── eslint.config.mjs            ← ESLint config
└── README.md                    ← Panduan setup
```

---

## 3. ALUR APLIKASI (STATE MACHINE)

Aplikasi memiliki 4 state utama yang dikelola di `app/page.tsx`:

```
┌─────────────┐
│   landing   │  ← Halaman utama (hero, fitur, pricing, FAQ)
└──────┬──────┘
       │ Klik "Mulai Interview" / "Coba Gratis"
       ▼
┌─────────────┐
│    setup    │  ← Upload/paste CV & JD → Ekstraksi → Review data
└──────┬──────┘
       │ Klik "Mulai Wawancara"
       ▼
┌─────────────┐
│  interview  │  ← Wawancara suara real-time dengan Siti Rahayu
└──────┬──────┘
       │ Klik tombol Hang Up
       ▼
┌──────────────┐
│  evaluation  │  ← Laporan evaluasi lengkap berbasis AI
└──────┬───────┘
       │ Klik "Interview Lagi"
       ▼
     setup (kembali)
```

**State Variables di page.tsx:**

| Variabel   | Tipe   | Keterangan                                   |
|------------|--------|----------------------------------------------|
| `state`    | string | State saat ini: landing / setup / interview / evaluation |
| `cvText`   | string | JSON string dari CVData (atau teks mentah)   |
| `jdText`   | string | JSON string dari JDData (atau teks mentah)   |
| `history`  | string | Transkripsi percakapan dari sesi wawancara   |

**Handler Functions:**

| Fungsi               | Deskripsi                                    |
|----------------------|----------------------------------------------|
| `handleStart(cv, jd)`| Pindah ke state `interview` dengan data CV/JD |
| `handleEnd(history)` | Pindah ke state `evaluation` dengan riwayat  |
| `handleReset()`      | Kembali ke state `setup`                     |

---

## 4. KEPRIBADIAN & EMOSI AI — SITI RAHAYU

### Profil Karakter

| Atribut        | Detail                                   |
|----------------|------------------------------------------|
| **Nama**       | Siti Rahayu                              |
| **Jabatan**    | Director of Talent Acquisition           |
| **Pengalaman** | 20 tahun di perusahaan Fortune 500       |
| **Bahasa**     | Indonesia semi-formal, natural & hangat  |
| **Suara**      | "Aoede" — Google Gemini built-in voice   |

### Dimensi Kepribadian

**Profesionalisme:**
Siti adalah interviewer yang tajam dan berpengalaman. Ia mengenali jawaban klise seketika dan tidak segan-segan menggali lebih dalam dengan pertanyaan lanjutan. Ia tidak mencari jawaban "benar" — ia mencari kejujuran dan kedalaman berpikir.

**Kehangatan:**
Meski tegas, Siti tidak dingin. Ia membuka wawancara dengan salam yang tulus dan menunjukkan bahwa ia sudah benar-benar membaca CV kandidat. Ia menghargai jawaban yang terstruktur dan tidak ragu memberikan respons positif.

**Empati:**
Siti memahami bahwa wawancara kerja adalah situasi yang menegangkan. Ia memberikan ruang bagi kandidat untuk berpikir dan tidak terburu-buru memotong.

### Filosofi Wawancara

1. **Tidak mencari jawaban "benar"** — Mengutamakan kejujuran dan kedalaman berpikir kritis
2. **Menggunakan kerangka STAR** — Mengevaluasi Situation, Task, Action, Result
3. **Skeptis terhadap klise** — Menantang jawaban generik dengan probing questions
4. **Mendengar sampai selesai** — Tidak pernah memotong kandidat yang sedang berbicara
5. **Conversational tapi profesional** — Gaya bicara semi-formal dalam Bahasa Indonesia

### Aturan Perilaku Utama (System Instruction)

**Kepemimpinan Percakapan:**
- Siti yang MEMBUKA wawancara (tidak menunggu kandidat)
- Ia memegang kendali alur percakapan
- Hanya mengajukan SATU pertanyaan per giliran bicara

**Protokol Mendengarkan:**
- WAJIB mendengarkan jawaban kandidat hingga SELESAI
- Boleh memberikan acknowledgment di tengah jawaban: "Hmm", "Iya", "Oke" — ini bukan interupsi
- Membedakan antara:
  - **Interupsi nyata**: Kandidat berbicara saat kalimat Siti belum selesai
  - **Pergantian giliran normal**: Kandidat menjawab setelah Siti selesai bertanya

**Pola Respons:**

```
1. Acknowledgment poin kunci yang disebutkan kandidat
2. [Jeda sejenak — seolah mencatat]
3. Pertanyaan lanjutan atau pertanyaan berikutnya
4. Probing jika jawaban terlalu singkat
5. Apresiasi jika jawaban terstruktur
6. Tambahkan conversational fillers untuk nuansa realistis
```

### Respons Emosional Berdasarkan Situasi

**Pembukaan (Warm & Professional):**
```
"Selamat pagi, saya Siti Rahayu. Terima kasih sudah hadir hari ini.
Saya sudah meninjau resume Anda yang cukup menarik, dan saya
ingin kita mulai dengan pertanyaan sederhana..."
```

**Merespons Jawaban Baik:**
```
"Saya menangkap bahwa Anda menyebutkan [poin A] dan [poin B].
Menarik sekali sudut pandangnya. Bisa Anda ceritakan lebih detail
mengenai bagaimana Anda menghadapi situasi tersebut?"
```

**Merespons Jawaban Klise (Skeptis):**
```
"Hmm... 'saya seorang perfeksionisme' adalah jawaban yang sering
saya dengar. Bisa Anda berikan satu contoh konkret situasi di mana
sifat itu justru menjadi hambatan untuk Anda?"
```

**Fillers Manusiawi:**
- "Hmm...", "Oke, saya mengerti poinnya..."
- "Ah, menarik sekali sudut pandangnya."
- "Baik, saya catat itu."
- "Interesting perspective, tapi saya ingin menggali lebih dalam..."
- "I note that..." (kadang campur Inggris untuk nuansa Fortune 500)

**Sensitivitas Interupsi:**
- TIDAK bereaksi negatif terhadap:
  - Kandidat mengangguk verbal ("Hmm", "Iya", "Oke") saat Siti berbicara
  - Turn-taking normal setelah Siti selesai bertanya
  - Jawaban panjang (Siti menunggu sampai benar-benar selesai)
- HANYA bereaksi terhadap interupsi di tengah kalimat Siti

---

## 5. ALUR DATA TEKNIS

### Fase 1 — Setup & Ekstraksi Data

```
User upload file (PDF/gambar) atau paste teks CV/JD
              ↓
  extractCV() / extractJD()
  [lib/gemini-extraction.ts]
              ↓
  Gemini Flash 3 API
  Model: gemini-3-flash-preview
  Config: responseMimeType = "application/json"
          responseSchema = CVData/JDData schema
              ↓
  Objek CVData / JDData terstruktur
              ↓
  Ditampilkan di StructuredDataForm untuk review/edit
              ↓
  handleFinalStart() → JSON.stringify(cvData) + JSON.stringify(jdData)
              ↓
  Dikirim sebagai string ke LiveInterview component
```

**Retry Logic Ekstraksi:**
- 4 kali retry dengan exponential backoff
- Delay awal: 1000ms → 2000ms → 4000ms → 8000ms
- Hanya retry untuk error 503 (Service Unavailable)

---

### Fase 2 — Wawancara Suara Real-Time

```
LiveInterview component mount
              ↓
  Inisialisasi AudioManager (AudioContext 24kHz)
              ↓
  Koneksi ke Gemini Live API
  Model: gemini-2.0-flash-live-001 (atau gemini-3.1-flash-live-preview)
              ↓
  Setup session config:
  - System instruction: persona Siti Rahayu + CV + JD
  - Voice: "Aoede"
  - VAD sensitivity: LOW
  - Silence duration: 1800ms
              ↓
  Kirim trigger tersembunyi: "Mulai wawancara..."
              ↓
  Gemini generate audio pembukaan Siti
              ↓
  Tunggu sinyal `turnComplete`
              ↓ (atau timeout 15 detik sebagai fallback)
  Mulai capture mikrofon (AudioManager.startMicrophone)
              ↓

  LOOP PERCAKAPAN:
  ┌─────────────────────────────────────────────┐
  │  User berbicara                             │
  │  → Mic capture PCM (Float32 → Int16)        │
  │  → Base64 encode                            │
  │  → Kirim ke Gemini Live API                 │
  │  → VAD deteksi akhir ucapan (1800ms silent) │
  │  → Gemini proses audio + context             │
  │  → Stream audio response (base64 PCM)       │
  │  → AudioManager decode & play              │
  │  → High-shelf filter (3kHz, +4dB clarity)   │
  │  → Transkripsi disimpan ke historyRef       │
  │  → Tunggu turnComplete                      │
  │  → User giliran berbicara lagi              │
  └─────────────────────────────────────────────┘

  User klik Hang Up
              ↓
  session.close() + AudioManager.close()
              ↓
  History dikirim ke parent → state 'evaluation'
```

**Konfigurasi Audio:**

| Parameter       | Nilai                          |
|-----------------|-------------------------------|
| Sample Rate     | 24,000 Hz (24kHz)             |
| Voice           | "Aoede" (Google Gemini)       |
| VAD Sensitivity | LOW                            |
| Silence Timeout | 1800ms (1.8 detik)            |
| Filter          | High-shelf 3kHz, +4dB        |
| Format          | PCM Int16, Base64-encoded     |

---

### Fase 3 — Evaluasi Pasca-Wawancara

```
History string (semua percakapan AI & User)
              ↓
  InterviewEvaluation component mount
              ↓
  Gemini API request
  Model: gemini-2.5-pro-preview / gemini-3.1-pro-preview
  Prompt: CVData + JDData + conversation history + instruksi evaluasi
              ↓
  Respons: Markdown terstruktur berisi:
  ┌──────────────────────────────────────────┐
  │ 1. Skor keseluruhan (1-100)              │
  │ 2. Analisis kriteria:                    │
  │    - Technical Skill                     │
  │    - Emotional Intelligence (EQ)         │
  │    - Communication                       │
  │    - Culture Fit                         │
  │ 3. Top 3+ Kekuatan                       │
  │ 4. 3+ Kelemahan & area pengembangan      │
  │ 5. Feedback per pertanyaan               │
  │ 6. Rekomendasi final (Hire/No Hire/Wait) │
  └──────────────────────────────────────────┘
              ↓
  ReactMarkdown render dengan custom styling
              ↓
  Sidebar: Recommendation box + Area of Focus box
```

---

## 6. SEMUA KOMPONEN

### A. `app/page.tsx` — Shell Utama Aplikasi

**Tanggung Jawab:**
- Halaman landing dengan hero, fitur, pricing, FAQ
- State machine yang mengontrol 4 fase aplikasi
- Navigasi antar state

**Seksi Landing Page:**

| Seksi               | Deskripsi                                            |
|---------------------|------------------------------------------------------|
| Navigation          | Nav bar dengan CTA buttons                           |
| Hero                | Headline utama + highlight fitur                     |
| Bento Grid Fitur    | Deep Extraction, Voice Live, Divine Evaluation       |
| How It Works        | 3-step process visual                                |
| Persona Card        | Perkenalan Siti Rahayu + badge "20 Tahun Pengalaman" |
| Pricing             | Free / Professional Rp99k/bln / Elite Rp299k seumur hidup |
| FAQ                 | 4 pertanyaan umum                                    |
| Footer              | Link dan informasi copyright                         |

---

### B. `components/InterviewSetup.tsx` — Setup Wawancara

**Tanggung Jawab:**
- Pengumpulan input CV dan Job Description
- Upload file atau paste teks
- Ekstraksi data via Gemini
- Review dan edit data sebelum wawancara

**2-Step Process:**

```
Step 1: Input
├── Toggle paste / upload untuk CV
├── Toggle paste / upload untuk JD
├── File upload: PDF, gambar
└── Tombol "Ekstrak & Analisis" → loading overlay

Step 2: Review
├── CVForm — edit data CV terstruktur
├── JDForm — edit data JD terstruktur
└── Tombol "Mulai Wawancara"
```

**Indikator Status Ekstraksi:**
- Loading spinner saat proses berjalan
- Checkmark hijau jika berhasil
- Error message jika gagal

---

### C. `components/LiveInterview.tsx` — Wawancara Langsung

**Tanggung Jawab:**
- Mengelola percakapan suara dua arah dengan Gemini
- Menangani input mikrofon dan output speaker
- Menampilkan UI visual selama wawancara
- Menyimpan transkripsi percakapan
- Mengelola lifecycle sesi

**State Internal:**

| State           | Tipe    | Deskripsi                                  |
|-----------------|---------|--------------------------------------------|
| `status`        | string  | connecting / active / ending               |
| `isMuted`       | boolean | Toggle mute mikrofon                       |
| `isAiSpeaking`  | boolean | Indikator visual saat Siti berbicara       |
| `transcriptions`| array   | 5 pertukaran terakhir user ↔ AI            |
| `error`         | string  | Pesan error + tombol retry                 |

**Layout UI (Bento Grid 12-kolom):**

| Area                    | Kolom     | Konten                                        |
|-------------------------|-----------|-----------------------------------------------|
| Call Interface (besar)  | col-span-8| Waveform, nama Siti, transkripsi              |
| Job Context Card        | col-span-4| Judul posisi, tags (ANALISIS, SKILL GAP, Live)|
| Live Evaluation         | col-span-4| Status percakapan + progress bar              |
| Control Card            | col-span-3| Tombol toggle mikrofon                        |
| Live Insights           | col-span-6| Kotak analisis real-time                      |
| AI Engine Badge         | col-span-3| Label "Multimodal Live"                       |

**Pencegahan Bug Double-Voice:**
- Mikrofon TIDAK langsung aktif saat komponen mount
- Menunggu sinyal `turnComplete` dari Gemini (setelah greeting Siti)
- Jika tidak ada sinyal dalam 15 detik → fallback aktifkan mikrofon
- `cancellationFlag` mencegah callback async yang yatim

---

### D. `components/InterviewEvaluation.tsx` — Laporan Evaluasi

**Tanggung Jawab:**
- Generate evaluasi komprehensif setelah wawancara
- Menampilkan hasil dalam format laporan profesional
- Memberikan insight actionable dan rekomendasi

**Layout Halaman:**

```
┌─────────────────────────────────────────────────┐
│ Header: Ikon trophy, status, Save PDF / Retry   │
├──────────────────────────┬──────────────────────┤
│                          │ Sidebar:             │
│  Main Report:            │ - Recommendation box │
│  - Score (1-100)         │   (hijau)           │
│  - Criteria Table        │ - Area of Focus box  │
│  - Strengths             │   (amber)           │
│  - Weaknesses            │ - Session metadata   │
│  - Per-question feedback │   (durasi, sentimen) │
│  - Final recommendation  │                      │
└──────────────────────────┴──────────────────────┘
```

**Custom Styling Markdown:**
- Tabel dengan tema biru
- List items sebagai bordered cards
- Aksen warna: hijau, amber, biru
- Prose utilities untuk rendering yang bersih

---

### E. `components/StructuredDataForm.tsx` — Form Data Terstruktur

**Tanggung Jawab:**
- Form editable untuk CVData dan JDData
- Memungkinkan pengguna menyesuaikan data yang diekstrak secara manual

**CVForm — Seksi:**

| Seksi            | Input Type              | Icon Color |
|------------------|-------------------------|------------|
| Personal Profile | name, email, phone, loc | Biru       |
| Experience       | role, company, duration, responsibilities[] | Emerald |
| Education        | degree, institution, year | Kuning   |
| Projects         | name, description       | Pink       |
| Skills           | textarea (comma/newline) | Ungu      |
| Certifications   | textarea (comma/newline) | Biru      |

**JDForm — Seksi:**

| Seksi             | Input Type |
|-------------------|------------|
| Role Name         | Large input|
| Requirements      | Textarea   |
| Responsibilities  | Textarea   |

**Fitur:**
- Add/remove buttons untuk seksi berulang
- Responsive grid layout
- Icon berwarna per seksi

---

## 7. LIBRARY & UTILITAS

### `lib/gemini-extraction.ts`

**Fungsi Utama:**

```typescript
extractCV(input: string | File): Promise<CVData>
extractJD(input: string | File): Promise<JDData>
withRetry<T>(fn: () => Promise<T>, retries: number, delayMs: number): Promise<T>
```

**Model:** `gemini-3-flash-preview`

**Mekanisme:**
- `responseMimeType: "application/json"` — memaksa respons JSON
- `responseSchema` — mendefinisikan struktur CVData/JDData secara eksplisit
- Mendukung input teks dan file (PDF/gambar sebagai inline data)
- Retry dengan exponential backoff untuk error 503

---

### `lib/audio-manager.ts`

**Class: AudioManager**

**Constructor:** `new AudioManager(sampleRate: number)`

**Methods:**

| Method                          | Deskripsi                                             |
|---------------------------------|-------------------------------------------------------|
| `initialize()`                  | Setup AudioContext, resume jika suspended             |
| `startMicrophone(callback)`     | Minta izin mic, buat ScriptProcessor, panggil callback per chunk |
| `stopMicrophone()`              | Hentikan stream mic dan bersihkan nodes              |
| `playPCM(base64Data: string)`   | Decode base64 PCM, filter, play via AudioContext     |
| `stopAllPlayback()`             | Hentikan semua audio source yang aktif               |
| `close()`                       | Cleanup total (mic + context + sumber aktif)         |

**Audio Processing Pipeline:**

```
Mikrofon Input
    → Float32Array (dari ScriptProcessor)
    → Konversi ke Int16 (normalisasi × 32767)
    → Base64 encode
    → Kirim ke Gemini Live API

Gemini Audio Output
    → Base64 decode
    → Int16 → Float32 decode
    → BiquadFilter (high-shelf 3kHz, +4dB)
    → AudioBufferSourceNode
    → Speakers
```

---

### `lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
```

Menggabungkan class Tailwind CSS tanpa konflik (e.g., `p-4` + `p-8` → `p-8`).

---

### `lib/empty-fetch-polyfill.js`

Melindungi `window.fetch` native dari overwrite oleh polyfill packages.
Di-alias via Turbopack/Webpack configuration di `next.config.ts`.

---

### `hooks/use-mobile.ts`

```typescript
const isMobile = useMobile() // true jika lebar layar < 768px
```

Menggunakan `window.matchMedia` dengan listener real-time.
Menggunakan `setTimeout(0)` untuk menghindari cascading render warnings.

---

## 8. MODEL DATA & TIPE

### CVData Interface

```typescript
interface CVData {
  profile: {
    name: string
    email: string
    phone: string
    location: string
  }
  experience: Array<{
    role: string
    company: string
    duration: string
    responsibilities: string[]
  }>
  education: Array<{
    degree: string
    institution: string
    year: string
  }>
  skills: string[]
  projects: Array<{
    name: string
    description: string
  }>
  certifications: string[]
}
```

### JDData Interface

```typescript
interface JDData {
  role: string
  requirements: string[]
  responsibilities: string[]
  qualifications: string[]
}
```

### Tipe Live Interview

```typescript
type Transcription = {
  role: 'ai' | 'user'
  text: string
}

type InterviewStatus = 'connecting' | 'active' | 'ending'

// historyRef: akumulasi string
// Format: "AI: [teks] / USER: [teks] / AI: [teks] ..."
```

---

## 9. KONFIGURASI & ENVIRONMENT

### Environment Variables

| Variable                      | Wajib | Deskripsi                              |
|-------------------------------|-------|----------------------------------------|
| `NEXT_PUBLIC_GEMINI_API_KEY`  | Ya    | Kunci API Google Gemini (exposed ke frontend) |
| `APP_URL`                     | Tidak | URL deployment (untuk Google AI Studio) |
| `DISABLE_HMR`                 | Tidak | Set `true` untuk menonaktifkan Hot Module Replacement |

> **Catatan:** Prefix `NEXT_PUBLIC_` berarti key ini terekspos ke browser — ini disengaja untuk arsitektur client-side langsung ke Gemini API.

### next.config.ts — Konfigurasi Penting

```typescript
{
  reactStrictMode: true,
  output: 'standalone',           // Untuk deployment containerized
  images: {
    remotePatterns: [{ hostname: 'picsum.photos' }]
  },
  // Turbopack aliases — mencegah fetch polyfill overwrite
  turbopack: {
    resolveAlias: {
      'node-fetch': './lib/empty-fetch-polyfill.js',
      'whatwg-fetch': './lib/empty-fetch-polyfill.js',
    }
  }
}
```

### package.json — Scripts

| Script           | Perintah               |
|------------------|------------------------|
| `npm run dev`    | Development server     |
| `npm run build`  | Production build       |
| `npm run start`  | Production server      |
| `npm run lint`   | Jalankan ESLint        |
| `npm run clean`  | Hapus cache Next.js    |

---

## 10. DESAIN & SISTEM STYLING

### Color Scheme (Dark Mode)

| Peran             | Warna                  | Hex        |
|-------------------|------------------------|------------|
| Primary           | Blue-600 / Blue-500    | #2563eb / #3b82f6 |
| Background        | Near Black             | #0A0C10    |
| Card Background   | Slate-900              | #0f172a    |
| Borders           | Slate-800/700 (low opacity) | —     |
| Text Primary      | Slate-100              | #f1f5f9    |
| Text Secondary    | Slate-400              | #94a3b8    |
| Accent Success    | Emerald / Green        | #10b981    |
| Accent Warning    | Amber                  | #f59e0b    |

### Custom Utility Classes (globals.css)

| Class           | Deskripsi                                    |
|-----------------|----------------------------------------------|
| `.bento-card`   | Card dengan slate background dan border      |
| `.bento-accent` | Gradient card dengan aksen biru              |
| `.glass-panel`  | Glassmorphism dengan backdrop blur           |

### Typography

| Peran      | Font              | Penggunaan               |
|------------|-------------------|--------------------------|
| Sans       | Inter             | Body, UI elements        |
| Serif      | Playfair Display  | Italic accents, branding |

---

## 11. DEPLOYMENT & RUNTIME

**Platform:** Google AI Studio (Cloud Run)

- Auto-inject Gemini API key saat runtime
- Auto-inject Cloud Run service URL
- Deployment sebagai standalone Next.js container
- Docker-compatible (output: 'standalone')

**Browser Requirements:**
- Modern browser dengan Web Audio API support
- Akses mikrofon dan speaker
- Minimum browser: Chrome 90+, Firefox 90+, Safari 15+

**Proses Build:**
```bash
npm run build    # Compile TypeScript, bundle assets
npm run start    # Jalankan production server (port 3000)
```

---

## 12. KEAMANAN & PRIVASI

### API Key
- `NEXT_PUBLIC_` prefix → terekspos ke frontend (by design)
- Harus menggunakan API key restrictions di Google Cloud Console
- Batasi ke domain deployment spesifik

### Penanganan Data
- Data CV diproses via Gemini API (tidak disimpan permanen di server)
- Riwayat percakapan hanya disimpan selama sesi berlangsung (in-memory)
- Audio user di-stream langsung ke Gemini (tidak di-record/disimpan)
- Tidak ada database — semua state di React client

### Fetch Protection
- `window.fetch` native dilindungi dari overwrite polyfill
- Alias Turbopack/Webpack mengarahkan polyfill ke empty stub
- Mencegah interferensi library pihak ketiga

---

## 13. INSIGHT TEKNIS KUNCI

### 1. Pencegahan Echo / Double-Voice Bug
Mikrofon hanya diaktifkan SETELAH sinyal `turnComplete` dari Gemini (setelah Siti selesai greeting). Ini mencegah audio Siti masuk kembali ke mikrofon dan membuat loop echo.

### 2. VAD Sensitivity LOW
Pengaturan Voice Activity Detection yang rendah memberikan jeda 1800ms sebelum dianggap selesai berbicara. Ini memberikan kandidat waktu untuk berpikir tanpa dipotong di tengah jawaban.

### 3. High-Shelf Audio Filter
Filter `BiquadFilter` pada 3000 Hz dengan gain +4dB meningkatkan kejernihan suara Siti, terutama untuk konsonan dan intonasi yang sering hilang pada codec audio generative.

### 4. Exponential Backoff pada Ekstraksi
Retry logic di `gemini-extraction.ts` menangani rate limiting Gemini API secara elegan, terutama saat traffic tinggi di jam sibuk.

### 5. Refs vs State untuk Session Management
`historyRef` menggunakan `useRef` (bukan `useState`) untuk mengakumulasi transkripsi tanpa trigger re-render, menjaga performa UI selama percakapan panjang.

### 6. Cancellation Flag Pattern
`cancellationFlag` (`{ cancelled: boolean }`) diteruskan ke async callbacks untuk mencegah state update pada komponen yang sudah unmount — mencegah memory leak dan error React.

### 7. JSON Schema Enforcement
Gemini API dipaksa mengeluarkan JSON yang sesuai skema via `responseMimeType` dan `responseSchema`. Ini lebih reliable daripada parsing JSON dari teks bebas.

### 8. Float32 → Int16 Conversion
Audio dari `ScriptProcessor` berbentuk Float32 (-1.0 hingga +1.0). Sebelum dikirim ke Gemini Live API, dikonversi ke Int16 (-32768 hingga +32767) karena itulah format yang diterima API.

---

## RINGKASAN EKSEKUTIF

**Intervyouuu** adalah aplikasi wawancara kerja AI yang sophisticated dengan tiga lapisan:

1. **Data Layer**: Gemini mengekstrak CV dan JD menjadi objek terstruktur yang bisa diedit
2. **Interaction Layer**: Gemini Live API menjalankan percakapan suara real-time dengan persona "Siti Rahayu" — interviewer AI yang hangat namun tajam, beroperasi dalam Bahasa Indonesia semi-formal
3. **Evaluation Layer**: Gemini Pro menghasilkan laporan evaluasi komprehensif berbasis transkripsi percakapan

Siti Rahayu bukan sekadar chatbot — ia dirancang sebagai karakter dengan depth emosional: profesional tapi empati, tajam tapi tidak menghakimi, manusiawi melalui fillers dan jeda yang natural. Setiap aspek teknis (VAD, delay mic, audio filter) melayani satu tujuan: membuat wawancara terasa nyata.

---

*Dokumentasi ini dibuat otomatis berdasarkan analisis menyeluruh seluruh file proyek pada 2026-04-27.*
