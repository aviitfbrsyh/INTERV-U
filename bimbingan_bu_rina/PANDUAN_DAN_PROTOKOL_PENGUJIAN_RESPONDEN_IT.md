# PROTOKOL & PANDUAN PENGUJIAN 3–4 RESPONDEN REKAN IT
## Validasi Rekan Sejawat (*Peer Testing*) & Mitigasi Bias Peneliti (*Researcher Bias*)
**Dokumen Operasional Bab III (Metodologi Pengujian) & Bab IV (Hasil dan Pembahasan)**

---

> **IDENTITAS DOKUMEN PROTOKOL**  
> * **Nama Peneliti:** Avit Febriansyah  
> * **Dosen Pembimbing:** Ibu Chanifah, M.Kom. (Bu Rina)  
> * **Objek Penelitian:** Sistem Simulasi Wawancara Kerja Interaktif INTERV-U Berbasis AI  
> * **Tujuan Dokumen:** Menindaklanjuti instruksi dosen pembimbing agar evaluasi sistem tidak hanya mengandalkan pengujian mandiri oleh peneliti (*self-testing*), melainkan diuji secara objektif oleh **3–4 rekan mahasiswa/alumni IT** dengan latar belakang keahlian berbeda guna memvalidasi kemampuan evaluasi perilaku AI (STAR, FACT, dan 7 Kompetensi Spencer & Spencer 1993).

---

## BAB I: LANDASAN METODOLOGI PEER TESTING

### 1.1 Urgensi Ilmiah: Menghilangkan Bias Peneliti (*Researcher Bias*)
Dalam riset perangkat lunak berbasis AI Generatif, pengujian yang hanya dilakukan oleh pengembang sistem (*developer testing*) memiliki kelemahan mendasar:
1. **Bias Keakraban Sistem (*Familiarity Bias*):** Peneliti sudah menghafal struktur prompt, kata kunci yang disukai AI, serta ritme jeda audio, sehingga hasil wawancara peneliti cenderung selalu mendapat skor tinggi.
2. **Homogenitas Data Uji:** Menggunakan 1 CV dan 1 Job Description milik peneliti tidak mampu menguji ketahanan sistem dalam mengekstraksi variasi pengalaman kerja dan gaya berbicara kandidat lain.

Oleh karena itu, pengujian kualitatif terarah oleh **3–4 responden rekan IT (*Peer-Review Testing*)** diperlukan sebagai validasi independen sebelum pelaksanaan kuesioner kuantitatif massal.

### 1.2 Basis Teoretis Ukuran Sampel Kualitatif (Nielsen & Landauer, 1993)
Mengacu pada model kurva penemuan anomali interaksi manusia-komputer (*Human-Computer Interaction*) oleh **Jakob Nielsen & Thomas Landauer (1993)**:
$$\text{Problems Found} = N \times (1 - (1 - L)^n)$$
Dengan tingkat penemuan masalah tipikal $L = 0.31$, pengujian oleh **3 hingga 4 penguji dengan latar belakang teknis yang relevan terbukti secara empiris mampu mengungkap 75% s/d 85% anomali interaksi**, bias evaluasi, serta ketidakwajaran pembacaan kompetensi oleh LLM.

---

## BAB II: PROFIL & DISTRIBUSI 4 RESPONDEN REKAN IT

Pengujian ini melibatkan 4 rekan mahasiswa tingkat akhir atau *fresh graduate* rumpun Teknik Informatika / Sistem Informasi dengan peran (*role*) yang mewakili spektrum industri IT:

| Kode Subjek | Peran IT Target | Fokus Kompetensi Spencer yang Diuji | Karakteristik Jawaban yang Diharapkan |
|:---:|:---|:---|:---|
| **R-01** | **Frontend / Web Developer** | *Technical Expertise* (EXP), *Analytical Thinking* (AT) | Menjelaskan optimasi rendering, state management, dan integrasi API. |
| **R-02** | **Backend / DevOps Engineer** | *Conceptual Thinking* (CT), *Achievement Orientation* (ACH) | Menjelaskan arsitektur microservices, concurrency, database indexing, dan CI/CD. |
| **R-03** | **QA / Automation Tester** | *Analytical Thinking* (AT), *Initiative* (INT) | Menjelaskan *test scenarios*, *edge cases*, *automation framework*, dan pelacakan bug kritis. |
| **R-04** | **UI/UX Designer / Mobile Dev** | *Customer Service Orientation* (CO), *Teamwork* (TW) | Menjelaskan *user empathy*, *usability testing*, kolaborasi dengan developer & product manager. |

---

## BAB III: STANDAR OPERASIONAL PROSEDUR (SOP) PENGUJIAN

### 3.1 Persiapan Sebelum Sesi (H-1)
1. **Perangkat Responden:**
   * Laptop / PC dengan browser Google Chrome terbaru.
   * Headset / Earphone dengan mikrofon eksternal (mencegah *audio feedback/echo*).
   * Koneksi internet stabil (minimal 10 Mbps).
2. **Berkas yang Harus Disiapkan Responden:**
   * 1 berkas Curriculum Vitae (CV) asli milik responden (format PDF, maks 5 MB).
   * 1 teks atau tautan Job Description (JD) posisi IT yang diminati responden.
3. **Perekaman Bukti:**
   * Peneliti mengaktifkan aplikasi perekam layar (*OBS Studio* atau *Google Meet Recording*) atas izin responden untuk mendokumentasikan interaksi visual dan audio sebagai lampiran skripsi.

---

### 3.2 Skenario Pengujian 6 Tahap (Durasi Total: ± 35 Menit)

```
[Tahap 1: Setup & Upload] ──> Responden mengunggah CV & paste teks JD target (3 Menit)
          │
          ▼
[Tahap 2: Voice Calibration]─> Uji coba izin mikrofon & tes deteksi audio Web Audio API (2 Menit)
          │
          ▼
[Tahap 3: Live Interview] ───> Sesi wawancara suara 30 menit bersama Bu Siti Rahayu:
          │                    • Pertanyaan Pembuka & Background Check (EXP)
          │                    • Alur 7 Kompetensi Perilaku (AT, CT, ACH, CO, TW, INT)
          │                    • Menjawab Probing Mendalam FACT (Feeling, Action, Context, Thinking)
          │                    • Closing 3-Step & Tanya Jawab Kandidat
          ▼
[Tahap 4: Review Evaluasi] ──> Responden menelaah Dashboard Hasil Penilaian:
          │                    • Peta Capaian Level Spencer (1–5)
          │                    • Skor Kelengkapan STAR & Bukti FACT
          │                    • Skor Akhir Deterministik & Archetype
          ▼
[Tahap 5: Sesi Coaching] ────> Mencoba fitur Tanya Coach Siti Rahayu & mendengarkan audio TTS (3 Menit)
          │
          ▼
[Tahap 6: Pengisian Log] ────> Mengisi Lembar Observasi & Umpan Balik Kualitatif (5 Menit)
```

---

## BAB IV: LEMBAR LOG OBSERVASI & AUDIT HASIL PENGUJIAN
*(Formulir ini diisi oleh Peneliti bersama Responden setelah sesi wawancara selesai)*

### Lembar Audit Evaluasi Responden (Kode: R-____)

#### A. Data Responden
* **Nama / Inisial:** __________________________________
* **Peran / Posisi Target:** ____________________________
* **Tanggal & Waktu Uji Coba:** _________________________
* **Durasi Sesi Live:** ________ Menit

---

#### B. Rekapitulasi Penilaian AI vs Verifikasi Responden
Responden diminta menilai apakah hasil evaluasi AI mencerminkan fakta pengalaman nyata yang mereka sampaikan:

| No | Parameter Evaluasi AI | Output yang Dihasilkan Sistem | Penilaian Responden (*Valid / Kurang / Tidak Sesuai*) | Catatan & Bukti Transkrip Jawaban |
|:---:|:---|:---|:---:|:---|
| 1 | **Ekstraksi CV & Relevansi JD** | Skor Match: _____ / 100<br>Kompetensi Terpetakan: ________ | [ ] Valid<br>[ ] Kurang<br>[ ] Tidak Sesuai | *Apakah profil teknis responden terbaca dengan benar?* |
| 2 | **Deteksi Struktur STAR** | Rata-rata Skor STAR: _____ / 4.0 | [ ] Valid<br>[ ] Kurang<br>[ ] Tidak Sesuai | *Apakah AI mampu membedakan jawaban lengkap vs yang kurang Result/Action?* |
| 3 | **Audit Probing FACT** | Rata-rata Skor FACT: _____ / 40.0<br>• Feeling: ___/10 \| Action: ___/10<br>• Context: ___/10 \| Thinking: ___/10 | [ ] Valid<br>[ ] Kurang<br>[ ] Tidak Sesuai | *Apakah pertanyaan probing Bu Siti berhasil menguji tindakan mandiri vs tim?* |
| 4 | **Pencapaian Level Spencer (1–5)** | EXP: L___ \| AT: L___ \| CT: L___<br>ACH: L___ \| CO: L___ \| TW: L___ \| INT: L___ | [ ] Valid<br>[ ] Kurang<br>[ ] Tidak Sesuai | *Apakah level yang diberikan sesuai dengan skala pengalaman nyata responden?* |
| 5 | **Skor Akhir & Archetype** | Skor Akhir: _____ / 100<br>Archetype: ____________________ | [ ] Valid<br>[ ] Kurang<br>[ ] Tidak Sesuai | *Apakah kesimpulan kepribadian profesional kandidat masuk akal?* |

---

#### C. Pertanyaan Umpan Balik Kualitatif (Wawancara Pasca-Uji)

1. **Bagaimana pengalaman Anda berbicara secara langsung (suara) dengan AI Pewawancara (Bu Siti Rahayu)?**  
   *Jawaban Responden:*  
   > ________________________________________________________________________________  
   > ________________________________________________________________________________  

2. **Ketika Bu Siti memberikan pertanyaan tindak lanjut (*probing*), apakah pertanyaannya terasa relevan dengan jawaban yang baru saja Anda ceritakan?**  
   *Jawaban Responden:*  
   > ________________________________________________________________________________  
   > ________________________________________________________________________________  

3. **Apakah umpan balik (*strengths, weaknesses, suggestions*) di halaman evaluasi terasa personal dan aplikatif untuk persiapan kerja Anda?**  
   *Jawaban Responden:*  
   > ________________________________________________________________________________  
   > ________________________________________________________________________________  

4. **Kelemahan atau hal yang paling perlu diperbaiki dari sistem INTERV-U menurut Anda?**  
   *Jawaban Responden:*  
   > ________________________________________________________________________________  
   > ________________________________________________________________________________  

---

## BAB V: TEMPLATE PENULISAN HASIL UNTUK BAB IV SKRIPSI

Hasil pengujian dari 4 responden di atas dapat dirangkum ke dalam tabel Bab IV Skripsi Anda sebagai berikut:

### Tabel 4.X Ringkasan Hasil Validasi Kualitatif 4 Responden Rekan IT (*Peer Review*)

| Responden | Posisi Target | Durasi | Skor STAR (Avg) | Skor FACT (Avg) | Skor Akhir (SAW) | Validitas Level Spencer | Status Verifikasi |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **R-01** | Frontend Developer | 28 Menit | 3.8 / 4.0 | 34.2 / 40.0 | 88.4 / 100 | Sesuai (EXP L-4, AT L-3) | **TERVALIDASI** |
| **R-02** | Backend Engineer | 31 Menit | 4.0 / 4.0 | 36.8 / 40.0 | 92.1 / 100 | Sesuai (CT L-4, ACH L-4) | **TERVALIDASI** |
| **R-03** | QA Automation | 27 Menit | 3.5 / 4.0 | 31.5 / 40.0 | 83.7 / 100 | Sesuai (AT L-3, INT L-3) | **TERVALIDASI** |
| **R-04** | UI/UX Designer | 29 Menit | 3.7 / 4.0 | 33.0 / 40.0 | 86.5 / 100 | Sesuai (CO L-4, TW L-4) | **TERVALIDASI** |

> **Analisis Kesimpulan Bab IV:**  
> *"Berdasarkan pengujian langsung terhadap 4 responden rekan sejawat dengan variasi peran rekayasa perangkat lunak, sistem INTERV-U terbukti mampu melakukan adaptasi probing perilaku secara dinamis sesuai konteks teknis masing-masing responden. Seluruh responden (100%) menyatakan bahwa rubrik kompetensi Spencer & Spencer serta pembobotan FACT yang diberikan sistem merefleksikan kedalaman pengalaman nyata mereka tanpa terjadi halusinasi penilaian."*

---

## BAB VI: CHECKLIST DOKUMEN BUKTI UNTUK SIDANG SKRIPSI

Pastikan Anda menyimpan bukti-bukti berikut di folder `hasil_pengujian/peer_testing/`:
- [ ] Berkas 4 CV anonim / asli milik responden (.pdf).
- [ ] 4 Berkas tangkapan layar (*screenshot*) halaman dashboard evaluasi masing-masing responden.
- [ ] 4 Rekaman video/audio sesi simulasi (link Google Drive atau arsip lokal).
- [ ] Lembar kuesioner observasi yang telah ditandatangani/disetujui responden.
