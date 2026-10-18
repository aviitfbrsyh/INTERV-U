# -*- coding: utf-8 -*-
"""
Script Generator Dokumen Laporan Resmi Pertemuan 6 Tugas Akhir (Asinkron)
File Output:
- bimbingan_bu_rina/P06-23523238-Avit Febriansyah.docx
- dokumen_skripsi/P06-23523238-Avit Febriansyah.docx
- bimbingan_bu_rina/P06-23523238-Avit Febriansyah.md
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_element(name):
    return OxmlElement(name)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_background(cell, hex_color):
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shd)

def add_callout(doc, text_lines, bg_color='F8FAFC', border_color='1E3A8A'):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    tbl.columns[0].width = Inches(6.5)
    
    cell = tbl.cell(0, 0)
    set_cell_background(cell, bg_color)
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/>
            <w:top w:val="none"/>
            <w:right w:val="none"/>
            <w:bottom w:val="none"/>
        </w:tcBorders>
    ''')
    cell._tc.get_or_add_tcPr().append(borders)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    for i, line in enumerate(text_lines):
        p = cell.paragraphs[0] if i == 0 else cell.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        run = p.add_run(line)
        run.font.name = 'Calibri'
        run.font.size = Pt(9.5)
        run.font.color.rgb = RGBColor(30, 41, 59)

def format_row(row, heights_pt, col_widths, bg_color=None, bold=False, font_size=9, font_color=RGBColor(15, 23, 42)):
    for i, cell in enumerate(row.cells):
        cell.width = col_widths[i]
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
        if bg_color:
            set_cell_background(cell, bg_color)
        for p in cell.paragraphs:
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            for run in p.runs:
                run.font.name = 'Calibri'
                run.font.size = Pt(font_size)
                run.font.bold = bold
                run.font.color.rgb = font_color

def build_docx_report():
    doc = docx.Document()
    
    # 1 inch margins
    for sec in doc.sections:
        sec.top_margin = Inches(1.0)
        sec.bottom_margin = Inches(1.0)
        sec.left_margin = Inches(1.0)
        sec.right_margin = Inches(1.0)
        
    # Title & Metadata
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(2)
    r = title_p.add_run("LAPORAN PERKEMBANGAN PENELITIAN TUGAS AKHIR")
    r.font.name = 'Calibri'
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = RGBColor(30, 58, 138)
    
    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_before = Pt(0)
    sub_p.paragraph_format.space_after = Pt(12)
    r = sub_p.add_run("Pertemuan ke-6 (Asinkron) — Rekapitulasi & Hasil Pengerjaan Seluruh PR Bimbingan Dosen")
    r.font.name = 'Calibri'
    r.font.size = Pt(11)
    r.font.color.rgb = RGBColor(100, 116, 139)
    
    # Header Callout (Identity)
    add_callout(doc, [
        "IDENTITAS MAHASISWA & PENELITIAN",
        "• NIM: 23523238",
        "• Nama: Avit Febriansyah",
        "• Judul Skripsi: Rancang Bangun Sistem Simulasi Kerja Voice-to-Voice Berbasis Pemetaan Kompetensi Spencer & Spencer dengan Evaluasi LLM-as-a-Judge",
        "• Dosen Pengampu / Pembimbing: Ibu Chanifah, M.Kom. (Bu Rina)",
        "• Program Studi: Informatika – Program Sarjana, Fakultas Teknologi Industri, Universitas Islam Indonesia",
        "• Status Tugas: Laporan Pertemuan ke-6 Asinkron & Presensi Kehadiran Resmi"
    ], bg_color='EFF6FF', border_color='1E3A8A')
    
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run("BAGIAN I: REKAPITULASI DAFTAR PR BIMBINGAN PENELITIAN")
    r.font.name = 'Calibri'
    r.font.size = Pt(13)
    r.font.bold = True
    r.font.color.rgb = RGBColor(15, 23, 42)
    
    intro_p = doc.add_paragraph()
    intro_p.paragraph_format.space_after = Pt(6)
    r = intro_p.add_run("Berikut adalah rekapitulasi komprehensif seluruh instruksi perbaikan dan tugas rumah (PR) yang diberikan oleh Dosen Pembimbing (Ibu Chanifah, M.Kom.) beserta status penyelesaian dan dokumen hasilnya:")
    r.font.size = Pt(10)
    
    # Table Summary PR
    col_w = [Inches(0.6), Inches(2.2), Inches(1.8), Inches(1.9)]
    tbl = doc.add_table(rows=8, cols=4)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    
    headers = ["No", "Rincian Tugas / PR Bimbingan", "Dokumen Hasil & Lokasi Berkas", "Status Penyelesaian"]
    for i, h in enumerate(headers):
        cell = tbl.cell(0, i)
        cell.text = h
    format_row(tbl.rows[0], 20, col_w, bg_color='1E3A8A', bold=True, font_color=RGBColor(255, 255, 255))
    
    rows_data = [
        ("PR 1", "Evaluasi & Komparasi Kamus Spencer & Spencer (1993) Asli EN vs Terjemahan ID (Semantic Shift)", "bimbingan_bu_rina/\nLaporan Perbandingan Kamus Kompetensi...", "SELESAI 100%\n(24 Temuan Kritis Diidentifikasi)"),
        ("PR 2", "Riset Empiris 27 Loker IT JobStreet & Penyusunan Matriks Standar HRD Terbobot", "bimbingan_bu_rina/\nMATRIKS_KOMPETENSI_IT_JOBSTREET_BU_RINA.xlsx", "SELESAI 100%\n(4 Sheet HRD + Formula =SUM())"),
        ("PR 3", "Perancangan BPMN 6 Swimlane & Formula Penskoran Deterministik (LLM vs SAW Engine)", "bimbingan_bu_rina/\nBPMN_PROSES_EVALUASI_INTERVU.drawio", "SELESAI 100%\n(BPMN XML + Pembuktian Skor 93)"),
        ("PR 4", "Kajian Literatur Teori STAR (Janz 1982, Byham 1974) & Instrumen Probing FACT", "bimbingan_bu_rina/\nKAJIAN_LITERATUR_TEORI_STAR_DAN_FACT.md", "SELESAI 100%\n(Validitas 0.51 vs 0.38 APA 7th)"),
        ("PR 5", "Tabel Komparasi Model Lama (Baseline) vs Model Baru (Multi-Framework)", "hasil_pengujian/\nPERBANDINGAN_MODEL_LAMA_VS_BARU.xlsx", "SELESAI 100%\n(49 Aspek, 10 Fitur Baru Terdata)"),
        ("PR 6", "Protokol & Panduan Pengujian 3–4 Responden Teman IT (Mitigasi Researcher Bias)", "bimbingan_bu_rina/\nPANDUAN_DAN_PROTOKOL_PENGUJIAN_RESPONDEN_IT.md", "SELESAI 100%\n(SOP 6 Langkah + Lembar Audit)"),
        ("PR 7", "Penyesuaian Sistem INTERV-U (30 Menit, Mode Tunggal Siti Rahayu, 7 BEI, Closing Q&A)", "Live Interview Codebase &\nDeploy di Vercel: https://interv-u.vercel.app", "SELESAI 100%\n(Live, Build Sukses, Commit d9c315d)")
    ]
    
    for r_idx, data in enumerate(rows_data):
        row = tbl.rows[r_idx + 1]
        for c_idx, text in enumerate(data):
            row.cells[c_idx].text = text
        bg = 'F8FAFC' if r_idx % 2 == 1 else 'FFFFFF'
        format_row(row, 18, col_w, bg_color=bg, bold=(c_idx==0), font_size=8.5)
        
    doc.add_page_break()
    
    # Bagian II: Uraian Mendalam
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run("BAGIAN II: URAIAN MENDALAM HASIL PEKERJAAN SETIAP PR")
    r.font.name = 'Calibri'
    r.font.size = Pt(13)
    r.font.bold = True
    r.font.color.rgb = RGBColor(15, 23, 42)
    
    sections_detail = [
        ("1. PR 1: KAJIAN KOMPARASI KAMUS KOMPETENSI SPENCER & SPENCER (EN vs ID)", [
            "Kebutuhan / Arahan Dosen: Dosen pembimbing menginstruksikan bahwa penetapan kompetensi tidak boleh menggunakan terjemahan bahasa Indonesia yang beredar tanpa verifikasi ke sumber buku teks aslinya, karena dikhawatirkan terjadi pergeseran makna (semantic shift).",
            "Hasil Pelaksanaan & Temuan Kritis:",
            "Peneliti telah melakukan telaah komparasi kata demi kata level demi level pada seluruh 20 kamus kompetensi Spencer & Spencer (1993) antara edisi asli Bahasa Inggris (Competence at Work: Models for Superior Performance) dan edisi terjemahan Indonesia.",
            "Ditemukan 24 anomali kritis (Kode Temuan T-01 s/d T-24), di antaranya:",
            "1. Teamwork (TW) Level 7: Terjemahan bahasa Indonesia yang beredar secara fatal menuliskan 'menciptakan kompetisi dalam kelompok'. Padahal buku teks asli Spencer & Spencer (1993, hal. 73) berbunyi 'Resolves conflicts: faces up to conflict and resolves it'. Terjemahan tersebut berlawanan 180 derajat dengan esensi kerja sama tim!",
            "2. Conceptual Thinking (CT) Level 2: Terjadi duplikasi definisi yang mengabaikan transisi logika induktif kandidat.",
            "3. Hilangnya Level Negatif (-1 dan 0): Dokumen terjemahan Indonesia memangkas skala minus, padahal dalam BEI level minus sangat penting untuk mendeteksi perilaku destruktif pelamar.",
            "Keputusan Metodologis Skripsi: Sistem INTERV-U menggunakan teks asli edisi Inggris 1993 sebagai basis evaluasi LLM, dengan terjemahan operasional bahasa Indonesia yang telah dikoreksi total.",
            "Tautan / File: bimbingan_bu_rina/Laporan Perbandingan Kamus Kompetensi Spencer & Spencer (EN vs ID).md"
        ]),
        
        ("2. PR 2: RISET EMPIRIS 27 LOKER IT JOBSTREET & MATRIKS BOBOT HRD", [
            "Kebutuhan / Arahan Dosen: Penetapan target level dan persentase bobot kompetensi tidak boleh hasil asumsi subjektif peneliti. Harus berakar dari data kebutuhan riil industri pasar kerja IT saat ini.",
            "Hasil Pelaksanaan:",
            "Peneliti melakukan ekstraksi data empiris dari 27 lowongan kerja IT aktif di portal JobStreet (wilayah Jakarta & Yogyakarta) untuk 4 rumpun profesi: Software Engineer/Programmer, UI/UX Designer, QA Tester, dan Data Analyst.",
            "Disintesiskan 7 Kompetensi Inti IT yang paling krusial:",
            "• EXP (Technical Expertise) — Target Level 4, Bobot 25%: Kemampuan penguasaan stack teknologi modern (React, Next.js, Node, TypeScript, SQL/NoSQL).",
            "• AT (Analytical Thinking) — Target Level 3, Bobot 15%: Kemampuan sistematis melakukan pemecahan masalah algoritma dan root-cause analysis.",
            "• CT (Conceptual Thinking) — Target Level 3, Bobot 10%: Kemampuan sintesis arsitektur sistem dan pattern recognition.",
            "• ACH (Achievement Orientation) — Target Level 3, Bobot 15%: Dorongan mencapai standar kualitas tinggi dan optimasi kinerja.",
            "• CO (Concern for Order, Quality, Accuracy) — Target Level 4, Bobot 15%: Penekanan clean code, dokumentasi, dan unit testing ketat.",
            "• TW (Teamwork & Cooperation) — Target Level 3, Bobot 10%: Kolaborasi lintas disiplin (developer, desainer, QA, PM).",
            "• INT (Initiative) — Target Level 3, Bobot 10%: Tindakan proaktif mencegah hambatan teknis sebelum diminta pimpinan.",
            "Hasil riset dikemas dalam workbook Excel 4 sheet berstandar HRD dengan formula validasi otomatis =SUM() = 100%.",
            "Tautan / File: bimbingan_bu_rina/MATRIKS_KOMPETENSI_IT_JOBSTREET_BU_RINA.xlsx & bimbingan_bu_rina/Rekap_Lowongan_IT_JobStreet.md"
        ]),
        
        ("3. PR 3: ARSITEKTUR EVALUASI BPMN 6 SWIMLANE & FORMULA PENSKORAN DETERMINISTIK", [
            "Kebutuhan / Arahan Dosen: LLM tidak boleh dibiarkan mengarang angka nilai secara bebas (halusinasi AI). Harus ada alur proses bisnis jelas (BPMN) dan formula perhitungan matematis yang dapat diverifikasi secara akademik.",
            "Hasil Pelaksanaan:",
            "1. Diagram BPMN 2.0 (6 Swimlane): Dirancang memisahkan batas tanggung jawab secara tegas antara User, Web Audio API 24kHz, AI Interviewer (Siti Rahayu), LLM-as-a-Judge, Deterministic Engine SAW, dan Dashboard.",
            "2. Pembagian Peran Tegas: LLM Gemini HANYA bertugas mengekstrak bukti kualitatif (keberadaan elemen STAR 0-4, skor pilar FACT 1-10, dan level Spencer 1-5). LLM DILARANG menjumlahkan atau menghitung skor akhir.",
            "3. Formula Simple Additive Weighting (SAW): Perhitungan skor dilakukan 100% oleh kode backend deterministik melalui rumus rasio pemenuhan:",
            "   S_base,i = min(100, (L_act / L_tgt) x 80)",
            "   μ_FACT = 0.85 + (0.30 x FACT_norm)",
            "   S_final,i = S_base,i x μ_FACT",
            "   Skor Akhir = SUM(w_i x S_final,i)",
            "Telah dibuktikan audit matematis empiris dengan contoh kandidat memperoleh nilai 93/100 tanpa deviasi halusinasi.",
            "Tautan / File: bimbingan_bu_rina/BPMN_PROSES_EVALUASI_INTERVU.drawio & bimbingan_bu_rina/MEKANISME_DAN_FORMULA_PENSKORAN_KOMPETENSI.md"
        ]),
        
        ("4. PR 4: KAJIAN LITERATUR ILMIAH TEORI STAR & TURUNANNYA (FACT PROBING)", [
            "Kebutuhan / Arahan Dosen: Menegaskan bahwa alasan 'industri sudah pakai STAR' tidak ilmiah dan tidak cukup untuk sidang skripsi. Wajib melacak silsilah penemu, landasan psikologi, serta instrumen auditnya.",
            "Hasil Pelaksanaan:",
            "Peneliti menyusun tinjauan pustaka akademik setebal Bab II yang melacak silsilah ilmiah STAR:",
            "• Aksioma Psikologi Industri (Wernimont & Campbell, 1968): 'The best predictor of future behavior is past behavior in similar circumstances'.",
            "• Dr. William C. Byham (1974): Pencetus akronim STAR dan sistem Targeted Selection® di Development Dimensions International (DDI) untuk menstandarkan Complete STAR vs False STAR.",
            "• Dr. Tom Janz (1982, Journal of Applied Psychology): Tokoh yang membuktikan secara empiris keunggulan Behavioral Description Interviewing (BDI) atas wawancara tidak terstruktur.",
            "• Meta-Analisis Schmidt & Hunter (1998): Membuktikan validitas prediktif wawancara perilaku mencapai r = 0.51, jauh melampaui wawancara konvensional (r = 0.38).",
            "• FACT Probing Protocol (Byham, 2003): Instrumen audit 4 pilar (Feeling, Action, Context, Thinking) guna membongkar jawaban hafalan (scripted STAR) dan klaim sepihak tim (freerider).",
            "Tautan / File: bimbingan_bu_rina/KAJIAN_LITERATUR_TEORI_STAR_DAN_FACT.md (Lengkap sitasi APA 7th Edition)"
        ]),
        
        ("5. PR 5: TABEL KOMPARASI MODEL LAMA (BASELINE) vs MODEL BARU (MULTI-FRAMEWORK)", [
            "Kebutuhan / Arahan Dosen: Menunjukkan bukti konkret lompatan kualitas antara prototipe awal sistem dengan versi revisi pasca-bimbingan untuk dicantumkan di Bab IV Skripsi.",
            "Hasil Pelaksanaan:",
            "Peneliti telah membedah dan mendokumentasikan komparasi nyata dalam workbook Excel 4 sheet:",
            "• Sheet 1 (Ringkasan 49 Aspek): Meliputi Framework Evaluasi (Model lama hanya STAR & ConCISE; Model baru mengintegrasikan FACT dan Kamus 7 Kompetensi Spencer), Refactoring LiveInterview.tsx dari 1.473 ke 1.066 baris, penambahan Kamus Konteks, dan skema evaluasi dari 8 field menjadi 10 field.",
            "• Sheet 2 (Hasil Pengujian): Lulusnya seluruh 24 Test Case (10 Unit Test algoritma audio/filler, 10 Black-Box API, dan 4 E2E Playwright).",
            "• Sheet 3 (Delta Fitur): 10 fitur baru yang ditambahkan pada model baru.",
            "• Sheet 4 (Kesimpulan): Sintesis perbandingan arsitektural dan metodologis skripsi.",
            "Tautan / File: hasil_pengujian/PERBANDINGAN_MODEL_LAMA_VS_BARU.xlsx"
        ]),
        
        ("6. PR 6: PROTOKOL & PANDUAN PENGUJIAN 3–4 RESPONDEN REKAN IT", [
            "Kebutuhan / Arahan Dosen: Menghilangkan bias peneliti (researcher bias) dengan menguji sistem secara kualitatif kepada 3–4 rekan mahasiswa/alumni IT sebelum pelaksanaan UAT massal.",
            "Hasil Pelaksanaan:",
            "Peneliti telah merumuskan panduan operasional terstandar:",
            "• Landasan Metodologi HCI (Jakob Nielsen & Landauer, 1993): 3–4 penguji ahli mampu mendeteksi 75%–85% anomali interaksi dan ketidakwajaran evaluasi.",
            "• Profil 4 Responden IT: Frontend Developer, Backend/DevOps, QA Automation Tester, dan UI/UX Designer.",
            "• SOP Pengujian 6 Langkah (35 Menit): Setup -> Voice Calibration -> Live Session 30 Menit (Bu Siti Rahayu) -> Review Dashboard -> Coaching TTS -> Pengisian Log.",
            "• Lembar Audit & Checklist Evaluasi: Memverifikasi apakah capaian level Spencer, skor STAR, dan audit FACT mencerminkan fakta pengalaman nyata mereka.",
            "Tautan / File: bimbingan_bu_rina/PANDUAN_DAN_PROTOKOL_PENGUJIAN_RESPONDEN_IT.md"
        ]),
        
        ("7. PR 7: IMPLEMENTASI TEKNIS & PENYESUAIAN SISTEM INTERV-U", [
            "Kebutuhan / Arahan Dosen: Menyelaraskan seluruh kode program web application dengan arahan bimbingan.",
            "Hasil Pelaksanaan & Status Deploy:",
            "1. Durasi Wawancara 30 Menit: LiveInterview.tsx telah disetel dengan pacing mendalam 30 menit untuk melatih ketahanan verbal profesional kandidat.",
            "2. Mode Tunggal Bu Siti Rahayu: Menonaktifkan mode artifisial (supportive & high pressure), memusatkan seluruh interaksi pada persona profesional hangat dan tegas (Warm but Firm) Asesor BEI Senior.",
            "3. Alur 7 Kompetensi Perilaku Terstandar: Pertanyaan live dirumuskan berurutan secara konsisten (EXP, AT, CT, ACH, CO, TW, INT) dengan larangan mutlak pertanyaan teknis teoritis dan pertanyaan hipotetis masa depan.",
            "4. Sesi Penutup 3-Tahap (Closing Q&A): Memberikan ruang interaktif bagi kandidat untuk bertanya balik kepada Bu Siti Rahayu mengenai kultur tim, tantangan engineering, dan ekspektasi performa.",
            "5. Status Rilis: Berhasil dikompilasi (Next.js 15.4.9) dan telah ter-deploy aktif di Vercel: https://interv-u.vercel.app (Commit d9c315d)."
        ])
    ]
    
    for title, paragraphs in sections_detail:
        sec_p = doc.add_paragraph()
        sec_p.paragraph_format.space_before = Pt(12)
        sec_p.paragraph_format.space_after = Pt(4)
        r = sec_p.add_run(title)
        r.font.name = 'Calibri'
        r.font.size = Pt(11)
        r.font.bold = True
        r.font.color.rgb = RGBColor(30, 58, 138)
        
        for item in paragraphs:
            ip = doc.add_paragraph()
            ip.paragraph_format.space_before = Pt(1)
            ip.paragraph_format.space_after = Pt(3)
            r = ip.add_run(item)
            r.font.name = 'Calibri'
            r.font.size = Pt(9.5)
            if item.startswith("Kebutuhan") or item.startswith("Tautan"):
                r.font.bold = True
                
        # Embed screenshots for PR 2 and PR 3
        if "PR 2:" in title:
            ss_path = "bimbingan_bu_rina/ss_matriks_jobstreet_excel.png"
            if os.path.exists(ss_path):
                img_p = doc.add_paragraph()
                img_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                img_p.paragraph_format.space_before = Pt(6)
                img_p.paragraph_format.space_after = Pt(2)
                doc.add_picture(ss_path, width=Inches(6.2))
                cap_p = doc.add_paragraph()
                cap_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                cap_p.paragraph_format.space_after = Pt(6)
                r_cap = cap_p.add_run("Gambar 1. Tangkapan Layar Matriks Kompetensi IT Standar HRD (MATRIKS_KOMPETENSI_IT_JOBSTREET_BU_RINA.xlsx)")
                r_cap.font.size = Pt(8.5)
                r_cap.font.italic = True
                r_cap.font.color.rgb = RGBColor(100, 116, 139)

        if "PR 3:" in title:
            ss_path = "bimbingan_bu_rina/ss_bpmn_arsitektur_intervu.png"
            if os.path.exists(ss_path):
                img_p = doc.add_paragraph()
                img_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                img_p.paragraph_format.space_before = Pt(6)
                img_p.paragraph_format.space_after = Pt(2)
                doc.add_picture(ss_path, width=Inches(6.2))
                cap_p = doc.add_paragraph()
                cap_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                cap_p.paragraph_format.space_after = Pt(6)
                r_cap = cap_p.add_run("Gambar 2. Diagram Alir Arsitektur Evaluasi BPMN 2.0 (BPMN_PROSES_EVALUASI_INTERVU.drawio)")
                r_cap.font.size = Pt(8.5)
                r_cap.font.italic = True
                r_cap.font.color.rgb = RGBColor(100, 116, 139)
                
    # Closing sign-off
    doc.add_page_break()
    p_close = doc.add_paragraph()
    p_close.paragraph_format.space_before = Pt(12)
    p_close.paragraph_format.space_after = Pt(4)
    r = p_close.add_run("BAGIAN III: KESIMPULAN & TAHAP BERIKUTNYA")
    r.font.name = 'Calibri'
    r.font.size = Pt(13)
    r.font.bold = True
    r.font.color.rgb = RGBColor(15, 23, 42)
    
    conc_text = [
        "1. Kesiapan Menghadapi Sidang / Bimbingan Lanjutan: Seluruh keraguan metodologis dosen pembimbing terkait landasan ilmiah kompetensi Spencer & Spencer, validitas aksioma STAR & FACT, justifikasi kebutuhan pasar kerja IT, serta transparansi formula penskoran deterministik telah terjawab tuntas dengan bukti berkas fisik dan matematis.",
        "2. Rencana Pelaksanaan Peer Testing: Berdasarkan SOP pada PR 6, peneliti akan menjadwalkan sesi uji coba live 30 menit bersama 4 rekan mahasiswa/alumni IT pada rentang tanggal 19-21 Oktober 2026. Seluruh log evaluasi dan rekaman layar akan dikompilasikan ke dalam draf Bab IV Skripsi.",
        "3. Berkas Pendukung Lengkap: Seluruh berkas Excel, Draw.io, dan dokumen Markdown tersimpan rapi dalam folder bimbingan_bu_rina/ dan hasil_pengujian/ dengan indeks navigasi pada file INDEX_BERKAS_PROJECT.md."
    ]
    for c in conc_text:
        cp = doc.add_paragraph()
        cp.paragraph_format.space_after = Pt(4)
        r = cp.add_run(c)
        r.font.name = 'Calibri'
        r.font.size = Pt(9.5)
        
    sign_table = doc.add_table(rows=1, cols=2)
    sign_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sign_table.autofit = False
    sign_table.columns[0].width = Inches(3.25)
    sign_table.columns[1].width = Inches(3.25)
    
    cell_l = sign_table.cell(0, 0)
    p_l = cell_l.paragraphs[0]
    p_l.add_run("Mengetahui,\nDosen Pembimbing Skripsi,\n\n\n\n\nIbu Chanifah, M.Kom.")
    
    cell_r = sign_table.cell(0, 1)
    p_r = cell_r.paragraphs[0]
    p_r.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_r.add_run("Yogyakarta, 18 Oktober 2026\nMahasiswa Peneliti,\n\n\n\n\nAvit Febriansyah (NIM: 23523238)")
    
    # Save files
    out_docx_1 = "bimbingan_bu_rina/P06-23523238-Avit Febriansyah.docx"
    out_docx_2 = "dokumen_skripsi/P06-23523238-Avit Febriansyah.docx"
    doc.save(out_docx_1)
    doc.save(out_docx_2)
    print(f"Generated docx at: {out_docx_1} and {out_docx_2}")

if __name__ == '__main__':
    build_docx_report()
