# LAPORAN PENGUJIAN SISTEM INTERV-U
## Laporan Pengujian Akhir - Data Empiris dari Eksekusi Nyata

> Catatan Integritas Data: Seluruh angka, status, dan output dalam laporan ini adalah data mentah yang dihasilkan langsung oleh script pengujian yang dapat dijalankan ulang. Tidak ada angka karangan, estimasi, atau hasil asumsi.

---

## A. INFORMASI UMUM PENGUJIAN

| Item | Detail |
|:---|:---|
| Nama Sistem | INTERV-U (AI Interview Simulator) |
| Versi Next.js | 15.4.9 |
| Versi React | 19.2.1 |
| Versi Google GenAI SDK | 1.17.0 |
| Versi Firebase | 12.19.0 |
| Tanggal Pengujian | 15 Oktober 2026, 20:41-20:48 WIB |
| OS Penguji | Microsoft Windows 11 Education 64-bit (10.0.22621) |
| CPU | Intel Core i5-7200U @ 2.50GHz (2 Cores, 4 Threads) |
| RAM Total | ~3.87 GB |
| Node.js | v22.16.0 |
| npm | 10.9.2 |
| Playwright | 1.64.1 (Chrome for Testing 156.0.8078.4) |
| Environment | Development (npm run dev, port 3000) |
| Data Uji CV | CV_Avit_Febriansyah.pdf (75.6 KB) |
| Data Uji JD | loker.jpeg (56.2 KB) |
| Kerangka Kompetensi | Spencer & Spencer (1993) Competency Dictionary |

Bukti setup: hasil_pengujian/setup_environment.json

---

## B. RINGKASAN EKSEKUTIF

| Lapisan Pengujian | Total TC | LULUS | GAGAL | Tingkat Lulus |
|:---|:---:|:---:|:---:|:---:|
| Unit & Algorithmic Testing | 10 | 10 | 0 | 100% |
| Black-Box API & Integration Testing | 10 | 10 | 0 | 100% |
| End-to-End Testing (Playwright) | 4 | 4 | 0 | 100% |
| **TOTAL KESELURUHAN** | **24** | **24** | **0** | **100%** |

---

## C. LAPISAN 1 - UNIT & ALGORITHMIC TESTING

Script: hasil_pengujian/scripts/test_unit_algorithms.mjs
Hasil Raw: hasil_pengujian/raw_logs/unit_tests_result.json
Waktu Eksekusi Total: < 1 detik (murni logika JS, tanpa network)

| ID | Nama Test | Status | Detail Hasil |
|:---|:---|:---:|:---|
| TC-UNIT-01 | Filler Words Level clean | LULUS | Total: 0, Level: clean |
| TC-UNIT-02 | Filler Words Level minimal | LULUS | Total: 2, Level: minimal |
| TC-UNIT-03 | Filler Words Level moderate | LULUS | Total: 4, Level: moderate |
| TC-UNIT-04 | Filler Words Level heavy | LULUS | Total: 9, Level: heavy |
| TC-UNIT-05 | Filler Words Resistensi False Positive | LULUS | Total: 0 (kata 'teh' dan 'manual' tidak memicu deteksi) |
| TC-UNIT-06 | Filler Words Case Insensitivity | LULUS | Total: 3 (EH, HMM, KAYAK kapital terdeteksi) |
| TC-UNIT-07 | Audio WAV Header RIFF & WAVE | LULUS | Header 0-4: RIFF, Header 8-12: WAVE |
| TC-UNIT-08 | Audio WAV Spesifikasi Format | LULUS | FormatTag: 1 (PCM), Ch: 1, 24000Hz, 16bit |
| TC-UNIT-09 | JSON Field Extraction Helper | LULUS | Extracted: "Frontend Developer" |
| TC-UNIT-10 | JSON Field Extraction Empty Fallback | LULUS | Extracted: '' (string kosong, bukan null/undefined) |

Catatan: TC-UNIT-01 s/d 06 memvalidasi fungsi analyzeFiller() di lib/evaluate.ts. TC-UNIT-07 & 08 memvalidasi format WAV sesuai spesifikasi Gemini Live API (PCM 24kHz mono 16-bit).

---

## D. LAPISAN 2 - BLACK-BOX API & INTEGRATION TESTING

Script: hasil_pengujian/scripts/test_api_endpoints.mjs
Hasil Raw: hasil_pengujian/raw_logs/api_tests_result.json
Cache Payload: hasil_pengujian/raw_logs/api_payloads_cache.json

| ID | Endpoint & Skenario | Status | Durasi | Detail Output Nyata |
|:---|:---|:---:|---:|:---|
| TC-API-01 | GET /api/live-token Format & Status | LULUS | 1.327 ms | Token Gemini Live diterima (76 chars) |
| TC-API-02 | POST /api/extract CV PDF Riil | LULUS | 15.929 ms | Kandidat: AVIT FEBRIANSYAH, 49 skills, 2 entri pengalaman |
| TC-API-03 | POST /api/extract JD Gambar ke Spencer | LULUS | 19.381 ms | Posisi: Full Stack Developer, 5 kompetensi: EXP, AT, CO, CT, ACH |
| TC-API-04 | POST /api/extract Negatif Input Kosong | LULUS | 5.279 ms | Server menangani gracefully, HTTP 200 (tidak crash) |
| TC-API-05 | POST /api/cross-match CV vs JD | LULUS | 15.112 ms | Match Score: 65/100, 12 matched skills, 5 focus areas |
| TC-API-06 | POST /api/evaluate LLM-as-a-Judge | LULUS | 43.977 ms | Overall: 92/100, Archetype: "The Star Performer", Avg STAR: 4.0/4, Avg FACT: 36.0/40 |
| TC-API-07 | POST /api/coaching Chat Tanya Siti | LULUS | 8.007 ms | Respons: 1.151 chars (kontekstual terhadap evaluasi) |
| TC-API-08 | POST /api/coaching TTS Audio | LULUS | 6.185 ms | Audio PCM: 333.504 chars base64, MIME: audio/L16;codec=pcm;rate=24000 |
| TC-API-09 | POST /api/coaching Practice Retry | LULUS | 7.643 ms | is_better: true, Rating: 8/10, STAR: 3/4 |
| TC-API-10 | POST /api/coaching Highlight Ulasan | LULUS | 7.743 ms | Ulasan lisan: 751 chars |

Catatan TC-API-06 (Inti Sistem): Sistem mengevaluasi transkrip 7 pertanyaan BEI dengan 4 kerangka (STAR, FACT, Spencer & Spencer, ConCISE). Output archetype: "The Star Performer (Jawara Sejati)", Overall Score: 92/100.

---

## E. LAPISAN 3 - END-TO-END TESTING (Playwright Headless)

Script: hasil_pengujian/scripts/test_e2e_playwright.mjs
Hasil Raw: hasil_pengujian/raw_logs/e2e_tests_result.json
Browser: Chrome for Testing 156.0.8078.4 (Playwright Chromium v1.64.1, Headless)
Waktu Eksekusi: 13:48:10 UTC (20:48:10 WIB)

| ID | Skenario | Status | Durasi | Detail |
|:---|:---|:---:|---:|:---|
| TC-E2E-01 | Landing Page Load & Elemen Utama | LULUS | 11.400 ms | Title: Intervyou AI Interview Simulator, H1: AI InterviewSimulator |
| TC-E2E-02 | Halaman Login Form & Tombol | LULUS | 10.857 ms | URL /login, Tombol Google OAuth: ditemukan (1 element) |
| TC-E2E-03 | Responsivitas Mobile View 390px | LULUS | 3.211 ms | Body width = 390px = viewport, tanpa horizontal scroll |
| TC-E2E-04 | Performa Halaman Navigation Timing | LULUS | 2.826 ms | TTFB: 1.636ms, DOM Ready: 2.129ms, Full Load: 2.759ms |

Screenshot Bukti (diambil otomatis oleh Playwright):
- hasil_pengujian/screenshots/e2e01_landing_page.png
- hasil_pengujian/screenshots/e2e02_login_page.png
- hasil_pengujian/screenshots/e2e03_mobile_view.png
- hasil_pengujian/screenshots/e2e04_performance.png

Catatan performa: Diukur pada environment development. Nilai TTFB pada production build akan lebih rendah (tidak ada hot-reload overhead).

---

## F. TEMUAN & CATATAN PENTING

### Temuan 1: Rate Limit API Gemini Free Tier (Kondisional)

Pada satu run awal, TC-API-07 sempat gagal dengan error 429 RESOURCE_EXHAUSTED:
- Quota exceeded: GenerateRequestsPerMinutePerProjectPerModel-FreeTier
- Limit: 5 requests/minute (model: gemini-3-flash)
- Retry setelah: 40 detik

Analisis: Ini bukan bug pada kode aplikasi. Sistem sudah menangani error ini dengan benar, mengembalikan JSON error terstruktur dan tidak crash. Pada run berikutnya setelah cooldown, TC-API-07 berhasil LULUS.

Implikasi untuk Production: API key harus di-upgrade ke tier berbayar, atau diimplementasikan request queue dengan rate limiter exponential backoff.

### Temuan 2: Input Kosong Mengembalikan HTTP 200 (Bukan 400)

TC-API-04 (negative test) menghasilkan HTTP 200 saat menerima input kosong, bukan HTTP 400 (Bad Request) yang lebih tepat secara REST convention. Sistem aman (tidak crash), namun response code semantik bisa diperbaiki di app/api/extract/route.ts.

### Temuan 3: Waktu Respons Extract JD Lebih Lama dari CV

/api/extract untuk JD gambar (19.381ms) lebih lambat dibanding extract CV PDF (15.929ms). Kemungkinan karena proses OCR gambar + pemetaan ke skema kompetensi Spencer membutuhkan reasoning lebih dalam dari Gemini.

---

## G. KESIMPULAN PENGUJIAN

Pengujian dilakukan dalam 3 lapisan dengan total 24 test case terhadap sistem INTERV-U yang berjalan nyata di http://localhost:3000. Semua pengujian menggunakan data riil.

### Hasil Final: 24/24 LULUS (100%)

| Aspek yang Diuji | Hasil |
|:---|:---|
| Logika deteksi filler words (4 level + edge case) | LULUS |
| Format audio WAV untuk Gemini Live API | LULUS - Sesuai spesifikasi PCM 24kHz/16bit |
| Endpoint live-token (autentikasi Live Session) | LULUS - Token valid diterima |
| Ekstraksi data CV dari PDF nyata | LULUS - 49 skills, 2 pengalaman terdeteksi |
| Ekstraksi JD dari gambar ke pemetaan Spencer | LULUS - 5 kompetensi terpetakan |
| Penanganan input negatif/kosong | LULUS - Tidak crash, graceful |
| Gap analysis CV vs JD | LULUS - Match score 65/100 dengan breakdown |
| Evaluasi AI (STAR + FACT + Spencer + ConCISE) | LULUS - Overall 92/100, archetype terbentuk |
| Coaching chat kontekstual | LULUS - Respons relevan dengan konteks evaluasi |
| TTS audio coaching | LULUS - Audio PCM 24kHz valid |
| Practice retry comparison | LULUS - Deteksi improvement benar |
| Landing page dapat dimuat | LULUS - Judul dan H1 terverifikasi |
| Halaman login dan Google OAuth | LULUS - Tombol OAuth ter-render |
| Responsivitas mobile (390px) | LULUS - Tanpa horizontal scroll |
| Performa halaman | LULUS - Full load 2.759ms (< 5s threshold) |

---

## H. DAFTAR BERKAS BUKTI & CARA MENJALANKAN ULANG

Struktur folder hasil_pengujian/:
- setup_environment.json      : Info environment dan dataset pengujian
- LAPORAN_PENGUJIAN_FINAL.md  : Dokumen ini
- scripts/test_unit_algorithms.mjs     : Script unit test
- scripts/test_api_endpoints.mjs       : Script API/integration test
- scripts/test_e2e_playwright.mjs      : Script E2E Playwright
- raw_logs/unit_tests_result.json      : Output mentah 10 unit test
- raw_logs/api_tests_result.json       : Output mentah 10 API test
- raw_logs/api_payloads_cache.json     : Payload response lengkap dari API
- raw_logs/e2e_tests_result.json       : Output mentah 4 E2E test
- screenshots/e2e01_landing_page.png   : Screenshot landing page (1280px)
- screenshots/e2e02_login_page.png     : Screenshot halaman login
- screenshots/e2e03_mobile_view.png    : Screenshot tampilan mobile (390px)
- screenshots/e2e04_performance.png    : Screenshot saat performance timing

Cara menjalankan ulang semua pengujian:

  # Prasyarat: server harus running di port 3000
  npm run dev

  # 1. Unit & Algorithmic Test (< 1 detik, tanpa API key)
  node hasil_pengujian/scripts/test_unit_algorithms.mjs

  # 2. Black-Box API & Integration Test (butuh API key aktif, ~2-3 menit)
  node hasil_pengujian/scripts/test_api_endpoints.mjs

  # 3. E2E Playwright Test (butuh server running, ~30 detik)
  node hasil_pengujian/scripts/test_e2e_playwright.mjs

---

Laporan dibuat berdasarkan output eksekusi nyata pada 15 Oktober 2026, 20:41-20:48 WIB.
Semua angka dapat diverifikasi dengan menjalankan ulang script di folder hasil_pengujian/scripts/.
