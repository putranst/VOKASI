"""
Full content seed for "AI Fundamentals for Everyone"
24 modules · 5 units · ~30 hours · job-preparation focus.

Call seed_ai_fundamentals_content(db) from seeding_service to populate
the SQL Course + CourseModule rows that the VOKASI endpoint merges with.
"""
from sqlalchemy.orm import Session
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import sql_models as models

COURSE_TITLE = "AI Fundamentals for Everyone"

AI_FUNDAMENTALS_MODULES: list = [

    # ═══ UNIT 1 — Memahami AI dari Nol ═══════════════════════════════════
    {
        "order": 1, "title": "Apa Itu Kecerdasan Buatan? Sejarah & Perkembangan",
        "status": "published",
        "content_blocks": [
            {"id": "m1-h1", "type": "heading", "content": "Apa Itu Kecerdasan Buatan?", "metadata": {}},
            {"id": "m1-t1", "type": "text", "content": "Kecerdasan Buatan (AI) adalah cabang ilmu komputer yang membuat mesin mampu meniru kemampuan kognitif manusia — belajar, memahami bahasa, mengenali pola, dan mengambil keputusan.\n\nIstilah 'Artificial Intelligence' dicetuskan **John McCarthy** pada 1956 di Konferensi Dartmouth. Kita kini berada di musim panas AI terpanas dalam sejarah.", "metadata": {}},
            {"id": "m1-h2", "type": "heading", "content": "Tonggak Sejarah AI (1950–2025)", "metadata": {}},
            {"id": "m1-t2", "type": "text", "content": "**1950** — Alan Turing: 'Can machines think?' — Turing Test lahir.\n**1956** — Dartmouth Conference: AI resmi jadi disiplin ilmu.\n**1997** — Deep Blue (IBM) mengalahkan juara catur dunia Kasparov.\n**2012** — Deep Learning revolution: AlexNet, ImageNet.\n**2017** — Makalah 'Attention Is All You Need' → arsitektur Transformer lahir.\n**2022** — ChatGPT: 1 juta pengguna dalam 5 hari, 100 juta dalam 2 bulan.\n**2024–2025** — Era Agentic AI: AI yang merencanakan & bertindak mandiri.", "metadata": {}},
            {"id": "m1-r1", "type": "resource", "content": "Bacaan: Sejarah lengkap AI dari 1950 hingga kini.", "metadata": {"title": "A Brief History of Artificial Intelligence — Wikipedia", "link": "https://en.wikipedia.org/wiki/History_of_artificial_intelligence"}},
            {"id": "m1-d1", "type": "discussion", "content": "Dari timeline sejarah AI, momen mana yang paling berdampak menurutmu? Apakah ada yang mengejutkan atau berbeda dari ekspektasimu?", "metadata": {}},
        ],
    },

    {
        "order": 2, "title": "Cara Kerja AI: Machine Learning, Neural Networks & LLM",
        "status": "published",
        "content_blocks": [
            {"id": "m2-h1", "type": "heading", "content": "Bagaimana Mesin Bisa 'Belajar'?", "metadata": {}},
            {"id": "m2-t1", "type": "text", "content": "**Machine Learning** memungkinkan komputer menemukan pola dari data tanpa aturan eksplisit — seperti mengajari anak mengenali kucing dengan ratusan foto, bukan daftar aturan.\n\n**Tiga jenis ML:**\n- **Supervised Learning** — Belajar dari data berlabel (contoh: filter spam)\n- **Unsupervised Learning** — Menemukan pola tanpa label (contoh: segmentasi pelanggan)\n- **Reinforcement Learning** — Belajar dari reward/penalty (contoh: AlphaGo)", "metadata": {}},
            {"id": "m2-h2", "type": "heading", "content": "Neural Networks & Deep Learning", "metadata": {}},
            {"id": "m2-t2", "type": "text", "content": "Neural network terinspirasi otak manusia:\n- **Input Layer** — Menerima data mentah\n- **Hidden Layers** — Mengekstrak fitur dan pola\n- **Output Layer** — Menghasilkan prediksi\n\nSemakin dalam (banyak layers), semakin kompleks pola yang dipelajari. Inilah **Deep Learning**.\n\n**LLM (Large Language Model)** adalah neural network raksasa dilatih pada hampir seluruh teks di internet. Proses: Pre-training → Fine-tuning → RLHF (umpan balik manusia). GPT-4 memiliki ~1 triliun parameter.", "metadata": {}},
            {"id": "m2-d1", "type": "discussion", "content": "Setelah memahami cara kerja ML dan LLM, apakah AI terasa lebih 'ajaib' atau justru lebih 'biasa'? Apa yang paling mengubah pandanganmu?", "metadata": {}},
        ],
    },

    {
        "order": 3, "title": "Jenis-Jenis AI: Narrow, General & Agentic AI",
        "status": "published",
        "content_blocks": [
            {"id": "m3-h1", "type": "heading", "content": "Spektrum Kecerdasan Buatan", "metadata": {}},
            {"id": "m3-t1", "type": "text", "content": "**1. Narrow AI (ANI) — Yang Ada Sekarang**\nDirancang untuk satu tugas spesifik. Contoh: Siri, AlphaGo, Tesla Autopilot, filter spam. Sangat unggul di tugasnya, tidak bisa melakukan hal lain.\n\n**Semua AI yang ada hari ini adalah Narrow AI** — termasuk ChatGPT dan Claude.\n\n**2. Artificial General Intelligence (AGI) — Masih Hipotetis**\nAI setara kemampuan kognitif manusia. Belum ada. Para ahli berbeda pendapat kapan — atau apakah — ini akan tercapai.\n\n**3. Agentic AI — Frontier yang Sedang Berkembang**\nAI yang bisa merencanakan & mengeksekusi tugas multi-langkah secara mandiri menggunakan tools: web search, kode, email, file. Inilah yang akan kita pelajari di Unit 4.", "metadata": {}},
            {"id": "m3-d1", "type": "discussion", "content": "Jika kamu bisa menciptakan satu AI Agent untuk kehidupan sehari-hari atau pekerjaanmu, apa yang akan kamu buat? Masalah apa yang ingin diselesaikan?", "metadata": {}},
        ],
    },

    {
        "order": 4, "title": "Data: Bahan Bakar AI — Dari Mana Datangnya?",
        "status": "published",
        "content_blocks": [
            {"id": "m4-h1", "type": "heading", "content": "Mengapa Data Adalah Segalanya bagi AI", "metadata": {}},
            {"id": "m4-t1", "type": "text", "content": "**'Garbage in, garbage out'** — kualitas AI tidak bisa melebihi kualitas data yang melatihnya.\n\n**Jenis data:**\n- **Terstruktur** — Tabel, spreadsheet, database\n- **Tidak terstruktur** — Teks, gambar, audio, video (80% data di dunia)\n- **Semi-terstruktur** — JSON, XML, HTML\n\n**Sumber data training AI:**\n- Web scraping (Common Crawl — petabyte teks internet)\n- Data proprietary perusahaan\n- Human-generated labels (industri besar di negara berkembang)\n\n**Masalah kualitas data:**\n- **Bias** → AI lebih akurat untuk kelompok yang terwakili lebih banyak dalam data\n- **Stale data** → AI tidak tahu peristiwa setelah tanggal cut-off training-nya\n- **Privacy** → Data personal bisa 'tersimpan' dalam model", "metadata": {}},
            {"id": "m4-d1", "type": "discussion", "content": "Data apa yang kamu hasilkan setiap hari? (media sosial, GPS, belanja online, pencarian) Menurutmu, apakah perusahaan berhak menggunakan data tersebut untuk melatih AI mereka?", "metadata": {}},
        ],
    },

    {
        "order": 5, "title": "AI dalam Kehidupan Sehari-hari & Dunia Kerja",
        "status": "published",
        "content_blocks": [
            {"id": "m5-h1", "type": "heading", "content": "AI Ada di Mana-Mana — Kamu Mungkin Tidak Menyadarinya", "metadata": {}},
            {"id": "m5-t1", "type": "text", "content": "Setiap hari kamu berinteraksi dengan AI:\n- **Feed media sosial** — TikTok/Instagram memilih konten untukmu\n- **Email** — Filter spam Gmail memblokir 99.9% spam\n- **Maps** — Google Maps memprediksi kemacetan real-time\n- **Streaming** — Netflix/Spotify rekomendasi konten personal\n- **Perbankan** — Deteksi fraud saat transaksi mencurigakan", "metadata": {}},
            {"id": "m5-t2", "type": "text", "content": "**AI di Industri:**\n- **Kesehatan** — AI mendeteksi kanker dari X-ray lebih akurat dari dokter di beberapa studi. AlphaFold memecahkan protein folding yang menghabiskan 50 tahun riset.\n- **Pertanian** — Drone AI memantau kondisi tanaman dan mengoptimalkan irigasi\n- **Hukum** — Review kontrak otomatis, riset hukum dalam menit\n\n**Dampak Pekerjaan (WEF 2024):**\n85 juta pekerjaan tergantikan — tapi 97 juta pekerjaan baru tercipta.\nKunci: bukan 'apakah AI menggantikanku?' tapi 'bagaimana aku lebih produktif dengan AI?'", "metadata": {}},
            {"id": "m5-d1", "type": "discussion", "content": "Bidang studi atau pekerjaan apa yang kamu tekuni? Bagaimana AI akan mengubahnya dalam 5 tahun ke depan? Ancaman atau peluang?", "metadata": {}},
        ],
    },

    # ═══ UNIT 2 — AI di Dunia Kerja & Industri ═══════════════════════════
    {
        "order": 6, "title": "Peta Profesi AI: Data Analyst, ML Engineer & Product Manager",
        "status": "published",
        "content_blocks": [
            {"id": "m6-h1", "type": "heading", "content": "Siapa yang Bekerja di Ekosistem AI?", "metadata": {}},
            {"id": "m6-t1", "type": "text", "content": "**Profesi Teknis:**\n- **Data Analyst** — Analisis data → insight bisnis. SQL, Python, Tableau. Gaji IDR: 8–25 juta/bln. Entry level friendly.\n- **Data Scientist** — Bangun model ML. Butuh statistik kuat. Gaji: 15–45 juta/bln.\n- **ML Engineer** — Deploy model ke production. Bridge data science–engineering. Gaji: 20–60 juta/bln.\n- **MLOps Engineer** — Kelola infrastruktur AI. Peran baru, sangat dibutuhkan. Gaji: 20–50 juta/bln.\n\n**Profesi Non-Teknis:**\n- **AI Product Manager** — Strategi & roadmap produk AI. Tidak perlu coding. Gaji: 20–60 juta/bln.\n- **Prompt Engineer** — Spesialis instruksi AI. Gaji global: USD 50k–150k.\n- **AI Ethicist** — Memastikan AI digunakan bertanggung jawab. Background hukum/filsafat relevan.\n- **AI Business Consultant** — Bantu perusahaan adopsi AI. Gaji: 25–80 juta/bln.", "metadata": {}},
            {"id": "m6-r1", "type": "resource", "content": "Cari lowongan AI terkini di Indonesia.", "metadata": {"title": "LinkedIn Jobs: AI & ML di Indonesia", "link": "https://www.linkedin.com/jobs/search/?keywords=AI+machine+learning&location=Indonesia"}},
            {"id": "m6-a1", "type": "assignment", "content": "**Tugas:** Cari 3 lowongan AI di LinkedIn atau Glints yang menarik minatmu. Untuk setiap lowongan catat: judul posisi, skill yang dibutuhkan, skill yang sudah kamu miliki vs. yang perlu dikembangkan. Bagikan temuanmu.", "metadata": {}},
        ],
    },

    {
        "order": 7, "title": "AI untuk Non-Teknis: Hukum, Kesehatan, Keuangan & Pendidikan",
        "status": "published",
        "content_blocks": [
            {"id": "m7-h1", "type": "heading", "content": "AI Bukan Hanya untuk Programmer", "metadata": {}},
            {"id": "m7-t1", "type": "text", "content": "Dampak terbesar AI justru terjadi di industri yang selama ini dianggap 'non-teknis'.\n\n**Hukum:** Harvey AI & CoCounsel mengubah riset hukum dari 10 jam jadi 30 menit. Review kontrak otomatis menandai klausul berisiko.\n\n**Kesehatan:** AI mendeteksi 50+ penyakit mata dari scan retina (Google DeepMind). Alodokter & Halodoc menggunakan AI untuk triase di daerah tanpa akses dokter.\n\n**Keuangan:** Robo-advisor (Bibit, Bareksa) merekomendasikan portofolio. Credit scoring AI untuk yang tidak punya riwayat perbankan. Deteksi fraud real-time.\n\n**Pendidikan:** Khanmigo (Khan Academy) menyesuaikan penjelasan dengan level siswa. Duolingo AI untuk percakapan bahasa personal.", "metadata": {}},
            {"id": "m7-d1", "type": "discussion", "content": "Pilih satu industri yang paling relevan denganmu. Bagikan satu contoh spesifik bagaimana AI mengubah cara kerja di sana. Ancaman atau kesempatan?", "metadata": {}},
        ],
    },

    {
        "order": 8, "title": "Etika AI: Bias, Privasi & Tanggung Jawab",
        "status": "published",
        "content_blocks": [
            {"id": "m8-h1", "type": "heading", "content": "AI yang Akurat Belum Tentu AI yang Baik", "metadata": {}},
            {"id": "m8-t1", "type": "text", "content": "**Bias Algoritma — Kasus Nyata:**\n- **COMPAS** (sistem AI pengadilan AS): 2× lebih sering salah label warga kulit hitam sebagai 'berisiko tinggi'\n- **Amazon Hiring AI** (2018): Dimatikan karena terbukti diskriminatif terhadap perempuan — dilatih dari data historis yang didominasi karyawan laki-laki\n\n**Sumber bias:** Historical bias, representation bias, measurement bias, aggregation bias.", "metadata": {}},
            {"id": "m8-t2", "type": "text", "content": "**Privasi & Deepfake:**\nAI bisa 'memorize' data training — termasuk informasi pribadi. Deepfake menciptakan video/audio palsu yang sangat meyakinkan: penipuan CEO palsu, disinformasi politik, pelecehan berbasis gambar.\n\n**Siapa yang Bertanggung Jawab?**\nPengembang? Perusahaan? Pengguna? AI itu sendiri tidak bisa dimintai pertanggungjawaban hukum.\n\n**Prinsip Responsible AI:** Fairness, Transparency, Accountability, Privacy, Safety.", "metadata": {}},
            {"id": "m8-d1", "type": "discussion", "content": "Bank menggunakan AI yang 90% akurat tapi cenderung menolak pemohon dari daerah tertentu. Siapa yang harus bertanggung jawab? Bagaimana seharusnya diselesaikan?", "metadata": {}},
        ],
    },

    {
        "order": 9, "title": "Regulasi AI Global & Indonesia (2024–2025)",
        "status": "published",
        "content_blocks": [
            {"id": "m9-h1", "type": "heading", "content": "Kerangka Hukum & Regulasi AI", "metadata": {}},
            {"id": "m9-t1", "type": "text", "content": "**EU AI Act (2024) — Regulasi AI Pertama di Dunia**\nPendekatan berbasis risiko:\n- **Dilarang total:** Social scoring, manipulasi bawah sadar, real-time biometric surveillance\n- **Regulasi ketat:** AI di infrastruktur kritis, rekrutmen, kredit, peradilan\n- **Transparansi:** Chatbot wajib mengungkap dirinya AI; deepfake wajib diberi label\nSanksi: hingga €35 juta atau 7% global annual turnover.\n\n**Indonesia:**\n- Strategi Nasional AI 2020–2045 (BRIN)\n- Panduan Etika AI Nasional (Kominfo, 2021)\n- **UU PDP 2022** — Perlindungan Data Pribadi, wajib dipahami jika membangun produk AI", "metadata": {}},
            {"id": "m9-r1", "type": "resource", "content": "Baca ringkasan resmi EU AI Act.", "metadata": {"title": "EU AI Act — Official Summary", "link": "https://artificialintelligenceact.eu/"}},
            {"id": "m9-d1", "type": "discussion", "content": "Menurutmu, regulasi ketat seperti EU AI Act — langkah tepat atau justru menghambat inovasi? Bagaimana keseimbangan ideal antara inovasi dan regulasi AI?", "metadata": {}},
        ],
    },

    {
        "order": 10, "title": "Membangun AI-Ready CV & Portfolio",
        "status": "published",
        "content_blocks": [
            {"id": "m10-h1", "type": "heading", "content": "Membangun Profil yang Menarik Rekruter AI", "metadata": {}},
            {"id": "m10-t1", "type": "text", "content": "**Hard Skills Paling Dicari (2025):** Python, SQL, prompt engineering, LLM API usage, tools (Hugging Face, LangChain, OpenClaw).\n\n**Soft Skills Sangat Dihargai:** Menjelaskan AI kepada non-teknis, critical thinking untuk output AI, AI ethics awareness, kemampuan belajar mandiri.\n\n**Portfolio AI:**\n- **Teknis:** Minimal 3 proyek GitHub dengan README jelas — masalah apa yang diselesaikan & bagaimana\n- **Non-teknis:** Case study penggunaan AI di pekerjaan nyata, blog/artikel tentang AI, dokumentasi workflow\n\n**Capstone project kursus ini (Modul 24)** adalah item portfolio pertama yang langsung bisa ditampilkan.", "metadata": {}},
            {"id": "m10-a1", "type": "assignment", "content": "**Tugas: Audit CV-mu**\nBuka CV atau profil LinkedIn-mu. Tulis ulang minimal satu bullet point pengalaman dengan menambahkan dimensi AI.\n\nContoh sebelum: 'Membuat laporan keuangan bulanan'\nContoh sesudah: 'Mengotomatisasi laporan keuangan bulanan dengan Excel + ChatGPT, mengurangi waktu dari 4 jam ke 30 menit'\n\nBagikan versi sebelum dan sesudah di forum.", "metadata": {}},
        ],
    },

    # ═══ UNIT 3 — Menggunakan AI Secara Produktif ════════════════════════
    {
        "order": 11, "title": "Alat-Alat AI Wajib: ChatGPT, Gemini, Claude & Perplexity",
        "status": "published",
        "content_blocks": [
            {"id": "m11-h1", "type": "heading", "content": "AI Tools Landscape 2025", "metadata": {}},
            {"id": "m11-t1", "type": "text", "content": "Daripada mencoba semua tools, kuasai beberapa kunci dan pahami kapan menggunakan yang mana:\n\n**ChatGPT (OpenAI)** — Terbaik untuk penulisan kreatif, coding, brainstorming. DALL-E 3 terintegrasi.\n**Claude (Anthropic)** — Terbaik untuk analisis dokumen panjang, nuansa, dan ketelitian. Context window 200K token.\n**Gemini (Google)** — Terbaik untuk riset dengan sumber terkini. Terintegrasi Gmail & Docs.\n**Perplexity AI** — Terbaik untuk riset dengan sumber terverifikasi. Setiap klaim ada link sumbernya.\n\n**Tools Spesialis:**\n- GitHub Copilot & Cursor AI (kode), Notion AI & Otter.ai (produktivitas), Gamma (presentasi), Midjourney & Canva AI (visual)", "metadata": {}},
            {"id": "m11-a1", "type": "assignment", "content": "**Tugas: AI Tool Comparison**\nMasukkan pertanyaan yang SAMA ke ChatGPT, Claude, dan Perplexity. Bandingkan: mana paling berguna, akurat, dan mudah dibaca? Bagikan hasil perbandinganmu.", "metadata": {}},
        ],
    },

    {
        "order": 12, "title": "Prompt Engineering Dasar: Memberi Instruksi yang Tepat",
        "status": "published",
        "content_blocks": [
            {"id": "m12-h1", "type": "heading", "content": "Seni Berkomunikasi dengan AI", "metadata": {}},
            {"id": "m12-t1", "type": "text", "content": "Kualitas output AI sangat ditentukan kualitas inputmu. Bayangkan AI sebagai asisten baru yang sangat cerdas tapi tidak tahu konteks pekerjaanmu — semakin lengkap instruksimu, semakin baik hasilnya.\n\n**Anatomi prompt yang baik:** Role/Persona · Context · Task · Format · Constraints\n\n**Teknik-teknik prompt:**\n- **Zero-Shot** — Langsung minta tanpa contoh\n- **Few-Shot** — Beri 2–3 contoh untuk konsistensi format\n- **Chain-of-Thought (CoT)** — Tambahkan 'Think step by step' untuk masalah kompleks\n- **Role Prompting** — 'Kamu adalah [peran spesifik]...'\n- **Iterative Refinement** — Perbaiki dengan 'Buat lebih singkat', 'Fokus ke X'", "metadata": {}},
            {"id": "m12-t2", "type": "text", "content": "**Contoh Prompt — Sebelum vs Sesudah:**\n\n❌ Buruk: \"Tulis email ke klien\"\n\n✅ Baik: \"Kamu adalah manajer proyek senior. Tulis email profesional ke PT Maju Jaya memberitahu bahwa deadline website mundur 2 minggu karena masalah integrasi API. Tone: profesional tapi empatik. Maksimal 150 kata. Sertakan: permintaan maaf, alasan teknis singkat, jadwal baru, komitmen update reguler.\"\n\n❌ Buruk CoT: \"Berapa 1.234 × 5.678?\"\n✅ Baik CoT: \"Berapa 1.234 × 5.678? Jelaskan langkah penghitunganmu.\"", "metadata": {}},
            {"id": "m12-a1", "type": "assignment", "content": "**Tugas: Bangun Prompt Library**\nBuat 5 prompt untuk bidang studimu. Untuk setiap prompt: tulis versi pertama → uji → perbaiki dengan role/context/format → catat perbedaan hasilnya. Bagikan prompt terbaikmu di forum.", "metadata": {}},
        ],
    },

    {
        "order": 13, "title": "AI untuk Riset & Penulisan Akademik",
        "status": "published",
        "content_blocks": [
            {"id": "m13-h1", "type": "heading", "content": "AI sebagai Asisten Akademik yang Bertanggung Jawab", "metadata": {}},
            {"id": "m13-t1", "type": "text", "content": "**Tools Riset AI:**\n- **Perplexity AI** — Search dengan sumber terverifikasi. Ideal menjelajahi topik baru.\n- **Elicit** — Dirancang untuk riset akademik. Cari paper, ekstrak metodologi, bandingkan temuan.\n- **Consensus** — Mengagregasi temuan dari paper ilmiah. Cocok untuk pertanyaan 'Apakah X efektif?'\n\n**Cara penggunaan benar:** Gunakan AI untuk menemukan paper → baca aslinya → verifikasi klaim dari sumber primer.\n\n**PERINGATAN — Hallusinasi AI:** AI sering membuat referensi palsu. Seorang pengacara AS mendapat sanksi pengadilan karena mengutip 6 kasus palsu yang dibuat ChatGPT. **Aturan emas:** Jangan kutip referensi AI tanpa verifikasi langsung di Google Scholar atau PubMed.", "metadata": {}},
            {"id": "m13-t2", "type": "text", "content": "**Cara Menyitasi AI (APA 7th):**\nOpenAI. (2024). ChatGPT (GPT-4o) [Large language model]. https://chat.openai.com\n\nDalam catatan metodologi: 'Penulis menggunakan ChatGPT (GPT-4o, OpenAI, 2024) untuk membantu struktur awal draft, yang kemudian diedit dan diverifikasi sepenuhnya oleh penulis.'\n\nKamu tetap bertanggung jawab atas setiap klaim — AI bukan tameng untuk informasi salah.", "metadata": {}},
            {"id": "m13-a1", "type": "assignment", "content": "**Tugas: Riset Topik dengan AI**\nGunakan Perplexity dan Elicit untuk menemukan 3 paper tentang topik bidang studimu. Verifikasi di Google Scholar, baca abstraknya. Bandingkan: seberapa akurat ringkasan AI vs. isi asli abstrak?", "metadata": {}},
        ],
    },

    {
        "order": 14, "title": "AI untuk Desain, Gambar & Konten Visual",
        "status": "published",
        "content_blocks": [
            {"id": "m14-h1", "type": "heading", "content": "AI Kreatif: Demokratisasi Desain", "metadata": {}},
            {"id": "m14-t1", "type": "text", "content": "**Generasi Gambar:**\n- **Midjourney** — Kualitas artistik terbaik. Gunakan di Discord dengan `/imagine [deskripsi] --ar 16:9 --v 6.1`\n- **DALL-E 3** (via ChatGPT) — Paling mudah, memahami natural language. Gratis.\n- **Canva AI** — Ideal untuk konten marketing & presentasi, template siap pakai, Bahasa Indonesia\n- **Adobe Firefly** — Aman untuk komersial, dilatih konten berlisensi\n\n**Video & Presentasi:**\n- **Gamma.app** — Presentasi dari outline teks dalam menit\n- **HeyGen** — Video avatar AI dari teks, multi-bahasa termasuk Indonesia\n- **Runway ML** — Edit video: hapus objek, ubah background, generate video dari teks", "metadata": {}},
            {"id": "m14-a1", "type": "assignment", "content": "**Tugas:** Buat 3 gambar dengan DALL-E 3 (gratis via ChatGPT) atau satu slide dengan Gamma.app untuk topik yang sedang kamu kerjakan. Bagikan hasilnya beserta prompt yang kamu gunakan dan apa yang berhasil/tidak.", "metadata": {}},
        ],
    },

    {
        "order": 15, "title": "Membangun Workflow AI Pribadi",
        "status": "published",
        "content_blocks": [
            {"id": "m15-h1", "type": "heading", "content": "Dari Pengguna AI ke Arsitek Produktivitas", "metadata": {}},
            {"id": "m15-t1", "type": "text", "content": "**Platform Otomatisasi No-Code:**\n- **Zapier** — 6.000+ integrasi aplikasi. Free tier tersedia. Paling populer.\n- **Make.com** — Lebih powerful & visual, harga kompetitif.\n- **n8n** — Open-source, self-hostable, gratis, privasi lebih terjaga.\n\n**Contoh Workflow yang Langsung Bisa Dipakai:**\n\n1. **Research Monitor** — Google Alert → ChatGPT ringkasan → Kirim ke Slack/WhatsApp. Setup 30 menit, hemat 2–3 jam/minggu.\n\n2. **Meeting Notes Automator** — Rekaman Zoom → Otter.ai transkripsi → AI ekstrak action items → Email ke semua peserta.\n\n3. **Content Repurposing** — Posting blog baru → AI buat Twitter thread + LinkedIn post + Instagram caption → Dijadwalkan via Buffer.", "metadata": {}},
            {"id": "m15-a1", "type": "assignment", "content": "**Tugas: Rancang Workflow AI Pribadimu**\nIdentifikasi satu tugas berulang yang menyita waktumu. Rancang workflow:\n1. Masalah & waktu yang terbuang per minggu\n2. Trigger pemula workflow\n3. Langkah-langkah otomasi\n4. Output akhir\n5. Tools yang akan digunakan\n\nJika memungkinkan, implementasikan dengan Zapier free tier.", "metadata": {}},
        ],
    },

    # ═══ UNIT 4 — Agentic AI: Sub-Modul Eksklusif ════════════════════════
    {
        "order": 16, "title": "Apa Itu Agentic AI? Dari Chatbot ke AI Agent",
        "status": "published",
        "content_blocks": [
            {"id": "m16-h1", "type": "heading", "content": "Era Baru: AI yang Bertindak Sendiri", "metadata": {}},
            {"id": "m16-t1", "type": "text", "content": "**Chatbot vs AI Agent — Perbedaan Kunci:**\n\n| Aspek | Chatbot | AI Agent |\n|-------|---------|----------|\n| Interaksi | Reaktif, turn-by-turn | Proaktif, multi-langkah |\n| Memori | Per sesi | Persistent |\n| Tools | Tidak ada | Web, kode, API, file, email |\n| Tujuan | Menjawab satu pertanyaan | Menyelesaikan satu misi |\n\n**Analogi:** Chatbot = konsultan yang menjawab pertanyaanmu di telepon. AI Agent = karyawan yang diberi proyek — merencanakan, riset, eksekusi, lapor tanpa kamu pandu setiap langkahnya.", "metadata": {}},
            {"id": "m16-t2", "type": "text", "content": "**Arsitektur Dasar AI Agent:**\n1. **LLM Core** — Otak: reasoning & keputusan (GPT-4, Claude, atau open-source)\n2. **Planning Module** — Memecah goal besar jadi sub-tasks (ReAct, Plan-and-Execute)\n3. **Memory** — Short-term (konteks saat ini), Long-term (database), Episodic (riwayat)\n4. **Tool Registry** — Browser, Python interpreter, file system, API calls, email\n\n**Contoh agent nyata:** Devin (coding agent oleh Cognition AI), AutoGPT, dan OpenClaw yang akan kita pelajari di modul berikutnya.", "metadata": {}},
            {"id": "m16-d1", "type": "discussion", "content": "Bayangkan kamu punya AI Agent dengan akses penuh ke internet, email, dan kalendermu. Tugas apa yang pertama kali ingin kamu delegasikan? Adakah hal yang tidak akan kamu delegasikan? Mengapa?", "metadata": {}},
        ],
    },

    {
        "order": 17, "title": "Pengenalan OpenClaw: Arsitektur & Cara Kerjanya",
        "status": "published",
        "content_blocks": [
            {"id": "m17-h1", "type": "heading", "content": "Mengenal OpenClaw Framework", "metadata": {}},
            {"id": "m17-t1", "type": "text", "content": "**OpenClaw** adalah framework Python open-source untuk membangun AI Agent dengan pendekatan modular. Filosofinya: agent yang powerful seharusnya mudah dibangun oleh siapa saja — bukan hanya peneliti AI.\n\n**Tiga Pilar Arsitektur OpenClaw:**\n- **Orchestrator** — Otak agent: menerima goal, membuat rencana, memutuskan tool apa yang digunakan\n- **Memory Store** — Menyimpan short-term context dan long-term knowledge (vector database)\n- **Tool Registry** — Katalog tools yang bisa digunakan: WebSearch, CodeRunner, FileReader, APICall, EmailSender\n\n**Perbandingan Framework:**\n| | OpenClaw | LangChain | CrewAI |\n|--|---------|-----------|--------|\n| Kurva belajar | Rendah | Sedang | Sedang |\n| Multi-agent | ✓ | ✓ | ✓ (fokus) |\n| Memory bawaan | ✓ | Plugin | ✓ |\n| Deployment | Built-in | Manual | Manual |", "metadata": {}},
            {"id": "m17-t2", "type": "text", "content": "**Struktur Dasar OpenClaw Agent:**\n\n```python\nfrom openclaw import Agent, Tool, Memory\n\n# Definisikan tools yang bisa digunakan agent\n@tool\ndef search_web(query: str) -> str:\n    \"\"\"Cari informasi terkini dari internet.\"\"\"\n    # implementasi di-inject otomatis oleh OpenClaw\n    ...\n\n@tool\ndef read_file(path: str) -> str:\n    \"\"\"Baca isi file dari disk.\"\"\"\n    ...\n\n# Buat agent\nagent = Agent(\n    name=\"ResearchAssistant\",\n    model=\"gpt-4o\",           # atau \"claude-3-5-sonnet\"\n    memory=Memory(type=\"short_term\"),\n    tools=[search_web, read_file],\n    system_prompt=\"Kamu adalah asisten riset yang teliti dan selalu menyertakan sumber.\"\n)\n\n# Jalankan dengan satu goal\nresult = agent.run(\n    \"Cari 3 artikel terbaru tentang AI dalam pendidikan Indonesia \"\n    \"dan buat ringkasan komprehensif dengan kutipan langsung.\"\n)\nprint(result)\n```\n\nAgent akan otomatis merencanakan langkah, memanggil `search_web` beberapa kali, mengagregasi hasil, dan menghasilkan laporan.", "metadata": {}},
            {"id": "m17-r1", "type": "resource", "content": "Dokumentasi resmi OpenClaw Framework.", "metadata": {"title": "OpenClaw Documentation", "link": "https://openclaw.dev/docs"}},
        ],
    },

    {
        "order": 18, "title": "Hands-on OpenClaw: Membuat Agent Pertamamu",
        "status": "published",
        "content_blocks": [
            {"id": "m18-h1", "type": "heading", "content": "Membangun Research Assistant Agent dari Nol", "metadata": {}},
            {"id": "m18-t1", "type": "text", "content": "**Prerequisites:**\n- Python 3.10+\n- Akun OpenAI atau Anthropic (untuk API key)\n- Terminal / command prompt\n\n**Step 1: Setup Environment**\n```bash\n# Buat virtual environment\npython -m venv .venv\n\n# Aktifkan (Windows)\n.venv\\Scripts\\activate\n\n# Aktifkan (macOS/Linux)\nsource .venv/bin/activate\n\n# Install OpenClaw\npip install openclaw python-dotenv\n```\n\n**Step 2: Konfigurasi API Key**\n```bash\n# Buat file .env di root project\necho \"OPENAI_API_KEY=sk-your-key-here\" > .env\n```", "metadata": {}},
            {"id": "m18-t2", "type": "text", "content": "**Step 3: Buat Agent Pertamamu**\n\n```python\n# agent.py\nfrom openclaw import Agent, tool, Memory\nfrom dotenv import load_dotenv\nimport os\n\nload_dotenv()\n\n@tool\ndef search_web(query: str) -> str:\n    \"\"\"Cari informasi dari internet berdasarkan query.\"\"\"\n    # OpenClaw menyediakan implementasi default via Bing/DuckDuckGo\n    pass\n\n@tool\ndef summarize_text(text: str, max_words: int = 150) -> str:\n    \"\"\"Buat ringkasan teks dalam jumlah kata yang ditentukan.\"\"\"\n    pass\n\nagent = Agent(\n    name=\"StudyAssistant\",\n    model=\"gpt-4o-mini\",  # hemat biaya untuk latihan\n    memory=Memory(type=\"short_term\"),\n    tools=[search_web, summarize_text],\n    system_prompt=(\n        \"Kamu adalah asisten belajar yang membantu mahasiswa. \"\n        \"Selalu sertakan sumber untuk setiap informasi yang kamu berikan. \"\n        \"Gunakan Bahasa Indonesia.\"\n    )\n)\n\nif __name__ == \"__main__\":\n    goal = input(\"Apa yang ingin kamu pelajari? \")\n    result = agent.run(goal)\n    print(\"\\n--- HASIL ---\")\n    print(result)\n```\n\n```bash\n# Jalankan agent\npython agent.py\n```", "metadata": {}},
            {"id": "m18-a1", "type": "assignment", "content": "**Tugas: Bangun & Kustomisasi Agentmu**\n1. Setup environment dan install OpenClaw\n2. Jalankan kode di atas dan pastikan berjalan\n3. Tambahkan minimal 1 tool baru yang relevan dengan bidang studimu (contoh: `read_pdf`, `translate_text`, `check_grammar`)\n4. Ubah system_prompt agar agent lebih spesifik untuk kebutuhanmu\n5. Screenshot atau record sesi penggunaan dan bagikan di forum\n\nBantuan: Jika ada error, paste pesan error di forum — komunitas akan bantu!", "metadata": {}},
        ],
    },

    {
        "order": 19, "title": "Deploy AI Agent-mu: Railway + Hostinger",
        "status": "published",
        "content_blocks": [
            {"id": "m19-h1", "type": "heading", "content": "Dari Localhost ke Publik: Mempublikasikan Agent-mu", "metadata": {}},
            {"id": "m19-t1", "type": "text", "content": "**Perbandingan Opsi Deployment:**\n\n| Platform | Biaya | Kemudahan | Cocok untuk |\n|----------|-------|-----------|-------------|\n| **Railway** | Gratis ($5 credit/bln) | ★★★★★ | Demo & development |\n| **Render** | Gratis (sleep after 15 min) | ★★★★☆ | Lightweight agent |\n| **HuggingFace Spaces** | Gratis | ★★★★☆ | Model demo |\n| **Hostinger VPS** | ~Rp 50k/bln | ★★★☆☆ | Production + custom domain |\n\n**Rekomendasi untuk pemula:** Railway untuk deployment cepat, kemudian tambahkan custom domain dari Hostinger.", "metadata": {}},
            {"id": "m19-t2", "type": "text", "content": "**Step-by-Step: Deploy ke Railway**\n\n```bash\n# 1. Install Railway CLI\nnpm install -g @railway/cli\n# atau download dari railway.app\n\n# 2. Login\nrailway login\n\n# 3. Buat project baru\nrailway init\n\n# 4. Tambahkan Procfile di root project\necho \"web: python api.py\" > Procfile\n```\n\n```python\n# api.py — wrap agent dalam simple Flask/FastAPI server\nfrom flask import Flask, request, jsonify\nfrom agent import agent\n\napp = Flask(__name__)\n\n@app.route(\"/run\", methods=[\"POST\"])\ndef run_agent():\n    goal = request.json.get(\"goal\", \"\")\n    if not goal:\n        return jsonify({\"error\": \"goal is required\"}), 400\n    result = agent.run(goal)\n    return jsonify({\"result\": result})\n\nif __name__ == \"__main__\":\n    import os\n    port = int(os.environ.get(\"PORT\", 5000))\n    app.run(host=\"0.0.0.0\", port=port)\n```\n\n```bash\n# 5. Set environment variables di Railway dashboard\n# OPENAI_API_KEY = sk-your-key\n\n# 6. Deploy\nrailway up\n\n# Railway akan memberi URL: https://your-agent.railway.app\n```", "metadata": {}},
            {"id": "m19-t3", "type": "text", "content": "**Menambahkan Custom Domain dari Hostinger:**\n\n1. Beli domain di Hostinger (mulai ~Rp 15k/tahun untuk .my.id)\n2. Buka Railway dashboard → Settings → Domains → Add Custom Domain\n3. Railway akan memberi CNAME record\n4. Di Hostinger hPanel → DNS Zone → Tambah CNAME record:\n   - Name: `agent` (untuk agent.namamu.my.id)\n   - Points to: `your-agent.railway.app`\n5. Tunggu propagasi DNS 15–60 menit\n\nSetelah selesai, agentmu bisa diakses via: `https://agent.namamu.my.id/run`", "metadata": {}},
            {"id": "m19-a1", "type": "assignment", "content": "**Tugas: Deploy Agent-mu**\n1. Buat file api.py yang membungkus agent dari Modul 18 dalam Flask server\n2. Deploy ke Railway (gunakan free tier)\n3. Test dengan mengirim POST request ke endpoint /run\n4. (Opsional) Tambahkan custom domain dari Hostinger\n\nBagikan URL agent publik-mu di forum. Kita akan saling mencoba agent satu sama lain!", "metadata": {}},
        ],
    },

    {
        "order": 20, "title": "Studi Kasus: AI Agent untuk Bisnis & Kehidupan Kampus",
        "status": "published",
        "content_blocks": [
            {"id": "m20-h1", "type": "heading", "content": "AI Agent di Dunia Nyata", "metadata": {}},
            {"id": "m20-t1", "type": "text", "content": "**Studi Kasus 1: Customer Service Agent untuk UMKM**\nSebuah toko online batik di Solo menggunakan OpenClaw agent untuk menangani pertanyaan pelanggan 24/7. Agent memiliki akses ke katalog produk, stok, dan status pengiriman.\nHasil: Waktu respons dari rata-rata 4 jam ke <5 menit. Penjualan meningkat 23% dari perbaikan customer experience.\n\n**Studi Kasus 2: Research Agent untuk Mahasiswa S2**\nMahasiswa teknik lingkungan di IPB membangun agent yang secara otomatis memantau jurnal terbaru, mengirim ringkasan mingguan ke email, dan menyiapkan draft literature review.\nHasil: Waktu literature review dari 3 minggu ke 3 hari.\n\n**Studi Kasus 3: Personal Productivity Agent**\nStaff HR di Jakarta menggunakan agent yang terhubung ke Google Calendar, email, dan spreadsheet untuk otomatis menjadwalkan interview, mengirim reminder, dan mengupdate database kandidat.\nHasil: 4 jam pekerjaan administratif per minggu tereduksi menjadi 30 menit.", "metadata": {}},
            {"id": "m20-d1", "type": "discussion", "content": "Berdasarkan studi kasus di atas dan pengalamanmu membangun agent di Modul 18–19, rancang mini-proposal untuk satu AI Agent yang bisa memecahkan masalah nyata di lingkunganmu (kampus, pekerjaan, komunitas). Apa masalahnya? Apa yang dilakukan agent? Apa tools yang dibutuhkan? Bagikan proposalmu!", "metadata": {}},
        ],
    },

    # ═══ UNIT 5 — Persiapan Karier & Capstone ════════════════════════════
    {
        "order": 21, "title": "Roadmap Karier AI 2025: Jalur Teknis vs Non-Teknis",
        "status": "published",
        "content_blocks": [
            {"id": "m21-h1", "type": "heading", "content": "Menentukan Jalur Kariermu di Dunia AI", "metadata": {}},
            {"id": "m21-t1", "type": "text", "content": "**Jalur Teknis — 90 Hari Pertama:**\n- Bulan 1: Python dasar + SQL (freeCodeCamp, Kaggle Learn)\n- Bulan 2: Machine Learning dengan scikit-learn (Kaggle Courses)\n- Bulan 3: Proyek nyata → upload ke GitHub → mulai apply\n- Target peran: Junior Data Analyst, ML Engineer Intern\n\n**Jalur Non-Teknis — 90 Hari Pertama:**\n- Bulan 1: Kuasai 3 AI tools utama + prompt engineering lanjutan\n- Bulan 2: Bangun case study konkret di industri yang kamu minati\n- Bulan 3: Tulis 3 artikel atau proyek yang menunjukkan AI literacy\n- Target peran: AI Product Manager, AI Business Analyst, Prompt Engineer", "metadata": {}},
            {"id": "m21-r1", "type": "resource", "content": "Roadmap komprehensif untuk AI & Data Science.", "metadata": {"title": "roadmap.sh — AI & Data Science Learning Path", "link": "https://roadmap.sh/ai-data-scientist"}},
            {"id": "m21-a1", "type": "assignment", "content": "**Tugas: Buat 90-Day Learning Plan**\nPilih jalur kariermu (teknis atau non-teknis). Buat rencana belajar 90 hari yang spesifik:\n- Minggu 1–4: [resources dan target]\n- Minggu 5–8: [proyek yang akan dibuat]\n- Minggu 9–12: [persiapan apply dan networking]\n\nBagikan rencanamu dan minta feedback dari komunitas.", "metadata": {}},
        ],
    },

    {
        "order": 22, "title": "Persiapan Wawancara: Pertanyaan AI yang Sering Muncul",
        "status": "published",
        "content_blocks": [
            {"id": "m22-h1", "type": "heading", "content": "Ace Your AI Job Interview", "metadata": {}},
            {"id": "m22-t1", "type": "text", "content": "**Pertanyaan Konseptual yang Sering Muncul:**\n1. 'Jelaskan perbedaan Machine Learning dan Deep Learning'\n2. 'Apa itu overfitting dan bagaimana cara mengatasinya?'\n3. 'Bagaimana cara kerja Transformer architecture?'\n4. 'Apa kelebihan dan kekurangan LLM dibanding ML tradisional?'\n5. 'Bagaimana kamu mengevaluasi kualitas model AI?'\n\n**Pertanyaan Behavioral/Situasional:**\n1. 'Ceritakan bagaimana kamu menggunakan AI untuk menyelesaikan masalah nyata'\n2. 'Bagaimana kamu memastikan AI yang kamu bangun/gunakan tidak bias?'\n3. 'Bagaimana kamu menjelaskan AI kepada stakeholder non-teknis?'\n4. 'Apa yang kamu lakukan ketika AI memberikan output yang salah?'\n5. 'Bagaimana kamu mengikuti perkembangan AI yang sangat cepat?'", "metadata": {}},
            {"id": "m22-t2", "type": "text", "content": "**Framework Menjawab: STAR Method untuk AI**\n- **S**ituation — Konteks masalah\n- **T**ask — Tugasmu dalam situasi itu\n- **A**ction — Apa yang kamu lakukan (spesifik tool/teknik AI)\n- **R**esult — Hasil terukur (%, waktu, biaya)\n\n**Contoh jawaban kuat:**\n'Di internship saya, saya ditugaskan menurunkan waktu customer service response (S+T). Saya membangun chatbot sederhana dengan OpenClaw yang menjawab 80% pertanyaan umum secara otomatis (A). Hasilnya, waktu respons rata-rata turun dari 2 jam ke 5 menit dan kepuasan pelanggan naik 15% dalam 1 bulan (R).'", "metadata": {}},
            {"id": "m22-a1", "type": "assignment", "content": "**Tugas: Persiapan Wawancara**\nPilih 5 pertanyaan dari daftar di atas yang paling relevan dengan target peranmu. Tulis jawaban lengkap menggunakan framework STAR. Minta partner atau AI untuk memberikan feedback. Lakukan mock interview dengan teman satu kelas.", "metadata": {}},
        ],
    },

    {
        "order": 23, "title": "Membangun GitHub & Portofolio AI Publik",
        "status": "published",
        "content_blocks": [
            {"id": "m23-h1", "type": "heading", "content": "Showcase Your AI Skills", "metadata": {}},
            {"id": "m23-t1", "type": "text", "content": "**Setup GitHub yang Profesional:**\n1. Foto profil yang jelas dan profesional\n2. Bio yang mencantumkan skill utama dan topik minat\n3. README profil (file README.md di repo bernama sama dengan username-mu)\n4. Pin 6 proyek terbaik\n5. Contribute activity (kotak hijau) — konsistensi lebih penting dari volume\n\n**Proyek AI yang Menarik Rekruter:**\n- Agent sederhana dengan use case nyata (Modul 18 & 19 kursus ini!)\n- Notebook analisis data yang menceritakan sebuah insight\n- Aplikasi kecil yang menggunakan LLM API\n- Prompt library yang terdokumentasi\n- Kontribusi ke proyek open-source", "metadata": {}},
            {"id": "m23-t2", "type": "text", "content": "**Template README yang Baik:**\n```markdown\n# Nama Proyek\n\n## Masalah yang Diselesaikan\n[Satu paragraf: masalah apa, mengapa penting, siapa yang terdampak]\n\n## Solusi\n[Bagaimana kamu menyelesaikannya, teknologi/AI yang digunakan]\n\n## Demo\n[Screenshot atau GIF atau link ke deployment]\n\n## Cara Menjalankan\n```bash\npip install -r requirements.txt\npython main.py\n```\n\n## Hasil\n[Metrik atau proof of concept]\n\n## Pelajaran yang Dipetik\n[Jujur tentang apa yang berjalan dan tidak berjalan]\n```", "metadata": {}},
            {"id": "m23-a1", "type": "assignment", "content": "**Tugas: Bangun atau Update GitHub Profile-mu**\n1. Buat/update profil GitHub dengan foto, bio, dan skill\n2. Buat file README.md untuk proyek agent dari Modul 18\n3. (Opsional) Buat profile README yang menarik\n4. Bagikan link GitHub-mu di forum — kita akan saling review!", "metadata": {}},
        ],
    },

    {
        "order": 24, "title": "Capstone Project: Presentasi & Refleksi Akhir",
        "status": "published",
        "content_blocks": [
            {"id": "m24-h1", "type": "heading", "content": "Proyek Akhir: Demonstrasikan Kemampuanmu", "metadata": {}},
            {"id": "m24-t1", "type": "text", "content": "Selamat — kamu telah menyelesaikan 24 modul perjalanan AI selama 30 jam. Capstone project adalah kesempatan untuk mengintegrasikan semua yang telah kamu pelajari menjadi bukti kompetensi nyata yang bisa ditunjukkan kepada siapa saja.\n\n**Persyaratan Capstone Project:**\nBangun dan dokumentasikan sebuah solusi AI untuk masalah nyata yang kamu hadapi — baik di kampus, pekerjaan, komunitas, atau kehidupan pribadi.\n\n**Solusi dapat berupa:**\n- AI Agent dengan OpenClaw (direkomendasikan)\n- Workflow otomasi dengan Zapier/Make yang menggunakan AI\n- Aplikasi yang memanfaatkan LLM API\n- Sistem prompt yang terdokumentasi untuk use case profesional\n- Analisis data + visualisasi dengan insight bermakna", "metadata": {}},
            {"id": "m24-t2", "type": "text", "content": "**Kriteria Penilaian:**\n\n✓ **Relevansi Masalah (25%)** — Seberapa nyata dan penting masalah yang diselesaikan?\n\n✓ **Penggunaan AI yang Tepat (25%)** — Apakah solusi AI yang dipilih sesuai dengan masalah? Ada justifikasi yang jelas?\n\n✓ **Implementasi & Dokumentasi (25%)** — Apakah solusi bisa dijalankan? README atau dokumentasi yang jelas?\n\n✓ **Refleksi & Pembelajaran (25%)** — Apa yang berhasil? Apa yang tidak? Apa yang akan kamu lakukan berbeda?\n\n**Format Submisi:**\n- Link GitHub repo (wajib)\n- Video demo 3–5 menit (rekam screen + narasi)\n- Tulisan refleksi 300–500 kata", "metadata": {}},
            {"id": "m24-a1", "type": "assignment", "content": "**CAPSTONE PROJECT — Submisi Akhir**\n\nDeadline: Sesuai jadwal kohort.\n\nCara submit:\n1. Upload semua file ke GitHub\n2. Record video demo (bisa pakai Loom atau OBS gratis)\n3. Tulis refleksi di forum diskusi ini — ceritakan perjalanan belajarmu\n4. Beri feedback konstruktif ke minimal 2 capstone project teman sekelas\n\nSetelah lulus, sertifikat penyelesaian kursus akan diterbitkan secara otomatis. Selamat belajar dan selamat berkarier di era AI! 🎉", "metadata": {}},
            {"id": "m24-d1", "type": "discussion", "content": "Kursus ini hampir selesai. Bagikan:\n1. Satu hal paling berharga yang kamu pelajari\n2. Satu hal yang ingin kamu eksplorasi lebih lanjut\n3. Satu cara konkret kamu akan menggunakan AI dalam 30 hari ke depan\n\nTag teman yang kamu undang untuk bergabung kursus ini!", "metadata": {}},
        ],
    },

]


def seed_ai_fundamentals_content(db: Session, force: bool = False) -> None:
    """Create Course SQL row + CourseModule rows for AI Fundamentals for Everyone."""
    existing_course = (
        db.query(models.Course).filter(models.Course.title == COURSE_TITLE).first()
    )
    if existing_course and not force:
        print(f"  [AI Fundamentals] Course already seeded (id={existing_course.id}). Skipping.")
        return

    if not existing_course:
        existing_course = models.Course(
            title=COURSE_TITLE,
            instructor="Prof. Mats",
            org="UID",
            image="/assets/courses/ai-fundamentals-thumb.png",
            tag="Featured",
            level="Beginner",
            category="Data & AI",
            description="Kursus komprehensif 30 jam untuk mempersiapkan karier di era AI.",
            duration="30 Hours",
            rating=4.9,
            students_count="0",
            approval_status="published",
        )
        db.add(existing_course)
        db.commit()
        db.refresh(existing_course)
        print(f"  [AI Fundamentals] Course created (id={existing_course.id})")
    elif force:
        # Update existing course metadata
        existing_course.instructor = "Prof. Mats"
        existing_course.org = "UID"
        db.commit()
        print(f"  [AI Fundamentals] Course updated (id={existing_course.id})")

    existing_modules_count = (
        db.query(models.CourseModule)
        .filter(models.CourseModule.course_id == existing_course.id)
        .count()
    )
    if existing_modules_count >= len(AI_FUNDAMENTALS_MODULES) and not force:
        print(f"  [AI Fundamentals] {existing_modules_count} modules already seeded. Skipping.")
        return

    if force:
        db.query(models.CourseModule).filter(
            models.CourseModule.course_id == existing_course.id
        ).delete()
        db.commit()

    for m in AI_FUNDAMENTALS_MODULES:
        mod = models.CourseModule(
            course_id=existing_course.id,
            title=m["title"],
            order=m["order"],
            content_blocks=m["content_blocks"],
            status=m.get("status", "published"),
        )
        db.add(mod)

    db.commit()
    print(f"  [AI Fundamentals] Seeded {len(AI_FUNDAMENTALS_MODULES)} modules.")
