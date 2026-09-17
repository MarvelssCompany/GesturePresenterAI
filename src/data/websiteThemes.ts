import { WebsiteThemeId } from '../types';

export interface WebsiteTheme {
  id: WebsiteThemeId;
  name: string;
  subtitle: string;
  description: string;
  isLight: boolean;
  primaryColor: string;
  secondaryColor: string;
  // Full page background
  bodyBgHex: string;
  bgGradientStyle: string;
  // Component styling
  headerBg: string;
  heroCardBg: string;
  cardBg: string;
  cardBorder: string;
  accentBtn: string;
  activeNavBtn: string;
  accentText: string;
  badgeBg: string;
  glowColor: string;
  // Typography
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  headingColor: string;
  // Swatch gradient
  swatchGradient: string;
}

export const WEBSITE_THEMES: Record<WebsiteThemeId, WebsiteTheme> = {
  'ocean-midnight': {
    id: 'ocean-midnight',
    name: 'Ocean Midnight',
    subtitle: 'Biru Samudra & Sian',
    description: 'Latar belakang biru laut pekat dengan aksen kilau sian modern berenergi tinggi.',
    isLight: false,
    primaryColor: '#06b6d4',
    secondaryColor: '#3b82f6',
    bodyBgHex: '#081528',
    bgGradientStyle: 'radial-gradient(ellipse 90% 60% at 50% -10%, #0f3057 0%, #0a1c33 45%, #050d1a 100%)',
    headerBg: 'bg-[#0a1e36]/90 border-cyan-500/25',
    heroCardBg: 'bg-gradient-to-b from-[#0e2c4d]/95 via-[#0a1e36]/90 to-[#061424] border-cyan-500/30',
    cardBg: 'bg-[#0c223c]/90 border-cyan-500/20',
    cardBorder: 'border-cyan-500/30',
    accentBtn: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-950/40',
    activeNavBtn: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white',
    accentText: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    headingColor: 'text-white',
    swatchGradient: 'linear-gradient(135deg, #091e36 0%, #1d4ed8 50%, #06b6d4 100%)',
  },
  'emerald-obsidian': {
    id: 'emerald-obsidian',
    name: 'Emerald Obsidian',
    subtitle: 'Hijau Zamrud & Teal',
    description: 'Latar belakang hijau zamrud alami yang sejuk dan segar dengan aksen teal futuristik.',
    isLight: false,
    primaryColor: '#10b981',
    secondaryColor: '#14b8a6',
    bodyBgHex: '#07241a',
    bgGradientStyle: 'radial-gradient(ellipse 90% 60% at 50% -10%, #0d4230 0%, #07261c 45%, #03140f 100%)',
    headerBg: 'bg-[#08291d]/90 border-emerald-500/25',
    heroCardBg: 'bg-gradient-to-b from-[#0c3d2b]/95 via-[#08281c]/90 to-[#041610] border-emerald-500/30',
    cardBg: 'bg-[#0a2f21]/90 border-emerald-500/20',
    cardBorder: 'border-emerald-500/30',
    accentBtn: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-950/40',
    activeNavBtn: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
    accentText: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    headingColor: 'text-white',
    swatchGradient: 'linear-gradient(135deg, #06281c 0%, #059669 50%, #10b981 100%)',
  },
  'crimson-eclipse': {
    id: 'crimson-eclipse',
    name: 'Crimson Eclipse',
    subtitle: 'Merah Marun & Amber',
    description: 'Latar belakang merah marun mewah dan dramatis dengan aksen kilau amber keemasan.',
    isLight: false,
    primaryColor: '#f43f5e',
    secondaryColor: '#f59e0b',
    bodyBgHex: '#260814',
    bgGradientStyle: 'radial-gradient(ellipse 90% 60% at 50% -10%, #4a0d24 0%, #280815 45%, #14030a 100%)',
    headerBg: 'bg-[#2a0917]/90 border-rose-500/25',
    heroCardBg: 'bg-gradient-to-b from-[#440d21]/95 via-[#2b0816]/90 to-[#17030b] border-rose-500/30',
    cardBg: 'bg-[#310b1a]/90 border-rose-500/20',
    cardBorder: 'border-rose-500/30',
    accentBtn: 'bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white shadow-rose-950/40',
    activeNavBtn: 'bg-gradient-to-r from-rose-500 to-amber-600 text-white',
    accentText: 'text-rose-400',
    badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    headingColor: 'text-white',
    swatchGradient: 'linear-gradient(135deg, #2a0917 0%, #e11d48 50%, #f43f5e 100%)',
  },
  'pure-white': {
    id: 'pure-white',
    name: 'Pure Pearl White',
    subtitle: 'Putih Bersih & Elegan',
    description: 'Latar belakang putih mutiara yang bersih, terang, minimalis, dan sangat nyaman di mata.',
    isLight: true,
    primaryColor: '#0284c7',
    secondaryColor: '#4f46e5',
    bodyBgHex: '#f8fafc',
    bgGradientStyle: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 40%, #e2e8f0 100%)',
    headerBg: 'bg-white/95 border-slate-200/90 shadow-sm text-slate-900',
    heroCardBg: 'bg-gradient-to-b from-white via-slate-50 to-slate-100/90 border-slate-200 shadow-xl text-slate-900',
    cardBg: 'bg-white border-slate-200 shadow-md text-slate-900',
    cardBorder: 'border-slate-300',
    accentBtn: 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-sky-200',
    activeNavBtn: 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-sm',
    accentText: 'text-sky-600',
    badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
    glowColor: 'rgba(2, 132, 199, 0.25)',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    headingColor: 'text-slate-950',
    swatchGradient: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #0284c7 100%)',
  },
};

export const DEFAULT_WEBSITE_THEME: WebsiteThemeId = 'ocean-midnight';
