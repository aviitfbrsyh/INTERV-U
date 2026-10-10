# DOKUMENTASI LENGKAP PROYEK — INTERVYOUUU

> Dokumen ini merangkum seluruh arsitektur, alur kerja, perilaku AI, model kompetensi Spencer & Spencer, framework STAR + FACT, dan detail teknis proyek Intervyouuu secara menyeluruh.

---

## DAFTAR ISI

1. [Gambaran Umum & Landasan Metodologi](#1-gambaran-umum--landasan-metodologi)
2. [Pemetaan Kompetensi Spencer & Spencer (1993)](#2-pemetaan-kompetensi-spencer--spencer-1993)
3. [Struktur Direktori](#3-struktur-direktori)
4. [Alur Aplikasi (State Machine)](#4-alur-aplikasi-state-machine)
5. [Kepribadian & Protokol BEI AI — Siti Rahayu](#5-kepribadian--protokol-bei-ai--siti-rahayu)
6. [Alur Data Teknis](#6-alur-data-teknis)
7. [Semua Komponen](#7-semua-komponen)
8. [Library & Utilitas](#8-library--utilitas)
9. [Model Data & Tipe](#9-model-data--tipe)
10. [Konfigurasi & Environment](#10-konfigurasi--environment)
11. [Desain & Sistem Styling](#11-desain--sistem-styling)
12. [Deployment & Runtime](#12-deployment--runtime)
13. [Keamanan & Privasi](#13-keamanan--privasi)
14. [Insight Teknis Kunci](#14-insight-teknis-kunci)

---

## 1. GAMBARAN UMUM & LANDASAN METODOLOGI

**Intervyouuu** adalah platform simulasi wawancara kerja berbasis kecerdasan buatan (*AI Interview Simulator*) dengan interaksi suara dua arah waktu nyata (*real-time voice-to-voice*) yang dirancang khusus untuk mahasiswa tingkat akhir dan lulusan baru (*fresh graduate*) bidang Teknologi Informasi (TI).

### Landasan Utama Revisi Skripsi (Standar Bu Rina):
1. **Berbasis Kompetensi Kerja (Bukan Tugas Mentah JD)**:
   Proses wawancara tidak lagi mengambil daftar tugas teknis mentah dari Job Description (JD), melainkan mengekstrak dan memetakan kompetensi perilaku yang dibutuhkan peran tersebut ke dalam **Kamus Kompetensi Spencer & Spencer (1993)**.
2. **Mode Tunggal: Behavioral Event Interview (BEI)**:
   Menghilangkan mode-mode wawancara umum (Personal, Pressure, Industrial). Sistem memusatkan simulasi pada satu format standar emas HR global: **Behavioral Event Interview (BEI)** yang dipandu oleh pewawancara AI tunggal, **Siti Rahayu** (Director of Talent Acquisition).
3. **Pertanyaan Berorientasi Pengalaman Masa Lalu**:
   Semua pertanyaan strictly menggali peristiwa riil yang pernah dialami kandidat (*"Ceritakan situasi saat..."*). Dilarang mengajukan pertanyaan teori buku / hafalan konseptual dan skenario hipotetis abstrak (*"Apa yang akan Anda lakukan jika..."*).
4. **Metode Probing & Evaluasi STAR + FACT**:
   Penggalian mendalam (*probing*) dan evaluasi menggabungkan kelengkapan narasi **STAR** (*Situation, Task, Action, Result*) dengan kedalaman verifikasi **FACT** (*Feeling/Focus, Action, Context/Consequence, Thinking*) serta metrik kelugasan **ConCISE**.
5. **Kalibrasi Waktu & Pacing Wawancara**:
   Durasi wawancara ditargetkan **±15 menit** dengan kuota **~7 pertanyaan substantif** (mencakup 7 kompetensi inti TI).

**Stack Teknologi:**
- Framework: Next.js 15 (React 19)
- AI Engine: Google Gemini Multimodal Live API (`@google/genai`) & Gemini 3 Flash / Pro
- Audio: Web Audio API (native browser 24kHz PCM)
- Styling: Tailwind CSS v4 & Lucide React
- Animasi: Motion (Framer Motion v12)
- Markdown & Laporan: `react-markdown`, `remark-gfm`, PDF Generator

---

## 2. PEMETAAN KOMPETENSI SPENCER & SPENCER (1993)

Mengacu pada *Competence at Work* (Spencer & Spencer, 1993), performa unggul (*superior performance*) dipetakan ke dalam 7 kompetensi inti untuk 4 peran utama TI (Frontend, Backend, QA/Tester, DevOps/Cloud):

| No | Kode | Nama Kompetensi | Definisi / Indikator Perilaku | Skala Level (1–5) |
|---|---|---|---|---|
| 1 | **EXP** | Technical / Professional Expertise | Penguasaan pengetahuan teknis mendalam dan penerapannya dalam menyelesaikan masalah rekayasa nyata. | Level 1 (Dasar) s.d. Level 5 (Otoritas teknis / arsitektural) |
| 2 | **AT** | Analytical Thinking | Kemampuan mengurai masalah kompleks menjadi komponen logis, menemukan akar masalah (*root cause*), dan menganalisis implikasi. | Level 1 (Mengamati pola) s.d. Level 5 (Model analitis multi-dimensi) |
| 3 | **CT** | Conceptual Thinking | Kemampuan mengenali pola tersembunyi, menghubungkan konsep abstrak, dan merumuskan solusi arsitektural inovatif. | Level 1 (Melihat analogi) s.d. Level 5 (Menciptakan paradigma arsitektur baru) |
| 4 | **ACH** | Achievement Orientation | Dorongan bekerja melebihi standar keunggulan, menetapkan sasaran menantang, dan meningkatkan performa sistem/bisnis. | Level 1 (Fokus standar kerja) s.d. Level 5 (Inisiatif bisnis bernilai strategis tinggi) |
| 5 | **CO** | Concern for Order, Quality and Accuracy | Komitmen terhadap ketepatan, kualitas kode, pengujian ketat (*zero bug*), dan dokumentasi yang rapi. | Level 1 (Kerapian dasar) s.d. Level 5 (Membangun sistem jaminan mutu organisasi) |
| 6 | **TW** | Teamwork and Cooperation | Kemampuan berkolaborasi secara produktif, berbagi pengetahuan (*code review*), dan menyelesaikan konflik tim. | Level 1 (Kerja sama pasif) s.d. Level 5 (Membangun sinergi lintas fungsi dan tim) |
| 7 | **INT** | Initiative | Proaktif mengantisipasi masalah di masa depan, mengambil tindakan mandiri tanpa disuruh, dan mencegah kegagalan sistem. | Level 1 (Respons cepat) s.d. Level 5 (Inisiatif jangka panjang 6–12 bulan ke depan) |

---

## 3. STRUKTUR DIREKTORI

```
intervyouuu/
├── app/
│   ├── api/
│   │   ├── coaching/route.ts        ← Bimbingan Siti (chat, TTS highlight, latihan suara retry)
│   │   ├── cross-match/route.ts     ← Pencocokan CV vs target kompetensi Spencer & Spencer
│   │   ├── evaluate/route.ts        ← Evaluasi LLM-as-a-Judge (STAR + FACT + ConCISE + Level 1–5)
│   │   └── extract/route.ts         ← Ekstraksi CV dan JD ke Spencer & Spencer target competencies
│   ├── layout.tsx                   ← Root layout, font, metadata
│   ├── page.tsx                     ← State machine utama (landing, setup, interview, evaluation)
│   └── globals.css                  ← Tailwind utility classes & tokens
│
├── components/
│   ├── CoachingLive.tsx             ← Konsultasi suara live real-time pasca wawancara
│   ├── InterviewEvaluation.tsx      ← Laporan visual evaluasi (Kompetensi, FACT, STAR, ConCISE)
│   ├── InterviewSetup.tsx           ← Form upload CV/JD, pemetaan BEI, profil Siti Rahayu
│   ├── LiveInterview.tsx            ← Sesi voice-to-voice BEI 15 menit dengan Gemini Live API
│   └── StructuredDataForm.tsx       ← Form review/edit data CV & target kompetensi JD
│
├── contexts/
│   ├── kamus-kompetensi-sp-sp.md    ← Salinan lengkap 20 kamus kompetensi Spencer & Spencer (1993)
│   └── pemetaan-kompetensi-it.md    ← Matriks pemetaan 7 kompetensi inti untuk 4 peran TI
│
├── lib/
│   ├── audio-manager.ts             ← AudioContext, capture PCM 24kHz, filter Biquad
│   ├── coaching-chat.ts             ← Client library chat coaching Siti
│   ├── cross-match.ts               ← Client interface cross-matching CV-JD
│   ├── evaluate.ts                  ← Model data & runner evaluasi LLM-as-a-Judge
│   ├── filler-words.ts              ← Deteksi 17 pola filler word Indonesia otomatis
│   ├── gemini-extraction.ts         ← Skema ekstraksi CVData & JDData
│   ├── gemini-tts.ts                ← Generator speech & coaching highlight Siti
│   ├── generate-report.ts           ← Ekspor PDF laporan evaluasi lengkap
│   ├── practice-retry.ts            ← Runner latihan ulang rekaman jawaban
│   └── voice-transcribe.ts          ← Transkripsi suara latihan via Gemini
│
├── DRAFSKRIPSI.MD                   ← Naskah draf skripsi (Bab I–V & Daftar Pustaka)
└── DOKUMENTASI_PROYEK.md            ← Dokumen ini
```

---

## 4. ALUR APLIKASI (STATE MACHINE)

```
┌─────────────┐
│   landing   │  ← Pengenalan platform, metode BEI, dan profil Siti Rahayu
└──────┬──────┘
       │ Klik "Mulai Wawancara"
       ▼
┌─────────────┐
│    setup    │  ← Upload CV & JD → Ekstraksi ke 7 Kompetensi Spencer & Spencer
└──────┬──────┘  ← Cross-matching CV vs Target Kompetensi → Review Form
       │ Klik "Mulai Simulasi Wawancara"
       ▼
┌─────────────┐
│  interview  │  ← Simulasi Voice-to-Voice BEI (±15 menit / ~7 pertanyaan)
└──────┬──────┘  ← Probing STAR + FACT oleh Siti Rahayu
       │ Klik "Akhiri Sesi" / Waktu Habis
       ▼
┌──────────────┐
│  evaluation  │  ← Laporan Evaluasi Komprehensif:
└──────┬───────┘    - Nilai Keseluruhan & Rekomendasi
       │            - Evaluasi 7 Kompetensi Spencer & Spencer (Level 1–5)
       │            - Metrik Agregat FACT (Kedalaman Probing)
       │            - Metrik Agregat STAR & ConCISE
       │            - Analisis Per Pertanyaan (Evidence, Suggestion, Hack)
       │            - Tanya Siti (Chat / Voice) & Latihan Ulang Jawaban
       │ Klik "Mulai Ulang"
       ▼
     setup (kembali)
```

---

## 5. KEPRIBADIAN & PROTOKOL BEI AI — SITI RAHAYU

### Profil Karakter
- **Nama**: Siti Rahayu
- **Jabatan**: Director of Talent Acquisition (20 tahun pengalaman di industri TI global)
- **Karakter**: Hangat, tajam, profesional, berbasis bukti perilaku nyata
- **Suara**: "Aoede" (Google Gemini Live API)

### Protokol Wawancara BEI yang Ditegakkan:
1. **Wajib Format BEI**: Semua pertanyaan harus berupa *"Ceritakan situasi saat Anda..."* atau *"Bisa berikan contoh nyata ketika Anda..."*.
2. **Dilarang Pertanyaan Teori**: Tidak menanyakan hafalan teori (misal: *"Apa perbedaan SQL dan NoSQL?"* atau *"Jelaskan konsep OOP"*). Pertanyaan teknis harus berwujud penerapan: *"Ceritakan pengalaman Anda saat memilih database NoSQL, apa pertimbangan teknisnya dan kendala apa yang muncul?"*.
3. **Dilarang Skenario Hipotetis**: Tidak menanyakan *"Apa yang akan Anda lakukan jika server down?"*. Melainkan: *"Pernahkah Anda mengalami insiden server down saat produksi? Ceritakan apa peran dan tindakan Anda saat itu."*.
4. **Probing Mendalam (STAR + FACT)**:
   - **Feeling / Focus**: Menggali emosi, motivasi, dan kendali diri (*"Apa yang Anda rasakan saat itu?"*).
   - **Action**: Memastikan aksi diri sendiri, bukan hanya tim (*"Apa tindakan spesifik yang ANDA ambil secara pribadi?"*).
   - **Context / Consequence**: Menanyakan dampak terukur (*"Apa dampak dari tindakan tersebut pada performa sistem?"*).
   - **Thinking**: Menggali alur logika pengambilan keputusan (*"Apa pertimbangan utama Anda saat memutuskan opsi tersebut?"*).
5. **Pacing 15 Menit**: Pacing dikalibrasi untuk mengajukan ~7 pertanyaan substantif yang mencakup 7 kompetensi inti Spencer & Spencer, diakhiri dengan penutupan profesional.

---

## 6. ALUR DATA TEKNIS

### Fase 1 — Setup & Ekstraksi Kompetensi
1. Kandidat mengunggah CV dan Job Description (teks atau file PDF/gambar).
2. Endpoint `/api/extract` menggunakan `gemini-3-flash-preview` dengan JSON Schema untuk mengekstrak kualifikasi CV dan memetakan deskripsi pekerjaan menjadi `target_competencies` berdasarkan Kamus Spencer & Spencer (1993).
3. Endpoint `/api/cross-match` mencocokkan rekam jejak CV dengan target kompetensi, mendeteksi kekuatan dan kesenjangan kompetensi (*competency gaps*).
4. Kandidat dapat meninjau dan mengedit data terstruktur pada `StructuredDataForm`.

### Fase 2 — Simulasi Voice-to-Voice BEI
1. Komponen `LiveInterview` menginisialisasi sesi WebSocket dengan Gemini Live API (`gemini-2.0-flash-live-001`).
2. `systemInstruction` menginjeksikan profil kandidat, Job Description, target kompetensi Spencer & Spencer, serta protokol ketat BEI dan panduan pacing 15 menit.
3. Audio streaming bidireksional ditangani secara natif via Web Audio API (PCM 24kHz) dengan Voice Activity Detection (VAD) jeda 1800ms.
4. Transkrip tanya-jawab diakumulasikan secara aman di memori client (`historyRef`).

### Fase 3 — Evaluasi LLM-as-a-Judge Pasca Wawancara
1. Endpoint `/api/evaluate` memproses transkrip lengkap bersama data CV dan target kompetensi.
2. Model mengevaluasi setiap pasang tanya-jawab:
   - **STAR Detection**: Situation, Task, Action, Result (skor 0–4 dan bukti kutipan).
   - **FACT Probing**: Feeling, Action, Context, Thinking (skor per pilar /10 dan total /40).
   - **Spencer & Spencer Leveling**: Penentuan tingkat kemahiran (Level 1–5) dan catatan perilaku nyata.
   - **ConCISE Metrics**: Consistency, Clarity, Information, Structure, Effectiveness (total /50).
   - **Filler Word Detection**: 17 pola kata pengisi Bahasa Indonesia terdeteksi otomatis.
   - **Candidate Archetype**: Profil komunikasi kandidat (*Articulate Architect*, *Rambling Expert*, dll.).
   - **Rekomendasi Final**: Recommended, Conditional, Not Recommended beserta saran konkret.
3. Hasil evaluasi dapat diunduh langsung menjadi dokumen resmi PDF via `generateEvaluationReport`.

---

## 7. SEMUA KOMPONEN

- `InterviewSetup.tsx`: Halaman setup wawancara dengan kartu tunggal Behavioral Event Interview (BEI), ringkasan metode STAR+FACT, dan 7 kompetensi Spencer & Spencer.
- `LiveInterview.tsx`: Antarmuka simulasi suara langsung dengan visualizer ombak suara, pewaktu 15 menit, indikator turn-taking, dan protokol BEI Siti Rahayu.
- `InterviewEvaluation.tsx`: Dasbor komprehensif hasil evaluasi dengan kartu agregat ConCISE, STAR, FACT, kartu visual 7 kompetensi Spencer & Spencer, kartu per-pertanyaan, panel coaching Siti, dan latihan suara ulang.
- `CoachingLive.tsx`: Sesi konsultasi suara real-time pasca wawancara dengan Siti Rahayu.
- `StructuredDataForm.tsx`: Form edit data terstruktur CV dan kartu visual target kompetensi Spencer & Spencer.

---

## 8. MODEL DATA & TIPE

### Model Ekstraksi (`lib/gemini-extraction.ts`):
```typescript
export interface RequiredCompetency {
  code: 'EXP' | 'AT' | 'CT' | 'ACH' | 'CO' | 'TW' | 'INT';
  name: string;
  target_level: number; // 1-5
  reason: string;
}

export interface JDData {
  role: string;
  requirements: string[];
  responsibilities: string[];
  qualifications: string[];
  target_competencies?: RequiredCompetency[];
}
```

### Model Evaluasi (`lib/evaluate.ts`):
```typescript
export interface CompetencyScore {
  code: string;
  name: string;
  level: number; // 1-5
  score: number; // 0-100
  summary: string;
}

export interface QAAnalysis {
  question: string;
  answer: string;
  star: {
    situation: { present: boolean; evidence: string };
    task: { present: boolean; evidence: string };
    action: { present: boolean; evidence: string };
    result: { present: boolean; evidence: string };
    score: number; // 0-4
  };
  fact?: {
    feeling: { score: number; note: string };
    action: { score: number; note: string };
    context: { score: number; note: string };
    thinking: { score: number; note: string };
    total: number; // 0-40
  };
  competency?: {
    code: string;
    name: string;
    level: number; // 1-5
    behavior_note: string;
  };
  concise: {
    consistency: { score: number; note: string };
    clarity: { score: number; note: string };
    information: { score: number; note: string };
    structure: { score: number; note: string };
    effectiveness: { score: number; note: string };
    total: number; // 0-50
  };
  rating: number; // 1-10
  suggestion: string;
  hack: string;
  better_answer_example: string;
}

export interface EvaluationData {
  overall_score: number;
  overall_summary: string;
  candidate_archetype: CandidateArchetype;
  qa_analysis: QAAnalysis[];
  competency_scores?: CompetencyScore[];
  cv_jd_match: {
    score: number;
    matched_skills_in_interview: string[];
    skill_gaps_addressed: string[];
    skill_gaps_unaddressed: string[];
    assessment: string;
  };
  strengths: string[];
  weaknesses: string[];
  final_recommendation: string;
  recommendation_verdict: 'recommended' | 'conditional' | 'not_recommended';
}
```

---

## 9. KONFIGURASI & ENVIRONMENT

| Variabel | Wajib | Keterangan |
|---|---|---|
| `GEMINI_API_KEY` | Ya | Kunci API Google Gemini untuk pemrosesan backend |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Ya | Kunci API Gemini untuk koneksi WebSocket frontend |

---

## 10. DESAIN & SISTEM STYLING

- **Tema**: Dark mode modern dengan palet warna berstandar HSL (Navy Slate `#0A0C10`, Electric Blue `#2563eb`, Emerald `#10b981`, Amber `#f59e0b`, Cyan `#06b6d4`).
- **Desain Komponen**: Glassmorphism cards dengan border beraksen halus dan mikro-animasi transisi `motion/react`.
- **Indikator Kompetensi**: Bar segmen 5 level dengan warna adaptif per cluster Spencer & Spencer.

---

## 11. DEPLOYMENT & RUNTIME

- **Platform Target**: Node.js 20+ / Docker Container / Cloud Run.
- **Kepatuhan Browser**: Google Chrome 90+, Microsoft Edge 90+, Safari 15+ (Mendukung Web Audio API & MediaRecorder Opus).

---

## 12. KEAMANAN & PRIVASI

- Data CV dan transkrip wawancara hanya diproses secara *in-memory* selama sesi aktif untuk keperluan evaluasi dan bimbingan, tanpa persistensi ke basis data eksternal tanpa izin kandidat.
- Perlindungan native `window.fetch` terhadap potensi overwrite oleh polyfill pihak ketiga.

---

## 13. INSIGHT TEKNIS KUNCI

1. **Eliminasi Echo**: Mikrofon browser hanya diaktifkan setelah sinyal `turnComplete` diterima dari Gemini Live API, mencegah audio interviewer terdengar kembali oleh mikrofon.
2. **Ekstraksi Terstandar Spencer & Spencer**: Mengubah data Job Description mentah menjadi parameter kompetensi terstandar menjamin pertanyaan wawancara selalu relevan dengan dinamika kerja nyata.
3. **Penyelarasan STAR + FACT**: Kerangka STAR memastikan struktur kelengkapan cerita, sementara FACT memastikan verifikasi keaslian peran pribadi dan proses berpikir kandidat.
4. **LLM-as-a-Judge Tanpa Bias Verbositas**: Kombinasi metrik ConCISE dan verifikasi bukti nyata perilaku mengatasi kelemahan kecerdasan buatan konvensional yang kerap memberi skor tinggi hanya pada jawaban panjang.

---

*Dokumentasi ini diselaraskan dengan standar revisi akademik dan arahan skripsi Bu Rina pada Oktober 2026.*
