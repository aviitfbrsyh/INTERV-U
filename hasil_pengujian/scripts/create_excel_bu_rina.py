import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

wb = openpyxl.Workbook()
wb.remove(wb.active) # Remove default sheet

# Fonts
font_title = Font(name='Segoe UI', size=14, bold=True, color='0F172A')
font_subtitle = Font(name='Segoe UI', size=10, italic=True, color='475569')
font_section = Font(name='Segoe UI', size=11, bold=True, color='1E3A8A')
font_header = Font(name='Segoe UI', size=10, bold=True, color='FFFFFF')
font_data = Font(name='Segoe UI', size=9.5, color='1E293B')
font_bold = Font(name='Segoe UI', size=9.5, bold=True, color='0F172A')
font_mono = Font(name='Consolas', size=9.5, bold=True, color='0369A1')
font_editable = Font(name='Segoe UI', size=10, bold=True, color='B45309')

# Fills
fill_navy = PatternFill(start_color='0F172A', end_color='0F172A', fill_type='solid')
fill_blue = PatternFill(start_color='1E3A8A', end_color='1E3A8A', fill_type='solid')
fill_cyan = PatternFill(start_color='0284C7', end_color='0284C7', fill_type='solid')
fill_role = PatternFill(start_color='E2E8F0', end_color='E2E8F0', fill_type='solid')
fill_yellow_light = PatternFill(start_color='FEF3C7', end_color='FEF3C7', fill_type='solid')
fill_yellow_header = PatternFill(start_color='F59E0B', end_color='F59E0B', fill_type='solid')
fill_zebra = PatternFill(start_color='F8FAFC', end_color='F8FAFC', fill_type='solid')
fill_white = PatternFill(start_color='FFFFFF', end_color='FFFFFF', fill_type='solid')

# Borders
border_thin = Border(
    left=Side(style='thin', color='CBD5E1'),
    right=Side(style='thin', color='CBD5E1'),
    top=Side(style='thin', color='CBD5E1'),
    bottom=Side(style='thin', color='CBD5E1')
)
border_double_bottom = Border(
    left=Side(style='thin', color='CBD5E1'),
    right=Side(style='thin', color='CBD5E1'),
    top=Side(style='thin', color='CBD5E1'),
    bottom=Side(style='double', color='0F172A')
)

# Alignments
align_center = Alignment(horizontal='center', vertical='center')
align_left = Alignment(horizontal='left', vertical='center')
align_right = Alignment(horizontal='right', vertical='center')
align_wrap = Alignment(horizontal='left', vertical='center', wrap_text=True)

# =========================================================================
# SHEET 1: RINGKASAN & PETUNJUK ASESOR
# =========================================================================
ws1 = wb.create_sheet(title='1. Panduan Asesor')
ws1.views.sheetView[0].showGridLines = True

ws1['B2'] = 'INSTRUMEN PENETAPAN TARGET SKOR & BOBOT KOMPETENSI IT'
ws1['B2'].font = font_title
ws1['B3'] = 'Berbasis Riset Pasar Kerja JobStreet Indonesia 2026 & Kamus Spencer & Spencer (1993)'
ws1['B3'].font = font_subtitle

meta_rows = [
    ('Dosen Pembimbing / Asesor', 'Ibu Chanifah, M.Kom. (Bu Rina)'),
    ('Mahasiswa Peneliti', 'Avit Febriansyah'),
    ('Objek Penelitian', 'INTERV-U: Sistem Simulasi Wawancara Kerja AI Voice-to-Voice'),
    ('Kerangka Kompetensi', 'Spencer & Spencer (1993) Competency Dictionary (7 Core IT Competencies)'),
    ('Sampel Pasar Kerja', 'id.jobstreet.com (DKI Jakarta, D.I. Yogyakarta, Sleman, Bantul - Oktober 2026)'),
    ('Tujuan Dokumen', 'Menetapkan baseline passing grade & pembobotan resmi penilaian AI agar berbasis kaidah HR'),
]

for idx, (label, val) in enumerate(meta_rows, start=5):
    ws1.cell(row=idx, column=2, value=label).font = font_bold
    ws1.cell(row=idx, column=2).fill = PatternFill(start_color='F1F5F9', fill_type='solid')
    ws1.cell(row=idx, column=2).border = border_thin
    
    c = ws1.cell(row=idx, column=3, value=val)
    c.font = font_data
    c.border = border_thin
    ws1.merge_cells(start_row=idx, start_column=3, end_row=idx, end_column=5)

ws1['B12'] = 'PETUNJUK PENGISIAN UNTUK ASESOR (BU RINA):'
ws1['B12'].font = font_section

instructions = [
    '1. Buka Sheet \"2. Matriks Target & Bobot\". Di sana terdapat 4 posisi IT: Programmer, UI/UX Designer, QA Tester, dan Data Engineer/Analyst.',
    '2. Setiap posisi telah dipetakan ke 7 Kompetensi Inti Spencer & Spencer (EXP, AT, CT, ACH, CO, TW, INT).',
    '3. Kolom F (\"Target Level Minimal 1-5\") diberi warna kuning: Tentukan tingkat kemahiran minimal yang diharapkan dari seorang fresh graduate / junior di posisi tersebut.',
    '4. Kolom G (\"Bobot %\") diberi warna kuning: Tentukan persentase kontribusi kompetensi tersebut terhadap kelulusan kandidat (Total bobot tiap posisi wajib = 100%).',
    '5. Kolom E (\"Usulan Rekomendasi Awal\") telah kami isi sebagai draf pembantu berdasarkan analisis tren 30+ lowongan JobStreet, namun Bu Rina memiliki hak veto penuh untuk mengubahnya.',
    '6. Setelah Bu Rina menyetujui matriks ini, nilai bobot dan target skor akan diimplementasikan ke dalam engine evaluasi otomatis sistem INTERV-U (Bab III & Bab IV Skripsi).'
]

for idx, text in enumerate(instructions, start=13):
    c = ws1.cell(row=idx, column=2, value=text)
    c.font = font_data
    ws1.merge_cells(start_row=idx, start_column=2, end_row=idx, end_column=5)

ws1.column_dimensions['A'].width = 3
ws1.column_dimensions['B'].width = 28
ws1.column_dimensions['C'].width = 35
ws1.column_dimensions['D'].width = 25
ws1.column_dimensions['E'].width = 25

# =========================================================================
# SHEET 2: MATRIKS TARGET & BOBOT KOMPETENSI (YANG DIISI BU RINA)
# =========================================================================
ws2 = wb.create_sheet(title='2. Matriks Target & Bobot')
ws2.views.sheetView[0].showGridLines = True

ws2['B2'] = 'MATRIKS PENILAIAN KOMPETENSI SPENCER & SPENCER PER POSISI IT'
ws2['B2'].font = font_title
ws2['B3'] = 'Silakan sesuaikan kolom kuning (Target Level & Bobot %) sesuai justifikasi akademik Asesor'
ws2['B3'].font = font_subtitle

headers_ws2 = [
    ('No', 6),
    ('Posisi Jabatan IT', 24),
    ('Kode', 8),
    ('Kompetensi Spencer & Spencer (1993)', 32),
    ('Klaster', 18),
    ('Usulan Baseline', 15),
    ('Target Level Minimal (1-5)*', 24),
    ('Bobot (%)*', 14),
    ('Indikator Perilaku Utama di Posisi Ini (Riset JobStreet)', 45)
]

for col_idx, (h_name, h_width) in enumerate(headers_ws2, start=2):
    c = ws2.cell(row=5, column=col_idx, value=h_name)
    c.alignment = align_center
    c.border = border_thin
    col_letter = get_column_letter(col_idx)
    ws2.column_dimensions[col_letter].width = h_width
    if 'Target Level' in h_name or 'Bobot' in h_name:
        c.fill = fill_yellow_header
        c.font = Font(name='Segoe UI', size=10, bold=True, color='0F172A')
    else:
        c.fill = fill_navy
        c.font = font_header

# Data positions & competencies
roles_data = [
    {
        'role': '1. Programmer / Software Developer',
        'items': [
            ('EXP', 'Technical/Professional Expertise', 'Cognitive', 'Level 3 / 5', 3, 20, 'Penguasaan stack (React, Node, Go, SQL, Python), REST API, Git, debugging mandiri.'),
            ('AT', 'Analytical Thinking', 'Cognitive', 'Level 4 / 5', 4, 25, 'Mendiagnosis akar masalah error/bug kompleks, memecah algoritma & kebutuhan fitur rumit.'),
            ('CT', 'Conceptual Thinking', 'Cognitive', 'Level 3 / 5', 3, 15, 'Merancang arsitektur modular, clean code, memilih pola desain sistem yang scalable.'),
            ('ACH', 'Achievement Orientation', 'Achievement', 'Level 3 / 5', 3, 10, 'Komitmen sprint deadline, inisiatif optimasi kecepatan respon & efisiensi query.'),
            ('CO', 'Concern for Order, Quality & Accuracy', 'Achievement', 'Level 3 / 5', 3, 15, 'Penulisan kode rapi, disiplin self-testing/unit test sebelum commit, minim error regresi.'),
            ('TW', 'Teamwork and Cooperation', 'Managerial', 'Level 3 / 5', 3, 10, 'Kolaborasi aktif sprint meeting, keterbukaan menerima kritik dalam sesi code review.'),
            ('INT', 'Initiative', 'Achievement', 'Level 2 / 5', 2, 5, 'Proaktif melakukan refactoring kode mandiri & automasi pekerjaan sebelum diminta.')
        ]
    },
    {
        'role': '2. UI/UX Designer',
        'items': [
            ('EXP', 'Technical/Professional Expertise', 'Cognitive', 'Level 3 / 5', 3, 20, 'Kemahiran Figma, design system, component library, wireframing, interactive prototyping.'),
            ('AT', 'Analytical Thinking', 'Cognitive', 'Level 3 / 5', 3, 15, 'Menganalisis hasil usability testing, metrik retensi user, mengidentifikasi friction user journey.'),
            ('CT', 'Conceptual Thinking', 'Cognitive', 'Level 4 / 5', 4, 20, 'Mampu menyederhanakan alur proses bisnis yang rumit menjadi desain antarmuka yang intuitif.'),
            ('ACH', 'Achievement Orientation', 'Achievement', 'Level 3 / 5', 3, 10, 'Mengejar standar visual estetis tinggi & perbaikan engagement/konversi pengguna.'),
            ('CO', 'Concern for Order, Quality & Accuracy', 'Achievement', 'Level 4 / 5', 4, 15, 'Ketelitian tinggi pada hierarki tipografi, konsistensi spacing, design tokens, dan design specs.'),
            ('TW', 'Teamwork and Cooperation', 'Managerial', 'Level 3 / 5', 3, 15, 'Komunikasi & kolaborasi intensif dengan developer (slicing) dan Product Manager.'),
            ('INT', 'Initiative', 'Achievement', 'Level 2 / 5', 2, 5, 'Eksplorasi proaktif berbagai alternatif desain & benchmark tren UI sebelum rapat konsep.')
        ]
    },
    {
        'role': '3. Quality Assurance (QA) / Tester',
        'items': [
            ('EXP', 'Technical/Professional Expertise', 'Cognitive', 'Level 3 / 5', 3, 20, 'Penguasaan Test Plan, Test Cases, Postman API testing, automasi (Cypress, Selenium).'),
            ('AT', 'Analytical Thinking', 'Cognitive', 'Level 4 / 5', 4, 20, 'Menemukan edge cases kritis, mereproduksi bug yang sulit dilacak, analisa skenario gagal.'),
            ('CT', 'Conceptual Thinking', 'Cognitive', 'Level 3 / 5', 3, 10, 'Memahami arsitektur aplikasi secara menyeluruh untuk memprediksi titik rawan kegagalan.'),
            ('ACH', 'Achievement Orientation', 'Achievement', 'Level 3 / 5', 3, 10, 'Komitmen menjaga target zero critical bug pada rilis produksi tepat waktu.'),
            ('CO', 'Concern for Order, Quality & Accuracy', 'Achievement', 'Level 5 / 5', 5, 25, 'Sangat teliti mendokumentasikan langkah bug report, verifikasi regresi tanpa celah.'),
            ('TW', 'Teamwork and Cooperation', 'Managerial', 'Level 3 / 5', 3, 10, 'Menyampaikan temuan cacat sistem secara objektif tanpa menyerang developer, koordinasi tim.'),
            ('INT', 'Initiative', 'Achievement', 'Level 2 / 5', 2, 5, 'Inisiatif membuat automasi skenario uji berulang demi mempercepat siklus pengujian.')
        ]
    },
    {
        'role': '4. Data Engineer / Data Analyst',
        'items': [
            ('EXP', 'Technical/Professional Expertise', 'Cognitive', 'Level 3 / 5', 3, 20, 'SQL mahir, Python data analysis, pipeline ETL, data modeling, BI tools (Power BI/Tableau).'),
            ('AT', 'Analytical Thinking', 'Cognitive', 'Level 4 / 5', 4, 25, 'Membedah anomali data, mengidentifikasi korelasi tren statistik, optimasi query database.'),
            ('CT', 'Conceptual Thinking', 'Cognitive', 'Level 4 / 5', 4, 15, 'Menerjemahkan kebutuhan laporan bisnis abstrak ke dalam model skema data yang kokoh.'),
            ('ACH', 'Achievement Orientation', 'Achievement', 'Level 3 / 5', 3, 10, 'Peningkatan efisiensi waktu pemrosesan pipeline data dan akurasi model analitik.'),
            ('CO', 'Concern for Order, Quality & Accuracy', 'Achievement', 'Level 4 / 5', 4, 15, 'Validasi integritas data tinggi, memastikan tidak ada missing values atau duplikasi data.'),
            ('TW', 'Teamwork and Cooperation', 'Managerial', 'Level 3 / 5', 3, 10, 'Kolaborasi erat dengan tim bisnis & engineering untuk penyediaan data akurat.'),
            ('INT', 'Initiative', 'Achievement', 'Level 2 / 5', 2, 5, 'Proaktif membangun dashboard monitoring mandiri sebelum diminta oleh stakeholder.')
        ]
    }
]

current_row = 6
item_no = 1

for role_obj in roles_data:
    start_role_row = current_row
    
    for item in role_obj['items']:
        code, name, cluster, baseline, def_target, def_weight, notes = item
        
        ws2.cell(row=current_row, column=2, value=item_no).alignment = align_center
        ws2.cell(row=current_row, column=3, value=role_obj['role']).alignment = align_left
        ws2.cell(row=current_row, column=3).font = font_bold
        
        c_code = ws2.cell(row=current_row, column=4, value=code)
        c_code.alignment = align_center
        c_code.font = font_mono
        
        ws2.cell(row=current_row, column=5, value=name).alignment = align_left
        ws2.cell(row=current_row, column=6, value=cluster).alignment = align_center
        ws2.cell(row=current_row, column=7, value=baseline).alignment = align_center
        
        # Editable columns for Bu Rina
        c_target = ws2.cell(row=current_row, column=8, value=def_target)
        c_target.alignment = align_center
        c_target.fill = fill_yellow_light
        c_target.font = font_editable
        
        c_weight = ws2.cell(row=current_row, column=9, value=def_weight)
        c_weight.alignment = align_center
        c_weight.fill = fill_yellow_light
        c_weight.font = font_editable
        
        c_notes = ws2.cell(row=current_row, column=10, value=notes)
        c_notes.alignment = align_wrap
        c_notes.font = font_data
        
        for c_idx in range(2, 11):
            ws2.cell(row=current_row, column=c_idx).border = border_thin
            if c_idx not in [8, 9]:
                ws2.cell(row=current_row, column=c_idx).font = font_data
                
        current_row += 1
        item_no += 1
        
    # Total row per role
    ws2.cell(row=current_row, column=3, value=f"TOTAL BOBOT ({role_obj['role']})").font = font_bold
    ws2.cell(row=current_row, column=3).alignment = align_right
    ws2.merge_cells(start_row=current_row, start_column=3, end_row=current_row, end_column=8)
    
    total_cell = ws2.cell(row=current_row, column=9, value=f"=SUM(I{start_role_row}:I{current_row-1})")
    total_cell.font = Font(name='Segoe UI', size=10, bold=True, color='0F172A')
    total_cell.alignment = align_center
    total_cell.fill = PatternFill(start_color='E2E8F0', fill_type='solid')
    
    for c_idx in range(2, 11):
        ws2.cell(row=current_row, column=c_idx).border = border_double_bottom
        
    current_row += 2 # gap between roles

# =========================================================================
# SHEET 3: DATABASE RISET JOBSTREET 2026
# =========================================================================
ws3 = wb.create_sheet(title='3. Sampel Lowongan JobStreet')
ws3.views.sheetView[0].showGridLines = True

ws3['B2'] = 'DATABASE SAMPEL LOWONGAN IT ID.JOBSTREET.COM (OKTOBER 2026)'
ws3['B2'].font = font_title
ws3['B3'] = 'Bukti empiris pasar kerja riil untuk pemetaan kebutuhan kompetensi skripsi'
ws3['B3'].font = font_subtitle

headers_ws3 = [
    ('No', 6),
    ('Kategori Posisi', 22),
    ('Judul Lowongan', 30),
    ('Nama Perusahaan', 28),
    ('Lokasi Kerja', 20),
    ('Tipe Kerja', 14),
    ('Gaji / Bulan', 18),
    ('Kualifikasi Kunci & Stack Teknologi yang Dicari', 50)
]

for col_idx, (h_name, h_width) in enumerate(headers_ws3, start=2):
    c = ws3.cell(row=5, column=col_idx, value=h_name)
    c.alignment = align_center
    c.fill = fill_blue
    c.font = font_header
    c.border = border_thin
    col_letter = get_column_letter(col_idx)
    ws3.column_dimensions[col_letter].width = h_width

job_samples = [
    ('Programmer', 'Fullstack Developer', 'PT Jasnita Telekomindo, Tbk', 'Jakarta Raya', 'Full time', 'Disembunyikan', 'S1 IT/Informatika, min 2 tahun, standar penulisan kode bersih dan mudah dibaca.'),
    ('Programmer', 'Back-End Developer', 'PT Depoguna Bangunan Online', 'Jakarta Raya', 'Full time', 'Disembunyikan', 'S1 IT, min 4 tahun pengalaman Fullstack, perancangan skema DB & microservices.'),
    ('Programmer', 'Backend Developer', 'PT Rockstar Sports School', 'Jakarta Barat', 'Full time', 'Rp 10 - 15 Juta', 'Node.js, arsitektur server-side performa tinggi, integrasi tim frontend & data.'),
    ('Programmer', 'Back End Developer', 'PT Inovasi Daya Solusi', 'Jakarta Selatan', 'Full time', 'Disembunyikan', 'Java, RESTful API, MySQL, arsitektur backend transaksi keuangan.'),
    ('Programmer', 'Senior Front-End Engineer', 'PT Techdirect Indonesia', 'Jakarta Raya', 'Full time', 'Rp 9 - 12 Juta', 'Web performa tinggi, rapi visual, aksesibilitas web vitals, optimasi state.'),
    ('Programmer', 'Full Stack Developer', 'PT Datacaraka Solusindo', 'Jakarta Raya', 'Full time', 'Rp 7.8 - 10 Juta', '.NET, C#, SQL Server, analisis kebutuhan klien, software design, deployment.'),
    ('Programmer', 'AI Agent Developer', 'PT Indomulti Nusantara', 'Jakarta Barat', 'Full time', 'Rp 7 - 9 Juta', 'Merancang arsitektur AI agent untuk otomasi operasional bisnis.'),
    ('Programmer', 'DevOps Engineer', 'PT Japfa Comfeed Indonesia, Tbk', 'Jakarta Selatan', 'Full time', 'Disembunyikan', 'CI/CD pipeline, AWS, Docker, Kubernetes, Git, Datadog monitoring, Linux scripting.'),
    ('Programmer', 'Backend Engineer', 'Konnco Studio', 'Bantul, DIY', 'Full time', 'Rp 6 - 7.5 Juta', 'Go (Golang), PostgreSQL, Docker, perancangan query database efisien.'),
    ('Programmer', 'Fullstack Developer (.Net)', 'PT Nawa Data Solutions', 'DI Yogyakarta', 'Full time', 'Rp 8 - 9.5 Juta', 'C#, ASP.NET MVC/Core, monitoring dan delivery modul tepat waktu.'),
    ('Programmer', 'Programmer Fullstack', 'PT Javan Cipta Solusi', 'Sleman, DIY', 'Kontrak', 'Rp 4.5 - 6.5 Juta', 'React.js, Next.js, Node.js, pembangunan aplikasi web end-to-end.'),
    ('Programmer', 'Fullstack Developer', 'PT Solutionlabs Group', 'Yogyakarta (Hibrid)', 'Kontrak', 'Rp 4 - 6 Juta', 'Web, backend API, dan mobile application.'),
    ('UI/UX', 'UI/UX Designer', 'Perusahaan Pet-Tech', 'Jakarta Barat', 'Full time', 'Rp 12 - 15 Juta', 'Merancang pengalaman user intuitif, antarmuka visual menarik, kolaborasi tim produk.'),
    ('UI/UX', 'Senior Product Designer', 'HoLink', 'Jakarta Utara', 'Full time', 'Rp 13 - 18 Juta', 'Platform SaaS global: menyederhanakan dashboard pembayaran & usability testing.'),
    ('UI/UX', 'UX/UI Designer', 'Perusahaan Konsultan Finansial', 'Jakarta Selatan', 'Full time', 'Disembunyikan', 'Memperbaiki alur dan usability produk digital perbankan dan fintech.'),
    ('UI/UX', 'UI/UX Web Designer', 'Agensi Digital', 'Jakarta Barat', 'Full time', 'Disembunyikan', 'Dashboard SaaS, booking tools, web app, dan design system Figma.'),
    ('UI/UX', 'UI/UX Designer', 'Software House Surakarta', 'Surakarta', 'Full time', 'Rp 5 - 7 Juta', 'Wireframing, prototyping, AI-assisted design workflow, basic frontend implementation.'),
    ('UI/UX', 'UI/UX Product Designer', 'White Code Labs', 'Surabaya (Remote)', 'Part time', 'Rp 3 - 4 Juta', 'Portofolio kuat, perancangan mobile & web responsive UI.'),
    ('QA / Tester', 'QA Tester Automation', 'Fintech Perusahaan', 'Jakarta Selatan', 'Kontrak', 'Rp 7.5 - 10 Juta', 'Otomasi pengujian API & UI, integrasi pipeline CI/CD, deteksi bug dini.'),
    ('QA / Tester', 'QA Automation Engineer', 'Perbankan Digital', 'Jakarta Pusat', 'Kontrak', 'Rp 7.5 - 8.5 Juta', 'Appium, testing aplikasi perbankan digital (mobile & web), stress testing.'),
    ('QA / Tester', 'Junior QA Tester', 'Institusi Finansial', 'Jakarta Selatan', 'Kontrak', 'Rp 5 - 6 Juta', 'Pengujian fungsional sistem kredit/pinjaman, min 1 tahun pengalaman.'),
    ('QA / Tester', 'Junior QA Lead', 'PT Nusantara Berkah Digital', 'Bantul, DIY', 'Full time', 'Rp 6 - 8 Juta', 'Menyusun dokumen Test Case & Test Plan, bug tracking di Jira, koordinasi developer.'),
    ('QA / Tester', 'Test Engineer', 'Teleperformance', 'Yogyakarta', 'Full time', 'Disembunyikan', 'Perancangan skenario uji manual & otomatis, regresi sistem sebelum rilis.'),
    ('Data', 'Data Engineer', 'PT Rockstar Sports School', 'Jakarta Barat', 'Full time', 'Rp 10 - 15 Juta', 'SQL, SSIS, Python, pipeline ETL/ELT, Microsoft Azure (Synapse, Databricks).'),
    ('Data', 'Data Engineer', 'PT Universal Agri Bisnisindo', 'Jakarta Selatan', 'Full time', 'Disembunyikan', 'Transformasi dan integrasi data pipeline skala enterprise di cloud Azure.'),
    ('Data', 'Data Engineer', 'PT Depoguna Bangunan Online', 'Jakarta Raya', 'Full time', 'Disembunyikan', 'Data warehouse architecture, data modeling, database query tuning.'),
    ('Data', 'Data Analyst / BI', 'Korporasi Jakarta', 'Jakarta Pusat', 'Full time', 'Disembunyikan', 'Power BI, DAX, dashboard visualisasi KPI manajemen, SQL query tingkat lanjut.')
]

for row_idx, job in enumerate(job_samples, start=6):
    ws3.cell(row=row_idx, column=2, value=row_idx - 5).alignment = align_center
    for c_offset, val in enumerate(job):
        c = ws3.cell(row=row_idx, column=3 + c_offset, value=val)
        c.font = font_data
        c.border = border_thin
        if c_offset in [0, 3, 4]:
            c.alignment = align_center
        else:
            c.alignment = align_left
    ws3.cell(row=row_idx, column=2).border = border_thin
    ws3.cell(row=row_idx, column=2).font = font_data
    if row_idx % 2 == 1:
        for col_i in range(2, 10):
            ws3.cell(row=row_idx, column=col_i).fill = fill_zebra

# =========================================================================
# SHEET 4: KAMUS 7 KOMPETENSI SPENCER & SPENCER 1993
# =========================================================================
ws4 = wb.create_sheet(title='4. Rujukan Kamus Spencer')
ws4.views.sheetView[0].showGridLines = True

ws4['B2'] = 'KAMUS RUJUKAN 7 KOMPETENSI INTI IT (SPENCER & SPENCER 1993)'
ws4['B2'].font = font_title
ws4['B3'] = 'Definisi resmi dan rubrik level perilaku 1–5 untuk panduan pertimbangan penilaian Asesor'
ws4['B3'].font = font_subtitle

headers_ws4 = [
    ('Kode', 8),
    ('Nama Kompetensi', 25),
    ('Klaster', 16),
    ('Level', 8),
    ('Judul Indikator Perilaku', 25),
    ('Deskripsi Perilaku Nyata yang Diharapkan (Spencer & Spencer 1993)', 60)
]

for col_idx, (h_name, h_width) in enumerate(headers_ws4, start=2):
    c = ws4.cell(row=5, column=col_idx, value=h_name)
    c.alignment = align_center
    c.fill = fill_navy
    c.font = font_header
    c.border = border_thin
    col_letter = get_column_letter(col_idx)
    ws4.column_dimensions[col_letter].width = h_width

dict_rubric = [
    ('EXP', 'Technical Expertise', 'Cognitive', '1', 'Dasar', 'Mengerjakan tugas teknis berulang yang sangat sederhana tanpa inisiatif.'),
    ('EXP', 'Technical Expertise', 'Cognitive', '2', 'Keterampilan Dasar', 'Mampu menjalankan tugas teknis terstandar dengan panduan umum.'),
    ('EXP', 'Technical Expertise', 'Cognitive', '3', 'Terampil Mandiri', 'Menguasai stack teknologi kerja secara mandiri, mampu menyelesaikan masalah teknis standar.'),
    ('EXP', 'Technical Expertise', 'Cognitive', '4', 'Keahlian Tinggi', 'Menguasai teknologi mendalam, menyelesaikan masalah teknis kompleks, adaptasi tools baru cepat.'),
    ('EXP', 'Technical Expertise', 'Cognitive', '5', 'Spesialis / Ahli', 'Menjadi rujukan teknis tim, merancang solusi teknologi mutakhir, berbagi ilmu ke orang lain.'),

    ('AT', 'Analytical Thinking', 'Cognitive', '1', 'Memecah Masalah', 'Mampu menguraikan tugas/masalah menjadi bagian-bagian kecil yang terpisah.'),
    ('AT', 'Analytical Thinking', 'Cognitive', '2', 'Hubungan Dasar', 'Melihat hubungan sebab-akibat sederhana (A menyebabkan B) dan memprioritaskan tugas.'),
    ('AT', 'Analytical Thinking', 'Cognitive', '3', 'Analisis Bertingkat', 'Menganalisis beberapa bagian masalah, mengantisipasi hambatan dan memprediksi konsekuensi logis.'),
    ('AT', 'Analytical Thinking', 'Cognitive', '4', 'Rencana/Analisis Kompleks', 'Secara sistematis memecah persoalan rumit (multi-faktor) dan menyusun rantai sebab-akibat panjang.'),
    ('AT', 'Analytical Thinking', 'Cognitive', '5', 'Analisis Multi-Dimensi', 'Menganalisis sistem dinamis yang sangat kompleks dan mengevaluasi beragam alternatif solusi berbobot.'),

    ('CT', 'Conceptual Thinking', 'Cognitive', '1', 'Pola Sederhana', 'Menggunakan akal sehat dan pengalaman lampau untuk mengenali masalah yang mirip.'),
    ('CT', 'Conceptual Thinking', 'Cognitive', '2', 'Mengenali Pola', 'Mengamati ketidaksesuaian, tren, dan keterkaitan dalam data untuk menemukan akar isu kunci.'),
    ('CT', 'Conceptual Thinking', 'Cognitive', '3', 'Menerapkan Konsep', 'Menerapkan konsep/framework teoritis untuk menyederhanakan masalah di dunia nyata.'),
    ('CT', 'Conceptual Thinking', 'Cognitive', '4', 'Menyederhanakan Kompleks', 'Menyatukan ide, isu, dan data abstrak menjadi kesatuan konsep arsitektur yang lugas dan terpadu.'),
    ('CT', 'Conceptual Thinking', 'Cognitive', '5', 'Menciptakan Model Baru', 'Merumuskan konsep atau pendekatan arsitektur baru untuk menyelesaikan permasalahan unik organisasi.'),

    ('ACH', 'Achievement Orientation', 'Achievement', '1', 'Standar Pribadi', 'Memiliki keinginan untuk menyelesaikan pekerjaan dengan benar dan sesuai standar minimum.'),
    ('ACH', 'Achievement Orientation', 'Achievement', '2', 'Mencapai Target', 'Bekerja keras untuk memenuhi target kinerja yang ditetapkan oleh manajemen/klien.'),
    ('ACH', 'Achievement Orientation', 'Achievement', '3', 'Menetapkan Target Sendiri', 'Menetapkan ukuran keberhasilan sendiri tanpa harus diarahkan secara rinci oleh atasan.'),
    ('ACH', 'Achievement Orientation', 'Achievement', '4', 'Perbaikan Terus-Menerus', 'Melakukan inovasi metode kerja untuk meningkatkan efisiensi, kecepatan, atau kualitas sistem.'),
    ('ACH', 'Achievement Orientation', 'Achievement', '5', 'Target Menantang', 'Menetapkan dan mengejar sasaran yang sangat menantang (stretch goals) dengan probabilitas 50-50.'),

    ('CO', 'Concern for Order', 'Achievement', '1', 'Menjaga Keteraturan', 'Menjaga kerapian ruang kerja dan dokumen digital pribadi.'),
    ('CO', 'Concern for Order', 'Achievement', '2', 'Kejelasan Tugas', 'Meminta kejelasan spesifikasi kebutuhan kerja tertulis dan aturan baku proyek.'),
    ('CO', 'Concern for Order', 'Achievement', '3', 'Cek Ulang Pekerjaan', 'Secara sadar selalu memeriksa dan menguji ulang hasil kerja sendiri sebelum diserahkan.'),
    ('CO', 'Concern for Order', 'Achievement', '4', 'Memonitor Kualitas', 'Memeriksa kualitas pekerjaan tim dan memastikan seluruh prosedur QA/coding standard ditaati.'),
    ('CO', 'Concern for Order', 'Achievement', '5', 'Membangun Sistem Kontrol', 'Merancang dan memonitor data proyek secara berkala untuk meminimalkan potensi kegagalan sistem.'),

    ('TW', 'Teamwork', 'Managerial', '1', 'Kooperatif', 'Mendukung keputusan tim dan menyelesaikan bagian tugasnya dengan baik demi kelompok.'),
    ('TW', 'Teamwork', 'Managerial', '2', 'Berbagi Informasi', 'Secara transparan membagikan informasi teknis penting dan update progres ke rekan tim.'),
    ('TW', 'Teamwork', 'Managerial', '3', 'Ekspektasi Positif', 'Menghormati pendapat rekan dan mengapresiasi kontribusi orang lain dalam tim.'),
    ('TW', 'Teamwork', 'Managerial', '4', 'Meminta Masukan', 'Aktif meminta masukan dari rekan dan mendengarkan solusi alternatif secara terbuka.'),
    ('TW', 'Teamwork', 'Managerial', '5', 'Membangun Kerjasama', 'Menciptakan atmosfer tim yang solid, moral tinggi, dan menyelesaikan konflik internal secara dewasa.'),

    ('INT', 'Initiative', 'Achievement', '1', 'Persisten', 'Konsisten mencoba menyelesaikan hambatan kerja mandiri tanpa cepat menyerah.'),
    ('INT', 'Initiative', 'Achievement', '2', 'Proaktif Saat Ini', 'Mengambil tindakan cepat sebelum diminta untuk mengatasi isu teknis yang sedang terjadi.'),
    ('INT', 'Initiative', 'Achievement', '3', 'Antisipasi Jangka Pendek', 'Mengantisipasi masalah 1-3 bulan ke depan dan melakukan tindakan pencegahan dini.'),
    ('INT', 'Initiative', 'Achievement', '4', 'Inisiatif Lebih Banyak', 'Memulai proyek perbaikan atau optimasi baru yang melampaui deskripsi tugas rutinnya.'),
    ('INT', 'Initiative', 'Achievement', '5', 'Inisiatif Luar Biasa', 'Melakukan upaya luar biasa yang memberikan dampak transformasional pada efisiensi kerja tim.')
]

for row_idx, row_data in enumerate(dict_rubric, start=6):
    for c_offset, val in enumerate(row_data):
        c = ws4.cell(row=row_idx, column=2 + c_offset, value=val)
        c.font = font_data
        c.border = border_thin
        if c_offset in [0, 2, 3]:
            c.alignment = align_center
            if c_offset == 0:
                c.font = font_mono
        elif c_offset == 4:
            c.alignment = align_left
            c.font = font_bold
        else:
            c.alignment = align_wrap
    if row_idx % 2 == 1:
        for col_i in range(2, 8):
            ws4.cell(row=row_idx, column=col_i).fill = fill_zebra

# Save workbook
output_path = 'MATRIKS_KOMPETENSI_IT_JOBSTREET_BU_RINA.xlsx'
wb.save(output_path)
print(f'File successfully created at: {output_path}')
