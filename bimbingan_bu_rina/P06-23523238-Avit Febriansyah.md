# LAPORAN PERKEMBANGAN PENELITIAN TUGAS AKHIR
## Pertemuan ke-6 (Asinkron) — Rekapitulasi & Hasil Pengerjaan Seluruh PR Bimbingan Dosen
**Format Pengumpulan Tugas & Presensi:** `P06-23523238-Avit Febriansyah`

---

> **IDENTITAS MAHASISWA & PENELITIAN**  
> * **NIM:** 23523238  
> * **Nama:** Avit Febriansyah  
> * **Topik / Judul Skripsi:** RANCANG BANGUN SISTEM SIMULASI KERJA VOICE-TO-VOICE BERBASIS PEMETAAN KOMPETENSI SPENCER & SPENCER DENGAN EVALUASI LLM-AS-A-JUDGE  
> * **Dosen Pengampu / Pembimbing:** Ibu Chanifah, M.Kom. (Bu Rina)  
> * **Mata Kuliah:** Tugas Akhir (Pertemuan ke-6 — Perkuliahan Asinkron)  
> * **Program Studi:** Informatika – Program Sarjana, Fakultas Teknologi Industri, Universitas Islam Indonesia  
> * **Status Tugas:** Laporan Resmi Rekap PR Bimbingan & Bukti Presensi Pertemuan ke-6  

---

## BAGIAN I: REKAPITULASI DAFTAR PR BIMBINGAN PENELITIAN

Berikut adalah tabel rekapitulasi komprehensif seluruh arahan perbaikan dan pekerjaan rumah (PR) yang diberikan oleh Dosen Pembimbing (Ibu Chanifah, M.Kom.) beserta dokumen bukti hasilnya:

| No | Rincian Tugas / PR Bimbingan Dosen | Kebutuhan & Catatan Khusus Dosen | Dokumen Hasil & Tautan Berkas | Status |
|:---:|:---|:---|:---|:---:|
| **PR 1** | **Evaluasi & Komparasi Kamus Kompetensi Spencer & Spencer (1993) Asli EN vs Terjemahan ID** | Dosen menegaskan: *"Jangan pakai kamus terjemahan bebas yang beredar di internet, harus dicek ke buku teks aslinya karena rawan pergeseran makna (semantic shift)!"* | [`bimbingan_bu_rina/Laporan Perbandingan Kamus Kompetensi Spencer & Spencer (EN vs ID).md`](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/bimbingan_bu_rina/Laporan%20Perbandingan%20Kamus%20Kompetensi%20Spencer%20&%20Spencer%20%28EN%20vs%20ID%29.md) | **SELESAI 100%**<br>*(24 Temuan Kritis Diidentifikasi)* |
| **PR 2** | **Riset Empiris Kebutuhan Kompetensi Kerja IT (JobStreet) & Matriks Standar HRD** | Dosen meminta: *"Penetapan target level dan persentase bobot tidak boleh mengarang bebas. Harus ada bukti empiris kebutuhan riil industri pasar kerja IT!"* | [`bimbingan_bu_rina/MATRIKS_KOMPETENSI_IT_JOBSTREET_BU_RINA.xlsx`](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/bimbingan_bu_rina/MATRIKS_KOMPETENSI_IT_JOBSTREET_BU_RINA.xlsx) & [`bimbingan_bu_rina/Rekap_Lowongan_IT_JobStreet.md`](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/bimbingan_bu_rina/Rekap_Lowongan_IT_JobStreet.md) | **SELESAI 100%**<br>*(4 Sheet HRD + Validasi `=SUM()`)* |
| **PR 3** | **Perancangan Arsitektur Evaluasi BPMN 6 Swimlane & Formula Penskoran Deterministik** | Dosen meminta: *"Buatkan alur proses evaluasinya dalam BPMN (bisa dibuka di Draw.io) dan rumus perhitungan matematisnya agar LLM tidak halusinasi mengarang nilai!"* | [`bimbingan_bu_rina/BPMN_PROSES_EVALUASI_INTERVU.drawio`](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/bimbingan_bu_rina/BPMN_PROSES_EVALUASI_INTERVU.drawio) & [`bimbingan_bu_rina/MEKANISME_DAN_FORMULA_PENSKORAN_KOMPETENSI.md`](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/bimbingan_bu_rina/MEKANISME_DAN_FORMULA_PENSKORAN_KOMPETENSI.md) | **SELESAI 100%**<br>*(BPMN XML + Pembuktian Skor 93)* |
| **PR 4** | **Kajian Literatur Teori STAR (Janz 1982, Byham 1974) & Instrumen Probing FACT** | Dosen menegaskan: *"Alasan industri sudah pakai STAR itu tidak cukup! Lacak asal-usul ilmiahnya, jurnal primernya, dan instrumen validasinya untuk Bab II skripsi!"* | [`bimbingan_bu_rina/KAJIAN_LITERATUR_TEORI_STAR_DAN_FACT.md`](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/bimbingan_bu_rina/KAJIAN_LITERATUR_TEORI_STAR_DAN_FACT.md) | **SELESAI 100%**<br>*(Validitas $r=0.51$ vs $0.38$, APA 7th)* |
| **PR 5** | **Tabel Komparasi Model Lama (Baseline) vs Model Baru (Multi-Framework)** | Dosen meminta bukti konkret lompatan kualitas antara model awal prototipe dengan model sistem baru pasca-bimbingan untuk dicantumkan di Bab IV skripsi. | [`hasil_pengujian/PERBANDINGAN_MODEL_LAMA_VS_BARU.xlsx`](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/hasil_pengujian/PERBANDINGAN_MODEL_LAMA_VS_BARU.xlsx) | **SELESAI 100%**<br>*(49 Aspek, 10 Fitur Baru Terdata)* |
| **PR 6** | **Protokol & Panduan Pengujian 3–4 Responden Teman IT (Mitigasi Researcher Bias)** | Dosen mengarahkan: *"Jangan cuma peneliti sendiri yang ngetes (bias peneliti). Siapkan panduan agar 3-4 rekan mahasiswa IT mencoba wawancara live suara 30 menit!"* | [`bimbingan_bu_rina/PANDUAN_DAN_PROTOKOL_PENGUJIAN_RESPONDEN_IT.md`](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/bimbingan_bu_rina/PANDUAN_DAN_PROTOKOL_PENGUJIAN_RESPONDEN_IT.md) | **SELESAI 100%**<br>*(SOP 6 Langkah + Lembar Audit)* |
| **PR 7** | **Penyesuaian Sistem & Implementasi Kode INTERV-U (Web App)** | Implementasi durasi 30 menit, mode tunggal persona Bu Siti Rahayu, alur urutan 7 kompetensi BEI murni, dan sesi closing 3-step tanya-jawab kandidat. | [Live Interview Component](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/components/LiveInterview.tsx) & [Aplikasi Live Vercel](https://interv-u.vercel.app) | **SELESAI 100%**<br>*(Terkirim ke GitHub `main` & Vercel)* |

---

## BAGIAN II: HASIL PEKERJAAN SETIAP PR BESERTA PENJELASANNYA

### 1. PR 1: Kajian Komparasi Kamus Kompetensi Spencer & Spencer (EN vs ID)
* **Kebutuhan Akademik:**  
  Dosen Pembimbing mengingatkan bahwa penggunaan terjemahan kamus kompetensi Spencer & Spencer yang beredar luas di Indonesia rawan mengalami distorsi makna ilmiah (*semantic shift*).
* **Metode & Pelaksanaan:**  
  Peneliti menelaah kata demi kata dan level demi level pada seluruh **20 kamus kompetensi** antara buku teks primer edisi Bahasa Inggris (*Spencer & Spencer, 1993, "Competence at Work: Models for Superior Performance", John Wiley & Sons*) dengan edisi terjemahan Bahasa Indonesia.
* **Temuan Kritis Ilmiah (24 Temuan / T-01 s/d T-24):**  
  1. **Kesalahan Fatal Terjemahan *Teamwork* (TW) Level 7:**  
     * *Versi Terjemahan ID:* Menuliskan *"menciptakan kompetisi dalam kelompok"*.  
     * *Versi Asli Inggris 1993 (hal. 73):* Berbunyi *"Resolves conflicts: faces up to conflict and resolves it"*.  
     * *Dampak:* Terjemahan bahasa Indonesia berlawanan **180 derajat** dengan prinsip psikologi organisasi yang seharusnya menyelesaikan konflik, bukan menciptakan permusuhan/kompetisi di dalam tim.
  2. **Duplikasi Fatal *Conceptual Thinking* (CT) Level 2:**  
     * Terjemahan bahasa Indonesia menduplikasi teks sehingga transisi pemikiran induktif kandidat tidak terbaca oleh AI.
  3. **Penghilangan Level Negatif (-1 dan 0):**  
     * Terjemahan lokal menghapus level minus, padahal skala negatif dalam *Behavioral Event Interview* (BEI) sangat vital untuk mendeteksi perilaku kontraproduktif pelamar.
* **Keputusan Implementasi Sistem:**  
  Sistem INTERV-U secara resmi menetapkan **definisi bahasa Inggris 1993 sebagai acuan utama sistem prompt AI**, dengan terjemahan operasional bahasa Indonesia yang telah dikoreksi total (Lampiran A laporan).
* **Tautan Berkas:** [`bimbingan_bu_rina/Laporan Perbandingan Kamus Kompetensi Spencer & Spencer (EN vs ID).md`](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/bimbingan_bu_rina/Laporan%20Perbandingan%20Kamus%20Kompetensi%20Spencer%20&%20Spencer%20%28EN%20vs%20ID%29.md)

---

### 2. PR 2: Riset Empiris 27 Loker IT JobStreet & Matriks HRD Terbobot
* **Kebutuhan Akademik:**  
  Menjawab instruksi dosen bahwa target level (1–5) dan persentase bobot tiap kompetensi harus memiliki justifikasi berbasis bukti (*evidence-based*) dari pasar kerja IT nyata di Indonesia.
* **Metode & Pelaksanaan:**  
  Peneliti menghimpun dan menganalisis **27 lowongan kerja IT aktif** di portal JobStreet (wilayah Jakarta & Daerah Istimewa Yogyakarta) untuk 4 rumpun profesi: *Software Engineer/Programmer*, *UI/UX Designer*, *QA Tester*, dan *Data Analyst*.
* **Hasil Sintesis 7 Kompetensi Inti IT (Target Level & Bobot Standar HRD):**

| Kode | Nama Kompetensi (Spencer 1993) | Target Level | Bobot % | Justifikasi Lapangan Berdasarkan 27 Loker JobStreet |
|:---:|:---|:---:|:---:|:---|
| **EXP** | *Technical / Professional Expertise* | **Level 4** | **25 %** | Penguasaan mendalam tech-stack modern (React, Next.js, Node.js, TypeScript, REST/GraphQL) mutlak dipersyaratkan. |
| **AT** | *Analytical Thinking* | **Level 3** | **15 %** | Kemampuan memecah masalah kompleks, debugging sistematis, dan pemahaman algoritma. |
| **CT** | *Conceptual Thinking* | **Level 3** | **10 %** | Kemampuan sintesis pola arsitektur perangkat lunak, optimasi database, dan design patterns. |
| **ACH** | *Achievement Orientation* | **Level 3** | **15 %** | Dorongan mencapai standar kualitas tinggi, kepatuhan sprint deadline, dan efisiensi waktu kerja. |
| **CO** | *Concern for Order, Quality, Accuracy* | **Level 4** | **15 %** | Disiplin *clean code*, dokumentasi API terstruktur, serta penulisan *unit testing* ketat. |
| **TW** | *Teamwork and Cooperation* | **Level 3** | **10 %** | Kemampuan kolaborasi aktif lintas fungsi (bersama UI/UX, Product Owner, QA, dan DevOps). |
| **INT** | *Initiative* | **Level 3** | **10 %** | Tindakan proaktif mengantisipasi *technical debt* dan mengusulkan solusi otomasi workflow. |
| **TOTAL** | **Validasi Konsistensi HRD** | - | **100 %** | **Tervalidasi Rumus Excel: `=SUM(D2:D8) = 100%`** |

* **Tangkapan Layar Bukti Excel:**
  ![Matriks Kompetensi JobStreet](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/bimbingan_bu_rina/ss_matriks_jobstreet_excel.png)
* **Tautan Berkas:** [`bimbingan_bu_rina/MATRIKS_KOMPETENSI_IT_JOBSTREET_BU_RINA.xlsx`](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/bimbingan_bu_rina/MATRIKS_KOMPETENSI_IT_JOBSTREET_BU_RINA.xlsx) & [`bimbingan_bu_rina/Rekap_Lowongan_IT_JobStreet.md`](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/bimbingan_bu_rina/Rekap_Lowongan_IT_JobStreet.md)

---

### 3. PR 3: Arsitektur Evaluasi BPMN 6 Swimlane & Formula Penskoran Deterministik
* **Kebutuhan Akademik:**  
  Dosen Pembimbing menekankan larangan keras terhadap LLM yang mengarang angka skor secara bebas (*AI score hallucination*). Harus dibuktikan pemisahan tegas antara logika AI kualitatif dan kode matematis deterministik.
* **Hasil Perancangan Diagram BPMN 2.0 (6 Swimlane):**  
  File diagram XML formal telah dibuat dan dapat dibuka di aplikasi [app.diagrams.net](https://app.diagrams.net/). Membagi proses menjadi 6 swimlane:
  1. *User / Kandidat:* Unggah CV/JD $\to$ Dialog suara live 30 menit $\to$ Menerima Dashboard.
  2. *Frontend Audio Manager:* Web Audio API streaming audio PCM 24kHz Mono 16-bit.
  3. *AI Interviewer (Bu Siti Rahayu):* Pewawancara BEI 7 kompetensi dan penguji bukti FACT.
  4. *LLM-as-a-Judge (`/api/evaluate`):* **HANYA** mengekstrak bukti kualitatif (keberadaan elemen STAR 0–4, skor 4 pilar FACT 1–10, dan level Spencer 1–5). **Dilarang menghitung angka akhir.**
  5. *Deterministic Scoring Engine (`lib/evaluate.ts`):* Menghitung nilai secara matematis menggunakan Simple Additive Weighting (SAW).
  6. *Output & Dashboard:* Menampilkan grafik radar capaian dan rekomendasi personal.
* **Tangkapan Layar Diagram BPMN:**
  ![BPMN Arsitektur Evaluasi INTERV-U](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/bimbingan_bu_rina/ss_bpmn_arsitektur_intervu.png)
* **Rumus Matematis Baku Deterministik:**
  1. **Skor Rasio Pemenuhan Level ($S_{\text{base}, i}$):**
     $$S_{\text{base}, i} = \min\left(100, \frac{L_{\text{act}, i}}{L_{\text{tgt}, i}} \times 80\right)$$
  2. **Faktor Pengali Keaslian Bukti FACT ($\mu_{\text{FACT}, i}$):**
     $$\mu_{\text{FACT}, i} = 0.85 + \left(0.30 \times \frac{\text{FACT}_{\text{act}, i} - 4}{36}\right) \quad (\text{Rentang: } 0.85 \text{ s/d } 1.15)$$
  3. **Skor Akhir Terbobot (Simple Additive Weighting / SAW):**
     $$\text{Skor Akhir} = \sum_{i=1}^{7} \left(w_i \times S_{\text{final}, i}\right) \quad \text{di mana } S_{\text{final}, i} = S_{\text{base}, i} \times \mu_{\text{FACT}, i}$$
* **Pembuktian Audit Perhitungan Nyata:**  
  Dalam laporan metodologi dicantumkan simulasi nyata kandidat memperoleh **Skor Akhir 93/100** yang dibuktikan langkah demi langkah tanpa deviasi angka gaib.
* **Tautan Berkas:** [`bimbingan_bu_rina/BPMN_PROSES_EVALUASI_INTERVU.drawio`](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/bimbingan_bu_rina/BPMN_PROSES_EVALUASI_INTERVU.drawio), [`bimbingan_bu_rina/LAPORAN_PROSES_BISNIS_BPMN_DAN_PENSKORAN.md`](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/bimbingan_bu_rina/LAPORAN_PROSES_BISNIS_BPMN_DAN_PENSKORAN.md), dan [`bimbingan_bu_rina/MEKANISME_DAN_FORMULA_PENSKORAN_KOMPETENSI.md`](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/bimbingan_bu_rina/MEKANISME_DAN_FORMULA_PENSKORAN_KOMPETENSI.md)

---

### 4. PR 4: Kajian Literatur Teori STAR & Instrumen Probing FACT
* **Kebutuhan Akademik:**  
  Menjawab instruksi dosen: *"Alasan industri sudah pakai STAR tidak cukup!"*. Wajib melacak silsilah ilmiah, nama penemu, publikasi jurnal, dan pembuktian statistiknya.
* **Hasil Kajian Pustaka Akademik (Untuk Bab II Skripsi):**  
  1. **Aksioma Dasar Psikologi Perilaku (*Wernimont & Campbell, 1968*):**  
     $$\text{"The best predictor of future performance is past behavior in similar circumstances."}$$
  2. **Dr. William C. Byham (1974) — Pencetus Format STAR:**  
     Merumuskan akronim STAR dan sistem *Targeted Selection®* di *Development Dimensions International (DDI)* untuk memisahkan *Complete STAR* dari *False STAR* (jawaban abstrak/hipotesis).
  3. **Dr. Tom Janz (1982, 1986) — Peneliti Behavioral Description Interviewing (BDI):**  
     Mempublikasikan riset empiris di *Journal of Applied Psychology* (JAP, Vol. 67, No. 5) dan menerbitkan buku teks monumental *Behavior Description Interviewing* (Allyn & Bacon, 1986).
  4. **Meta-Analisis Schmidt & Hunter (1998, *Psychological Bulletin*):**  
     Membuktikan secara statistik pada data riset 85 tahun bahwa wawancara terstruktur berbasis perilaku (STAR/BDI) memiliki validitas prediktif **$r = 0.51$**, jauh mengungguli wawancara konvensional bebas yang hanya **$r = 0.38$** (34% lebih akurat).
  5. **Instrumen FACT Probing (*Byham, 2003; Spencer & Spencer, 1993*):**  
     Digunakan untuk membongkar kebohongan kandidat yang menghafal narasi (*scripted STAR*) dan membedakan aksi pribadi dari klaim tim (*freeriders*) melalui 4 pilar audit:
     * **F** (*Feeling/Focus*): Ketenangan emosional dan fokus kendali stres.
     * **A** (*Action Specificity*): Tindakan mandiri vs mendompleng tim.
     * **C** (*Context & Consequence*): Pemahaman arsitektur teknis dan risiko bisnis.
     * **T** (*Thinking & Reasoning*): Pertimbangan trade-off logis di balik keputusan teknis.
* **Tautan Berkas:** [`bimbingan_bu_rina/KAJIAN_LITERATUR_TEORI_STAR_DAN_FACT.md`](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/bimbingan_bu_rina/KAJIAN_LITERATUR_TEORI_STAR_DAN_FACT.md)

---

### 5. PR 5: Tabel Komparasi Model Lama (Baseline) vs Model Baru (Multi-Framework)
* **Kebutuhan Akademik:**  
  Menyajikan bukti komparasi kuantitatif dan kualitatif antara model awal sistem (sebelum bimbingan) dengan model hasil revisi bimbingan Bu Rina untuk Bab IV Skripsi.
* **Hasil Analisis Komparasi (Workbook Excel 4 Sheet):**  
  * **Sheet 1 (Ringkasan 49 Aspek Pembeda):**  
    * *Framework Evaluasi:* Model Lama hanya STAR (0–4) & ConCISE (1–10) $\to$ Model Baru menambahkan **FACT (1–10 per pilar)** dan **Kamus 7 Kompetensi Spencer & Spencer (1993)**.
    * *Persona Interviewer:* Model Lama prompt generik $\to$ Model Baru persona profesional baku **Bu Siti Rahayu (Asesor Senior BEI)**.
    * *Refactoring Kode:* `LiveInterview.tsx` direfaktor dari 1.473 baris menjadi 1.066 baris (-407 baris, eliminasi redundansi).
    * *Skema API Output:* Diperluas dari 8 field menjadi 10 field (+fact, +competency).
  * **Sheet 2 (Hasil Pengujian Dibandingkan):**  
    Membuktikan lulusnya 24 Test Case pengujian sistem: 10 Unit Test algoritma, 10 Black-Box API test, dan 4 E2E Playwright test.
  * **Sheet 3 (Delta Fitur):**  
    Daftar 10 penambahan fitur baru pasca-bimbingan.
  * **Sheet 4 (Kesimpulan Skripsi):**  
    Sintesis komparasi untuk bahan pemaparan sidang skripsi.
* **Tautan Berkas:** [`hasil_pengujian/PERBANDINGAN_MODEL_LAMA_VS_BARU.xlsx`](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/hasil_pengujian/PERBANDINGAN_MODEL_LAMA_VS_BARU.xlsx)

---

### 6. PR 6: Protokol & Panduan Pengujian 3–4 Responden Rekan IT (Peer Testing)
* **Kebutuhan Akademik:**  
  Menindaklanjuti instruksi dosen untuk menghilangkan *researcher bias* (bias peneliti) dengan menyelenggarakan pengujian kualitatif independen oleh 3–4 rekan mahasiswa IT sebelum survei TAM massal ($N=30$).
* **Hasil Perumusan Dokumen Protokol:**  
  1. **Landasan Metodologi HCI (Jakob Nielsen & Landauer, 1993):**  
     Pengujian terarah oleh 3–4 penguji ahli dengan variasi latar belakang teknis mampu menemukan **75% s/d 85% anomali interaksi** dan bias penilaian AI.
  2. **Distribusi Peran 4 Responden Rekan IT:**  
     * Responden 1 (Frontend Developer) $\to$ Menguji kompetensi EXP & AT.
     * Responden 2 (Backend / DevOps) $\to$ Menguji kompetensi CT & ACH.
     * Responden 3 (QA Automation Tester) $\to$ Menguji kompetensi AT & INT.
     * Responden 4 (UI/UX Designer) $\to$ Menguji kompetensi CO & TW.
  3. **Standar Operasional Prosedur (SOP) 6 Tahap (35 Menit):**  
     Setup berkas CV/JD $\to$ Kalibrasi audio $\to$ Wawancara suara 30 menit (Bu Siti Rahayu) $\to$ Review Dashboard evaluasi $\to$ Interaksi Coaching TTS $\to$ Pengisian log audit.
  4. **Lembar Log Observasi & Kuesioner Terbuka:**  
     Format audit verifikasi apakah deteksi STAR, skor FACT, dan capaian level Spencer (1–5) yang diberikan AI sesuai dengan pengalaman riil mereka.
* **Tautan Berkas:** [`bimbingan_bu_rina/PANDUAN_DAN_PROTOKOL_PENGUJIAN_RESPONDEN_IT.md`](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/bimbingan_bu_rina/PANDUAN_DAN_PROTOKOL_PENGUJIAN_RESPONDEN_IT.md)

---

### 7. PR 7: Implementasi Teknis & Penyesuaian Sistem INTERV-U
* **Kebutuhan Akademik:**  
  Mewujudkan seluruh arahan bimbingan ke dalam kode aplikasi web nyata yang dapat langsung dioperasikan.
* **Hasil Implementasi Kode:**  
  1. **Durasi Wawancara 30 Menit:** Komponen [`LiveInterview.tsx`](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/components/LiveInterview.tsx) disetel dengan pacing mendalam 30 menit untuk melatih ketahanan wawancara kerja profesional.
  2. **Mode Tunggal Persona Bu Siti Rahayu:** Komponen [`InterviewSetup.tsx`](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/components/InterviewSetup.tsx) dikunci ke mode tunggal Asesor Senior BEI, menonaktifkan mode artifisial (supportive & high pressure).
  3. **Alur 7 Pertanyaan BEI Terstandar:** Prompt sistem Gemini Live mewajibkan pertanyaan perilaku masa lalu berurutan (EXP, AT, CT, ACH, CO, TW, INT) dengan larangan mutlak pertanyaan teknis teoritis dan pertanyaan hipotetis masa depan.
  4. **Sesi Penutup 3-Tahap (Closing Q&A):** Memberikan ruang bagi kandidat di akhir wawancara untuk mengajukan pertanyaan balik kepada pewawancara mengenai kultur tim dan tantangan engineering.
  5. **Status Build & Deploy:** Aplikasi telah dikompilasi sukses tanpa error (Next.js 15.4.9) dan ter-deploy secara otomatis di platform Vercel:  
     🌐 **URL Sistem Live:** [https://interv-u.vercel.app](https://interv-u.vercel.app) *(Git Commit: `d9c315d`)*.

---

## BAGIAN III: KESIMPULAN & TAHAP BERIKUTNYA

1. **Seluruh PR Bimbingan Dosen Telah Selesai 100%:**  
   Seluruh aspek teoritis (Spencer 1993, STAR Janz 1982, Byham 1974, FACT), aspek empiris lapangan (27 loker JobStreet), aspek arsitektural (BPMN 6 Swimlane & Formula SAW), hingga penyesuaian sistem live telah tuntas dikerjakan dan terdokumentasi lengkap.
2. **Rencana Pelaksanaan Pengujian Responden Rekan IT:**  
   Berdasarkan SOP pada PR 6, sesi pengujian bersama 4 rekan mahasiswa IT akan dilaksanakan pada rentang tanggal 19–21 Oktober 2026. Data transkrip, tangkapan layar, dan lembar log observasi akan langsung dimasukkan ke dalam draf Bab IV Skripsi.
3. **Ketersediaan Berkas Fisik:**  
   Laporan resmi ini juga telah diekspor dalam format dokumen Word berstandar rapi:  
   👉 **[`bimbingan_bu_rina/P06-23523238-Avit Febriansyah.docx`](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/bimbingan_bu_rina/P06-23523238-Avit%20Febriansyah.docx)**  
   👉 **[`dokumen_skripsi/P06-23523238-Avit Febriansyah.docx`](file:///d:/intervyou%20edit%20bu%20rina/INTERV-U/dokumen_skripsi/P06-23523238-Avit%20Febriansyah.docx)**  

---
*Yogyakarta, 18 Oktober 2026*  
**Mahasiswa Peneliti,**  

**Avit Febriansyah**  
NIM: 23523238  
Program Studi Informatika, Universitas Islam Indonesia
