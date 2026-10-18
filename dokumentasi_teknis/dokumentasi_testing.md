# DOKUMENTASI PENGUJIAN SISTEM (TESTING DOCUMENTATION)
## HASIL PENGUJIAN SIMULASI WAWANCARA INTERV-U (GAMBAR 5)

---

## 1. METODE PENGUJIAN YANG DIGUNAKAN

Pengujian yang dilakukan untuk menghasilkan grafik pada **Gambar 5** menggunakan **1 metode pengujian utama**:

> **Pengujian Simulasi Skenario (*Scenario-Based Simulation Testing*) dengan Evaluasi *LLM-as-a-Judge***

### Penjelasan Metode:
Pengujian ini dilakukan dengan menjalankan **1 skenario simulasi wawancara kerja secara penuh (*end-to-end*)**:
1. **Input Data Riil**: Penguji mengunggah berkas CV kandidat dan memasukkan teks Job Description (JD) posisi IT (Frontend / Software Engineer).
2. **Sesi Wawancara Suara (*Live Voice-to-Voice*)**: Penguji berperan sebagai kandidat dan menjawab langsung 7 pertanyaan wawancara *Behavioral Event Interview* (BEI) yang diajukan oleh persona AI Siti Rahayu secara lisan.
3. **Penilaian Otomatis (*LLM-as-a-Judge*)**: Begitu sesi diakhiri, engine evaluasi sistem (`/api/evaluate`) membedah transkrip jawaban menggunakan:
   * **Kamus Kompetensi Spencer & Spencer (1993)**: Skala level perilaku 1–5.
   * **Instrumen Probing FACT**: Skala skor 1–10 untuk dimensi *Feeling, Action, Context, Thinking*.

Hasil kalkulasi dari sesi simulasi ini langsung divisualisasikan oleh sistem ke dalam dasbor laporan pada **Gambar 5**.

---

## 2. SKENARIO DAN PROSEDUR PENGUJIAN

* **Peran Uji**: Kandidat *Fresh Graduate* IT
* **Target Posisi**: Frontend / Web Developer
* **Pewawancara AI**: Siti Rahayu (Director of Talent Acquisition)
* **Format Wawancara**: *Behavioral Event Interview* (BEI) strictly pengalaman masa lalu (*"Ceritakan situasi saat..."*)
* **Jumlah Pertanyaan**: 7 pertanyaan substantif (sesuai pacing 15 menit)

### Alur Eksekusi Pengujian:
```
[1. Input CV & JD] ──> [2. Wawancara 7 Pertanyaan Suara] ──> [3. Evaluasi LLM-as-a-Judge] ──> [4. Output Grafik Gambar 5]
```

---

## 3. LOG PENGUJIAN: DATA TRANSKRIP & PENSKORAN (7 PERTANYAAN)

Berikut adalah rekaman riil 7 pertanyaan yang diajukan AI beserta skor evaluasi yang diberikan pada sesi pengujian:

| No | Fokus Kompetensi & Pertanyaan BEI Siti Rahayu | Bukti Jawaban Kandidat pada Sesi Uji | Feeling (F) | Action (A) | Context (C) | Thinking (T) | Capaian Spencer & Spencer |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| **Q1** | **EXP (Technical Expertise)**<br>*"Ceritakan situasi saat Anda membangun arsitektur antarmuka web kompleks dan bagaimana Anda mengelola state-nya?"* | Menceritakan implementasi Zustand dan React Query, memisahkan server cache vs client state untuk mencegah re-render berlebih. | 8.0 | 9.5 | 8.5 | 9.0 | **Level 4 / 5** |
| **Q2** | **AT (Analytical Thinking)**<br>*"Pernahkah Anda menghadapi bug kritis atau penurunan performa di sistem? Ceritakan bagaimana Anda membedah akar masalahnya?"* | Mendiagnosis memory leak menggunakan Chrome DevTools Heap Snapshot, melacak event listener tabel yang lupa di-cleanup. | 8.5 | 9.0 | 9.0 | 9.5 | **Level 4 / 5** |
| **Q3** | **CT (Conceptual Thinking)**<br>*"Bisa berikan contoh nyata ketika Anda harus menyederhanakan kode yang sangat rumit menjadi komponen modular?"* | Menerapkan pola Compound Component pada form generator agar mudah dipakai ulang tanpa merusak aliran data. | 8.0 | 8.5 | 8.0 | 8.5 | **Level 3 / 5** |
| **Q4** | **ACH (Achievement Orientation)**<br>*"Ceritakan pengalaman ketika Anda menetapkan target optimasi performa melebihi ekspektasi awal?"* | Berinisiatif menaikkan skor Google Lighthouse dari 68 ke 92 melalui lazy-loading gambar dan code-splitting bundle. | 8.5 | 9.0 | 8.5 | 8.5 | **Level 3 / 5** |
| **Q5** | **CO (Concern for Order & Quality)**<br>*"Bagaimana persisnya Anda memastikan kode Anda bebas galat dan memenuhi standar sebelum digabungkan ke branch utama?"* | Menulis unit test dengan Vitest, mengonfigurasi ESLint & Prettier pada Git pre-commit hook, dan memverifikasi edge cases. | 8.0 | 9.5 | 9.0 | 8.5 | **Level 4 / 5** |
| **Q6** | **TW (Teamwork & Cooperation)**<br>*"Ceritakan situasi nyata saat terjadi perbedaan pendapat teknis dengan rekan tim saat code review dan bagaimana Anda menyelesaikannya?"* | Mendiskusikan trade-off pendekatan rendering di tim secara objektif berbasis benchmark data tanpa memicu konflik personal. | 8.5 | 9.0 | 8.0 | 9.0 | **Level 3 / 5** |
| **Q7** | **INT (Initiative)**<br>*"Pernahkah Anda mengambil inisiatif teknis penting tanpa menunggu perintah atasan? Ceritakan peristiwa tersebut."* | Menginisiasi dokumentasi API dan pembuatan reusable UI kit kampus untuk memangkas waktu pengerjaan anggota tim lain. | 8.0 | 9.0 | 8.5 | 8.5 | **Level 3 / 5** |
| **TOTAL** | **Jumlah Skor dari 7 Pertanyaan** | **—** | **57.5** | **63.5** | **59.5** | **61.5** | — |

---

## 4. CARA MENDAPATKAN ANGKA PADA GAMBAR 5

### A. Perhitungan Grafik Kanan: Kedalaman Probing FACT (Skor /10)
Skor pada grafik batang vertikal diperoleh dari **nilai rata-rata masing-masing dimensi FACT dibagi 7 pertanyaan**:

1. **Feeling / Focus**:
   $$\text{Rata-rata} = \frac{57.5}{7} = 8.214 \longrightarrow \mathbf{8.2 / 10}$$
2. **Action**:
   $$\text{Rata-rata} = \frac{63.5}{7} = 9.071 \longrightarrow \mathbf{9.1 / 10}$$
3. **Context**:
   $$\text{Rata-rata} = \frac{59.5}{7} = 8.500 \longrightarrow \mathbf{8.5 / 10}$$
4. **Thinking**:
   $$\text{Rata-rata} = \frac{61.5}{7} = 8.785 \longrightarrow \mathbf{8.8 / 10}$$
* **Total Skor FACT**: $8.2 + 9.1 + 8.5 + 8.8 =$ **34.6 / 40**

> **Kesimpulan Grafik Kanan**: Angka **8.2, 9.1, 8.5, dan 8.8** pada Gambar 5 adalah murni hasil rata-rata matematis dari 7 jawaban kandidat saat diuji dengan kerangka FACT.

---

### B. Perhitungan Grafik Kiri: Capaian 7 Kompetensi Spencer & Spencer (Level 1–5)
Tingkat kemahiran pada grafik batang horizontal diperoleh dari **level tertinggi indikator perilaku yang berhasil dibuktikan kandidat** pada pertanyaan yang menguji kompetensi tersebut:

* **EXP (*Technical Expertise*)**: **Level 4 / 5** (Terbukti di Q1 — menguasai arsitektur state management mutakhir mandiri).
* **AT (*Analytical Thinking*)**: **Level 4 / 5** (Terbukti di Q2 — mampu membedah akar masalah memory leak secara sistemik).
* **CT (*Conceptual Thinking*)**: **Level 3 / 5** (Terbukti di Q3 — menerapkan pola desain modularitas standar industri).
* **ACH (*Achievement Orientation*)**: **Level 3 / 5** (Terbukti di Q4 — menetapkan target performa terukur skor Lighthouse 92).
* **CO (*Concern for Order*)**: **Level 4 / 5** (Terbukti di Q5 — menerapkan pengujian otomatis berlapis & pre-commit hook).
* **TW (*Teamwork*)**: **Level 3 / 5** (Terbukti di Q6 — menyelesaikan perbedaan pendapat teknis tim berbasis data).
* **INT (*Initiative*)**: **Level 3 / 5** (Terbukti di Q7 — proaktif membuat UI kit bersama tanpa menunggu instruksi).

> **Kesimpulan Grafik Kiri**: Balok biru pada Gambar 5 menunjukkan bahwa kandidat mencapai **Level 4** pada EXP, AT, dan CO, serta **Level 3** pada CT, ACH, TW, dan INT.

---

## 5. KESIMPULAN PENGUJIAN
Pengujian simulasi skenario tunggal secara penuh (*Scenario-Based End-to-End Simulation*) berhasil membuktikan bahwa:
1. Sistem INTERV-U dapat mengekstraksi data, memandu percakapan suara BEI 7 pertanyaan secara dinamis, dan mengevaluasi jawaban secara otomatis.
2. Seluruh angka yang tercantum pada **Gambar 5** merupakan data empiris yang dapat ditelusuri perhitungannya (*fully traceable*) dari transkrip sesi pengujian wawancara tersebut.
