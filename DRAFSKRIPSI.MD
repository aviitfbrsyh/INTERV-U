RANCANG BANGUN SISTEM SIMULASI KERJA VOICE-TO-VOICE BERBASIS PEMETAAN KOMPETENSI SPENCER & SPENCER DENGAN EVALUASI LLM-AS-A-JUDGE

HALAMAN JUDUL


 

Disusun Oleh:


	N a m a	: Avit Febriansyah
	NIM	: 23523238





PROGRAM STUDI INFORMATIKA – PROGRAM SARJANA
FAKULTAS TEKNOLOGI INDUSTRI
UNIVERSITAS ISLAM INDONESIA
2026 
 
	BAB I
PENDAHULUAN

1.1	Latar Belakang
Transisi dari dunia perguruan tinggi menuju ekosistem industri teknologi merupakan fase krusial yang menuntut kesiapan profesional yang matang bagi lulusan sarjana bidang Teknologi Informasi (TI). Ruang lingkup permasalahan ini berpusat pada dinamika rekrutmen di era transformasi digital, di mana perusahaan kini menerapkan proses seleksi yang semakin kompleks dan menuntut kandidat untuk memiliki literasi teknologi serta kesiapan kerja yang komprehensif (Hiaruman & Pratama, 2025). Penyelarasan profil kualifikasi lulusan dengan standar industri yang dinamis menjadi tantangan utama guna meminimalkan terjadinya ketidakcocokan kualifikasi (skill mismatch) yang saat ini menjadi hambatan utama produktivitas tenaga kerja terdidik di pasar global maupun nasional (Bevara et al., 2025; Khoiruddin et al., 2024).

Fakta di lapangan menunjukkan adanya hambatan signifikan dalam penyerapan tenaga kerja sarjana di Indonesia. Data Badan Pusat Statistik (BPS) per Februari 2025 melaporkan bahwa tingkat pengangguran terbuka didominasi oleh lulusan perguruan tinggi, dengan angka kenaikan mencapai 14,6% dibandingkan periode tahun sebelumnya (Syahri et al., 2025). Kondisi pasar kerja yang kompetitif tersebut berkontribusi secara langsung pada tingginya prevalensi kecemasan karier (career anxiety) pada mahasiswa tingkat akhir. Berdasarkan studi empiris, tercatat sebanyak 36,6% lulusan baru berada dalam kategori kecemasan sedang yang dipicu oleh tekanan sosial dan ketidakpastian masa depan profesional (Asyiah & Nio, 2025). Urgensi masalah penelitian ini terletak pada korelasi kuat antara tingkat kecemasan dengan rendahnya efikasi diri dalam menghadapi persiapan wawancara kerja profesional (Giffar et al., 2024; Ibrahim et al., 2025). Kegagalan lulusan di bidang TI dalam menunjukkan potensi teknis terbaiknya sering kali berakar dari hambatan psikologis dan kurangnya persiapan komunikasi lisan berbasis pembuktian perilaku nyata (Bevara et al., 2025).

Dalam praktik rekrutmen industri modern, paradigma wawancara telah bergeser dari sekadar pengujian hafalan teori atau daftar tugas mentah pada deskripsi pekerjaan (Job Description) menuju penilaian berbasis kompetensi perilaku (*behavioral competency*). Berlandaskan teori seminal Spencer & Spencer (1993) dalam *Competence at Work*, prediktor terbaik dari performa kerja unggul (*superior performance*) di masa depan adalah perilaku nyata yang telah ditunjukkan individu pada situasi kritis di masa lalu. Pendekatan standar emas yang digunakan praktisi Human Resources (HR) global adalah *Behavioral Event Interview* (BEI), di mana kandidat diminta menceritakan pengalaman nyata (*"Ceritakan situasi saat Anda..."*) dengan larangan mengajukan pertanyaan teoretis konseptual maupun skenario hipotetis abstrak (*"Apa yang akan Anda lakukan jika..."*).

Namun demikian, identifikasi permasalahan pada simulator wawancara berbasis AI yang ada saat ini menunjukkan bahwa sebagian besar sistem masih mengajukan pertanyaan yang bersumber langsung secara dangkal dari teks Job Description tanpa pemetaan kompetensi terstandar, atau menggunakan mode-mode buatan yang tidak mencerminkan wawancara kerja riil. Penggunaan Asynchronous Video Interviews (AVIs) di industri rekrutmen global juga sering dikritik karena sifatnya yang impersonal dan hanya berupa komunikasi satu arah (monolog), sehingga gagal melatih kemampuan dialog interaktif kandidat (Hemamou et al., 2019; Zibarras et al., 2018). Tinjauan terhadap sistem kaskade (Speech-to-Text ke Text-to-Speech) menunjukkan adanya latensi tinggi berkisar antara 1 hingga 3 detik yang merusak dinamika percakapan alami (Ethiraj et al., 2025). Selain itu, algoritma evaluasi pada sistem pendahulu rentan terhadap bias verbositas (*length bias*), di mana Large Language Model (LLM) cenderung memberi skor tinggi pada jawaban panjang tanpa mengukur kelugasan informasi dan kedalaman bukti perilaku (Giffar et al., 2024).

Untuk mengatasi kelemahan tersebut, sistem wawancara perlu mengintegrasikan landasan teoritis Kamus Kompetensi Spencer & Spencer (1993) yang dikhususkan pada peran teknologi informasi melalui penetapan 7 kompetensi inti: *Technical/Professional Expertise* (EXP), *Analytical Thinking* (AT), *Conceptual Thinking* (CT), *Achievement Orientation* (ACH), *Concern for Order, Quality and Accuracy* (CO), *Teamwork and Cooperation* (TW), dan *Initiative* (INT). Selain itu, teknik penggalian (*probing*) dan evaluasi harus menggabungkan struktur narasi STAR (*Situation, Task, Action, Result*) dengan instrumen FACT (*Feeling/Focus, Action, Context/Consequence, Thinking*) serta metrik kelugasan ConCISE (Ghafari et al., 2025).

Penelitian ini dilaksanakan di wilayah Daerah Istimewa Yogyakarta (DIY) sebagai pusat pendidikan dan laboratorium sosial inovasi digital dengan representasi mahasiswa yang multikultural (Tan, 2025; Nursanti & Andriyanti, 2021). Oleh karena itu, penelitian ini bertujuan mengembangkan sistem simulasi wawancara kerja cerdas berbasis web yang mengintegrasikan interaksi *voice-to-voice* waktu nyata berlatensi rendah dengan mekanisme pemetaan kompetensi Spencer & Spencer dari Job Description dan evaluasi komprehensif menggunakan pendekatan LLM-as-a-Judge.

1.2	Rumusan Masalah
Berdasarkan latar belakang yang telah diuraikan di atas, rumusan masalah dalam penelitian ini adalah sebagai berikut:
a.	Bagaimana merancang dan mengembangkan sistem simulasi wawancara kerja berbasis web yang mampu menghadirkan interaksi voice-to-voice secara real-time dengan latensi rendah menggunakan Google Gemini Multimodal Live API?
b.	Bagaimana mengimplementasikan mekanisme pemetaan kompetensi berbasis Kamus Kompetensi Spencer & Spencer (1993) dari Job Description (JD) dan pencocokan dengan Curriculum Vitae (CV) kandidat untuk menyusun pertanyaan Behavioral Event Interview (BEI) yang kontekstual dan personal?
c.	Bagaimana menerapkan evaluasi objektif berbasis LLM-as-a-Judge yang menggabungkan deteksi struktur narasi STAR, kedalaman probing FACT (Feeling, Action, Context, Thinking), metrik kelugasan ConCISE, dan penentuan skala tingkat kemahiran level kompetensi (1–5)?

1.3	Batasan Masalah
Untuk menghindari meluasnya ruang lingkup penelitian, maka ditetapkan beberapa batasan masalah sebagai berikut:
a. Sistem difokuskan pada format tunggal **Behavioral Event Interview (BEI)** terkalibrasi durasi ±15 menit (~7 pertanyaan inti) untuk lulusan baru (*fresh graduate*) pada bidang Teknologi Informasi dengan pemetaan maksimal 7 kompetensi inti Spencer & Spencer (1993): *Technical/Professional Expertise* (EXP), *Analytical Thinking* (AT), *Conceptual Thinking* (CT), *Achievement Orientation* (ACH), *Concern for Order* (CO), *Teamwork* (TW), dan *Initiative* (INT).
b. Arsitektur interaksi suara menggunakan pendekatan *voice-to-voice* waktu nyata (*real-time*) yang dibangun menggunakan integrasi Google Gemini Multimodal Live API via Web Audio API.
c. Pertanyaan wawancara strictly berorientasi pada peristiwa dan perilaku masa lalu kandidat (*Behavioral Event Interview*), tanpa pertanyaan hafalan teori buku dan tanpa skenario hipotetis abstrak.
d. Algoritma evaluasi dan umpan balik (LLM-as-a-Judge) mengintegrasikan deteksi kerangka narasi STAR (*Situation, Task, Action, Result*), kedalaman pembuktian FACT (*Feeling/Focus, Action, Context/Consequence, Thinking*), kelugasan linguistik ConCISE (*Consistency, Clarity, Information, Structure, Effectiveness*), dan skor tingkat kemahiran kompetensi (Level 1–5).
e. Sistem berfokus pada pemrosesan audio (suara) dan teks, serta tidak melakukan analisis visi komputer (*Computer Vision*) untuk mengevaluasi bahasa tubuh (*body language*) visual.

1.4	Tujuan Penelitian
Adapun tujuan dari penelitian ini adalah:
a. Merancang dan mengembangkan sistem simulasi wawancara kerja berbasis web yang menghadirkan interaksi *voice-to-voice* secara *real-time* dengan latensi rendah untuk meminimalkan jeda percakapan alami.
b. Mengimplementasikan mekanisme ekstraksi dan pemetaan kompetensi Spencer & Spencer (1993) dari Job Description (JD) yang dicocokkan dengan CV kandidat guna menghasilkan pertanyaan BEI yang spesifik menggali bukti perilaku masa lalu.
c. Menerapkan metrik evaluasi objektif berbasis LLM-as-a-Judge yang menggabungkan verifikasi STAR, kedalaman probing FACT, kelugasan ConCISE, dan penilaian skala kemahiran level kompetensi 1–5 secara terotomatisasi.

1.5	Manfaat Penelitian
Penelitian ini diharapkan dapat memberikan manfaat yang signifikan:
a. Manfaat Teoritis:
   1. Memberikan kontribusi pada kajian literatur terkait penerapan arsitektur Multimodal Large Language Models (LLMs) dalam simulasi wawancara berbasis kompetensi kerja (*Competency-Based Interview*).
   2. Menjadi acuan metodologis dalam operasionalisasi Kamus Kompetensi Spencer & Spencer (1993) dan integrasi instrumen STAR + FACT serta metrik ConCISE pada interaksi suara kecerdasan buatan.
b. Manfaat Praktis:
   1. Bagi Lulusan Baru: Menyediakan lingkungan simulasi realistis yang aman (*safe-to-fail*) untuk mengasah keterampilan menjawab pertanyaan perilaku berbasis bukti nyata, mengurangi kecemasan wawancara, dan meningkatkan kesiapan kerja.
   2. Bagi Institusi Pendidikan (UII): Sebagai prototipe alat bantu pusat karier universitas (*Career Center*) dalam pelatihan kerja mahasiswa berbasis standar HR modern.
   3. Bagi Praktisi Industri: Membantu menyiapkan talenta TI yang mampu mengomunikasikan kompetensi analitis, pemecahan masalah, dan kerja sama tim secara terstruktur dan lugas.

1.6	Metodologi Penelitian
Penelitian ini menggunakan metodologi rekayasa perangkat lunak yang dikombinasikan dengan pendekatan evaluasi empiris kecerdasan buatan, meliputi tahapan:
a. Pengumpulan Data dan Studi Pendahuluan (Requirements Gathering):
   Analisis literatur mengenai kesenjangan kompetensi lulusan TI, telaah Kamus Kompetensi Spencer & Spencer (1993), perumusan taksonomi 7 kompetensi inti TI, serta penyusunan parameter evaluasi HR berbasis STAR, FACT, dan ConCISE.
b. Perancangan Sistem dan Arsitektur (System Design):
   1. Arsitektur Pemetaan Kompetensi: Pipeline ekstraksi Gemini untuk memetakan deskripsi pekerjaan (JD) ke 7 kompetensi Spencer & Spencer dan mencocokkannya (*cross-match*) dengan rekam jejak CV.
   2. Arsitektur Audio Voice-to-Voice: Perancangan streaming audio bidireksional via Web Audio API (PCM 16–24kHz) dan Gemini Multimodal Live API dengan persona interviewer AI (Siti Rahayu) berprotokol BEI ketat.
   3. Perancangan Antarmuka Pengguna: Antarmuka berbasis Next.js 15, React 19, dan Tailwind CSS v4.
c. Implementasi dan Rekayasa Perangkat Lunak (Development):
   Konstruksi antarmuka dan modul backend: modul setup wawancara, modul live interview BEI berdurasi ~15 menit (~7 pertanyaan), modul LLM-as-a-Judge pasca-wawancara, serta modul bimbingan interaktif (*chat coaching* & latihan ulang suara).
d. Pengujian dan Evaluasi (Testing and Validation):
   1. Validasi Fungsionalitas: Pengujian *Black-box testing* untuk memvalidasi alur kerja sistem.
   2. Evaluasi Kinerja AI: Pengukuran latensi percakapan audio dan validasi akurasi penilaian LLM-as-a-Judge terhadap metrik STAR, FACT, ConCISE, dan level kompetensi.
   3. Evaluasi Penerimaan Pengguna: Pengujian kebergunaan menggunakan instrumen *System Usability Scale* (SUS) kepada responden mahasiswa tingkat akhir / lulusan baru bidang TI.

1.7	Sistematika Penulisan
Sistematika penulisan laporan skripsi ini adalah:
BAB I PENDAHULUAN: Berisi latar belakang, rumusan masalah, batasan masalah, tujuan, manfaat, metodologi penelitian, dan sistematika penulisan.
BAB II TINJAUAN PUSTAKA: Membahas teori kecemasan karier, model kompetensi Spencer & Spencer (1993), metode Behavioral Event Interview (BEI), framework narasi STAR dan instrumen FACT, metrik kelugasan ConCISE, arsitektur Multimodal LLM Voice-to-Voice, dan pengujian perangkat lunak.
BAB III METODOLOGI PENELITIAN: Menguraikan perancangan sistem, alur pemetaan kompetensi, arsitektur Web Audio API dan Live API, skema evaluasi LLM-as-a-Judge, serta instrumen pengujian.
BAB IV HASIL DAN PEMBAHASAN: Menyajikan hasil implementasi sistem simulasi BEI, visualisasi evaluasi kompetensi dan FACT, analisis latensi interaksi suara, hasil pengujian Black-Box, dan skor SUS.
BAB V SIMPULAN DAN SARAN: Menyajikan sintesis pencapaian sistem dan rekomendasi pengembangan lanjutan.

DAFTAR PUSTAKA

Asyiah, S., & Nio, S. R. (2025). Karier Pada Fresh Graduate Yang Sedang Mencari. 3(1), 192–197.
Bevara, R. V. K., Mannuru, N. R., Karedla, S. P., Lund, B., Xiao, T., Pasem, H., Dronavalli, S. C., & Rupeshkumar, S. (2025). Resume2Vec: Transforming Applicant Tracking Systems with Intelligent Resume Embeddings for Precise Candidate Matching. Electronics (Switzerland), 14(4), 1–18. https://doi.org/10.3390/electronics14040794
Ethiraj, V., David, A., Menon, S., & Vijay, D. (2025). Toward Low-Latency End-to-End Voice Agents for Telecommunications Using Streaming ASR, Quantized LLMs, and Real-Time TTS. http://arxiv.org/abs/2508.04721
Ghafari, S. M., Kol, R., Quiroz, J. C., Luan, N., Patial, M., Rupasinghe, C., Wandabwa, H., & Pizzato, L. (2025). ConCISE: A Reference-Free Conciseness Evaluation Metric for LLM-Generated Answers. http://arxiv.org/abs/2511.16846
Giffar, Z. M., Iis, ;, Adnan, Z., & Hendrawan, ; Heri. (2024). Makna Kecemasan Komunikasi Dalam Wawancara Kerja Bagi Mahasiswa Fresh Graduate. Jurnal Ilmu Komunikasi UHO : Jurnal Penelitian Kajian Ilmu Komunikasi Dan Informasi, 9(4), 810–828. http://jurnalilmukomunikasi.uho.ac.id/index.php/journal/indexDOI:http://dx.doi.org/10.52423/jikuho.v9i4.342
Hemamou, L., Felhi, G., Vandenbussche, V., Martin, J. C., & Clavel, C. (2019). HireNet: A hierarchical attention model for the automatic analysis of asynchronous video job interviews. 33rd AAAI Conference on Artificial Intelligence, AAAI 2019, 31st Innovative Applications of Artificial Intelligence Conference, IAAI 2019 and the 9th AAAI Symposium on Educational Advances in Artificial Intelligence, EAAI 2019, 573–581. https://doi.org/10.1609/aaai.v33i01.3301573
Hiaruman, K. A. D., & Pratama, M. F. (2025). Peran dukungan sosial dan kecemasan karier terhadap kesiapan kerja final year students generasi z. Humanitas, 9(3), 367–380.
Ibrahim, I. D. K., Cahyaningrum, D., Hasany, T. D., Safitri, D., & Asri, N. W. A. M. (2025). Level of Anxiety over Future Employment for Final Year Students: A Literature Review. Journal of Business Management and Economic Development, 3(02), 716–725. https://doi.org/10.59653/jbmed.v3i02.1583
Khoiruddin, M. A., Setyanti, A. M., Suman, A., Prasetyia, F., & Susilo, S. (2024). Exploring Determinants of Education-Job Mismatch Among Educated Workers in Indonesia. Jurnal Ekonomi Pembangunan: Kajian Masalah Ekonomi Dan Pembangunan, 25(2), 263–281. https://doi.org/10.23917/jep.v25i2.23994
Nursanti, E., & Andriyanti, E. (2021). Language identities of multilingual college english learners in Indonesia. Eurasian Journal of Applied Linguistics, 7(1), 316–337. https://doi.org/10.32601/ejal.911403
Ramadan, M. N., Ramadhani, M. A. R., Handayani, C. T., Sulistiyani, E., & Budiarti, R. P. N. (2024). Implementation of Black Box Testing and System Usability Scale on the Nurul Huda Financial Recording Information System. Applied Technology and Computing Science Journal, 7(2). https://doi.org/10.33086/atcsj.v7i2.8365
Spencer, L. M., & Spencer, S. M. (1993). Competence at Work: Models for Superior Performance. John Wiley & Sons, Inc.
Syahri, A., Nabila, A. A., Warda, S., Izmi, U., & Subhan, M. (2025). Peran Bimbingan Dan Konseling Islam Dalam Mengurangi Tingkat Pengangguran Sarjana Di Indonesia: Analisis Terhadap Data Bps 2025. Jurnal Review Pendidikan Dan Pengajaran, 8(4), 8274–8283. https://doi.org/10.31004/jrpp.v8i4.51901
Tan, F. (2025). YOGYAKARTA. 2(1), 363–381.
Zibarras, L., Patterson, F., Holmes, J., Flaxman, C., & Kubacki, A. (2018). An exploration of applicant perceptions of asynchronous video MMIs in medical selection. MedEdPublish, 7, 285. https://doi.org/10.15694/mep.2018.0000285.1
