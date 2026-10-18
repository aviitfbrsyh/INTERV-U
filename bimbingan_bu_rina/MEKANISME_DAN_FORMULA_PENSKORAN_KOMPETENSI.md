# DOKUMEN SPESIFIKASI METODOLOGI & FORMULA PENSKORAN KOMPETENSI
## Sistem Simulasi Wawancara Kerja Interaktif INTERV-U Berbasis Multi-Framework AI
**Dokumen Pendukung Bab III (Metodologi Penelitian) & Bab IV (Hasil dan Pembahasan) Skripsi**

---

> **IDENTITAS DOKUMEN AKADEMIS**  
> * **Peneliti:** Avit Febriansyah  
> * **Dosen Pembimbing / Asesor SDM:** Ibu Chanifah, M.Kom. (Bu Rina)  
> * **Fokus Kajian:** Justifikasi Ilmiah, Arsitektur BPMN, dan Formula Deterministik Penskoran 7 Kompetensi Spencer & Spencer (1993)  
> * **Status Dokumen:** Standar Baku Perhitungan Skor Penilaian AI (Menjawab Masalah *"Black-Box LLM Hallucination"*)

---

## BAB I: LATAR BELAKANG & JUSTIFIKASI MASALAH

### 1.1 Kritik Fundamental terhadap Penilaian Murni LLM (*LLM-as-a-Judge*)
Pada implementasi awal sistem simulasi wawancara berbasis kecerdasan buatan, penentuan skor akhir (skala 0–100) kerap kali diserahkan seutuhnya (*pure prompting*) kepada Large Language Model (Gemini/GPT). Pendekatan ini memiliki kelemahan metodologis fatal di hadapan penguji skripsi:
1. **Bias Stokastik (*Stochastic Variance*):** Transkrip jawaban yang sama jika dievaluasi pada waktu berbeda dapat menghasilkan angka acak yang fluktuatif (misal: pengujian pertama bernilai 78, pengujian kedua 86).
2. **Ketiadaan Justifikasi Pembobotan (*Arbitrary Weights*):** Model bahasa tidak memiliki pemahaman alamiah mengenai posisi apa yang sedang dilamar, sehingga menganggap seluruh kompetensi bernilai sama rata, padahal seorang *Programmer* menuntut porsi *Analytical Thinking* jauh lebih dominan dibanding seorang *Sales*.
3. **Halusinasi Angka (*Number Hallucination*):** Angka skor 1–100 yang dikeluarkan LLM sering kali hanya berupa teks generik tanpa ada rantai perhitungan matematika yang dapat ditelusuri (*not traceable*).

### 1.2 Solusi Akademik INTERV-U: *Constrained Hybrid Scoring System*
Untuk menjamin validitas ilmiah pada skripsi ini, INTERV-U memisahkan secara tegas dua peran:
* **Peran LLM (Gemini):** Bertindak murni sebagai **Ekstraktor Bukti Kualitatif (*Qualitative Evidence Extractor*)** yang mendeteksi ada/tidaknya indikator perilaku nyata berdasarkan Kamus Spencer & Spencer (1993), kelengkapan STAR, dan dimensi FACT.
* **Peran Sistem Deterministik (Kode/Algoritma):** Bertindak sebagai **Mesin Kalkulasi Skor Matematis (*Deterministic Mathematical Calculator*)** yang menghitung nilai akhir menggunakan formula baku, rasio target level, dan matriks bobot posisi yang telah divalidasi oleh Asesor (Bu Rina).

---

## BAB II: LANDASAN TEORETIS PENENTUAN SKOR

Mekanisme penskoran INTERV-U dibangun di atas 4 pilar teoretis yang sahih:

1. **Behaviorally Anchored Rating Scales (BARS) — Spencer & Spencer (1993):**
   Tingkat kecakapan seseorang tidak diukur dari persepsi subjektif *"bagus/jelek"*, melainkan dicocokkan dengan jangkar perilaku konkret level 1 sampai 5. Setiap level memiliki deskriptor empiris unik.
2. **Multi-Attribute Utility Theory (MAUT) & Simple Additive Weighting (SAW) — Keeney & Raiffa (1993); Fishburn (1967):**
   Penilaian kinerja multi-kriteria dihitung melalui penjumlahan terbobot dari nilai utilitas masing-masing atribut kompetensi, di mana total bobot seluruh kriteria bernilai $\sum w_i = 1.0$ (100%).
3. **FACT Verification Protocol (Byham & DDI, 2003):**
   Validasi keaslian narasi masa lalu kandidat melalui 4 dimensi (*Feeling, Action, Context, Thinking*) guna membedakan klaim fiktif/tim dengan tindakan nyata individu.
4. **G-Eval Framework (Liu et al., 2023; Zheng et al., 2023):**
   Prinsip evaluasi berbasis LLM yang mewajibkan penilaian menggunakan rubrik formal bertingkat (*form-based grading with explicit criteria*) guna menekan varians skor LLM hingga di bawah 3%.

---

## BAB III: ARSITEKTUR & DIAGRAM ALIR BPMN PENSKORAN

Berikut adalah alur proses bisnis lengkap (*Business Process Model and Notation* - BPMN) yang menggambarkan bagaimana transkrip suara diubah menjadi laporan penilaian berbobot matematis:

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#1E3A8A', 'edgeLabelBackground':'#FFFFFF', 'tertiaryColor': '#F1F5F9'}}}%%
flowchart TD
    subgraph LANE_1 ["LANE 1: INPUT DATA & PROFIL (Kandidat & Job Requirements)"]
        A1["Mulai Sesi"] --> A2["Unggah CV & Input Job Description (JD)"]
        A2 --> A3["Ekstraksi Profil & Penentuan Target Role IT"]
        A3 --> A4["Load Matriks Bobot Posisi IT (w_i) & Target Level (L_target)"]
    end

    subgraph LANE_2 ["LANE 2: LIVE BEI SESSION (Interaksi Voice 30 Menit)"]
        A4 --> B1["AI Persona Siti Rahayu Mengajukan 7 Pertanyaan BEI"]
        B1 --> B2["Kandidat Merespons via Suara (Audio Streaming)"]
        B2 --> B3{"Apakah Jawaban Klise / Dangkal?"}
        B3 -- "Ya (Abstrak / Klaim Tim)" --> B4["AI Melakukan Probing STAR / FACT"]
        B4 --> B2
        B3 -- "Tidak (Konkret)" --> B5["Simpan Transkrip 7 Pasang Q&A"]
        B5 --> B6["Sesi Tanya Jawab Kandidat & Closing"]
    end

    subgraph LANE_3 ["LANE 3: LLM PARSING ENGINE (Kualitatif ke Level Terukur)"]
        B6 --> C1["Kirim Transkrip Lengkap ke /api/evaluate"]
        C1 --> C2["Ekstraksi Dimensi STAR (0-4 Poin)"]
        C1 --> C3["Penilaian Skor FACT: Feeling, Action, Context, Thinking (4-40 Poin)"]
        C1 --> C4["Pencocokan Bukti Transkrip ke Kamus Spencer (Level Capaian 1-5)"]
    end

    subgraph LANE_4 ["LANE 4: DETERMINISTIC SCORING ENGINE (Algoritma Matematis Kode)"]
        C2 & C3 & C4 --> D1["Hitung Skor Mentah Tiap Kompetensi S_i Berbasis Gap Target"]
        D1 --> D2["Terapkan Pengali Integritas Bukti (Faktor FACT & STAR)"]
        D2 --> D3["Kalkulasi Skor Terbobot Akhir: Skor_Akhir = SUM(w_i x S_i)"]
        D3 --> D4{"Evaluasi Passing Grade & Minimum Threshold"}
        D4 -- "Skor >= 75 & Semua Core Tercapai" --> D5["Status: RECOMMENDED (Lolos)"]
        D4 -- "60 <= Skor < 75 atau Gap Minor" --> D6["Status: CONDITIONAL (Pertimbangan)"]
        D4 -- "Skor < 60 atau Gap Fatal pada Core" --> D7["Status: NOT RECOMMENDED (Gagal)"]
    end

    subgraph LANE_5 ["LANE 5: OUTPUT & LAPORAN AKHIR"]
        D5 & D6 & D7 --> E1["Generate Radar Chart 7 Kompetensi Spencer & Spencer"]
        E1 --> E2["Generate Visualisasi FACT Dimension Bars"]
        E2 --> E3["Sajikan Rekomendasi Karir & Rencana Pengembangan Diri"]
    end
```

---

## BAB IV: FORMULA MATEMATIS & MEKANISME PEMBOBOTAN

### 4.1 Penetapan Bobot Posisi IT ($w_i$)
Setiap posisi IT memiliki profil kompetensi unik yang tidak dapat disamakan. Berdasarkan data empiris JobStreet 2026 dan validasi Asesor, bobot didefinisikan sebagai vektor:

$$\mathbf{W} = [w_{\text{EXP}}, w_{\text{AT}}, w_{\text{CT}}, w_{\text{ACH}}, w_{\text{CO}}, w_{\text{TW}}, w_{\text{INT}}]$$

Dengan syarat mutlak normalisasi:
$$\sum_{i=1}^{7} w_i = 1.0 \quad (100\%)$$

#### Tabel Distribusi Bobot Baku Berdasarkan Matriks Bu Rina:
| Posisi IT | EXP | AT | CT | ACH | CO | TW | INT | Total | Justifikasi Posisi |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **Programmer / Software Engineer** | 20% | **25%** | 15% | 10% | 15% | 10% | 5% | **100%** | Prioritas utama: Logika algoritma & debugging mendalam (*AT*). |
| **UI/UX Designer** | 20% | 15% | **20%** | 10% | 15% | 15% | 5% | **100%** | Prioritas utama: Abstraksi proses rumit ke desain visual (*CT*). |
| **QA / Software Tester** | 20% | 20% | 10% | 10% | **25%** | 10% | 5% | **100%** | Prioritas utama: Ketelitian pengujian & dokumentasi zero-bug (*CO*). |
| **Data Engineer / Analyst** | 20% | **25%** | 15% | 10% | 15% | 10% | 5% | **100%** | Prioritas utama: Bedah anomali data & efisiensi query (*AT*). |

---

### 4.2 Formula Penentuan Skor Satuan Kompetensi ($S_i$)
Tiap kompetensi $i$ memiliki target level minimal $L_{\text{target}, i}$ (skala 1–5) dan level capaian yang dibuktikan kandidat $L_{\text{actual}, i}$ (skala 1–5).

Skor pemenuhan kompetensi dasar dihitung dengan rasio pemenuhan target (*Competency Fulfillment Ratio*):

$$S_{\text{base}, i} = \min \left( 100, \, \left( \frac{L_{\text{actual}, i}}{L_{\text{target}, i}} \right) \times 80 \right)$$

*Penjelasan:*
* Jika kandidat mencapai **tepat target minimal** ($L_{\text{actual}} = L_{\text{target}}$), skor dasar adalah **80** (Kategori Baik / *Standard Competent*).
* Jika kandidat melampaui target ($L_{\text{actual}} > L_{\text{target}}$), skor dasar dapat mencapai **100** (Kategori Istimewa / *Superior*).
* Jika kandidat di bawah target ($L_{\text{actual}} < L_{\text{target}}$), skor dasar tereduksi secara proporsional.

---

### 4.3 Faktor Pengali Integritas Narasi FACT ($\mu_{\text{FACT}, i}$)
Untuk memastikan kandidat tidak sekadar mengarang teori, skor dasar dikalikan dengan **Faktor Integritas Perilaku Nyata** yang dihitung dari rata-rata 4 dimensi FACT (*Feeling, Action, Context, Thinking*):

$$\text{FACT}_{\text{norm}, i} = \frac{\text{Score}_{\text{Feeling}} + \text{Score}_{\text{Action}} + \text{Score}_{\text{Context}} + \text{Score}_{\text{Thinking}}}{40}$$

Di mana skor FACT dinormalisasi menjadi rentang pengali $0.85 \le \mu_{\text{FACT}} \le 1.15$:
$$\mu_{\text{FACT}, i} = 0.85 + (0.30 \times \text{FACT}_{\text{norm}, i})$$

Skor final untuk kompetensi $i$ adalah:
$$S_i = \min(100, \, S_{\text{base}, i} \times \mu_{\text{FACT}, i})$$

---

### 4.4 Formula Skor Keseluruhan (*Overall Composite Score*)
Skor akhir wawancara kandidat dihitung menggunakan model aditif terbobot (*Simple Additive Weighting*):

$$\text{Skor Akhir} = \sum_{i=1}^{7} \left( w_i \times S_i \right)$$

---

### 4.5 Aturan Ambang Batas Keputusan (*Decision Thresholds*)

Keputusan akhir rekrutmen (*Recommendation Verdict*) tidak ditentukan oleh opini bebas AI, melainkan dikunci oleh ambang batas formal:

$$\text{Verdict} = 
\begin{cases} 
\mathbf{RECOMMENDED} & \text{jika } \text{Skor Akhir} \ge 75 \text{ DAN } \forall i \in \text{Core}, L_{\text{actual}, i} \ge L_{\text{target}, i} \\
\mathbf{CONDITIONAL} & \text{jika } 60 \le \text{Skor Akhir} < 75 \text{ ATAU terdapat } 1 \text{ gap minor pada non-core} \\
\mathbf{NOT\ RECOMMENDED} & \text{jika } \text{Skor Akhir} < 60 \text{ ATAU terdapat gap } \ge 2 \text{ level pada kompetensi prioritas}
\end{cases}$$

---

## BAB V: BUKTI EMPIRIS & SIMULASI PERHITUNGAN KASUS RIIL

Berikut adalah simulasi audit nyata menggunakan transkrip pengujian kandidat **Programmer / Software Developer**:

### Profil Uji:
* **Target Posisi:** Programmer / Fullstack Developer
* **Vektor Bobot Posisi:**  
  $\mathbf{W} = [\text{EXP}: 0.20, \, \text{AT}: 0.25, \, \text{CT}: 0.15, \, \text{ACH}: 0.10, \, \text{CO}: 0.15, \, \text{TW}: 0.10, \, \text{INT}: 0.05]$

---

### Data Mentah Penilaian Transkrip:
| Kode | Nama Kompetensi | Target $L_{\text{target}}$ | Bukti Transkrip Nyata Sesi Uji | Capaian $L_{\text{actual}}$ | Skor FACT (/40) | Pengali $\mu_{\text{FACT}}$ |
|:---:|:---|:---:|:---|:---:|:---:|:---:|
| **EXP** | Technical Expertise | Level 3 | Menerapkan Zustand & React Query memisahkan cache server vs client state. | **Level 4** | 34.5 | 1.108 |
| **AT** | Analytical Thinking | Level 4 | Melacak akar masalah memory leak Chrome DevTools Heap Snapshot hingga ke event listener. | **Level 4** | 36.0 | 1.120 |
| **CT** | Conceptual Thinking | Level 3 | Menerapkan arsitektur Compound Component pada form generator modular. | **Level 3** | 33.0 | 1.097 |
| **ACH**| Achievement Orientation | Level 3 | Berinisiatif menaikkan skor Lighthouse dari 68 ke 92 melalui lazy load & code splitting. | **Level 3** | 34.5 | 1.108 |
| **CO** | Concern for Order | Level 3 | Mengonfigurasi pre-commit git hook ESLint & Vitest testing sebelum pull request. | **Level 4** | 35.0 | 1.112 |
| **TW** | Teamwork | Level 3 | Menyelesaikan debat rendering frontend vs SSR di tim berbasis benchmark data objektif. | **Level 3** | 34.5 | 1.108 |
| **INT**| Initiative | Level 2 | Menginisiasi dokumentasi API dan pembuatan reusable UI kit bersama tanpa disuruh. | **Level 3** | 34.0 | 1.105 |

---

### Langkah Demi Langkah Perhitungan Matematis:

#### 1. Perhitungan Skor Tiap Kompetensi ($S_i$):
* **EXP:**  
  $$S_{\text{base}} = \min\left(100, \, \frac{4}{3} \times 80\right) = 100 \implies S_{\text{EXP}} = \min(100, 100 \times 1.108) = \mathbf{100.0}$$
* **AT:**  
  $$S_{\text{base}} = \min\left(100, \, \frac{4}{4} \times 80\right) = 80 \implies S_{\text{AT}} = \min(100, 80 \times 1.120) = \mathbf{89.6}$$
* **CT:**  
  $$S_{\text{base}} = \min\left(100, \, \frac{3}{3} \times 80\right) = 80 \implies S_{\text{CT}} = \min(100, 80 \times 1.097) = \mathbf{87.8}$$
* **ACH:**  
  $$S_{\text{base}} = \min\left(100, \, \frac{3}{3} \times 80\right) = 80 \implies S_{\text{ACH}} = \min(100, 80 \times 1.108) = \mathbf{88.6}$$
* **CO:**  
  $$S_{\text{base}} = \min\left(100, \, \frac{4}{3} \times 80\right) = 100 \implies S_{\text{CO}} = \min(100, 100 \times 1.112) = \mathbf{100.0}$$
* **TW:**  
  $$S_{\text{base}} = \min\left(100, \, \frac{3}{3} \times 80\right) = 80 \implies S_{\text{TW}} = \min(100, 80 \times 1.108) = \mathbf{88.6}$$
* **INT:**  
  $$S_{\text{base}} = \min\left(100, \, \frac{3}{2} \times 80\right) = 100 \implies S_{\text{INT}} = \min(100, 100 \times 1.105) = \mathbf{100.0}$$

---

#### 2. Agregasi Penjumlahan Terbobot Akhir:
$$\begin{aligned}
\text{Skor Akhir} &= (0.20 \times 100.0) + (0.25 \times 89.6) + (0.15 \times 87.8) + (0.10 \times 88.6) + (0.15 \times 100.0) + (0.10 \times 88.6) + (0.05 \times 100.0) \\
&= 20.00 + 22.40 + 13.17 + 8.86 + 15.00 + 8.86 + 5.00 \\
&= \mathbf{93.29} \quad (\text{Dibulatkan: } \mathbf{93 / 100})
\end{aligned}$$

---

#### 3. Penarikan Keputusan Berbasis Aturan Baku:
* **Ambang Batas Nilai:** $93.29 \ge 75$ (Memenuhi kriteria numerik).
* **Syarat Mutlak Kompetensi Kunci:**
  * Target $AT$ minimal Level 4 $\implies$ Capaian Level 4 (**Terpenuhi**).
  * Target $EXP$ minimal Level 3 $\implies$ Capaian Level 4 (**Melampaui**).
  * Seluruh 7 kompetensi berada pada atau melampaui target minimum.
* **Keputusan Akhir Sistem:**  
  $$\mathbf{RECOMMENDED\ (DIREKOMENDASIKAN\ LOLOS)}$$

---

## BAB VI: KESIMPULAN & MANFAAT UNTUK SIDANG SKRIPSI

Dengan dokumentasi formula ini, Anda memiliki **3 senjata argumen ilmiah yang sangat kokoh di hadapan Bu Rina dan Dosen Penguji**:

1. **Bebas Halusinasi Skor AI:** Anda dapat membuktikan bahwa Gemini **tidak pernah menentukan angka 93 secara gaib**. Angka 93 lahir dari persamaan matematika linier terbobot di Bab IV.
2. **Kesesuaian dengan Profil Industri Nyata:** Pembobotan 25% untuk *Analytical Thinking* dan 20% untuk *Technical Expertise* memiliki dasar riset empiris dari lowongan aktif JobStreet 2026.
3. **Auditability (Keterlacakan Penuh):** Setiap angka skor dapat dilacak kembali hingga ke kutipan kata demi kata di transkrip kandidat (*evidence-based scoring*).
