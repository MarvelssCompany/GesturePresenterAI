import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppLanguage = 'id' | 'en';

export interface Translations {
  // Common & Header
  appName: string;
  appSubtitle: string;
  home: string;
  materials: string;
  startCamera: string;
  stopCamera: string;
  cameraActive: string;
  cameraInactive: string;
  startPresentation: string;
  guidebook: string;
  settings: string;
  language: string;
  selectLanguage: string;
  languageDesc: string;
  indonesian: string;
  english: string;

  // Settings Modal
  settingsTitle: string;
  settingsSubtitle: string;
  tabTheme: string;
  tabGestures: string;
  tabPreferences: string;
  tabLanguage: string;
  screenColorTheme: string;
  screenColorThemeDesc: string;
  transitionsTitle: string;
  transitionsDesc: string;
  soundEffects: string;
  soundEffectsDesc: string;
  laserPointer: string;
  laserPointerDesc: string;
  miniCamera: string;
  miniCameraDesc: string;
  gestureSensitivity: string;
  swipeThreshold: string;
  gestureCooldown: string;
  laserSmoothing: string;
  resetDefault: string;
  activeStatus: string;
  inactiveStatus: string;
  showStatus: string;
  hideStatus: string;
  autoSaved: string;
  done: string;

  // Guidebook
  guidebookTitle: string;
  guidebookSubtitle: string;
  officialBadge: string;
  tabAbout: string;
  tabWorkflow: string;
  tabGesturesKamus: string;
  tabFeatures: string;
  tabFaq: string;
  closeGuidebook: string;
  understood: string;
}

export const TRANSLATIONS: Record<AppLanguage, Translations> = {
  id: {
    appName: 'GesturePresenter AI',
    appSubtitle: 'Platform Presentasi Nirkontak Bebas Sentuhan',
    home: 'Beranda',
    materials: 'Materi Saya',
    startCamera: 'Nyalakan Kamera',
    stopCamera: 'Matikan Kamera',
    cameraActive: 'Kamera Aktif',
    cameraInactive: 'Kamera Nonaktif',
    startPresentation: 'Mulai Presentasi',
    guidebook: 'Buku Panduan',
    settings: 'Setting',
    language: 'Bahasa',
    selectLanguage: 'Pilih Bahasa Tampilan',
    languageDesc: 'Pilih bahasa antarmuka aplikasi: Bahasa Indonesia atau Bahasa Inggris (English).',
    indonesian: 'Bahasa Indonesia',
    english: 'English (Inggris)',

    settingsTitle: 'Pengaturan',
    settingsSubtitle: 'Kustomisasi tema warna layar website, pengaturan gestur tangan, bahasa, dan preferensi',
    tabTheme: 'Tema Warna Website',
    tabGestures: 'Pengaturan & Panduan Gestur',
    tabPreferences: 'Preferensi & Efek',
    tabLanguage: 'Bahasa / Language',
    screenColorTheme: 'Pilihan Tema Warna Layar Website',
    screenColorThemeDesc: 'Pilih tema warna untuk mengubah tampilan latar belakang layar website, bilah alat (toolbar), kartu materi, dan tombol antarmuka.',
    transitionsTitle: 'Efek Animasi Transisi Slide',
    transitionsDesc: 'Pilih jenis transisi saat berpindah slide',
    soundEffects: 'Efek Suara Geser Slide & Gestur',
    soundEffectsDesc: 'Memutar nada audio feedback saat slide berpindah atau gestur terdeteksi',
    laserPointer: 'Titik Virtual Laser Pointer (Merah 🔴)',
    laserPointerDesc: 'Menampilkan titik laser merah saat jari telunjuk diarahkan ke layar',
    miniCamera: 'Jendela Pratinjau Kamera (Mini Webcam)',
    miniCameraDesc: 'Menampilkan overlay visual webcam dan pelacakan titik tangan di sudut layar',
    gestureSensitivity: 'Sensitivitas Gestur (1-10)',
    swipeThreshold: 'Ambang Usapan (Swipe Threshold)',
    gestureCooldown: 'Jeda Antar Usapan (Cooldown)',
    laserSmoothing: 'Penghalusan Laser (Smoothing)',
    resetDefault: 'Reset Default',
    activeStatus: 'Aktif',
    inactiveStatus: 'Mati',
    showStatus: 'Tampil',
    hideStatus: 'Sembunyi',
    autoSaved: 'Semua pengaturan disimpan otomatis di browser',
    done: 'Selesai',

    guidebookTitle: 'Buku Panduan Penggunaan',
    guidebookSubtitle: 'Panduan lengkap cara kerja, fungsi tombol, hingga teknik kendali gestur tangan udara.',
    officialBadge: 'Resmi',
    tabAbout: '1. Ini Aplikasi Apa?',
    tabWorkflow: '2. Cara Kerja & Pengerjaan',
    tabGesturesKamus: '3. Kamus Gestur Tangan',
    tabFeatures: '4. Fitur & Pengaturan',
    tabFaq: '5. Tips & Solusi (FAQ)',
    closeGuidebook: 'Tutup Buku Panduan',
    understood: 'Mengerti, Siap Presentasi',
  },
  en: {
    appName: 'GesturePresenter AI',
    appSubtitle: 'Touchless Air-Gesture Presentation Platform',
    home: 'Home',
    materials: 'My Materials',
    startCamera: 'Start Camera',
    stopCamera: 'Stop Camera',
    cameraActive: 'Camera Active',
    cameraInactive: 'Camera Inactive',
    startPresentation: 'Start Presentation',
    guidebook: 'User Guidebook',
    settings: 'Settings',
    language: 'Language',
    selectLanguage: 'Select Display Language',
    languageDesc: 'Select application interface language: Bahasa Indonesia or English.',
    indonesian: 'Bahasa Indonesia (Indonesian)',
    english: 'English',

    settingsTitle: 'Settings',
    settingsSubtitle: 'Customize website color themes, air-gesture sensitivity, language, and presenter preferences',
    tabTheme: 'Website Theme',
    tabGestures: 'Gestures & Guide',
    tabPreferences: 'Preferences & Effects',
    tabLanguage: 'Language / Bahasa',
    screenColorTheme: 'Website Screen Color Theme',
    screenColorThemeDesc: 'Choose a color theme for the website background canvas, toolbars, material cards, and interface buttons.',
    transitionsTitle: 'Slide Transition Animation',
    transitionsDesc: 'Choose how slides animate when transitioning',
    soundEffects: 'Slide & Gesture Sound Effects',
    soundEffectsDesc: 'Play audio feedback chimes when slides advance or gestures are detected',
    laserPointer: 'Virtual Laser Pointer Dot (Red 🔴)',
    laserPointerDesc: 'Show a red glowing laser dot when pointing with your index finger',
    miniCamera: 'Mini Camera Preview Window (Webcam)',
    miniCameraDesc: 'Display webcam visual overlay and hand tracking landmarks at the corner',
    gestureSensitivity: 'Gesture Sensitivity (1-10)',
    swipeThreshold: 'Swipe Threshold',
    gestureCooldown: 'Swipe Cooldown Delay',
    laserSmoothing: 'Laser Smoothing',
    resetDefault: 'Reset to Default',
    activeStatus: 'Active',
    inactiveStatus: 'Muted',
    showStatus: 'Show',
    hideStatus: 'Hide',
    autoSaved: 'All settings are saved automatically in your browser',
    done: 'Done',

    guidebookTitle: 'User Guidebook',
    guidebookSubtitle: 'Complete walkthrough on what this app is, how it works, and full air-gesture dictionary.',
    officialBadge: 'Official',
    tabAbout: '1. What is this App?',
    tabWorkflow: '2. Workflow & Step-by-Step',
    tabGesturesKamus: '3. Hand Gesture Dictionary',
    tabFeatures: '4. Features & Settings',
    tabFaq: '5. Tips & FAQ',
    closeGuidebook: 'Close Guidebook',
    understood: 'Got It, Ready to Present',
  },
};

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'id',
  setLanguage: () => {},
  t: TRANSLATIONS.id,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem('gesture_presenter_language');
      if (saved === 'id' || saved === 'en') {
        return saved;
      }
    } catch (e) {}
    return 'id';
  });

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('gesture_presenter_language', lang);
    } catch (e) {}
  };

  const t = TRANSLATIONS[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
