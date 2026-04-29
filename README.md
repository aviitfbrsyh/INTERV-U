<div align="center">

<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

<br/>
<br/>

<img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=nextdotjs&logoColor=white" />
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Gemini_Live_API-Powered-4285F4?style=for-the-badge&logo=google&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />

<br/>
<br/>

<h1>interv<b>you</b></h1>

### *Simulasi Wawancara Kerja Bertenaga AI — Kelas Dunia.*

> Berhadapan langsung dengan **Siti Rahayu**, Director of Talent Acquisition dengan 20 tahun pengalaman di Fortune 500.<br/>
> Suara real-time. Evaluasi mendalam. Karir yang berubah.

<br/>

[**→ Lihat Demo Live**](https://ai.studio/apps/5c57f597-56fd-42d0-842e-58715a2a8612) &nbsp;·&nbsp; [**Laporkan Bug**](https://github.com/aviitfbrsyh/INTERV-U/issues) &nbsp;·&nbsp; [**Request Fitur**](https://github.com/aviitfbrsyh/INTERV-U/issues)

</div>

---

<br/>

## Mengapa Intervyou?

Kebanyakan kandidat gagal bukan karena kurang pintar — tapi karena **tidak pernah berlatih wawancara yang sesungguhnya.**

Intervyou hadir sebagai satu-satunya platform yang mensimulasikan wawancara kerja dengan AI yang tidak hanya menjawab — tapi **mendengar, mengevaluasi, dan menantang** Anda seperti interviewer Fortune 500 sungguhan. Dalam Bahasa Indonesia.

```
Upload CV  →  Analisis Mendalam  →  Wawancara Suara Real-Time  →  Laporan Evaluasi Ilahi
```

<br/>

## Fitur Unggulan

<table>
<tr>
<td width="33%" valign="top">

### 🧠 Deep Extraction
Gemini Flash menganalisis CV dan Job Description Anda hingga ke akar — pengalaman, gap skill, dan kecocokan posisi divisualisasikan sebelum wawancara dimulai.

</td>
<td width="33%" valign="top">

### 🎙️ Voice Live
Bicara secara alami. Gemini Live API menghadirkan percakapan suara dua arah dengan latensi ultra-rendah. Tidak ada jeda janggal. Tidak ada skrip kaku.

</td>
<td width="33%" valign="top">

### ⚡ Divine Eval
Setelah sesi selesai, dapatkan laporan evaluasi setingkat Direktur HR — skor, kekuatan, kelemahan, dan rekomendasi yang dapat ditindaklanjuti.

</td>
</tr>
</table>

<br/>

## Meet Siti Rahayu

<div align="center">

```
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   IBU SITI RAHAYU                                        ║
║   Director of Talent Acquisition                         ║
║   20 Tahun · Fortune 500 Companies                       ║
║                                                          ║
║   "Saya tidak mencari jawaban yang benar.                ║
║    Saya mencari kejujuran dan kedalaman berpikir."       ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

</div>

Siti bukan sekadar bot. Ia adalah persona yang dirancang dengan filosofi wawancara yang sesungguhnya:

- **Warm but Firm** — Membuka dengan hangat, menggali dengan tajam
- **STAR Methodology** — Mengevaluasi setiap jawaban melalui Situation, Task, Action, Result
- **Anti-Klise** — Tidak terpuaskan oleh jawaban generik; selalu *probing* lebih dalam
- **Manusiawi** — Jeda, reaksi, dan filler alami yang membuat wawancara terasa nyata

<br/>

## Alur Kerja

```
📄 Upload CV & JD
       ↓
🤖 Gemini Flash — Ekstraksi Data Terstruktur
       ↓
✏️  Review & Edit Data
       ↓
🎙️  Wawancara Suara Real-Time (Gemini Live)
       ↓
📊 Laporan Evaluasi Komprehensif (Gemini Pro)
       ↓
🚀 Karir Berubah
```

<br/>

## Tech Stack

<div align="center">

| Layer | Teknologi |
|:---|:---|
| **Framework** | Next.js 15 (App Router) + React 19 |
| **AI Engine — Ekstraksi** | Google Gemini Flash `gemini-3-flash-preview` |
| **AI Engine — Wawancara** | Google Gemini Live `gemini-3.1-flash-live-preview` |
| **AI Engine — Evaluasi** | Google Gemini Pro `gemini-3.1-pro-preview` |
| **Audio** | Web Audio API · ScriptProcessor · PCM 24kHz · BiquadFilter |
| **Styling** | Tailwind CSS v4 · Framer Motion |
| **Language** | TypeScript 5.9 · Strict Mode |
| **Deployment** | Google AI Studio · Cloud Run · Standalone |

</div>

<br/>

## Arsitektur Audio

Yang membuat Intervyou terasa *nyata* adalah pipeline audio yang dirancang khusus:

```
Microphone Input
    ↓  Float32Array → Int16 PCM (normalisasi × 32767)
    ↓  Base64 Encode
    ↓  Gemini Live API  [24kHz · VAD: LOW · Silence: 1800ms]
    ↓  Base64 PCM Response
    ↓  BiquadFilter  [High-shelf 3kHz · +4dB clarity boost]
    ↓  AudioBufferSourceNode
Speaker Output ✓
```

> **Mengapa mikrofon tidak langsung aktif?**
> Siti harus selesai menyapa terlebih dahulu. Mikrofon baru diaktifkan setelah sinyal `turnComplete` diterima — mencegah echo dan memastikan jawaban pertama Anda tidak terlewat.

<br/>

## Mulai Dalam 3 Menit

### Prasyarat

- Node.js 18+
- Google Gemini API Key — [dapatkan di sini](https://aistudio.google.com/app/apikey)
- Browser modern dengan akses mikrofon (Chrome, Firefox, Safari)

### Instalasi

```bash
# 1. Clone repository
git clone https://github.com/aviitfbrsyh/INTERV-U.git
cd INTERV-U

# 2. Install dependencies
npm install

# 3. Konfigurasi environment
cp .env.example .env.local
```

Buka `.env.local` dan isi API key Anda:

```env
NEXT_PUBLIC_GEMINI_API_KEY="your_gemini_api_key_here"
```

```bash
# 4. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) — dan bersiaplah berhadapan dengan Siti Rahayu.

<br/>

## Scripts

```bash
npm run dev      # Development server dengan hot reload
npm run build    # Production build
npm run start    # Jalankan production build
npm run lint     # ESLint check
npm run clean    # Hapus .next cache
```

<br/>

## Struktur Proyek

```
INTERV-U/
├── app/
│   ├── layout.tsx               # Root layout + fetch protection
│   ├── page.tsx                 # State machine (landing→setup→interview→eval)
│   └── globals.css              # Tailwind v4 + custom utilities
│
├── components/
│   ├── InterviewSetup.tsx       # Upload CV/JD + ekstraksi Gemini
│   ├── LiveInterview.tsx        # Wawancara suara real-time
│   ├── InterviewEvaluation.tsx  # Laporan evaluasi pasca-wawancara
│   └── StructuredDataForm.tsx   # Form review & edit data CV/JD
│
├── lib/
│   ├── gemini-extraction.ts     # Ekstraksi terstruktur + retry logic
│   ├── audio-manager.ts         # Web Audio API pipeline
│   └── utils.ts                 # Tailwind merge utility
│
└── hooks/
    └── use-mobile.ts            # Responsive breakpoint hook
```

<br/>

## Data Model

```typescript
// CV yang diekstrak secara terstruktur
interface CVData {
  profile:        { name, email, phone, location }
  experience:     { role, company, duration, responsibilities[] }[]
  education:      { degree, institution, year }[]
  skills:         string[]
  projects:       { name, description }[]
  certifications: string[]
}

// Job Description yang diekstrak
interface JDData {
  role:             string
  requirements:     string[]
  responsibilities: string[]
  qualifications:   string[]
}
```

<br/>

## Privasi & Keamanan

| Aspek | Status |
|:---|:---:|
| API Key tersimpan di server | ❌ Tidak — client-side by design |
| CV disimpan permanen | ❌ Tidak — hanya selama sesi |
| Audio direkam/disimpan | ❌ Tidak — di-stream langsung ke Gemini |
| `window.fetch` dilindungi dari polyfill | ✅ Ya |
| `.env.local` masuk Git | ❌ Tidak — di-ignore selamanya |

<br/>

## Roadmap

- [x] Wawancara suara real-time dengan persona Siti Rahayu
- [x] Ekstraksi CV dan JD terstruktur via Gemini
- [x] Evaluasi komprehensif pasca-wawancara
- [x] Form review dan edit data sebelum wawancara
- [ ] Dukungan bahasa Inggris
- [ ] Riwayat sesi tersimpan per akun
- [ ] Multiple persona interviewer
- [ ] Analisis intonasi dan kepercayaan diri
- [ ] Mode latihan per topik (behavioral, technical, situational)

<br/>

## Kontribusi

Pull request sangat disambut. Untuk perubahan besar, buka issue terlebih dahulu.

```bash
git checkout -b feature/nama-fitur
git commit -m "feat: deskripsi singkat fitur"
git push origin feature/nama-fitur
# → Buka Pull Request di GitHub
```

<br/>

---

<div align="center">

**Dibuat dengan obsesi terhadap kualitas.**

*Intervyou © 2026 — Transformasi Karir Melalui Kecerdasan Murni.*

<br/>

<img src="https://img.shields.io/badge/Made%20with-Next.js-black?style=flat-square&logo=nextdotjs" />
&nbsp;
<img src="https://img.shields.io/badge/Powered%20by-Gemini-4285F4?style=flat-square&logo=google" />
&nbsp;
<img src="https://img.shields.io/badge/Language-Bahasa%20Indonesia-red?style=flat-square" />

</div>
