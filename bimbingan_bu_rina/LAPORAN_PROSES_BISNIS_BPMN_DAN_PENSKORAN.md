# LAPORAN PROSES BISNIS BPMN & MEKANISME PENSKORAN DETERMINISTIK
## Sistem Simulasi Wawancara Kerja Interaktif INTERV-U Berbasis Multi-Framework AI
**Dokumen Laporan Resmi untuk Bimbingan Skripsi — Dosen Pembimbing: Ibu Chanifah, M.Kom. (Bu Rina)**

---

> **RINGKASAN EKSEKUTIF DOKUMEN**  
> * **Peneliti:** Avit Febriansyah  
> * **Judul Skripsi:** Pengembangan Sistem Simulasi Wawancara Kerja Interaktif Menggunakan Multimodal Large Language Model Berbasis Kamus Kompetensi Spencer & Spencer (1993)  
> * **File Diagram Visual:** [`BPMN_PROSES_EVALUASI_INTERVU.drawio`](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/BPMN_PROSES_EVALUASI_INTERVU.drawio) *(Dapat dibuka & diedit langsung di https://app.diagrams.net / Draw.io)*  
> * **Tujuan Utama Laporan:** Mendokumentasikan secara rinci arsitektur proses bisnis end-to-end (BPMN 6 Swimlane) dan membuktikan secara ilmiah bahwa penilaian skor kandidat dihitung melalui **formula matematika deterministik berbobot**, bukan halusinasi acak model bahasa (*Generative AI*).

---

## BAB I: PENDAHULUAN & JUSTIFIKASI AKADEMIK

### 1.1 Menjawab Kritik Bimbingan: *"AI Bukan Kotak Hitam (Black-Box)"*
Dalam sesi bimbingan, Bu Rina memberikan arahan dan analogi yang sangat fundamental:
> *"Jangan percaya buta hasil parsing/pemetaan Gemini. Kamu harus tahu logika pemetaannya dan isi tiap kategorinya. Jangan seperti mahasiswa yang tidak mengecek kategori halal-haram di dalam sistemnya. Skala penilaian yang kamu buat sendiri perlu dasar atau justifikasi."*

Kritik ini sangat krusial dalam ujian sidang skripsi Teknik Informatika / Sistem Informasi. Sebuah sistem kecerdasan buatan tidak boleh bertindak sebagai *black-box* yang tiba-tiba mengeluarkan skor 85 atau 90 tanpa ada dasar perhitungan ilmiah.

### 1.2 Solusi: Paradigma *Constrained Hybrid Scoring*
Sistem **INTERV-U** memisahkan arsitektur penilaian menjadi dua lapisan tegas:
1. **Lapisan Persepsi Kualitatif (*Qualitative Perception Layer - Gemini 2.5 Flash*):**
   Model bahasa hanya difungsikan untuk memproses bahasa alami (*Natural Language Processing*), yaitu:
   * Mentranskripsikan audio percakapan menjadi teks.
   * Mendeteksi keberadaan elemen narasi STAR (*Situation, Task, Action, Result*).
   * Menilai keotentikan pengalaman nyata melalui 4 dimensi FACT (*Feeling, Action, Context, Thinking*).
   * Mencocokkan bukti jawaban kandidat ke tingkatan level (Level 1–5) pada **Kamus Kompetensi Spencer & Spencer (1993)**.
2. **Lapisan Kalkulasi Deterministik (*Deterministic Mathematical Engine - Kode Backend*):**
   Seluruh angka akhir, persentase kelulusan, dan status rekomendasi dihitung oleh algoritma matematis menggunakan metode **Simple Additive Weighting (SAW)** dengan vektor bobot posisi ($w_i$) yang telah divalidasi oleh Asesor SDM (Bu Rina). **Gemini dilarang keras mengarang skor akhir secara mandiri.**

---

## BAB II: ANATOMI DIAGRAM ALIR BPMN (6 SWIMLANES)

Diagram BPMN pada file [`BPMN_PROSES_EVALUASI_INTERVU.drawio`](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/BPMN_PROSES_EVALUASI_INTERVU.drawio) membagi proses sistem ke dalam **6 Kolam Renang (*Swimlanes*)** yang saling terintegrasi:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ POOL: SISTEM SIMULASI WAWANCARA KERJA INTERV-U                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ 1. KANDIDAT / USER                                                           │
│    └── Unggah CV, Input JD, Menjawab Lisan via Mic, Sesi Tanya Jawab (Q&A)   │
├──────────────────────────────────────────────────────────────────────────────┤
│ 2. MODUL FRONTEND & AUDIO STREAM                                             │
│    └── Ekstraksi /api/extract, Web Audio API 24kHz, Transkripsi Percakapan   │
├──────────────────────────────────────────────────────────────────────────────┤
│ 3. PEWAWANCARA AI (BU SITI RAHAYU)                                           │
│    └── Cross-match CV vs JD, 7 Pertanyaan BEI (30 Menit), Probing STAR/FACT │
├──────────────────────────────────────────────────────────────────────────────┤
│ 4. LLM-AS-A-JUDGE (BUKTI KUALITATIF)                                         │
│    └── Ekstraksi STAR (0-4), Audit FACT (4-40), Mapping Level Spencer (1-5)  │
├──────────────────────────────────────────────────────────────────────────────┤
│ 5. MESIN SKOR DETERMINISTIK (KODE BACKEND)                                   │
│    └── Formula S_base, Pengali Integritas μ_FACT, Agregasi Bobot Matriks     │
├──────────────────────────────────────────────────────────────────────────────┤
│ 6. LAPORAN & COACHING DASHBOARD                                              │
│    └── Radar Chart 7 Kompetensi, Dimensi FACT, Career Hacks, Latihan Audio   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Penjelasan Rinci Alur Tiap Swimlane:

#### 1. Swimlane 1: Kandidat / User (Aktor Manusia)
* **Start Event:** Kandidat memulai sesi simulasi.
* **Task 1.1:** Kandidat mengunggah berkas CV (PDF / Teks) dan menempelkan teks kualifikasi lowongan pekerjaan (*Job Description* / JD).
* **Task 1.2:** Kandidat berbicara langsung menjawab pertanyaan pewawancara AI menggunakan mikrofon secara lisan (*verbal interaction*).
* **Task 1.3 (Candidate Q&A):** Setelah pertanyaan ke-7 selesai, kandidat memanfaatkan giliran bertanya untuk menggali detail seputar budaya kerja, ekspektasi posisi, atau teknologi yang digunakan di perusahaan.

#### 2. Swimlane 2: Modul Frontend & Audio Stream (Lapisan Antarmuka)
* **Task 2.1:** Mengirimkan payload CV dan JD ke endpoint `/api/extract` untuk diparsing menjadi data JSON terstruktur.
* **Task 2.2:** Melakukan inisialisasi *Web Audio API* (AudioContext sample rate 24.000 Hz) dan meminta token koneksi aman dari `/api/live-token`.
* **Task 2.3:** Mengelola *streaming buffer* audio dua arah (suara kandidat dikirim via WebSocket PCM, suara AI diterima dan diputar secara real-time).
* **Task 2.4:** Mengumpulkan seluruh riwayat percakapan menjadi dokumen transkrip utuh (7 pasang pertanyaan dan jawaban).

#### 3. Swimlane 3: Pewawancara AI — Bu Siti Rahayu (Lapisan Agen Wawancara)
* **Task 3.1 (Cross-Matching):** Menganalisis tingkat kesesuaian awal CV terhadap JD serta mengidentifikasi area *skill gap* prioritas.
* **Task 3.2 (Pacing 30 Menit & 7 Pertanyaan BEI):** Mengajukan tepat 7 pertanyaan perilaku terstruktur mewakili 7 Kompetensi Inti Spencer & Spencer:
  1. `EXP` (Technical/Professional Expertise)
  2. `AT` (Analytical Thinking)
  3. `CT` (Conceptual Thinking)
  4. `ACH` (Achievement Orientation)
  5. `CO` (Concern for Order, Quality & Accuracy)
  6. `TW` (Teamwork and Cooperation)
  7. `INT` (Initiative) &mdash; Ditandai tegas sebagai pertanyaan penutup.
* **Gateway 3.1 (Decision: Jawaban Klise/Dangkal?):**
  * *Jika Ya (kandidat hanya bicara teori atau klaim tim):* AI mengeksekusi **Probing Mendalam STAR + FACT** (mengejar tindakan spesifik kandidat secara mandiri).
  * *Jika Tidak (jawaban sudah konkret):* AI melanjutkan ke kompetensi berikutnya secara elegan.
* **Task 3.3 (Fase Penutupan 3 Langkah):** Mengapresiasi sesi, membuka sesi tanya jawab untuk kandidat, dan menjawab pertanyaan kandidat berbasis konteks JD secara profesional.

#### 4. Swimlane 4: LLM-as-a-Judge (Lapisan Ekstraksi Kualitatif)
* **Task 4.1:** Menerima transkrip lengkap di endpoint `/api/evaluate`.
* **Task 4.2 (Parsing STAR):** Mengecek apakah jawaban memuat 4 komponen narasi:
  * *Situation:* Konteks proyek nyata masa lalu.
  * *Task:* Peran dan tanggung jawab pribadi kandidat.
  * *Action:* Langkah konkret mandiri yang dieksekusi.
  * *Result:* Hasil akhir terukur dan dampaknya bagi sistem.
* **Task 4.3 (Audit FACT):** Mengukur 4 dimensi keaslian pengalaman:
  * *Feeling (1–10):* Sikap mental & ketenangan di bawah tekanan.
  * *Action (1–10):* Spesifisitas kontribusi individu (bukan mendompleng tim).
  * *Context (1–10):* Kedalaman detail situasi & konsekuensi masalah.
  * *Thinking (1–10):* Kematangan pertimbangan logis di balik solusi.
* **Task 4.4 (Pencocokan Kamus Spencer):** Membandingkan bukti transkrip dengan deskriptor level perilaku (Level 1–5) pada Kamus Spencer & Spencer (1993) untuk menetapkan level capaian aktual ($L_{\text{actual}}$).

#### 5. Swimlane 5: Mesin Skor Deterministik (Lapisan Perhitungan Matematika)
* **Data Object:** Membaca matriks bobot posisi IT ($w_i$) dan target level minimum ($L_{\text{target}}$) dari dokumen Bu Rina.
* **Task 5.1:** Menghitung skor dasar tiap kompetensi ($S_{\text{base}, i}$) berdasarkan rasio pemenuhan target level.
* **Task 5.2:** Mengalikan skor dasar dengan faktor integritas narasi FACT ($\mu_{\text{FACT}, i}$) untuk menghasilkan skor final tiap kompetensi ($S_i$).
* **Task 5.3:** Menghitung skor akhir terbobot komposit menggunakan metode *Simple Additive Weighting*:
  $$\text{Skor Akhir} = \sum_{i=1}^{7} (w_i \times S_i)$$
* **Gateway 5.1 (Decision Thresholds):** Mengevaluasi nilai akhir terhadap *passing grade* kelulusan:
  * $\text{Skor} \ge 75$ dan seluruh kompetensi inti terpenuhi $\implies$ **RECOMMENDED (Lolos)**.
  * $60 \le \text{Skor} < 75$ atau terdapat gap minor $\implies$ **CONDITIONAL (Pertimbangan)**.
  * $\text{Skor} < 60$ atau terdapat gap fatal pada kompetensi utama $\implies$ **NOT RECOMMENDED (Tidak Lolos)**.

#### 6. Swimlane 6: Laporan & Coaching Dashboard (Lapisan Output & Pembinaan)
* **Task 6.1:** Merender visualisasi *Radar Chart* 7 Kompetensi Spencer (membandingkan capaian kandidat vs standar profil posisi IT).
* **Task 6.2:** Menampilkan grafik batang 4 dimensi FACT (*Feeling, Action, Context, Thinking*) dan menetapkan profil komunikasi (*Candidate Archetype*).
* **Task 6.3:** Menyajikan *Actionable Hacks*, saran perbaikan jawaban konkret, dan membuka modul bimbingan interaktif suara (*Voice Career Coach*) untuk latihan ulang.
* **End Event:** Sesi evaluasi selesai dan tersimpan ke riwayat pengguna.

---

## BAB III: FORMULA MATEMATIS & BUKTI PERHITUNGAN AUDIT

### 3.1 Vektor Bobot Posisi IT ($w_i$)
Berdasarkan data 27 lowongan aktif JobStreet Indonesia (file `MATRIKS_KOMPETENSI_IT_JOBSTREET_BU_RINA.xlsx`), pembobotan disesuaikan secara proporsional per jabatan:

| Posisi IT | EXP | AT | CT | ACH | CO | TW | INT | Syarat Normalisasi |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Programmer / Software Developer** | 20% | **25%** | 15% | 10% | 15% | 10% | 5% | $\sum w_i = 100\%$ |
| **UI/UX Designer** | 20% | 15% | **20%** | 10% | 15% | 15% | 5% | $\sum w_i = 100\%$ |
| **Quality Assurance (QA) Tester** | 20% | 20% | 10% | 10% | **25%** | 10% | 5% | $\sum w_i = 100\%$ |
| **Data Engineer / Analyst** | 20% | **25%** | 15% | 10% | 15% | 10% | 5% | $\sum w_i = 100\%$ |

---

### 3.2 Persamaan Matematika Penentuan Skor

1. **Skor Pemenuhan Dasar ($S_{\text{base}, i}$):**
   $$S_{\text{base}, i} = \min \left( 100, \, \left( \frac{L_{\text{actual}, i}}{L_{\text{target}, i}} \right) \times 80 \right)$$
   *Baseline:* Kandidat yang memenuhi tepat target minimal ($L_{\text{actual}} = L_{\text{target}}$) memperoleh nilai baku 80 (Kategori Kompeten). Nilai 100 hanya dapat diraih jika kandidat melampaui target.

2. **Faktor Pengali Integritas Bukti FACT ($\mu_{\text{FACT}, i}$):**
   $$\text{FACT}_{\text{norm}, i} = \frac{F + A + C + T}{40} \quad \implies \quad \mu_{\text{FACT}, i} = 0.85 + (0.30 \times \text{FACT}_{\text{norm}, i})$$
   Rentang pengali berada pada interval ketat $0.85 \le \mu_{\text{FACT}} \le 1.15$. Narasi yang sangat otentik memberi bonus hingga +15%, sedangkan narasi yang abstrak/fiktif memotong skor hingga -15%.

3. **Skor Final Satuan Kompetensi ($S_i$):**
   $$S_i = \min(100, \, S_{\text{base}, i} \times \mu_{\text{FACT}, i})$$

4. **Kalkulasi Skor Komposit Akhir (*Overall Score*):**
   $$\text{Skor Akhir} = \sum_{i=1}^{7} (w_i \times S_i)$$

---

### 3.3 Bukti Audit Perhitungan Kasus Nyata (Programmer)

* **Data Masukan:**
  * Target Posisi: Fullstack Programmer
  * Bobot Posisi: $\mathbf{W} = [0.20, 0.25, 0.15, 0.10, 0.15, 0.10, 0.05]$

* **Tabel Audit Perhitungan Per Kompetensi:**
  | Kompetensi | $L_{\text{target}}$ | $L_{\text{actual}}$ | $S_{\text{base}}$ | Skor FACT (/40) | $\mu_{\text{FACT}}$ | Skor Satuan $S_i$ | Bobot $w_i$ | Kontribusi Nilai |
  |:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
  | **EXP** | 3 | 4 | 100.0 | 34.5 | 1.108 | **100.0** | 20% | 20.00 |
  | **AT** | 4 | 4 | 80.0 | 36.0 | 1.120 | **89.6** | 25% | 22.40 |
  | **CT** | 3 | 3 | 80.0 | 33.0 | 1.097 | **87.8** | 15% | 13.17 |
  | **ACH** | 3 | 3 | 80.0 | 34.5 | 1.108 | **88.6** | 10% | 8.86 |
  | **CO** | 3 | 4 | 100.0 | 35.0 | 1.112 | **100.0** | 15% | 15.00 |
  | **TW** | 3 | 3 | 80.0 | 34.5 | 1.108 | **88.6** | 10% | 8.86 |
  | **INT** | 2 | 3 | 100.0 | 34.0 | 1.105 | **100.0** | 5% | 5.00 |
  | **TOTAL** | — | — | — | — | — | — | **100%** | **93.29** |

* **Hasil Akhir:** $\mathbf{93 / 100}$ (Dibulatkan).
* **Evaluasi Ambang Batas:** $93.29 \ge 75$ dan seluruh target kompetensi inti tercapai $\implies \mathbf{RECOMMENDED}$.

---

## BAB IV: PANDUAN MEMBUKA & MENGEDIT FILE DRAW.IO

File visual BPMN telah disimpan dalam format standar XML Draw.io:
* **Nama Berkas:** `BPMN_PROSES_EVALUASI_INTERVU.drawio`
* **Lokasi:** Direktori root proyek `d:\intervyou edit bu rina\INTERV-U\BPMN_PROSES_EVALUASI_INTERVU.drawio`

### Cara Membuka / Menampilkan di Draw.io:
1. Buka peramban (*browser*) dan kunjungi situs resmi: **[https://app.diagrams.net/](https://app.diagrams.net/)**.
2. Pilih opsi **"Open Existing Diagram"** (Buka Diagram yang Ada).
3. Pilih dan unggah file `BPMN_PROSES_EVALUASI_INTERVU.drawio` dari komputer Anda (atau cukup seret/*drag-and-drop* file tersebut langsung ke layar browser).
4. Diagram akan terbuka secara utuh dengan tata letak profesional, warna korporat modern, 6 swimlane rapi, dan panah koneksi ortogonal yang siap diekspor menjadi format gambar **PNG / SVG / PDF** untuk disisipkan langsung ke dalam Bab III naskah skripsi Anda.

---

## BAB V: KESIMPULAN

Dokumen dan file BPMN ini memberikan bukti tak terbantahkan bagi dosen pembimbing dan penguji bahwa:
1. **Sistem Terstruktur & Transparan:** Seluruh proses memiliki pemisahan peran yang jelas antara antarmuka, model percakapan suara, ekstraktor bukti kualitatif, dan mesin kalkulasi skor.
2. **Bebas Halusinasi Stokastik:** Skor tidak pernah dihasilkan secara tebakan bebas oleh Gemini, melainkan dihitung melalui persamaan matematika terbobot deterministik.
3. **Traceability Penuh:** Angka akhir dapat diaudit kembali hingga ke kata-kata riil yang diucapkan kandidat pada transkrip wawancara.
