import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Sparkles,
  Hand,
  Camera,
  Play,
  FileText,
  Layers,
  ArrowRight,
  ArrowLeft,
  Lock,
  Unlock,
  ZoomIn,
  CheckCircle2,
  Lightbulb,
  ShieldCheck,
  Eye,
  Sliders,
  ChevronRight,
  Monitor,
  Volume2,
  Globe,
} from 'lucide-react';
import { WebsiteTheme } from '../data/websiteThemes';
import { useLanguage } from '../i18n/LanguageContext';

interface GuidebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: WebsiteTheme;
}

type TabType = 'about' | 'workflow' | 'gestures' | 'features' | 'faq';

export const GuidebookModal: React.FC<GuidebookModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const { language, setLanguage, t } = useLanguage();
  const isLight = theme?.isLight ?? false;
  const isEn = language === 'en';

  if (!isOpen) return null;

  return (
    <div
      id="guidebook-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="guidebook-modal-container"
        className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-900/20'
            : 'bg-slate-900 border-slate-700/80 text-slate-100 shadow-cyan-950/30'
        }`}
      >
        {/* HEADER BUKU PANDUAN */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
            isLight ? 'bg-amber-50/60 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                  {isEn ? 'User Guidebook' : 'Buku Panduan Penggunaan'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {isEn ? 'Official Guide' : 'Resmi'}
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {isEn
                  ? 'Complete walkthrough on what this app is, how it works, and full air-gesture dictionary.'
                  : 'Panduan lengkap cara kerja, fungsi tombol, hingga teknik kendali gestur tangan udara.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Language Toggle inside Guidebook */}
            <div className="flex items-center border rounded-xl overflow-hidden text-xs font-bold border-amber-500/30">
              <button
                onClick={() => setLanguage('id')}
                className={`px-2.5 py-1 transition cursor-pointer ${
                  language === 'id'
                    ? 'bg-amber-500 text-slate-950 font-extrabold'
                    : isLight
                    ? 'bg-white text-slate-600 hover:text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
                title="Ganti ke Bahasa Indonesia"
              >
                🇮🇩 ID
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 transition cursor-pointer ${
                  language === 'en'
                    ? 'bg-amber-500 text-slate-950 font-extrabold'
                    : isLight
                    ? 'bg-white text-slate-600 hover:text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
                title="Switch to English"
              >
                🇬🇧 EN
              </button>
            </div>

            <button
              id="guidebook-close-btn"
              onClick={onClose}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isLight
                  ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={isEn ? 'Close Guidebook' : 'Tutup Buku Panduan'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION BAR */}
        <div
          className={`flex items-center gap-1.5 px-4 sm:px-6 py-2 border-b overflow-x-auto scrollbar-none shrink-0 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}
        >
          <button
            onClick={() => setActiveTab('about')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'about'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isEn ? '1. What is this App?' : '1. Ini Aplikasi Apa?'}
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'workflow'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            {isEn ? '2. Workflow & Steps' : '2. Cara Kerja & Pengerjaan'}
          </button>

          <button
            onClick={() => setActiveTab('gestures')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'gestures'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            {isEn ? '3. Hand Gestures' : '3. Kamus Gestur Tangan'}
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'features'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            {isEn ? '4. Features & Settings' : '4. Fitur & Pengaturan'}
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            {isEn ? '5. Tips & FAQ' : '5. Tips & Solusi (FAQ)'}
          </button>
        </div>

        {/* BODY CONTENT SCROLLER */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm leading-relaxed">
          {/* ================= TAB 1: INI APLIKASI APA? ================= */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div
                className={`p-5 rounded-2xl border ${
                  isLight
                    ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                    : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                }`}
              >
                <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  {isEn ? 'About GesturePresenter AI' : 'Mengenal GesturePresenter AI'}
                </h3>
                <p className="text-sm leading-relaxed">
                  {isEn ? (
                    <>
                      <strong>GesturePresenter AI</strong> is a next-generation presentation platform and document reader that allows you to guide your audience, advance and rewind slides, read documents, and highlight key points <strong>completely touchless</strong> simply by moving your hand in the air in front of your laptop or computer webcam.
                    </>
                  ) : (
                    <>
                      <strong>GesturePresenter AI</strong> adalah platform presentasi modern dan pembaca dokumen generasi baru yang memungkinkan Anda memandu audiens, membolak-balik slide presentasi, membaca naskah dokumen, serta menunjuk materi secara <strong>tanpa sentuhan fisik (touchless)</strong> hanya dengan menggerakkan tangan di udara di hadapan webcam laptop atau komputer.
                    </>
                  )}
                </p>
              </div>

              {/* 3 Keunggulan Utama */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`p-4 rounded-2xl border ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-3">
                    <Hand className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm mb-1">
                    {isEn ? 'No Mouse & No Clicker' : 'Bebas Mouse & Remote'}
                  </h4>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {isEn
                      ? 'No need to hold physical presenter clickers or stay stuck near your laptop keyboard. Speak freely with natural hand gestures.'
                      : 'Tidak perlu lagi memegang clicker remote fisik atau berdiri menempel di dekat laptop. Berbicaralah leluasa dengan gestur alami tangan Anda.'}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm mb-1">
                    {isEn ? '100% Privacy & Local' : '100% Privasi & Lokal'}
                  </h4>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {isEn ? (
                      <>
                        AI tracking (Google MediaPipe Hands) calculates 21 hand joints directly in your browser. Webcam video is <strong>never</strong> transmitted to any external server.
                      </>
                    ) : (
                      <>
                        Pelacakan AI (Google MediaPipe Hands) memproses 21 titik sendi tangan langsung di dalam browser Anda. Video webcam Anda <strong>tidak pernah</strong> dikirim ke server.
                      </>
                    )}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm mb-1">
                    {isEn ? 'Supports PPTX & DOCX' : 'Mendukung PPTX & DOCX'}
                  </h4>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {isEn
                      ? 'Supports standard 16:9 widescreen PowerPoint (.pptx) slide decks and Microsoft Word (.docx) documents with structured chapter navigation.'
                      : 'Dapat memuat file PowerPoint (.pptx) dengan rasio 16:9 standar dan file dokumen Microsoft Word (.docx) dengan pembagian bab terstruktur rapi.'}
                  </p>
                </div>
              </div>

              {/* Siapa yang Cocok Menggunakan? */}
              <div
                className={`p-5 rounded-2xl border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-800/40 border-slate-700/80'
                }`}
              >
                <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {isEn ? 'Ideal For:' : 'Cocok Digunakan Untuk:'}
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <strong>{isEn ? 'Teachers & Professors:' : 'Dosen & Guru:'}</strong>{' '}
                    {isEn ? 'Interactive classroom lectures & projector teaching.' : 'Pengajaran di kelas interaktif & proyektor.'}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <strong>{isEn ? 'Keynote & Conference Speakers:' : 'Pembicara / Seminar:'}</strong>{' '}
                    {isEn ? 'Stage presentations without holding remotes.' : 'Presentasi di panggung besar tanpa remote.'}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <strong>{isEn ? 'Students:' : 'Mahasiswa:'}</strong>{' '}
                    {isEn ? 'Thesis defense, final projects, and group pitches.' : 'Sidang skripsi, tugas akhir, dan presentasi kelompok.'}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <strong>{isEn ? 'Business Professionals:' : 'Profesional / Bisnis:'}</strong>{' '}
                    {isEn ? 'Client pitching and online video call meetings.' : 'Pitching klien atau meeting online video call.'}
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* ================= TAB 2: CARA KERJA & PENGERJAAN ================= */}
          {activeTab === 'workflow' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold mb-1">
                  {isEn ? 'Complete Workflow: From Start to Finish' : 'Alur Kerja Dari Awal Hingga Selesai'}
                </h3>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {isEn
                    ? 'Follow these 4 simple steps to begin your touchless air-gesture presentation session.'
                    : 'Ikuti 4 tahapan pengerjaan sederhana berikut untuk memulai sesi presentasi nirkontak Anda.'}
                </p>
              </div>

              <div className="space-y-4">
                {/* Langkah 1 */}
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-4 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-cyan-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-sm">
                    1
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <Camera className="w-4 h-4 text-cyan-500" />
                      {isEn ? 'Turn On & Grant Webcam Permission' : 'Nyalakan & Beri Izin Kamera Webcam'}
                    </h4>
                    <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {isEn ? (
                        <>
                          Click the <strong>&ldquo;Start Camera&rdquo;</strong> button in the top bar. When your browser (Chrome / Edge / Firefox / Safari) prompts for camera access, click <strong>&ldquo;Allow&rdquo;</strong>. A floating camera box will appear to monitor your hand movements in real-time.
                        </>
                      ) : (
                        <>
                          Klik tombol <strong>&ldquo;Nyalakan Kamera&rdquo;</strong> di bilah atas. Ketika peramban (Chrome / Edge / Firefox) meminta izin akses kamera, pilih <strong>&ldquo;Allow&rdquo;</strong>. Kotak kamera mini akan muncul di pojok layar untuk memantau gestur tangan Anda.
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Langkah 2 */}
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-4 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-sm">
                    2
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <Play className="w-4 h-4 text-amber-500" />
                      {isEn ? 'Click "Start Presentation" & Choose File' : 'Tekan Tombol “Mulai Presentasi” & Pilih File'}
                    </h4>
                    <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {isEn ? (
                        <>
                          Click the <strong>Start Presentation</strong> button on the top right or on the hero banner. A modal will open with <strong>2 explicit document choices</strong>:
                        </>
                      ) : (
                        <>
                          Klik tombol <strong>Mulai Presentasi</strong> di pojok kanan atas atau banner depan. Sebuah dialog akan muncul dengan <strong>2 pilihan dokumen</strong>:
                        </>
                      )}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-1">
                      <div className={`p-2.5 rounded-xl border text-xs ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
                        <strong className="text-amber-500">
                          {isEn ? 'Option 1: PowerPoint (.pptx)' : 'Pilihan 1: PowerPoint (.pptx)'}
                        </strong>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {isEn
                            ? 'Drag or pick a .pptx file from your PC for a 16:9 slide deck mode.'
                            : 'Tarik atau pilih file .pptx dari komputer Anda untuk mode slide deck 16:9.'}
                        </p>
                      </div>
                      <div className={`p-2.5 rounded-xl border text-xs ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
                        <strong className="text-indigo-400">
                          {isEn ? 'Option 2: Microsoft Word (.docx)' : 'Pilihan 2: Microsoft Word (.docx)'}
                        </strong>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {isEn
                            ? 'Drag or pick a .docx file for document reading by chapters with smooth touchless scroll.'
                            : 'Tarik atau pilih file .docx untuk presentasi naskah per bab dengan navigasi scroll halus.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Langkah 3 */}
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-4 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-sm">
                    3
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <Hand className="w-4 h-4 text-emerald-500" />
                      {isEn ? 'Calibrate Distance & Control Screen' : 'Atur Jarak Tangan & Kendalikan Layar'}
                    </h4>
                    <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {isEn ? (
                        <>
                          Sit or stand around <strong>0.5 to 1.5 meters</strong> away from your webcam. Raise your hand until cyan/green skeleton lines appear in the camera box. You are ready to present simply by waving your hand!
                        </>
                      ) : (
                        <>
                          Duduk atau berdirilah sekitar <strong>0.5 hingga 1.5 meter</strong> dari webcam. Angkat tangan Anda hingga muncul garis rangka sendi hijau/cyan di kotak kamera. Anda siap memandu presentasi hanya dengan mengibaskan tangan!
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Langkah 4 */}
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-4 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                    4
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <Lock className="w-4 h-4 text-rose-500" />
                      {isEn ? 'Use Safety Lock When Talking Freely' : 'Gunakan Fitur Kunci Saat Sedang Berbicara Bebas'}
                    </h4>
                    <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {isEn ? (
                        <>
                          When you want to gesture naturally while conversing without accidentally flipping slides, simply <strong>clench your fist for 3 seconds</strong> to Lock. Clench fist for 3 seconds again to Unlock.
                        </>
                      ) : (
                        <>
                          Saat Anda ingin mengekspresikan percakapan bebas dengan tangan tanpa sengaja memicu pergantian slide, cukup <strong>kepalkan tangan selama 3 detik</strong> untuk mengunci (*Lock*). Kepal lagi 3 detik untuk membuka (*Unlock*).
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: KAMUS GESTUR TANGAN ================= */}
          {activeTab === 'gestures' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold mb-1">
                  {isEn ? 'Full Hand Gesture Dictionary & Actions' : 'Daftar Lengkap Gerakan Tangan & Artinya'}
                </h3>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {isEn
                    ? 'All gestures are designed to be ergonomic, natural, and memorable without straining your wrist.'
                    : 'Semua gerakan dirancang ergonomis dan alami agar mudah diingat serta tidak melelahkan tangan.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gestur 1: Swipe Kanan */}
                <div
                  className={`p-4 rounded-2xl border space-y-2.5 ${
                    isLight ? 'bg-sky-50/60 border-sky-200' : 'bg-sky-950/20 border-sky-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-500 text-slate-950 flex items-center gap-1.5">
                      <ArrowRight className="w-3.5 h-3.5" />
                      {isEn ? 'Next Slide (Advance)' : 'Slide Berikutnya (Maju)'}
                    </span>
                    <span className="text-[10px] font-mono text-sky-400">INDEX_SWIPE_RIGHT</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    <strong>{isEn ? 'How to perform:' : 'Cara Gerakan:'}</strong>{' '}
                    {isEn
                      ? 'Point index finger or open hand, then quickly swipe/flick your hand to the right.'
                      : 'Acungkan jari telunjuk atau telapak tangan terbuka, lalu kibaskan/geser tangan ke arah kanan secara cepat dan tegas.'}
                  </p>
                  <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    ⚡ {isEn ? 'Effect: Advances slide to next item with smooth transition and soft audio click.' : 'Efek: Slide berpindah maju ke nomor selanjutnya disertai animasi mulus & suara klik lembut.'}
                  </p>
                </div>

                {/* Gestur 2: Swipe Kiri */}
                <div
                  className={`p-4 rounded-2xl border space-y-2.5 ${
                    isLight ? 'bg-cyan-50/60 border-cyan-200' : 'bg-cyan-950/20 border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 flex items-center gap-1.5">
                      <ArrowLeft className="w-3.5 h-3.5" />
                      {isEn ? 'Previous Slide (Rewind)' : 'Slide Sebelumnya (Mundur)'}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">INDEX_SWIPE_LEFT</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    <strong>{isEn ? 'How to perform:' : 'Cara Gerakan:'}</strong>{' '}
                    {isEn
                      ? 'Point index finger or open hand, then firmly swipe/flick your hand to the left.'
                      : 'Acungkan jari telunjuk atau telapak tangan terbuka, lalu kibaskan/geser tangan ke arah kiri secara tegas.'}
                  </p>
                  <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    ⚡ {isEn ? 'Effect: Takes you back to the previous slide or document chapter.' : 'Efek: Membawa Anda kembali ke slide atau bab naskah sebelumnya.'}
                  </p>
                </div>

                {/* Gestur 3: Laser Pointer */}
                <div
                  className={`p-4 rounded-2xl border space-y-2.5 ${
                    isLight ? 'bg-rose-50/60 border-rose-200' : 'bg-rose-950/20 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500 text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_#fff]" />
                      {isEn ? 'Virtual Laser Pointer' : 'Laser Pointer Virtual'}
                    </span>
                    <span className="text-[10px] font-mono text-rose-400">INDEX_POINTER</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    <strong>{isEn ? 'How to perform:' : 'Cara Gerakan:'}</strong>{' '}
                    {isEn
                      ? 'Raise 1 index finger straight towards the screen (pointing posture). Move your finger gently.'
                      : 'Angkat 1 jari telunjuk Anda tegak ke arah layar (posisi menunjuk). Gerakkan jari Anda perlahan.'}
                  </p>
                  <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    ⚡ {isEn ? 'Effect: A glowing red laser point accurately follows your index fingertip across the slide.' : 'Efek: Titik laser merah bercahaya akan mengikuti gerakan ujung jari telunjuk Anda di atas slide secara presisi.'}
                  </p>
                </div>

                {/* Gestur 4: Scroll Dokumen Word */}
                <div
                  className={`p-4 rounded-2xl border space-y-2.5 ${
                    isLight ? 'bg-indigo-50/60 border-indigo-200' : 'bg-indigo-950/20 border-indigo-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500 text-white flex items-center gap-1.5">
                      {isEn ? 'Scroll Document (Word)' : 'Scroll Dokumen (Word)'}
                    </span>
                    <span className="text-[10px] font-mono text-indigo-400">INDEX_SCROLL</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    <strong>{isEn ? 'How to perform:' : 'Cara Gerakan:'}</strong>{' '}
                    {isEn
                      ? 'In Word documents (.docx), swipe your index finger up to scroll up, or down to scroll down.'
                      : 'Pada dokumen Word (.docx), gerakkan jari telunjuk ke atas untuk scroll ke atas, atau ke bawah untuk scroll ke bawah.'}
                  </p>
                  <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    ⚡ {isEn ? 'Effect: Smoothly scrolls long document paragraphs effortlessly.' : 'Efek: Menggulir teks dokumen paragraf panjang secara lembut tanpa lelah.'}
                  </p>
                </div>

                {/* Gestur 5: Mode Zoom (Pinch) */}
                <div
                  className={`p-4 rounded-2xl border space-y-2.5 ${
                    isLight ? 'bg-emerald-50/60 border-emerald-200' : 'bg-emerald-950/20 border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 flex items-center gap-1.5">
                      <ZoomIn className="w-3.5 h-3.5" />
                      {isEn ? 'Zoom In & Zoom Out' : 'Zoom In & Zoom Out'}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">PINCH_ZOOM</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    <strong>{isEn ? 'How to perform:' : 'Cara Gerakan:'}</strong>{' '}
                    {isEn
                      ? 'Pinch thumb and index fingertip to Zoom In (+), or spread them apart to Zoom Out (-).'
                      : 'Sentuhkan ujung jari telunjuk dan jempol (gerakan mencubit) untuk Zoom In (+), atau renggangkan kembali untuk Zoom Out (-).'}
                  </p>
                  <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    ⚡ {isEn ? 'Effect: Magnifies diagrams, charts, or small slide text for audience in back rows.' : 'Efek: Memperbesar diagram, tabel, atau teks slide agar terlihat jelas oleh audiens di baris belakang.'}
                  </p>
                </div>

                {/* Gestur 6: Kunci Gestur (3 Detik) */}
                <div
                  className={`p-4 rounded-2xl border space-y-2.5 ${
                    isLight ? 'bg-amber-50/60 border-amber-200' : 'bg-amber-950/20 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      {isEn ? 'Lock / Unlock Gesture (3s)' : 'Kunci / Buka Gestur (3s)'}
                    </span>
                    <span className="text-[10px] font-mono text-amber-400">HOLD_FIST_3S</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    <strong>{isEn ? 'How to perform:' : 'Cara Gerakan:'}</strong>{' '}
                    {isEn
                      ? 'Clench your fist tightly facing the camera and hold for 3 seconds until countdown finishes.'
                      : 'Kepalkan tangan secara rapat dan tahan di hadapan kamera selama 3 detik hingga hitungan mundur selesai.'}
                  </p>
                  <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    ⚡ {isEn ? 'Effect: Freezes gesture tracking so slides don’t flip while speaking enthusiastically. Clench 3s again to unlock.' : 'Efek: Mengunci pelacakan agar slide tidak berpindah saat Anda sedang asyik bercerita. Lakukan kepalan 3 detik lagi untuk membuka.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: FITUR & PENGATURAN ================= */}
          {activeTab === 'features' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold mb-1">
                  {isEn ? 'Key Features & Customization' : 'Fitur Utama & Kustomisasi'}
                </h3>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {isEn
                    ? 'Tailor the website themes and presentation comfort via the Settings menu.'
                    : 'Sesuaikan tampilan website dan kenyamanan presentasi Anda melalui menu Setting.'}
                </p>
              </div>

              <div className="space-y-4">
                {/* 1. Kotak Kamera Mini Ringkas & Bebas Lag */}
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
                  }`}
                >
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-500" />
                    {isEn
                      ? 'Portable Mini Camera (Lag-Free & Non-Intrusive)'
                      : 'Kotak Kamera Mini Portabel (Bebas Lag & Tidak Menghalangi)'}
                  </h4>
                  <ul className={`text-xs space-y-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>{isEn ? 'Draggable:' : 'Dapat Digeser:'}</strong>{' '}
                        {isEn
                          ? 'Click and drag the camera top header to position it anywhere on your screen.'
                          : 'Klik dan tahan bilah atas kotak kamera untuk memindahkannya ke posisi mana pun di layar.'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>{isEn ? 'Minimizable:' : 'Dapat Dikecilkan (Minimize):'}</strong>{' '}
                        {isEn
                          ? 'Press the minimize button for ultra-compact size (130px) without lag because video stream continues uninterrupted in the background.'
                          : 'Tekan tombol minimize untuk menjadikannya ukuran mini (130px) tanpa jeda lag karena streaming video tetap terhubung mulus di latar belakang.'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>{isEn ? 'Skeleton Line Toggle (Eye Icon):' : 'Toggle Garis Sendi (Mata):'}</strong>{' '}
                        {isEn
                          ? 'Hide the hand bone tracking lines if you prefer a clean webcam video feed.'
                          : 'Sembunyikan garis rangka tulang tangan jika Anda ingin tampilan video kamera yang bersih.'}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* 2. 4 Pilihan Tema Layar Website */}
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
                  }`}
                >
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-cyan-500" />
                    {isEn ? '4 Website Screen Color Themes' : '4 Tema Warna Layar Website'}
                  </h4>
                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {isEn
                      ? 'Press the Settings button in the top bar to select your preferred visual atmosphere:'
                      : 'Tekan tombol Setting di bilah atas untuk memilih suasana visual layar:'}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="p-2 rounded-xl bg-slate-950 border border-sky-500/40 text-center">
                      <div className="w-3 h-3 rounded-full bg-sky-500 mx-auto mb-1" />
                      <span className="text-[11px] font-bold text-sky-400">Ocean Midnight</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-emerald-500/40 text-center">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 mx-auto mb-1" />
                      <span className="text-[11px] font-bold text-emerald-400">Emerald Obsidian</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-rose-500/40 text-center">
                      <div className="w-3 h-3 rounded-full bg-rose-500 mx-auto mb-1" />
                      <span className="text-[11px] font-bold text-rose-400">Crimson Eclipse</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-300 text-center">
                      <div className="w-3 h-3 rounded-full bg-slate-900 mx-auto mb-1" />
                      <span className="text-[11px] font-bold text-slate-900">Pure Pearl White</span>
                    </div>
                  </div>
                </div>

                {/* 3. Efek Transisi & Audio Presenter */}
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
                  }`}
                >
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-500" />
                    {isEn ? 'Slide Transition Effects & Presenter Audio' : 'Efek Transisi Slide & Audio Presenter'}
                  </h4>
                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {isEn
                      ? 'In presentation mode, choose PowerPoint slide transitions such as Wipe, Push, Fade, or Zoom, and toggle interactive click audio cues.'
                      : 'Di dalam mode presentasi, Anda dapat memilih transisi slide PowerPoint seperti Slide, Fade, Flip 3D, atau Zoom serta menyalakan/mematikan efek suara klik interaktif.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: TIPS & SOLUSI (FAQ) ================= */}
          {activeTab === 'faq' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold mb-1">
                  {isEn ? 'Frequently Asked Questions & Tips (FAQ)' : 'Pertanyaan Umum & Tips Praktis (FAQ)'}
                </h3>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {isEn
                    ? 'Quick solutions to common technical queries during live presentations.'
                    : 'Solusi cepat untuk berbagai kendala teknis saat melakukan presentasi.'}
                </p>
              </div>

              <div className="space-y-3">
                <div
                  className={`p-4 rounded-2xl border space-y-1.5 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
                  }`}
                >
                  <h4 className="font-bold text-sm text-cyan-400 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    {isEn
                      ? 'What is the optimal distance between hand and laptop camera?'
                      : 'Berapa jarak terbaik tangan ke kamera laptop?'}
                  </h4>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {isEn ? (
                      <>
                        The ideal distance is between <strong>50 cm to 150 cm (2 to 5 feet)</strong> from the webcam. Ensure your wrist to fingertips remain visible inside the camera frame shown in the mini preview box.
                      </>
                    ) : (
                      <>
                        Jarak paling ideal adalah antara <strong>50 cm hingga 150 cm</strong> dari webcam. Pastikan pergelangan tangan hingga ujung jari Anda masuk ke dalam bingkai kamera yang terlihat di kotak monitor mini.
                      </>
                    )}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-2xl border space-y-1.5 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
                  }`}
                >
                  <h4 className="font-bold text-sm text-cyan-400 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    {isEn
                      ? 'What if the room lighting is slightly dim?'
                      : 'Bagaimana jika ruangan presentasi agak remang?'}
                  </h4>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {isEn ? (
                      <>
                        MediaPipe AI works best when there is adequate contrast between your hand and the background. If the room is dim, the light from your laptop screen or room spotlight is usually sufficient to illuminate your palm.
                      </>
                    ) : (
                      <>
                        MediaPipe AI bekerja paling akurat jika kontras antara tangan dan latar belakang cukup jelas. Bila ruangan gelap, pastikan cahaya dari layar laptop atau lampu sorot menerangi telapak tangan Anda.
                      </>
                    )}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-2xl border space-y-1.5 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
                  }`}
                >
                  <h4 className="font-bold text-sm text-cyan-400 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    {isEn
                      ? 'Is my presentation file or webcam video secure?'
                      : 'Apakah file presentasi atau video kamera saya aman?'}
                  </h4>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {isEn ? (
                      <>
                        <strong>100% Completely Private &amp; Secure!</strong> Processing of your .pptx / .docx files and AI hand skeletal joint detection runs entirely locally within your browser client. No camera video or documents are ever uploaded or saved on external servers.
                      </>
                    ) : (
                      <>
                        <strong>100% Sangat Aman!</strong> Pemrosesan file .pptx / .docx dan pengenalan kerangka sendi tangan dilakukan sepenuhnya secara lokal di dalam mesin browser komputer Anda tanpa pernah diunggah atau disimpan di server luar.
                      </>
                    )}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-2xl border space-y-1.5 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
                  }`}
                >
                  <h4 className="font-bold text-sm text-cyan-400 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    {isEn
                      ? 'Slides advance unintentionally while casually speaking?'
                      : 'Slide berpindah sendiri saat saya berbicara santai?'}
                  </h4>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {isEn ? (
                      <>
                        Use the <strong>Safety Lock Gesture</strong>: Clench your fist tightly for 3 seconds. The screen will lock with a <em>&ldquo;Locked&rdquo;</em> status badge, freeing you to express yourself with your hands while speaking without triggering accidental slide changes.
                      </>
                    ) : (
                      <>
                        Gunakan fitur <strong>Kunci Gestur</strong>: Kepalkan tangan Anda selama 3 detik. Layar akan terkunci dan menampilkan badge <em>&ldquo;Terkunci&rdquo;</em>, sehingga Anda bebas menggerakkan tangan saat berbicara tanpa khawatir slide berganti.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER BUKU PANDUAN */}
        <div
          className={`px-6 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>GesturePresenter AI &bull; MediaPipe Hands Real-Time</span>
          </div>

          <button
            id="guidebook-bottom-close-btn"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
          >
            {isEn ? 'Got It, Ready to Present' : 'Mengerti, Siap Presentasi'}
          </button>
        </div>
      </div>
    </div>
  );
};
