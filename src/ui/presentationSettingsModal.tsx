import React, { useState } from 'react';
import {
  X,
  Palette,
  Sparkles,
  Check,
  Volume2,
  VolumeX,
  Eye,
  Camera,
  Hand,
  Sliders,
  RotateCcw,
  ShieldCheck,
  HelpCircle,
  Zap,
  Globe,
} from 'lucide-react';
import { WebsiteThemeId, GestureConfig, PptThemeId } from '../types';
import { WEBSITE_THEMES, WebsiteTheme } from '../data/websiteThemes';
import { useLanguage } from '../i18n/LanguageContext';

interface PresentationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Website Screen Color Themes (3 Pilihan Tema Layar Website)
  currentWebsiteTheme: WebsiteThemeId;
  onSelectWebsiteTheme: (themeId: WebsiteThemeId) => void;
  // Transitions & Preferences
  slideTransition: 'wipe' | 'push' | 'fade' | 'zoom';
  onSelectTransition: (transition: 'wipe' | 'push' | 'fade' | 'zoom') => void;
  isSoundMuted: boolean;
  onToggleSound: () => void;
  isLaserEnabled: boolean;
  onToggleLaser: () => void;
  showCamera: boolean;
  onToggleCamera: () => void;
  // Gesture Settings
  gestureConfig?: GestureConfig;
  onChangeGestureConfig?: (newConfig: Partial<GestureConfig>) => void;
  // Optional PowerPoint Slide Theme
  currentTheme?: PptThemeId;
  onSelectTheme?: (themeId: PptThemeId) => void;
}

export const PresentationSettingsModal: React.FC<PresentationSettingsModalProps> = ({
  isOpen,
  onClose,
  currentWebsiteTheme,
  onSelectWebsiteTheme,
  slideTransition,
  onSelectTransition,
  isSoundMuted,
  onToggleSound,
  isLaserEnabled,
  onToggleLaser,
  showCamera,
  onToggleCamera,
  gestureConfig,
  onChangeGestureConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'website-theme' | 'gestures' | 'preferences' | 'language'>('website-theme');
  const { language, setLanguage, t } = useLanguage();

  if (!isOpen) return null;

  const isLight = currentWebsiteTheme === 'pure-white';
  const isEn = language === 'en';

  const websiteThemesList: WebsiteThemeId[] = [
    'ocean-midnight',
    'emerald-obsidian',
    'crimson-eclipse',
    'pure-white',
  ];

  const gestureCards = isEn
    ? [
        {
          title: '1 Index Finger: Slide Navigation & Laser Pointer',
          icon: '☝️',
          badge: 'Index Finger (Multi-function)',
          color: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-300',
          bullets: [
            'Swipe Right Fast ➔ Advance to Next Slide',
            'Swipe Left Fast ➔ Return to Previous Slide',
            'Hold Still / Smooth Motion ➔ High-Precision Red Laser Dot',
            'Swipe Up / Down (Word Docs) ➔ Automatic page scrolling',
          ],
        },
        {
          title: '3x Finger Tap: Zoom Mode (Green Dot 🟢)',
          icon: '👌',
          badge: 'Index + Thumb',
          color: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300',
          bullets: [
            'Tap 3 Times between Index and Thumb fingertips',
            'After 3 taps, Green Dot 🟢 appears on thumb activating Zoom Mode',
            'Spread Fingers Apart ➔ Zoom In (+)',
            'Pinch Fingers Together ➔ Zoom Out (-)',
          ],
        },
        {
          title: 'Lock / Unlock System (Hold Fist 3 Seconds)',
          icon: '✊ ⇄ 🖐️',
          badge: 'Safety Lock (Anti-Misgesture)',
          color: 'border-amber-500/30 bg-amber-950/20 text-amber-300',
          bullets: [
            'Clench Fist for 3 Seconds ➔ Locks system, gestures disabled (safe for casual talking)',
            'Clench Fist for 3 Seconds Again ➔ Unlocks system, air controls re-enabled',
          ],
        },
        {
          title: 'Open Palm Briefly Facing Camera',
          icon: '✋',
          badge: 'Bottom Menu Bar',
          color: 'border-indigo-500/30 bg-indigo-950/20 text-indigo-300',
          bullets: [
            'Spread all 5 fingers facing the camera briefly to show or hide the presentation bottom toolbar',
          ],
        },
      ]
    : [
        {
          title: '1 Jari Telunjuk: Navigasi Slide & Laser Pointer',
          icon: '☝️',
          badge: 'Jari Telunjuk (Multifungsi)',
          color: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-300',
          bullets: [
            'Usap Cepat ke Kanan ➔ Pindah ke Slide Berikutnya',
            'Usap Cepat ke Kiri ➔ Pindah ke Slide Sebelumnya',
            'Arahkan Diam / Gerak Halus ➔ Titik Laser Merah presisi tinggi',
            'Usap Atas / Bawah (Dokumen Word) ➔ Gulir halaman otomatis',
          ],
        },
        {
          title: '3x Tepuk Jari: Mode Zoom (Titik 2 Hijau 🟢)',
          icon: '👌',
          badge: 'Telunjuk + Jempol',
          color: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300',
          bullets: [
            'Tepuk 3 Kali antara ujung jari Telunjuk dan Jempol',
            'Setelah 3x tepuk, Titik Hijau 🟢 muncul di jempol mengaktifkan Mode Zoom',
            'Rentangkan Jari ➔ Memperbesar tampilan (Zoom In)',
            'Rapatkan Jari ➔ Memperkecil tampilan (Zoom Out)',
          ],
        },
        {
          title: 'Kunci / Buka Kunci Sistem (Tahan 3 Detik)',
          icon: '✊ ⇄ 🖐️',
          badge: 'Safety Lock (Anti-Salah Gerak)',
          color: 'border-amber-500/30 bg-amber-950/20 text-amber-300',
          bullets: [
            'Tangan Dikepal 3 Detik ➔ Mengunci sistem, laser & gestur nonaktif (aman saat bicara santai)',
            'Kepal 3 Detik Lagi ➔ Membuka kunci sistem, kontrol aktif kembali',
          ],
        },
        {
          title: 'Telapak Tangan Terbuka Sekejap',
          icon: '✋',
          badge: 'Bilah Menu',
          color: 'border-indigo-500/30 bg-indigo-950/20 text-indigo-300',
          bullets: [
            'Buka kelima jari tangan menghadap kamera untuk menampilkan atau menyembunyikan bilah kontrol bawah',
          ],
        },
      ];

  return (
    <div
      id="presentation-settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="presentation-settings-card"
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] overflow-hidden ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-900/10'
            : 'bg-slate-900 border-slate-700 text-slate-100 shadow-black/60'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between pb-4 border-b ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-900/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-bold leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {t.settingsTitle}
              </h2>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {t.settingsSubtitle}
              </p>
            </div>
          </div>
          <button
            id="close-settings-modal-btn"
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs Navigation */}
        <div
          className={`flex items-center gap-1.5 py-3 border-b text-xs font-semibold overflow-x-auto no-scrollbar ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}
        >
          <button
            id="settings-tab-language"
            onClick={() => setActiveTab('language')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'language'
                ? isLight
                  ? 'bg-sky-600 text-white font-bold shadow-sm'
                  : 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>{t.tabLanguage}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-500 font-bold uppercase">
              {language.toUpperCase()}
            </span>
          </button>

          <button
            id="settings-tab-theme"
            onClick={() => setActiveTab('website-theme')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'website-theme'
                ? isLight
                  ? 'bg-sky-600 text-white font-bold shadow-sm'
                  : 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>{t.tabTheme}</span>
          </button>

          <button
            id="settings-tab-gestures"
            onClick={() => setActiveTab('gestures')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'gestures'
                ? isLight
                  ? 'bg-sky-600 text-white font-bold shadow-sm'
                  : 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Hand className="w-4 h-4" />
            <span>{t.tabGestures}</span>
          </button>

          <button
            id="settings-tab-preferences"
            onClick={() => setActiveTab('preferences')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'preferences'
                ? isLight
                  ? 'bg-sky-600 text-white font-bold shadow-sm'
                  : 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{t.tabPreferences}</span>
          </button>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1.5">
          {/* ========================================================================= */}
          {/* TAB 0: UBAH BAHASA (INDONESIA & ENGLISH) */}
          {/* ========================================================================= */}
          {activeTab === 'language' && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                    <Globe className="w-4 h-4 text-cyan-400" />
                    {t.selectLanguage}
                  </label>
                  <span className="text-[11px] font-mono text-amber-500 font-bold">
                    {language === 'id' ? 'Bahasa Indonesia' : 'English (US)'}
                  </span>
                </div>
                <p className={`text-xs mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {t.languageDesc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1: Bahasa Indonesia */}
                  <button
                    id="lang-option-id"
                    onClick={() => setLanguage('id')}
                    className={`relative p-5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer group ${
                      language === 'id'
                        ? isLight
                          ? 'border-sky-500 bg-sky-50/90 shadow-md ring-2 ring-sky-400/50 scale-[1.01]'
                          : 'border-cyan-400 bg-slate-800/95 shadow-lg shadow-cyan-950/50 ring-2 ring-cyan-400/50 scale-[1.01]'
                        : isLight
                        ? 'border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-slate-100'
                        : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl">🇮🇩</span>
                        {language === 'id' ? (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-md ${
                            isLight ? 'bg-sky-600 text-white' : 'bg-cyan-400 text-slate-950'
                          }`}>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full border border-slate-700 text-slate-400">
                            Pilih
                          </span>
                        )}
                      </div>

                      <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Bahasa Indonesia
                      </h3>
                      <p className="text-xs font-semibold text-amber-500 mt-0.5">
                        Bahasa Utama (Default)
                      </p>
                      <p className={`text-xs mt-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Tampilan antarmuka, buku panduan gestur, tombol kontrol, dan notifikasi disajikan dalam Bahasa Indonesia.
                      </p>
                    </div>

                    <div className={`mt-4 pt-2.5 border-t text-[11px] font-mono flex items-center justify-between ${
                      isLight ? 'border-slate-200' : 'border-slate-800'
                    }`}>
                      <span className={language === 'id' ? (isLight ? 'text-sky-600 font-bold' : 'text-cyan-400 font-bold') : 'text-slate-500'}>
                        {language === 'id' ? '✓ Bahasa Aktif' : 'Gunakan Indonesia'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 font-bold uppercase">
                        ID
                      </span>
                    </div>
                  </button>

                  {/* Option 2: English */}
                  <button
                    id="lang-option-en"
                    onClick={() => setLanguage('en')}
                    className={`relative p-5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer group ${
                      language === 'en'
                        ? isLight
                          ? 'border-sky-500 bg-sky-50/90 shadow-md ring-2 ring-sky-400/50 scale-[1.01]'
                          : 'border-cyan-400 bg-slate-800/95 shadow-lg shadow-cyan-950/50 ring-2 ring-cyan-400/50 scale-[1.01]'
                        : isLight
                        ? 'border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-slate-100'
                        : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl">🇬🇧</span>
                        {language === 'en' ? (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-md ${
                            isLight ? 'bg-sky-600 text-white' : 'bg-cyan-400 text-slate-950'
                          }`}>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full border border-slate-700 text-slate-400">
                            Select
                          </span>
                        )}
                      </div>

                      <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        English
                      </h3>
                      <p className="text-xs font-semibold text-cyan-400 mt-0.5">
                        International Language
                      </p>
                      <p className={`text-xs mt-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        All user interfaces, guidebook walkthrough, gesture dictionaries, and toolbar controls presented in English.
                      </p>
                    </div>

                    <div className={`mt-4 pt-2.5 border-t text-[11px] font-mono flex items-center justify-between ${
                      isLight ? 'border-slate-200' : 'border-slate-800'
                    }`}>
                      <span className={language === 'en' ? (isLight ? 'text-sky-600 font-bold' : 'text-cyan-400 font-bold') : 'text-slate-500'}>
                        {language === 'en' ? '✓ Active Language' : 'Switch to English'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 font-bold uppercase">
                        EN
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: 3 PILIHAN TEMA WARNA TAMPILAN LAYAR WEBSITE */}
          {/* ========================================================================= */}
          {activeTab === 'website-theme' && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    {isEn ? 'Screen Color Themes (Blue, Green, Red, & White)' : 'Pilihan Tema Warna Layar Website (Biru, Hijau, Merah, & Putih)'}
                  </label>
                  <span className="text-[11px] font-mono text-cyan-400">
                    {isEn ? 'Display Customization' : 'Kustomisasi Tampilan Layar'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  {isEn
                    ? 'Select a theme color to customize the background, bottom presentation toolbar, material cards, and interface buttons.'
                    : 'Pilih tema warna untuk mengubah tampilan warna latar belakang layar website, bilah alat (toolbar), kartu materi, dan tombol antarmuka.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {websiteThemesList.map((themeId) => {
                    const theme: WebsiteTheme = WEBSITE_THEMES[themeId];
                    const isSelected = currentWebsiteTheme === themeId;

                    return (
                      <button
                        key={themeId}
                        id={`website-theme-btn-${themeId}`}
                        onClick={() => onSelectWebsiteTheme(themeId)}
                        className={`relative p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer group ${
                          isSelected
                            ? isLight
                              ? 'border-sky-500 bg-sky-50/90 shadow-md ring-2 ring-sky-400/50 scale-[1.01]'
                              : 'border-cyan-400 bg-slate-800/95 shadow-lg shadow-cyan-950/50 ring-2 ring-cyan-400/50 scale-[1.01]'
                            : isLight
                            ? 'border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-slate-100'
                            : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-850'
                        }`}
                      >
                        <div>
                          {/* Visual Swatch representing the website theme */}
                          <div
                            className="w-full h-14 rounded-lg border border-black/10 p-2 mb-3 relative overflow-hidden flex items-center justify-between shadow-inner"
                            style={{
                              background: theme.swatchGradient,
                            }}
                          >
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-3.5 h-3.5 rounded-full shadow-md border border-black/20"
                                style={{ backgroundColor: theme.primaryColor }}
                              />
                              <span
                                className="w-3.5 h-3.5 rounded-full shadow-md border border-black/20"
                                style={{ backgroundColor: theme.secondaryColor }}
                              />
                            </div>
                            {isSelected && (
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md font-bold ${
                                isLight ? 'bg-sky-600 text-white' : 'bg-cyan-400 text-slate-950'
                              }`}>
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <h3 className={`text-sm font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                              {theme.name}
                            </h3>
                            {theme.isLight && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400/20 text-amber-600 dark:text-amber-300 border border-amber-400/30">
                                {isEn ? 'Light / White' : 'Terang / Putih'}
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] font-medium mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                            {theme.subtitle}
                          </p>
                          <p className={`text-[11px] mt-1 leading-snug ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            {theme.description}
                          </p>
                        </div>

                        <div className={`mt-3.5 pt-2 border-t flex items-center justify-between text-[10px] font-mono ${
                          isLight ? 'border-slate-200' : 'border-slate-800/80'
                        }`}>
                          <span className={isSelected ? (isLight ? 'text-sky-600 font-bold' : 'text-cyan-400 font-bold') : (isLight ? 'text-slate-400' : 'text-slate-500')}>
                            {isSelected ? (isEn ? '✓ Active Theme' : '✓ Tema Aktif') : (isEn ? 'Select Theme' : 'Pilih Tema')}
                          </span>
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                            style={{
                              backgroundColor: `${theme.primaryColor}22`,
                              color: theme.primaryColor,
                            }}
                          >
                            {isEn ? 'Screen' : 'Layar'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slide Transitions Option */}
              <div className={`pt-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
                <label className={`text-xs font-bold uppercase tracking-wider block mb-2.5 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  {isEn ? 'Slide Transition Animation Effect' : 'Efek Animasi Transisi Slide'}
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'wipe', name: isEn ? 'Wipe' : 'Wipe (Sapuan)', desc: isEn ? 'Left to right' : 'Dari kiri ke kanan' },
                    { id: 'push', name: isEn ? 'Push' : 'Push (Geser)', desc: isEn ? 'Dynamic slide' : 'Geser dinamis' },
                    { id: 'fade', name: isEn ? 'Fade' : 'Fade (Pudar)', desc: isEn ? 'Smooth & elegant' : 'Halus & elegan' },
                    { id: 'zoom', name: isEn ? 'Zoom' : 'Zoom (Perbesar)', desc: isEn ? 'Focus presentation' : 'Fokus presentasi' },
                  ].map((t) => {
                    const isSelected = slideTransition === t.id;
                    return (
                      <button
                        key={t.id}
                        id={`transition-btn-${t.id}`}
                        onClick={() => onSelectTransition(t.id as any)}
                        className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                          isSelected
                            ? isLight
                              ? 'border-sky-500 bg-sky-50 text-sky-900 font-bold ring-1 ring-sky-400 shadow-sm'
                              : 'border-cyan-400 bg-cyan-950/40 text-cyan-200 font-bold ring-1 ring-cyan-400 shadow-md'
                            : isLight
                            ? 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-xs font-semibold">{t.name}</div>
                        <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: GESTURE SETTINGS & COMPLETE GUIDE */}
          {/* ========================================================================= */}
          {activeTab === 'gestures' && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Optional Gesture Tuning Sliders if props supplied */}
              {gestureConfig && onChangeGestureConfig && (
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      {isEn ? 'Gesture Sensitivity & Response Speed' : 'Sensitivitas & Kecepatan Respon Gestur'}
                    </label>
                    <button
                      onClick={() =>
                        onChangeGestureConfig({
                          sensitivity: 7,
                          swipeThreshold: 0.14,
                          cooldownMs: 950,
                          laserSmoothing: 0.35,
                        })
                      }
                      className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-mono transition cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      {isEn ? 'Reset Defaults' : 'Reset Default'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>{isEn ? 'Gesture Sensitivity (1-10)' : 'Sensitivitas Gestur (1-10)'}</span>
                        <span className="font-mono text-cyan-400 font-bold">
                          {gestureConfig.sensitivity}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={gestureConfig.sensitivity}
                        onChange={(e) =>
                          onChangeGestureConfig({ sensitivity: Number(e.target.value) })
                        }
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>{isEn ? 'Swipe Threshold' : 'Ambang Usapan (Swipe Threshold)'}</span>
                        <span className="font-mono text-cyan-400 font-bold">
                          {Math.round(gestureConfig.swipeThreshold * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.3"
                        step="0.01"
                        value={gestureConfig.swipeThreshold}
                        onChange={(e) =>
                          onChangeGestureConfig({ swipeThreshold: Number(e.target.value) })
                        }
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>{isEn ? 'Swipe Cooldown' : 'Jeda Antar Usapan (Cooldown)'}</span>
                        <span className="font-mono text-cyan-400 font-bold">
                          {gestureConfig.cooldownMs} ms
                        </span>
                      </div>
                      <input
                        type="range"
                        min="400"
                        max="1500"
                        step="50"
                        value={gestureConfig.cooldownMs}
                        onChange={(e) =>
                          onChangeGestureConfig({ cooldownMs: Number(e.target.value) })
                        }
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>{isEn ? 'Laser Smoothing (Anti-Jitter)' : 'Penghalusan Laser (Smoothing)'}</span>
                        <span className="font-mono text-cyan-400 font-bold">
                          {Math.round(gestureConfig.laserSmoothing * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="0.8"
                        step="0.05"
                        value={gestureConfig.laserSmoothing}
                        onChange={(e) =>
                          onChangeGestureConfig({ laserSmoothing: Number(e.target.value) })
                        }
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Visual Gesture Cards */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  {isEn ? 'Air-Gesture Complete Reference' : 'Panduan Lengkap Gerakan Tangan (Air-Gestures)'}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {gestureCards.map((card, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border ${card.color} flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{card.icon}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 font-semibold">
                            {card.badge}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white leading-snug">
                          {card.title}
                        </h4>
                        <ul className="mt-2.5 space-y-1.5 text-[11px] text-slate-300">
                          {card.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-1.5">
                              <span className="text-cyan-400 shrink-0">•</span>
                              <span className="leading-relaxed">{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: DEVICE & PRESENTATION PREFERENCES */}
          {/* ========================================================================= */}
          {activeTab === 'preferences' && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                {isEn ? 'Sound, Camera & Pointer Controls' : 'Kontrol Suara, Kamera & Pointer'}
              </label>

              {/* Sound Toggle */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${!isSoundMuted ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'}`}>
                    {!isSoundMuted ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{t.soundEffects}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {t.soundEffectsDesc}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onToggleSound}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    !isSoundMuted
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {!isSoundMuted ? t.activeStatus : t.inactiveStatus}
                </button>
              </div>

              {/* Laser Pointer Toggle */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isLaserEnabled ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-500'}`}>
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{t.laserPointer}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {t.laserPointerDesc}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onToggleLaser}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    isLaserEnabled
                      ? 'bg-rose-500 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {isLaserEnabled ? t.activeStatus : t.inactiveStatus}
                </button>
              </div>

              {/* Camera Preview Overlay Toggle */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${showCamera ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{t.miniCamera}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {t.miniCameraDesc}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onToggleCamera}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    showCamera
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {showCamera ? t.showStatus : t.hideStatus}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`pt-4 border-t flex items-center justify-between text-xs ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className={`flex items-center gap-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{t.autoSaved}</span>
          </div>

          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-xl font-bold transition cursor-pointer shadow-md ${
              isLight
                ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-200'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-950/30'
            }`}
          >
            {t.done}
          </button>
        </div>
      </div>
    </div>
  );
};
