import React, { useState, useEffect } from 'react';
import {
  Presentation,
  Camera,
  CameraOff,
  Sliders,
  Layers,
  Home,
  Play,
  Shield,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { MaterialData, GestureConfig, PptThemeId, WebsiteThemeId } from './types';
import { SAMPLE_PPTX, SAMPLE_DOCX } from './data/sampleMaterials';
import { useHandCamera } from './camera/useHandCamera';
import { Dashboard } from './ui/dashboard';
import { PresentationMode } from './ui/presentationMode';
import { MyMaterialsView } from './ui/myMaterialsView';
import { MiniCameraOverlay } from './ui/miniCameraOverlay';
import { PresentationSettingsModal } from './ui/presentationSettingsModal';
import { StartPresentationModal } from './ui/startPresentationModal';
import { GuidebookModal } from './ui/guidebookModal';
import { DEFAULT_PPT_THEME } from './data/pptThemes';
import { WEBSITE_THEMES, DEFAULT_WEBSITE_THEME } from './data/websiteThemes';
import { useLanguage } from './i18n/LanguageContext';

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [materials, setMaterials] = useState<MaterialData[]>([SAMPLE_PPTX, SAMPLE_DOCX]);
  const [activeMaterial, setActiveMaterial] = useState<MaterialData>(SAMPLE_PPTX);
  const [isPresentationActive, setIsPresentationActive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'home' | 'materials'>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isStartModalOpen, setIsStartModalOpen] = useState<boolean>(false);
  const [isGuidebookOpen, setIsGuidebookOpen] = useState<boolean>(false);

  // Website Screen Color Themes (Pilihan Tema Layar Website: Biru, Hijau, Merah, & Putih)
  const [websiteTheme, setWebsiteTheme] = useState<WebsiteThemeId>(() => {
    try {
      const saved = localStorage.getItem('website_theme_pref');
      if (
        saved &&
        (saved === 'ocean-midnight' ||
          saved === 'emerald-obsidian' ||
          saved === 'crimson-eclipse' ||
          saved === 'pure-white')
      ) {
        return saved as WebsiteThemeId;
      }
    } catch (e) {}
    return DEFAULT_WEBSITE_THEME;
  });

  const handleWebsiteThemeChange = (themeId: WebsiteThemeId) => {
    setWebsiteTheme(themeId);
    try {
      localStorage.setItem('website_theme_pref', themeId);
    } catch (e) {}
  };

  const currentThemeConfig = WEBSITE_THEMES[websiteTheme] || WEBSITE_THEMES['ocean-midnight'];

  // Keep body background and html class synced with active theme
  useEffect(() => {
    if (currentThemeConfig.isLight) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    document.body.style.backgroundColor = currentThemeConfig.bodyBgHex;
    document.body.style.color = currentThemeConfig.isLight ? '#0f172a' : '#f8fafc';
  }, [currentThemeConfig]);

  // PowerPoint Theme & Preferences
  const [pptTheme, setPptTheme] = useState<PptThemeId>(() => {
    try {
      const saved = localStorage.getItem('ppt_theme_pref');
      if (saved && (saved === 'office-blue' || saved === 'emerald-tech' || saved === 'executive-crimson')) {
        return saved as PptThemeId;
      }
    } catch (e) {}
    return DEFAULT_PPT_THEME;
  });
  const [slideTransition, setSlideTransition] = useState<'wipe' | 'push' | 'fade' | 'zoom'>('wipe');
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [isLaserEnabled, setIsLaserEnabled] = useState<boolean>(true);
  const [showCameraPreview, setShowCameraPreview] = useState<boolean>(true);

  const handleThemeChange = (themeId: PptThemeId) => {
    setPptTheme(themeId);
    try {
      localStorage.setItem('ppt_theme_pref', themeId);
    } catch (e) {}
  };

  const [gestureConfig, setGestureConfig] = useState<GestureConfig>({
    sensitivity: 7,
    swipeThreshold: 0.14,
    cooldownMs: 950,
    targetFPS: 20,
    laserSmoothing: 0.35,
  });

  const {
    videoRef,
    canvasRef,
    isCameraActive,
    cameraError,
    fps,
    gestureState,
    startCamera,
    stopCamera,
    setActionListener,
    setPointerListener,
    setScrollListener,
    setZoomListener,
    setZoomScale,
    resetZoomMode,
    setLocked,
  } = useHandCamera({
    sensitivity: gestureConfig.sensitivity,
    swipeThreshold: gestureConfig.swipeThreshold,
    cooldownMs: gestureConfig.cooldownMs,
    targetFPS: gestureConfig.targetFPS,
    laserSmoothing: gestureConfig.laserSmoothing,
  });

  const handleToggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const handleStartPresentation = (mat: MaterialData) => {
    setActiveMaterial(mat);
    setIsPresentationActive(true);
    if (!isCameraActive) {
      startCamera();
    }
  };

  const handleExitPresentation = () => {
    setIsPresentationActive(false);
  };

  const handleAddMaterial = (newMat: MaterialData) => {
    setMaterials((prev) => [newMat, ...prev]);
    setActiveMaterial(newMat);
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const handleConfigChange = (newConfig: Partial<GestureConfig>) => {
    setGestureConfig((prev) => ({ ...prev, ...newConfig }));
  };

  if (isPresentationActive) {
    return (
      <PresentationMode
        material={activeMaterial}
        onExit={handleExitPresentation}
        videoRef={videoRef}
        canvasRef={canvasRef}
        isCameraActive={isCameraActive}
        cameraError={cameraError}
        fps={fps}
        gestureState={gestureState}
        onToggleCamera={handleToggleCamera}
        setActionListener={setActionListener}
        setPointerListener={setPointerListener}
        setScrollListener={setScrollListener}
        setZoomListener={setZoomListener}
        setZoomScale={setZoomScale}
        resetZoomMode={resetZoomMode}
        setLocked={setLocked}
        gestureConfig={gestureConfig}
        onChangeGestureConfig={handleConfigChange}
        currentWebsiteTheme={websiteTheme}
        onSelectWebsiteTheme={handleWebsiteThemeChange}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${currentThemeConfig.textPrimary}`}
      style={{
        background: currentThemeConfig.bgGradientStyle,
        backgroundColor: currentThemeConfig.bodyBgHex,
      }}
    >
      {/* ========================================================================= */}
      {/* POLISHED TOP TOOLBAR HEADER */}
      {/* ========================================================================= */}
      <header
        id="main-app-header"
        className={`sticky top-0 z-40 backdrop-blur-xl transition-colors duration-300 border-b ${currentThemeConfig.headerBg}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Identity without unwanted badges */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-all"
              style={{
                background: `linear-gradient(135deg, ${currentThemeConfig.primaryColor}, ${currentThemeConfig.secondaryColor})`,
              }}
            >
              <Presentation className="w-5 h-5 text-slate-950 fill-white" />
            </div>
            <div>
              <span className={`text-base font-extrabold tracking-tight flex items-center gap-1.5 ${currentThemeConfig.headingColor}`}>
                GesturePresenter
              </span>
              <span className={`text-[11px] font-mono block -mt-0.5 tracking-wider ${currentThemeConfig.textMuted}`}>
                Optical Air-Gesture Presentation
              </span>
            </div>
          </div>

          {/* Navigation Tabs (Streamlined: Home & My Materials) */}
          <nav
            className={`hidden md:flex items-center gap-1.5 p-1 rounded-xl border text-xs font-medium ${
              currentThemeConfig.isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-900/80 border-slate-800/80'
            }`}
          >
            <button
              id="nav-home"
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'home'
                  ? `${currentThemeConfig.activeNavBtn} font-bold shadow-md`
                  : currentThemeConfig.isLight
                  ? 'text-slate-600 hover:text-slate-950 hover:bg-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{t.home}</span>
            </button>

            <button
              id="nav-materials"
              onClick={() => setActiveTab('materials')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'materials'
                  ? `${currentThemeConfig.activeNavBtn} font-bold shadow-md`
                  : currentThemeConfig.isLight
                  ? 'text-slate-600 hover:text-slate-950 hover:bg-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{t.materials}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  currentThemeConfig.isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-slate-300'
                }`}
              >
                {materials.length}
              </span>
            </button>
          </nav>

          {/* Right Header Controls Group */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* ⭐ TOMBOL MULAI PRESENTASI UTAMA DI HEADER */}
            <button
              id="header-start-presentation-btn"
              onClick={() => setIsStartModalOpen(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:scale-[1.02] transition-all cursor-pointer ${currentThemeConfig.accentBtn}`}
              title={t.startPresentation}
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span className="hidden sm:inline">{t.startPresentation}</span>
              <span className="sm:hidden">{language === 'en' ? 'Start' : 'Mulai'}</span>
            </button>

            {/* ⭐ TOMBOL SETTING DI ATAS */}
            <button
              id="header-open-settings-btn"
              onClick={() => setIsSettingsOpen(true)}
              className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 text-xs font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer ${
                currentThemeConfig.isLight
                  ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
                  : 'bg-slate-900/90 border-slate-700/80 hover:border-slate-500 text-slate-200 hover:text-white'
              }`}
              title={t.settingsSubtitle}
            >
              <Sliders className="w-4 h-4" style={{ color: currentThemeConfig.primaryColor }} />
              <span className="font-bold">{t.settings}</span>
            </button>

            {/* Quick Language Toggle in Header */}
            <div
              className={`flex items-center rounded-xl border p-0.5 text-xs font-bold ${
                currentThemeConfig.isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-700'
                  : 'bg-slate-900 border-slate-700/80 text-slate-300'
              }`}
            >
              <button
                onClick={() => setLanguage('id')}
                className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                  language === 'id'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'hover:text-amber-400'
                }`}
                title="Ganti ke Bahasa Indonesia"
              >
                ID
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                  language === 'en'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'hover:text-amber-400'
                }`}
                title="Switch to English"
              >
                EN
              </button>
            </div>

            {/* Camera Status Button */}
            <button
              id="header-toggle-camera-btn"
              onClick={handleToggleCamera}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                isCameraActive
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : currentThemeConfig.isLight
                  ? 'border-slate-300 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
              title={isCameraActive ? t.cameraActive : t.startCamera}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isCameraActive ? 'bg-emerald-400 animate-ping shadow-[0_0_6px_#34d399]' : 'bg-slate-400'
                }`}
              />
              {isCameraActive ? (
                <>
                  <Camera className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden sm:inline">{t.cameraActive}</span>
                </>
              ) : (
                <>
                  <CameraOff className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">{t.startCamera}</span>
                </>
              )}
            </button>

            {/* ⭐ TOMBOL BUKU PANDUAN DI POJOK KANAN ATAS WEB */}
            <button
              id="header-open-guidebook-btn"
              onClick={() => setIsGuidebookOpen(true)}
              className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer ${
                currentThemeConfig.isLight
                  ? 'bg-amber-50 hover:bg-amber-100/90 border-amber-300 text-amber-900 shadow-amber-500/10'
                  : 'bg-amber-950/40 border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-white shadow-amber-500/10'
              }`}
              title={t.guidebookTitle}
            >
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span className="hidden md:inline">{t.guidebook}</span>
              <span className="md:hidden">{language === 'en' ? 'Guide' : 'Panduan'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE COMPACT NAV BAR */}
      <div
        className={`md:hidden flex items-center justify-between px-4 py-2 border-b text-xs ${
          currentThemeConfig.isLight ? 'border-slate-200 bg-white/95 text-slate-800' : 'border-slate-800/80 bg-slate-950/90 text-slate-200'
        }`}
      >
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'home'
                ? `${currentThemeConfig.accentBtn} font-bold`
                : currentThemeConfig.isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.home}
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'materials'
                ? `${currentThemeConfig.accentBtn} font-bold`
                : currentThemeConfig.isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.materials} ({materials.length})
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="mobile-start-presentation-btn"
            onClick={() => setIsStartModalOpen(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition ${currentThemeConfig.accentBtn}`}
          >
            <Play className="w-3 h-3 fill-white" />
            <span>{language === 'en' ? 'Start' : 'Mulai'}</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-semibold ${
              currentThemeConfig.isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" style={{ color: currentThemeConfig.primaryColor }} />
            <span>{t.settings}</span>
          </button>

          <button
            id="mobile-guidebook-btn"
            onClick={() => setIsGuidebookOpen(true)}
            className={`px-2 py-1.5 rounded-lg border flex items-center gap-1 text-xs font-semibold ${
              currentThemeConfig.isLight
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-amber-950/40 border-amber-500/50 text-amber-300'
            }`}
            title={t.guidebookTitle}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'en' ? 'Guide' : 'Panduan'}</span>
          </button>
        </div>
      </div>

      {/* MAIN BODY VIEW */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'home' && (
          <Dashboard
            materials={materials}
            onStartPresentation={handleStartPresentation}
            onOpenGestureSettings={() => setIsSettingsOpen(true)}
            onAddMaterial={handleAddMaterial}
            theme={currentThemeConfig}
            onOpenStartModal={() => setIsStartModalOpen(true)}
          />
        )}

        {activeTab === 'materials' && (
          <MyMaterialsView
            materials={materials}
            onStartPresentation={handleStartPresentation}
            onDeleteMaterial={handleDeleteMaterial}
            theme={currentThemeConfig}
          />
        )}
      </main>

      {/* FLOATING MINI CAMERA (Visible when camera is active) */}
      {isCameraActive && (
        <MiniCameraOverlay
          videoRef={videoRef}
          canvasRef={canvasRef}
          isCameraActive={isCameraActive}
          cameraError={cameraError}
          fps={fps}
          gestureState={gestureState}
          onToggleCamera={handleToggleCamera}
          isFloating={true}
        />
      )}

      {/* UNIFIED SETTINGS MODAL (4 Website Screen Themes including Pure White, Slide Transitions, Gesture Settings & Camera) */}
      <PresentationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentWebsiteTheme={websiteTheme}
        onSelectWebsiteTheme={handleWebsiteThemeChange}
        currentTheme={pptTheme}
        onSelectTheme={handleThemeChange}
        slideTransition={slideTransition}
        onSelectTransition={setSlideTransition}
        isSoundMuted={isSoundMuted}
        onToggleSound={() => setIsSoundMuted(!isSoundMuted)}
        isLaserEnabled={isLaserEnabled}
        onToggleLaser={() => setIsLaserEnabled(!isLaserEnabled)}
        showCamera={showCameraPreview}
        onToggleCamera={() => setShowCameraPreview(!showCameraPreview)}
        gestureConfig={gestureConfig}
        onChangeGestureConfig={handleConfigChange}
      />

      {/* START PRESENTATION MODAL (Pilih atau Tarik File PPTX / DOCX) */}
      <StartPresentationModal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        onStartPresentation={handleStartPresentation}
        onAddMaterial={handleAddMaterial}
        currentMaterial={activeMaterial}
        theme={currentThemeConfig}
      />

      {/* BUKU PANDUAN PENGGUNAAN MODAL */}
      <GuidebookModal
        isOpen={isGuidebookOpen}
        onClose={() => setIsGuidebookOpen(false)}
        theme={currentThemeConfig}
      />

      {/* FOOTER */}
      <footer
        className={`border-t py-6 text-xs transition-colors duration-300 mt-12 ${
          currentThemeConfig.isLight
            ? 'border-slate-200 bg-white/90 text-slate-600'
            : 'border-slate-800/80 bg-slate-950 py-6 text-slate-400'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${currentThemeConfig.isLight ? 'text-slate-900' : 'text-slate-300'}`}>
              GesturePresenter
            </span>
            <span>&bull;</span>
            <span>Air-Gesture Presentation Controller</span>
          </div>
          <div className={`flex items-center gap-4 ${currentThemeConfig.isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              {language === 'en'
                ? 'Camera & gestures processed 100% locally in your browser'
                : 'Kamera & Gestur diproses 100% lokal di browser Anda'}
            </span>
            <span>MediaPipe Hands</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
