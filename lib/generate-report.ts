import { EvaluationData } from './evaluate';

function extractField(text: string, keys: string[]): string {
  for (const key of keys) {
    const match = text.match(new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`, 'i'));
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return '';
}

function extractCandidateName(cvText: string): string {
  const fromJson = extractField(cvText, ['name', 'nama', 'full_name', 'fullName', 'candidate_name', 'nama_lengkap']);
  if (fromJson) return fromJson.length > 70 ? fromJson.substring(0, 70) + '…' : fromJson;
  // fallback: first line that doesn't look like JSON
  const plain = cvText.split('\n').find(l => {
    const t = l.trim();
    return t.length > 2 && !t.startsWith('{') && !t.startsWith('"') && !t.startsWith('[') && !t.startsWith('/');
  })?.trim() ?? '';
  return plain.length > 70 ? plain.substring(0, 70) + '…' : plain || 'Nama Kandidat';
}

function extractJobTitle(jdText: string): string {
  const fromJson = extractField(jdText, ['role', 'title', 'position', 'job_title', 'posisi', 'jabatan', 'job_position']);
  if (fromJson) return fromJson.length > 80 ? fromJson.substring(0, 80) + '…' : fromJson;
  const plain = jdText.split('\n').find(l => {
    const t = l.trim();
    return t.length > 2 && !t.startsWith('{') && !t.startsWith('"') && !t.startsWith('[') && !t.startsWith('/');
  })?.trim() ?? '';
  return plain.length > 80 ? plain.substring(0, 80) + '…' : plain || 'Posisi yang Dilamar';
}

function coverPage(
  candidateName: string,
  jobTitle: string,
  date: string,
  score: number,
  verdict: string,
): string {
  const scoreColor   = score >= 80 ? '#4ade80' : score >= 60 ? '#60a5fa' : score >= 40 ? '#fbbf24' : '#f87171';
  const scoreBorder  = score >= 80 ? '#166534' : score >= 60 ? '#1e3a5f' : score >= 40 ? '#78350f' : '#7f1d1d';
  const scoreBg      = score >= 80 ? '#071c0e' : score >= 60 ? '#050d1f' : score >= 40 ? '#1a0e00' : '#1c0505';

  const verdictMap: Record<string, { label: string; color: string }> = {
    recommended:     { label: 'DIREKOMENDASIKAN',       color: '#4ade80' },
    conditional:     { label: 'BERSYARAT',              color: '#fbbf24' },
    not_recommended: { label: 'BELUM DIREKOMENDASIKAN', color: '#f87171' },
  };
  const v = verdictMap[verdict] ?? { label: verdict.toUpperCase(), color: '#94a3b8' };

  return `
  <!-- ═══════════════════ COVER PAGE ═══════════════════ -->
  <div style="
    min-height:100vh;
    page-break-after:always;
    background:#0a0f1e;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:space-between;
    padding:48px 56px 40px;
    position:relative;
    overflow:hidden;
    width:100%;
  ">

    <!-- decorative blobs -->
    <div style="position:absolute;top:-80px;left:-80px;width:320px;height:320px;background:radial-gradient(circle,rgba(99,102,241,.18) 0%,transparent 70%);pointer-events:none;"></div>
    <div style="position:absolute;bottom:-60px;right:-60px;width:280px;height:280px;background:radial-gradient(circle,rgba(16,185,129,.12) 0%,transparent 70%);pointer-events:none;"></div>
    <div style="position:absolute;top:40%;left:-100px;width:200px;height:200px;background:radial-gradient(circle,rgba(245,158,11,.08) 0%,transparent 70%);pointer-events:none;"></div>

    <!-- ── TOP BRAND BAR ── -->
    <div style="width:100%;display:flex;flex-direction:column;align-items:center;gap:0;">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
        <!-- logo icon -->
        <div style="width:44px;height:44px;background:linear-gradient(135deg,#2563eb,#7c3aed);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;">🎯</div>
        <div>
          <p style="font-size:22px;font-weight:900;color:#f1f5f9;letter-spacing:-0.5px;line-height:1;">INTERVYOUUU</p>
          <p style="font-size:10px;font-weight:600;color:#475569;letter-spacing:.2em;text-transform:uppercase;margin-top:2px;">AI Interview Simulator</p>
        </div>
      </div>
      <!-- top divider line ornament -->
      <div style="display:flex;align-items:center;gap:10px;width:100%;max-width:560px;margin-top:4px;">
        <div style="flex:1;height:1px;background:linear-gradient(to right,transparent,#334155);"></div>
        <span style="color:#d97706;font-size:14px;">◆</span>
        <div style="flex:1;height:1px;background:linear-gradient(to left,transparent,#334155);"></div>
      </div>
    </div>

    <!-- ── MAIN CONTENT FRAME ── -->
    <div style="
      width:100%;max-width:600px;
      border:1px solid #334155;
      border-radius:20px;
      overflow:hidden;
      background:#111827;
      box-shadow:0 0 60px rgba(99,102,241,.08),0 0 120px rgba(16,185,129,.04);
    ">

      <!-- frame top accent line -->
      <div style="height:4px;background:linear-gradient(90deg,#2563eb,#7c3aed,#0891b2);"></div>

      <div style="padding:40px 44px;text-align:center;">

        <!-- document type label -->
        <p style="font-size:10px;font-weight:800;letter-spacing:.25em;color:#475569;text-transform:uppercase;margin-bottom:20px;">Dokumen Resmi Evaluasi</p>

        <!-- main title -->
        <h1 style="font-size:32px;font-weight:900;color:#f1f5f9;letter-spacing:-1px;line-height:1.15;margin-bottom:6px;">LAPORAN EVALUASI</h1>
        <h2 style="font-size:24px;font-weight:700;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-bottom:0;">WAWANCARA KERJA</h2>

        <!-- ornament -->
        <div style="display:flex;align-items:center;gap:10px;margin:22px auto;width:80%;">
          <div style="flex:1;height:1px;background:linear-gradient(to right,transparent,#d97706 60%,transparent);"></div>
          <span style="color:#d97706;font-size:18px;">◆</span>
          <div style="flex:1;height:1px;background:linear-gradient(to left,transparent,#d97706 60%,transparent);"></div>
        </div>

        <!-- "Disusun untuk" -->
        <p style="font-size:11px;font-weight:600;letter-spacing:.15em;color:#475569;text-transform:uppercase;margin-bottom:12px;">Disusun untuk</p>

        <!-- Candidate name box -->
        <div style="
          background:#0f172a;
          border:2px solid #d97706;
          border-radius:12px;
          padding:16px 28px;
          margin:0 auto 20px;
          display:inline-block;
          min-width:280px;
        ">
          <p style="font-size:22px;font-weight:900;color:#fbbf24;letter-spacing:-.5px;margin:0;">${candidateName || 'Nama Kandidat'}</p>
        </div>

        <!-- Job title -->
        <p style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.12em;margin-bottom:6px;">Posisi yang Dilamar</p>
        <p style="font-size:15px;font-weight:700;color:#cbd5e1;margin-bottom:24px;">${jobTitle || 'Posisi yang Dilamar'}</p>

        <!-- bottom ornament -->
        <div style="display:flex;align-items:center;gap:10px;margin:0 auto 24px;width:80%;">
          <div style="flex:1;height:1px;background:linear-gradient(to right,transparent,#334155);"></div>
          <span style="color:#334155;font-size:12px;">◆</span>
          <div style="flex:1;height:1px;background:linear-gradient(to left,transparent,#334155);"></div>
        </div>

        <!-- Score + Verdict side by side -->
        <div style="display:flex;align-items:center;justify-content:center;gap:20px;flex-wrap:wrap;">
          <!-- score circle -->
          <div style="
            width:90px;height:90px;
            border-radius:50%;
            border:3px solid ${scoreBorder};
            background:${scoreBg};
            display:flex;flex-direction:column;
            align-items:center;justify-content:center;
          ">
            <p style="font-size:28px;font-weight:900;color:${scoreColor};line-height:1;margin:0;">${score}</p>
            <p style="font-size:10px;color:#475569;margin:2px 0 0;">/100</p>
          </div>
          <div style="text-align:left;">
            <p style="font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px;">Hasil Penilaian</p>
            <p style="font-size:16px;font-weight:900;color:${v.color};letter-spacing:.02em;">${v.label}</p>
          </div>
        </div>

      </div>

      <!-- frame bottom accent line -->
      <div style="height:4px;background:linear-gradient(90deg,#0891b2,#7c3aed,#2563eb);"></div>
    </div>

    <!-- ── FOOTER INFO ── -->
    <div style="width:100%;display:flex;flex-direction:column;align-items:center;gap:8px;">
      <!-- bottom divider -->
      <div style="display:flex;align-items:center;gap:10px;width:100%;max-width:560px;margin-bottom:10px;">
        <div style="flex:1;height:1px;background:linear-gradient(to right,transparent,#334155);"></div>
        <span style="color:#d97706;font-size:14px;">◆</span>
        <div style="flex:1;height:1px;background:linear-gradient(to left,transparent,#334155);"></div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;width:100%;max-width:560px;">
        <p style="font-size:11px;color:#334155;font-weight:600;letter-spacing:.05em;">DOKUMEN RAHASIA · HANYA UNTUK KANDIDAT</p>
        <p style="font-size:11px;color:#334155;">${date}</p>
      </div>
    </div>

  </div>
  <!-- ══════════════════════════════════════════════════ -->
`;
}

function scoreBar(score: number, max: number): string {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#3b82f6' : pct >= 40 ? '#f59e0b' : '#ef4444';
  return `
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="flex:1;height:6px;background:#334155;border-radius:99px;overflow:hidden;">
        <div style="width:${pct}%;height:100%;background:${color};border-radius:99px;"></div>
      </div>
      <span style="font-size:11px;font-weight:700;color:${color};min-width:44px;text-align:right;">${score}/${max}</span>
    </div>`;
}

function verdictBadge(verdict: string): string {
  const map: Record<string, { label: string; color: string; bg: string; border: string }> = {
    recommended:     { label: 'DIREKOMENDASIKAN',       color: '#86efac', bg: '#052e16', border: '#166534' },
    conditional:     { label: 'BERSYARAT',              color: '#fde68a', bg: '#1c1400', border: '#78350f' },
    not_recommended: { label: 'BELUM DIREKOMENDASIKAN', color: '#fca5a5', bg: '#1c0505', border: '#7f1d1d' },
  };
  const v = map[verdict] ?? { label: verdict.toUpperCase(), color: '#94a3b8', bg: '#1e293b', border: '#334155' };
  return `<span style="background:${v.bg};color:${v.color};border:1px solid ${v.border};padding:4px 14px;border-radius:99px;font-size:11px;font-weight:800;letter-spacing:.08em;">${v.label}</span>`;
}

function starIcon(present: boolean): string {
  return present
    ? `<span style="color:#22c55e;font-weight:800;font-size:13px;">✓</span>`
    : `<span style="color:#ef4444;font-weight:800;font-size:13px;">✗</span>`;
}

function ratingTheme(rating: number): { strip: string; badge: string; badgeText: string; badgeBorder: string } {
  if (rating >= 8) return { strip: '#059669', badge: '#052e16', badgeText: '#86efac', badgeBorder: '#166534' };
  if (rating >= 6) return { strip: '#2563eb', badge: '#0c1a3d', badgeText: '#93c5fd', badgeBorder: '#1e3a5f' };
  if (rating >= 4) return { strip: '#d97706', badge: '#1c1000', badgeText: '#fde68a', badgeBorder: '#78350f' };
  return { strip: '#dc2626', badge: '#1c0505', badgeText: '#fca5a5', badgeBorder: '#7f1d1d' };
}

export function generateEvaluationReport(
  evaluation: EvaluationData,
  cvText: string,
  jdText: string,
): void {
  const date = new Date().toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const candidateName = extractCandidateName(cvText);
  const jobTitle      = extractJobTitle(jdText);
  const cover         = coverPage(candidateName, jobTitle, date, evaluation.overall_score, evaluation.recommendation_verdict);

  const qaRows = evaluation.qa_analysis.map((qa, i) => {
    const theme = ratingTheme(qa.rating);

    const starRows = (
      [['Situation', qa.star.situation], ['Task', qa.star.task], ['Action', qa.star.action], ['Result', qa.star.result]] as const
    ).map(([label, dim]: any) => `
      <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:7px;">
        <span style="min-width:14px;font-size:13px;font-weight:800;margin-top:1px;">${dim.present ? '<span style="color:#22c55e;">✓</span>' : '<span style="color:#ef4444;">✗</span>'}</span>
        <div>
          <span style="font-size:12px;font-weight:700;color:#d1fae5;">${label}</span>
          <p style="margin:1px 0 0;font-size:10px;color:#6b7280;line-height:1.4;">${dim.evidence || '—'}</p>
        </div>
      </div>`).join('');

    const conciseRows = (
      [['Consistency', qa.concise.consistency], ['Clarity', qa.concise.clarity], ['Information', qa.concise.information], ['Structure', qa.concise.structure], ['Effectiveness', qa.concise.effectiveness]] as const
    ).map(([label, dim]: any) => {
      const pct = Math.round((dim.score / 10) * 100);
      const c = pct >= 80 ? '#22c55e' : pct >= 60 ? '#3b82f6' : pct >= 40 ? '#f59e0b' : '#ef4444';
      return `
      <div style="margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
          <span style="font-size:11px;font-weight:600;color:#93c5fd;">${label}</span>
          <span style="font-size:11px;font-weight:700;color:${c};">${dim.score}/10</span>
        </div>
        <div style="height:5px;background:#0f172a;border-radius:99px;overflow:hidden;">
          <div style="width:${pct}%;height:100%;background:${c};border-radius:99px;"></div>
        </div>
        <p style="margin:3px 0 0;font-size:10px;color:#475569;line-height:1.3;">${dim.note || ''}</p>
      </div>`;
    }).join('');

    return `
    <div style="margin-bottom:20px;background:#1e293b;border:1px solid #334155;border-radius:14px;overflow:hidden;">

      <div style="background:${theme.strip};height:4px;"></div>

      <div style="padding:12px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #2d3f55;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="background:#334155;color:#94a3b8;width:22px;height:22px;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;">${i + 1}</span>
          <span style="font-size:10px;font-weight:700;color:#64748b;letter-spacing:.1em;text-transform:uppercase;">Pertanyaan</span>
        </div>
        <span style="background:${theme.badge};color:${theme.badgeText};border:1px solid ${theme.badgeBorder};padding:2px 10px;border-radius:99px;font-size:11px;font-weight:800;">Rating ${qa.rating}/10</span>
      </div>

      <div style="padding:14px 16px;">

        <p style="font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.08em;margin:0 0 4px;">Pertanyaan</p>
        <p style="margin:0 0 10px;color:#f1f5f9;font-size:13px;font-weight:600;line-height:1.55;">${qa.question}</p>

        <p style="font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.08em;margin:0 0 4px;">Jawaban Kandidat</p>
        <p style="margin:0 0 12px;color:#94a3b8;font-size:12px;line-height:1.7;background:#0f172a;padding:10px 14px;border-radius:8px;border-left:3px solid #334155;">${qa.answer}</p>

        <div style="display:flex;gap:12px;margin-bottom:12px;">

          <div style="flex:1;min-width:0;background:#071c0e;border:1px solid #166534;border-radius:10px;padding:12px;">
            <p style="font-size:10px;font-weight:800;color:#4ade80;text-transform:uppercase;letter-spacing:.08em;margin:0 0 10px;">⭐ STAR — ${qa.star.score}/4</p>
            ${starRows}
          </div>

          <div style="flex:1;min-width:0;background:#050d1f;border:1px solid #1e3a5f;border-radius:10px;padding:12px;">
            <p style="font-size:10px;font-weight:800;color:#60a5fa;text-transform:uppercase;letter-spacing:.08em;margin:0 0 10px;">📊 ConCISE — ${qa.concise.total}/50</p>
            ${conciseRows}
          </div>

        </div>

        <div style="background:#1a0e00;border:1px solid #78350f;border-radius:8px;padding:10px 12px;margin-bottom:8px;">
          <p style="font-size:10px;font-weight:700;color:#f59e0b;text-transform:uppercase;letter-spacing:.08em;margin:0 0 4px;">💡 Saran Perbaikan</p>
          <p style="margin:0;color:#fde68a;font-size:12px;line-height:1.6;">${qa.suggestion}</p>
        </div>

        <div style="display:flex;gap:8px;">
          <div style="flex:1;background:#110622;border:1px solid #4c1d95;border-radius:8px;padding:10px 12px;">
            <p style="font-size:10px;font-weight:700;color:#a78bfa;text-transform:uppercase;letter-spacing:.08em;margin:0 0 4px;">⚡ Hack Kunci</p>
            <p style="margin:0;color:#ddd6fe;font-size:12px;line-height:1.6;">${qa.hack}</p>
          </div>
          <div style="flex:1;background:#071c0e;border:1px solid #166534;border-radius:8px;padding:10px 12px;">
            <p style="font-size:10px;font-weight:700;color:#4ade80;text-transform:uppercase;letter-spacing:.08em;margin:0 0 4px;">✨ Jawaban Lebih Baik</p>
            <p style="margin:0;color:#bbf7d0;font-size:12px;line-height:1.6;">${qa.better_answer_example}</p>
          </div>
        </div>

      </div>
    </div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Laporan Evaluasi Wawancara — Intervyouuu</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      background: #0a0f1e;
      min-height: 100%;
    }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      color: #cbd5e1;
      font-size: 14px;
      line-height: 1.6;
    }
    .page {
      width: 100%;
      padding: 40px 48px 60px;
    }
    .divider { border: none; border-top: 1px solid #1e293b; margin: 28px 0; }
    .section-title {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .12em;
      color: #475569;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #1e293b;
    }
    @media print {
      html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #0a0f1e !important; }
      .no-print { display: none !important; }
      @page { margin: 0; size: A4; background: #0a0f1e; }
    }
  </style>
</head>
<body>

  ${cover}

<div class="page">

  <!-- PRINT BAR -->
  <div class="no-print" style="position:fixed;top:0;left:0;right:0;z-index:999;background:#0f172a;border-bottom:1px solid #334155;padding:10px 24px;display:flex;align-items:center;justify-content:space-between;">
    <span style="font-size:12px;color:#64748b;font-weight:600;">Intervyouuu · Laporan Evaluasi</span>
    <button onclick="window.print()" style="background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;border:none;padding:8px 24px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;letter-spacing:.02em;">
      ⬇ Simpan PDF
    </button>
  </div>
  <div class="no-print" style="height:52px;"></div>

  <!-- HEADER -->
  <div style="background:linear-gradient(135deg,#1d4ed8 0%,#4338ca 50%,#7c3aed 100%);border-radius:20px;padding:32px 36px;margin-bottom:28px;position:relative;overflow:hidden;">
    <div style="position:absolute;top:-40px;right:-40px;width:200px;height:200px;background:rgba(255,255,255,.04);border-radius:50%;"></div>
    <div style="position:absolute;bottom:-60px;left:30%;width:300px;height:300px;background:rgba(255,255,255,.03);border-radius:50%;"></div>
    <div style="position:relative;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:20px;">
      <div>
        <p style="font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:10px;">Intervyouuu · AI Interview Simulator</p>
        <h1 style="font-size:28px;font-weight:900;letter-spacing:-.5px;color:#fff;margin-bottom:6px;">Laporan Evaluasi Wawancara</h1>
        <p style="color:rgba(255,255,255,.6);font-size:13px;">${date}</p>
        <div style="margin-top:16px;">${verdictBadge(evaluation.recommendation_verdict)}</div>
      </div>
      <div style="text-align:right;">
        <p style="font-size:10px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px;">Skor Keseluruhan</p>
        <p style="font-size:64px;font-weight:900;letter-spacing:-3px;line-height:1;color:#fff;">${evaluation.overall_score}</p>
        <p style="font-size:13px;color:rgba(255,255,255,.5);">dari 100 poin</p>
      </div>
    </div>
  </div>

  <!-- RINGKASAN EKSEKUTIF -->
  <p class="section-title">Ringkasan Eksekutif</p>
  <div style="background:#1e293b;border:1px solid #334155;border-radius:14px;padding:20px;margin-bottom:24px;">
    <p style="color:#cbd5e1;line-height:1.8;font-size:14px;">${evaluation.overall_summary}</p>
  </div>

  <!-- PROFIL KOMUNIKASI -->
  <p class="section-title">Profil Komunikasi</p>
  <div style="background:#1e293b;border:1px solid #334155;border-radius:14px;padding:20px;margin-bottom:24px;display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap;">
    <div style="flex:1;min-width:200px;">
      <p style="font-size:18px;font-weight:800;color:#f1f5f9;margin-bottom:4px;">${evaluation.candidate_archetype.label}</p>
      <p style="font-size:13px;color:#94a3b8;margin-bottom:10px;line-height:1.6;">${evaluation.candidate_archetype.description}</p>
      <p style="font-size:12px;color:#64748b;font-style:italic;line-height:1.6;">${evaluation.candidate_archetype.hr_perspective}</p>
    </div>
    <div style="min-width:110px;text-align:center;">
      <div style="background:${evaluation.candidate_archetype.warning_level === 'high' ? '#1c0505' : evaluation.candidate_archetype.warning_level === 'medium' ? '#1c1000' : '#071c0e'};border:1px solid ${evaluation.candidate_archetype.warning_level === 'high' ? '#7f1d1d' : evaluation.candidate_archetype.warning_level === 'medium' ? '#78350f' : '#166534'};border-radius:10px;padding:12px 16px;">
        <p style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;">Warning Level</p>
        <p style="font-size:15px;font-weight:800;color:${evaluation.candidate_archetype.warning_level === 'high' ? '#fca5a5' : evaluation.candidate_archetype.warning_level === 'medium' ? '#fde68a' : '#86efac'};">${evaluation.candidate_archetype.warning_level.toUpperCase()}</p>
      </div>
    </div>
  </div>

  <!-- KEKUATAN & KELEMAHAN -->
  <p class="section-title">Kekuatan & Area Pengembangan</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px;">
    <div style="background:#071c0e;border:1px solid #166534;border-radius:14px;padding:18px;">
      <p style="font-size:10px;font-weight:800;color:#4ade80;text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px;">✓ Kekuatan</p>
      ${evaluation.strengths.map(s => `
        <div style="display:flex;gap:10px;margin-bottom:8px;align-items:flex-start;">
          <span style="color:#22c55e;font-weight:700;font-size:13px;margin-top:1px;">✓</span>
          <span style="font-size:13px;color:#bbf7d0;line-height:1.5;">${s}</span>
        </div>`).join('')}
    </div>
    <div style="background:#1a0e00;border:1px solid #78350f;border-radius:14px;padding:18px;">
      <p style="font-size:10px;font-weight:800;color:#fb923c;text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px;">△ Area Pengembangan</p>
      ${evaluation.weaknesses.map(w => `
        <div style="display:flex;gap:10px;margin-bottom:8px;align-items:flex-start;">
          <span style="color:#f97316;font-weight:700;font-size:13px;margin-top:1px;">△</span>
          <span style="font-size:13px;color:#fde68a;line-height:1.5;">${w}</span>
        </div>`).join('')}
    </div>
  </div>

  <hr class="divider" />

  <!-- CV vs JD MATCH -->
  <p class="section-title">Kesesuaian CV vs Job Description</p>
  <div style="background:#050d1f;border:1px solid #1e3a5f;border-radius:14px;padding:22px;margin-bottom:28px;">
    <div style="display:flex;align-items:center;gap:24px;margin-bottom:16px;">
      <div>
        <p style="font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;">Match Score</p>
        <p style="font-size:40px;font-weight:900;color:#60a5fa;line-height:1;">${evaluation.cv_jd_match.score}<span style="font-size:18px;opacity:.5;">/100</span></p>
      </div>
      <div style="flex:1;">${scoreBar(evaluation.cv_jd_match.score, 100)}</div>
    </div>
    <p style="font-size:13px;color:#94a3b8;margin-bottom:18px;line-height:1.7;">${evaluation.cv_jd_match.assessment}</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div>
        <p style="font-size:10px;font-weight:700;color:#4ade80;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Skill Terbukti di Interview</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${evaluation.cv_jd_match.matched_skills_in_interview.length
            ? evaluation.cv_jd_match.matched_skills_in_interview.map(s => `<span style="background:#071c0e;color:#86efac;border:1px solid #166534;font-size:11px;font-weight:600;padding:3px 10px;border-radius:99px;">${s}</span>`).join('')
            : '<span style="font-size:12px;color:#475569;">—</span>'}
        </div>
      </div>
      <div>
        <p style="font-size:10px;font-weight:700;color:#f87171;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Skill Gap Belum Terjawab</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${evaluation.cv_jd_match.skill_gaps_unaddressed.length
            ? evaluation.cv_jd_match.skill_gaps_unaddressed.map(s => `<span style="background:#1c0505;color:#fca5a5;border:1px solid #7f1d1d;font-size:11px;font-weight:600;padding:3px 10px;border-radius:99px;">${s}</span>`).join('')
            : '<span style="font-size:12px;color:#475569;">Tidak ada</span>'}
        </div>
      </div>
    </div>
  </div>

  <hr class="divider" />

  <!-- PER PERTANYAAN -->
  <p class="section-title">Analisis Per Pertanyaan (${evaluation.qa_analysis.length} Pertanyaan)</p>
  ${qaRows}

  <hr class="divider" />

  <!-- REKOMENDASI FINAL -->
  <p class="section-title">Rekomendasi Final</p>
  <div style="background:#1e293b;border:1px solid #334155;border-left:4px solid #4f46e5;border-radius:14px;padding:22px;margin-bottom:40px;">
    <p style="color:#cbd5e1;font-size:14px;line-height:1.85;">${evaluation.final_recommendation}</p>
  </div>

  <!-- FOOTER -->
  <div style="border-top:1px solid #1e293b;padding-top:20px;display:flex;justify-content:space-between;align-items:center;">
    <p style="font-size:11px;color:#334155;">Dibuat oleh <strong style="color:#475569;">Intervyouuu</strong> · AI Interview Simulator</p>
    <p style="font-size:11px;color:#334155;">${date}</p>
  </div>

</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
}
