import { MaterialData } from '../types';

// High-fidelity SVG graphics for presentation slides
const SVG_QUANTUM_HERO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300" width="100%" height="100%">
  <defs>
    <linearGradient id="qGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#818cf8" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#c084fc" stop-opacity="0.9"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <circle cx="250" cy="150" r="90" fill="none" stroke="url(#qGrad)" stroke-width="3" stroke-dasharray="8 6" opacity="0.7"/>
  <circle cx="250" cy="150" r="50" fill="#0f172a" stroke="#38bdf8" stroke-width="2" filter="url(#glow)"/>
  <!-- Orbiting Electron / Qubit nodes -->
  <ellipse cx="250" cy="150" rx="140" ry="60" fill="none" stroke="#6366f1" stroke-width="1.5" transform="rotate(-30 250 150)"/>
  <ellipse cx="250" cy="150" rx="140" ry="60" fill="none" stroke="#38bdf8" stroke-width="1.5" transform="rotate(30 250 150)"/>
  <circle cx="160" cy="100" r="8" fill="#38bdf8" filter="url(#glow)"/>
  <circle cx="340" cy="200" r="8" fill="#f43f5e" filter="url(#glow)"/>
  <circle cx="250" cy="150" r="18" fill="url(#qGrad)"/>
  <text x="250" y="156" fill="#ffffff" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle">|ψ⟩</text>
  <text x="250" y="270" fill="#94a3b8" font-size="12" font-family="monospace" text-anchor="middle">Quantum Superposition State |ψ⟩ = α|0⟩ + β|1⟩</text>
</svg>
`)}`;

const SVG_MOORE_LAW_CHART = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300" width="100%" height="100%">
  <!-- Background grid -->
  <line x1="60" y1="240" x2="460" y2="240" stroke="#334155" stroke-width="1.5"/>
  <line x1="60" y1="40" x2="60" y2="240" stroke="#334155" stroke-width="1.5"/>
  <line x1="60" y1="180" x2="460" y2="180" stroke="#1e293b" stroke-dasharray="4 4"/>
  <line x1="60" y1="120" x2="460" y2="120" stroke="#1e293b" stroke-dasharray="4 4"/>
  <line x1="60" y1="60" x2="460" y2="60" stroke="#1e293b" stroke-dasharray="4 4"/>

  <!-- Classical Scaling (Plateau) -->
  <path d="M 60 210 Q 200 170 280 120 T 450 115" fill="none" stroke="#f43f5e" stroke-width="3.5"/>
  <circle cx="450" cy="115" r="5" fill="#f43f5e"/>
  <text x="455" y="112" fill="#f43f5e" font-size="11" font-weight="bold" font-family="sans-serif">Batas Fisik Silikon</text>

  <!-- Quantum Computing Acceleration -->
  <path d="M 240 230 Q 340 200 390 100 T 450 45" fill="none" stroke="#38bdf8" stroke-width="4"/>
  <circle cx="450" cy="45" r="6" fill="#38bdf8"/>
  <text x="350" y="40" fill="#38bdf8" font-size="12" font-weight="bold" font-family="sans-serif">Quantum Advantage (QPU)</text>

  <!-- Axis labels -->
  <text x="250" y="270" fill="#94a3b8" font-size="12" font-family="sans-serif" text-anchor="middle">Tahun Perkembangan (1970 - 2030)</text>
  <text x="30" y="140" fill="#94a3b8" font-size="11" font-family="sans-serif" transform="rotate(-90 30 140)" text-anchor="middle">Kapasitas Komputasi (FLOPS)</text>
</svg>
`)}`;

const SVG_QNN_ARCHITECTURE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 280" width="100%" height="100%">
  <!-- Neural layer connections -->
  <line x1="100" y1="80" x2="250" y2="60" stroke="#475569" stroke-width="1.5"/>
  <line x1="100" y1="80" x2="250" y2="140" stroke="#475569" stroke-width="1.5"/>
  <line x1="100" y1="160" x2="250" y2="140" stroke="#475569" stroke-width="1.5"/>
  <line x1="100" y1="160" x2="250" y2="220" stroke="#475569" stroke-width="1.5"/>
  <line x1="100" y1="240" x2="250" y2="220" stroke="#475569" stroke-width="1.5"/>

  <line x1="250" y1="60" x2="400" y2="100" stroke="#818cf8" stroke-width="2"/>
  <line x1="250" y1="140" x2="400" y2="100" stroke="#818cf8" stroke-width="2"/>
  <line x1="250" y1="140" x2="400" y2="180" stroke="#818cf8" stroke-width="2"/>
  <line x1="250" y1="220" x2="400" y2="180" stroke="#818cf8" stroke-width="2"/>

  <!-- Input Nodes -->
  <circle cx="100" cy="80" r="14" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <circle cx="100" cy="160" r="14" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <circle cx="100" cy="240" r="14" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="100" y="85" fill="#38bdf8" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="middle">x₁</text>
  <text x="100" y="165" fill="#38bdf8" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="middle">x₂</text>
  <text x="100" y="245" fill="#38bdf8" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="middle">x₃</text>

  <!-- Quantum Gate Circuit layer -->
  <rect x="220" y="40" width="60" height="40" rx="8" fill="#312e81" stroke="#818cf8" stroke-width="2"/>
  <text x="250" y="65" fill="#c7d2fe" font-size="12" font-weight="bold" font-family="monospace" text-anchor="middle">U(θ₁)</text>
  <rect x="220" y="120" width="60" height="40" rx="8" fill="#312e81" stroke="#818cf8" stroke-width="2"/>
  <text x="250" y="145" fill="#c7d2fe" font-size="12" font-weight="bold" font-family="monospace" text-anchor="middle">U(θ₂)</text>
  <rect x="220" y="200" width="60" height="40" rx="8" fill="#312e81" stroke="#818cf8" stroke-width="2"/>
  <text x="250" y="225" fill="#c7d2fe" font-size="12" font-weight="bold" font-family="monospace" text-anchor="middle">U(θ₃)</text>

  <!-- Output Nodes -->
  <circle cx="400" cy="100" r="16" fill="#065f46" stroke="#34d399" stroke-width="2"/>
  <circle cx="400" cy="180" r="16" fill="#065f46" stroke="#34d399" stroke-width="2"/>
  <text x="400" y="105" fill="#a7f3d0" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="middle">ŷ₁</text>
  <text x="400" y="185" fill="#a7f3d0" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="middle">ŷ₂</text>

  <!-- Labels -->
  <text x="100" y="40" fill="#94a3b8" font-size="11" font-family="sans-serif" text-anchor="middle">Input Klasik</text>
  <text x="250" y="25" fill="#c7d2fe" font-size="11" font-family="sans-serif" text-anchor="middle">Parameterized Quantum Circuit</text>
  <text x="400" y="60" fill="#a7f3d0" font-size="11" font-family="sans-serif" text-anchor="middle">Prediksi QML</text>
</svg>
`)}`;

const SVG_ROADMAP_2030 = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 260" width="100%" height="100%">
  <!-- Timeline bar -->
  <line x1="50" y1="130" x2="470" y2="130" stroke="#475569" stroke-width="3"/>

  <!-- Milestone 1 -->
  <circle cx="90" cy="130" r="12" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/>
  <text x="90" y="100" fill="#60a5fa" font-size="12" font-weight="bold" font-family="sans-serif" text-anchor="middle">2024</text>
  <text x="90" y="165" fill="#cbd5e1" font-size="10" font-family="sans-serif" text-anchor="middle">NISQ 1000 Qubits</text>

  <!-- Milestone 2 -->
  <circle cx="220" cy="130" r="12" fill="#8b5cf6" stroke="#ffffff" stroke-width="2"/>
  <text x="220" y="100" fill="#a78bfa" font-size="12" font-weight="bold" font-family="sans-serif" text-anchor="middle">2026</text>
  <text x="220" y="165" fill="#cbd5e1" font-size="10" font-family="sans-serif" text-anchor="middle">QML Drug Trial</text>

  <!-- Milestone 3 -->
  <circle cx="350" cy="130" r="12" fill="#ec4899" stroke="#ffffff" stroke-width="2"/>
  <text x="350" y="100" fill="#f472b6" font-size="12" font-weight="bold" font-family="sans-serif" text-anchor="middle">2028</text>
  <text x="350" y="165" fill="#cbd5e1" font-size="10" font-family="sans-serif" text-anchor="middle">Surface Code ECC</text>

  <!-- Milestone 4 -->
  <circle cx="460" cy="130" r="14" fill="#10b981" stroke="#ffffff" stroke-width="3"/>
  <text x="460" y="95" fill="#34d399" font-size="14" font-weight="bold" font-family="sans-serif" text-anchor="middle">2030</text>
  <text x="460" y="165" fill="#a7f3d0" font-size="10" font-family="sans-serif" font-weight="bold" text-anchor="middle">Fault-Tolerant QPU</text>
</svg>
`)}`;

export const SAMPLE_PPTX: MaterialData = {
  id: 'sample-pptx-ai-quantum',
  title: 'Artificial Intelligence & Quantum Computing: Masa Depan Teknologi',
  fileName: 'AI_and_Quantum_Computing_Overview.pptx',
  type: 'pptx',
  fileSize: '3.2 MB',
  createdAt: '2026-09-12',
  totalItems: 5,
  slides: [
    {
      id: 1,
      slideNumber: 1,
      title: 'Artificial Intelligence & Quantum Computing',
      subtitles: ['Revolusi Komputasi Abad ke-21', 'Oleh: Tim Inovasi Teknologi Nasional'],
      bullets: [
        'Konvergensi antara kecerdasan buatan modern dan mekanika kuantum komputasi.',
        'Mengapa komputasi konvensional mulai menghadapi batasan Hukum Moore pada silikon.',
        'Membuka paradigma baru dalam pemodelan molekuler, kriptografi, dan optimasi global.',
      ],
      notes: 'Buka presentasi dengan menyapa audiens secara percaya diri. Tekankan bahwa AI dan Quantum bukan lagi fiksi ilmiah, melainkan akselerator ekonomi nyata.',
      rawText: 'Artificial Intelligence & Quantum Computing\nRevolusi Komputasi Abad ke-21\nKonvergensi AI dan Quantum.',
      themeColor: 'from-blue-950 via-slate-900 to-slate-950',
      animationType: 'fade',
      diagramType: 'hero',
      images: [
        {
          id: 'img-slide-1',
          url: SVG_QUANTUM_HERO,
          name: 'Quantum_Superposition_Bloch.svg',
          alt: 'Visualisasi Keadaan Superposisi Kuantum',
        },
      ],
      audio: {
        id: 'audio-slide-1',
        url: '', // Synthesizer assisted
        title: 'Narasi Pembuka: Pengenalan AI & Quantum',
        duration: 35,
      },
    },
    {
      id: 2,
      slideNumber: 2,
      title: 'Tantangan Komputasi Klasik & Era Post-Moore',
      subtitles: ['Fisika Silikon vs Eksponensial Kebutuhan AI'],
      bullets: [
        'Hukum Moore mendekati batas fisik atomik silikon (gate leakage & thermal dissipation pada node 2nm).',
        'Kebutuhan daya latih model LLM berlipat ganda setiap beberapa bulan melampaui efisiensi GPU.',
        'Keterbatasan arsitektur von Neumann dalam transfer memori ke prosesor (Memory Wall Bottleneck).',
        'Solusi alternatif: Quantum Processors (QPU) dan neuromorphic architecture terdistribusi.',
      ],
      notes: 'Tunjukkan analogi jalan raya yang macet untuk menjelaskan von Neumann bottleneck agar audiens non-teknis paham.',
      rawText: 'Tantangan Komputasi Klasik & Era Post-Moore\nHukum Moore mendekati batas fisik ukuran atomik.',
      themeColor: 'from-indigo-950 via-slate-900 to-slate-950',
      animationType: 'slide-up',
      diagramType: 'comparison',
      images: [
        {
          id: 'img-slide-2',
          url: SVG_MOORE_LAW_CHART,
          name: 'Moore_Law_Plateau_Chart.svg',
          alt: 'Grafik Perbandingan Komputasi Klasik vs Kuantum',
        },
      ],
      tables: [
        {
          headers: ['Parameter', 'CPU / GPU Klasik', 'Quantum Processor (QPU)'],
          rows: [
            ['Unit Data', 'Bit Biner (0 atau 1)', 'Qubit (Superposisi |0⟩ & |1⟩)'],
            ['Kapasitas Skalabilitas', 'Linear n unit', 'Eksponensial 2ⁿ keadaan simultan'],
            ['Efisiensi Energi Optimasi', 'Tinggi (>300W per chip)', 'Hemat daya kalkulasi spesifik'],
          ],
        },
      ],
    },
    {
      id: 3,
      slideNumber: 3,
      title: 'Pilar Dasar Quantum Computing: Superposisi & Entanglement',
      subtitles: ['Dua Hukum Fisika Kuantum yang Mengubah Komputasi'],
      bullets: [
        'Qubit vs Bit: Bit hanya bernilai tunggal 0 atau 1; Qubit berada dalam superposisi linear kedua keadaan.',
        'Quantum Entanglement: Keterikatan instan antar partikel kuantum tanpa terhalang jarak fisik spasial.',
        'Quantum Parallelism: Kemampuan mengevaluasi eksponensial kombinasi solusi secara serentak.',
        'Tantangan rekayasa: Mengatasi quantum decoherence menggunakan surface code error correction.',
      ],
      notes: 'Gunakan penunjuk laser virtual dengan jari telunjuk untuk menyorot superposisi pada grafik.',
      rawText: 'Pilar Dasar Quantum Computing: Superposisi & Entanglement.',
      themeColor: 'from-cyan-950 via-slate-900 to-slate-950',
      animationType: 'zoom',
      diagramType: 'hero',
      images: [
        {
          id: 'img-slide-3',
          url: SVG_QUANTUM_HERO,
          name: 'Quantum_Entanglement_Diagram.svg',
          alt: 'Diagram Keterikatan Kuantum dan Paralelisme',
        },
      ],
    },
    {
      id: 4,
      slideNumber: 4,
      title: 'Sinergi AI & Quantum (Quantum Machine Learning / QML)',
      subtitles: ['Integrasi Neural Network dengan Quantum Circuits'],
      bullets: [
        'Quantum Neural Networks (QNN): Parameterized quantum circuits untuk representasi data berdimensi tinggi.',
        'Drug Discovery & Material Science: Mensimulasikan ikatan protein dan reaksi baterai dalam hitungan menit.',
        'Algoritma QAOA (Quantum Approximate Optimization) untuk logistik dan optimasi portofolio.',
        'Peningkatan akselerasi pemrosesan dataset kompleks hingga 100x lipat lebih cepat.',
      ],
      notes: 'Tekankan use-case medis: penemuan obat baru kanker atau Alzheimer yang biasanya butuh 10 tahun dapat dipersingkat menjadi hitungan minggu.',
      rawText: 'Sinergi AI & Quantum (QML)\nQuantum Neural Networks untuk representasi data tinggi.',
      themeColor: 'from-emerald-950 via-slate-900 to-slate-950',
      animationType: 'slide-left',
      diagramType: 'architecture',
      images: [
        {
          id: 'img-slide-4',
          url: SVG_QNN_ARCHITECTURE,
          name: 'QNN_Architecture_Flow.svg',
          alt: 'Arsitektur Quantum Neural Network dan Sirkuit Kuantum',
        },
      ],
    },
    {
      id: 5,
      slideNumber: 5,
      title: 'Roadmap & Kesimpulan: Menuju Ekosistem 2030',
      subtitles: ['Langkah Strategis Adopsi Teknologi di Industri'],
      bullets: [
        'Fase NISQ (Noisy Intermediate-Scale Quantum) bertransisi menuju Fault-Tolerant Quantum Computing.',
        'Implementasi Kriptografi Pasca-Kuantum (Post-Quantum Cryptography) berstandar NIST.',
        'Pendidikan dan kesiapan talenta: Kurikulum komputasi kuantum & AI terapan lintas disiplin ilmu.',
        'Kolaborasi riset nasional untuk mewujudkan kedaulatan teknologi mutakhir.',
      ],
      notes: 'Tutup dengan ajakan bertindak (call to action). Buka sesi tanya jawab dengan audiens.',
      rawText: 'Roadmap & Kesimpulan Menuju 2030\nFase NISQ menuju Fault-Tolerant Quantum Computing.',
      themeColor: 'from-violet-950 via-slate-900 to-slate-950',
      animationType: 'flip',
      diagramType: 'timeline',
      images: [
        {
          id: 'img-slide-5',
          url: SVG_ROADMAP_2030,
          name: 'Quantum_Roadmap_2030.svg',
          alt: 'Timeline Milestone Komputasi Kuantum Menuju 2030',
        },
      ],
    },
  ],
  aiAnalysis: {
    summary: 'Presentasi ini membahas sinergi revolusioner antara Kecerdasan Buatan (AI) dan Komputasi Kuantum. Dengan mendekatnya batasan fisik Hukum Moore pada silikon konvensional, arsitektur QPU (Quantum Processing Unit) menawarkan pemecahan eksponensial untuk tantangan optimasi, simulasi molekuler, dan penemuan obat baru (drug discovery). Materi merinci prinsip superposisi, keterikatan kuantum, serta transisi menuju komputasi kuantum toleran-kesalahan pada tahun 2030.',
    keyPoints: [
      'Komputasi klasik menghadapi von Neumann memory wall dan batasan termal.',
      'Qubit memungkinkan evaluasi miliaran kemungkinan keadaan secara serentak.',
      'Quantum Machine Learning (QML) mempercepat simulasi kimia dan perancangan obat.',
      'Kriptografi pasca-kuantum (PQC) menjadi keharusan sebelum komputer kuantum matang.',
      'Fase saat ini adalah NISQ (Noisy Intermediate-Scale Quantum) menuju fault tolerance.',
    ],
    importantTerms: [
      { term: 'Qubit (Quantum Bit)', definition: 'Satuan dasar informasi kuantum yang dapat berada dalam superposisi 0 dan 1.' },
      { term: 'Superposisi', definition: 'Prinsip mekanika kuantum di mana sebuah sistem dapat berada di banyak keadaan serentak.' },
      { term: 'Quantum Entanglement', definition: 'Fenomena partikel kuantum saling terhubung erat secara instan tanpa terhalang jarak fisik.' },
      { term: 'NISQ', definition: 'Noisy Intermediate-Scale Quantum, era prosesor kuantum 50-1000 qubit yang belum memiliki koreksi kesalahan penuh.' },
      { term: 'Memory Wall', definition: 'Kesenjangan kecepatan transfer data antara CPU/GPU dengan modul memori RAM.' },
    ],
    presenterNotes: [
      'Slide 1: Sambut audiens dengan antusias. Bangun urgensi mengapa topik ini penting.',
      'Slide 2: Gunakan perumpamaan jalan tol untuk menjelaskan von Neumann bottleneck.',
      'Slide 3: Aktifkan laser pointer dengan jari telunjuk untuk memperjelas visual superposisi.',
      'Slide 4: Ceritakan studi kasus pembuatan obat kanker untuk membuat materi terasa nyata.',
      'Slide 5: Tegaskan langkah konkret persiapan keamanan data sebelum membuka sesi tanya jawab.',
    ],
    possibleQuestions: [
      {
        question: 'Apakah komputer kuantum akan menggantikan komputer laptop atau smartphone kita?',
        sampleAnswer: 'Tidak untuk keperluan sehari-hari. Komputer kuantum dirancang khusus untuk kalkulasi matematika berintensitas ekstrem.',
      },
    ],
    simpleExplanation: 'Bayangkan komputer biasa adalah orang yang mencari jalan keluar dari labirin satu per satu. Komputer kuantum adalah air yang mengalir ke seluruh lorong sekaligus dan langsung menemukan jalan keluar tercepat dalam satu detik.',
  },
};

export const SAMPLE_DOCX: MaterialData = {
  id: 'sample-docx-digital-transformation',
  title: 'Dokumen Panduan Transformasi Digital & Inovasi Kerja 2026',
  fileName: 'Digital_Transformation_Guide_2026.docx',
  type: 'docx',
  fileSize: '1.8 MB',
  createdAt: '2026-09-12',
  totalItems: 4,
  sections: [
    {
      id: 1,
      sectionNumber: 1,
      title: 'Bab 1: Visi dan Urgensi Transformasi Digital',
      paragraphs: [
        'Dinamika pasar global dan akselerasi automasi menuntut organisasi untuk beralih dari operasional manual menuju ekosistem cerdas terintegrasi.',
        'Transformasi digital bukan sekadar adopsi perangkat lunak baru, melainkan perombakan budaya kerja, fleksibilitas pengambilan keputusan berbasis data, dan penciptaan nilai tambah berkelanjutan bagi konsumen.',
        'Tiga pilar utama penggerak: otomatisasi alur kerja tanpa gesekan, kolaborasi nir-batas, dan pengamanan aset digital terdistribusi.',
      ],
      bullets: [
        'Peningkatan produktivitas tim hingga 42% melalui integrasi otomatisasi cerdas.',
        'Pengurangan siklus persetujuan proyek dari mingguan menjadi hitungan jam.',
        'Pemberdayaan talenta agar fokus pada pemecahan masalah bernilai strategis tinggi.',
      ],
      rawText: 'Bab 1: Visi dan Urgensi Transformasi Digital\nDinamika pasar global menuntut adopsi sistem cerdas.',
      richHtml: `
        <div class="docx-page-content">
          <div class="p-4 mb-6 rounded-xl bg-blue-900/20 border-l-4 border-blue-500 text-blue-200">
            <strong>Ringkasan Eksekutif:</strong> Panduan ini mengarahkan seluruh unit organisasi untuk mengintegrasikan teknologi kecerdasan buatan dan antarmuka tanpa sentuh guna meningkatkan efisiensi operasional harian.
          </div>
          <p class="mb-4 leading-relaxed">Dinamika pasar global dan akselerasi automasi menuntut organisasi untuk beralih dari operasional manual menuju ekosistem cerdas terintegrasi.</p>
          <p class="mb-4 leading-relaxed">Transformasi digital bukan sekadar adopsi perangkat lunak baru, melainkan perombakan budaya kerja, fleksibilitas pengambilan keputusan berbasis data, dan penciptaan nilai tambah berkelanjutan bagi konsumen.</p>
          <h3 class="text-xl font-bold text-white mt-6 mb-3">Tiga Pilar Utama Transformasi:</h3>
          <ul class="list-disc pl-6 space-y-2 mb-6 text-slate-300">
            <li><strong>Otomatisasi Alur Kerja:</strong> Menghilangkan hambatan birokrasi manual.</li>
            <li><strong>Kolaborasi Nir-Batas:</strong> Komunikasi real-time lintas divisi.</li>
            <li><strong>Kepatuhan & Keamanan:</strong> Menjaga integritas data klien berstandar internasional.</li>
          </ul>
        </div>
      `,
      tables: [
        {
          headers: ['Target Metrik', 'Kondisi Awal (2025)', 'Target Capaian (2026)'],
          rows: [
            ['Waktu Persiapan Rapat', '45 Menit', '10 Menit (AI Powered)'],
            ['Adopsi Antarmuka Gesture', '0%', '85% Presenter Internal'],
            ['Efisiensi Alur Dokumen', 'Manual Kertas', '100% Digital Terenkripsi'],
          ],
        },
      ],
    },
    {
      id: 2,
      sectionNumber: 2,
      title: 'Bab 2: Integrasi AI & Antarmuka Tanpa Sentuh (Touchless Interfaces)',
      paragraphs: [
        'Di era pasca-layar konvensional, interaksi manusia dan komputer berkembang pesat menuju antarmuka alami (Natural User Interfaces).',
        'Penggunaan computer vision dan hand tracking memungkinkan presenter, instruktur, dan profesional ruang operasi memandu presentasi dan memanipulasi dokumen tanpa menyentuh keyboard maupun remote fisik.',
        'Prinsip zero-latency gesture recognition memastikan akurasi perintah navigasi tanpa menimbulkan distraksi pada fokus audiens.',
      ],
      bullets: [
        'Navigasi slide instan dengan ayunan jari telunjuk ke kanan dan kiri.',
        'Zoom presisi menggunakan 2 jari (telunjuk dan jempol) untuk memperbesar detail dokumen.',
        'Scrolling halaman dokumen halus menggunakan gesture 3 jari ke atas dan ke bawah.',
      ],
      rawText: 'Bab 2: Integrasi AI & Antarmuka Tanpa Sentuh.',
      richHtml: `
        <div class="docx-page-content">
          <p class="mb-4 leading-relaxed">Di era pasca-layar konvensional, interaksi manusia dan komputer berkembang pesat menuju antarmuka alami (Natural User Interfaces).</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
            <div class="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <div class="text-cyan-400 font-bold mb-1">☝️ 1 Jari Telunjuk</div>
              <p class="text-xs text-slate-300">Geser kanan & kiri untuk navigasi slide atau penunjuk laser titik merah.</p>
            </div>
            <div class="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <div class="text-amber-400 font-bold mb-1">👌 2 Jari (Telunjuk+Jempol)</div>
              <p class="text-xs text-slate-300">Memperbesar (zoom in) dan memperkecil (zoom out) materi dengan meregangkan jari.</p>
            </div>
            <div class="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <div class="text-purple-400 font-bold mb-1">🖐️ 3 Jari</div>
              <p class="text-xs text-slate-300">Scroll dokumen ke atas dan ke bawah dengan menggerakkan 3 jari vertikal.</p>
            </div>
          </div>
          <p class="mb-4 leading-relaxed">Prinsip zero-latency gesture recognition memastikan akurasi perintah navigasi tanpa menimbulkan distraksi pada jalannya presentasi.</p>
        </div>
      `,
    },
    {
      id: 3,
      sectionNumber: 3,
      title: 'Bab 3: Arsitektur Keamanan Data & Kebijakan Privasi Klien',
      paragraphs: [
        'Penerapan vision-based AI wajib mengedepankan prinsip privacy-by-design. Seluruh pemrosesan video dilakukan secara lokal (client-side edge compute) tanpa mengirimkan rekaman video ke server eksternal.',
        'Kamera hanya membaca koordinat landmark spasial (21 titik sendi tangan) untuk kalkulasi vektor gerakan, dan frame gambar segera dilepaskan dari memori RAM setelah kalkulasi selesai.',
        'Dokumen yang diunggah hanya diproses oleh API AI secara on-demand saat pengguna mengajukan pertanyaan atau permintaan ringkasan materi.',
      ],
      bullets: [
        'Zero camera video streaming: 100% lokal di peramban pengguna.',
        'Frame buffer otomatis dibersihkan setiap frame cycle (zero retention).',
        'Enkripsi data materi saat transit untuk layanan AI pendukung.',
      ],
      rawText: 'Bab 3: Arsitektur Keamanan Data & Privasi.',
      richHtml: `
        <div class="docx-page-content">
          <p class="mb-4 leading-relaxed">Penerapan vision-based AI wajib mengedepankan prinsip privacy-by-design. Seluruh pemrosesan video dilakukan secara lokal (client-side edge compute) tanpa mengirimkan rekaman video ke server eksternal.</p>
          <div class="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 my-4 text-emerald-200 text-sm">
            🛡️ <strong>Jaminan Privasi Penuh:</strong> Sistem GesturePresenter AI tidak pernah menyimpan atau mentransmisikan rekaman video atau citra wajah Anda ke server mana pun. Seluruh kalkulasi hand landmarks berjalan di CPU/GPU peramban pengguna.
          </div>
          <p class="mb-4 leading-relaxed">Kamera hanya membaca koordinat landmark spasial (21 titik sendi tangan) untuk kalkulasi vektor gerakan, dan frame gambar segera dilepaskan dari memori RAM.</p>
        </div>
      `,
    },
    {
      id: 4,
      sectionNumber: 4,
      title: 'Bab 4: Metrik Keberhasilan & Rencana Implementasi Bertahap',
      paragraphs: [
        'Keberhasilan transformasi diukur melalui adopsi pengguna aktif, penurunan rasio kesalahan operasional, dan kepuasan audiens saat sesi interaktif berlangsung.',
        'Implementasi dijalankan melalui tiga fase: Pengujian percontohan (pilot test 30 hari), pelatihan presenter internal, dan peluncuran menyeluruh ke seluruh departemen.',
      ],
      bullets: [
        'Target adopsi 85% dalam 90 hari pertama implementasi.',
        'Survei kepuasan pengalaman presentasi minimal 4.7 dari skala 5.',
        'Penghematan waktu persiapan materi presentasi hingga 60% berkat AI Assistant.',
      ],
      rawText: 'Bab 4: Metrik Keberhasilan & Rencana Bertahap.',
      richHtml: `
        <div class="docx-page-content">
          <p class="mb-4 leading-relaxed">Keberhasilan transformasi diukur melalui adopsi pengguna aktif, penurunan rasio kesalahan operasional, dan kepuasan audiens saat sesi interaktif berlangsung.</p>
          <h3 class="text-xl font-bold text-white mt-6 mb-3">Jadwal Fase Penerapan:</h3>
          <div class="space-y-3 mb-6">
            <div class="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between">
              <span class="font-semibold text-white">Fase 1: Uji Percontohan (Pilot Project)</span>
              <span class="text-xs bg-indigo-900/60 text-indigo-300 px-3 py-1 rounded-full">Bulan 1</span>
            </div>
            <div class="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between">
              <span class="font-semibold text-white">Fase 2: Pelatihan Presenter & Hand Tracking Mastery</span>
              <span class="text-xs bg-cyan-900/60 text-cyan-300 px-3 py-1 rounded-full">Bulan 2</span>
            </div>
            <div class="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between">
              <span class="font-semibold text-white">Fase 3: Peluncuran Penuh ke Seluruh Divisi</span>
              <span class="text-xs bg-emerald-900/60 text-emerald-300 px-3 py-1 rounded-full">Bulan 3</span>
            </div>
          </div>
        </div>
      `,
    },
  ],
  aiAnalysis: {
    summary: 'Dokumen panduan ini menguraikan strategi komprehensif transformasi digital organisasi untuk tahun 2026. Fokus utamanya mencakup adopsi antarmuka alami (gesture-controlled navigation), integrasi kecerdasan buatan dalam alur kerja, kepatuhan privasi ketat dengan pemrosesan video 100% lokal, dan metrik adopsi bertahap untuk memastikan kesuksesan implementasi.',
    keyPoints: [
      'Transformasi digital berpusat pada kultur dan otomatisasi alur kerja bernilai tinggi.',
      'Natural User Interfaces (NUI) menghilangkan ketergantungan pada keyboard dan remote fisik.',
      'Prinsip Privacy-by-design memastikan rekaman video kamera tidak pernah disimpan atau ditransmisikan.',
      'AI Assistant mempercepat persiapan catatan presenter dan ringkasan eksekutif hingga 60%.',
    ],
    importantTerms: [
      { term: 'Natural User Interface (NUI)', definition: 'Sistem antarmuka pengguna di mana manusia berinteraksi dengan komputer melalui gerakan tubuh alami seperti gestur tangan.' },
      { term: 'Client-Side Edge Compute', definition: 'Pemrosesan data yang dilakukan sepenuhnya di perangkat pengguna lokal tanpa dikirim ke server cloud.' },
      { term: 'Privacy-by-Design', definition: 'Pendekatan pengembangan sistem di mana perlindungan privasi dibangun secara inheren sejak awal perancangan arsitektur.' },
    ],
    presenterNotes: [
      'Bab 1: Sorot peningkatan produktivitas 42% sebagai justifikasi utama investasi teknologi.',
      'Bab 2: Demonstrasikan langsung ke audiens cara menggeser bab dokumen dengan gesture tangan.',
      'Bab 3: Beri penegasan kuat kepada audiens bahwa kamera hanya membaca titik koordinat jari, bukan merekam wajah/ruangan.',
      'Bab 4: Jelaskan timeline 90 hari implementasi secara ringkas.',
    ],
    possibleQuestions: [
      {
        question: 'Apakah sistem gesture ini dapat bekerja di ruangan dengan pencahayaan minim?',
        sampleAnswer: 'Sistem dilengkapi adaptive landmark tracking dan normalisasi kontras. Namun untuk akurasi maksimal, pencahayaan wajar sangat dianjurkan.',
      },
    ],
    simpleExplanation: 'Dokumen ini adalah buku panduan cara memandu rapat dan membaca laporan cukup dengan gerakan tangan layaknya di film fiksi ilmiah.',
  },
};
