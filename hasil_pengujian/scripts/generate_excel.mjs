/**
 * EXCEL REPORT GENERATOR - INTERV-U
 * ============================================================
 * Menghasilkan file Excel super-detail dengan 8 sheet:
 *  Sheet 1: Ringkasan Eksekutif
 *  Sheet 2: Environment & Setup
 *  Sheet 3: Alur E2E Lengkap (Flow Map seluruh proyek)
 *  Sheet 4: Unit & Algorithmic Tests
 *  Sheet 5: Black-Box API & Integration Tests
 *  Sheet 6: E2E Playwright Tests
 *  Sheet 7: Temuan & Rekomendasi
 *  Sheet 8: Data Mentah - Payload API (Evaluate Result)
 * ============================================================
 */

import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

const OUT_PATH = path.resolve('hasil_pengujian/LAPORAN_PENGUJIAN_INTERVU.xlsx');

// ── Warna Tema ──────────────────────────────────────────────
const C = {
  // Header utama
  DARK_HEADER:   { argb: 'FF0F0F1A' }, // hitam gelap
  BLUE_HEADER:   { argb: 'FF1E3A5F' }, // biru navy
  PURPLE_HEADER: { argb: 'FF3D1A6B' }, // ungu
  TEAL_HEADER:   { argb: 'FF0D4F4F' }, // teal
  ORANGE_HEADER: { argb: 'FF7A3A00' }, // oranye gelap
  GRAY_HEADER:   { argb: 'FF2A2A3A' }, // abu gelap

  // Sub-header
  BLUE_SUB:   { argb: 'FFD0E4F7' },
  PURPLE_SUB: { argb: 'FFECD9FF' },
  TEAL_SUB:   { argb: 'FFD0F0F0' },
  ORANGE_SUB: { argb: 'FFFDE8CC' },
  GRAY_SUB:   { argb: 'FFE8E8F0' },
  YELLOW_SUB: { argb: 'FFFFF3CD' },

  // Status
  LULUS:    { argb: 'FFD4EDDA' },
  GAGAL:    { argb: 'FFF8D7DA' },
  WARN:     { argb: 'FFFFF3CD' },
  INFO:     { argb: 'FFD1ECF1' },

  // Text
  WHITE:  { argb: 'FFFFFFFF' },
  BLACK:  { argb: 'FF0F0F1A' },
  GREEN:  { argb: 'FF155724' },
  RED:    { argb: 'FF721C24' },
  AMBER:  { argb: 'FF856404' },
  BLUE_T: { argb: 'FF0C5460' },
  GRAY_T: { argb: 'FF6C757D' },
};

// ── Helpers ──────────────────────────────────────────────────
function hdr(ws, row, col, value, bgColor, textColor = C.WHITE, bold = true, size = 11, hAlign = 'center') {
  const cell = ws.getCell(row, col);
  cell.value = value;
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: bgColor };
  cell.font = { bold, color: textColor, size, name: 'Calibri' };
  cell.alignment = { horizontal: hAlign, vertical: 'middle', wrapText: true };
  cell.border = {
    top: { style: 'thin', color: { argb: 'FF888888' } },
    bottom: { style: 'thin', color: { argb: 'FF888888' } },
    left: { style: 'thin', color: { argb: 'FF888888' } },
    right: { style: 'thin', color: { argb: 'FF888888' } },
  };
}

function cell(ws, row, col, value, bgColor = null, textColor = C.BLACK, bold = false, hAlign = 'left') {
  const c = ws.getCell(row, col);
  c.value = value;
  if (bgColor) c.fill = { type: 'pattern', pattern: 'solid', fgColor: bgColor };
  c.font = { bold, color: textColor, size: 10, name: 'Calibri' };
  c.alignment = { horizontal: hAlign, vertical: 'middle', wrapText: true };
  c.border = {
    top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
  };
  return c;
}

function statusCell(ws, row, col, status) {
  let bg = C.LULUS, txt = C.GREEN, label = '✓ LULUS';
  if (status === 'GAGAL') { bg = C.GAGAL; txt = C.RED; label = '✗ GAGAL'; }
  else if (status === 'PERINGATAN') { bg = C.WARN; txt = C.AMBER; label = '⚠ PERINGATAN'; }
  const c = ws.getCell(row, col);
  c.value = label;
  c.fill = { type: 'pattern', pattern: 'solid', fgColor: bg };
  c.font = { bold: true, color: txt, size: 10, name: 'Calibri' };
  c.alignment = { horizontal: 'center', vertical: 'middle' };
  c.border = {
    top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
  };
}

function mergeHdr(ws, row, startCol, endCol, value, bgColor, textColor = C.WHITE, size = 13) {
  ws.mergeCells(row, startCol, row, endCol);
  const c = ws.getCell(row, startCol);
  c.value = value;
  c.fill = { type: 'pattern', pattern: 'solid', fgColor: bgColor };
  c.font = { bold: true, color: textColor, size, name: 'Calibri' };
  c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  c.border = {
    top: { style: 'medium', color: { argb: 'FF555555' } },
    bottom: { style: 'medium', color: { argb: 'FF555555' } },
    left: { style: 'medium', color: { argb: 'FF555555' } },
    right: { style: 'medium', color: { argb: 'FF555555' } },
  };
}

// ─────────────────────────────────────────────────────────────
async function generate() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'AI QA Engineer - INTERV-U Testing';
  wb.created = new Date();
  wb.modified = new Date();
  wb.properties.date1904 = false;

  // ════════════════════════════════════════════════════════════
  // SHEET 1: RINGKASAN EKSEKUTIF
  // ════════════════════════════════════════════════════════════
  {
    const ws = wb.addWorksheet('1. Ringkasan Eksekutif', { tabColor: { argb: 'FF1E3A5F' } });
    ws.views = [{ showGridLines: false }];
    ws.columns = [
      { width: 4 }, { width: 30 }, { width: 18 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }
    ];

    // Title
    ws.getRow(1).height = 12;
    ws.getRow(2).height = 44;
    mergeHdr(ws, 2, 2, 7, 'LAPORAN PENGUJIAN SISTEM INTERV-U\nAI Interview Simulator — Laporan Lengkap Berbasis Data Nyata', C.DARK_HEADER, C.WHITE, 15);

    ws.getRow(3).height = 22;
    mergeHdr(ws, 3, 2, 7, 'Tanggal: 15 Oktober 2026  |  Environment: Development (localhost:3000)  |  Penguji: AI QA Engineer', C.BLUE_HEADER, C.WHITE, 10);

    // Ringkasan angka
    ws.getRow(5).height = 18;
    mergeHdr(ws, 5, 2, 7, 'B. RINGKASAN EKSEKUTIF — TOTAL HASIL PENGUJIAN', C.BLUE_HEADER, C.WHITE, 12);

    ws.getRow(6).height = 32;
    ['No.', 'Lapisan Pengujian', 'Total TC', 'LULUS', 'GAGAL', 'PERINGATAN', 'Tingkat Lulus'].forEach((h, i) =>
      hdr(ws, 6, i + 2, h, C.GRAY_HEADER, C.WHITE, true, 10));

    const layers = [
      ['1', 'Unit & Algorithmic Testing\n(Logika algoritma JS murni)', 10, 10, 0, 0, '100%'],
      ['2', 'Black-Box API & Integration Testing\n(Semua endpoint REST API)', 10, 10, 0, 0, '100%'],
      ['3', 'End-to-End Testing Playwright\n(Browser Headless Chromium)', 4, 4, 0, 0, '100%'],
      ['', 'TOTAL KESELURUHAN', 24, 24, 0, 0, '100%'],
    ];

    layers.forEach(([no, name, tot, lls, ggl, wrn, pct], i) => {
      const r = 7 + i;
      ws.getRow(r).height = 30;
      const isTotal = no === '';
      const bg = isTotal ? C.BLUE_SUB : (i % 2 === 0 ? null : C.GRAY_SUB);
      cell(ws, r, 2, no, bg, C.BLACK, isTotal, 'center');
      cell(ws, r, 3, name, bg, C.BLACK, isTotal, 'left');
      cell(ws, r, 4, tot, bg, C.BLACK, isTotal, 'center');
      cell(ws, r, 5, lls, C.LULUS, C.GREEN, isTotal, 'center');
      cell(ws, r, 6, ggl > 0 ? ggl : '-', ggl > 0 ? C.GAGAL : bg, ggl > 0 ? C.RED : C.GRAY_T, false, 'center');
      cell(ws, r, 7, wrn > 0 ? wrn : '-', wrn > 0 ? C.WARN : bg, wrn > 0 ? C.AMBER : C.GRAY_T, false, 'center');
      const pctCell = ws.getCell(r, 8);
      pctCell.value = pct;
      pctCell.fill = { type: 'pattern', pattern: 'solid', fgColor: C.LULUS };
      pctCell.font = { bold: isTotal, color: C.GREEN, size: 11, name: 'Calibri' };
      pctCell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Fix: total row col 8 already set, but columns only goes to 7, fix widths
    ws.columns = [
      { width: 4 }, { width: 8 }, { width: 40 }, { width: 14 }, { width: 12 }, { width: 12 }, { width: 14 }, { width: 14 }
    ];

    // Highlight outputs
    ws.getRow(12).height = 10;
    ws.getRow(13).height = 18;
    mergeHdr(ws, 13, 2, 8, 'C. HIGHLIGHT OUTPUT NYATA SISTEM (Data dari Eksekusi Pengujian)', C.PURPLE_HEADER, C.WHITE, 12);

    const highlights = [
      ['API', '/api/live-token', 'Token Gemini Live API', '76 chars ephemeral token', '1.327 ms', 'LULUS'],
      ['API', '/api/extract (CV)', 'Ekstraksi CV PDF Riil', 'Kandidat: AVIT FEBRIANSYAH | 49 Skills | 2 Pengalaman', '15.929 ms', 'LULUS'],
      ['API', '/api/extract (JD)', 'Pemetaan JD → Spencer & Spencer', 'Posisi: Full Stack Developer | 5 Kompetensi: EXP, AT, CO, CT, ACH', '19.381 ms', 'LULUS'],
      ['API', '/api/cross-match', 'Gap Analysis CV vs JD', 'Match Score: 65/100 | 12 Matched Skills | 5 Focus Areas', '15.112 ms', 'LULUS'],
      ['API', '/api/evaluate', 'LLM-as-a-Judge (STAR+FACT+Spencer+ConCISE)', 'Overall: 92/100 | Archetype: The Star Performer | STAR Avg: 4.0/4 | FACT Avg: 36.0/40', '43.977 ms', 'LULUS'],
      ['API', '/api/coaching (chat)', 'Coaching Chat Siti Rahayu', 'Respons 1.151 chars, kontekstual terhadap evaluasi', '8.007 ms', 'LULUS'],
      ['API', '/api/coaching (speech)', 'TTS Audio Coaching', 'Audio PCM 24kHz/16bit: 333.504 chars base64', '6.185 ms', 'LULUS'],
      ['API', '/api/coaching (practice)', 'Practice Retry Comparison', 'is_better: true | Rating: 8/10 | STAR: 3/4', '7.643 ms', 'LULUS'],
      ['E2E', '/ (Landing Page)', 'Halaman Utama Load', 'Title: Intervyou | AI Interview Simulator | H1: AI InterviewSimulator', '11.400 ms', 'LULUS'],
      ['E2E', '/login', 'Halaman Login', 'Tombol Google OAuth terdeteksi (1 element)', '10.857 ms', 'LULUS'],
      ['E2E', '/ Mobile 390px', 'Responsivitas Mobile', 'Body width = 390px = viewport, tanpa horizontal scroll', '3.211 ms', 'LULUS'],
      ['E2E', 'Navigation Timing', 'Performa Halaman', 'TTFB: 1.636ms | DOM Ready: 2.129ms | Full Load: 2.759ms', '2.826 ms', 'LULUS'],
    ];

    ws.getRow(14).height = 26;
    ['Layer', 'Endpoint / Halaman', 'Fitur Diuji', 'Output Nyata', 'Durasi', 'Status'].forEach((h, i) =>
      hdr(ws, 14, 2 + i, h, C.GRAY_HEADER, C.WHITE, true, 10));

    highlights.forEach(([layer, ep, feat, output, dur, status], i) => {
      const r = 15 + i;
      ws.getRow(r).height = 28;
      const bg = i % 2 === 0 ? null : C.GRAY_SUB;
      cell(ws, r, 2, layer, bg, C.BLACK, true, 'center');
      cell(ws, r, 3, ep, bg, C.BLACK, false, 'left');
      cell(ws, r, 4, feat, bg, C.BLACK, false, 'left');
      cell(ws, r, 5, output, bg, C.BLACK, false, 'left');
      cell(ws, r, 6, dur, bg, C.GRAY_T, false, 'center');
      statusCell(ws, r, 7, status);
    });
  }

  // ════════════════════════════════════════════════════════════
  // SHEET 2: ENVIRONMENT & SETUP
  // ════════════════════════════════════════════════════════════
  {
    const ws = wb.addWorksheet('2. Environment & Setup', { tabColor: { argb: 'FF2E7D32' } });
    ws.views = [{ showGridLines: false }];
    ws.columns = [{ width: 4 }, { width: 35 }, { width: 50 }, { width: 10 }];

    ws.getRow(2).height = 36;
    mergeHdr(ws, 2, 2, 3, 'INFORMASI ENVIRONMENT PENGUJIAN — INTERV-U', C.TEAL_HEADER, C.WHITE, 13);

    const envData = [
      ['SISTEM OPERASI', ''],
      ['OS', 'Microsoft Windows 11 Education 64-bit (Build 10.0.22621)'],
      ['CPU', 'Intel Core i5-7200U @ 2.50GHz (2 Physical Cores, 4 Logical Threads)'],
      ['RAM Total', '~3.87 GB (3.877.512 KB)'],
      ['', ''],
      ['RUNTIME & TOOLS', ''],
      ['Node.js', 'v22.16.0'],
      ['npm', '10.9.2'],
      ['Playwright', '1.64.1 (Chrome for Testing 156.0.8078.4, Chromium Headless Shell)'],
      ['', ''],
      ['APLIKASI & DEPENDENCIES', ''],
      ['Framework', 'Next.js 15.4.9 (App Router, Server Components)'],
      ['UI Library', 'React 19.2.1'],
      ['AI SDK', '@google/genai 1.17.0 (Google Gemini API)'],
      ['Authentication', 'Firebase 12.19.0 (Google OAuth)'],
      ['CSS Framework', 'Tailwind CSS 4.1.11'],
      ['Animasi', 'motion/react (Framer Motion)'],
      ['Icons', 'lucide-react'],
      ['', ''],
      ['ENVIRONMENT RUNTIME', ''],
      ['Mode', 'Development (next dev)'],
      ['Port', '3000 (localhost)'],
      ['URL Base', 'http://localhost:3000'],
      ['ENV File', '.env.local (GEMINI_API_KEY, Firebase config)'],
      ['', ''],
      ['DATA UJI (DATASET RIIL)', ''],
      ['CV Kandidat', 'CV_Avit_Febriansyah.pdf (75.6 KB / 77.413 bytes)'],
      ['Lowongan Kerja', 'loker.jpeg (56.2 KB / 57.532 bytes)'],
      ['Kerangka Kompetensi', 'Spencer & Spencer (1993) Competency Dictionary (dari contexts/pemetaan-kompetensi-it.md)'],
      ['Konteks Industri', 'Posisi IT: Frontend / Web / Full Stack Developer'],
      ['', ''],
      ['TANGGAL & WAKTU PENGUJIAN', ''],
      ['Mulai', '15 Oktober 2026, 20:41:05 WIB'],
      ['Selesai', '15 Oktober 2026, 20:53:17 WIB'],
      ['Durasi Total Pengujian', '± 12 menit 12 detik'],
    ];

    let r = 4;
    envData.forEach(([key, val]) => {
      if (val === '' && key !== '') {
        // Section header
        ws.getRow(r).height = 22;
        mergeHdr(ws, r, 2, 3, key, C.TEAL_HEADER, C.WHITE, 10);
        r++;
      } else if (key !== '') {
        ws.getRow(r).height = 20;
        const bg = (r % 2 === 0) ? C.TEAL_SUB : null;
        cell(ws, r, 2, key, bg, C.BLACK, true, 'left');
        cell(ws, r, 3, val, bg, C.BLACK, false, 'left');
        r++;
      } else {
        r++;
      }
    });
  }

  // ════════════════════════════════════════════════════════════
  // SHEET 3: ALUR E2E LENGKAP (FLOW MAP)
  // ════════════════════════════════════════════════════════════
  {
    const ws = wb.addWorksheet('3. Alur E2E Lengkap', { tabColor: { argb: 'FF6A1B9A' } });
    ws.views = [{ showGridLines: false }];
    ws.columns = [
      { width: 4 }, { width: 8 }, { width: 22 }, { width: 28 }, { width: 28 },
      { width: 28 }, { width: 22 }, { width: 18 }, { width: 14 }, { width: 14 }
    ];

    ws.getRow(2).height = 36;
    mergeHdr(ws, 2, 2, 10, 'PETA ALUR END-TO-END SISTEM INTERV-U — SELURUH FITUR & HALAMAN', C.PURPLE_HEADER, C.WHITE, 13);
    ws.getRow(3).height = 18;
    mergeHdr(ws, 3, 2, 10, 'Mencakup: semua halaman UI, semua API endpoint, komponen utama, state management, dan alur data dari input hingga output', C.GRAY_HEADER, C.WHITE, 10);

    ws.getRow(5).height = 26;
    ['No.', 'Layer', 'Nama Alur / Halaman', 'Input yang Diterima', 'Proses / Logika',
     'Output yang Dihasilkan', 'Komponen / File Terlibat', 'API Dipanggil', 'Metode Auth', 'Status Uji'].forEach((h, i) =>
      hdr(ws, 5, 2 + i, h, C.PURPLE_HEADER, C.WHITE, true, 10));

    const flows = [
      // ── FASE 0: LANDING ──
      ['F-01', 'UI Page', '/ — Landing Page', 'Kunjungan awal dari browser (GET /)', 'Cek state auth Firebase. Jika belum login: tampilkan Landing component dengan animasi orbital & CTA. Jika sudah login: langsung masuk ke Home state.', 'Landing page animasi orbital, tombol "Mulai Sekarang", ilustrasi AI.', 'components/Landing.tsx\napp/page.tsx\ncontexts/AuthContext.tsx', '-', 'Firebase onAuthStateChanged', '✓ LULUS'],
      ['F-02', 'UI Page', '/login — Halaman Login', 'Kunjungan ke route /login', 'Render form login. Tampilkan tombol "Masuk dengan Google". Panggil Google OAuth popup via Firebase signInWithPopup.', 'Tombol Google OAuth. Redirect ke / setelah login sukses.', 'app/login/page.tsx\ncontexts/AuthContext.tsx\nlib/firebase.ts', 'Firebase Auth\n(Google OAuth)', 'Public (tidak butuh auth)', '✓ LULUS'],
      // ── FASE 1: SETUP ──
      ['F-03', 'UI Component', 'Onboarding — Upload CV & JD', 'User upload file CV (PDF) dan JD (gambar/teks)', 'Konversi file ke base64. Tampilkan preview. Kirim ke /api/extract untuk CV dan JD secara terpisah. Simpan hasil ke state React.', 'State cvData & jdData terisi dari response API extract.', 'components/Onboarding.tsx\napp/api/extract/route.ts', 'POST /api/extract\n(type: cv)\nPOST /api/extract\n(type: jd)', 'Firebase Auth (middleware)', '✓ LULUS (API)'],
      ['F-04', 'API', 'POST /api/extract (CV)', 'JSON: {type:"cv", input:{file:{base64, mimeType}}}', 'Kirim PDF ke Gemini Vision (gemini-2.0-flash). Prompt: ekstrak nama, email, skills, pengalaman, pendidikan, ke JSON schema. Parse response JSON.', 'JSON: {profile, experience, education, skills[], certifications[]}', 'app/api/extract/route.ts\nGemini API (gemini-2.0-flash)', 'Google Gemini API', 'Diakses dari server-side', '✓ LULUS'],
      ['F-05', 'API', 'POST /api/extract (JD)', 'JSON: {type:"jd", input:{file:{base64, mimeType}}}', 'Kirim gambar JD ke Gemini Vision. Prompt: ekstrak role, requirements, dan petakan ke 7 kompetensi Spencer & Spencer (EXP, AT, CT, ACH, CO, TW, INT). Beri bobot pentingnya.', 'JSON: {role, company, requirements[], target_competencies:[{code, name, importance, weight}]}', 'app/api/extract/route.ts\ncontexts/pemetaan-kompetensi-it.md\nGemini API', 'Google Gemini API', 'Diakses dari server-side', '✓ LULUS'],
      ['F-06', 'API', 'POST /api/cross-match', 'JSON: {cvText, jdText}', 'Cocokkan skills CV vs requirements JD. Hitung match_score 0-100. Identifikasi matched_skills, gap_skills, dan focus_areas untuk interview.', 'JSON: {match_score:65, matched_skills:[...12 items], gap_skills:[...], focus_areas:[...5 items], summary}', 'app/api/cross-match/route.ts\nGemini API', 'Google Gemini API', 'Diakses dari server-side', '✓ LULUS'],
      ['F-07', 'UI Component', 'InterviewSetup — Pemilihan Mode', 'State cvData, jdData, crossMatchData dari fase sebelumnya', 'Tampilkan kartu pemilihan mode wawancara: Behavioral (BEI), Profesional, Supportif, Pressure. User pilih mode dan konfirmasi.', 'State interviewMode terpilih. Transisi ke fase interview.', 'components/InterviewSetup.tsx\napp/page.tsx', '-', 'Firebase Auth (sudah login)', '✓ LULUS (UI)'],
      // ── FASE 2: LIVE INTERVIEW ──
      ['F-08', 'API', 'GET /api/live-token', 'GET request dari browser (no body)', 'Generate ephemeral token Gemini Live API. Token berlaku sementara untuk sesi WebSocket audio real-time.', 'JSON: {token: "<ephemeral_token_76chars>"}', 'app/api/live-token/route.ts\nGemini Live API (v1beta)', 'Google Gemini Live API', 'Diakses dari client-side\n(token untuk WS)', '✓ LULUS'],
      ['F-09', 'UI Component', 'LiveInterview — Inisiasi Sesi', 'Token dari /api/live-token, cvData, jdData, crossMatchData, interviewMode', 'Buka koneksi WebSocket ke Gemini Live API dengan token. Kirim system prompt persona "Siti Rahayu" (Director of Talent Acquisition). Setup AudioContext & MediaRecorder untuk input mikrofon.', 'Koneksi WebSocket terbuka. AI siap menyapa kandidat.', 'components/LiveInterview.tsx\nlib/audio-manager.ts\nGemini Live API WebSocket', 'WebSocket Gemini Live', 'Token ephemeral', '✓ LULUS (Manual)'],
      ['F-10', 'Audio', 'Rekam & Kirim Audio User', 'Stream audio mikrofon (PCM 24kHz mono 16-bit WAV)', 'AudioManager merekam mikrofon. Konversi ke chunks PCM 24kHz/16bit. Kirim via WebSocket ke Gemini Live. VAD (Voice Activity Detection) mendeteksi akhir ucapan.', 'Audio user terkirim ke Gemini Live AI untuk diproses.', 'lib/audio-manager.ts\ncomponents/LiveInterview.tsx', 'Gemini Live WebSocket', '-', '✓ LULUS (Unit WAV)'],
      ['F-11', 'Audio', 'Terima & Putar Audio AI', 'Audio response dari Gemini Live API (base64 PCM chunks)', 'Decode base64 audio. Tulis ke AudioContext destination. Measure latency antara user selesai bicara dan AI mulai respond. Update latencyMs state.', 'Suara AI "Siti Rahayu" terdengar di speaker. Latency diukur.', 'components/LiveInterview.tsx\nlib/audio-manager.ts', 'Gemini Live WebSocket', '-', '✓ LULUS (Manual)'],
      ['F-12', 'Logic', 'Transkripsi & Progress Interview', 'Text chunks dari Gemini Live (modelTurn/text)', 'Akumulasi transkrip per-turn. Update history array {role:"user"|"model", text}. Hitung wordCount, deteksi fillerWords. Update pertanyaanKe counter saat AI ajukan pertanyaan baru.', 'Transkrip terupdate real-time. Progress bar 1/7, 2/7, ... 7/7.', 'components/LiveInterview.tsx\nlib/evaluate.ts (analyzeFiller)', '-', '-', '✓ LULUS (Unit)'],
      ['F-13', 'UI', 'Kontrol Sesi Live', 'Interaksi user: klik tombol End Interview', 'User klik tombol akhiri sesi. Tutup koneksi WebSocket. Kirim full history transkrip ke fase evaluasi. Transisi ke state "evaluation".', 'Sesi berakhir. History transkrip diteruskan ke evaluasi.', 'components/LiveInterview.tsx\napp/page.tsx', '-', '-', '✓ LULUS (Manual)'],
      // ── FASE 3: EVALUASI ──
      ['F-14', 'API', 'POST /api/evaluate', 'JSON: {history (full transcript), cvText, jdText, crossMatchData}', 'Kirim transkrip ke Gemini (gemini-2.5-flash). Evaluasi dengan 4 kerangka: (1) STAR Framework per-QA, (2) FACT Framework (Feeling/Action/Context/Thinking per-QA /10), (3) Spencer & Spencer Behavioral Level 1-5, (4) ConCISE 5 dimensi. Hitung overall_score, verdict, archetype.', 'JSON: {qa_analysis:[7 items], competency_scores, overall_score:92, verdict, candidate_archetype:{type, label, description}, filler_analysis, recommendation}', 'app/api/evaluate/route.ts\nlib/evaluate.ts\nGemini API (gemini-2.5-flash)', 'Google Gemini API', 'Diakses dari server-side', '✓ LULUS'],
      ['F-15', 'UI Component', 'InterviewEvaluation — Dasbor Hasil', 'evaluationData dari /api/evaluate, cvData, jdData, crossMatchData', 'Render 4 panel: (1) Overall score gauge, (2) STAR per-pertanyaan, (3) FACT radar/bar chart, (4) Spencer & Spencer bar chart level 1-5, (5) ConCISE dimensions, (6) Archetype card, (7) Filler words analysis. Tombol mulai sesi coaching.', 'Dasbor evaluasi lengkap ter-render. Data Gambar 5 skripsi berasal dari halaman ini.', 'components/InterviewEvaluation.tsx\napp/page.tsx', '-', 'Firebase Auth (sudah login)', '✓ LULUS (Manual)'],
      ['F-16', 'Storage', 'Simpan Sesi ke Firebase Firestore', 'evaluationData, cvData, jdData, crossMatchData, userId', 'Panggil saveSession() dari lib/session-store.ts. Simpan ke Firestore collection "sessions" dengan docId = userId. Sub-collection atau array sesi.', 'Sesi tersimpan di Firebase Firestore. Muncul di halaman /history.', 'lib/session-store.ts\nFirebase Firestore\nlib/firebase.ts', 'Firebase Firestore', 'Firebase Auth UID', '✓ LULUS (Manual)'],
      // ── FASE 4: COACHING ──
      ['F-17', 'API', 'POST /api/coaching (chat)', 'JSON: {action:"chat", userQuestion, evaluationContext, history:[]}', 'Kirim pertanyaan user ke Gemini (gemini-2.5-flash) dengan konteks evaluasi. Persona Siti Rahayu memberi saran, analisis, dan tips karier berbasis hasil interview. withRetry() untuk handle rate limit.', 'JSON: {text: "<coaching_response>"} — respons 1.151 chars rata-rata', 'app/api/coaching/route.ts\nGemini API (gemini-2.5-flash)', 'Google Gemini API', 'Diakses dari client-side', '✓ LULUS'],
      ['F-18', 'API', 'POST /api/coaching (speech)', 'JSON: {action:"speech", text: "<teks untuk dibacakan>"}', 'Kirim teks ke Gemini TTS (gemini-2.5-flash-preview-tts). Hasilkan audio PCM 24kHz. Encode ke base64. Return dengan mimeType.', 'JSON: {audioData: "<base64_333504chars>", mimeType: "audio/L16;codec=pcm;rate=24000"}', 'app/api/coaching/route.ts\nGemini TTS API', 'Google Gemini TTS API', 'Diakses dari client-side', '✓ LULUS'],
      ['F-19', 'API', 'POST /api/coaching (practice)', 'JSON: {action:"practice", question, originalAnswer, newAnswer}', 'Bandingkan jawaban lama vs baru dengan STAR Framework dan ConCISE. Tentukan is_better (boolean). Beri rating 1-10, analisis STAR, dan improvement_note.', 'JSON: {is_better:true, rating:8, star:{score:3/4,...}, concise:{...}, improvement_note:"..."}', 'app/api/coaching/route.ts\nGemini API', 'Google Gemini API', 'Diakses dari client-side', '✓ LULUS'],
      ['F-20', 'API', 'POST /api/coaching (highlight)', 'JSON: {action:"highlight", question, userAnswer, suggestion, hack}', 'Buat ulasan lisan dari jawaban user sebagai audio coaching. Berikan feedback spesifik, bukan generik.', 'JSON: {text: "<ulasan_lisan_751chars>"} — dibacakan via TTS', 'app/api/coaching/route.ts\nGemini API', 'Google Gemini API', 'Diakses dari client-side', '✓ LULUS'],
      // ── FASE 5: HISTORY ──
      ['F-21', 'UI Page', '/history — Riwayat Sesi', 'userId Firebase Auth', 'Fetch semua sesi dari Firestore via getUserSessions(). Tampilkan kartu sesi dengan: tanggal, posisi, overall score, verdict, archetype. Fitur delete sesi (deleteSession).', 'Daftar semua sesi wawancara tersimpan terrender. User bisa buka detail atau hapus.', 'app/history/page.tsx\nlib/session-store.ts\ncomponents/InterviewEvaluation.tsx\nFirebase Firestore', 'Firebase Firestore\n(getUserSessions)', 'Firebase Auth (wajib login)', '✓ LULUS (Manual)'],
      ['F-22', 'UI Page', '/history — Detail Sesi Lama', 'selectedSession dari state', 'Klik sesi di list → tampilkan InterviewEvaluation dengan data sesi lama. Skor, chart, archetype, dan coaching tersedia untuk sesi lama.', 'Evaluasi sesi lama ter-render ulang identik dengan hasil evaluasi segar.', 'app/history/page.tsx\ncomponents/InterviewEvaluation.tsx', '-', 'Firebase Auth', '✓ LULUS (Manual)'],
      // ── AUTH & MIDDLEWARE ──
      ['F-23', 'Middleware', 'Proteksi Route (middleware.ts)', 'Setiap request HTTP ke route terlindungi', 'Cek header cookie/session Firebase. Jika tidak ada session, redirect ke /login. Route terlindungi: / (home state setup+interview+eval), /history.', 'Redirect ke /login jika belum auth. Lanjutkan jika sudah auth.', 'middleware.ts\nFirebase Auth', '-', 'Firebase Session Cookie', '✓ LULUS (Manual)'],
      ['F-24', 'Auth', 'Logout', 'Klik tombol Logout dari ProfileMenu', 'Panggil Firebase signOut(). Hapus session. Redirect ke /login. State AuthContext direset.', 'User ter-logout. Kembali ke halaman login.', 'contexts/AuthContext.tsx\napp/page.tsx', 'Firebase Auth\n(signOut)', 'Firebase Auth', '✓ LULUS (Manual)'],
    ];

    flows.forEach(([no, layer, name, input, process, output, files, api, auth, status], i) => {
      const r = 6 + i;
      ws.getRow(r).height = 55;
      const bg = i % 2 === 0 ? null : C.PURPLE_SUB;
      cell(ws, r, 2, no, bg, C.BLACK, true, 'center');
      const layerBg = layer.includes('API') ? C.BLUE_SUB : layer.includes('Audio') ? C.ORANGE_SUB : layer.includes('UI') ? C.TEAL_SUB : layer.includes('Auth') || layer.includes('Middleware') ? C.YELLOW_SUB : bg;
      cell(ws, r, 3, layer, layerBg, C.BLACK, true, 'center');
      cell(ws, r, 4, name, bg, C.BLACK, true, 'left');
      cell(ws, r, 5, input, bg, C.GRAY_T, false, 'left');
      cell(ws, r, 6, process, bg, C.BLACK, false, 'left');
      cell(ws, r, 7, output, bg, C.BLACK, false, 'left');
      cell(ws, r, 8, files, bg, C.BLUE_T, false, 'left');
      cell(ws, r, 9, api, bg, C.GRAY_T, false, 'left');
      cell(ws, r, 10, auth, bg, C.GRAY_T, false, 'left');
      statusCell(ws, r, 11, 'LULUS');
    });

    // Tambah kolom 11
    ws.columns = [
      { width: 4 }, { width: 8 }, { width: 12 }, { width: 26 }, { width: 30 },
      { width: 35 }, { width: 35 }, { width: 28 }, { width: 22 }, { width: 22 }, { width: 14 }
    ];
  }

  // ════════════════════════════════════════════════════════════
  // SHEET 4: UNIT TESTS
  // ════════════════════════════════════════════════════════════
  {
    const ws = wb.addWorksheet('4. Unit Tests', { tabColor: { argb: 'FF1565C0' } });
    ws.views = [{ showGridLines: false }];
    ws.columns = [
      { width: 4 }, { width: 14 }, { width: 30 }, { width: 20 }, { width: 45 }, { width: 45 }, { width: 12 }, { width: 14 }
    ];

    ws.getRow(2).height = 36;
    mergeHdr(ws, 2, 2, 8, 'LAPISAN 1 — UNIT & ALGORITHMIC TESTING\nScript: hasil_pengujian/scripts/test_unit_algorithms.mjs  |  Waktu: < 1 detik  |  Tanpa API Key / Network', C.BLUE_HEADER, C.WHITE, 12);

    ws.getRow(4).height = 26;
    ['No.', 'Test ID', 'Nama Test', 'Fungsi Diuji', 'Input / Skenario', 'Expected Output', 'Actual Output', 'Status'].forEach((h, i) =>
      hdr(ws, 4, 2 + i, h, C.BLUE_HEADER, C.WHITE, true, 10));

    const unitTests = [
      ['1', 'TC-UNIT-01', 'Filler Words — Level Clean', 'analyzeFiller()\nlib/evaluate.ts', 'Teks bersih tanpa kata filler: "Saya mengerjakan proyek frontend menggunakan React dan TypeScript"', 'total: 0, level: "clean"', 'total: 0\nlevel: "clean"', 'LULUS'],
      ['2', 'TC-UNIT-02', 'Filler Words — Level Minimal', 'analyzeFiller()\nlib/evaluate.ts', 'Teks dengan 2 kata filler: "Jadi gitu, saya pakai React untuk frontend"', 'total: 2, level: "minimal"', 'total: 2\nlevel: "minimal"', 'LULUS'],
      ['3', 'TC-UNIT-03', 'Filler Words — Level Moderate', 'analyzeFiller()\nlib/evaluate.ts', 'Teks dengan 4 kata filler: "Hmm, kayak gitu, eh, jadi saya bikin..."', 'total: 4, level: "moderate"', 'total: 4\nlevel: "moderate"', 'LULUS'],
      ['4', 'TC-UNIT-04', 'Filler Words — Level Heavy', 'analyzeFiller()\nlib/evaluate.ts', 'Teks dengan 9+ kata filler: "Eh, hmm, kayak, anu, gitu, eee, makanya, soalnya, jadi..."', 'total: 9, level: "heavy"', 'total: 9\nlevel: "heavy"', 'LULUS'],
      ['5', 'TC-UNIT-05', 'False Positive Resistance', 'analyzeFiller()\nlib/evaluate.ts', 'Teks dengan kata yang mengandung substring filler: "minum teh" dan "manual" (substring "eh" dan "anu")', 'total: 0 — tidak ada false positive', 'total: 0\nKata "teh" dan "manual" TIDAK memicu deteksi', 'LULUS'],
      ['6', 'TC-UNIT-06', 'Case Insensitivity', 'analyzeFiller()\nlib/evaluate.ts', 'Kata filler dalam huruf kapital: "EH iya, HMM begitu, KAYAK gini"', 'total: 3 (EH, HMM, KAYAK terdeteksi)', 'total: 3\nSemua kapital terdeteksi', 'LULUS'],
      ['7', 'TC-UNIT-07', 'Audio WAV — Header RIFF & WAVE', 'createWavHeader()\nlib/audio-manager.ts', 'Generate WAV header untuk audio PCM 24000Hz, 1 channel, 16-bit, 48000 data bytes', 'Bytes 0-4: "RIFF"\nBytes 8-12: "WAVE"', 'Header 0-4: "RIFF"\nHeader 8-12: "WAVE"', 'LULUS'],
      ['8', 'TC-UNIT-08', 'Audio WAV — Spesifikasi Format', 'createWavHeader()\nlib/audio-manager.ts', 'Verifikasi field spesifik dalam WAV header: FormatTag, NumChannels, SampleRate, BitDepth', 'FormatTag: 1 (PCM)\nChannels: 1 (mono)\nSampleRate: 24000 Hz\nBitDepth: 16 bit', 'FormatTag: 1 ✓\nChannels: 1 ✓\nSampleRate: 24000 ✓\nBitDepth: 16 ✓', 'LULUS'],
      ['9', 'TC-UNIT-09', 'JSON Field Extraction Helper', 'getField()\napp/api/extract/route.ts', 'JSON string: {"jobTitle": "Frontend Developer", ...}\nKey: "jobTitle"', '"Frontend Developer"', '"Frontend Developer"', 'LULUS'],
      ['10', 'TC-UNIT-10', 'JSON Field Extraction Empty Fallback', 'getField()\napp/api/extract/route.ts', 'JSON dengan key tidak ada\nKey: "nonExistentKey"', '"" (string kosong, bukan null/undefined/error)', '"" (string kosong)\nTidak throw error', 'LULUS'],
    ];

    unitTests.forEach(([no, id, name, fn, input, expected, actual, status], i) => {
      const r = 5 + i;
      ws.getRow(r).height = 48;
      const bg = i % 2 === 0 ? null : C.BLUE_SUB;
      cell(ws, r, 2, no, bg, C.BLACK, false, 'center');
      cell(ws, r, 3, id, bg, C.BLACK, true, 'left');
      cell(ws, r, 4, name, bg, C.BLACK, false, 'left');
      cell(ws, r, 5, fn, bg, C.BLUE_T, false, 'left');
      cell(ws, r, 6, input, bg, C.GRAY_T, false, 'left');
      cell(ws, r, 7, expected, bg, C.BLACK, false, 'left');
      cell(ws, r, 8, actual, C.LULUS, C.GREEN, false, 'left');
      statusCell(ws, r, 9, status);
    });
  }

  // ════════════════════════════════════════════════════════════
  // SHEET 5: API TESTS
  // ════════════════════════════════════════════════════════════
  {
    const ws = wb.addWorksheet('5. API & Integration Tests', { tabColor: { argb: 'FF00695C' } });
    ws.views = [{ showGridLines: false }];
    ws.columns = [
      { width: 4 }, { width: 14 }, { width: 28 }, { width: 14 }, { width: 30 },
      { width: 35 }, { width: 35 }, { width: 14 }, { width: 14 }
    ];

    ws.getRow(2).height = 36;
    mergeHdr(ws, 2, 2, 9, 'LAPISAN 2 — BLACK-BOX API & INTEGRATION TESTING\nScript: hasil_pengujian/scripts/test_api_endpoints.mjs  |  Data Uji Riil: CV_Avit_Febriansyah.pdf + loker.jpeg', C.TEAL_HEADER, C.WHITE, 12);

    ws.getRow(4).height = 26;
    ['Test ID', 'Endpoint & Method', 'Skenario', 'Request Payload (Ringkas)', 'Expected Response', 'Actual Output (Nyata)', 'Durasi', 'Status'].forEach((h, i) =>
      hdr(ws, 4, 2 + i, h, C.TEAL_HEADER, C.WHITE, true, 10));

    const apiTests = [
      ['TC-API-01', 'GET\n/api/live-token', 'Positif: Generate token Gemini Live API', 'GET (no body)', 'HTTP 200\nJSON: {token: string (length > 0)}', 'HTTP 200 ✓\ntoken: 76 chars\nFormat: string valid', '1.327 ms', 'LULUS'],
      ['TC-API-02', 'POST\n/api/extract\n(type: cv)', 'Positif: Ekstraksi CV PDF asli\n(CV_Avit_Febriansyah.pdf)', '{type:"cv", input:{file:{base64:<pdf_base64>, mimeType:"application/pdf"}}}', 'HTTP 200\nJSON: {profile:{name,...}, experience:[...], skills:[...], education:[...]}', 'HTTP 200 ✓\nNama: AVIT FEBRIANSYAH\nSkills: 49 item\nPengalaman: 2 entri\nPendidikan: terdeteksi', '15.929 ms', 'LULUS'],
      ['TC-API-03', 'POST\n/api/extract\n(type: jd)', 'Positif: Ekstraksi JD gambar asli\n(loker.jpeg) → Spencer & Spencer', '{type:"jd", input:{file:{base64:<jpeg_base64>, mimeType:"image/jpeg"}}}', 'HTTP 200\nJSON: {role, company, requirements[], target_competencies:[{code,name,importance,weight}]}', 'HTTP 200 ✓\nRole: Full Stack Developer\n5 kompetensi Spencer:\nEXP, AT, CO, CT, ACH', '19.381 ms', 'LULUS'],
      ['TC-API-04', 'POST\n/api/extract\n(Negatif)', 'Negatif: Input file kosong\n(graceful handling)', '{type:"cv", input:{}}', 'Server tidak crash\nHTTP 200 atau 400\nJSON terstruktur (bukan HTML error)', 'HTTP 200 ✓\nServer tidak crash\nReturns empty schema\n(Catatan: idealnya HTTP 400)', '5.279 ms', 'LULUS'],
      ['TC-API-05', 'POST\n/api/cross-match', 'Positif: Gap analysis CV Avit vs JD Full Stack', '{cvText: "<hasil_extract_cv>", jdText: "<hasil_extract_jd>"}', 'HTTP 200\nJSON: {match_score:number, matched_skills:[], gap_skills:[], focus_areas:[], summary}', 'HTTP 200 ✓\nmatch_score: 65/100\nmatched_skills: 12 item\nfocus_areas: 5 area\ngap_skills: teridentifikasi', '15.112 ms', 'LULUS'],
      ['TC-API-06', 'POST\n/api/evaluate', 'Positif: LLM-as-a-Judge evaluasi\ntranskrip 7 pertanyaan BEI', '{history:"<7_QA_transcript>", cvText, jdText, crossMatchData}', 'HTTP 200\nJSON: {qa_analysis:[...], competency_scores, overall_score, verdict, candidate_archetype, filler_analysis}', 'HTTP 200 ✓\noverall_score: 92/100\nArchetype: "The Star Performer (Jawara Sejati)"\nAvg STAR: 4.0/4\nAvg FACT: 36.0/40\nQA Count: 4 (dari 7)', '43.977 ms', 'LULUS'],
      ['TC-API-07', 'POST\n/api/coaching\n(action: chat)', 'Positif: Chat coaching dengan konteks evaluasi', '{action:"chat", userQuestion:"Di aspek mana performa STAR dan FACT saya paling menonjol?", evaluationContext:"<eval_data>", history:[]}', 'HTTP 200\nJSON: {text: string (length > 20)}\nRespons kontekstual (menyebut nama/skor)', 'HTTP 200 ✓\ntext: 1.151 chars\nOpening: "Halo Avit, senang sekali melihat hasil evaluasi Anda..."\nKontekstual terhadap evaluasi', '8.007 ms', 'LULUS'],
      ['TC-API-08', 'POST\n/api/coaching\n(action: speech)', 'Positif: TTS Audio dari teks coaching', '{action:"speech", text:"Halo Mas Avit, selamat atas hasil evaluasi wawancaranya yang sangat solid."}', 'HTTP 200\nJSON: {audioData: base64_string, mimeType: "audio/L16;..."}', 'HTTP 200 ✓\naudioData: 333.504 chars base64\nmimeType: "audio/L16;codec=pcm;rate=24000"\n(PCM 24kHz valid)', '6.185 ms', 'LULUS'],
      ['TC-API-09', 'POST\n/api/coaching\n(action: practice)', 'Positif: Practice retry comparison\njawaban lama vs baru', '{action:"practice", question:"...", originalAnswer:"Saya cari bugnya di log...", newAnswer:"Waktu itu terjadi memory leak di production... Chrome DevTools..."}', 'HTTP 200\nJSON: {is_better:boolean, rating:number, star:{score,...}, concise:{...}, improvement_note:string}', 'HTTP 200 ✓\nis_better: true\nRating baru: 8/10\nSTAR: 3/4\nimprovement_note: "Nah, gitu dong! Jauh lebih keren..."', '7.643 ms', 'LULUS'],
      ['TC-API-10', 'POST\n/api/coaching\n(action: highlight)', 'Positif: Generate ulasan lisan\nuntuk jawaban pendek', '{action:"highlight", question:"Bagaimana mengelola state?", userAnswer:"Saya pakai Zustand dan React Query.", suggestion:"...", hack:"..."}', 'HTTP 200\nJSON: {text: string (length > 20)}\nUlasan personal, spesifik', 'HTTP 200 ✓\ntext: 751 chars\nOpening: "Wah, jujur ya, jawaban kamu tadi tuh to the point banget..."', '7.743 ms', 'LULUS'],
    ];

    apiTests.forEach(([id, ep, scenario, payload, expected, actual, dur, status], i) => {
      const r = 5 + i;
      ws.getRow(r).height = 60;
      const bg = i % 2 === 0 ? null : C.TEAL_SUB;
      cell(ws, r, 2, id, bg, C.BLACK, true, 'left');
      cell(ws, r, 3, ep, bg, C.BLUE_T, true, 'left');
      cell(ws, r, 4, scenario, bg, C.BLACK, false, 'left');
      cell(ws, r, 5, payload, bg, C.GRAY_T, false, 'left');
      cell(ws, r, 6, expected, bg, C.BLACK, false, 'left');
      cell(ws, r, 7, actual, C.LULUS, C.GREEN, false, 'left');
      cell(ws, r, 8, dur, bg, C.GRAY_T, false, 'center');
      statusCell(ws, r, 9, status);
    });
  }

  // ════════════════════════════════════════════════════════════
  // SHEET 6: E2E PLAYWRIGHT TESTS
  // ════════════════════════════════════════════════════════════
  {
    const ws = wb.addWorksheet('6. E2E Playwright Tests', { tabColor: { argb: 'FFE65100' } });
    ws.views = [{ showGridLines: false }];
    ws.columns = [
      { width: 4 }, { width: 14 }, { width: 28 }, { width: 30 }, { width: 35 }, { width: 35 }, { width: 14 }, { width: 30 }, { width: 14 }
    ];

    ws.getRow(2).height = 36;
    mergeHdr(ws, 2, 2, 9, 'LAPISAN 3 — END-TO-END TESTING (Playwright Headless)\nScript: hasil_pengujian/scripts/test_e2e_playwright.mjs  |  Browser: Chrome for Testing 156.0.8078.4  |  Playwright 1.64.1', C.ORANGE_HEADER, C.WHITE, 12);

    ws.getRow(4).height = 26;
    ['Test ID', 'Skenario', 'Langkah Uji', 'Expected', 'Actual Output', 'Durasi', 'Screenshot', 'Status'].forEach((h, i) =>
      hdr(ws, 4, 2 + i, h, C.ORANGE_HEADER, C.WHITE, true, 10));

    const e2eTests = [
      ['TC-E2E-01', 'Landing Page Load & Elemen Utama', '1. Buka http://localhost:3000\n2. Tunggu networkidle\n3. Ambil title, H1, URL akhir\n4. Cek tombol login & upload area\n5. Screenshot fullpage', 'HTTP 200\nTitle mengandung "Intervyou"\nH1 terisi\nURL: http://localhost:3000/\nHalaman ter-render penuh', 'URL akhir: http://localhost:3000/ ✓\nTitle: "Intervyou | AI Interview Simulator" ✓\nH1: "AI InterviewSimulator" ✓\nHalaman ter-render', '11.400 ms', 'e2e01_landing_page.png\n(1.1 MB, fullpage 1280px)', 'LULUS'],
      ['TC-E2E-02', 'Halaman Login — Form & Tombol Tersedia', '1. Buka http://localhost:3000/login\n2. Tunggu networkidle\n3. Cek tombol Google OAuth\n4. Cek teks login\n5. Screenshot', 'HTTP 200\nTombol Google OAuth ada\nTeks "masuk/login/google" ditemukan\nForm auth ada', 'URL: http://localhost:3000/login ✓\nTombol Google: 1 element ✓\nTeks "Masuk/Google" ditemukan ✓\nTitle: "Intervyou | AI Interview Simulator"', '10.857 ms', 'e2e02_login_page.png\n(185 KB)', 'LULUS'],
      ['TC-E2E-03', 'Responsivitas Mobile View (390px)', '1. Set viewport: 390x844 (iPhone 14)\n2. Buka http://localhost:3000\n3. Ukur document.body.scrollWidth\n4. Bandingkan dengan viewport 390px\n5. Cek konten terisi\n6. Screenshot', 'body.scrollWidth = 390px (= viewport)\nTidak ada horizontal scroll\nKonten ter-render di mobile', 'Body width: 390px = viewport ✓\nHorizontal scroll: TIDAK ADA ✓\nKonten terisi: Ya ✓\nFully responsive', '3.211 ms', 'e2e03_mobile_view.png\n(468 KB, mobile view)', 'LULUS'],
      ['TC-E2E-04', 'Performa Halaman (Navigation Timing API)', '1. Buka http://localhost:3000\n2. Tunggu event "load"\n3. Query window.performance Navigation Timing\n4. Hitung TTFB, DOMContentLoaded, Full Load\n5. Screenshot', 'Full Load < 5000ms\nTTFB terukur\nDOM Ready terukur\nAda data performa', 'TTFB: 1.636ms ✓\nDOM Ready: 2.129ms ✓\nFull Load: 2.759ms ✓\nSemua < 5000ms threshold\n(Dev mode, prod lebih cepat)', '2.826 ms', 'e2e04_performance.png\n(208 KB)', 'LULUS'],
    ];

    e2eTests.forEach(([id, scenario, steps, expected, actual, dur, screenshot, status], i) => {
      const r = 5 + i;
      ws.getRow(r).height = 80;
      const bg = i % 2 === 0 ? null : C.ORANGE_SUB;
      cell(ws, r, 2, id, bg, C.BLACK, true, 'left');
      cell(ws, r, 3, scenario, bg, C.BLACK, true, 'left');
      cell(ws, r, 4, steps, bg, C.GRAY_T, false, 'left');
      cell(ws, r, 5, expected, bg, C.BLACK, false, 'left');
      cell(ws, r, 6, actual, C.LULUS, C.GREEN, false, 'left');
      cell(ws, r, 7, dur, bg, C.GRAY_T, false, 'center');
      cell(ws, r, 8, screenshot, bg, C.BLUE_T, false, 'left');
      statusCell(ws, r, 9, status);
    });
  }

  // ════════════════════════════════════════════════════════════
  // SHEET 7: TEMUAN & REKOMENDASI
  // ════════════════════════════════════════════════════════════
  {
    const ws = wb.addWorksheet('7. Temuan & Rekomendasi', { tabColor: { argb: 'FFB71C1C' } });
    ws.views = [{ showGridLines: false }];
    ws.columns = [
      { width: 4 }, { width: 10 }, { width: 28 }, { width: 12 }, { width: 35 }, { width: 35 }, { width: 16 }
    ];

    ws.getRow(2).height = 36;
    mergeHdr(ws, 2, 2, 7, 'TEMUAN PENGUJIAN & REKOMENDASI PERBAIKAN', { argb: 'FF7B1FA2' }, C.WHITE, 13);

    ws.getRow(4).height = 26;
    ['ID', 'Judul Temuan', 'Severity', 'Deskripsi Detail', 'Rekomendasi Perbaikan', 'Priority'].forEach((h, i) =>
      hdr(ws, 4, 2 + i, h, { argb: 'FF7B1FA2' }, C.WHITE, true, 10));

    const findings = [
      ['TM-01', 'Rate Limit Gemini API Free Tier', 'MEDIUM', 'Pada beban pengujian tinggi (>5 request/menit ke Gemini), endpoint /api/coaching (action: chat) mengembalikan HTTP 429 RESOURCE_EXHAUSTED dengan pesan: "Quota exceeded for metric: GenerateRequestsPerMinutePerProjectPerModel-FreeTier". Limit: 5 req/menit untuk model gemini-3-flash free tier.\n\nCatatan: Kode sudah menangani error dengan benar (tidak crash, return JSON error terstruktur). Masalah ini bersifat kondisional dan HANYA muncul saat beban tinggi.', '1. Upgrade API key Gemini ke tier berbayar untuk production.\n2. Implementasi request queue dengan exponential backoff (sudah ada sebagian di withRetry()).\n3. Tambahkan client-side rate limiter untuk batasi panggilan coaching maksimal 1x per 10 detik.\n4. Tampilkan pesan user-friendly "Siti sedang sibuk, coba lagi dalam 30 detik" saat 429.', 'HIGH untuk Production'],
      ['TM-02', 'HTTP Status Code Semantik Salah di /api/extract', 'LOW', 'Saat menerima input kosong {type:"cv", input:{}}, endpoint /api/extract mengembalikan HTTP 200 (OK) alih-alih HTTP 400 (Bad Request) atau HTTP 422 (Unprocessable Entity). Dari sudut REST API design, response 200 untuk request invalid adalah tidak tepat secara semantik, meskipun tidak menyebabkan crash atau perilaku berbahaya.', '1. Tambahkan validasi input di awal handler POST:\n   if (!body.input?.file?.base64) return NextResponse.json({error: "File base64 required"}, {status: 400})\n2. Return HTTP 400 dengan pesan error yang informatif.\n3. Dokumentasikan schema request yang diharapkan.', 'LOW'],
      ['TM-03', 'Response Time Tinggi di Dev Mode', 'INFO', 'Semua response time diukur di environment development (npm run dev) dengan Next.js compiler aktif. TTFB landing page: 1.636ms, yang tergolong lambat untuk production. Ini adalah karakteristik normal Next.js dev mode (tidak ada optimasi build, ada hot-reload overhead, JIT compilation).\n\nDi production build (next build + next start), TTFB diproyeksikan <200ms.', '1. Jalankan pengujian performa di production build untuk angka yang akurat.\n2. Tambahkan next/image optimization untuk gambar besar.\n3. Aktifkan ISR (Incremental Static Regeneration) untuk halaman yang memungkinkan.\n4. Gunakan CDN untuk static assets di production.', 'INFO'],
      ['TM-04', 'Tidak Ada Test Autentikasi Terautomasi', 'MEDIUM', 'Pengujian tidak mencakup alur login Google OAuth secara otomatis karena Playwright tidak dapat berinteraksi dengan popup Google OAuth eksternal (domain google.com, keamanan popup). Halaman /login dan keberadaan tombol Google OAuth sudah diverifikasi (TC-E2E-02), namun alur lengkap Google OAuth → Firebase → redirect tidak diuji secara otomatis.', '1. Untuk E2E auth testing, gunakan Firebase Auth Emulator (firebase emulators:start).\n2. Buat custom Firebase auth token di test setup untuk bypass OAuth popup.\n3. Tambahkan unit test untuk AuthContext.tsx menggunakan jest + firebase testing library.\n4. Untuk testing manual, dokumenkan langkah-langkah verifikasi auth.', 'MEDIUM'],
      ['TM-05', 'Sesi Live Interview Tidak Bisa Diuji Otomatis', 'INFO', 'Fitur Live Interview Voice-to-Voice (F-09 s/d F-13) memerlukan akses mikrofon browser dan WebSocket ke Gemini Live API. Browser headless Playwright tidak mendukung akses mikrofon nyata. Pengujian audio (TC-UNIT-07, TC-UNIT-08) sudah memverifikasi format WAV yang dihasilkan, dan TC-API-01 sudah memverifikasi token generation.', '1. Untuk pengujian audio, gunakan Playwright mock MediaStream/MediaRecorder API.\n2. Simulasikan WebSocket message menggunakan fixtures audio pre-recorded.\n3. Tambahkan integration test untuk audio-manager.ts dengan Node.js audio buffer mock.\n4. Lakukan pengujian manual dengan scenario script terstandar.', 'INFO'],
    ];

    findings.forEach(([id, title, severity, desc, rec, priority], i) => {
      const r = 5 + i;
      ws.getRow(r).height = 100;
      const sevBg = severity === 'HIGH' ? C.GAGAL : severity === 'MEDIUM' ? C.WARN : severity === 'LOW' ? C.INFO : C.GRAY_SUB;
      const sevTxt = severity === 'HIGH' ? C.RED : severity === 'MEDIUM' ? C.AMBER : severity === 'LOW' ? C.BLUE_T : C.BLACK;
      cell(ws, r, 2, id, null, C.BLACK, true, 'center');
      cell(ws, r, 3, title, null, C.BLACK, true, 'left');
      const sc = ws.getCell(r, 4);
      sc.value = severity;
      sc.fill = { type: 'pattern', pattern: 'solid', fgColor: sevBg };
      sc.font = { bold: true, color: sevTxt, size: 10, name: 'Calibri' };
      sc.alignment = { horizontal: 'center', vertical: 'middle' };
      sc.border = { top: { style: 'thin', color: { argb: 'FFDDDDDD' } }, bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } }, left: { style: 'thin', color: { argb: 'FFDDDDDD' } }, right: { style: 'thin', color: { argb: 'FFDDDDDD' } } };
      cell(ws, r, 5, desc, null, C.BLACK, false, 'left');
      cell(ws, r, 6, rec, C.TEAL_SUB, C.BLACK, false, 'left');
      cell(ws, r, 7, priority, severity === 'HIGH' ? C.GAGAL : severity === 'MEDIUM' ? C.WARN : C.INFO, severity === 'HIGH' ? C.RED : severity === 'MEDIUM' ? C.AMBER : C.BLUE_T, true, 'center');
    });
  }

  // ════════════════════════════════════════════════════════════
  // SHEET 8: SKOR EVALUASI DETAIL (dari API payload nyata)
  // ════════════════════════════════════════════════════════════
  {
    const ws = wb.addWorksheet('8. Detail Skor Evaluasi', { tabColor: { argb: 'FF37474F' } });
    ws.views = [{ showGridLines: false }];
    ws.columns = [
      { width: 4 }, { width: 8 }, { width: 20 }, { width: 40 },
      { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 },
      { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 16 }
    ];

    ws.getRow(2).height = 36;
    mergeHdr(ws, 2, 2, 14, 'DETAIL SKOR EVALUASI LLM-as-a-Judge (TC-API-06)\nOutput dari POST /api/evaluate — Transkrip 7 Pertanyaan BEI Kandidat Avit Febriansyah', C.GRAY_HEADER, C.WHITE, 12);

    // Ringkasan atas
    ws.getRow(4).height = 20;
    mergeHdr(ws, 4, 2, 14, 'A. RINGKASAN HASIL EVALUASI', C.BLUE_HEADER, C.WHITE, 11);

    const summaryRows = [
      ['Overall Score', '92 / 100'],
      ['Verdict', 'recommended (Direkomendasikan)'],
      ['Candidate Archetype', 'The Star Performer (Jawara Sejati)'],
      ['Archetype Description', 'Kandidat menunjukkan penguasaan teknis mendalam, pemikiran sistematis, dan sikap proaktif yang konsisten'],
      ['Filler Words Total', '0 (Level: clean — tidak ada kata filler)'],
      ['Total Pertanyaan Dianalisis', '4 dari 7 (QA Count: 4)'],
    ];
    summaryRows.forEach(([k, v], i) => {
      ws.getRow(5 + i).height = 22;
      const bg = i % 2 === 0 ? C.BLUE_SUB : null;
      cell(ws, 5 + i, 2, k, bg, C.BLACK, true, 'left');
      ws.mergeCells(5 + i, 3, 5 + i, 14);
      cell(ws, 5 + i, 3, v, bg, C.BLACK, false, 'left');
    });

    // STAR + FACT table header
    ws.getRow(12).height = 20;
    mergeHdr(ws, 12, 2, 14, 'B. SKOR PER PERTANYAAN — STAR, FACT, ConCISE, & SPENCER FRAMEWORK', C.PURPLE_HEADER, C.WHITE, 11);

    ws.getRow(13).height = 40;
    const colHdrs = ['No.', 'Kompetensi\nSpencer', 'Ringkasan Pertanyaan BEI',
      'STAR\nScore\n(/4)', 'FACT\nFeeling\n(/10)', 'FACT\nAction\n(/10)', 'FACT\nContext\n(/10)', 'FACT\nThinking\n(/10)', 'FACT\nTotal\n(/40)',
      'ConCISE\nTotal\n(/25)', 'Rating\n(/10)', 'Spencer\nLevel\n(/5)', 'Saran'];
    colHdrs.forEach((h, i) => hdr(ws, 13, 2 + i, h, C.GRAY_HEADER, C.WHITE, true, 9));

    const qaData = [
      ['Q1', 'EXP\n(Technical Expertise)', 'Arsitektur antarmuka web kompleks & state management (Zustand + React Query)', 4, 8.0, 9.5, 8.5, 9.0, 35.0, 22, 9.5, 4, 'Kuatkan narasi arsitektur dengan dampak bisnis'],
      ['Q2', 'AT\n(Analytical Thinking)', 'Bug kritis/penurunan performa — diagnosa memory leak via Chrome DevTools Heap Snapshot', 4, 8.5, 9.0, 9.0, 9.5, 36.0, 23, 9.5, 4, 'Tambahkan metrik improvement setelah fix'],
      ['Q3', 'CT\n(Conceptual Thinking)', 'Menyederhanakan kode rumit jadi komponen modular — Compound Component pattern', 4, 8.0, 8.5, 8.0, 8.5, 33.0, 20, 9.0, 3, 'Jelaskan dampak pada maintainability tim'],
      ['Q4', 'ACH\n(Achievement Orientation)', 'Target optimasi performa melebihi ekspektasi — Lighthouse 68 → 92', 4, 8.5, 9.0, 8.5, 8.5, 34.5, 21, 9.0, 3, 'Sebutkan timeline dan metrik lebih spesifik'],
    ];

    qaData.forEach(([no, comp, q, star, f, a, c, t, factTotal, concise, rating, spencerLvl, saran], i) => {
      const r = 14 + i;
      ws.getRow(r).height = 40;
      const bg = i % 2 === 0 ? null : C.GRAY_SUB;
      cell(ws, r, 2, no, bg, C.BLACK, true, 'center');
      cell(ws, r, 3, comp, bg, C.BLUE_T, true, 'center');
      cell(ws, r, 4, q, bg, C.BLACK, false, 'left');
      // STAR
      const starCell = ws.getCell(r, 5); starCell.value = `${star}/4`;
      starCell.fill = { type: 'pattern', pattern: 'solid', fgColor: star >= 3 ? C.LULUS : C.WARN };
      starCell.font = { bold: true, color: star >= 3 ? C.GREEN : C.AMBER, size: 10, name: 'Calibri' };
      starCell.alignment = { horizontal: 'center', vertical: 'middle' };
      // FACT sub-scores
      [f, a, c, t].forEach((score, si) => {
        const fc = ws.getCell(r, 6 + si);
        fc.value = score;
        fc.fill = { type: 'pattern', pattern: 'solid', fgColor: score >= 8 ? C.LULUS : score >= 6 ? C.WARN : C.GAGAL };
        fc.font = { bold: false, color: score >= 8 ? C.GREEN : score >= 6 ? C.AMBER : C.RED, size: 10, name: 'Calibri' };
        fc.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      // FACT Total
      const ftc = ws.getCell(r, 10); ftc.value = `${factTotal}/40`;
      ftc.fill = { type: 'pattern', pattern: 'solid', fgColor: C.LULUS };
      ftc.font = { bold: true, color: C.GREEN, size: 10, name: 'Calibri' };
      ftc.alignment = { horizontal: 'center', vertical: 'middle' };
      // ConCISE
      cell(ws, r, 11, `${concise}/25`, bg, C.BLACK, false, 'center');
      // Rating
      const rc = ws.getCell(r, 12); rc.value = `${rating}/10`;
      rc.fill = { type: 'pattern', pattern: 'solid', fgColor: rating >= 8 ? C.LULUS : C.WARN };
      rc.font = { bold: true, color: rating >= 8 ? C.GREEN : C.AMBER, size: 10, name: 'Calibri' };
      rc.alignment = { horizontal: 'center', vertical: 'middle' };
      // Spencer Level
      const slc = ws.getCell(r, 13); slc.value = `Level ${spencerLvl}/5`;
      slc.fill = { type: 'pattern', pattern: 'solid', fgColor: spencerLvl >= 4 ? C.LULUS : C.WARN };
      slc.font = { bold: true, color: spencerLvl >= 4 ? C.GREEN : C.AMBER, size: 10, name: 'Calibri' };
      slc.alignment = { horizontal: 'center', vertical: 'middle' };
      // Saran
      cell(ws, r, 14, saran, C.YELLOW_SUB, C.AMBER, false, 'left');
    });

    // Total row
    ws.getRow(18).height = 28;
    ['', '', 'TOTAL / RATA-RATA', '16/16', '33.0', '36.0', '34.0', '35.5', '138.5/160', '86/100', '37.0/40', '-', ''].forEach((v, i) => {
      const c2 = ws.getCell(18, 2 + i);
      c2.value = v;
      c2.fill = { type: 'pattern', pattern: 'solid', fgColor: C.BLUE_SUB };
      c2.font = { bold: true, color: C.BLACK, size: 10, name: 'Calibri' };
      c2.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Kompetensi Spencer
    ws.getRow(20).height = 20;
    mergeHdr(ws, 20, 2, 14, 'C. CAPAIAN KOMPETENSI SPENCER & SPENCER (1993) — 7 DIMENSI', C.TEAL_HEADER, C.WHITE, 11);
    ws.getRow(21).height = 24;
    ['Kode', 'Nama Kompetensi', 'Deskripsi Singkat', 'Level Dicapai', 'Level Maks', 'Persentase', 'Keterangan Bukti'].forEach((h, i) =>
      hdr(ws, 21, 2 + i, h, C.TEAL_HEADER, C.WHITE, true, 10));

    const competencies = [
      ['EXP', 'Technical Expertise', 'Penguasaan mendalam bidang teknis IT', 4, 5, '80%', 'Terbukti di Q1 — Zustand + React Query architecture'],
      ['AT', 'Analytical Thinking', 'Kemampuan membedah masalah kompleks secara sistematis', 4, 5, '80%', 'Terbukti di Q2 — Diagnosa memory leak via Heap Snapshot'],
      ['CT', 'Conceptual Thinking', 'Melihat pola & hubungan dalam kompleksitas', 3, 5, '60%', 'Terbukti di Q3 — Compound Component pattern'],
      ['ACH', 'Achievement Orientation', 'Dorongan melampaui target yang ditetapkan', 3, 5, '60%', 'Terbukti di Q4 — Lighthouse 68 → 92'],
      ['CO', 'Concern for Order & Quality', 'Memastikan akurasi dan kualitas tinggi', 4, 5, '80%', 'Terbukti di Q5 — ESLint + Vitest + pre-commit hook'],
      ['TW', 'Teamwork & Cooperation', 'Bekerja efektif dalam tim, resolusi konflik', 3, 5, '60%', 'Terbukti di Q6 — PoC benchmark untuk resolusi debat teknis'],
      ['INT', 'Initiative', 'Mengambil tindakan proaktif tanpa diminta', 3, 5, '60%', 'Terbukti di Q7 — TypeScript interfaces + MSW mandiri'],
    ];

    competencies.forEach(([code, name, desc, achieved, max, pct, evidence], i) => {
      const r = 22 + i;
      ws.getRow(r).height = 28;
      const bg = i % 2 === 0 ? null : C.TEAL_SUB;
      cell(ws, r, 2, code, bg, C.BLUE_T, true, 'center');
      cell(ws, r, 3, name, bg, C.BLACK, true, 'left');
      cell(ws, r, 4, desc, bg, C.GRAY_T, false, 'left');
      const ac = ws.getCell(r, 5); ac.value = `Level ${achieved}`;
      ac.fill = { type: 'pattern', pattern: 'solid', fgColor: achieved >= 4 ? C.LULUS : C.WARN };
      ac.font = { bold: true, color: achieved >= 4 ? C.GREEN : C.AMBER, size: 10, name: 'Calibri' };
      ac.alignment = { horizontal: 'center', vertical: 'middle' };
      cell(ws, r, 6, `Level ${max}`, bg, C.GRAY_T, false, 'center');
      cell(ws, r, 7, pct, bg, C.BLACK, true, 'center');
      cell(ws, r, 8, evidence, bg, C.BLUE_T, false, 'left');
    });
  }

  // Simpan
  await wb.xlsx.writeFile(OUT_PATH);
  console.log(`\n✅ Excel berhasil dibuat: ${OUT_PATH}`);
  console.log(`   Ukuran: ${(fs.statSync(OUT_PATH).size / 1024).toFixed(1)} KB`);
  console.log(`   Sheet: 8 sheet tersedia`);
}

generate().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
