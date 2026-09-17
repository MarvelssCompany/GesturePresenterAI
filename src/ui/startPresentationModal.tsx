import React, { useState, useRef } from 'react';
import {
  X,
  Layers,
  FileText,
  Upload,
  Sparkles,
  Loader2,
  AlertCircle,
  Play,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { MaterialData, DocumentType } from '../types';
import { parsePptxFile } from '../utils/pptxParser';
import { parseDocxFile } from '../utils/docxParser';
import { WebsiteTheme, DEFAULT_WEBSITE_THEME, WEBSITE_THEMES } from '../data/websiteThemes';
import { SAMPLE_PPTX, SAMPLE_DOCX } from '../data/sampleMaterials';
import { useLanguage } from '../i18n/LanguageContext';

interface StartPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPresentation: (material: MaterialData) => void;
  onAddMaterial: (material: MaterialData) => void;
  currentMaterial?: MaterialData;
  theme?: WebsiteTheme;
}

export const StartPresentationModal: React.FC<StartPresentationModalProps> = ({
  isOpen,
  onClose,
  onStartPresentation,
  onAddMaterial,
  currentMaterial,
  theme,
}) => {
  const activeTheme = theme || WEBSITE_THEMES[DEFAULT_WEBSITE_THEME];
  const isLight = activeTheme.isLight;
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isDragOverPptx, setIsDragOverPptx] = useState(false);
  const [isDragOverDocx, setIsDragOverDocx] = useState(false);

  const pptxInputRef = useRef<HTMLInputElement | null>(null);
  const docxInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File, forcedType?: 'pptx' | 'docx') => {
    setErrorMsg(null);
    const fileName = file.name.toLowerCase();

    const isPptx = forcedType === 'pptx' || fileName.endsWith('.pptx');
    const isDocx = forcedType === 'docx' || fileName.endsWith('.docx');

    if (!isPptx && !isDocx) {
      setErrorMsg(
        isEn
          ? 'File format not supported. Please select a PowerPoint (.pptx) or Word (.docx) document.'
          : 'Format file tidak didukung. Harap pilih file PowerPoint (.pptx) atau dokumen Word (.docx).'
      );
      return;
    }

    setIsProcessing(true);
    setProcessingStatus(
      isEn ? `Reading and processing ${file.name}...` : `Membaca dan memproses ${file.name}...`
    );

    try {
      const type: DocumentType = isPptx ? 'pptx' : 'docx';
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      const fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      let newMaterial: MaterialData;

      if (isPptx) {
        setProcessingStatus(
          isEn
            ? 'Extracting 16:9 presentation slides, text, and visual assets...'
            : 'Mengekstrak slide presentasi 16:9, teks, dan gambar visual...'
        );
        const slides = await parsePptxFile(file);
        if (!slides || slides.length === 0) {
          throw new Error(
            isEn
              ? 'PowerPoint slide deck has no readable slides.'
              : 'Slide PowerPoint tidak memiliki konten yang dapat dibaca.'
          );
        }
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
        setProcessingStatus(
          isEn
            ? 'Converting Word document chapters and A4 formatting...'
            : 'Mengonversi bab dokumen Word dan format paragraf A4...'
        );
        const sections = await parseDocxFile(file);
        if (!sections || sections.length === 0) {
          throw new Error(
            isEn
              ? 'Word document is empty or could not be parsed.'
              : 'Dokumen Word kosong atau tidak dapat diuraikan.'
          );
        }
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

      setProcessingStatus(
        isEn
          ? 'Preparing presentation mode and air-gesture controls...'
          : 'Menyiapkan mode presentasi dan kendali gestur...'
      );
      onAddMaterial(newMaterial);

      // Launch immediately
      setTimeout(() => {
        setIsProcessing(false);
        onClose();
        onStartPresentation(newMaterial);
      }, 300);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(
        err.message ||
          (isEn
            ? 'Failed to process file. Please ensure your .pptx or .docx file is valid.'
            : 'Gagal memproses file. Pastikan format file .pptx atau .docx Anda valid.')
      );
    }
  };

  const handlePptxDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverPptx(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0], 'pptx');
    }
  };

  const handleDocxDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverDocx(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0], 'docx');
    }
  };

  const handleStartWithSample = (sample: MaterialData) => {
    onAddMaterial(sample);
    onClose();
    onStartPresentation(sample);
  };

  return (
    <div
      id="start-presentation-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) {
          onClose();
        }
      }}
    >
      <div
        id="start-presentation-modal-card"
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
          isLight ? 'bg-white border-slate-200 text-slate-900 shadow-2xl' : `${activeTheme.cardBg} border-cyan-500/30 text-white`
        }`}
        style={{
          boxShadow: isLight
            ? '0 25px 60px -15px rgba(0, 0, 0, 0.2), 0 0 30px rgba(14, 165, 233, 0.1)'
            : '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(6, 182, 212, 0.15)',
        }}
      >
        {/* Hidden File Inputs */}
        <input
          ref={pptxInputRef}
          type="file"
          accept=".pptx"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleProcessFile(e.target.files[0], 'pptx');
            }
          }}
        />
        <input
          ref={docxInputRef}
          type="file"
          accept=".docx"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleProcessFile(e.target.files[0], 'docx');
            }
          }}
        />

        {/* Modal Header */}
        <div
          className={`px-6 py-5 border-b flex items-center justify-between transition-colors ${
            isLight ? 'border-slate-200 bg-slate-50/80' : 'border-white/10 bg-white/[0.02]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{
                background: `linear-gradient(135deg, ${activeTheme.primaryColor}, ${activeTheme.secondaryColor})`,
              }}
            >
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {isEn ? 'Start Presentation' : 'Mulai Presentasi'}
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {isEn
                  ? 'Select or drag the document file you want to present'
                  : 'Pilih atau tarik file materi yang ingin Anda presentasikan'}
              </p>
            </div>
          </div>

          <button
            id="modal-close-btn"
            onClick={onClose}
            disabled={isProcessing}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isLight
                ? 'border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            } disabled:opacity-50`}
            title={isEn ? 'Close (Esc)' : 'Tutup (Esc)'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{isEn ? 'Notice' : 'Perhatian'}</p>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Processing State Overlay / Indicator */}
          {isProcessing ? (
            <div
              className={`p-10 rounded-3xl border flex flex-col items-center justify-center text-center space-y-4 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'
              }`}
            >
              <div className="relative">
                <Loader2
                  className="w-12 h-12 animate-spin"
                  style={{ color: activeTheme.primaryColor }}
                />
                <Sparkles
                  className="w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ color: activeTheme.secondaryColor }}
                />
              </div>
              <div>
                <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {isEn ? 'Preparing Presentation...' : 'Menyiapkan Presentasi...'}
                </h3>
                <p className={`text-xs mt-1 font-mono ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  {processingStatus}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* 2 EXPLICIT CHOICES REQUESTED BY USER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* CHOICE 1: POWERPOINT (.PPTX) */}
                <div
                  id="modal-option-pptx"
                  onClick={() => pptxInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOverPptx(true);
                  }}
                  onDragLeave={() => setIsDragOverPptx(false)}
                  onDrop={handlePptxDrop}
                  className={`group relative p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isDragOverPptx
                      ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02] shadow-xl ring-4 ring-indigo-500/20'
                      : isLight
                      ? 'border-slate-200 bg-slate-50/70 hover:border-indigo-500 hover:bg-indigo-50/50 hover:shadow-lg'
                      : 'border-white/10 bg-white/[0.03] hover:border-indigo-400 hover:bg-white/[0.07] hover:shadow-xl'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Layers className="w-6 h-6 text-indigo-500" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
                        Slide 16:9
                      </span>
                    </div>

                    <div>
                      <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'} group-hover:text-indigo-500 transition-colors`}>
                        PowerPoint (.pptx)
                      </h3>
                      <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {isEn
                          ? 'Full-screen slide deck view with virtual laser pointer and smooth transitions.'
                          : 'Tampilan slide presentasi layar penuh dengan laser pointer virtual dan transisi mulus.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-indigo-500/20">
                    <div
                      className={`py-3 px-4 rounded-xl border border-dashed text-center transition flex flex-col items-center justify-center gap-1.5 ${
                        isDragOverPptx
                          ? 'border-indigo-500 bg-indigo-500/20'
                          : isLight
                          ? 'border-indigo-300 bg-white text-indigo-700'
                          : 'border-indigo-500/40 bg-indigo-950/30 text-indigo-300'
                      }`}
                    >
                      <Upload className="w-4 h-4 animate-bounce" />
                      <span className="text-xs font-bold">
                        {isEn ? 'Choose or Drag .pptx File' : 'Pilih Atau Tarik File .pptx'}
                      </span>
                      <span className="text-[10px] opacity-75">
                        {isEn ? 'Click to browse files' : 'Klik untuk telusuri file'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CHOICE 2: MICROSOFT WORD (.DOCX) */}
                <div
                  id="modal-option-docx"
                  onClick={() => docxInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOverDocx(true);
                  }}
                  onDragLeave={() => setIsDragOverDocx(false)}
                  onDrop={handleDocxDrop}
                  className={`group relative p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isDragOverDocx
                      ? 'border-cyan-500 bg-cyan-500/10 scale-[1.02] shadow-xl ring-4 ring-cyan-500/20'
                      : isLight
                      ? 'border-slate-200 bg-slate-50/70 hover:border-cyan-500 hover:bg-cyan-50/50 hover:shadow-lg'
                      : 'border-white/10 bg-white/[0.03] hover:border-cyan-400 hover:bg-white/[0.07] hover:shadow-xl'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6 text-cyan-500" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
                        {isEn ? 'Vertical A4' : 'Vertikal A4'}
                      </span>
                    </div>

                    <div>
                      <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'} group-hover:text-cyan-500 transition-colors`}>
                        Microsoft Word (.docx)
                      </h3>
                      <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {isEn
                          ? 'Elegant chapter reading mode with touchless vertical page scrolling via hand gestures.'
                          : 'Mode pembacaan bab elegan dengan scroll halaman vertikal nirkontak lewat lambaian tangan.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-cyan-500/20">
                    <div
                      className={`py-3 px-4 rounded-xl border border-dashed text-center transition flex flex-col items-center justify-center gap-1.5 ${
                        isDragOverDocx
                          ? 'border-cyan-500 bg-cyan-500/20'
                          : isLight
                          ? 'border-cyan-300 bg-white text-cyan-700'
                          : 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300'
                      }`}
                    >
                      <Upload className="w-4 h-4 animate-bounce" />
                      <span className="text-xs font-bold">
                        {isEn ? 'Choose or Drag .docx File' : 'Pilih Atau Tarik File .docx'}
                      </span>
                      <span className="text-[10px] opacity-75">
                        {isEn ? 'Click to browse files' : 'Klik untuk telusuri file'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Start Options (If user wants to test right away without looking for files) */}
              <div
                className={`p-4 rounded-2xl border transition-colors ${
                  isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                      {isEn
                        ? 'Or start right away with interactive sample material:'
                        : 'Atau mulai langsung dengan contoh materi interaktif:'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      id="modal-sample-pptx-btn"
                      onClick={() => handleStartWithSample(SAMPLE_PPTX)}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        isLight
                          ? 'bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border-indigo-500/30'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{isEn ? 'Sample PPTX' : 'Contoh PPTX'}</span>
                    </button>

                    <button
                      id="modal-sample-docx-btn"
                      onClick={() => handleStartWithSample(SAMPLE_DOCX)}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        isLight
                          ? 'bg-white hover:bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border-cyan-500/30'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isEn ? 'Sample Word' : 'Contoh Word'}</span>
                    </button>

                    {currentMaterial && (
                      <button
                        id="modal-continue-current-btn"
                        onClick={() => {
                          onClose();
                          onStartPresentation(currentMaterial);
                        }}
                        className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${activeTheme.accentBtn}`}
                        title={isEn ? `Continue with ${currentMaterial.title}` : `Lanjutkan dengan ${currentMaterial.title}`}
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span className="truncate max-w-[120px]">
                          {currentMaterial.title}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
