RANCANG BANGUN SISTEM SIMULASI KERJA VOICE-TO-VOICE BERBASIS CV-DESKRIPSI PEKRJAAN MATCHING DENGAN EVALUASI LLM-AS-A-JUDGE

HALAMAN JUDUL


 

Disusun Oleh:


	N a m a
	NIM	: Avit Febriansyah
: 23523238





PROGRAM STUDI INFORMATIKA – PROGRAM SARJANA
FAKULTAS TEKNOLOGI INDUSTRI
UNIVERSITAS ISLAM INDONESIA
2026 
 
	BAB I
PENDAHULUAN

1.1	Latar Belakang
Transisi dari dunia perguruan tinggi menuju ekosistem industri teknologi merupakan fase krusial yang menuntut kesiapan profesional yang matang bagi lulusan sarjana bidang Teknologi Informasi (TI). Ruang lingkup permasalahan ini berpusat pada dinamika rekrutmen di era transformasi digital, di mana perusahaan kini menerapkan proses seleksi yang semakin kompleks dan menuntut kandidat untuk memiliki literasi teknologi serta kesiapan kerja yang komprehensif (Hiaruman & Pratama, 2025). Penyelarasan profil kualifikasi lulusan dengan standar industri yang dinamis menjadi tantangan utama guna meminimalkan terjadinya ketidakcocokan kualifikasi (skill mismatch) yang saat ini menjadi hambatan utama produktivitas tenaga kerja terdidik di pasar global maupun nasional (Bevara et al., 2025; Khoiruddin et al., 2024)
Fakta di lapangan menunjukkan adanya hambatan signifikan dalam penyerapan tenaga kerja sarjana di Indonesia. Data terbaru dari Badan Pusat Statistik (BPS) per Februari 2025 melaporkan bahwa tingkat pengangguran terbuka justru didominasi oleh lulusan perguruan tinggi, dengan angka kenaikan mencapai 14,6% dibandingkan periode tahun sebelumnya (Syahri et al., 2025). Kondisi pasar kerja yang kompetitif tersebut berkontribusi secara langsung pada tingginya prevalensi kecemasan karier (career anxiety) pada mahasiswa tingkat akhir. Berdasarkan studi empiris terbaru, tercatat sebanyak 36,6% lulusan baru berada dalam kategori kecemasan sedang yang dipicu oleh tekanan sosial dan ketidakpastian masa depan profesional (Asyiah & Nio, 2025). Urgensi masalah penelitian ini terletak pada korelasi kuat antara tingkat kecemasan dengan rendahnya efikasi diri dalam menghadapi persiapan wawancara kerja profesional (Giffar et al., 2024; Ibrahim et al., 2025). Kegagalan lulusan di bidang Teknologi Informasi (TI) dalam menunjukkan potensi teknis terbaiknya sering kali berakar dari hambatan psikologis dan kurangnya persiapan komunikasi lisan yang terpersonalisasi sesuai dengan syarat spesifik pekerjaan (Bevara et al., 2025). Tanpa adanya sistem pendukung simulasi yang mampu memberikan interaksi dua arah secara realistis dan umpan balik personal, kesenjangan antara kualifikasi akademik dengan ekspektasi industri akan terus melebar, sehingga diperlukan inovasi teknologi yang mampu meningkatkan kematangan karier mahasiswa secara terukur.
Identifikasi permasalahan dalam persiapan karier menunjukkan bahwa keterbatasan utama simulator wawancara saat ini terletak pada rendahnya relevansi materi uji dengan kualifikasi unik kandidat. Penggunaan Asynchronous Video Interviews (AVIs) di industri rekrutmen global sering kali dikritik karena sifatnya yang impersonal dan hanya berupa komunikasi satu arah (monolog), sehingga gagal melatih kemampuan dialog interaktif kandidat (Hemamou et al., 2019; Zibarras et al., 2018). Ketidakhadiran pewawancara secara langsung dalam sistem asinkron tersebut menyebabkan kandidat kehilangan kesempatan untuk mendapatkan umpan balik spontan yang sangat diperlukan dalam membangun kepercayaan diri. Tinjauan terhadap sistem seperti HireVue dan Prep AI menunjukkan bahwa arsitektur kaskade (Speech-to-Text ke Text-to-Speech) yang digunakan menghasilkan latensi tinggi berkisar antara 1 hingga 3 detik, yang secara signifikan merusak kenyamanan percakapan dan membuatnya terasa robotik (Ethiraj et al., 2025). Selain itu, algoritma evaluasi pada sistem pendahulu rentan terhadap bias verbositas, di mana Large Language Model (LLM) cenderung memberikan penilaian tinggi hanya berdasarkan panjang jawaban (length bias) tanpa mengukur kelugasan informasi secara ilmiah (Giffar et al., 2024). Masalah ini diperparah dengan ketiadaan sinkronisasi otomatis antara profil kualifikasi pada CV dengan deskripsi pekerjaan yang dilamar, sehingga simulasi yang dihasilkan sering kali bersifat generik dan tidak menyasar pada celah kompetensi kandidat (Bevara et al., 2025).
Penelitian ini dilaksanakan di wilayah Daerah Istimewa Yogyakarta (DIY), sebuah provinsi yang memiliki konsentrasi institusi pendidikan tinggi dan kepadatan populasi mahasiswa yang signifikan secara nasional. Pemilihan lokasi ini didasarkan pada karakteristik unik Yogyakarta sebagai pusat gravitasi inovasi digital di Indonesia yang telah melahirkan ratusan entitas bisnis teknologi baru dalam satu dekade terakhir (Tan, 2025). Yogyakarta diakui sebagai laboratorium sosial yang strategis karena menampung mahasiswa dari berbagai latar belakang etnis di seluruh wilayah Nusantara, sehingga mengukuhkan predikatnya sebagai "Miniatur Indonesia" atau pusat pendidikan kosmopolitan modern (Nursanti & Andriyanti, 2021). Tantangan yang dihadapi oleh mahasiswa tingkat akhir di wilayah ini mencerminkan keberagaman profil lulusan perguruan tinggi Indonesia secara komprehensif, sehingga data yang diperoleh dari responden di Yogyakarta dianggap memiliki tingkat representativitas yang tinggi untuk mewakili populasi lulusan bidang Teknologi Informasi (TI) nasional dalam menghadapi persaingan pasar kerja profesional (Ibrahim et al., 2025).
Berdasarkan paparan mengenai tingginya angka pengangguran sarjana serta kendala teknis pada sistem simulator wawancara yang ada saat ini, ditemukan adanya kebutuhan mendesak akan inovasi platform persiapan karier yang lebih interaktif dan personal. Keterbatasan sistem terdahulu yang masih bersifat monolog asinkron serta memiliki kendala latensi tinggi menuntut adanya penerapan teknologi audio yang diproses secara native guna menciptakan interaksi suara waktu nyata yang natural (Ethiraj et al., 2025). Selain itu, integrasi data kualifikasi kandidat secara utuh melalui arsitektur Retrieval-Augmented Generation (RAG) menjadi krusial untuk menghasilkan skenario wawancara yang kontekstual dan mampu meminimalkan bias informasi (Bevara et al., 2025). Implementasi metrik evaluasi yang objektif seperti metrik ConCISE juga diperlukan untuk memberikan umpan balik kualitatif mengenai kelugasan komunikasi kandidat yang selama ini sulit diukur secara otomatis(Ghafari et al., 2025). Oleh karena itu, penelitian ini bertujuan untuk mengembangkan sebuah sistem simulasi wawancara kerja cerdas berbasis web yang mengintegrasikan interaksi voice-to-voice waktu nyata dengan mekanisme pencocokan kualifikasi (cross-matching) antara profil kandidat dan kriteria pekerjaan menggunakan evaluasi LLM-as-a-Judge. Inovasi ini diharapkan dapat menjadi sarana edukasi yang efektif bagi lulusan baru bidang Teknologi Informasi (TI) di Yogyakarta dalam meningkatkan kesiapan mental dan kompetensi komunikasi mereka sebelum memasuki pasar tenaga kerja profesional.

1.2	Rumusan Masalah
Berdasarkan latar belakang yang telah diuraikan di atas, rumusan masalah dalam penelitian ini adalah sebagai berikut:
a.	Bagaimana merancang dan mengembangkan sistem simulasi wawancara kerja berbasis web yang mampu menghadirkan interaksi voice-to-voice secara real-time dengan latensi rendah?
b.	Bagaimana mengimplementasikan mekanisme cross-matching berbasis RAG antara profil kualifikasi kandidat dan deskripsi pekerjaan untuk menghasilkan skenario wawancara yang personal dan kontekstual?
c.	Bagaimana menerapkan metrik evaluasi objektif berbasis LLM-as-a-Judge untuk mengukur kelugasan komunikasi dan kesiapan kerja kandidat secara otomatis?

1.3	Batasan Masalah
Untuk menghindari meluasnya ruang lingkup penelitian, maka ditetapkan beberapa batasan masalah sebagai berikut:
a. Sistem difokuskan pada simulasi wawancara kerja teknis dan keperilakuan (behavioral) untuk lulusan baru (fresh graduate) pada bidang Teknologi Informasi (TI).
b. Arsitektur interaksi suara menggunakan pendekatan voice-to-voice waktu nyata (real-time) yang secara khusus dibangun menggunakan integrasi Google Gemini Multimodal Live API.
c. Algoritma evaluasi dan umpan balik (LLM-as-a-Judge) dibatasi pada analisis linguistik, kelugasan informasi (mengacu pada metrik ConCISE), dan deteksi pola narasi STAR (Situation, Task, Action, Result).
d. Sistem berfokus pada pemrosesan audio (suara) dan teks, serta tidak melakukan analisis visi komputer (Computer Vision) untuk mengevaluasi bahasa tubuh (body language) atau isyarat non-verbal visual.

1.4	Tujuan Penelitian
Adapun tujuan dari setiap rumusan masalah yang telah disusun adalah:
a. Merancang dan mengembangkan sistem simulasi wawancara kerja berbasis web yang menghadirkan interaksi voice-to-voice secara real-time dengan latensi rendah untuk meminimalkan jeda percakapan.
b. Mengimplementasikan mekanisme cross-matching berbasis Retrieval-Augmented Generation (RAG) antara profil kualifikasi kandidat (CV) dan deskripsi pekerjaan (JD) guna menghasilkan skenario wawancara yang adaptif dan terpersonalisasi.
c. Menerapkan metrik evaluasi yang objektif berbasis LLM-as-a-Judge (seperti ConCISE dan deteksi struktur STAR) untuk mengukur kelugasan komunikasi serta efektivitas penyampaian kandidat secara terotomatisasi.

1.5	Manfaat Penelitian
Penelitian ini diharapkan dapat memberikan manfaat yang signifikan, baik secara teoritis maupun praktis:
a. Manfaat Teoritis:
   1. Memberikan kontribusi pada kajian literatur terkait penerapan arsitektur Multimodal Large Language Models (LLMs) dan Retrieval-Augmented Generation (RAG) dalam ranah simulasi pendidikan dan pengembangan karier profesional.
   2. Menjadi acuan referensi metodologis dalam penerapan otomatisasi metrik penilaian kelugasan (ConCISE) dan deteksi struktural narasi (STAR) pada interaksi suara manusia ke mesin (Human-Computer Interaction).
b. Manfaat Praktis:
   1. Bagi Lulusan Baru: Menyediakan lingkungan simulasi yang aman (safe-to-fail) dan terjangkau untuk mengurangi tingkat kecemasan serta meningkatkan efikasi diri kandidat sebelum menghadapi proses rekrutmen profesional di industri teknologi.
   2. Bagi Institusi Pendidikan (UII): Dapat dimanfaatkan oleh pusat pengembangan karier universitas (Career Center) sebagai purwarupa (prototype) alat bantu pendampingan mahasiswa tingkat akhir dalam mempersiapkan lulusan yang kompetitif.
   3. Bagi Praktisi Industri: Membantu menekan angka ketidakcocokan kualifikasi (skill mismatch) dari sisi kemampuan komunikasi teknis kandidat, sehingga mempercepat dan mengefisienkan tahapan seleksi rekrutmen di industri TI.

1.6	Metodologi Penelitian
Penelitian ini menggunakan metodologi rekayasa perangkat lunak yang dikombinasikan dengan pendekatan evaluasi empiris untuk sistem kecerdasan buatan. Pendekatan ini dipilih untuk mengakomodasi kompleksitas pengembangan perangkat lunak terintegrasi AI (seperti pemrosesan audio streaming waktu nyata) yang menuntut proses perancangan sistematis dan validasi output secara terstruktur agar memenuhi standar rekrutmen profesional. Tahapan komprehensif yang dilakukan dalam penelitian ini meliputi:
a. Pengumpulan Data dan Studi Pendahuluan (Requirements Gathering):
   Tahap ini diawali dengan studi literatur mendalam terkait kesenjangan komunikasi lulusan TI dan fenomena kecemasan karier. Selanjutnya, dilakukan analisis kebutuhan sistem dengan mendefinisikan parameter evaluasi berdasarkan standar Human Resources (HR) profesional. Parameter tersebut mencakup deteksi kerangka wawancara STAR (Situation, Task, Action, Result) dan perumusan metrik ConCISE (Consistency, Clarity, Information, Structure, Effectiveness) yang akan diinjeksi sebagai logika penilaian (prompting logic) pada model AI.
b. Perancangan Sistem dan Arsitektur (System Design):
   Tahap perancangan ini memetakan logika operasional sistem secara keseluruhan, yang terdiri dari:
   1. Arsitektur Data (RAG): Merancang pipeline ekstraksi data terstruktur untuk melakukan pencocokan (cross-matching) antara dokumen CV pelamar dengan persyaratan spesifik pada Job Description (JD).
   2. Arsitektur Audio: Merancang aliran data suara latensi rendah menggunakan Web Audio API, mencakup penangkapan raw PCM 16-24kHz, mekanisme Voice Activity Detection (VAD), dan pemfilteran frekuensi untuk memastikan interaksi suara dua arah yang mulus tanpa gangguan gema (echo).
   3. Perancangan Antarmuka: Merancang alur pengguna (user flow) dan antarmuka web (UI/UX) yang intuitif.
c. Implementasi dan Rekayasa Perangkat Lunak (Development):
   Tahap konstruksi kode (coding) untuk membangun produk fungsional. Antarmuka sistem dibangun menggunakan framework Next.js 15, React 19, dan TypeScript. Untuk mesin kecerdasan buatan, sistem diintegrasikan secara native dengan Google Gemini Multimodal Live API guna menjalankan simulasi wawancara voice-to-voice waktu nyata, serta model Gemini Pro untuk menyusun laporan analitik dan evaluasi performa kandidat pasca-wawancara.
d. Pengujian dan Evaluasi (Testing and Validation):
Tahap pengujian dilakukan secara komprehensif dan terukur untuk memastikan kualitas perangkat lunak (Ramadan et al., 2024):
   1. Validasi Fungsionalitas: Menggunakan metode Black-box testing untuk menjamin bahwa seluruh alur kerja sistem, mulai dari unggah CV hingga cetak laporan, beroperasi dengan benar tanpa cacat fungsi (bug-free).
   2. Pengujian Performa AI (Empirical Evaluation): Mengukur kecepatan respons interaksi suara (latency turnaround time) dengan target di bawah 1,5 detik untuk mempertahankan ilusi percakapan manusia. Selain itu, dilakukan pengujian akurasi LLM-as-a-Judge dalam mengidentifikasi komponen STAR pada transkrip obrolan.
   3. Evaluasi Penerimaan Pengguna: Melakukan uji coba langsung (Beta Testing) kepada target responden (lulusan baru/mahasiswa tingkat akhir). Tingkat kepuasan, kemudahan penggunaan, dan penerimaan sistem kemudian diukur secara kuantitatif menggunakan instrumen pengujian System Usability Scale (SUS).

1.7	Sistematika Penulisan
Sistematika penulisan yang digunakan dalam penyusunan laporan penelitian (skripsi) ini adalah sebagai berikut:
BAB I PENDAHULUAN
Bab ini berisi mengenai gambaran umum penyusunan skripsi yang meliputi latar belakang masalah, rumusan masalah, batasan masalah, tujuan penelitian, manfaat penelitian, metodologi penelitian, serta sistematika penulisan laporan penelitian.
BAB II TINJAUAN PUSTAKA
Bab ini membahas tinjauan penelitian terdahulu dan landasan teori utama yang mendukung penelitian. Topik bahasan meliputi konsep kecemasan karier, pemrosesan voice-to-voice latensi rendah (Web Audio API), Multimodal Large Language Models (LLM), mekanisme Retrieval-Augmented Generation (RAG), pedoman wawancara STAR, metrik evaluasi kelugasan (ConCISE), pendekatan LLM-as-a-Judge, metode Prototyping, hingga metode pengujian fungsionalitas (Black-Box) dan kebergunaan sistem (System Usability Scale).
BAB III METODOLOGI PENELITIAN
Bab ini menguraikan tahapan metode yang digunakan untuk membangun sistem simulasi wawancara, meliputi teknik pengumpulan data, prosedur analisis kebutuhan sistem, perancangan arsitektur integrasi API, perancangan basis data dan alur data, tahapan iterasi purwarupa, hingga skenario pengujian kualitas perangkat lunak. Penjelasan lebih teknis terkait tahap implementasi kode dan uji coba dipaparkan secara mendetail pada BAB IV.
BAB IV HASIL DAN PEMBAHASAN
Bab ini menjelaskan tentang hasil nyata dari pembangunan sistem yang telah dilakukan. Bagian ini memaparkan implementasi modul cross-matching profil pelamar kerja, evaluasi kinerja LLM-as-a-Judge dalam menghasilkan umpan balik (feedback) berbasis teks, pengukuran kecepatan interaksi verbal (latensi), serta interpretasi data hasil pengujian Black-Box dan perhitungan akhir nilai Usability Testing (SUS).
BAB V SIMPULAN DAN SARAN
Bab ini menyajikan sintesis dan simpulan akhir mengenai ketercapaian tujuan sistem berdasarkan rumusan masalah yang diajukan. Selain itu, bab ini memuat rekomendasi atau saran yang konstruktif bagi peneliti selanjutnya guna pengembangan dan perbaikan fungsionalitas sistem di masa yang akan datang.
 

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
Syahri, A., Nabila, A. A., Warda, S., Izmi, U., & Subhan, M. (2025). Peran Bimbingan Dan Konseling Islam Dalam Mengurangi Tingkat Pengangguran Sarjana Di Indonesia: Analisis Terhadap Data Bps 2025. Jurnal Review Pendidikan Dan Pengajaran, 8(4), 8274–8283. https://doi.org/10.31004/jrpp.v8i4.51901
Tan, F. (2025). YOGYAKARTA. 2(1), 363–381.
Zibarras, L., Patterson, F., Holmes, J., Flaxman, C., & Kubacki, A. (2018). An exploration of applicant perceptions of asynchronous video MMIs in medical selection. MedEdPublish, 7, 285. https://doi.org/10.15694/mep.2018.0000285.1









 

