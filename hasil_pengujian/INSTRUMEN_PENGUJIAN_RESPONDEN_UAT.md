# INSTRUMEN PENGUJIAN USER ACCEPTANCE TESTING (UAT)
## SISTEM SIMULASI WAWANCARA KERJA BERBASIS AI: INTERV-U
**Integrasi Multi-Framework: STAR, FACT, Spencer & Spencer (1993), dan ConCISE**

---

> **Identitas Dokumen Penelitian**  
> **Nama Peneliti** : Avit Febriansyah  
> **Dosen Pembimbing** : Ibu Chanifah, M.Kom.  
> **Objek Penelitian** : Sistem Simulasi Wawancara Kerja Interaktif INTERV-U  
> **Tujuan Dokumen** : Sebagai instrumen formal pengumpulan data empiris penerimaan pengguna (*User Acceptance Testing*) dan validasi kualitas evaluasi AI untuk Bab III, Bab IV, dan Lampiran Skripsi.

---

## 1. LANDASAN TEORETIS PENGUKURAN

Pengujian penerimaan pengguna (*User Acceptance Testing* - UAT) pada sistem INTERV-U dirancang mengacu pada kerangka kerja **Technology Acceptance Model (TAM)** yang dikembangkan oleh **Davis (1989)**, yang diperluas (*extended TAM*) untuk mengakomodasi karakteristik sistem berbasis **Generative AI** dan **Evaluasi Multi-Framework**.

### Dimensi Pengukuran:
1. **Perceived Usefulness (PU) — Persepsi Kegunaan (5 Butir)**  
   Mengukur sejauh mana pengguna percaya bahwa sistem INTERV-U meningkatkan kesiapan, kemampuan menyusun jawaban terstruktur, dan pemahaman kompetensi diri dalam wawancara kerja.
2. **Perceived Ease of Use (PEOU) — Persepsi Kemudahan Penggunaan (5 Butir)**  
   Mengukur sejauh mana pengguna merasa bahwa berinteraksi dengan sistem INTERV-U tidak memerlukan usaha keras, antarmuka mudah dipahami, serta proses simulasi berjalan intuitif.
3. **AI Evaluation & Feedback Quality (AQ) — Kualitas Evaluasi AI (5 Butir)**  
   Mengukur persepsi pengguna terhadap akurasi, relevansi, dan ketajaman feedback AI yang menggunakan 4 framework (STAR, FACT, Spencer & Spencer 1993, dan ConCISE).
4. **Coaching & Interactive Experience (CE) — Kualitas Modul Coaching & Voice (5 Butir)**  
   Mengukur kebermanfaatan interaksi dengan AI Career Coach (Persona: Siti Rahayu), fitur *practice*, serta kejelasan audio Text-to-Speech (TTS).
5. **Behavioral Intention to Use & Overall Satisfaction (BI) — Kepuasan & Niat Penggunaan (5 Butir)**  
   Mengukur kepuasan menyeluruh pengguna, niat untuk menggunakan sistem kembali di masa depan, dan kesediaan merekomendasikannya kepada orang lain.

---

## 2. PROTOKOL & SKENARIO UJI COBA OLEH RESPONDEN

Sebelum mengisi kuesioner, setiap responden wajib menjalankan **Skenario Uji Coba Terarah (Guided Test Protocol)** berikut selama 15–20 menit:

```
[Mulai]
   │
   ▼
[Tahap 1: Akses & Autentikasi] ──── Masuk ke sistem INTERV-U (localhost / URL staging)
   │
   ▼
[Tahap 2: Input Profil Wawancara] ─ Unggah CV dan masukkan teks Job Description (JD) target
   │
   ▼
[Tahap 3: Simulasi Live Interview] ─ Menjawab 3-4 pertanyaan wawancara Behavioral Event
   │                                 (Menggunakan microphone atau input teks)
   ▼
[Tahap 4: Eksplorasi Evaluasi AI] ─ Membaca hasil analisis:
   │                                 • Deteksi 4 komponen STAR
   │                                 • Skor 4 dimensi FACT (Feeling, Action, Context, Thinking)
   │                                 • Capaian level Kompetensi Spencer & Spencer (skala 1-5)
   │                                 • Pola ConCISE & Archetype kandidat
   ▼
[Tahap 5: Sesi Interaktif Coaching]─ Mencoba tanya jawab dengan AI Coach Siti Rahayu,
   │                                 mendengarkan audio TTS, dan mencoba fitur Practice
   ▼
[Tahap 6: Pengisian Kuesioner] ──── Mengisi 25 butir instrumen UAT pada formulir ini / Google Form
   │
[Selesai]
```

---

## 3. FORMULIR IDENTITAS RESPONDEN

Mohon kesediaan Saudara/i untuk melengkapi data demografi berikut sebelum memberikan penilaian:

1. **Nama Lengkap / Inisial** : _____________________________________________
2. **Jenis Kelamin** : [ ] Laki-laki &nbsp;&nbsp;&nbsp;&nbsp; [ ] Perempuan
3. **Usia** : ______ tahun
4. **Status Saat Ini** :
   - [ ] Mahasiswa Tingkat Akhir (Semester 7–8)
   - [ ] Fresh Graduate (< 1 tahun kelulusan)
   - [ ] Pencari Kerja / Job Seeker
   - [ ] Praktisi HR / Recruiter / Dosen
5. **Program Studi / Fakultas** : _____________________________________________
6. **Pengalaman Wawancara Kerja Sebelumnya** :
   - [ ] Belum pernah sama sekali
   - [ ] 1 – 2 kali
   - [ ] 3 – 5 kali
   - [ ] Lebih dari 5 kali
7. **Posisi / Bidang Pekerjaan yang Diminati** : _____________________________________________

---

## 4. BUTIR PERNYATAAN KUESIONER UAT (SKALA LIKERT 1–5)

**Petunjuk Pengisian:**  
Berikan tanda centang ($\checkmark$) pada salah satu kolom pilihan yang paling sesuai dengan pengalaman dan persepsi Saudara/i setelah mencoba sistem INTERV-U:
- **STS** = Sangat Tidak Setuju (Skor 1)
- **TS**  = Tidak Setuju (Skor 2)
- **N**   = Netral / Ragu-ragu (Skor 3)
- **S**   = Setuju (Skor 4)
- **SS**  = Sangat Setuju (Skor 5)

---

### Bagian A: Perceived Usefulness (PU) — Persepsi Kegunaan
| Kode | Pernyataan Instrumen | STS (1) | TS (2) | N (3) | S (4) | SS (5) |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **PU-01** | Sistem INTERV-U membantu saya mempersiapkan diri lebih baik dalam menghadapi wawancara kerja yang sesungguhnya. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **PU-02** | Umpan balik berbasis framework **STAR** (Situation, Task, Action, Result) membantu saya menyusun jawaban wawancara yang lebih terstruktur. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **PU-03** | Penilaian framework **FACT** (Feeling, Action, Context, Thinking) membantu saya memastikan jawaban tidak hanya teoritis tetapi mencerminkan aksi nyata. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **PU-04** | Analisis kompetensi berbasis **Kamus Spencer & Spencer (1993)** membantu saya mengetahui level kemampuan perilaku kerja saya secara terukur. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **PU-05** | Contoh perbaikan jawaban (*better answer example*) dan trik praktis (*interview hack*) memberikan wawasan konkret untuk meningkatkan kualitas jawaban saya. | [ ] | [ ] | [ ] | [ ] | [ ] |

---

### Bagian B: Perceived Ease of Use (PEOU) — Kemudahan Penggunaan
| Kode | Pernyataan Instrumen | STS (1) | TS (2) | N (3) | S (4) | SS (5) |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **PEOU-01** | Antarmuka pengguna (*user interface*) sistem INTERV-U bersih, modern, dan mudah dipahami alurnya. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **PEOU-02** | Proses mengunggah dokumen CV dan memasukkan teks Job Description berjalan lancar tanpa kebingungan. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **PEOU-03** | Interaksi selama simulasi wawancara langsung (*live interview*) terasa intuitif dan mudah dioperasikan. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **PEOU-04** | Visualisasi laporan evaluasi (skor angka, bar chart kompetensi, dan badge status) disajikan secara jelas dan mudah dibaca. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **PEOU-05** | Saya tidak membutuhkan bantuan teknis khusus atau panduan yang rumit untuk dapat menggunakan fitur-fitur utama sistem INTERV-U. | [ ] | [ ] | [ ] | [ ] | [ ] |

---

### Bagian C: AI Evaluation & Feedback Quality (AQ) — Kualitas Evaluasi AI
| Kode | Pernyataan Instrumen | STS (1) | TS (2) | N (3) | S (4) | SS (5) |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **AQ-01** | Pertanyaan wawancara yang diajukan AI relevan dengan profil CV dan kualifikasi Job Description yang saya input. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **AQ-02** | Deteksi keberadaan komponen STAR beserta kutipan bukti (*evidence*) dari jawaban saya dinilai akurat dan objektif. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **AQ-03** | Penilaian 4 dimensi FACT mampu membedakan jawaban yang kaya aksi nyata dengan jawaban yang bersifat hafalan/normatif. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **AQ-04** | Penetapan level kompetensi Spencer & Spencer (Level 1–5) beserta catatannya sesuai dengan kedalaman jawaban yang saya berikan. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **AQ-05** | Penentuan tipe profil kandidat (*Candidate Archetype*) dan rekomendasi akhir (*verdict*) mencerminkan performa wawancara saya secara adil. | [ ] | [ ] | [ ] | [ ] | [ ] |

---

### Bagian D: Coaching & Interactive Experience (CE) — Kualitas Coaching & Audio
| Kode | Pernyataan Instrumen | STS (1) | TS (2) | N (3) | S (4) | SS (5) |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **CE-01** | Interaksi dengan AI Career Coach (Siti Rahayu) terasa responsif, komunikatif, dan menyerupai bimbingan mentor profesional asli. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **CE-02** | Saran perbaikan jawaban dari AI Coach bersifat taktis, konstruktif, dan langsung dapat saya terapkan pada latihan berikutnya. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **CE-03** | Fitur latihan ulang (*practice mode*) membantu saya melatih kembali jawaban yang dinilai kurang optimal sebelumnya. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **CE-04** | Kualitas suara audio Text-to-Speech (TTS) dari AI Coach terdengar jelas, natural, dan intonasinya nyaman didengar. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **CE-05** | Analisis kata pengisi (*filler words*) membantu saya menyadari kebiasaan bicara yang perlu dikurangi saat wawancara. | [ ] | [ ] | [ ] | [ ] | [ ] |

---

### Bagian E: Behavioral Intention & Satisfaction (BI) — Kepuasan & Minat Penggunaan
| Kode | Pernyataan Instrumen | STS (1) | TS (2) | N (3) | S (4) | SS (5) |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **BI-01** | Secara keseluruhan, saya merasa puas dengan pengalaman menggunakan sistem simulasi wawancara INTERV-U. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **BI-02** | Saya berniat menggunakan sistem INTERV-U kembali sebagai sarana latihan sebelum menghadapi jadwal wawancara kerja asli. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **BI-03** | Saya akan merekomendasikan sistem INTERV-U kepada teman, rekan mahasiswa, atau pencari kerja lainnya. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **BI-04** | Sistem INTERV-U memberikan pengalaman persiapan wawancara yang jauh lebih efektif dibandingkan latihan mandiri tanpa feedback. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **BI-05** | Sistem INTERV-U sangat layak diimplementasikan di Pusat Karir Kampus / Career Development Center (CDC) sebagai fasilitas mahasiswa. | [ ] | [ ] | [ ] | [ ] | [ ] |

---

### Bagian F: Saran & Masukan Kualitatif Terbuka
1. **Fitur apa yang menurut Anda paling bermanfaat dari sistem INTERV-U? Mengapa?**  
   *Jawaban:* __________________________________________________________________________________
2. **Kendala atau kesulitan apa yang Anda alami saat menggunakan sistem INTERV-U?**  
   *Jawaban:* __________________________________________________________________________________
3. **Saran perbaikan atau pengembangan fitur untuk sistem INTERV-U ke depannya:**  
   *Jawaban:* __________________________________________________________________________________

---

## 5. TEKNIK ANALISIS DATA & INTERPRETASI KELAYAKAN UAT

### A. Perhitungan Skor Kategori (Metode Likert Terbobot)
Setiap butir dihitung menggunakan rumus persentase kelayakan menurut **Arikunto (2019)** dan **Sugiyono (2018)**:

$$\text{Persentase Kelayakan (\%)} = \frac{\sum \text{Skor Aktual}}{\sum \text{Skor Maksimum Ideal}} \times 100\%$$

Di mana:
- $\sum \text{Skor Aktual}$ = Total akumulasi skor dari seluruh responden pada variabel tersebut.
- $\sum \text{Skor Maksimum Ideal}$ = $N \text{ (jumlah responden)} \times K \text{ (jumlah butir)} \times 5 \text{ (skor maksimal bobot SS)}$.

### B. Kriteria Interpretasi Tingkat Penerimaan Sistem (UAT)
| Rentang Persentase Skor | Kategori Kelayakan / Penerimaan | Tindak Lanjut Akademik |
| :---: | :---: | :--- |
| **81,00\% – 100,00\%** | **Sangat Layak / Sangat Diterima** | Sistem memenuhi seluruh ekspektasi pengguna tanpa perlu revisi mayor. |
| **61,00\% – 80,99\%** | **Layak / Diterima** | Sistem diterima dengan baik, rekomendasi minor dapat diterapkan. |
| **41,00\% – 60,99\%** | **Cukup Layak / Cukup** | Sistem membutuhkan beberapa perbaikan fungsional sebelum rilis penuh. |
| **21,00\% – 40,99\%** | **Kurang Layak / Kurang** | Sistem memiliki kelemahan signifikan pada antarmuka atau akurasi AI. |
| **0,00\% – 20,99\%** | **Sangat Tidak Layak** | Sistem ditolak oleh pengguna dan memerlukan perancangan ulang total. |

---

## 6. LEMBAR VALIDASI AHLI (EXPERT JUDGMENT)
*(Khusus untuk Dosen Pembimbing / Praktisi HR Recruiter)*

Lembar ini digunakan untuk memvalidasi ketepatan konseptual instrumen sebelum disebarkan kepada responden mahasiswa/pencari kerja:

| Aspek yang Dinilai | Catatan / Masukan Validator | Status Validasi |
| :--- | :--- | :---: |
| **1. Kesesuaian Teori TAM (Davis, 1989)**<br>Ketepatan variabel PU, PEOU, dan BI dalam mengukur penerimaan sistem. | | [ ] Layak<br>[ ] Perlu Revisi |
| **2. Ketercakupan Framework Evaluasi AI**<br>Kesesuaian butir instrumen terhadap framework STAR, FACT, dan Spencer & Spencer (1993). | | [ ] Layak<br>[ ] Perlu Revisi |
| **3. Kejelasan Bahasa & Konstruk Butir**<br>Pernyataan tidak ambigu, tidak bermakna ganda (*double-barreled*), dan mudah dipahami. | | [ ] Layak<br>[ ] Perlu Revisi |
| **4. Kelayakan Skenario Pengujian**<br>Langkah-langkah simulasi terarah dan realistis diselesaikan dalam 15–20 menit. | | [ ] Layak<br>[ ] Perlu Revisi |

**Kesimpulan Validator Ahli:**  
[ ] Instrumen dinyatakan **LAYAK DIGUNAKAN** tanpa revisi  
[ ] Instrumen dinyatakan **LAYAK DIGUNAKAN** dengan revisi sesuai catatan  
[ ] Instrumen dinyatakan **TIDAK LAYAK** dan harus disusun ulang  

Tanda Tangan Validator,  


___________________________  
**NIP / NIDN :**

---

## 7. ANALISIS PERBANDINGAN TEORI JUMLAH MINIMUM RESPONDEN (TO-DO 3)

Sesuai arahan Dosen Pembimbing untuk membandingkan teori penentuan jumlah minimum responden dan menganalisis mana yang paling sesuai untuk penelitian INTERV-U:

| No | Teori / Tokoh Ahli | Rujukan / Judul Buku / Paper | Kaidah / Formula Jumlah Sampel | Relevansi untuk INTERV-U | Tautan Sumber Resmi |
| :---: | :--- | :--- | :--- | :--- | :--- |
| 1 | **Jakob Nielsen & Thomas Landauer (1993)** | *ACM CHI '93 & NN/g Usability Testing Model* | 5 responden menemukan ~85% masalah *usability*; 15–20 responden mencapai saturasi (>95% masalah sistem). | Sangat relevan untuk pengujian kegunaan antarmuka dan alur teknis live interview. | [ACM Digital Library: doi.org/10.1145/169059.169166](https://doi.org/10.1145/169059.169166) |
| 2 | **Roscoe (1975)** | *Fundamental Research Statistics for the Behavioral Sciences* | Kaidah praktis (*Rule of Thumb*): Ukuran sampel antara **30 hingga 500 subjek** adalah tepat untuk sebagian besar riset perilaku. | **SANGAT TEPAT ⭐ (Dasar Penetapan N=30 Responden UAT Avit)** | [Open Library: openlibrary.org/books/OL5063071M](https://openlibrary.org/books/OL5063071M/Fundamental_research_statistics_for_the_behavioral_sciences) |
| 3 | **Hair, Black, Babin, & Anderson (2010)** | *Multivariate Data Analysis (Pearson 7th ed.)* | Rasio observasi terhadap variabel minimal 5:1 hingga 10:1. Untuk 5 dimensi TAM = 25–50 responden. | Sangat mendukung: 5 dimensi TAM × 6 responden = 30 sampel sudah memenuhi rasio ideal. | [ResearchGate: publication/265350313](https://www.researchgate.net/publication/265350313_Multivariate_Data_Analysis) |
| 4 | **Taro Yamane / Slovin (1967)** | *Elementary Sampling Theory* | $n = \frac{N}{1 + N(e^2)}$. Membutuhkan angka pasti populasi total ($N$). | Kurang cocok karena populasi pelamar kerja/mahasiswa bersifat tak terhingga (*infinite population*). | [ResearchGate: publication/285226466](https://www.researchgate.net/publication/285226466) |
| 5 | **Gay, Mills, & Airasian (2012)** | *Educational Research: Competencies for Analysis and Applications* | Untuk penelitian deskriptif kuantitatif, ukuran sampel minimum yang dapat diterima adalah minimal 30 subjek. | Memperkuat justifikasi akademis bahwa N=30 adalah batas minimum uji parametrik (*Central Limit Theorem*). | [Pearson Catalog: ISBN 9780132613170](https://www.pearson.com/en-us/subject-catalog/p/educational-research-competencies-for-analysis-and-applications/P200000002888) |

### Rekomendasi & Justifikasi Akademis untuk Skripsi Avit:
Penelitian sistem simulasi wawancara kerja INTERV-U menetapkan **$N = 30$ Responden** dengan 4 justifikasi metodologis yang sahih:
1. **Memenuhi Kaidah Roscoe (1975)**: Sampel 30–500 subjek merupakan standar representatif yang diakui luas dalam pengujian sistem informasi berbasis perilaku.
2. **Memenuhi Rasio Konstruk Hair et al. (2010)**: Dengan 5 dimensi TAM (PU, PEOU, AQ, CE, BI), jumlah 30 responden menghasilkan rasio 6:1 (memenuhi ambang batas 5:1 s/d 10:1).
3. **Memenuhi Teorema Limit Pusat (*Central Limit Theorem*)**: Dalam teori probabilitas dan statistika, sampel berukuran $N \ge 30$ menjamin distribusi rata-rata sampel mendekati distribusi normal, sehingga analisis deskriptif dan uji parametrik valid.
4. **Melampaui Batas Saturasi Usability Nielsen (1993)**: Evaluasi kegunaan sistem telah mencapai saturasi penuh pada $N \ge 15-20$, sehingga 30 responden memberikan keandalan temuan yang sangat tinggi.

---

## 8. DAFTAR PUSTAKA & RUJUKAN RESMI TERVERIFIKASI

1. **Davis, F. D. (1989)**. *Perceived Usefulness, Perceived Ease of Use, and User Acceptance of Information Technology*. MIS Quarterly, 13(3), 319–340.  
   DOI: [https://doi.org/10.2307/249008](https://doi.org/10.2307/249008)  
   JSTOR: [https://www.jstor.org/stable/249008](https://www.jstor.org/stable/249008)
2. **Spencer, L. M., & Spencer, S. M. (1993)**. *Competence at Work: Models for Superior Performance*. John Wiley & Sons, Inc.  
   Archive: [https://archive.org/details/competenceatwork00spen](https://archive.org/details/competenceatwork00spen)  
   Semantic Scholar: [https://www.semanticscholar.org/paper/Competence-at-Work%3A-Models-for-Superior-Performance-Spencer/c8cf29283f58a36d2aa0303b711e9f1a086431e5](https://www.semanticscholar.org/paper/Competence-at-Work%3A-Models-for-Superior-Performance-Spencer/c8cf29283f58a36d2aa0303b711e9f1a086431e5)
3. **Arikunto, S. (2019)**. *Prosedur Penelitian: Suatu Pendekatan Praktik*. Jakarta: Rineka Cipta.  
   Katalog Perpustakaan Nasional RI: [https://opac.perpusnas.go.id/DetailOpac.aspx?id=1138812](https://opac.perpusnas.go.id/DetailOpac.aspx?id=1138812)
4. **Sugiyono. (2018)**. *Metode Penelitian Kuantitatif, Kualitatif, dan R&D*. Bandung: Alfabeta.  
   Katalog Perpustakaan Nasional RI: [https://opac.perpusnas.go.id/DetailOpac.aspx?id=1152063](https://opac.perpusnas.go.id/DetailOpac.aspx?id=1152063)
5. **Nielsen, J., & Landauer, T. K. (1993)**. *A mathematical model of the finding of usability problems*. Proceedings of the INTERACT '93 and CHI '93 Conference on Human Factors in Computing Systems (pp. 206–213). ACM.  
   DOI: [https://doi.org/10.1145/169059.169166](https://doi.org/10.1145/169059.169166)  
   Nielsen Norman Group: [https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/](https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/)
6. **Roscoe, J. T. (1975)**. *Fundamental Research Statistics for the Behavioral Sciences* (2nd ed.). New York: Holt, Rinehart and Winston.  
   Open Library: [https://openlibrary.org/books/OL5063071M/Fundamental_research_statistics_for_the_behavioral_sciences](https://openlibrary.org/books/OL5063071M/Fundamental_research_statistics_for_the_behavioral_sciences)
7. **Hair, J. F., Black, W. C., Babin, B. J., & Anderson, R. E. (2010)**. *Multivariate Data Analysis* (7th ed.). Upper Saddle River, NJ: Prentice Hall.  
   ResearchGate: [https://www.researchgate.net/publication/265350313_Multivariate_Data_Analysis](https://www.researchgate.net/publication/265350313_Multivariate_Data_Analysis)

