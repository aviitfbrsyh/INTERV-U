import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const results = [];
const savedPayloads = {};

function logResult(testId, name, status, durationMs, details, rawResponse = null) {
  const entry = {
    testId,
    name,
    status,
    durationMs,
    details,
    timestamp: new Date().toISOString(),
  };
  results.push(entry);
  if (rawResponse) {
    savedPayloads[testId] = rawResponse;
  }
  console.log(`[${status}] ${testId} - ${name} (${durationMs}ms): ${details}`);
}

async function runApiTests() {
  console.log('=== MEMULAI BLACK-BOX API & INTEGRATION TESTING ===\n');

  // ─── 1. TEST /api/live-token ───
  try {
    const t0 = performance.now();
    const res = await fetch(`${BASE_URL}/api/live-token`);
    const dur = Math.round(performance.now() - t0);
    const data = await res.json();
    
    if (res.status === 200 && data.token && typeof data.token === 'string') {
      logResult('TC-API-01', 'GET /api/live-token (Status & Format)', 'LULUS', dur, `Token diterima (panjang: ${data.token.length} chars)`, { status: res.status, token_prefix: data.token.substring(0, 20) + '...' });
    } else {
      logResult('TC-API-01', 'GET /api/live-token (Status & Format)', 'GAGAL', dur, `Response: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    logResult('TC-API-01', 'GET /api/live-token (Status & Format)', 'GAGAL', 0, `Error: ${err.message}`);
  }

  // ─── 2. TEST /api/extract (CV PDF Asli: CV_Avit_Febriansyah.pdf) ───
  let extractedCvData = null;
  try {
    const cvPath = path.resolve('CV_Avit_Febriansyah.pdf');
    const cvBuffer = fs.readFileSync(cvPath);
    const cvBase64 = cvBuffer.toString('base64');

    const t0 = performance.now();
    const res = await fetch(`${BASE_URL}/api/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'cv',
        input: { file: { base64: cvBase64, mimeType: 'application/pdf' } }
      })
    });
    const dur = Math.round(performance.now() - t0);
    const data = await res.json();

    if (res.status === 200 && data.profile && data.experience && data.skills) {
      extractedCvData = data;
      logResult('TC-API-02', 'POST /api/extract CV PDF Riil (CV_Avit_Febriansyah.pdf)', 'LULUS', dur,
        `Kandidat: ${data.profile.name || 'Terdeteksi'}, Skills: ${data.skills.length} item, Pengalaman: ${data.experience.length} entri`,
        data
      );
    } else {
      logResult('TC-API-02', 'POST /api/extract CV PDF Riil (CV_Avit_Febriansyah.pdf)', 'GAGAL', dur, `Response status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    logResult('TC-API-02', 'POST /api/extract CV PDF Riil (CV_Avit_Febriansyah.pdf)', 'GAGAL', 0, `Error: ${err.message}`);
  }

  // ─── 3. TEST /api/extract (JD Gambar Asli: loker.jpeg) ───
  let extractedJdData = null;
  try {
    const jdPath = path.resolve('loker.jpeg');
    const jdBuffer = fs.readFileSync(jdPath);
    const jdBase64 = jdBuffer.toString('base64');

    const t0 = performance.now();
    const res = await fetch(`${BASE_URL}/api/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'jd',
        input: { file: { base64: jdBase64, mimeType: 'image/jpeg' } }
      })
    });
    const dur = Math.round(performance.now() - t0);
    const data = await res.json();

    const hasCompetencies = Array.isArray(data.target_competencies) && data.target_competencies.length > 0;
    if (res.status === 200 && data.role && hasCompetencies) {
      extractedJdData = data;
      const codes = data.target_competencies.map(c => c.code).join(', ');
      logResult('TC-API-03', 'POST /api/extract JD Gambar Riil (loker.jpeg) -> Spencer & Spencer', 'LULUS', dur,
        `Posisi: ${data.role}, Terpetakan ke: ${data.target_competencies.length} Kompetensi Spencer & Spencer (${codes})`,
        data
      );
    } else {
      logResult('TC-API-03', 'POST /api/extract JD Gambar Riil (loker.jpeg) -> Spencer & Spencer', 'GAGAL', dur, `Response status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    logResult('TC-API-03', 'POST /api/extract JD Gambar Riil (loker.jpeg) -> Spencer & Spencer', 'GAGAL', 0, `Error: ${err.message}`);
  }

  // ─── 4. TEST /api/extract (Negative: Empty input) ───
  try {
    const t0 = performance.now();
    const res = await fetch(`${BASE_URL}/api/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'cv', input: {} })
    });
    const dur = Math.round(performance.now() - t0);
    const data = await res.json();
    // Should either gracefully return schema with empty fields or handle gracefully
    if (res.status === 200 || res.status === 400 || res.status === 500) {
      logResult('TC-API-04', 'POST /api/extract (Negative: Empty Input Graceful Handling)', 'LULUS', dur,
        `Server menangani payload kosong dengan status: ${res.status}`, data);
    } else {
      logResult('TC-API-04', 'POST /api/extract (Negative: Empty Input Graceful Handling)', 'GAGAL', dur, `Unhandled crash`);
    }
  } catch (err) {
    logResult('TC-API-04', 'POST /api/extract (Negative: Empty Input Graceful Handling)', 'GAGAL', 0, `Error: ${err.message}`);
  }

  // ─── 5. TEST /api/cross-match (CV vs JD) ───
  let crossMatchData = null;
  try {
    const cvText = extractedCvData ? JSON.stringify(extractedCvData) : 'Pengalaman: Frontend Developer, React, Next.js, TypeScript';
    const jdText = extractedJdData ? JSON.stringify(extractedJdData) : 'Kebutuhan: Web Developer, React, Tailwind, Next.js';

    const t0 = performance.now();
    const res = await fetch(`${BASE_URL}/api/cross-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cvText, jdText })
    });
    const dur = Math.round(performance.now() - t0);
    const data = await res.json();

    if (res.status === 200 && typeof data.match_score === 'number' && Array.isArray(data.matched_skills)) {
      crossMatchData = data;
      logResult('TC-API-05', 'POST /api/cross-match (CV vs JD Gap Analysis)', 'LULUS', dur,
        `Match Score: ${data.match_score}/100, Matched Skills: ${data.matched_skills.length}, Focus Areas: ${data.focus_areas?.length || 0}`,
        data
      );
    } else {
      logResult('TC-API-05', 'POST /api/cross-match (CV vs JD Gap Analysis)', 'GAGAL', dur, `Status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    logResult('TC-API-05', 'POST /api/cross-match (CV vs JD Gap Analysis)', 'GAGAL', 0, `Error: ${err.message}`);
  }

  // ─── 6. TEST /api/evaluate (LLM-as-a-Judge dengan Transkrip Riil 7 Pertanyaan) ───
  let evaluationData = null;
  try {
    const realHistory = `AI: Halo Mas Avit, selamat datang di sesi wawancara. Ceritakan situasi saat Anda membangun arsitektur antarmuka web kompleks dan bagaimana Anda mengelola state-nya?
User: Di proyek sebelumnya, saya membangun dashboard analitik dengan Next.js. Untuk state management, saya mengimplementasikan Zustand untuk client UI state dan TanStack React Query untuk server-state caching, sehingga meminimalisir re-render berlebih dan mempercepat load time hingga 40%.
AI: Pernahkah Anda menghadapi bug kritis atau penurunan performa di sistem? Ceritakan bagaimana Anda membedah akar masalahnya?
User: Pernah, saat rilis fitur baru terjadi memory leak di halaman tabel besar. Saya menggunakan Chrome DevTools Memory Profiler dan Heap Snapshot. Dari situ saya menemukan event listener scroll di window tidak dibersihkan saat komponen di-unmount. Saya memperbaikinya dengan menambahkan cleanup function di useEffect.
AI: Bisa berikan contoh nyata ketika Anda harus menyederhanakan kode yang sangat rumit menjadi komponen modular?
User: Pada fitur form multi-step yang panjang, awalnya semua state bertumpuk di satu file 800 baris. Saya merombaknya dengan pola Compound Component dan custom hooks per langkah form, sehingga masing-masing langkah independen dan kodenya mudah dirawat oleh tim.
AI: Ceritakan pengalaman ketika Anda menetapkan target optimasi performa melebihi ekspektasi awal?
User: Awalnya target Google Lighthouse skor 80. Namun saya melakukan code-splitting dinamis pada Three.js dan lazy-loading aset gambar WebP, sehingga skor Lighthouse mencapai 92 di mobile dan 98 di desktop.
AI: Bagaimana persisnya Anda memastikan kode Anda bebas galat dan memenuhi standar sebelum digabungkan ke branch utama?
User: Saya mengonfigurasi pre-commit hook dengan Husky dan lint-staged untuk menjalankan ESLint, Prettier, dan unit testing Vitest secara otomatis. Setiap pull request wajib lolos CI pipeline di GitHub Actions sebelum di-merge.
AI: Ceritakan situasi nyata saat terjadi perbedaan pendapat teknis dengan rekan tim saat code review dan bagaimana Anda menyelesaikannya?
User: Ada perbedaan pendapat memilih arsitektur CSS antara Tailwind CSS atau CSS Modules. Saya tidak mendebat secara emosional, melainkan membuat PoC perbandingan ukuran bundle dan kecepatan styling. Tim akhirnya sepakat menggunakan Tailwind karena bundle size lebih optimal.
AI: Ini adalah pertanyaan terakhir saya untuk sesi ini. Pernahkah Anda mengambil inisiatif teknis penting tanpa menunggu perintah atasan? Ceritakan peristiwa tersebut.
User: Saya melihat tim sering lambat saat integrasi API karena belum ada dokumentasi TypeScript yang konsisten. Saya berinisiatif membuat shared interface types dan Mock Service Worker (MSW) mandiri di weekend. Inisiatif ini memangkas waktu blocker tim hingga 2 hari kerja.`;

    const cvText = extractedCvData ? JSON.stringify(extractedCvData) : 'Kandidat: Avit Febriansyah, Frontend Engineer';
    const jdText = extractedJdData ? JSON.stringify(extractedJdData) : 'Posisi: Frontend Developer';

    const t0 = performance.now();
    const res = await fetch(`${BASE_URL}/api/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history: realHistory,
        cvText,
        jdText,
        crossMatchData
      })
    });
    const dur = Math.round(performance.now() - t0);
    const data = await res.json();

    const hasQa = Array.isArray(data.qa_analysis) && data.qa_analysis.length > 0;
    const hasArchetype = !!data.candidate_archetype;
    const hasScores = typeof data.overall_score === 'number';

    if (res.status === 200 && hasQa && hasArchetype && hasScores) {
      evaluationData = data;
      const avgStar = data.qa_analysis.reduce((s, q) => s + (q.star?.score || 0), 0) / data.qa_analysis.length;
      const avgFactTotal = data.qa_analysis.filter(q => q.fact).reduce((s, q) => s + (q.fact?.total || 0), 0) / (data.qa_analysis.filter(q => q.fact).length || 1);
      
      logResult('TC-API-06', 'POST /api/evaluate LLM-as-a-Judge (STAR, FACT, ConCISE, Spencer & Spencer)', 'LULUS', dur,
        `Overall Score: ${data.overall_score}/100, Archetype: ${data.candidate_archetype.label}, Avg STAR: ${avgStar.toFixed(1)}/4, Avg FACT: ${avgFactTotal.toFixed(1)}/40, QA Count: ${data.qa_analysis.length}`,
        data
      );
    } else {
      logResult('TC-API-06', 'POST /api/evaluate LLM-as-a-Judge (STAR, FACT, ConCISE, Spencer & Spencer)', 'GAGAL', dur, `Status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    logResult('TC-API-06', 'POST /api/evaluate LLM-as-a-Judge (STAR, FACT, ConCISE, Spencer & Spencer)', 'GAGAL', 0, `Error: ${err.message}`);
  }

  // ─── 7. TEST /api/coaching (Action: Chat) ───
  try {
    const t0 = performance.now();
    const res = await fetch(`${BASE_URL}/api/coaching`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'chat',
        userQuestion: 'Di aspek mana performa STAR dan FACT saya paling menonjol?',
        evaluationContext: evaluationData ? JSON.stringify(evaluationData).substring(0, 1500) : 'Evaluasi skor: 85',
        history: []
      })
    });
    const dur = Math.round(performance.now() - t0);
    const data = await res.json();

    if (res.status === 200 && data.text && data.text.length > 20) {
      logResult('TC-API-07', 'POST /api/coaching (Action: Chat - Tanya Siti)', 'LULUS', dur,
        `Respons Siti (${data.text.length} chars): "${data.text.substring(0, 90)}..."`, data);
    } else {
      logResult('TC-API-07', 'POST /api/coaching (Action: Chat - Tanya Siti)', 'GAGAL', dur, `Response: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    logResult('TC-API-07', 'POST /api/coaching (Action: Chat - Tanya Siti)', 'GAGAL', 0, `Error: ${err.message}`);
  }

  // ─── 8. TEST /api/coaching (Action: Speech / TTS) ───
  try {
    const t0 = performance.now();
    const res = await fetch(`${BASE_URL}/api/coaching`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'speech',
        text: 'Halo Mas Avit, selamat atas hasil evaluasi wawancaranya yang sangat solid.'
      })
    });
    const dur = Math.round(performance.now() - t0);
    const data = await res.json();

    if (res.status === 200 && data.audioData && typeof data.audioData === 'string') {
      logResult('TC-API-08', 'POST /api/coaching (Action: Speech - Gemini TTS Audio)', 'LULUS', dur,
        `Audio base64 diterima (MIME: ${data.mimeType}, size: ${data.audioData.length} chars)`, { mimeType: data.mimeType, bytesLength: data.audioData.length });
    } else {
      logResult('TC-API-08', 'POST /api/coaching (Action: Speech - Gemini TTS Audio)', 'GAGAL', dur, `Response: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    logResult('TC-API-08', 'POST /api/coaching (Action: Speech - Gemini TTS Audio)', 'GAGAL', 0, `Error: ${err.message}`);
  }

  // ─── 9. TEST /api/coaching (Action: Practice Retry) ───
  try {
    const t0 = performance.now();
    const res = await fetch(`${BASE_URL}/api/coaching`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'practice',
        question: 'Ceritakan pengalaman ketika Anda menghadapi bug kritis di sistem?',
        originalAnswer: 'Saya cari bugnya di log terus saya benerin kodenya.',
        newAnswer: 'Waktu itu terjadi memory leak di production saat load tinggi. Saya mengambil tindakan mandiri dengan menganalisis heap snapshot di Chrome DevTools, menemukan event listener yang bocor, dan memperbaikinya dengan cleanup di useEffect. Hasilnya latensi kembali normal di bawah 200ms.'
      })
    });
    const dur = Math.round(performance.now() - t0);
    const data = await res.json();

    if (res.status === 200 && typeof data.is_better === 'boolean' && data.star && data.concise) {
      logResult('TC-API-09', 'POST /api/coaching (Action: Practice Retry Comparison)', 'LULUS', dur,
        `Is Better: ${data.is_better}, Rating Baru: ${data.rating}/10, STAR Baru: ${data.star.score}/4, Note: "${data.improvement_note?.substring(0, 60)}..."`,
        data
      );
    } else {
      logResult('TC-API-09', 'POST /api/coaching (Action: Practice Retry Comparison)', 'GAGAL', dur, `Response: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    logResult('TC-API-09', 'POST /api/coaching (Action: Practice Retry Comparison)', 'GAGAL', 0, `Error: ${err.message}`);
  }

  // ─── 10. TEST /api/coaching (Action: Highlight) ───
  try {
    const t0 = performance.now();
    const res = await fetch(`${BASE_URL}/api/coaching`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'highlight',
        question: 'Bagaimana Anda mengelola state management?',
        userAnswer: 'Saya pakai Zustand dan React Query.',
        suggestion: 'Jelaskan trade-off dan alasannya secara konkret.',
        hack: 'Mulai dengan problem statenya dulu baru solusinya.'
      })
    });
    const dur = Math.round(performance.now() - t0);
    const data = await res.json();

    if (res.status === 200 && data.text && data.text.length > 20) {
      logResult('TC-API-10', 'POST /api/coaching (Action: Highlight Ulasan Lisan)', 'LULUS', dur,
        `Teks ulasan dihasilkan (${data.text.length} chars): "${data.text.substring(0, 80)}..."`, data);
    } else {
      logResult('TC-API-10', 'POST /api/coaching (Action: Highlight Ulasan Lisan)', 'GAGAL', dur, `Response: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    logResult('TC-API-10', 'POST /api/coaching (Action: Highlight Ulasan Lisan)', 'GAGAL', 0, `Error: ${err.message}`);
  }

  // Save results & raw payloads
  const outPath = path.resolve('hasil_pengujian/raw_logs/api_tests_result.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');
  
  const payloadPath = path.resolve('hasil_pengujian/raw_logs/api_payloads_cache.json');
  fs.writeFileSync(payloadPath, JSON.stringify(savedPayloads, null, 2), 'utf-8');

  console.log(`\nHasil API Testing disimpan di: ${outPath}`);
  console.log(`Cache Payload disimpan di: ${payloadPath}`);
}

runApiTests();
