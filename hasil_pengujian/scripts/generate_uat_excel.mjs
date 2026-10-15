/**
 * SCRIPT GENERATOR EXCEL: INSTRUMEN PENGUJIAN UAT (USER ACCEPTANCE TESTING)
 * Proyek Skripsi: INTERV-U (AI Mock Interview Simulator)
 * Sesuai arahan Dosen Pembimbing: Ibu Chanifah, M.Kom.
 * Berdasarkan Extended Technology Acceptance Model (Davis, 1989) + Evaluasi Multi-Framework AI
 */

import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

const OUT = path.resolve('hasil_pengujian/INSTRUMEN_PENGUJIAN_UAT_RESPONDEN.xlsx');

const C = {
  NAVY_HDR:   { argb: 'FF1A237E' }, // Biru tua formal
  TEAL_HDR:   { argb: 'FF004D40' }, // Teal tua
  DARK_GRAY:  { argb: 'FF263238' }, // Dark charcoal
  TITLE_BG:   { argb: 'FF0D47A1' }, // Biru pekat
  SECTION_BG: { argb: 'FF37474F' }, // Abu-abu gelap
  LULUS:      { argb: 'FFD4EDDA' }, // Hijau muda
  WARNING:    { argb: 'FFFFF3CD' }, // Kuning muda
  WHITE:      { argb: 'FFFFFFFF' },
  BLACK:      { argb: 'FF212121' },
  GREEN_TXT:  { argb: 'FF1B5E20' },
  BLUE_TXT:   { argb: 'FF0D47A1' },
  AMBER_TXT:  { argb: 'FF856404' },
  GRAY_TXT:   { argb: 'FF546E7A' },
  ROW_ALT:    { argb: 'FFF9FAFB' },
  BORDER_COL: { argb: 'FFCFD8DC' },
};

function thinBorder() {
  return {
    top: { style: 'thin', color: C.BORDER_COL },
    bottom: { style: 'thin', color: C.BORDER_COL },
    left: { style: 'thin', color: C.BORDER_COL },
    right: { style: 'thin', color: C.BORDER_COL },
  };
}

function mediumBorder() {
  return {
    top: { style: 'medium', color: C.NAVY_HDR },
    bottom: { style: 'medium', color: C.NAVY_HDR },
    left: { style: 'medium', color: C.NAVY_HDR },
    right: { style: 'medium', color: C.NAVY_HDR },
  };
}

function setCell(ws, row, col, val, bg = null, color = C.BLACK, bold = false, align = 'left', size = 10, italic = false) {
  const cell = ws.getCell(row, col);
  cell.value = val;
  if (bg) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: bg };
  cell.font = { bold, italic, color, size, name: 'Segoe UI' };
  cell.alignment = {
    horizontal: align,
    vertical: 'middle',
    wrapText: true,
  };
  cell.border = thinBorder();
  return cell;
}

function setHyperlinkCell(ws, row, col, label, url, bg = null, bold = false, align = 'left', size = 9) {
  const cell = ws.getCell(row, col);
  cell.value = {
    text: label,
    hyperlink: url,
    tooltip: 'Buka tautan rujukan resmi: ' + url
  };
  if (bg) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: bg };
  cell.font = {
    underline: true,
    color: { argb: 'FF0D47A1' },
    bold,
    size,
    name: 'Segoe UI'
  };
  cell.alignment = {
    horizontal: align,
    vertical: 'middle',
    wrapText: true,
  };
  cell.border = thinBorder();
  return cell;
}

function mergeTitle(ws, row, c1, c2, text, bg, textColor = C.WHITE, size = 11, bold = true, hAlign = 'center') {
  ws.mergeCells(row, c1, row, c2);
  const c = ws.getCell(row, c1);
  c.value = text;
  c.fill = { type: 'pattern', pattern: 'solid', fgColor: bg };
  c.font = { bold, color: textColor, size, name: 'Segoe UI' };
  c.alignment = { horizontal: hAlign, vertical: 'middle', wrapText: true };
  c.border = {
    top: { style: 'medium', color: bg },
    bottom: { style: 'medium', color: bg },
    left: { style: 'medium', color: bg },
    right: { style: 'medium', color: bg },
  };
  return c;
}

async function generate() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Avit Febriansyah - INTERV-U Research Instrument';
  wb.created = new Date();

  // ════════════════════════════════════════════════════════
  // SHEET 1: PANDUAN, SKENARIO & PROFIL RESPONDEN
  // ════════════════════════════════════════════════════════
  {
    const ws = wb.addWorksheet('1. Panduan & Profil Responden', { tabColor: { argb: 'FF1A237E' } });
    ws.views = [{ showGridLines: false }];
    ws.columns = [
      { width: 3 }, { width: 6 }, { width: 32 }, { width: 55 }, { width: 22 }
    ];

    ws.getRow(1).height = 10;
    ws.getRow(2).height = 54;
    mergeTitle(ws, 2, 2, 5,
      'INSTRUMEN PENELITIAN USER ACCEPTANCE TESTING (UAT)\nSISTEM SIMULASI WAWANCARA KERJA BERBASIS AI: INTERV-U\nProgram Studi Informatika / Sistem Informasi — Tahun 2026',
      C.TITLE_BG, C.WHITE, 13);

    ws.getRow(3).height = 24;
    mergeTitle(ws, 3, 2, 5,
      'Peneliti: Avit Febriansyah  |  Dosen Pembimbing: Ibu Chanifah, M.Kom.  |  Objek: INTERV-U AI System',
      C.SECTION_BG, C.WHITE, 10, false);

    // KOTAK PENGANTAR
    ws.getRow(4).height = 12;
    ws.getRow(5).height = 58;
    mergeTitle(ws, 5, 2, 5,
      'PENGANTAR PENELITIAN:\nKuesioner ini dirancang untuk mengukur tingkat keberterimaan pengguna (User Acceptance Testing) terhadap sistem simulasi wawancara kerja cerdas INTERV-U. Sistem ini mengintegrasikan 4 framework evaluasi: STAR, FACT, Spencer & Spencer (1993), dan ConCISE. Partisipasi dan penilaian objektif Saudara/i sangat berharga bagi penyusunan Laporan Tugas Akhir / Skripsi.',
      C.WARNING, C.AMBER_TXT, 9, false, 'left');

    // ALUR PENGUJIAN OLEH RESPONDEN
    ws.getRow(6).height = 12;
    ws.getRow(7).height = 26;
    mergeTitle(ws, 7, 2, 5, 'A. PROTOKOL & SKENARIO TUGAS RESPONDEN SEBELUM MENGISI KUESIONER', C.NAVY_HDR, C.WHITE, 11);

    const steps = [
      ['1', 'Tahap 1: Akses Sistem', 'Buka tautan sistem INTERV-U (localhost:3000 / staging). Pastikan izin mikrofon browser aktif.', '± 1 Menit'],
      ['2', 'Tahap 2: Input Profil & Target', 'Unggah berkas CV (PDF) dan input teks Job Description (JD) posisi yang ingin dilamar.', '± 3 Menit'],
      ['3', 'Tahap 3: Simulasi Live Interview', 'Jalankan sesi wawancara. Jawab 3–4 pertanyaan perilaku kerja (Behavioral Event) menggunakan suara/teks.', '± 7 Menit'],
      ['4', 'Tahap 4: Eksplorasi Laporan Evaluasi', 'Pelajari laporan hasil: skor keseluruhan, deteksi STAR, analisis 4 dimensi FACT, dan capaian level Spencer & Spencer.', '± 4 Menit'],
      ['5', 'Tahap 5: Sesi Coaching & Practice', 'Buka tab AI Coach (Siti Rahayu), ajukan pertanyaan tips, dengarkan audio TTS, dan coba perbaikan jawaban.', '± 3 Menit'],
      ['6', 'Tahap 6: Pengisian Kuesioner', 'Beri penilaian objektif pada 25 butir pernyataan di lembar Sheet 2 kuesioner ini atau formulir online.', '± 4 Menit'],
    ];

    let r = 8;
    ws.getRow(r).height = 24;
    setCell(ws, r, 2, 'No', C.SECTION_BG, C.WHITE, true, 'center', 9);
    setCell(ws, r, 3, 'Tahapan Pengujian', C.SECTION_BG, C.WHITE, true, 'left', 9);
    setCell(ws, r, 4, 'Aktivitas yang Harus Dilakukan Responden', C.SECTION_BG, C.WHITE, true, 'left', 9);
    setCell(ws, r, 5, 'Estimasi Durasi', C.SECTION_BG, C.WHITE, true, 'center', 9);
    r++;

    steps.forEach(([no, tahap, aksi, durasi], idx) => {
      ws.getRow(r).height = 36;
      const bg = idx % 2 === 1 ? C.ROW_ALT : null;
      setCell(ws, r, 2, no, bg, C.BLACK, true, 'center');
      setCell(ws, r, 3, tahap, bg, C.BLUE_TXT, true, 'left');
      setCell(ws, r, 4, aksi, bg, C.BLACK, false, 'left');
      setCell(ws, r, 5, durasi, bg, C.GREEN_TXT, true, 'center');
      r++;
    });

    // FORM DEMOGRAFI RESPONDEN
    r++;
    ws.getRow(r).height = 26;
    mergeTitle(ws, r, 2, 5, 'B. FORMULIR IDENTITAS & PROFIL RESPONDEN (DEMOGRAFI)', C.NAVY_HDR, C.WHITE, 11);
    r++;

    const fields = [
      ['Nama Lengkap / Inisial', 'Contoh: Ahmad F. / AF', '(Tuliskan nama lengkap atau inisial Anda)'],
      ['Jenis Kelamin', 'Laki-laki / Perempuan', '(Pilih salah satu)'],
      ['Usia (Tahun)', 'Contoh: 22', '(Isi angka umur Anda saat ini)'],
      ['Status Pendidikan / Karir', 'Mahasiswa Akhir / Fresh Graduate / Job Seeker / HR Recruiter', '(Pilih kategori status yang paling sesuai)'],
      ['Program Studi / Jurusan', 'Contoh: Teknik Informatika / Sistem Informasi / dll.', '(Nama program studi / jurusan Anda)'],
      ['Pengalaman Wawancara Kerja', 'Belum Pernah / 1-2 Kali / 3-5 Kali / > 5 Kali', '(Frekuensi wawancara kerja yang pernah dialami)'],
      ['Bidang / Posisi Target', 'Contoh: Frontend Developer / HR Staff / Data Analyst', '(Posisi pekerjaan yang disimulasikan di INTERV-U)'],
    ];

    fields.forEach(([label, contoh, keterangan], idx) => {
      ws.getRow(r).height = 28;
      const bg = idx % 2 === 1 ? C.ROW_ALT : null;
      setCell(ws, r, 2, idx + 1, bg, C.GRAY_TXT, false, 'center');
      setCell(ws, r, 3, label, bg, C.BLACK, true, 'left');
      setCell(ws, r, 4, '................................................................................', bg, C.GRAY_TXT, false, 'left');
      setCell(ws, r, 5, keterangan, bg, C.GRAY_TXT, false, 'left', 9, true);
      r++;
    });
  }

  // ════════════════════════════════════════════════════════
  // SHEET 2: KUESIONER UAT (25 BUTIR LIKERT 1-5)
  // ════════════════════════════════════════════════════════
  {
    const ws = wb.addWorksheet('2. Kuesioner UAT (25 Butir)', { tabColor: { argb: 'FF004D40' } });
    ws.views = [{ showGridLines: false }];
    ws.columns = [
      { width: 3 }, { width: 6 }, { width: 12 }, { width: 22 }, { width: 56 },
      { width: 7 }, { width: 7 }, { width: 7 }, { width: 7 }, { width: 7 }, { width: 11 }
    ];

    ws.getRow(1).height = 10;
    ws.getRow(2).height = 45;
    mergeTitle(ws, 2, 2, 11,
      'LEMBAR KUESIONER USER ACCEPTANCE TESTING (UAT) — SKALA LIKERT 1-5\nEvaluasi Penerimaan Sistem INTERV-U Berbasis Extended TAM (Davis, 1989)',
      C.TEAL_HDR, C.WHITE, 12);

    ws.getRow(3).height = 30;
    mergeTitle(ws, 3, 2, 11,
      'Petunjuk: Beri tanda centang (✓) atau angka skor (1-5) pada kolom pilihan:\nSTS = 1 (Sangat Tidak Setuju) | TS = 2 (Tidak Setuju) | N = 3 (Netral) | S = 4 (Setuju) | SS = 5 (Sangat Setuju)',
      C.WARNING, C.AMBER_TXT, 9, false);

    let r = 4;
    ws.getRow(r).height = 26;
    setCell(ws, r, 2, 'No', C.SECTION_BG, C.WHITE, true, 'center', 9);
    setCell(ws, r, 3, 'Kode', C.SECTION_BG, C.WHITE, true, 'center', 9);
    setCell(ws, r, 4, 'Variabel TAM / AI', C.SECTION_BG, C.WHITE, true, 'left', 9);
    setCell(ws, r, 5, 'Pernyataan Evaluasi Sistem INTERV-U', C.SECTION_BG, C.WHITE, true, 'left', 9);
    setCell(ws, r, 6, 'STS\n(1)', C.SECTION_BG, C.WHITE, true, 'center', 8);
    setCell(ws, r, 7, 'TS\n(2)', C.SECTION_BG, C.WHITE, true, 'center', 8);
    setCell(ws, r, 8, 'N\n(3)', C.SECTION_BG, C.WHITE, true, 'center', 8);
    setCell(ws, r, 9, 'S\n(4)', C.SECTION_BG, C.WHITE, true, 'center', 8);
    setCell(ws, r, 10, 'SS\n(5)', C.SECTION_BG, C.WHITE, true, 'center', 8);
    setCell(ws, r, 11, 'Skor (1-5)', C.SECTION_BG, C.WHITE, true, 'center', 9);
    r++;

    const items = [
      // DIMENSI 1: PU
      ['SECTION', 'DIMENSI A: PERCEIVED USEFULNESS (PU) — PERSEPSI KEGUNAAN'],
      ['1', 'PU-01', 'Perceived Usefulness', 'Sistem INTERV-U membantu saya mempersiapkan diri lebih percaya diri dalam menghadapi wawancara kerja yang sebenarnya.'],
      ['2', 'PU-02', 'Perceived Usefulness', 'Umpan balik berbasis framework STAR (Situation, Task, Action, Result) memudahkan saya menyusun jawaban wawancara yang lebih terstruktur dan berbobot.'],
      ['3', 'PU-03', 'Perceived Usefulness', 'Evaluasi framework FACT (Feeling, Action, Context, Thinking) membantu saya memastikan jawaban tidak hanya teori hafalan, tetapi mencerminkan aksi nyata.'],
      ['4', 'PU-04', 'Perceived Usefulness', 'Pemetaan kompetensi Spencer & Spencer (1993) membantu saya mengetahui level kemampuan perilaku kerja saya secara kuantitatif (Level 1-5).'],
      ['5', 'PU-05', 'Perceived Usefulness', 'Fitur contoh jawaban yang lebih baik (Better Answer Example) dan trik wawancara (Hack) memberikan referensi konkret untuk peningkatan kualitas jawaban.'],

      // DIMENSI 2: PEOU
      ['SECTION', 'DIMENSI B: PERCEIVED EASE OF USE (PEOU) — PERSEPSI KEMUDAHAN PENGGUNAAN'],
      ['6', 'PEOU-01', 'Ease of Use', 'Antarmuka pengguna (User Interface) INTERV-U modern, bersih, dan mudah dipahami langkah penggunaannya.'],
      ['7', 'PEOU-02', 'Ease of Use', 'Proses unggah dokumen CV dan pengisian teks kualifikasi Job Description (JD) berlangsung cepat, praktis, dan tidak membingungkan.'],
      ['8', 'PEOU-03', 'Ease of Use', 'Interaksi tanya jawab selama simulasi wawancara langsung (Live Interview) terasa alami dan mudah dioperasikan.'],
      ['9', 'PEOU-04', 'Ease of Use', 'Laporan evaluasi hasil wawancara (skor angka, diagram kompetensi, dan status ringkasan) disajikan secara informatif dan mudah dipahami.'],
      ['10', 'PEOU-05', 'Ease of Use', 'Saya dapat mengoperasikan seluruh alur sistem INTERV-U secara mandiri tanpa memerlukan buku panduan khusus atau bantuan teknis rumit.'],

      // DIMENSI 3: AQ
      ['SECTION', 'DIMENSI C: AI EVALUATION & FEEDBACK QUALITY (AQ) — KUALITAS EVALUASI AI'],
      ['11', 'AQ-01', 'AI Quality', 'Pertanyaan wawancara yang diajukan oleh AI selaras dan relevan dengan profil CV serta kualifikasi posisi pekerjaan yang saya lamar.'],
      ['12', 'AQ-02', 'AI Quality', 'Deteksi kelengkapan komponen STAR beserta kutipan bukti (evidence) dari kalimat jawaban saya dinilai akurat dan objektif.'],
      ['13', 'AQ-03', 'AI Quality', 'Skor 4 dimensi FACT (Feeling, Action, Context, Thinking) mampu menilai keaslian pengalaman nyata dan kedalaman tindakan saya dengan tepat.'],
      ['14', 'AQ-04', 'AI Quality', 'Penetapan level kompetensi Spencer & Spencer (Level 1-5) beserta catatannya logis dan sesuai dengan pembuktian pada jawaban saya.'],
      ['15', 'AQ-05', 'AI Quality', 'Kategorisasi tipe kandidat (Candidate Archetype) dan rekomendasi akhir (Verdict) mencerminkan performa wawancara saya secara komprehensif.'],

      // DIMENSI 4: CE
      ['SECTION', 'DIMENSI D: COACHING & INTERACTIVE EXPERIENCE (CE) — KUALITAS COACHING & AUDIO'],
      ['16', 'CE-01', 'Coaching Quality', 'Interaksi dengan AI Career Coach (Persona: Siti Rahayu) terasa responsif, komunikatif, dan menyerupai bimbingan konsultan karir profesional.'],
      ['17', 'CE-02', 'Coaching Quality', 'Saran perbaikan jawaban dari AI Coach bersifat taktis, membangun, dan langsung dapat saya terapkan pada latihan sesi berikutnya.'],
      ['18', 'CE-03', 'Coaching Quality', 'Fitur latihan ulang (Practice Mode) membantu saya memperbaiki kelemahan jawaban sebelumnya dengan panduan saran perbaikan.'],
      ['19', 'CE-04', 'Coaching Quality', 'Kualitas audio Text-to-Speech (TTS) dari sistem terdengar jernih, natural, dan memiliki intonasi artikulasi yang nyaman didengar.'],
      ['20', 'CE-05', 'Coaching Quality', 'Analisis kata pengisi (Filler Words) membantu saya menyadari kebiasaan jeda bicara (misal: "ehm", "anu") agar bicara lebih tenang.'],

      // DIMENSI 5: BI
      ['SECTION', 'DIMENSI E: BEHAVIORAL INTENTION & SATISFACTION (BI) — NIAT PENGGUNAAN & KEPUASAN'],
      ['21', 'BI-01', 'Behavioral Intention', 'Secara menyeluruh, saya merasa sangat puas dengan pengalaman menggunakan sistem simulasi wawancara INTERV-U.'],
      ['22', 'BI-02', 'Behavioral Intention', 'Saya berencana akan menggunakan kembali sistem INTERV-U sebelum saya menghadapi jadwal wawancara kerja yang sebenarnya.'],
      ['23', 'BI-03', 'Behavioral Intention', 'Saya akan merekomendasikan sistem simulasi wawancara INTERV-U kepada teman kuliah, rekan pencari kerja, atau komunitas saya.'],
      ['24', 'BI-04', 'Behavioral Intention', 'Sistem INTERV-U jauh lebih efektif dan mendalam dibandingkan latihan wawancara konvensional mandiri di depan cermin.'],
      ['25', 'BI-05', 'Behavioral Intention', 'Sistem INTERV-U sangat layak diadopsi oleh Pusat Karir Kampus / Career Development Center sebagai sarana persiapan karir mahasiswa.'],
    ];

    items.forEach((item) => {
      if (item[0] === 'SECTION') {
        ws.getRow(r).height = 24;
        mergeTitle(ws, r, 2, 11, item[1], C.TEAL_HDR, C.WHITE, 10, true, 'left');
        r++;
        return;
      }
      const [no, kode, varName, teks] = item;
      ws.getRow(r).height = 42;
      const bg = parseInt(no) % 2 === 0 ? C.ROW_ALT : null;
      setCell(ws, r, 2, no, bg, C.BLACK, false, 'center');
      setCell(ws, r, 3, kode, bg, C.BLUE_TXT, true, 'center');
      setCell(ws, r, 4, varName, bg, C.GRAY_TXT, false, 'left', 9);
      setCell(ws, r, 5, teks, bg, C.BLACK, false, 'left', 9.5);
      setCell(ws, r, 6, '', bg, C.BLACK, false, 'center');
      setCell(ws, r, 7, '', bg, C.BLACK, false, 'center');
      setCell(ws, r, 8, '', bg, C.BLACK, false, 'center');
      setCell(ws, r, 9, '', bg, C.BLACK, false, 'center');
      setCell(ws, r, 10, '', bg, C.BLACK, false, 'center');
      setCell(ws, r, 11, '', C.WARNING, C.BLACK, true, 'center');
      r++;
    });

    // PERTANYAAN KUALITATIF TERBUKA
    r++;
    ws.getRow(r).height = 26;
    mergeTitle(ws, r, 2, 11, 'FEEDBACK KUALITATIF & SARAN PENGEMBANGAN TERBUKA', C.SECTION_BG, C.WHITE, 10, true, 'left');
    r++;

    const openQuestions = [
      '1. Fitur apa dari INTERV-U yang menurut Anda paling membantu dan memberikan dampak positif paling besar? Jelaskan alasannya.',
      '2. Kendala, kebingungan, atau kesulitan teknis apa yang Anda rasakan selama menggunakan sistem INTERV-U?',
      '3. Apa saran atau fitur tambahan yang menurut Anda perlu ditambahkan untuk menyempurnakan sistem INTERV-U ke depannya?',
    ];

    openQuestions.forEach((q) => {
      ws.getRow(r).height = 24;
      mergeTitle(ws, r, 2, 11, q, C.ROW_ALT, C.BLACK, 9, true, 'left');
      r++;
      ws.getRow(r).height = 50;
      mergeTitle(ws, r, 2, 11, '(Tuliskan jawaban saran Anda di sini...)', null, C.GRAY_TXT, 9, false, 'left');
      r++;
    });
  }

  // ════════════════════════════════════════════════════════
  // SHEET 3: FORMAT REKAPITULASI DATA UAT (N=30)
  // ════════════════════════════════════════════════════════
  {
    const ws = wb.addWorksheet('3. Rekap Data UAT (N=30)', { tabColor: { argb: 'FF0D47A1' } });
    ws.views = [{ showGridLines: false }];

    // Kolom: Responden, 25 Butir Item (PU01..BI05), Total Skor, Rata-rata, % Kelayakan, Kategori
    const cols = [{ width: 3 }, { width: 14 }];
    for (let i = 1; i <= 25; i++) cols.push({ width: 6.5 });
    cols.push({ width: 11 }, { width: 11 }, { width: 13 }, { width: 18 });
    ws.columns = cols;

    ws.getRow(1).height = 10;
    ws.getRow(2).height = 42;
    mergeTitle(ws, 2, 2, 31,
      'TABEL REKAPITULASI DATA MENTAH PENGUJIAN USER ACCEPTANCE TESTING (UAT)\nTemplate Pengumpulan Skor Skala Likert 1-5 (N = 30 Responden) — Rumus Otomatis Aktif',
      C.NAVY_HDR, C.WHITE, 12);

    // Sub Header Dimensi
    ws.getRow(3).height = 22;
    setCell(ws, 3, 2, '', C.SECTION_BG);
    mergeTitle(ws, 3, 3, 7, 'PU (Kegunaan)', C.TEAL_HDR, C.WHITE, 9);
    mergeTitle(ws, 3, 8, 12, 'PEOU (Kemudahan)', C.TITLE_BG, C.WHITE, 9);
    mergeTitle(ws, 3, 13, 17, 'AQ (Kualitas AI)', { argb: 'FF4A148C' }, C.WHITE, 9);
    mergeTitle(ws, 3, 18, 22, 'CE (Coaching)', { argb: 'FFE65100' }, C.WHITE, 9);
    mergeTitle(ws, 3, 23, 27, 'BI (Niat Pakai)', { argb: 'FF004D40' }, C.WHITE, 9);
    mergeTitle(ws, 3, 28, 31, 'REKAPITULASI INDIVIDUAL', C.SECTION_BG, C.WHITE, 9);

    // Header Kolom Butir
    ws.getRow(4).height = 24;
    setCell(ws, 4, 2, 'Responden', C.DARK_GRAY, C.WHITE, true, 'center', 9);
    const itemCodes = [
      'PU1', 'PU2', 'PU3', 'PU4', 'PU5',
      'PE1', 'PE2', 'PE3', 'PE4', 'PE5',
      'AQ1', 'AQ2', 'AQ3', 'AQ4', 'AQ5',
      'CE1', 'CE2', 'CE3', 'CE4', 'CE5',
      'BI1', 'BI2', 'BI3', 'BI4', 'BI5',
    ];
    itemCodes.forEach((code, idx) => {
      setCell(ws, 4, 3 + idx, code, C.DARK_GRAY, C.WHITE, true, 'center', 8.5);
    });
    setCell(ws, 4, 28, 'Total Skor', C.DARK_GRAY, C.WHITE, true, 'center', 9);
    setCell(ws, 4, 29, 'Rata-rata', C.DARK_GRAY, C.WHITE, true, 'center', 9);
    setCell(ws, 4, 30, '% Kelayakan', C.DARK_GRAY, C.WHITE, true, 'center', 9);
    setCell(ws, 4, 31, 'Interpretasi Kategori', C.DARK_GRAY, C.WHITE, true, 'center', 9);

    // 30 Baris Responden
    let startRow = 5;
    for (let i = 1; i <= 30; i++) {
      const rNum = startRow + i - 1;
      ws.getRow(rNum).height = 20;
      const bg = i % 2 === 0 ? C.ROW_ALT : null;
      setCell(ws, rNum, 2, `Resp-${String(i).padStart(2, '0')}`, bg, C.BLACK, true, 'center');

      // Sel skor kosong untuk diisi
      for (let c = 3; c <= 27; c++) {
        setCell(ws, rNum, c, null, bg, C.BLACK, false, 'center');
      }

      // Rumus Excel Otomatis
      // Total: =SUM(C5:AA5)
      const cStart = ws.getColumn(3).letter;
      const cEnd = ws.getColumn(27).letter;
      
      const cellTot = ws.getCell(rNum, 28);
      cellTot.value = { formula: `SUM(${cStart}${rNum}:${cEnd}${rNum})` };
      cellTot.fill = { type: 'pattern', pattern: 'solid', fgColor: bg || C.WHITE };
      cellTot.font = { bold: true, name: 'Segoe UI', size: 9 };
      cellTot.alignment = { horizontal: 'center', vertical: 'middle' };
      cellTot.border = thinBorder();

      // Rata-rata: =AVERAGE(C5:AA5)
      const cellAvg = ws.getCell(rNum, 29);
      cellAvg.value = { formula: `AVERAGE(${cStart}${rNum}:${cEnd}${rNum})` };
      cellAvg.numFmt = '0.00';
      cellAvg.fill = { type: 'pattern', pattern: 'solid', fgColor: bg || C.WHITE };
      cellAvg.font = { bold: true, name: 'Segoe UI', size: 9 };
      cellAvg.alignment = { horizontal: 'center', vertical: 'middle' };
      cellAvg.border = thinBorder();

      // % Kelayakan: =(AB5/(25*5))*100%
      const cellPct = ws.getCell(rNum, 30);
      cellPct.value = { formula: `(${ws.getColumn(28).letter}${rNum}/(25*5))` };
      cellPct.numFmt = '0.00%';
      cellPct.fill = { type: 'pattern', pattern: 'solid', fgColor: C.LULUS };
      cellPct.font = { bold: true, color: C.GREEN_TXT, name: 'Segoe UI', size: 9 };
      cellPct.alignment = { horizontal: 'center', vertical: 'middle' };
      cellPct.border = thinBorder();

      // Kategori: IF formula
      const cellCat = ws.getCell(rNum, 31);
      const colPctLetter = ws.getColumn(30).letter;
      cellCat.value = {
        formula: `IF(${colPctLetter}${rNum}>=0.81,"SANGAT LAYAK",IF(${colPctLetter}${rNum}>=0.61,"LAYAK",IF(${colPctLetter}${rNum}>=0.41,"CUKUP LAYAK","KURANG LAYAK")))`
      };
      cellCat.fill = { type: 'pattern', pattern: 'solid', fgColor: bg || C.WHITE };
      cellCat.font = { bold: true, color: C.NAVY_HDR, name: 'Segoe UI', size: 9 };
      cellCat.alignment = { horizontal: 'center', vertical: 'middle' };
      cellCat.border = thinBorder();
    }

    // Baris Summary / Total Bawah
    const sumRow = startRow + 30;
    ws.getRow(sumRow).height = 26;
    setCell(ws, sumRow, 2, 'RATA-RATA TOTAL', C.TITLE_BG, C.WHITE, true, 'center');
    for (let c = 3; c <= 27; c++) {
      const colLetter = ws.getColumn(c).letter;
      const cCell = ws.getCell(sumRow, c);
      cCell.value = { formula: `AVERAGE(${colLetter}${startRow}:${colLetter}${sumRow - 1})` };
      cCell.numFmt = '0.00';
      cCell.fill = { type: 'pattern', pattern: 'solid', fgColor: C.TITLE_BG };
      cCell.font = { bold: true, color: C.WHITE, name: 'Segoe UI', size: 8.5 };
      cCell.alignment = { horizontal: 'center', vertical: 'middle' };
      cCell.border = thinBorder();
    }

    // Rekap akhir
    const c28 = ws.getCell(sumRow, 28);
    c28.value = { formula: `AVERAGE(${ws.getColumn(28).letter}${startRow}:${ws.getColumn(28).letter}${sumRow - 1})` };
    c28.numFmt = '0.0';
    c28.fill = { type: 'pattern', pattern: 'solid', fgColor: C.TITLE_BG };
    c28.font = { bold: true, color: C.WHITE, name: 'Segoe UI', size: 9 };
    c28.alignment = { horizontal: 'center', vertical: 'middle' };
    c28.border = thinBorder();

    const c29 = ws.getCell(sumRow, 29);
    c29.value = { formula: `AVERAGE(${ws.getColumn(29).letter}${startRow}:${ws.getColumn(29).letter}${sumRow - 1})` };
    c29.numFmt = '0.00';
    c29.fill = { type: 'pattern', pattern: 'solid', fgColor: C.TITLE_BG };
    c29.font = { bold: true, color: C.WHITE, name: 'Segoe UI', size: 9 };
    c29.alignment = { horizontal: 'center', vertical: 'middle' };
    c29.border = thinBorder();

    const c30 = ws.getCell(sumRow, 30);
    c30.value = { formula: `AVERAGE(${ws.getColumn(30).letter}${startRow}:${ws.getColumn(30).letter}${sumRow - 1})` };
    c30.numFmt = '0.00%';
    c30.fill = { type: 'pattern', pattern: 'solid', fgColor: C.LULUS };
    c30.font = { bold: true, color: C.GREEN_TXT, name: 'Segoe UI', size: 10 };
    c30.alignment = { horizontal: 'center', vertical: 'middle' };
    c30.border = thinBorder();

    const c31 = ws.getCell(sumRow, 31);
    c31.value = {
      formula: `IF(${ws.getColumn(30).letter}${sumRow}>=0.81,"SANGAT DITERIMA (SANGAT BAIK)",IF(${ws.getColumn(30).letter}${sumRow}>=0.61,"DITERIMA (BAIK)","CUKUP / PERLU REVISI"))`
    };
    c31.fill = { type: 'pattern', pattern: 'solid', fgColor: C.TITLE_BG };
    c31.font = { bold: true, color: C.WHITE, name: 'Segoe UI', size: 9 };
    c31.alignment = { horizontal: 'center', vertical: 'middle' };
    c31.border = thinBorder();
  }

  // ════════════════════════════════════════════════════════
  // SHEET 4: RUBRIK & RUMUS INTERPRETASI AKADEMIK
  // ════════════════════════════════════════════════════════
  {
    const ws = wb.addWorksheet('4. Rubrik & Landasan Teori', { tabColor: { argb: 'FF37474F' } });
    ws.views = [{ showGridLines: false }];
    ws.columns = [
      { width: 3 },  // A
      { width: 22 }, // B: Tokoh / Peneliti
      { width: 28 }, // C: Konstruk / Dimensi
      { width: 44 }, // D: Definisi Operasional
      { width: 16 }, // E: Jumlah Butir / Status
      { width: 46 }, // F: Tautan Sumber Resmi (Link DOI / Web Valid)
    ];

    ws.getRow(1).height = 10;
    ws.getRow(2).height = 42;
    mergeTitle(ws, 2, 2, 6,
      'LANDASAN TEORETIS PENGUKURAN & RUBRIK INTERPRETASI HASIL UAT\nReferensi Metodologi Penelitian untuk Bab III dan Bab IV Skripsi — Dilengkapi Link Sumber Resmi Valid',
      C.SECTION_BG, C.WHITE, 12);

    let r = 4;
    mergeTitle(ws, r, 2, 6, 'A. MODEL TEORI: EXTENDED TECHNOLOGY ACCEPTANCE MODEL (TAM) & EVALUASI AI', C.NAVY_HDR, C.WHITE, 10, true, 'left');
    r++;

    ws.getRow(r).height = 24;
    setCell(ws, r, 2, 'Peneliti / Rujukan', C.SECTION_BG, C.WHITE, true, 'center', 9);
    setCell(ws, r, 3, 'Konstruk / Dimensi', C.SECTION_BG, C.WHITE, true, 'left', 9);
    setCell(ws, r, 4, 'Definisi Operasional Penelitian', C.SECTION_BG, C.WHITE, true, 'left', 9);
    setCell(ws, r, 5, 'Jumlah Butir', C.SECTION_BG, C.WHITE, true, 'center', 9);
    setCell(ws, r, 6, 'Tautan Sumber Resmi (Link Aktif Valid)', C.SECTION_BG, C.WHITE, true, 'center', 9);
    r++;

    const tamDetails = [
      ['Davis (1989)', 'Perceived Usefulness (PU)', 'Sejauh mana seseorang percaya bahwa menggunakan sistem tertentu akan meningkatkan kinerja pekerjaannya.', '5 Butir Item (PU01-05)', 'MIS Quarterly: doi.org/10.2307/249008', 'https://doi.org/10.2307/249008'],
      ['Davis (1989)', 'Perceived Ease of Use (PEOU)', 'Sejauh mana seseorang percaya bahwa menggunakan sistem tertentu tidak membutuhkan usaha yang melelahkan (bebas kesulitan).', '5 Butir Item (PE01-05)', 'JSTOR: jstor.org/stable/249008', 'https://www.jstor.org/stable/249008'],
      ['Spencer & Spencer (1993)', 'AI Feedback Quality (AQ)', 'Akurasi, relevansi, dan ketajaman multi-framework evaluasi AI (STAR, FACT, Spencer 1993, ConCISE).', '5 Butir Item (AQ01-05)', 'Open Library: archive.org/details/competenceatwork00spen', 'https://archive.org/details/competenceatwork00spen'],
      ['McClelland (1973) / Pulakos (2004)', 'Coaching Experience (CE)', 'Kualitas interaksi bimbingan konsultan karir AI (Siti Rahayu) dan kejelasan Text-to-Speech audio.', '5 Butir Item (CE01-05)', 'American Psychologist: doi.org/10.1037/h0034092', 'https://doi.org/10.1037/h0034092'],
      ['Davis (1989) / Venkatesh (2000)', 'Behavioral Intention (BI)', 'Tingkat kekuatan niat pengguna untuk mengulang pemakaian dan merekomendasikan sistem kepada orang lain.', '5 Butir Item (BI01-05)', 'Management Science: doi.org/10.1287/mnsc.46.2.186.11926', 'https://doi.org/10.1287/mnsc.46.2.186.11926'],
    ];

    tamDetails.forEach(([tokoh, konstruk, definisi, jumlah, linkTxt, linkUrl], idx) => {
      ws.getRow(r).height = 36;
      const bg = idx % 2 === 1 ? C.ROW_ALT : null;
      setCell(ws, r, 2, tokoh, bg, C.GRAY_TXT, true, 'center', 9);
      setCell(ws, r, 3, konstruk, bg, C.BLUE_TXT, true, 'left', 9.5);
      setCell(ws, r, 4, definisi, bg, C.BLACK, false, 'left', 9);
      setCell(ws, r, 5, jumlah, bg, C.GREEN_TXT, true, 'center', 9);
      setHyperlinkCell(ws, r, 6, linkTxt, linkUrl, bg, true, 'left', 8.5);
      r++;
    });

    r++;
    mergeTitle(ws, r, 2, 6, 'B. KRITERIA INTERPRETASI KELAYAKAN UAT & SKALA PENGUKURAN (Arikunto, 2019 & Sugiyono, 2018)', C.TEAL_HDR, C.WHITE, 10, true, 'left');
    r++;

    ws.getRow(r).height = 24;
    setCell(ws, r, 2, 'Rentang Skor', C.SECTION_BG, C.WHITE, true, 'center', 9);
    setCell(ws, r, 3, 'Kategori Kelayakan', C.SECTION_BG, C.WHITE, true, 'left', 9);
    setCell(ws, r, 4, 'Implikasi / Makna Kualitatif', C.SECTION_BG, C.WHITE, true, 'left', 9);
    setCell(ws, r, 5, 'Tindak Lanjut', C.SECTION_BG, C.WHITE, true, 'center', 9);
    setCell(ws, r, 6, 'Tautan Rujukan Buku Resmi', C.SECTION_BG, C.WHITE, true, 'center', 9);
    r++;

    const scales = [
      ['81.00% – 100.00%', 'Sangat Layak / Sangat Diterima', 'Sistem memenuhi seluruh ekspektasi pengguna secara prima. Tidak memerlukan perbaikan mayor.', 'Siap Rilis', 'Perpusnas RI ID: 1138812 (Arikunto)', 'https://opac.perpusnas.go.id/DetailOpac.aspx?id=1138812', C.LULUS, C.GREEN_TXT],
      ['61.00% – 80.99%', 'Layak / Diterima', 'Sistem diterima dengan baik oleh pengguna. Saran minor dapat diakomodasi untuk rilis lanjutan.', 'Rilis Bertahap', 'Perpusnas RI ID: 1152063 (Sugiyono)', 'https://opac.perpusnas.go.id/DetailOpac.aspx?id=1152063', null, C.BLUE_TXT],
      ['41.00% – 60.99%', 'Cukup Layak / Cukup', 'Sistem masih memiliki beberapa kekurangan yang harus diperbaiki sebelum diterapkan secara luas.', 'Revisi Ringan', 'Google Books: Prosedur Penelitian', 'https://books.google.com/books/about/Prosedur_penelitian.html?id=zR08vwEACAAJ', C.WARNING, C.AMBER_TXT],
      ['21.00% – 40.99%', 'Kurang Layak', 'Sistem belum memenuhi standar kebutuhan pengguna dan memerlukan revisi substansial.', 'Revisi Mayor', 'Google Books: Metode Penelitian R&D', 'https://books.google.com/books/about/Metode_penelitian_kuantitatif_kualitatif.html?id=e7w0zQEACAAJ', null, C.BLACK],
      ['0.00% – 20.99%', 'Sangat Tidak Layak', 'Sistem ditolak oleh pengguna dan memerlukan perombakan arsitektur/konsep secara menyeluruh.', 'Ditolak Total', 'Katalog Online Perpustakaan Nasional RI', 'https://opac.perpusnas.go.id', null, { argb: 'FFD32F2F' }],
    ];

    scales.forEach(([rentang, kategori, implikasi, tindak, linkTxt, linkUrl, bg, txt]) => {
      ws.getRow(r).height = 32;
      setCell(ws, r, 2, rentang, bg, txt, true, 'center', 9.5);
      setCell(ws, r, 3, kategori, bg, txt, true, 'left', 9.5);
      setCell(ws, r, 4, implikasi, bg, C.BLACK, false, 'left', 9);
      setCell(ws, r, 5, tindak, bg, C.DARK_GRAY, true, 'center', 9);
      setHyperlinkCell(ws, r, 6, linkTxt, linkUrl, bg, true, 'left', 8.5);
      r++;
    });

    r++;
    mergeTitle(ws, r, 2, 6, 'C. FORMULA PERHITUNGAN PERSENTASE KELAYAKAN', C.NAVY_HDR, C.WHITE, 10, true, 'left');
    r++;

    ws.getRow(r).height = 65;
    mergeTitle(ws, r, 2, 6,
      'RUMUS PERSENTASE SKOR KELAYAKAN:\n% Kelayakan = (Total Skor Aktual / Total Skor Maksimum Ideal) × 100%\n\nDi mana:\n• Total Skor Aktual = Jumlah seluruh nilai jawaban responden pada indikator terkait\n• Total Skor Maksimum Ideal = N (Jumlah Responden) × K (Jumlah Butir Pertanyaan) × 5 (Bobot Jawaban Tertinggi "Sangat Setuju")\n• Referensi: Arikunto (2019: hlm. 245) dan Sugiyono (2018: hlm. 135)',
      C.ROW_ALT, C.BLACK, 9, false, 'left');

    // ── BAGIAN D: TEORI PENENTUAN JUMLAH MINIMUM RESPONDEN (TO-DO 3 DOSPEM) ──
    r++;
    mergeTitle(ws, r, 2, 6, 'D. PERBANDINGAN TEORI PENENTUAN JUMLAH MINIMUM RESPONDEN PENELITIAN', { argb: 'FF004D40' }, C.WHITE, 10, true, 'left');
    r++;

    ws.getRow(r).height = 24;
    setCell(ws, r, 2, 'Teori / Tokoh Ahli', C.SECTION_BG, C.WHITE, true, 'center', 9);
    setCell(ws, r, 3, 'Judul Rujukan / Publikasi', C.SECTION_BG, C.WHITE, true, 'left', 9);
    setCell(ws, r, 4, 'Kaidah / Formula Jumlah Sampel Minimum', C.SECTION_BG, C.WHITE, true, 'left', 9);
    setCell(ws, r, 5, 'Relevansi INTERV-U', C.SECTION_BG, C.WHITE, true, 'center', 9);
    setCell(ws, r, 6, 'Tautan Sumber Resmi (Link DOI / Web Aktif)', C.SECTION_BG, C.WHITE, true, 'center', 9);
    r++;

    const sampleTheories = [
      [
        'Jakob Nielsen & Thomas Landauer (1993)',
        'ACM CHI 93 & NN/g Usability Testing Model',
        '5 user menemukan ~85% masalah kegunaan; 15-20 user mencapai saturasi penuh (>95% masalah sistem).',
        'Sangat Relevan\n(Usability UI & Alur)',
        'ACM DOI: doi.org/10.1145/169059.169166',
        'https://doi.org/10.1145/169059.169166'
      ],
      [
        'Roscoe (1975)',
        'Fundamental Research Statistics for Behavioral Sciences',
        'Kaidah praktis (Rule of Thumb): Ukuran sampel antara 30 hingga 500 subjek adalah tepat untuk riset perilaku.',
        'SANGAT TEPAT ⭐\n(Dasar N=30 Avit)',
        'Open Library: openlibrary.org/books/OL5063071M',
        'https://openlibrary.org/books/OL5063071M/Fundamental_research_statistics_for_the_behavioral_sciences'
      ],
      [
        'Hair, Black, Babin, & Anderson (2010)',
        'Multivariate Data Analysis (Pearson 7th ed.)',
        'Rasio observasi terhadap variabel minimal 5:1 s/d 10:1. Untuk 5 dimensi TAM = 25 s/d 50 sampel responden.',
        'Sangat Mendukung\n(5 dimensi × 6 = 30)',
        'ResearchGate: publication/265350313',
        'https://www.researchgate.net/publication/265350313_Multivariate_Data_Analysis'
      ],
      [
        'Taro Yamane / Slovin (1967)',
        'Elementary Sampling Theory',
        'n = N / (1 + N(e^2)). Membutuhkan angka pasti populasi total (N). Tidak bisa jika populasi tak hingga.',
        'Kurang Cocok\n(Populasi Tak Terhingga)',
        'ResearchGate: publication/285226466',
        'https://www.researchgate.net/publication/285226466'
      ],
      [
        'Gay, Mills, & Airasian (2012)',
        'Educational Research: Competencies for Analysis',
        'Untuk penelitian deskriptif kuantitatif, ukuran sampel minimum yang dapat diterima adalah minimal 30 subjek.',
        'Mendukung N=30\n(Batas Uji Parametrik)',
        'Pearson Catalog: ISBN 9780132613170',
        'https://www.pearson.com/en-us/subject-catalog/p/educational-research-competencies-for-analysis-and-applications/P200000002888'
      ],
    ];

    sampleTheories.forEach(([tokoh, judul, kaidah, relevansi, linkTxt, linkUrl], idx) => {
      ws.getRow(r).height = 44;
      const bg = idx % 2 === 1 ? C.ROW_ALT : null;
      const relBg = relevansi.includes('SANGAT TEPAT') ? C.LULUS : bg;
      const relTxt = relevansi.includes('SANGAT TEPAT') ? C.GREEN_TXT : C.BLACK;
      setCell(ws, r, 2, tokoh, bg, C.GRAY_TXT, true, 'center', 9);
      setCell(ws, r, 3, judul, bg, C.BLUE_TXT, true, 'left', 9);
      setCell(ws, r, 4, kaidah, bg, C.BLACK, false, 'left', 8.5);
      setCell(ws, r, 5, relevansi, relBg, relTxt, true, 'center', 8.5);
      setHyperlinkCell(ws, r, 6, linkTxt, linkUrl, bg, true, 'left', 8.5);
      r++;
    });

    // ── BAGIAN E: KESIMPULAN & JUSTIFIKASI AKADEMIK PEMILIHAN SAMPEL SKRIPSI AVIT ──
    r++;
    mergeTitle(ws, r, 2, 6, 'E. KESIMPULAN & JUSTIFIKASI AKADEMIK PEMILIHAN SAMPEL SKRIPSI AVIT', { argb: 'FF1A237E' }, C.WHITE, 10, true, 'left');
    r++;

    ws.getRow(r).height = 80;
    mergeTitle(ws, r, 2, 6,
      'REKOMENDASI UKURAN SAMPEL: N = 30 RESPONDEN\n\nJustifikasi Metodologis untuk Skripsi Avit:\n1. Memenuhi Kaidah Roscoe (1975): Sampel 30-500 subjek adalah representatif dan memadai untuk riset penerimaan teknologi informasi.\n2. Memenuhi Rasio Konstruk Hair et al. (2010): 5 dimensi TAM × 6 observasi = 30 responden, memenuhi rasio observasi ideal (5:1 s/d 10:1).\n3. Memenuhi Teorema Limit Pusat (Central Limit Theorem): Ukuran sampel N ≥ 30 menjamin sebaran rata-rata data mendekati distribusi normal sehingga aman untuk analisis statistik kuantitatif deskriptif.\n4. Melampaui Batas Saturasi Usability Nielsen & Landauer (1993): Evaluasi antarmuka dan interaksi pengguna telah mencapai saturasi penuh pada N ≥ 15-20.',
      C.LULUS, C.GREEN_TXT, 9.5, false, 'left');
  }

  // ════════════════════════════════════════════════════════
  // SHEET 5: LEMBAR VALIDASI AHLI (EXPERT JUDGMENT)
  // ════════════════════════════════════════════════════════
  {
    const ws = wb.addWorksheet('5. Lembar Validasi Ahli', { tabColor: { argb: 'FFD81B60' } });
    ws.views = [{ showGridLines: false }];
    ws.columns = [
      { width: 3 }, { width: 6 }, { width: 36 }, { width: 44 }, { width: 18 }
    ];

    ws.getRow(1).height = 10;
    ws.getRow(2).height = 45;
    mergeTitle(ws, 2, 2, 5,
      'LEMBAR PENILAIAN VALIDASI AHLI (EXPERT JUDGMENT)\nINSTRUMEN USER ACCEPTANCE TESTING (UAT) SISTEM INTERV-U\nUntuk Dosen Pembimbing / Praktisi Human Resources (HR)',
      { argb: 'FF880E4F' }, C.WHITE, 12);

    ws.getRow(3).height = 24;
    mergeTitle(ws, 3, 2, 5,
      'Nama Validator: Ibu Chanifah, M.Kom. / Praktisi HR Eksternal  |  Instansi: Universitas',
      C.DARK_GRAY, C.WHITE, 9.5, false);

    let r = 5;
    ws.getRow(r).height = 24;
    setCell(ws, r, 2, 'No', C.SECTION_BG, C.WHITE, true, 'center', 9);
    setCell(ws, r, 3, 'Aspek Validasi Ahli', C.SECTION_BG, C.WHITE, true, 'left', 9);
    setCell(ws, r, 4, 'Indikator Penilaian Ahli', C.SECTION_BG, C.WHITE, true, 'left', 9);
    setCell(ws, r, 5, 'Status Validasi', C.SECTION_BG, C.WHITE, true, 'center', 9);
    r++;

    const experts = [
      ['1', 'Kesesuaian Konstruk Teori TAM', 'Butir-butir pertanyaan pada variabel PU, PEOU, dan BI telah mencerminkan model Davis (1989) dengan tepat.', '[  ] Layak\n[  ] Perlu Revisi'],
      ['2', 'Relevansi Multi-Framework AI', 'Instrumen telah merefleksikan evaluasi STAR, FACT, dan Kamus Kompetensi Spencer & Spencer (1993).', '[  ] Layak\n[  ] Perlu Revisi'],
      ['3', 'Ketepatan Bahasa & Kejelasan Butir', 'Kalimat pernyataan tidak menimbulkan penafsiran ganda (ambigu) dan mudah dipahami oleh responden.', '[  ] Layak\n[  ] Perlu Revisi'],
      ['4', 'Struktur Skala Pengukuran Likert', 'Gradasi 5 pilihan skala (STS, TS, N, S, SS) proporsional dan memiliki bobot nilai yang terukur secara statistik.', '[  ] Layak\n[  ] Perlu Revisi'],
      ['5', 'Kelayakan Skenario Pengujian', 'Skenario uji terarah (15-20 menit) realistis dan mampu memberikan gambaran komprehensif bagi responden.', '[  ] Layak\n[  ] Perlu Revisi'],
    ];

    experts.forEach(([no, aspek, indikator, status], idx) => {
      ws.getRow(r).height = 42;
      const bg = idx % 2 === 1 ? C.ROW_ALT : null;
      setCell(ws, r, 2, no, bg, C.BLACK, true, 'center');
      setCell(ws, r, 3, aspek, bg, C.BLUE_TXT, true, 'left');
      setCell(ws, r, 4, indikator, bg, C.BLACK, false, 'left');
      setCell(ws, r, 5, status, bg, C.BLACK, true, 'center', 8.5);
      r++;
    });

    r++;
    ws.getRow(r).height = 24;
    mergeTitle(ws, r, 2, 5, 'KESIMPULAN UMUM VALIDATOR AHLI', C.DARK_GRAY, C.WHITE, 10, true, 'left');
    r++;

    ws.getRow(r).height = 75;
    mergeTitle(ws, r, 2, 5,
      '[  ] Instrumen DINYATAKAN LAYAK untuk digunakan dalam pengumpulan data penelitian tanpa revisi.\n[  ] Instrumen DINYATAKAN LAYAK dengan perbaikan minor sesuai catatan saran.\n[  ] Instrumen DINYATAKAN TIDAK LAYAK dan perlu dikonsultasikan ulang.\n\nCatatan Tambahan Validator: .................................................................................................................................',
      C.ROW_ALT, C.BLACK, 9, false, 'left');

    r++;
    ws.getRow(r).height = 70;
    mergeTitle(ws, r, 2, 5,
      'Mengetahui / Mengesahkan,\nValidator Ahli / Dosen Pembimbing,\n\n\n\n( Ibu Chanifah, M.Kom. )',
      null, C.BLACK, 10, true, 'right');
  }

  let targetPath = OUT;
  try {
    await wb.xlsx.writeFile(OUT);
  } catch (err) {
    if (err.code === 'EBUSY') {
      targetPath = path.resolve('hasil_pengujian/INSTRUMEN_PENGUJIAN_UAT_RESPONDEN_UPDATE.xlsx');
      await wb.xlsx.writeFile(targetPath);
      console.log(`⚠️ PERHATIAN: File utama sedang dibuka di Excel.`);
      console.log(`   Versi baru telah berhasil disimpan ke: ${targetPath}`);
    } else {
      throw err;
    }
  }

  const size = (fs.statSync(targetPath).size / 1024).toFixed(1);
  console.log(`\n✅ Excel Instrumen UAT berhasil dibuat!`);
  console.log(`   Path: ${targetPath}`);
  console.log(`   Ukuran: ${size} KB`);
  console.log(`   Worksheets: 5 Sheet lengkap`);
  console.log(`   - Sheet 1: 1. Panduan & Profil Responden`);
  console.log(`   - Sheet 2: 2. Kuesioner UAT (25 Butir)`);
  console.log(`   - Sheet 3: 3. Rekap Data UAT (N=30) [Rumus Otomatis Aktif]`);
  console.log(`   - Sheet 4: 4. Rubrik & Landasan Teori (Lengkap dengan Link Resmi Valid)`);
  console.log(`   - Sheet 5: 5. Lembar Validasi Ahli`);
}

generate().catch(err => {
  console.error('Error generating UAT excel:', err);
  process.exit(1);
});
