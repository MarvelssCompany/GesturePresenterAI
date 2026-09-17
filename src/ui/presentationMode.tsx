import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
  Camera,
  FileText,
  Volume2,
  VolumeX,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Sliders,
  Play,
  Pause,
  Layers,
  BookOpen,
} from 'lucide-react';
import {
  MaterialData,
  GestureState,
  GestureType,
  GestureAction,
  AIAnalysisData,
  PointerFrameData,
  PptThemeId,
  GestureConfig,
  WebsiteThemeId,
} from '../types';
import { MiniCameraOverlay } from './miniCameraOverlay';
import { soundEffects } from '../utils/audioEffects';
import { VirtualLaserOverlay } from './virtualLaserOverlay';
import { smoothScrollEngine } from '../utils/smoothScrollEngine';
import { PPT_THEMES, DEFAULT_PPT_THEME } from '../data/pptThemes';
import { WEBSITE_THEMES } from '../data/websiteThemes';
import { PresentationSettingsModal } from './presentationSettingsModal';
import { GuidebookModal } from './guidebookModal';
import { useLanguage } from '../i18n/LanguageContext';

const mapWebsiteThemeToPptTheme = (themeId?: string): PptThemeId => {
  switch (themeId) {
    case 'ocean-midnight':
      return 'office-blue';
    case 'emerald-obsidian':
      return 'emerald-tech';
    case 'crimson-eclipse':
      return 'executive-crimson';
    case 'pure-white':
      return 'pure-pearl-white';
    default:
      return 'office-blue';
  }
};

interface PresentationModeProps {
  material: MaterialData;
  onExit: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isCameraActive: boolean;
  cameraError: string | null;
  fps: number;
  gestureState: GestureState;
  onToggleCamera: () => void;
  setActionListener: (cb: (action: GestureAction, gesture: GestureType) => void) => void;
  setPointerListener: (cb: (data: PointerFrameData) => void) => void;
  setScrollListener?: (cb: (deltaY: number) => void) => void;
  setZoomListener?: (cb: (scale: number) => void) => void;
  setZoomScale?: (scale: number) => void;
  resetZoomMode?: () => void;
  setLocked?: (locked: boolean) => void;
  onUpdateMaterialAnalysis?: (analysis: AIAnalysisData) => void;
  gestureConfig?: GestureConfig;
  onChangeGestureConfig?: (newConfig: Partial<GestureConfig>) => void;
  currentWebsiteTheme?: WebsiteThemeId;
  onSelectWebsiteTheme?: (theme: WebsiteThemeId) => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  material,
  onExit,
  videoRef,
  canvasRef,
  isCameraActive,
  cameraError,
  fps,
  gestureState,
  onToggleCamera,
  setActionListener,
  setPointerListener,
  setScrollListener,
  setZoomListener,
  setZoomScale,
  resetZoomMode,
  setLocked,
  onUpdateMaterialAnalysis,
  gestureConfig,
  onChangeGestureConfig,
  currentWebsiteTheme = 'ocean-midnight',
  onSelectWebsiteTheme = (_theme: WebsiteThemeId) => {},
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showCameraOverlay, setShowCameraOverlay] = useState<boolean>(true);
  const [isLaserEnabled, setIsLaserEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showNotesDrawer, setShowNotesDrawer] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGuidebookOpen, setIsGuidebookOpen] = useState<boolean>(false);
  const { language, t } = useLanguage();

  // Active Website Theme Configuration
  const websiteThemeConfig = WEBSITE_THEMES[currentWebsiteTheme] || WEBSITE_THEMES['ocean-midnight'];
  const isLight = websiteThemeConfig.isLight;

  // PowerPoint Theme synced directly with selected website theme
  const [pptTheme, setPptTheme] = useState<PptThemeId>(() => {
    return mapWebsiteThemeToPptTheme(currentWebsiteTheme);
  });
  const [slideTransition, setSlideTransition] = useState<'wipe' | 'push' | 'fade' | 'zoom'>('wipe');

  // Automatically update slide canvas theme when website theme changes
  useEffect(() => {
    const matched = mapWebsiteThemeToPptTheme(currentWebsiteTheme);
    setPptTheme(matched);
  }, [currentWebsiteTheme]);

  // Sync document body background & html dark class while in presentation
  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    document.body.style.backgroundColor = websiteThemeConfig.bodyBgHex;
    document.body.style.color = isLight ? '#0f172a' : '#f8fafc';
  }, [websiteThemeConfig, isLight]);

  const handleThemeChange = (themeId: PptThemeId) => {
    setPptTheme(themeId);
    try {
      localStorage.setItem('ppt_theme_pref', themeId);
    } catch (e) {}
  };

  const handleWebsiteThemeSelect = (themeId: WebsiteThemeId) => {
    onSelectWebsiteTheme(themeId);
    setPptTheme(mapWebsiteThemeToPptTheme(themeId));
  };

  const activeTheme = PPT_THEMES[pptTheme] || PPT_THEMES[mapWebsiteThemeToPptTheme(currentWebsiteTheme)] || PPT_THEMES['office-blue'];

  // Dynamic Word (.docx) styling matching user-selected theme
  const getWordCardStyle = () => {
    switch (currentWebsiteTheme) {
      case 'pure-white':
        return {
          card: 'bg-white border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.08)] text-slate-900',
          headerBorder: 'border-slate-200 text-slate-500',
          badge: 'bg-sky-100 text-sky-800 border-sky-300',
          fileName: 'text-slate-800',
          counter: 'bg-slate-100 text-slate-700 border-slate-200',
          title: 'text-slate-950',
          paragraphs: 'text-slate-700',
          bulletsMarker: 'marker:text-sky-600',
          tableBorder: 'border-slate-300 bg-white',
          tableThead: 'bg-sky-50 text-sky-900 border-b border-slate-200',
          tableTbody: 'divide-slate-200 text-slate-800',
          tableAlternate: 'bg-slate-50/70',
          footerBorder: 'border-slate-200 text-slate-500',
          audioBtn: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 shadow-sm',
          activeDot: 'bg-sky-600 scale-125 shadow-[0_0_8px_rgba(2,132,199,0.5)]',
          inactiveDot: 'bg-slate-300 hover:bg-slate-400',
        };
      case 'emerald-obsidian':
        return {
          card: 'bg-[#0a2f21]/95 border-emerald-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] text-slate-100',
          headerBorder: 'border-emerald-500/20 text-emerald-300/80',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          fileName: 'text-emerald-100',
          counter: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30',
          title: 'text-white',
          paragraphs: 'text-emerald-100/90',
          bulletsMarker: 'marker:text-emerald-400',
          tableBorder: 'border-emerald-500/30 bg-emerald-950/60',
          tableThead: 'bg-emerald-900/80 text-emerald-300 border-b border-emerald-800/60',
          tableTbody: 'divide-emerald-900/50 text-slate-200',
          tableAlternate: 'bg-white/[0.02]',
          footerBorder: 'border-emerald-500/20 text-emerald-300/70',
          audioBtn: 'bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900/80 border-emerald-500/30',
          activeDot: 'bg-emerald-400 scale-125 shadow-[0_0_8px_#34d399]',
          inactiveDot: 'bg-emerald-950 border border-emerald-800/40 hover:bg-emerald-900',
        };
      case 'crimson-eclipse':
        return {
          card: 'bg-[#310b1a]/95 border-rose-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] text-slate-100',
          headerBorder: 'border-rose-500/20 text-rose-300/80',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          fileName: 'text-rose-100',
          counter: 'bg-rose-950/80 text-rose-300 border-rose-500/30',
          title: 'text-white',
          paragraphs: 'text-rose-100/90',
          bulletsMarker: 'marker:text-rose-400',
          tableBorder: 'border-rose-500/30 bg-rose-950/60',
          tableThead: 'bg-rose-900/80 text-amber-300 border-b border-rose-800/60',
          tableTbody: 'divide-rose-900/50 text-slate-200',
          tableAlternate: 'bg-white/[0.02]',
          footerBorder: 'border-rose-500/20 text-rose-300/70',
          audioBtn: 'bg-rose-950/80 text-rose-300 hover:bg-rose-900/80 border-rose-500/30',
          activeDot: 'bg-rose-500 scale-125 shadow-[0_0_8px_#f43f5e]',
          inactiveDot: 'bg-rose-950 border border-rose-800/40 hover:bg-rose-900',
        };
      case 'ocean-midnight':
      default:
        return {
          card: 'bg-[#0c223c]/95 border-cyan-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] text-slate-100',
          headerBorder: 'border-cyan-500/20 text-cyan-300/80',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          fileName: 'text-slate-200',
          counter: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30',
          title: 'text-white',
          paragraphs: 'text-slate-200',
          bulletsMarker: 'marker:text-cyan-400',
          tableBorder: 'border-cyan-500/30 bg-cyan-950/60',
          tableThead: 'bg-blue-950/90 text-cyan-300 border-b border-blue-800/60',
          tableTbody: 'divide-cyan-900/50 text-slate-200',
          tableAlternate: 'bg-white/[0.02]',
          footerBorder: 'border-cyan-500/20 text-cyan-300/70',
          audioBtn: 'bg-cyan-950/80 text-cyan-300 hover:bg-cyan-900/80 border-cyan-500/30',
          activeDot: 'bg-cyan-400 scale-125 shadow-[0_0_8px_#38bdf8]',
          inactiveDot: 'bg-cyan-950 border border-cyan-800/40 hover:bg-cyan-900',
        };
    }
  };

  const wordStyle = getWordCardStyle();

  // Zoom & Scale State (Controlled by 2 Fingers: Index + Thumb)
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Audio & Sound Effects State
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollableContentRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<any>(null);

  const totalItems = material.type === 'pptx'
    ? material.slides?.length || 1
    : material.sections?.length || 1;

  // Auto-hide controls dock after inactivity
  const scheduleControlsHide = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 4500);
  }, []);

  // Universal smooth scroll content handler (handles Word body, Slide body, and Zoom container)
  const scrollActiveContent = useCallback((deltaY: number) => {
    smoothScrollEngine.scrollContinuous(deltaY);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev < totalItems - 1) {
        soundEffects.playSwipeWhoosh('right');
        return prev + 1;
      }
      return prev;
    });
  }, [totalItems]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev > 0) {
        soundEffects.playSwipeWhoosh('left');
        return prev - 1;
      }
      return prev;
    });
  }, []);

  // Zoom handlers (2 fingers)
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => {
      const next = Math.min(2.5, +(prev + 0.15).toFixed(2));
      soundEffects.playZoomChirp(true);
      if (setZoomScale) setZoomScale(next);
      return next;
    });
  }, [setZoomScale]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => {
      const next = Math.max(0.7, +(prev - 0.15).toFixed(2));
      soundEffects.playZoomChirp(false);
      if (setZoomScale) setZoomScale(next);
      return next;
    });
  }, [setZoomScale]);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1.0);
    if (setZoomScale) setZoomScale(1.0);
    if (resetZoomMode) resetZoomMode();
  }, [setZoomScale, resetZoomMode]);

  // Scroll handlers (1 index finger usap atas / bawah)
  const handleScrollUp = useCallback(() => {
    smoothScrollEngine.scrollFlick('up', 32);
  }, []);

  const handleScrollDown = useCallback(() => {
    smoothScrollEngine.scrollFlick('down', 32);
  }, []);

  // Wire up gesture actions from camera hook
  useEffect(() => {
    setActionListener((action, gesture) => {
      scheduleControlsHide();

      switch (action) {
        case 'NEXT_SLIDE':
          handleNext();
          break;
        case 'PREV_SLIDE':
          handlePrev();
          break;
        case 'ZOOM_IN':
          handleZoomIn();
          break;
        case 'ZOOM_OUT':
          handleZoomOut();
          break;
        case 'RESET_ZOOM':
          handleResetZoom();
          break;
        case 'SCROLL_UP':
          handleScrollUp();
          break;
        case 'SCROLL_DOWN':
          handleScrollDown();
          break;
        case 'TOGGLE_CONTROLS':
          setShowControls((prev) => !prev);
          break;
        case 'LOCK_SYSTEM':
          smoothScrollEngine.stop();
          break;
        case 'UNLOCK_SYSTEM':
          break;
      }
    });

    if (setScrollListener) {
      setScrollListener((deltaY) => {
        if (Math.abs(deltaY) > 0.4) {
          smoothScrollEngine.scrollContinuous(deltaY);
        }
      });
    }

    if (setZoomListener) {
      setZoomListener((scale) => {
        setZoomLevel(scale);
      });
    }
  }, [
    handleNext,
    handlePrev,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleScrollUp,
    handleScrollDown,
    setActionListener,
    setPointerListener,
    setScrollListener,
    setZoomListener,
    zoomLevel,
    scheduleControlsHide,
  ]);

  // Audio Narration toggle
  const toggleAudioNarration = () => {
    const currentSlide = material.slides?.[currentIndex];
    if (audioRef.current && currentSlide?.audioUrl) {
      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {});
      }
    } else {
      // Use Web Speech API if no dedicated audio file
      if ('speechSynthesis' in window) {
        if (isPlayingAudio) {
          window.speechSynthesis.cancel();
          setIsPlayingAudio(false);
        } else {
          const textToSpeak = currentSlide
            ? `${currentSlide.title}. ${currentSlide.bullets.join('. ')}`
            : material.sections?.[currentIndex]?.paragraphs.join('. ') || '';

          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.lang = language === 'en' ? 'en-US' : 'id-ID';
          utterance.rate = 1.0;
          utterance.onend = () => setIsPlayingAudio(false);
          utterance.onerror = () => setIsPlayingAudio(false);

          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
          setIsPlayingAudio(true);
        }
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNext();
        scheduleControlsHide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrev();
        scheduleControlsHide();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      } else if (e.key === 'Escape') {
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else if (isFullscreen) {
          document.exitFullscreen?.().catch(() => {});
          setIsFullscreen(false);
        } else {
          onExit();
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        setShowControls((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleNext,
    handlePrev,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    onExit,
    isSettingsOpen,
    isFullscreen,
    scheduleControlsHide,
  ]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const toggleSound = () => {
    const nextMuted = !isSoundMuted;
    setIsSoundMuted(nextMuted);
    soundEffects.setMuted(nextMuted);
  };

  const currentSlide = material.slides ? material.slides[currentIndex] : null;
  const currentSection = material.sections ? material.sections[currentIndex] : null;

  // Animation class helper based on slide animationType
  const getAnimationClass = (anim?: string) => {
    switch (anim) {
      case 'slide-up':
        return 'animate-in fade-in slide-in-from-bottom-6 duration-500';
      case 'slide-left':
        return 'animate-in fade-in slide-in-from-right-8 duration-500';
      case 'zoom':
        return 'animate-in fade-in zoom-in-90 duration-500';
      case 'flip':
        return 'animate-in fade-in zoom-in-95 duration-500';
      case 'fade':
      default:
        return 'animate-in fade-in duration-400';
    }
  };

  return (
    <div
      ref={containerRef}
      id="presentation-viewport"
      onMouseMove={scheduleControlsHide}
      style={{
        background: websiteThemeConfig.bgGradientStyle,
        backgroundColor: websiteThemeConfig.bodyBgHex,
      }}
      className={`relative w-screen h-screen ${
        isLight ? 'text-slate-900' : 'text-slate-100'
      } overflow-hidden select-none font-sans flex flex-col items-center justify-center transition-colors duration-300`}
    >
      {/* BACKGROUND ACCENTS */}
      <div className={`absolute inset-0 pointer-events-none overflow-hidden ${isLight ? 'opacity-20' : 'opacity-35'}`}>
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[110px]"
          style={{ backgroundColor: websiteThemeConfig.primaryColor }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-[110px]"
          style={{ backgroundColor: websiteThemeConfig.secondaryColor }}
        />
      </div>

      {/* AUDIO PLAYER (Hidden element for slide audio tracks) */}
      {currentSlide?.audioUrl && (
        <audio
          ref={audioRef}
          src={currentSlide.audioUrl}
          onEnded={() => setIsPlayingAudio(false)}
          className="hidden"
        />
      )}

      {/* ========================================================================= */}
      {/* POLISHED TOP PRESENTATION TOOLBAR (Sleek, High-Contrast, Prominent Settings Button) */}
      {/* ========================================================================= */}
      <header
        id="presentation-top-toolbar"
        className={`absolute top-0 left-0 right-0 z-40 h-14 ${
          isLight
            ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm text-slate-900'
            : `${websiteThemeConfig.headerBg} backdrop-blur-xl border-b border-white/10 text-white`
        } px-4 sm:px-6 flex items-center justify-between transition-colors duration-300`}
      >
        {/* Left: Material Info & Live Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className={`flex items-center gap-2 ${
            isLight ? 'bg-slate-100 border border-slate-200 text-slate-900' : 'bg-white/5 border border-white/10 text-white'
          } px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm`}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className={`font-medium truncate max-w-[170px] sm:max-w-xs md:max-w-md ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {material.title}
            </span>
          </div>

          <span className={`px-2 py-1 rounded-lg ${
            isLight
              ? 'bg-sky-50 border border-sky-300 text-sky-800'
              : 'bg-cyan-950/60 border border-cyan-500/30 text-cyan-300'
          } font-mono text-[11px] font-bold hidden sm:inline-block`}>
            {material.type === 'pptx' ? 'PPTX 16:9' : 'DOCX'}
          </span>

          <span className={`font-mono text-xs ${
            isLight ? 'text-slate-700 bg-slate-100 border-slate-200' : 'text-slate-300 bg-white/5 border-white/10'
          } border px-2.5 py-1 rounded-lg`}>
            {material.type === 'pptx' ? 'Slide' : 'Bab'} {currentIndex + 1} / {totalItems}
          </span>
        </div>

        {/* Center: Reset Zoom Pill (Visible when zoomed) */}
        <div className="hidden md:flex items-center gap-2">
          {zoomLevel !== 1.0 && (
            <button
              onClick={handleResetZoom}
              title="Klik untuk reset zoom (100%)"
              className={`${
                isLight
                  ? 'bg-sky-100 border border-sky-300 text-sky-800 hover:bg-sky-200'
                  : 'bg-indigo-950/80 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-900/80'
              } text-xs px-3 py-1 rounded-full font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md`}
            >
              <ZoomIn className="w-3.5 h-3.5" />
              Zoom: {Math.round(zoomLevel * 100)}%
              <RotateCcw className="w-3 h-3 ml-0.5 opacity-70" />
            </button>
          )}
        </div>

        {/* Right: PROMINENT SETTINGS BUTTON + Audio + Fullscreen + Exit */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* ⭐ PROMINENT SETTING BUTTON */}
          <button
            id="top-open-settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            className={`px-3.5 sm:px-4 py-1.5 rounded-xl ${websiteThemeConfig.accentBtn} font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 hover:scale-[1.02]`}
            title="Buka Pengaturan Tema Warna, Animasi Slide, & Panduan Gestur"
          >
            <Sliders className="w-4 h-4 opacity-90" />
            <span>Setting</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isSoundMuted
                ? isLight ? 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600' : 'bg-slate-900/70 border-slate-800 text-slate-500 hover:text-slate-300'
                : isLight ? 'bg-slate-100 border-slate-200 text-sky-700 hover:bg-slate-200' : 'bg-white/5 border-white/10 text-cyan-400 hover:bg-white/10'
            }`}
            title={isSoundMuted ? 'Aktifkan Efek Suara' : 'Matikan Efek Suara'}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-xl border transition cursor-pointer hidden sm:inline-flex ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Exit Button */}
          <button
            id="top-exit-presentation-btn"
            onClick={onExit}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              isLight ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200' : 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border-rose-500/30'
            }`}
            title="Keluar Presentasi (Esc)"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* VIRTUAL TWO-DOTS & LASER OVERLAY (Zero React Re-render, GPU Acceleration) */}
      {/* Dimulai dari 1 titik Merah (Telunjuk). */}
      {/* Titik ke-2 Hijau (Jempol) HANYA muncul setelah 3x tepuk antara Telunjuk & Jempol! */}
      {/* ========================================================================= */}
      <VirtualLaserOverlay
        isLaserEnabled={isLaserEnabled}
        setPointerListener={setPointerListener}
        zoomLevel={zoomLevel}
        onResetZoom={handleResetZoom}
        resetZoomMode={resetZoomMode}
        onUnlockManual={() => setLocked?.(false)}
      />

      {/* MAIN CONTENT STAGE WITH DYNAMIC ZOOM (LEBIH LEBAR / BESAR SEPERTI PPT / WORD ASLI) */}
      <div
        id="presentation-zoom-container"
        ref={scrollableContentRef}
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center',
          transition: 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)',
        }}
        className={`relative z-10 w-full h-full flex ${
          material.type === 'docx' ? 'items-start pt-20 pb-16' : 'items-center pt-16 pb-12'
        } justify-center p-2 sm:p-4 md:p-6 lg:p-8 overflow-auto`}
      >
        {/* ========================================================================= */}
        {/* AUTHENTIC MICROSOFT POWERPOINT (.PPTX) WIDESCREEN 16:9 PRESENTATION CANVAS */}
        {/* ========================================================================= */}
        {material.type === 'pptx' && currentSlide && (
          <div
            key={`${currentSlide.id}-${pptTheme}-${slideTransition}`}
            id="powerpoint-slide-canvas"
            className={`w-full max-w-[1380px] aspect-[16/9] min-h-[520px] max-h-[86vh] rounded-xl ${activeTheme.slideBg} border ${activeTheme.cardBorder} shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06)] flex flex-col justify-between overflow-hidden relative font-sans ${
              slideTransition === 'wipe'
                ? 'animate-ppt-wipe'
                : slideTransition === 'push'
                ? 'animate-ppt-push'
                : slideTransition === 'zoom'
                ? 'animate-ppt-zoom'
                : 'animate-ppt-fade'
            }`}
          >
            {/* Top Accent Ribbon (PowerPoint Master Theme Line) */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${activeTheme.accentBarGradient} shrink-0`} />

            {/* Slide Header Master */}
            <div className="px-6 sm:px-10 pt-4 pb-2 shrink-0">
              <div className={`flex items-center justify-between text-xs ${activeTheme.isLight ? 'text-slate-500 border-slate-200' : 'text-slate-400 border-white/10'} pb-2.5 border-b mb-3 sm:mb-4`}>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded ${activeTheme.isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-white/10 text-white border-white/15'} font-bold font-mono text-[10px] tracking-wider uppercase border`}>
                    PowerPoint 16:9
                  </span>
                  <span className={`font-semibold tracking-wide ${activeTheme.isLight ? 'text-slate-700' : 'text-slate-300'} text-xs truncate max-w-[220px] sm:max-w-sm`}>
                    {material.fileName}
                  </span>
                  <span className={`px-2 py-0.5 rounded ${activeTheme.badgeBg} ${activeTheme.badgeText} text-[10px] font-mono border hidden md:inline-block`}>
                    Tema: {activeTheme.name}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[11px] ${activeTheme.isLight ? 'text-slate-500' : 'text-slate-400'} font-mono hidden lg:inline`}>
                    Animasi: {slideTransition.toUpperCase()}
                  </span>
                  <span className={`font-mono ${activeTheme.isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-white/10 text-slate-200 border-white/10'} px-3 py-0.5 rounded-full text-xs border`}>
                    Slide {currentIndex + 1} / {totalItems}
                  </span>
                </div>
              </div>

              {/* Title and Subtitle Block */}
              <div>
                <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold tracking-tight ${activeTheme.isLight ? 'text-slate-900' : 'text-white'} leading-tight font-sans`}>
                  {currentSlide.title}
                </h1>

                {currentSlide.subtitles && currentSlide.subtitles.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`w-1.5 h-3.5 rounded-full bg-gradient-to-b ${activeTheme.accentBarGradient} shrink-0`} />
                    <div className="flex flex-wrap items-center gap-x-3 text-xs sm:text-sm font-medium">
                      {currentSlide.subtitles.map((sub, sIdx) => (
                        <span key={sIdx} className={activeTheme.subtitleColor}>
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Slide Body: Layout changes intelligently if Title Slide vs Content Slide */}
            <div id="slide-scrollable-body" className="flex-1 px-6 sm:px-10 py-2 overflow-y-auto">
              {currentIndex === 0 ? (
                /* ========================================================================= */
                /* SLIDE 1: AUTHENTIC POWERPOINT TITLE SLIDE HERO LAYOUT */
                /* ========================================================================= */
                <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <div className={`p-4 rounded-xl ${activeTheme.isLight ? 'bg-slate-50/90 border-slate-200 shadow-sm' : 'bg-white/[0.03] border-white/10 backdrop-blur-sm'} border space-y-3`}>
                      <div className={`text-xs font-mono tracking-wider uppercase ${activeTheme.isLight ? 'text-slate-500' : 'text-slate-400'} font-semibold`}>
                        {language === 'en' ? 'Agenda & Key Topics' : 'Agenda & Pokok Bahasan'}
                      </div>
                      {currentSlide.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className={`flex items-start gap-3 text-sm sm:text-base ${activeTheme.isLight ? 'text-slate-800' : 'text-slate-200'} leading-relaxed`}>
                          <span className={`w-2.5 h-2.5 rounded-sm ${activeTheme.bulletDot} mt-1.5 shrink-0 ${activeTheme.bulletGlow}`} />
                          <p className="font-normal">{bullet}</p>
                        </div>
                      ))}
                    </div>

                    {/* Presenter Footer Card */}
                    <div className={`flex flex-wrap items-center gap-2 text-xs ${activeTheme.isLight ? 'text-slate-500' : 'text-slate-400'} pt-1`}>
                      <span className={`px-2.5 py-1 rounded-md ${activeTheme.isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/5 border-white/10'} font-mono text-[11px]`}>
                        Format: 16:9 Widescreen Presentation
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className={activeTheme.isLight ? 'text-slate-600' : 'text-slate-300'}>
                        {language === 'en' ? 'Use Index Finger to Navigate' : 'Gunakan Navigasi Jari Telunjuk'}
                      </span>
                    </div>
                  </div>

                  {/* Right Graphic in PowerPoint Picture Frame */}
                  {currentSlide.images && currentSlide.images.length > 0 && (
                    <div className="lg:col-span-5 flex flex-col items-center justify-center">
                      <div className={`w-full rounded-xl overflow-hidden border ${activeTheme.isLight ? 'border-slate-200 bg-slate-50' : 'border-white/15 bg-black/40'} shadow-xl p-3 relative group`}>
                        <img
                          src={currentSlide.images[0].url}
                          alt={currentSlide.images[0].alt || 'Slide Graphic'}
                          className="w-full h-auto max-h-[260px] object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                        <div className={`mt-2 text-center text-[11px] ${activeTheme.isLight ? 'text-slate-500' : 'text-slate-400'} font-mono truncate px-2`}>
                          {currentSlide.images[0].name}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* ========================================================================= */
                /* SLIDES 2+: AUTHENTIC POWERPOINT CONTENT & DIAGRAM LAYOUT */
                /* ========================================================================= */
                <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Left Column: PowerPoint Bullet List & Tables */}
                  <div className={`${currentSlide.images || currentSlide.tables ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-3.5`}>
                    <div className="space-y-3">
                      {currentSlide.bullets.map((bullet, bIdx) => (
                        <div
                          key={bIdx}
                          className="flex items-start gap-3.5 text-sm sm:text-base leading-relaxed group"
                        >
                          <span className={`w-2.5 h-2.5 rounded-sm ${activeTheme.bulletDot} mt-1.5 shrink-0 transition-transform group-hover:scale-125 ${activeTheme.bulletGlow}`} />
                          <p className={`font-normal ${activeTheme.isLight ? 'text-slate-800' : 'text-slate-200'}`}>{bullet}</p>
                        </div>
                      ))}
                    </div>

                    {/* Table representation if slide contains tables */}
                    {currentSlide.tables && currentSlide.tables.length > 0 && (
                      <div className={`mt-4 rounded-xl overflow-hidden border ${activeTheme.tableBorder} ${activeTheme.isLight ? 'bg-white shadow-md' : 'bg-black/40 shadow-xl'} font-sans`}>
                        <table className="w-full text-xs sm:text-sm text-left">
                          <thead className={`${activeTheme.tableHeaderBg} ${activeTheme.tableHeaderColor} font-semibold uppercase tracking-wider text-[11px]`}>
                            <tr>
                              {currentSlide.tables[0].headers.map((h, hIdx) => (
                                <th key={hIdx} className={`px-3.5 py-2.5 border-b ${activeTheme.isLight ? 'border-slate-200' : 'border-white/10'}`}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${activeTheme.isLight ? 'divide-slate-200 text-slate-800' : 'divide-white/5 text-slate-200'}`}>
                            {currentSlide.tables[0].rows.map((row, rIdx) => (
                              <tr key={rIdx} className={rIdx % 2 === 0 ? (activeTheme.isLight ? 'bg-slate-50' : 'bg-white/[0.02]') : 'bg-transparent'}>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="px-3.5 py-2">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Right Column: PowerPoint Picture Frame Style */}
                  {currentSlide.images && currentSlide.images.length > 0 && (
                    <div className="lg:col-span-5 flex flex-col items-center justify-center">
                      <div className={`w-full rounded-xl overflow-hidden border ${activeTheme.isLight ? 'border-slate-200 bg-slate-50' : 'border-white/15 bg-black/40'} shadow-xl p-3 relative group`}>
                        <img
                          src={currentSlide.images[0].url}
                          alt={currentSlide.images[0].alt || 'Slide Graphic'}
                          className="w-full h-auto max-h-[260px] object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                        <div className={`mt-2 text-center text-[11px] ${activeTheme.isLight ? 'text-slate-500' : 'text-slate-400'} font-mono truncate px-2`}>
                          {currentSlide.images[0].name}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Slide Footer Master (Authentic PowerPoint Footer) */}
            <div className={`px-6 sm:px-10 py-2.5 border-t ${
              activeTheme.isLight ? 'border-slate-200 bg-slate-100/90 text-slate-600' : 'border-white/10 bg-black/25 text-slate-400'
            } flex items-center justify-between text-xs shrink-0`}>
              <div className="flex items-center gap-3">
                <span className={`font-mono ${activeTheme.isLight ? 'text-slate-600' : 'text-slate-400'} hidden sm:inline`}>
                  Microsoft PowerPoint (.pptx)
                </span>

                {/* Audio Narrator Button */}
                <button
                  onClick={toggleAudioNarration}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/40 animate-pulse'
                      : activeTheme.isLight
                      ? 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                      : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
                  }`}
                  title={language === 'en' ? 'Play Slide Audio Narration' : 'Putar Narasi Audio Slide'}
                >
                  {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingAudio ? (language === 'en' ? 'Pause Audio' : 'Jeda Audio') : (language === 'en' ? 'Play Slide Audio' : 'Putar Audio Slide')}</span>
                </button>
              </div>

              <div className="flex items-center gap-4">
                {currentSlide.notes && (
                  <button
                    onClick={() => setShowNotesDrawer(!showNotesDrawer)}
                    className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1.5 transition cursor-pointer font-medium"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {showNotesDrawer
                      ? (language === 'en' ? 'Close Notes' : 'Tutup Catatan')
                      : (language === 'en' ? 'Presenter Notes' : 'Catatan Presenter')}
                  </button>
                )}

                <div className={`font-mono text-xs font-bold ${
                  activeTheme.isLight ? 'text-slate-700 bg-slate-200/80 border-slate-300' : 'text-slate-300 bg-white/10 border-white/10'
                } px-2.5 py-0.5 rounded border`}>
                  Slide {currentIndex + 1}
                </div>
              </div>
            </div>

            {/* Slide Notes Drawer overlay */}
            {showNotesDrawer && currentSlide.notes && (
              <div className="absolute bottom-12 left-8 right-8 p-4 rounded-xl bg-slate-950/95 border border-sky-500/40 shadow-2xl backdrop-blur-md text-xs text-slate-200 animate-in fade-in slide-in-from-bottom-2 z-20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sky-300 uppercase tracking-wider text-[11px]">
                    {language === 'en' ? 'Presenter Notes (Slide Notes)' : 'Catatan Presenter (Slide Notes)'}
                  </span>
                  <button
                    onClick={() => setShowNotesDrawer(false)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">{currentSlide.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* WORD (.DOCX) READING MODE CANVAS - FORMAT PERSEGI PANJANG KE BAWAH (PORTRAIT DOKUMEN) */}
        {/* ========================================================================= */}
        {material.type === 'docx' && currentSection && (
          <div
            key={currentSection.id}
            id="word-reader-card"
            style={isLight ? { backgroundColor: '#ffffff', borderColor: '#e2e8f0' } : undefined}
            className={`w-full max-w-3xl lg:max-w-4xl min-h-[920px] rounded-xl ${
              isLight
                ? 'bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.12)] text-slate-800'
                : 'bg-slate-900 border border-slate-700/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] text-slate-200'
            } p-8 sm:p-12 md:p-14 flex flex-col justify-between relative mx-auto my-4 transition-all`}
          >
            {/* Document Header (Page Top Margins & Word Info) */}
            <div>
              <div className={`flex items-center justify-between text-xs ${
                isLight ? 'text-slate-500 border-slate-200' : 'text-slate-400 border-slate-800'
              } pb-4 border-b mb-6`}>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-bold font-mono text-[10px] ${
                    isLight
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
                  }`}>
                    DOCX
                  </span>
                  <span className={`font-semibold uppercase tracking-wider ${
                    isLight ? 'text-slate-800' : 'text-slate-200'
                  } truncate max-w-[280px] sm:max-w-md`}>
                    {material.fileName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-mono px-3 py-1 rounded-full text-xs border ${
                    isLight
                      ? 'bg-slate-100 text-slate-700 border-slate-200'
                      : 'bg-slate-800/90 text-slate-300 border-slate-700/60'
                  }`}>
                    Bab {currentIndex + 1} / {totalItems}
                  </span>
                  <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-slate-500'} font-mono hidden sm:inline`}>
                    Format Vertikal A4
                  </span>
                </div>
              </div>

              <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-5 leading-snug ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                {currentSection.title}
              </h2>
            </div>

            {/* Reading Content: Authentic Vertical Document Flow */}
            <div
              id="docx-scrollable-body"
              className={`flex-1 overflow-y-auto space-y-5 pr-2 ${
                isLight ? 'text-slate-700' : 'text-slate-200'
              } text-base leading-relaxed font-sans`}
            >
              {currentSection.richHtml ? (
                <div
                  className={`docx-rendered-html ${
                    isLight ? 'text-slate-800' : 'text-slate-200'
                  } text-base leading-relaxed space-y-4 font-sans`}
                  dangerouslySetInnerHTML={{ __html: currentSection.richHtml }}
                />
              ) : (
                <>
                  {currentSection.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className={`leading-relaxed ${
                      isLight ? 'text-slate-700' : 'text-slate-300'
                    }`}>
                      {p}
                    </p>
                  ))}

                  {currentSection.bullets.length > 0 && (
                    <ul className={`space-y-2.5 pt-2 pl-5 list-disc marker:text-cyan-500 font-sans text-base ${
                      isLight ? 'text-slate-700' : 'text-slate-300'
                    }`}>
                      {currentSection.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="leading-relaxed">{b}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {/* Display tables if available */}
              {currentSection.tables && currentSection.tables.length > 0 && (
                <div className={`my-6 rounded-xl overflow-hidden border ${
                  isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-950/60'
                } font-sans`}>
                  <table className="w-full text-sm text-left">
                    <thead className={`${
                      isLight ? 'bg-slate-100 text-slate-800 font-bold' : 'bg-slate-800 text-cyan-300'
                    }`}>
                      <tr>
                        {currentSection.tables[0].headers.map((h, hIdx) => (
                          <th key={hIdx} className="px-4 py-2.5 font-bold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${
                      isLight ? 'divide-slate-200 text-slate-700' : 'divide-slate-800 text-slate-300'
                    }`}>
                      {currentSection.tables[0].rows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-4 py-2">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Reading Progress Indicator */}
            <div className={`pt-5 mt-6 border-t ${
              isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'
            } flex items-center justify-between text-xs font-sans`}>
              <div className="flex items-center gap-2">
                <span>
                  {language === 'en'
                    ? '1 Finger: Scroll Up/Down • 2 Fingers: Zoom'
                    : '1 Jari: Scroll Atas/Bawah • 2 Jari: Zoom'}
                </span>
                <button
                  onClick={toggleAudioNarration}
                  className={`ml-3 px-2 py-0.5 rounded ${
                    isLight
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  } flex items-center gap-1 cursor-pointer transition`}
                >
                  {isPlayingAudio ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  {isPlayingAudio
                    ? (language === 'en' ? 'Stop Reading' : 'Stop Baca')
                    : (language === 'en' ? 'Read this Section' : 'Bacakan Bab Ini')}
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalItems }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    title={language === 'en' ? `Go to Section ${i + 1}` : `Ke Bab ${i + 1}`}
                    className={`w-2.5 h-2.5 rounded-full transition cursor-pointer ${
                      i === currentIndex
                        ? 'bg-cyan-500 scale-125 ring-2 ring-cyan-400/50'
                        : isLight
                        ? 'bg-slate-300 hover:bg-slate-400'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MINI CAMERA OVERLAY */}
      {showCameraOverlay && (
        <MiniCameraOverlay
          videoRef={videoRef}
          canvasRef={canvasRef}
          isCameraActive={isCameraActive}
          cameraError={cameraError}
          fps={fps}
          gestureState={gestureState}
          onToggleCamera={onToggleCamera}
          isFloating={true}
        />
      )}

      {/* FLOATING CONTROLS DOCK */}
      <div
        id="presentation-controls-dock"
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <div className={`flex items-center gap-1.5 sm:gap-2 px-4 py-2.5 rounded-2xl ${
          isLight
            ? 'bg-white/95 border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] text-slate-800'
            : 'bg-slate-900/95 border border-slate-700/60 shadow-2xl text-slate-200'
        } backdrop-blur-lg`}>
          {/* Previous Button */}
          <button
            id="control-prev-btn"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`p-2 rounded-xl ${
              isLight
                ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40'
            } transition cursor-pointer`}
            title={language === 'en' ? 'Previous (1 Finger Swipe Left)' : 'Sebelumnya (1 Jari Geser Kiri)'}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Slide Indicator */}
          <div className={`px-3 py-1 font-mono text-xs font-semibold ${
            isLight
              ? 'text-slate-800 bg-slate-100 border-slate-200'
              : 'text-slate-300 bg-slate-950/80 border-slate-800'
          } rounded-lg border`}>
            {material.type === 'pptx' ? 'Slide' : (language === 'en' ? 'Section' : 'Bab')} {currentIndex + 1} / {totalItems}
          </div>

          {/* Next Button */}
          <button
            id="control-next-btn"
            onClick={handleNext}
            disabled={currentIndex >= totalItems - 1}
            className={`p-2 rounded-xl ${
              isLight
                ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40'
            } transition cursor-pointer`}
            title={language === 'en' ? 'Next (1 Finger Swipe Right)' : 'Berikutnya (1 Jari Geser Kanan)'}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className={`w-[1px] h-5 ${isLight ? 'bg-slate-200' : 'bg-slate-800'} mx-1`} />

          {/* Zoom In & Out Quick Buttons */}
          <div className={`flex items-center gap-0.5 ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/70 border-slate-800'} p-0.5 rounded-xl border`}>
            <button
              onClick={handleZoomOut}
              className={`p-1.5 rounded-lg ${isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-800'} transition cursor-pointer`}
              title={language === 'en' ? 'Zoom Out' : 'Perkecil (Zoom Out)'}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className={`text-[11px] font-mono px-1.5 ${isLight ? 'text-sky-700' : 'text-indigo-300'} font-semibold`}>
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className={`p-1.5 rounded-lg ${isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-800'} transition cursor-pointer`}
              title={language === 'en' ? 'Zoom In' : 'Perbesar (Zoom In)'}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className={`w-[1px] h-5 ${isLight ? 'bg-slate-200' : 'bg-slate-800'} mx-1`} />

          {/* Laser Pointer Toggle */}
          <button
            id="control-laser-toggle"
            onClick={() => setIsLaserEnabled(!isLaserEnabled)}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isLaserEnabled
                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title={language === 'en' ? 'Laser Pointer (Aim Index Finger)' : 'Laser Pointer (Arahkan Jari Telunjuk)'}
          >
            <span className="flex items-center gap-1 text-xs font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
              Laser
            </span>
          </button>

          {/* Camera View Toggle */}
          <button
            id="control-camera-toggle"
            onClick={() => setShowCameraOverlay(!showCameraOverlay)}
            className={`p-2 rounded-xl transition cursor-pointer ${
              showCameraOverlay
                ? 'text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                : isLight
                ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
            title={showCameraOverlay
              ? (language === 'en' ? 'Hide Camera' : 'Sembunyikan Kamera')
              : (language === 'en' ? 'Show Camera' : 'Tampilkan Kamera')}
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            id="control-fullscreen-toggle"
            onClick={toggleFullscreen}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title={isFullscreen
              ? (language === 'en' ? 'Exit Fullscreen' : 'Keluar Layar Penuh')
              : (language === 'en' ? 'Fullscreen' : 'Layar Penuh')}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Quick Settings Toggle */}
          <button
            id="control-settings-toggle"
            onClick={() => setIsSettingsOpen(true)}
            className={`p-2 rounded-xl ${
              isLight ? 'text-sky-700 hover:bg-slate-100' : 'text-cyan-300 hover:text-white hover:bg-slate-800'
            } transition cursor-pointer`}
            title={t.settingsTitle}
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Guidebook Toggle */}
          <button
            id="control-guidebook-toggle"
            onClick={() => setIsGuidebookOpen(true)}
            className={`p-2 rounded-xl ${
              isLight ? 'text-amber-600 hover:bg-amber-50' : 'text-amber-400 hover:text-white hover:bg-slate-800'
            } transition cursor-pointer`}
            title={t.guidebookTitle}
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <div className={`w-[1px] h-5 ${isLight ? 'bg-slate-200' : 'bg-slate-800'} mx-1`} />

          {/* Exit Button */}
          <button
            id="control-exit-btn"
            onClick={onExit}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
              isLight
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                : 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border-rose-500/30'
            }`}
            title={language === 'en' ? 'Exit Presentation' : 'Keluar Presentasi'}
          >
            <X className="w-3.5 h-3.5" />
            {language === 'en' ? 'Exit' : 'Keluar'}
          </button>
        </div>
      </div>

      {/* Presentation Settings, Theme & Gestures Modal */}
      <PresentationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentWebsiteTheme={currentWebsiteTheme}
        onSelectWebsiteTheme={handleWebsiteThemeSelect}
        currentTheme={pptTheme}
        onSelectTheme={handleThemeChange}
        slideTransition={slideTransition}
        onSelectTransition={setSlideTransition}
        isSoundMuted={isSoundMuted}
        onToggleSound={toggleSound}
        isLaserEnabled={isLaserEnabled}
        onToggleLaser={() => setIsLaserEnabled(!isLaserEnabled)}
        showCamera={showCameraOverlay}
        onToggleCamera={() => setShowCameraOverlay(!showCameraOverlay)}
        gestureConfig={gestureConfig}
        onChangeGestureConfig={onChangeGestureConfig}
      />

      {/* Buku Panduan Modal */}
      <GuidebookModal
        isOpen={isGuidebookOpen}
        onClose={() => setIsGuidebookOpen(false)}
        theme={websiteThemeConfig}
      />
    </div>
  );
};
