import React, { useState, useRef } from 'react';
import {
  FileCode,
  FileText,
  Upload,
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  Clock,
  Layers,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { MaterialData, DocumentType } from '../types';
import { parsePptxFile } from '../utils/pptxParser';
import { parseDocxFile } from '../utils/docxParser';
import { SAMPLE_PPTX, SAMPLE_DOCX } from '../data/sampleMaterials';
import { WebsiteTheme, DEFAULT_WEBSITE_THEME, WEBSITE_THEMES } from '../data/websiteThemes';
import { StartPresentationModal } from './startPresentationModal';
import { useLanguage } from '../i18n/LanguageContext';

interface DashboardProps {
  onStartPresentation: (material: MaterialData) => void;
  onOpenGestureSettings: () => void;
  materials: MaterialData[];
  onAddMaterial: (material: MaterialData) => void;
  theme?: WebsiteTheme;
  onOpenStartModal?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartPresentation,
  onOpenGestureSettings,
  materials,
  onAddMaterial,
  theme,
  onOpenStartModal,
}) => {
  const activeTheme = theme || WEBSITE_THEMES[DEFAULT_WEBSITE_THEME];
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  const [selectedMaterial, setSelectedMaterial] = useState<MaterialData>(materials[0] || SAMPLE_PPTX);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileProcess = async (file: File) => {
    setUploadError(null);
    const fileName = file.name.toLowerCase();

    const isPptx = fileName.endsWith('.pptx');
    const isDocx = fileName.endsWith('.docx');

    if (!isPptx && !isDocx) {
      setUploadError(
        isEn ? 'Please upload a .pptx or .docx file.' : 'Harap unggah file .pptx atau .docx.'
      );
      return;
    }

    setIsUploading(true);

    try {
      const type: DocumentType = isPptx ? 'pptx' : 'docx';
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      const fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      let newMaterial: MaterialData;

      if (isPptx) {
        const slides = await parsePptxFile(file);
        newMaterial = {
          id: `pptx-${Date.now()}`,
          title: slides[0]?.title || cleanTitle,
          fileName: file.name,
          type: 'pptx',
          fileSize,
          createdAt: new Date().toISOString().split('T')[0],
          slides,
          totalItems: slides.length,
        };
      } else {
        const sections = await parseDocxFile(file);
        newMaterial = {
          id: `docx-${Date.now()}`,
          title: sections[0]?.title || cleanTitle,
          fileName: file.name,
          type: 'docx',
          fileSize,
          createdAt: new Date().toISOString().split('T')[0],
          sections,
          totalItems: sections.length,
        };
      }

      onAddMaterial(newMaterial);
      setSelectedMaterial(newMaterial);
    } catch (err: any) {
      setUploadError(
        err.message ||
          (isEn
            ? 'Failed to parse file. Please verify it is a valid .pptx or .docx document.'
            : 'Gagal memproses file. Pastikan dokumen .pptx atau .docx Anda valid.')
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* HERO SECTION */}
      <div className={`relative rounded-3xl overflow-hidden border p-8 sm:p-12 md:p-16 transition-all duration-300 ${activeTheme.heroCardBg}`}>
        {/* Glow ambient spots matching selected theme */}
        <div
          className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-30"
          style={{ backgroundColor: activeTheme.primaryColor }}
        />
        <div
          className="absolute bottom-0 right-10 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-25"
          style={{ backgroundColor: activeTheme.secondaryColor }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold"
              style={{
                backgroundColor: `${activeTheme.primaryColor}18`,
                borderColor: `${activeTheme.primaryColor}40`,
                color: activeTheme.isLight ? activeTheme.secondaryColor : '#e0f2fe',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: activeTheme.primaryColor }} />
              <span>Next-Gen Presentation Platform</span>
            </div>

            <h1 className={`text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight font-sans ${activeTheme.headingColor}`}>
              Present Smarter.{' '}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: `linear-gradient(to right, ${activeTheme.primaryColor}, ${activeTheme.secondaryColor})`,
                }}
              >
                Control Naturally.
              </span>
            </h1>

            <p className={`text-base sm:text-lg max-w-xl leading-relaxed ${activeTheme.textSecondary}`}>
              {isEn
                ? 'Smart presentation platform with natural air hand gesture control. Upload PowerPoint (.pptx) or Word (.docx), interact smoothly, and guide your audience hands-free.'
                : 'Platform presentasi cerdas dengan kendali gestur tangan alami. Unggah PowerPoint (.pptx) atau Word (.docx), integrasi AI interaktif, dan pandu audiens tanpa sentuh mouse.'}
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-start-presenting-btn"
                onClick={() => (onOpenStartModal ? onOpenStartModal() : setIsStartModalOpen(true))}
                className={`px-6 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2.5 transition cursor-pointer hover:scale-[1.02] shadow-lg ${activeTheme.accentBtn}`}
                title={
                  isEn
                    ? 'Select or Drag PPTX / DOCX File to Start Presentation'
                    : 'Pilih atau Tarik File PPTX / DOCX untuk Mulai Presentasi'
                }
              >
                <Play className="w-4 h-4 fill-white" />
                {isEn ? 'Start Presentation' : 'Mulai Presentasi'}
              </button>

              <button
                id="hero-calibrate-gestures-btn"
                onClick={onOpenGestureSettings}
                className={`px-5 py-3.5 rounded-xl border font-semibold text-sm flex items-center gap-2 transition cursor-pointer ${
                  activeTheme.isLight
                    ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-sm'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-900/80 hover:bg-slate-850 text-slate-200'
                }`}
              >
                <Sliders className="w-4 h-4" style={{ color: activeTheme.primaryColor }} />
                {isEn ? 'Settings' : 'Pengaturan'}
              </button>
            </div>

            {/* Feature badges */}
            <div className={`flex items-center gap-6 pt-4 text-xs ${activeTheme.textMuted}`}>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {isEn ? 'Swipe Left & Right' : 'Swipe Kanan & Kiri'}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {isEn ? 'Virtual Laser Pointer' : 'Laser Pointer Virtual'}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4" style={{ color: activeTheme.primaryColor }} />
                {isEn ? '100% Private Camera' : 'Kamera Privat 100%'}
              </span>
            </div>
          </div>

          {/* Right Visual: Stylized Hand Landmark Illustration */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              className={`relative w-full max-w-sm aspect-square rounded-2xl border p-6 flex flex-col justify-between shadow-2xl transition-all duration-300 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}
            >
              <div
                className={`flex items-center justify-between text-xs pb-2 border-b ${
                  activeTheme.isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
                }`}
              >
                <span className="font-mono flex items-center gap-1.5 font-bold" style={{ color: activeTheme.primaryColor }}>
                  <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: activeTheme.primaryColor }} />
                  MediaPipe 21 Landmarks
                </span>
                <span className="font-mono text-[10px]">Real-Time Tracking</span>
              </div>

              {/* Hand Vector Joints Drawing */}
              <div className="relative flex-1 flex items-center justify-center my-4">
                <svg
                  viewBox="0 0 200 220"
                  className="w-48 h-48 drop-shadow-[0_0_12px_rgba(56,189,248,0.3)]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Bone Lines */}
                  <line x1="100" y1="190" x2="60" y2="150" stroke={activeTheme.primaryColor} strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="60" y1="150" x2="40" y2="120" stroke={activeTheme.primaryColor} strokeWidth="2" />
                  <line x1="40" y1="120" x2="30" y2="90" stroke={activeTheme.primaryColor} strokeWidth="2" />
                  <line x1="30" y1="90" x2="25" y2="70" stroke="#10b981" strokeWidth="2" />

                  {/* Index Finger (Pointing) */}
                  <line x1="100" y1="190" x2="80" y2="130" stroke={activeTheme.primaryColor} strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="80" y1="130" x2="75" y2="90" stroke={activeTheme.primaryColor} strokeWidth="2" />
                  <line x1="75" y1="90" x2="70" y2="55" stroke={activeTheme.primaryColor} strokeWidth="2" />
                  <line x1="70" y1="55" x2="68" y2="25" stroke="#f43f5e" strokeWidth="2.5" />

                  {/* Middle Finger */}
                  <line x1="100" y1="190" x2="100" y2="130" stroke={activeTheme.primaryColor} strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="100" y1="130" x2="100" y2="95" stroke={activeTheme.primaryColor} strokeWidth="2" />
                  <line x1="100" y1="95" x2="100" y2="70" stroke={activeTheme.primaryColor} strokeWidth="2" />
                  <line x1="100" y1="70" x2="100" y2="45" stroke={activeTheme.primaryColor} strokeWidth="2" />

                  {/* Ring Finger */}
                  <line x1="100" y1="190" x2="120" y2="135" stroke={activeTheme.primaryColor} strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="120" y1="135" x2="125" y2="100" stroke={activeTheme.primaryColor} strokeWidth="2" />
                  <line x1="125" y1="100" x2="128" y2="75" stroke={activeTheme.primaryColor} strokeWidth="2" />
                  <line x1="128" y1="75" x2="130" y2="55" stroke={activeTheme.primaryColor} strokeWidth="2" />

                  {/* Pinky */}
                  <line x1="100" y1="190" x2="140" y2="145" stroke={activeTheme.primaryColor} strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="140" y1="145" x2="150" y2="120" stroke={activeTheme.primaryColor} strokeWidth="2" />
                  <line x1="150" y1="120" x2="155" y2="95" stroke={activeTheme.primaryColor} strokeWidth="2" />
                  <line x1="155" y1="95" x2="160" y2="80" stroke={activeTheme.primaryColor} strokeWidth="2" />

                  {/* Joints */}
                  <circle cx="100" cy="190" r="5" fill={activeTheme.secondaryColor} />
                  {/* Thumb */}
                  <circle cx="60" cy="150" r="3.5" fill={activeTheme.primaryColor} />
                  <circle cx="40" cy="120" r="3.5" fill={activeTheme.primaryColor} />
                  <circle cx="30" cy="90" r="3.5" fill={activeTheme.primaryColor} />
                  <circle cx="25" cy="70" r="4.5" fill="#10b981" />
                  {/* Index Tip (Laser) */}
                  <circle cx="80" cy="130" r="3.5" fill={activeTheme.primaryColor} />
                  <circle cx="75" cy="90" r="3.5" fill={activeTheme.primaryColor} />
                  <circle cx="70" cy="55" r="3.5" fill={activeTheme.primaryColor} />
                  <circle cx="68" cy="25" r="5.5" fill="#f43f5e" className="animate-pulse" />
                  {/* Middle */}
                  <circle cx="100" cy="130" r="3.5" fill={activeTheme.primaryColor} />
                  <circle cx="100" cy="95" r="3.5" fill={activeTheme.primaryColor} />
                  <circle cx="100" cy="70" r="3.5" fill={activeTheme.primaryColor} />
                  <circle cx="100" cy="45" r="3.5" fill={activeTheme.primaryColor} />
                  {/* Ring */}
                  <circle cx="120" cy="135" r="3.5" fill={activeTheme.primaryColor} />
                  <circle cx="125" cy="100" r="3.5" fill={activeTheme.primaryColor} />
                  <circle cx="128" cy="75" r="3.5" fill={activeTheme.primaryColor} />
                  <circle cx="130" cy="55" r="3.5" fill={activeTheme.primaryColor} />
                  {/* Pinky */}
                  <circle cx="140" cy="145" r="3.5" fill={activeTheme.primaryColor} />
                  <circle cx="150" cy="120" r="3.5" fill={activeTheme.primaryColor} />
                  <circle cx="155" cy="95" r="3.5" fill={activeTheme.primaryColor} />
                  <circle cx="160" cy="80" r="3.5" fill={activeTheme.primaryColor} />
                </svg>
              </div>

              <div
                className={`flex items-center justify-between text-[11px] p-2 rounded-lg border ${
                  activeTheme.isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <span className="flex items-center gap-1 text-rose-500 font-mono font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Index 8: Laser
                </span>
                <span className="flex items-center gap-1 text-emerald-500 font-mono font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Thumb 4: Pinch
                </span>
                <span className="font-mono">Wrist 0: Swipe</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE NEW SESSION / UPLOAD SECTION */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${activeTheme.headingColor}`}>
              {isEn ? 'Create New Presentation Session' : 'Buat Sesi Presentasi Baru'}
            </h2>
            <p className={`text-xs sm:text-sm ${activeTheme.textMuted} mt-0.5`}>
              {isEn
                ? 'Upload PowerPoint (.pptx) or Microsoft Word (.docx) documents. Instant processing and ready to present.'
                : 'Unggah file PowerPoint (.pptx) atau dokumen Microsoft Word (.docx). Pemrosesan instan dan siap dipresentasikan.'}
            </p>
          </div>
        </div>

        {/* Upload Error Banner */}
        {uploadError && (
          <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/30 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <p className="font-medium">{uploadError}</p>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pptx,.docx"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileProcess(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        {/* Upload Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: PowerPoint (.pptx) */}
          <div
            id="card-upload-pptx"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`group p-8 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden ${activeTheme.cardBg} ${activeTheme.cardBorder} ${
              isDragOver ? 'ring-2 ring-indigo-400 scale-[1.01]' : 'hover:scale-[1.01]'
            }`}
          >
            <div className="space-y-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition"
                style={{
                  backgroundColor: `${activeTheme.primaryColor}18`,
                  color: activeTheme.primaryColor,
                }}
              >
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <span
                  className="text-xs font-mono font-bold tracking-wider uppercase"
                  style={{ color: activeTheme.primaryColor }}
                >
                  {isEn ? 'Presentation Format' : 'Format Presentasi'}
                </span>
                <h3 className={`text-xl font-bold mt-1 ${activeTheme.headingColor}`}>
                  PowerPoint (.pptx)
                </h3>
                <p className={`text-xs mt-2 leading-relaxed ${activeTheme.textSecondary}`}>
                  {isEn
                    ? 'Upload PowerPoint slide decks for hands-free gesture navigation, precise laser pointers, and full-screen experience.'
                    : 'Unggah slide presentasi PowerPoint Anda untuk navigasi gestur tangan, titik pointer laser presisi, dan mode layar penuh.'}
                </p>
              </div>
            </div>

            <div
              className={`pt-6 mt-6 border-t flex items-center justify-between text-xs font-semibold ${
                activeTheme.isLight ? 'border-slate-200' : 'border-slate-800/80'
              }`}
              style={{ color: activeTheme.primaryColor }}
            >
              <span className="flex items-center gap-1.5">
                <Upload className="w-4 h-4" />
                {isEn ? 'Select or drag .pptx file here' : 'Pilih atau Tarik file .pptx ke sini'}
              </span>
              <span className="group-hover:translate-x-1 transition">&rarr;</span>
            </div>
          </div>

          {/* Card 2: Microsoft Word (.docx) */}
          <div
            id="card-upload-docx"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`group p-8 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden ${activeTheme.cardBg} ${activeTheme.cardBorder} ${
              isDragOver ? 'ring-2 ring-cyan-400 scale-[1.01]' : 'hover:scale-[1.01]'
            }`}
          >
            <div className="space-y-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition"
                style={{
                  backgroundColor: `${activeTheme.secondaryColor}18`,
                  color: activeTheme.secondaryColor,
                }}
              >
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span
                  className="text-xs font-mono font-bold tracking-wider uppercase"
                  style={{ color: activeTheme.secondaryColor }}
                >
                  {isEn ? 'Document Format' : 'Format Dokumen'}
                </span>
                <h3 className={`text-xl font-bold mt-1 ${activeTheme.headingColor}`}>
                  Microsoft Word (.docx)
                </h3>
                <p className={`text-xs mt-2 leading-relaxed ${activeTheme.textSecondary}`}>
                  {isEn
                    ? 'Upload Word documents for elegant reading mode. Scroll through pages touchlessly with hand waves.'
                    : 'Unggah dokumen Word untuk mode pembacaan elegan. Gulir halaman secara nirkontak dengan lambaian tangan.'}
                </p>
              </div>
            </div>

            <div
              className={`pt-6 mt-6 border-t flex items-center justify-between text-xs font-semibold ${
                activeTheme.isLight ? 'border-slate-200' : 'border-slate-800/80'
              }`}
              style={{ color: activeTheme.secondaryColor }}
            >
              <span className="flex items-center gap-1.5">
                <Upload className="w-4 h-4" />
                {isEn ? 'Select or drag .docx file here' : 'Pilih atau Tarik file .docx ke sini'}
              </span>
              <span className="group-hover:translate-x-1 transition">&rarr;</span>
            </div>
          </div>
        </div>

        {/* Quick Demo Pre-load Samples */}
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}
        >
          <div className={`flex items-center gap-3 text-xs ${activeTheme.textSecondary}`}>
            <Sparkles className="w-4 h-4 shrink-0" style={{ color: activeTheme.primaryColor }} />
            <span>
              {isEn
                ? 'No files ready? Test right away using interactive sample material:'
                : 'Belum memiliki file? Uji coba langsung menggunakan contoh materi interaktif:'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="try-sample-pptx-btn"
              onClick={() => {
                onAddMaterial(SAMPLE_PPTX);
                setSelectedMaterial(SAMPLE_PPTX);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                activeTheme.isLight
                  ? 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                  : 'bg-indigo-600/20 hover:bg-indigo-600/30 border-indigo-500/30 text-indigo-300'
              }`}
            >
              {isEn ? 'Try Sample PPTX (5 Slides)' : 'Coba Sample PPTX (5 Slide)'}
            </button>
            <button
              id="try-sample-docx-btn"
              onClick={() => {
                onAddMaterial(SAMPLE_DOCX);
                setSelectedMaterial(SAMPLE_DOCX);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                activeTheme.isLight
                  ? 'border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700'
                  : 'bg-cyan-600/20 hover:bg-cyan-600/30 border-cyan-500/30 text-cyan-300'
              }`}
            >
              {isEn ? 'Try Sample Word (4 Chapters)' : 'Coba Sample Word (4 Bab)'}
            </button>
          </div>
        </div>
      </div>

      {/* SELECTED MATERIAL INSPECTOR & PREVIEW */}
      {selectedMaterial && (
        <div className={`p-6 rounded-2xl border shadow-xl space-y-6 transition-all duration-300 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}>
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
              activeTheme.isLight ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wide uppercase border"
                  style={{
                    backgroundColor: `${activeTheme.primaryColor}18`,
                    borderColor: `${activeTheme.primaryColor}40`,
                    color: activeTheme.primaryColor,
                  }}
                >
                  {selectedMaterial.type.toUpperCase()}
                </span>
                <span className={`text-xs font-mono ${activeTheme.textMuted}`}>
                  {selectedMaterial.totalItems} {selectedMaterial.type === 'pptx' ? (isEn ? 'Slides' : 'Slide') : (isEn ? 'Sections' : 'Bab')} &bull; {selectedMaterial.fileSize}
                </span>
              </div>
              <h3 className={`text-lg sm:text-xl font-bold ${activeTheme.headingColor}`}>
                {selectedMaterial.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="inspect-start-presentation-btn"
                onClick={() => onStartPresentation(selectedMaterial)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer hover:scale-105 ${activeTheme.accentBtn}`}
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                {isEn ? 'Start Presentation' : 'Mulai Presentasi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECENT MATERIALS LIST */}
      <div className="space-y-4">
        <h3 className={`text-lg font-bold ${activeTheme.headingColor}`}>
          {isEn ? 'Recent Materials' : 'Materi Terkini'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedMaterial(item)}
              className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                selectedMaterial?.id === item.id
                  ? 'ring-2 ring-cyan-400 ' + activeTheme.cardBg
                  : activeTheme.cardBg + ' ' + activeTheme.cardBorder
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-bold"
                  style={{
                    backgroundColor: `${activeTheme.primaryColor}20`,
                    color: activeTheme.primaryColor,
                  }}
                >
                  {item.type === 'pptx' ? <Layers className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className={`text-sm font-semibold line-clamp-1 ${activeTheme.headingColor}`}>
                    {item.title}
                  </h4>
                  <p className={`text-xs font-mono mt-0.5 ${activeTheme.textMuted}`}>
                    {item.type.toUpperCase()} &bull; {item.totalItems} {item.type === 'pptx' ? (isEn ? 'slides' : 'slide') : (isEn ? 'sections' : 'bab')} &bull; {item.fileSize}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartPresentation(item);
                }}
                className={`p-2 rounded-lg transition ${
                  activeTheme.isLight
                    ? 'bg-slate-100 hover:bg-sky-600 hover:text-white text-slate-700'
                    : 'bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300'
                }`}
                title={isEn ? 'Start Presentation' : 'Mulai Presentasi'}
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* START PRESENTATION MODAL (2 Choices: PPTX & DOCX) */}
      <StartPresentationModal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        onStartPresentation={onStartPresentation}
        onAddMaterial={(mat) => {
          onAddMaterial(mat);
          setSelectedMaterial(mat);
        }}
        currentMaterial={selectedMaterial}
        theme={activeTheme}
      />
    </div>
  );
};
