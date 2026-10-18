import xml.etree.ElementTree as ET
import xml.dom.minidom

def create_drawio_bpmn():
    mxfile = ET.Element('mxfile', host="app.diagrams.net", modified="2026-10-18T10:15:00.000Z", agent="INTERV-U AI Agent", version="24.0.0", type="device")
    diagram = ET.SubElement(mxfile, 'diagram', id="bpmn-intervu-scoring", name="BPMN Alur Proses Evaluasi INTERV-U")
    mxGraphModel = ET.SubElement(diagram, 'mxGraphModel', dx="1422", dy="850", grid="1", gridSize="10", guides="1", tooltips="1", connect="1", arrows="1", fold="1", page="1", pageScale="1", pageWidth="1654", pageHeight="1169", math="0", shadow="0")
    root = ET.SubElement(mxGraphModel, 'root')

    # Base cells
    ET.SubElement(root, 'mxCell', id="0")
    ET.SubElement(root, 'mxCell', id="1", parent="0")

    # Main Pool
    pool = ET.SubElement(root, 'mxCell', id="pool_1", value="SISTEM SIMULASI WAWANCARA KERJA INTERV-U (MULTI-FRAMEWORK BEI & DETERMINISTIC SCORING)", style="swimlane;html=1;childLayout=stackLayout;resizeParent=1;resizeParentMax=0;startSize=40;horizontal=0;horizontalFlip=1;fillColor=#0F172A;fontColor=#FFFFFF;fontStyle=1;fontSize=13;fontFamily=Segoe UI;swimlaneFillColor=#FFFFFF;", vertex="1", parent="1")
    ET.SubElement(pool, 'mxGeometry', x="40", y="40", width="1560", height="920", **{'as': 'geometry'})

    lanes = [
        ("lane_user", "1. KANDIDAT / USER", "#F8FAFC", 120),
        ("lane_frontend", "2. MODUL FRONTEND & AUDIO STREAM", "#F1F5F9", 140),
        ("lane_interviewer", "3. PEWAWANCARA AI (BU SITI RAHAYU)", "#EFF6FF", 180),
        ("lane_llm_judge", "4. LLM-AS-A-JUDGE (BUKTI KUALITATIF)", "#F5F3FF", 160),
        ("lane_scoring", "5. MESIN SKOR DETERMINISTIK (KODE)", "#FEFCE8", 160),
        ("lane_output", "6. LAPORAN & COACHING DASHBOARD", "#F0FDF4", 160)
    ]

    y_offset = 0
    for lane_id, lane_title, fill_c, l_height in lanes:
        lane = ET.SubElement(root, 'mxCell', id=lane_id, value=lane_title, style=f"swimlane;html=1;startSize=30;horizontal=0;fillColor={fill_c};fontColor=#1E293B;fontStyle=1;fontSize=11;fontFamily=Segoe UI;swimlaneFillColor={fill_c};", vertex="1", parent="pool_1")
        ET.SubElement(lane, 'mxGeometry', x="40", y=str(y_offset), width="1520", height=str(l_height), **{'as': 'geometry'})
        y_offset += l_height

    # Helper function to add elements
    def add_node(id, val, style, x, y, w, h, parent):
        cell = ET.SubElement(root, 'mxCell', id=id, value=val, style=style, vertex="1", parent=parent)
        ET.SubElement(cell, 'mxGeometry', x=str(x), y=str(y), width=str(w), height=str(h), **{'as': 'geometry'})
        return cell

    def add_edge(id, val, source, target, style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontFamily=Segoe UI;fontSize=9.5;"):
        cell = ET.SubElement(root, 'mxCell', id=id, value=val, style=style, edge="1", parent="1")
        cell.set('source', source)
        cell.set('target', target)
        ET.SubElement(cell, 'mxGeometry', relative="1", **{'as': 'geometry'})
        return cell

    # Styles
    style_start = "ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#10B981;strokeColor=#059669;fontColor=#FFFFFF;fontStyle=1;"
    style_end = "ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#EF4444;strokeColor=#DC2626;strokeWidth=3;fontColor=#FFFFFF;fontStyle=1;"
    style_task = "rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#64748B;fontColor=#0F172A;fontFamily=Segoe UI;fontSize=10;arcSize=14;shadow=1;"
    style_task_ai = "rounded=1;whiteSpace=wrap;html=1;fillColor=#DBEAFE;strokeColor=#3B82F6;fontColor=#1E3A8A;fontFamily=Segoe UI;fontSize=10;fontStyle=1;arcSize=14;shadow=1;"
    style_task_math = "rounded=1;whiteSpace=wrap;html=1;fillColor=#FEF08A;strokeColor=#CA8A04;fontColor=#854D0E;fontFamily=Segoe UI;fontSize=10;fontStyle=1;arcSize=14;shadow=1;"
    style_task_success = "rounded=1;whiteSpace=wrap;html=1;fillColor=#DCFCE7;strokeColor=#22C55E;fontColor=#166534;fontFamily=Segoe UI;fontSize=10;fontStyle=1;arcSize=14;shadow=1;"
    style_gateway = "rhombus;whiteSpace=wrap;html=1;fillColor=#F59E0B;strokeColor=#D97706;fontColor=#FFFFFF;fontStyle=1;fontSize=10;"
    style_data = "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;fillColor=#E2E8F0;strokeColor=#94A3B8;fontColor=#334155;fontFamily=Segoe UI;fontSize=9;size=14;"

    # Lane 1 (User) elements
    add_node("ev_start", "Mulai", style_start, 20, 35, 45, 45, "lane_user")
    add_node("t_upload", "Unggah Berkas CV (PDF/Teks)\n& Masukkan Teks JD Target", style_task, 95, 27, 150, 60, "lane_user")
    add_node("d_cv_jd", "Data Dokumen:\n• CV Pelamar IT\n• Job Description", style_data, 275, 27, 105, 60, "lane_user")
    add_node("t_user_answer", "Menjawab Pertanyaan\nsecara Lisan (Microphone)\n[Narasi Pengalaman]", style_task, 550, 27, 140, 60, "lane_user")
    add_node("t_user_qa", "Mengajukan Pertanyaan\ntentang Posisi / Perusahaan\n[Fase Candidate Q&A]", style_task, 970, 27, 150, 60, "lane_user")

    # Lane 2 (Frontend) elements
    add_node("t_extract_api", "Kirim Payload ke\n/api/extract\n(Ekstraksi Terstruktur)", style_task, 95, 35, 140, 65, "lane_frontend")
    add_node("t_webrtc_conn", "Inisialisasi Web Audio API\n& Buka WebSocket Live\n(/api/live-token)", style_task, 265, 35, 150, 65, "lane_frontend")
    add_node("t_audio_record", "Streaming Audio PCM\n(24kHz Bidireksional)\nDeteksi Suara Nyata", style_task, 550, 35, 140, 65, "lane_frontend")
    add_node("t_save_history", "Susun Transkrip Utuh\n7 Pasang Tanya-Jawab\n(Q&A Transcript History)", style_task, 1150, 35, 150, 65, "lane_frontend")

    # Lane 3 (Interviewer AI) elements
    add_node("t_crossmatch", "Analisis Cross-Match CV vs JD:\n• Deteksi Kesesuaian Skill\n• Identifikasi Area Skill Gap", style_task_ai, 265, 25, 170, 65, "lane_interviewer")
    add_node("t_ask_bei", "Ajukan 7 Pertanyaan BEI\n(EXP, AT, CT, ACH, CO, TW, INT)\n[Pilih Sudut A/B/C Dinamis]", style_task_ai, 465, 25, 170, 65, "lane_interviewer")
    add_node("gw_probing", "Apakah\nJawaban\nKlise / Tim?", style_gateway, 665, 30, 70, 60, "lane_interviewer")
    add_node("t_do_probing", "Probing Mendalam:\n• STAR (Action pribadi?)\n• FACT (Konsekuensi & logis)", style_task_ai, 765, 25, 160, 65, "lane_interviewer")
    add_node("t_closing_qa", "Fase Penutupan 3 Langkah:\n1. Apresiasi Sesi\n2. Buka Kesempatan Tanya\n3. Jawab Pertanyaan JD", style_task_ai, 960, 25, 160, 70, "lane_interviewer")

    # Lane 4 (LLM Judge) elements
    add_node("t_call_evaluate", "Kirim Transkrip Lengkap\nke Endpoint /api/evaluate\n(LLM-as-a-Judge Engine)", style_task, 1150, 40, 150, 65, "lane_llm_judge")
    add_node("d_kamus_spencer", "Rujukan Resmi:\nKamus Kompetensi\nSpencer & Spencer (1993)", style_data, 960, 45, 140, 60, "lane_llm_judge")
    add_node("t_extract_star", "Ekstraksi Komponen STAR:\nDeteksi Situation, Task,\nAction, Result (0-4 Poin)", style_task, 760, 40, 155, 65, "lane_llm_judge")
    add_node("t_eval_fact", "Audit Bukti Pengalaman FACT:\n• Feeling (1-10) • Action (1-10)\n• Context (1-10) • Thinking (1-10)", style_task, 570, 40, 160, 65, "lane_llm_judge")
    add_node("t_map_levels", "Pencocokan Level Capaian:\nPetakan Bukti Transkrip\nke Skala Level Spencer 1-5", style_task, 380, 40, 160, 65, "lane_llm_judge")

    # Lane 5 (Deterministic Scoring) elements
    add_node("d_matriks_bobot", "Matriks Bobot Posisi Bu Rina:\nProgrammer: AT=25%, EXP=20%..\nUI/UX: CT=20%, EXP=20%..", style_data, 180, 45, 160, 60, "lane_scoring")
    add_node("t_calc_sbase", "Hitung Skor Dasar S_base:\nS_base = min(100, (L_act/L_target)*80)\n[Bukan Tebakan Bebas AI]", style_task_math, 380, 40, 175, 65, "lane_scoring")
    add_node("t_calc_fact_mult", "Hitung Pengali Integritas:\nμ_FACT = 0.85 + (0.30 * FACT_norm)\nS_i = min(100, S_base * μ_FACT)", style_task_math, 580, 40, 175, 65, "lane_scoring")
    add_node("t_calc_composite", "Kalkulasi Skor Akhir Terbobot:\nSkor_Akhir = SUM(w_i * S_i)\n[Simple Additive Weighting]", style_task_math, 780, 40, 175, 65, "lane_scoring")
    add_node("gw_threshold", "Evaluasi\nPassing Grade\nSkor >= 75?", style_gateway, 985, 42, 80, 65, "lane_scoring")
    add_node("t_verdict_rec", "Verdict: RECOMMENDED\n(Lolos Standar Industri)", style_task_success, 1100, 20, 150, 50, "lane_scoring")
    add_node("t_verdict_cond", "Verdict: CONDITIONAL\n(Pertimbangan / Gap Minor)", style_task, 1100, 80, 150, 50, "lane_scoring")
    add_node("t_verdict_fail", "Verdict: NOT RECOMMENDED\n(Skor < 60 / Gap Fatal)", style_task, 1270, 50, 150, 50, "lane_scoring")

    # Lane 6 (Output) elements
    add_node("t_render_radar", "Visualisasi Radar Chart\n7 Kompetensi Spencer (1-5)\nvs Target Role IT", style_task, 580, 35, 160, 65, "lane_output")
    add_node("t_render_fact", "Render Grafik Batang FACT\n& Profil Archetype Kandidat\n(ConCISE Communication)", style_task, 780, 35, 160, 65, "lane_output")
    add_node("t_actionable_plan", "Sajikan Feedback Komprehensif:\n• Actionable Hacks • Saran Jawaban\n• Modul Latihan Coaching AI", style_task, 980, 35, 170, 65, "lane_output")
    add_node("ev_end", "Selesai", style_end, 1200, 45, 45, 45, "lane_output")

    # Connect Edges
    add_edge("e1", "", "ev_start", "t_upload")
    add_edge("e2", "", "t_upload", "t_extract_api")
    add_edge("e3", "Data Ekstraksi", "t_extract_api", "t_webrtc_conn")
    add_edge("e4", "", "t_webrtc_conn", "t_crossmatch")
    add_edge("e5", "Data Prioritas Gap", "t_crossmatch", "t_ask_bei")
    add_edge("e6", "Ajukan Pertanyaan", "t_ask_bei", "t_audio_record")
    add_edge("e7", "Suara Kandidat", "t_audio_record", "t_user_answer")
    add_edge("e8", "Audio Respons", "t_user_answer", "gw_probing")
    add_edge("e9", "Ya (Abstrak)", "gw_probing", "t_do_probing")
    add_edge("e10", "Probe Lanjutan", "t_do_probing", "t_user_answer")
    add_edge("e11", "Tidak (Cukup)", "gw_probing", "t_closing_qa")
    add_edge("e12", "Buka Tanya Jawab", "t_closing_qa", "t_user_qa")
    add_edge("e13", "Sesi Tuntas (30 Min)", "t_user_qa", "t_save_history")
    add_edge("e14", "Kirim Transkrip", "t_save_history", "t_call_evaluate")
    add_edge("e15", "", "t_call_evaluate", "t_extract_star")
    add_edge("e16", "", "t_extract_star", "t_eval_fact")
    add_edge("e17", "Gunakan Kamus Spencer", "t_eval_fact", "t_map_levels")
    add_edge("e18", "Level Aktual (1-5)", "t_map_levels", "t_calc_sbase")
    add_edge("e19", "Terapkan Bobot w_i", "t_calc_sbase", "t_calc_fact_mult")
    add_edge("e20", "Skor Tiap Kompetensi", "t_calc_fact_mult", "t_calc_composite")
    add_edge("e21", "Skor Akhir Terbobot", "t_calc_composite", "gw_threshold")
    add_edge("e22", "Skor >= 75", "gw_threshold", "t_verdict_rec")
    add_edge("e23", "60 <= Skor < 75", "gw_threshold", "t_verdict_cond")
    add_edge("e24", "Skor < 60", "gw_threshold", "t_verdict_fail")
    add_edge("e25", "", "t_verdict_rec", "t_render_radar")
    add_edge("e26", "", "t_verdict_cond", "t_render_radar")
    add_edge("e27", "", "t_verdict_fail", "t_render_radar")
    add_edge("e28", "", "t_render_radar", "t_render_fact")
    add_edge("e29", "", "t_render_fact", "t_actionable_plan")
    add_edge("e30", "", "t_actionable_plan", "ev_end")

    # Formatting XML
    xml_str = ET.tostring(mxfile, encoding='utf-8')
    dom = xml.dom.minidom.parseString(xml_str)
    pretty_xml = dom.toprettyxml(indent="  ")

    output_path = "BPMN_PROSES_EVALUASI_INTERVU.drawio"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(pretty_xml)
    print(f"BPMN Draw.io file successfully created: {output_path}")

if __name__ == "__main__":
    create_drawio_bpmn()
