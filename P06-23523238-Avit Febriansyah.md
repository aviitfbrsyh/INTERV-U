# LAPORAN TUGAS AKHIR — PERTEMUAN KE-6 (ASINKRON)
## Rekap PR Bimbingan & Hasil Pengerjaan Penelitian Skripsi

---

## IDENTITAS MAHASISWA

| | |
|:---|:---|
| **NIM** | 23523238 |
| **Nama Lengkap** | Avit Febriansyah |
| **Dosen Pembimbing** | Ibu Chanifah, M.Kom. (Bu Rina) |
| **Judul Skripsi** | Pengembangan Sistem Simulasi Wawancara Kerja Interaktif Menggunakan Multimodal Large Language Model Berbasis Kamus Kompetensi Spencer & Spencer (1993) |
| **Nama Sistem** | **INTERV-U** — AI Voice Interview Simulation |
| **Repository GitHub** | https://github.com/aviitfbrsyh/INTERV-U |
| **Tanggal Laporan** | 18 Oktober 2026 |

---

## DAFTAR PR DARI DOSEN PEMBIMBING (Rekap Lengkap)

Berikut adalah seluruh PR yang diberikan oleh Bu Rina pada sesi bimbingan terakhir beserta status pengerjaannya:

| No | Kode PR | Nama Tugas / PR | Status | Prioritas |
|:---:|:---:|:---|:---:|:---:|
| 1 | **PR-1** | Laporan Komparasi Kamus Kompetensi Spencer & Spencer: Versi Inggris vs Indonesia | SELESAI | Kritis |
| 2 | **PR-2** | Riset & Rekap Lowongan IT di JobStreet + Matriks Kompetensi Format Excel HRD | SELESAI | Kritis |
| 3 | **PR-3** | Mekanisme & Formula Deterministik Penskoran Kompetensi + Diagram BPMN | SELESAI | Kritis |
| 4 | **PR-4** | Kajian Literatur Ilmiah Teori STAR (Janz 1982, Byham 1974) & Instrumen Probing FACT | SELESAI | Kritis |
| 5 | **PR-5** | Tabel Komparasi Model Pertama (Lama) vs Model Kedua (Baru) — untuk Bab IV | SELESAI | Tinggi |
| 6 | **PR-6** | Protokol & Panduan Pengujian 3-4 Responden Rekan Mahasiswa IT | DALAM PROSES | Tinggi |

---

## PR-1: LAPORAN KOMPARASI KAMUS KOMPETENSI SPENCER & SPENCER (EN VS ID)

### Latar Belakang & Instruksi Bu Rina

Bu Rina menegaskan bahwa sistem INTERV-U wajib menggunakan kamus Spencer & Spencer edisi Inggris asli (1993) sebagai acuan tunggal. Peneliti diwajibkan melakukan komparasi ilmiah level demi level pada seluruh 20 kompetensi untuk membuktikan ada/tidaknya pergeseran makna.

### Berkas Hasil

- Laporan Lengkap (Markdown): bimbingan_bu_rina/Laporan Perbandingan Kamus Kompetensi Spencer & Spencer (EN vs ID).md

### Metode Komparasi

- Sumber EN: Competence at Work — Lyle M. Spencer & Signe M. Spencer; Wiley (1993). 398 halaman.
- Sumber ID: Terjemahan beredar, 36 halaman, penerjemah tidak tercantum.
- 20 kompetensi dibandingkan level demi level, per dimensi (A/B/C/D), dengan pencatatan nomor halaman kedua sumber.

### Angka Kunci Temuan

| Kategori | Jumlah |
|:---|:---:|
| Total kompetensi yang dibandingkan | 20 |
| Kompetensi setara penuh | 1 (INF) |
| Kompetensi setara dengan kekurangan minor | 7 |
| Kompetensi dengan perbedaan isi yang mengubah skor | 12 |
| Level negatif yang hilang di versi ID | 24 Level |
| Total temuan tercatat (T-01 sd T-24) | 24 Temuan |
| — Kritis (membalik makna / mengubah skor) | 8 |
| — Tinggi (salah terjemah pada level tertentu) | 5 |
| — Sedang (informasi hilang / tidak konsisten) | 8 |
| — Rendah (kosmetik / tambahan) | 3 |

### Temuan Paling Kritis

| Kode | Kompetensi | Masalah pada Versi ID | Dampak pada Sistem |
|:---:|:---:|:---|:---|
| T-01 (Kritis) | Teamwork & Cooperation (TW) | Level tertinggi ID = "menciptakan kompetisi" padahal EN = "menyelesaikan konflik antar kelompok dengan mediasi" | Skor kandidat yang demonstrasikan resolusi konflik keliru dinilai lebih rendah |
| T-02 (Kritis) | Conceptual Thinking (CT) | Level 2 duplikat identik dengan Level 1 di versi Indonesia | Seluruh kandidat Level 2 mendapat skor yang sama dengan Level 1 |
| T-03 (Tinggi) | Initiative (INT) | "Bekerja lembur" di EN = Level 2, di ID = Level 1 | Kandidat yang inisiatif kerja ekstra dinilai 1 level lebih rendah |

### Keputusan Akademik

Edisi Inggris Spencer & Spencer (1993) ditetapkan sebagai satu-satunya rujukan primer. Kamus yang tertanam dalam sistem (contexts/kamus-kompetensi-sp-sp.md) menggunakan terjemahan yang dikoreksi berdasarkan Lampiran A laporan ini.

---

## PR-2: RISET LOWONGAN IT JOBSTREET & MATRIKS KOMPETENSI FORMAT HRD

### Latar Belakang & Instruksi Bu Rina

Bu Rina meminta pembobotan kompetensi dalam sistem didukung data riset pasar kerja nyata — bukan asumsi bebas peneliti. Data harus membuktikan kompetensi apa yang paling banyak diminta industri IT.

### Berkas Hasil

- Laporan Data Mentah: bimbingan_bu_rina/Rekap_Lowongan_IT_JobStreet.md
- Instrumen Matriks Excel (Siap Diisi Bu Rina): bimbingan_bu_rina/MATRIKS_KOMPETENSI_IT_JOBSTREET_BU_RINA.xlsx

### Cakupan & Metodologi

- Sumber: id.jobstreet.com — Pengambilan data langsung 18 Oktober 2026
- Sebaran: Jakarta Raya & Yogyakarta (Sleman, Bantul, Kota Yogya) + posisi remote
- Skala pasar: 84 lowongan "programmer" di Sleman; 484 lowongan "python" fulltime di Jakarta
- Total posisi direkap: 27 lowongan aktif dari 4 kategori IT

### Sampel Lowongan (dari Total 27)

| Posisi | Perusahaan | Lokasi | Gaji/Bulan | Kompetensi Dominan |
|:---|:---|:---|:---:|:---|
| Fullstack Developer | PT Jasnita Telekomindo | Jakarta | — | EXP, AT |
| Backend Developer | PT Rockstar Sports School | Jakarta Barat | Rp10-15 jt | EXP, CT, TW |
| Software Engineer | HiThink Technology Indonesia | Jakarta Selatan | Rp12,2-15 jt | EXP, TW |
| Senior Front-End Engineer | PT Techdirect Indonesia | Jakarta | Rp9-12 jt | EXP, CO, AT |
| DevOps Engineer | PT Japfa Comfeed Indonesia | Jakarta Selatan | — | EXP, ACH, CT |
| Senior Product Designer | HoLink | Jakarta Utara | Rp13-18 jt | CT, CO, TW |
| .Net Developer / Backend | PT Nawa Data Solutions | Yogyakarta | Rp8-9,5 jt | EXP, AT |

### Distribusi Bobot Kompetensi (Hasil Riset)

| Posisi IT | EXP | AT | CT | ACH | CO | TW | INT | Justifikasi |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| Programmer | 20% | 25% | 15% | 10% | 15% | 10% | 5% | Logika algoritma & debugging mendalam |
| UI/UX Designer | 20% | 15% | 20% | 10% | 15% | 15% | 5% | Abstraksi proses ke desain visual |
| QA Engineer | 20% | 20% | 10% | 10% | 25% | 10% | 5% | Ketelitian pengujian & zero-bug |
| Data Engineer | 20% | 25% | 15% | 10% | 15% | 10% | 5% | Bedah anomali data & efisiensi query |

### Struktur File Excel (4 Sheet)

| Sheet | Isi | Fungsi |
|:---|:---|:---|
| 1. Panduan Asesor | Instruksi cara pengisian & konteks penelitian | Panduan untuk Bu Rina |
| 2. Matriks Target & Bobot | Tabel kolom KUNING (Target Level 1-5 & Bobot %) | Diisi & Divalidasi Bu Rina |
| 3. Sampel Lowongan JobStreet | 27 data iklan aktif dari JobStreet | Database riset empiris |
| 4. Rujukan Kamus Spencer | 7 kompetensi inti + definisi Spencer (1993) | Rujukan scoring rubric |

---

## PR-3: MEKANISME FORMULA PENSKORAN DETERMINISTIK & DIAGRAM BPMN

### Latar Belakang & Instruksi Bu Rina

Bu Rina menegaskan: "Jangan percaya buta hasil parsing Gemini. Kamu harus tahu logika pemetaannya. Skala penilaian yang kamu buat sendiri perlu dasar atau justifikasi." Sistem harus memiliki formula matematika yang dapat diaudit dari bukti transkrip hingga angka akhir — bukan black-box LLM.

### Berkas Hasil

- Diagram BPMN (Buka di Draw.io): bimbingan_bu_rina/BPMN_PROSES_EVALUASI_INTERVU.drawio
  (URL: https://app.diagrams.net/ lalu File > Open from > Device)
- Laporan BPMN & Justifikasi: bimbingan_bu_rina/LAPORAN_PROSES_BISNIS_BPMN_DAN_PENSKORAN.md
- Spesifikasi Formula Lengkap: bimbingan_bu_rina/MEKANISME_DAN_FORMULA_PENSKORAN_KOMPETENSI.md

### Arsitektur BPMN — 6 Swimlane

Diagram BPMN menggambarkan seluruh proses bisnis INTERV-U end-to-end:

```
POOL: SISTEM SIMULASI WAWANCARA KERJA INTERV-U
|
|-- LANE 1: KANDIDAT / USER
|     Unggah CV (.pdf), Input JD, Menjawab via Mic, Candidate Q&A
|
|-- LANE 2: MODUL FRONTEND & AUDIO STREAM
|     /api/extract, Web Audio API (PCM 24kHz mono 16-bit), Transkripsi
|
|-- LANE 3: AI PEWAWANCARA — BU SITI RAHAYU
|     Cross-match CV vs JD, 7 Pertanyaan BEI (30 Menit), Probing FACT
|
|-- LANE 4: LLM-AS-A-JUDGE (Ekstraktor Bukti Kualitatif)
|     Deteksi STAR (0-4), Audit FACT (4-40), Level Spencer (1-5)
|
|-- LANE 5: MESIN SKOR DETERMINISTIK (Kode Backend — Bukan AI)
|     Formula S_base x mu_FACT x Bobot Posisi SAW => Skor Akhir
|
|-- LANE 6: LAPORAN & COACHING DASHBOARD
      Radar Chart Spencer, Dimensi FACT Bar, Career Coach TTS
```

### Formula Matematika Deterministik

Solusi: Constrained Hybrid Scoring — Gemini hanya mengekstraksi bukti kualitatif; kalkulasi angka dilakukan 100% oleh kode deterministik backend.

Landasan Teoretis (4 Pilar):
1. Behaviorally Anchored Rating Scales (BARS) — Spencer & Spencer (1993)
2. Simple Additive Weighting (SAW) — Keeney & Raiffa (1993)
3. FACT Verification Protocol — Byham & DDI (2003)
4. G-Eval Framework — Liu et al. (2023)

Step 1 — Skor Dasar Kompetensi:
S_base,i = min(100, (L_actual,i / L_target,i) x 80)

- Jika L_actual = L_target => skor dasar = 80 (Standar Kompeten)
- Jika L_actual > L_target => skor dasar dapat mencapai 100 (Superior)
- Jika L_actual < L_target => tereduksi proporsional

Step 2 — Faktor Pengali Integritas Narasi FACT:
FACT_norm = (Score_F + Score_A + Score_C + Score_T) / 40
mu_FACT = 0.85 + (0.30 x FACT_norm)
(Rentang: 0.85 <= mu <= 1.15)

Step 3 — Skor Final Kompetensi:
S_i = min(100, S_base,i x mu_FACT,i)

Step 4 — Agregasi Terbobot (Simple Additive Weighting):
Skor Akhir = SIGMA (w_i x S_i) untuk i = 1 sd 7

Step 5 — Aturan Keputusan Baku:
- RECOMMENDED  : Skor >= 75 DAN semua kompetensi inti >= L_target
- CONDITIONAL  : 60 <= Skor < 75 ATAU ada 1 gap minor non-core
- NOT RECOMMENDED: Skor < 60 ATAU gap >= 2 level pada kompetensi prioritas

### Simulasi Bukti Kalkulasi Riil (Programmer / Fullstack Developer)

| Kompetensi | Target | Capaian | FACT (/40) | Pengali mu | Skor Si | Bobot | Kontribusi |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| EXP | L3 | L4 | 34.5 | 1.108 | 100.0 | 20% | 20.00 |
| AT | L4 | L4 | 36.0 | 1.120 | 89.6 | 25% | 22.40 |
| CT | L3 | L3 | 33.0 | 1.097 | 87.8 | 15% | 13.17 |
| ACH | L3 | L3 | 34.5 | 1.108 | 88.6 | 10% | 8.86 |
| CO | L3 | L4 | 35.0 | 1.112 | 100.0 | 15% | 15.00 |
| TW | L3 | L3 | 34.5 | 1.108 | 88.6 | 10% | 8.86 |
| INT | L2 | L3 | 34.0 | 1.105 | 100.0 | 5% | 5.00 |
| | | | | | | TOTAL 100% | = 93.29 |

KEPUTUSAN: RECOMMENDED — karena skor 93.29 >= 75 dan semua kompetensi inti terpenuhi.
PENTING: Angka 93.29 ini TIDAK dihasilkan oleh Gemini. Gemini hanya mendeteksi Level Capaian & Skor FACT. Kalkulasi dilakukan oleh algoritma TypeScript yang auditabel.

---

## PR-4: KAJIAN LITERATUR ILMIAH TEORI STAR & INSTRUMEN PROBING FACT

### Latar Belakang & Instruksi Bu Rina

Bu Rina menegaskan: "Alasan industri sudah pakai STAR tidak cukup!" — sistem harus memiliki landasan pustaka primer dari jurnal bereputasi tinggi yang membuktikan validitas metode STAR secara ilmiah dan akademik.

### Berkas Hasil

- Kajian Literatur (untuk Bab II Skripsi): bimbingan_bu_rina/KAJIAN_LITERATUR_TEORI_STAR_DAN_FACT.md

### Kronologi Sejarah Ilmiah Metode STAR

| Tahun | Tokoh & Institusi | Kontribusi Ilmiah | Publikasi Primer |
|:---:|:---|:---|:---|
| 1968 | Wernimont & Campbell | Aksioma: perilaku masa lalu sebagai prediktor terbaik | Journal of Applied Psychology, 52(5) |
| 1973 | David McClelland | Landasan kompetensi kerja: "Testing for Competence" | American Psychologist, 28(1) |
| 1974 | Dr. William C. Byham (DDI) | Formulasi akronim STAR pertama via Targeted Selection | Targeted Selection. DDI Press. |
| 1982 | Dr. Tom Janz (Univ. Calgary) | Validasi empiris pertama BDI vs wawancara konvensional | Journal of Applied Psychology, 67(5) |
| 1986 | Janz, Hellervik & Gilmore | Buku teks definitif BDI, standar akademik global | Behavior Description Interviewing. Allyn & Bacon. |
| 1993 | Spencer & Spencer | Formulasi BEI + Kamus 20 Kompetensi terstruktur | Competence at Work. Wiley. |
| 1998 | Schmidt & Hunter | Meta-analisis 85 tahun validitas prediktif STAR | Psychological Bulletin, 124(2) |
| 2003 | Byham & DDI | Instrumen audit mendalam: FACT Probing Protocol | DDI Technical Report |

### Bukti Keunggulan Validitas (Schmidt & Hunter, 1998)

| Metode Wawancara | Koefisien Validitas | Keterangan |
|:---|:---:|:---|
| Wawancara Tidak Terstruktur | r = 0.38 | Baseline |
| Wawancara Perilaku Terstruktur (STAR/BDI) | r = 0.51 | +34% lebih akurat |

### Perbandingan SI vs BDI (Penting untuk Menjawab Penguji)

| Dimensi | Situational Interview (SI) | Behavioral Description Interview (STAR) |
|:---|:---|:---|
| Pencetus | Gary P. Latham (1980) | Byham (1974), Janz (1982) |
| Landasan Teori | Goal-Setting Theory | Behavioral Consistency Theory |
| Fokus Waktu | Masa Depan / Hipotesis | Masa Lalu / Peristiwa Nyata |
| Contoh Pertanyaan | "Apa yang AKAN Anda lakukan jika server down?" | "Ceritakan saat server Anda BENAR-BENAR down." |
| Kelemahan | Rentan jawaban hafalan (social desirability bias) | Menuntut rekam jejak pengalaman nyata |
| Posisi di INTERV-U | DILARANG KERAS | METODOLOGI WAJIB |

### Instrumen Probing FACT (4 Pilar Audit)

Total Skor FACT = Score_F + Score_A + Score_C + Score_T (Maks: 40 poin)

| Dimensi | Skor | Fungsi Audit | Contoh Pertanyaan Probing AI |
|:---|:---:|:---|:---|
| F — Feeling / Focus | 1-10 | Menguji keterlibatan emosional nyata saat krisis | "Apa yang menjadi fokus dan bagaimana Anda mengelola stres saat insiden?" |
| A — Action Specificity | 1-10 | Membedakan kontribusi pribadi vs klaim tim (freerider) | "Bagian mana persisnya yang Anda kerjakan sendiri, langkah demi langkah?" |
| C — Context & Consequence | 1-10 | Menguji pemahaman risiko bisnis & dampak fatal | "Apa dampak fatal jika bug tidak terselesaikan tepat waktu?" |
| T — Thinking & Reasoning | 1-10 | Menguji proses penalaran & pertimbangan trade-off | "Mengapa Anda memilih Zustand dibanding Redux? Trade-off apa yang dihadapi?" |

### Daftar Pustaka Baku APA 7th (Siap Salin ke Skripsi)

1. Byham, W. C. (1974). Targeted Selection: A behavior-based selection system. Pittsburgh, PA: DDI Press.
2. Campion, M. A., Palmer, D. K., & Campion, J. E. (1997). A review of structure in the selection interview. Personnel Psychology, 50(3), 655-702. https://doi.org/10.1111/j.1744-6570.1997.tb00709.x
3. Janz, T. (1982). Initial comparisons of patterned behavior-based interviews versus unstructured interviews. Journal of Applied Psychology, 67(5), 577-580. https://doi.org/10.1037/0021-9010.67.5.577
4. Janz, T., Hellervik, L., & Gilmore, D. C. (1986). Behavior description interviewing: New, accurate, cost effective. Boston: Allyn and Bacon.
5. McClelland, D. C. (1973). Testing for competence rather than intelligence. American Psychologist, 28(1), 1-14. https://doi.org/10.1037/h0034092
6. Schmidt, F. L., & Hunter, J. E. (1998). The validity and utility of selection methods in personnel psychology. Psychological Bulletin, 124(2), 262-274. https://doi.org/10.1037/0033-2909.124.2.262
7. Spencer, L. M., & Spencer, S. M. (1993). Competence at work: Models for superior performance. New York: Wiley.
8. Wernimont, P. F., & Campbell, J. P. (1968). Signs, samples, and criteria. Journal of Applied Psychology, 52(5), 372-376. https://doi.org/10.1037/h0026244

---

## PR-5: TABEL KOMPARASI MODEL LAMA VS MODEL BARU

### Latar Belakang & Instruksi Bu Rina

Untuk keperluan Bab IV Skripsi, peneliti diminta mendokumentasikan secara sistematis perbedaan antara sistem versi awal (sebelum bimbingan) dengan sistem setelah revisi pasca-bimbingan Bu Rina.

### Berkas Hasil

- File Komparasi Excel (4 Sheet): hasil_pengujian/PERBANDINGAN_MODEL_LAMA_VS_BARU.xlsx

### Tabel Komparasi Aspek Kunci (Sheet 1 — 49 Aspek)

| Aspek | Model Lama (INTERV-U-main) | Model Baru (INTERV-U edit bu rina) | Status |
|:---|:---|:---|:---:|
| Firebase | ^12.12.1 | ^12.19.0 (upgrade) | BARU |
| Framework STAR | Ada (skor 0-4) | Ada (skor 0-4) | SAMA |
| Framework FACT | TIDAK ADA | DITAMBAHKAN (4 dimensi, 1-10 per dimensi) | BARU KRITIS |
| Kamus Spencer 1993 | TIDAK ADA | DITAMBAHKAN (7 kompetensi, per QA) | BARU KRITIS |
| File Konteks Kamus | Tidak ada | contexts/kamus-kompetensi-sp-sp.md ada | BARU KRITIS |
| Persona AI Coach | Prompt generik | "Siti Rahayu — HRD Senior, 20 Tahun" | BARU KRITIS |
| Output Schema per QA | 8 required fields | 10 required fields (+fact, +competency) | BARU KRITIS |
| Output: competency_scores | TIDAK ADA | Ada — rekapitulasi 7 kompetensi Spencer | BARU KRITIS |
| Filler Words Analysis | Tidak ada di schema | Ada (lolos TC-UNIT-01 sd 06) | BARU |
| Durasi Sesi Interview | 15 Menit | 30 Menit (arahan Bu Rina) | BARU |

### Delta Perubahan Kode (10 Perubahan Terukur — Sheet 3)

| No | Komponen | Tipe | Detail |
|:---:|:---|:---:|:---|
| 1 | FACT Framework | Fitur Baru | Ditambahkan ke /api/evaluate. 4 dimensi bar chart muncul di dashboard. |
| 2 | Spencer & Spencer per QA | Fitur Baru | Field competency (code, name, level_achieved, level_target) per QA. |
| 3 | contexts/kamus-kompetensi-sp-sp.md | File Baru | File konteks kamus Spencer diinjeksi ke prompt AI. |
| 4 | Persona Coaching "Siti Rahayu" | Peningkatan | System prompt coaching diperkaya dengan persona HRD senior bernama. |
| 5 | lib/evaluate.ts | Perluasan | 70 => 92 baris (+22 baris, +31%). |
| 6 | app/api/evaluate/route.ts | Perluasan | 212 => 250 baris (+38 baris, +18%). |
| 7 | components/InterviewEvaluation.tsx | Perluasan | 2.129 => 2.371 baris (+242 baris, +11%). |
| 8 | components/LiveInterview.tsx | Refactoring | 1.473 => 1.066 baris (-407 baris, -28%). |
| 9 | Firebase | Upgrade | ^12.12.1 => ^12.19.0 |
| 10 | Required Fields /api/evaluate | Perluasan Schema | Lama: 8 fields => Baru: 10 fields (+fact, +competency). |

### Hasil Pengujian Sistem Model Baru (24 Test Case — Sheet 2)

| Lapisan Pengujian | Total TC | Lulus | Status |
|:---|:---:|:---:|:---:|
| Unit & Algorithmic Testing | 10 | 10 | 100% Lulus |
| Black-Box API Testing | 10 | 10 | 100% Lulus |
| End-to-End Testing (Playwright) | 4 | 4 | 100% Lulus |
| TOTAL | 24 | 24 | 100% Lulus |

Contoh Test Case Kunci:
- TC-API-06: /api/evaluate => Overall 92/100, Archetype "The Star Performer", STAR avg 4.0/4, FACT avg 36.0/40 [LULUS]
- TC-UNIT-01 sd 06: Validasi fungsi analyzeFiller() di lib/evaluate.ts [LULUS SEMUA]
- TC-E2E-01 sd 04: Halaman UI berhasil di-render & dioperasikan Playwright [LULUS SEMUA]

---

## PR-6: PROTOKOL PENGUJIAN 3-4 RESPONDEN REKAN IT (PANDUAN SIAP — PELAKSANAAN MENYUSUL)

### Latar Belakang & Instruksi Bu Rina

Bu Rina mengingatkan bahwa peneliti harus mengajak 3-4 rekan mahasiswa IT untuk mencoba sistem secara nyata guna menghindari Researcher Bias — bias akibat peneliti yang menguji sistemnya sendiri saja.

### Berkas Panduan

- Panduan & Protokol Lengkap: bimbingan_bu_rina/PANDUAN_DAN_PROTOKOL_PENGUJIAN_RESPONDEN_IT.md

### Distribusi 4 Responden IT (Rencana)

| Kode | Peran IT Target | Kompetensi Spencer yang Diuji | Status |
|:---:|:---|:---|:---:|
| R-01 | Frontend / Web Developer | Technical Expertise (EXP), Analytical Thinking (AT) | Dijadwalkan |
| R-02 | Backend / DevOps Engineer | Conceptual Thinking (CT), Achievement Orientation (ACH) | Dijadwalkan |
| R-03 | QA / Automation Tester | Analytical Thinking (AT), Initiative (INT) | Dijadwalkan |
| R-04 | UI/UX Designer | Customer Service Orientation (CO), Teamwork (TW) | Dijadwalkan |

### SOP Pengujian (6 Tahap, kurang lebih 35 Menit per Responden)

1. Tahap 1 (3 Menit): Responden unggah CV asli + input teks JD target
2. Tahap 2 (2 Menit): Kalibrasi izin mikrofon & uji Web Audio API
3. Tahap 3 (30 Menit): Sesi wawancara suara live bersama Bu Siti Rahayu (7 kompetensi BEI + probing FACT)
4. Tahap 4 (3 Menit): Review dan verifikasi dashboard evaluasi (STAR, FACT, Level Spencer)
5. Tahap 5 (3 Menit): Interaksi sesi bimbingan karir dengan AI Coach Siti Rahayu (TTS audio)
6. Tahap 6 (5 Menit): Pengisian lembar observasi & umpan balik kualitatif

### Bukti yang Akan Dikumpulkan

- 4 berkas CV anonim/asli responden (.pdf)
- 4 tangkapan layar dashboard evaluasi masing-masing responden
- 4 rekaman video/audio sesi simulasi
- Lembar observasi audit STAR/FACT/Spencer yang diisi bersama responden

Catatan: Pelaksanaan pengujian fisik dengan responden dijadwalkan setelah tugas pertemuan ke-6 dikumpulkan. Hasil pengujian akan dilaporkan pada pertemuan ke-7.

---

## RINGKASAN NAVIGASI BERKAS SELURUH PR

| No | Berkas | Format | Folder | Status |
|:---:|:---|:---:|:---|:---:|
| 1 | Laporan Perbandingan Kamus Spencer EN vs ID | .md | bimbingan_bu_rina/ | Selesai |
| 2 | Rekap Lowongan IT JobStreet | .md | bimbingan_bu_rina/ | Selesai |
| 3 | Matriks Kompetensi IT JobStreet Excel | .xlsx | bimbingan_bu_rina/ | Selesai |
| 4 | Diagram BPMN 6 Swimlane | .drawio | bimbingan_bu_rina/ | Selesai |
| 5 | Laporan Proses Bisnis BPMN & Penskoran | .md | bimbingan_bu_rina/ | Selesai |
| 6 | Mekanisme & Formula Penskoran Kompetensi | .md | bimbingan_bu_rina/ | Selesai |
| 7 | Kajian Literatur Teori STAR & FACT | .md | bimbingan_bu_rina/ | Selesai |
| 8 | Perbandingan Model Lama vs Baru | .xlsx | hasil_pengujian/ | Selesai |
| 9 | Panduan Protokol Pengujian Responden IT | .md | bimbingan_bu_rina/ | Panduan siap, eksekusi menyusul |
| 10 | Index Navigasi Berkas Project | .md | Root | Selesai |

---

## PROGRESS IMPLEMENTASI SISTEM (Deployed ke Vercel)

| Komponen | Perubahan | Commit |
|:---|:---|:---|
| components/LiveInterview.tsx | Durasi dikunci 30 menit; urutan EXP-AT-CT-ACH-CO-TW-INT; closing 3-step + Candidate Q&A | 89e05a2 |
| components/InterviewSetup.tsx | Mode dikunci satu mode (Bu Siti Rahayu); badge durasi diupdate 30 menit | 89e05a2 |
| Build Validation | next build selesai tanpa error (compiled 71s, 0 TypeScript errors) | 1b43596 |
| Deploy | Otomatis live di Vercel setelah push ke origin/main | — |

---

Laporan ini disusun sebagai pemenuhan tugas asinkron Pertemuan ke-6 Mata Kuliah Tugas Akhir.
Repository GitHub: https://github.com/aviitfbrsyh/INTERV-U
