export type DocumentType = 'pptx' | 'docx';

export type WebsiteThemeId = 'ocean-midnight' | 'emerald-obsidian' | 'crimson-eclipse' | 'pure-white';

export type PptThemeId = 'office-blue' | 'emerald-tech' | 'executive-crimson' | 'pure-pearl-white';

export interface PptThemeConfig {
  id: PptThemeId;
  name: string;
  subtitle: string;
  iconName: string;
  isLight?: boolean;
  previewGradient: string;
  slideBg: string;
  accentBarGradient: string;
  titleColor: string;
  subtitleColor: string;
  bulletDot: string;
  bulletGlow: string;
  cardBorder: string;
  cardBg: string;
  tableHeaderBg: string;
  tableHeaderColor: string;
  tableBorder: string;
  badgeBg: string;
  badgeText: string;
  footerText: string;
  accentRing: string;
}

export interface SlideImage {
  id: string;
  url: string;
  name?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface SlideAudio {
  id: string;
  url: string;
  title?: string;
  duration?: number;
}

export interface SlideItem {
  id: number;
  slideNumber: number;
  title: string;
  subtitles?: string[];
  bullets: string[];
  notes?: string;
  rawText: string;
  themeColor?: string;
  images?: SlideImage[];
  audio?: SlideAudio;
  audioUrl?: string;
  animationType?: 'fade' | 'slide-up' | 'slide-left' | 'zoom' | 'flip';
  diagramType?: 'timeline' | 'architecture' | 'comparison' | 'hero' | 'metric';
  tables?: Array<{ headers: string[]; rows: string[][] }>;
}

export interface DocSection {
  id: number;
  sectionNumber: number;
  title: string;
  paragraphs: string[];
  bullets: string[];
  rawText: string;
  richHtml?: string;
  images?: Array<{ url: string; alt?: string; caption?: string }>;
  tables?: Array<{ headers: string[]; rows: string[][] }>;
}

export interface MaterialData {
  id: string;
  title: string;
  fileName: string;
  type: DocumentType;
  fileSize: string;
  createdAt: string;
  slides?: SlideItem[];
  sections?: DocSection[];
  totalItems: number;
  aiAnalysis?: AIAnalysisData;
}

export interface AIAnalysisData {
  summary: string;
  keyPoints: string[];
  importantTerms: Array<{ term: string; definition: string }>;
  presenterNotes: string[];
  possibleQuestions: Array<{ question: string; sampleAnswer: string }>;
  simpleExplanation: string;
  analyzedAt?: string;
}

export type GestureType =
  | 'IDLE'
  | 'INDEX_SWIPE_RIGHT'
  | 'INDEX_SWIPE_LEFT'
  | 'INDEX_SCROLL_UP'
  | 'INDEX_SCROLL_DOWN'
  | 'INDEX_POINTER'
  | 'PINCH_ZOOM_IN'
  | 'PINCH_ZOOM_OUT'
  | 'THREE_FINGER_SCROLL_UP'
  | 'THREE_FINGER_SCROLL_DOWN'
  | 'SWIPE_RIGHT'
  | 'SWIPE_LEFT'
  | 'PINCH'
  | 'OPEN_PALM'
  | 'FIST_LOCKED'
  | 'OPEN_HAND_UNLOCKED';

export type GestureAction =
  | 'NEXT_SLIDE'
  | 'PREV_SLIDE'
  | 'TOGGLE_CONTROLS'
  | 'SELECT'
  | 'ZOOM_IN'
  | 'ZOOM_OUT'
  | 'SCROLL_UP'
  | 'SCROLL_DOWN'
  | 'RESET_ZOOM'
  | 'LOCK_SYSTEM'
  | 'UNLOCK_SYSTEM';

export interface FingerStates {
  thumb: boolean;
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
  extendedCount: number;
}

export interface LockCountdownInfo {
  mode: 'LOCKING' | 'UNLOCKING';
  remainingSeconds: number; // 5, 4, 3, 2, 1
  progress: number; // 0.0 to 1.0
  elapsedMs: number;
}

export interface GestureState {
  currentGesture: GestureType;
  confidence: number;
  lastActionTime: number;
  lastDetectedGesture: GestureType;
  handDetected: boolean;
  pointerPos: { x: number; y: number } | null;
  pinchPos: { x: number; y: number } | null;
  wristPos: { x: number; y: number } | null;
  fingerStates?: FingerStates;
  zoomScale?: number;
  scrollDelta?: number;
  statusMessage: string;
  isZoomModeActive?: boolean;
  zoomTapCount?: number;
  thumbPos?: { x: number; y: number } | null;
  indexPos?: { x: number; y: number } | null;
  isLocked?: boolean;
  lockCountdown?: LockCountdownInfo | null;
}

export interface GestureConfig {
  sensitivity: number; // 1 - 10, default 7
  swipeThreshold: number; // in normalized coords, e.g. 0.12 - 0.28
  cooldownMs: number; // 800 - 1500ms, default 950ms
  targetFPS: number; // 15 - 24, default 18
  laserSmoothing: number; // 0.1 - 0.5, default 0.25
}

export interface PointerFrameData {
  indexPos: { x: number; y: number } | null;
  thumbPos: { x: number; y: number } | null;
  isZoomModeActive: boolean;
  tapCount: number;
  isLocked: boolean;
  lockCountdown: LockCountdownInfo | null;
}

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}
