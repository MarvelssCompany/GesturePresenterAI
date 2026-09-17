import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Hand,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Shield,
  RotateCcw,
  Zap,
  Gauge,
  CheckCircle2,
  Camera,
  ZoomIn,
  MoveVertical,
} from 'lucide-react';
import { GestureConfig, GestureState, GestureType, GestureAction } from '../types';
import { MiniCameraOverlay } from './miniCameraOverlay';
import { useLanguage } from '../i18n/LanguageContext';

interface GestureSettingsProps {
  config: GestureConfig;
  onChangeConfig: (newConfig: Partial<GestureConfig>) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isCameraActive: boolean;
  cameraError: string | null;
  fps: number;
  gestureState: GestureState;
  onToggleCamera: () => void;
  setActionListener: (cb: (action: GestureAction, gesture: GestureType) => void) => void;
}

export const GestureSettings: React.FC<GestureSettingsProps> = ({
  config,
  onChangeConfig,
  videoRef,
  canvasRef,
  isCameraActive,
  cameraError,
  fps,
  gestureState,
  onToggleCamera,
  setActionListener,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [testLog, setTestLog] = useState<{ detected: string; action: string; time: string }[]>([]);

  useEffect(() => {
    setActionListener((action, gesture) => {
      const logEntry = {
        detected: gesture.replace(/_/g, ' '),
        action: action.replace(/_/g, ' '),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      setTestLog((prev) => [logEntry, ...prev.slice(0, 7)]);
    });
  }, [setActionListener]);

  const handleResetDefaults = () => {
    onChangeConfig({
      sensitivity: 7,
      swipeThreshold: 0.12,
      cooldownMs: 750,
      targetFPS: 20,
      laserSmoothing: 0.3,
    });
  };

  const gestureCards = isEn
    ? [
        {
          title: '1 Index Finger: Swipe Slides & Scroll',
          action: 'Slide Navigation & Doc Scroll',
          desc: 'Swipe right for Next Slide, swipe left for Previous Slide. Swipe up to Scroll Up, swipe down to Scroll Down. Hold still for precision Laser Pointer.',
          icon: <span className="text-2xl">☝️</span>,
          color: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-300',
          badge: '1 Index Finger (Multi-function)',
        },
        {
          title: '2 Fingers (Index + Thumb): Zoom In & Out',
          action: 'Magnify & Shrink',
          desc: 'Spread distance between thumb and index to Zoom In, bring them together to Zoom Out. Equipped with smooth jitter-dampening.',
          icon: <span className="text-2xl">👌</span>,
          color: 'border-amber-500/30 bg-amber-950/20 text-amber-300',
          badge: '2 Fingers (Index & Thumb)',
        },
        {
          title: 'Open Palm Facing Camera',
          action: 'Show / Hide Bottom Toolbar',
          desc: 'Spread all five fingers toward the camera briefly to open or dismiss the presentation control toolbar.',
          icon: <span className="text-2xl">✋</span>,
          color: 'border-indigo-500/30 bg-indigo-950/20 text-indigo-300',
          badge: 'Open Palm',
        },
        {
          title: 'Clenched Fist / Open Hand (Hold 3 Seconds)',
          action: 'Safety Lock / Unlock',
          desc: 'Hold a closed fist for 3 seconds to lock air controls and turn off laser pointer to speak casually. Hold open hand for 3 seconds to unlock.',
          icon: <span className="text-2xl">✊ ⇄ 🖐️</span>,
          color: 'border-rose-500/30 bg-rose-950/20 text-rose-300',
          badge: 'Safety Lock (3 Seconds)',
        },
      ]
    : [
        {
          title: '1 Jari Telunjuk: Geser Slide & Scroll',
          action: 'Navigasi Slide & Scroll Dokumen',
          desc: 'Usap ke kanan untuk Slide Berikutnya, usap ke kiri untuk Slide Sebelumnya. Usap ke atas untuk Scroll Ke Atas, usap ke bawah untuk Scroll Ke Bawah. Arahkan diam untuk Laser Pointer.',
          icon: <span className="text-2xl">☝️</span>,
          color: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-300',
          badge: '1 Jari Telunjuk (Multifungsi)',
        },
        {
          title: '2 Jari (Telunjuk + Jempol): Zoom In & Out',
          action: 'Memperbesar & Memperkecil',
          desc: 'Rentangkan jarak antara jempol dan telunjuk untuk memperbesar (Zoom In), dekatkan kedua jari untuk memperkecil (Zoom Out). Dilengkapi peredam getaran agar gerakan zoom halus.',
          icon: <span className="text-2xl">👌</span>,
          color: 'border-amber-500/30 bg-amber-950/20 text-amber-300',
          badge: '2 Jari (Telunjuk & Jempol)',
        },
        {
          title: 'Telapak Tangan Terbuka',
          action: 'Tampilkan / Sembunyikan Menu',
          desc: 'Buka kelima jari tangan menghadap kamera selama sekejap untuk membuka atau menutup bilah kontrol presentasi.',
          icon: <span className="text-2xl">✋</span>,
          color: 'border-indigo-500/30 bg-indigo-950/20 text-indigo-300',
          badge: 'Open Palm',
        },
        {
          title: 'Tangan Dikepal / Dibuka (Tahan 3 Detik)',
          action: 'Kunci / Buka Kunci Mode Aman',
          desc: 'Tahan kepalan tangan (tangan ditutup) selama 3 detik untuk mengunci sistem dan menghilangkan semua titik laser agar tidak sengaja terpencet. Tahan tangan terbuka selama 3 detik untuk membuka kunci kembali.',
          icon: <span className="text-2xl">✊ ⇄ 🖐️</span>,
          color: 'border-rose-500/30 bg-rose-950/20 text-rose-300',
          badge: 'Safety Lock (3 Detik)',
        },
      ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Sliders className="w-7 h-7 text-indigo-400" />
            {isEn ? 'Gesture Settings & Calibration' : 'Pengaturan & Kalibrasi Gestur Tangan'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isEn
              ? 'Configure gesture controls: 1 Index Finger for slide navigation (left/right) & document scroll (up/down), and 2 Fingers (Index + Thumb) for zoom in/out.'
              : 'Konfigurasi kontrol gestur: 1 Jari Telunjuk untuk navigasi slide (kiri/kanan) & scroll dokumen (atas/bawah), dan 2 Jari (Telunjuk + Jempol) untuk zoom in/out.'}
          </p>
        </div>

        <button
          id="reset-config-btn"
          onClick={handleResetDefaults}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-2 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {isEn ? 'Reset to Defaults' : 'Reset Pengaturan Awal'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Sliders and Calibrations */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sliders Card */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-400" />
              {isEn ? 'Camera Sensor Parameter Tuning' : 'Tuning Parameter Sensor Kamera'}
            </h3>

            {/* Sensitivity Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-medium">
                <span className="text-slate-300">{isEn ? 'Gesture Detection Sensitivity' : 'Sensitivitas Deteksi Gestur'}</span>
                <span className="font-mono text-cyan-400 font-bold">{config.sensitivity} / 10</span>
              </div>
              <input
                id="slider-sensitivity"
                type="range"
                min={1}
                max={10}
                step={1}
                value={config.sensitivity}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onChangeConfig({
                    sensitivity: val,
                    swipeThreshold: Math.max(0.08, 0.22 - val * 0.015),
                  });
                }}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>{isEn ? 'Low (Requires broader hand motion)' : 'Rendah (Gerakan tangan lebih lebar)'}</span>
                <span>{isEn ? 'High (Subtle finger flicks detected)' : 'Tinggi (Gerakan jari halus terdeteksi)'}</span>
              </div>
            </div>

            {/* Swipe Threshold Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-medium">
                <span className="text-slate-300">{isEn ? 'Index Finger Swipe Threshold' : 'Ambang Batas Geseran Jari Telunjuk'}</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {Math.round(config.swipeThreshold * 100)}% {isEn ? 'Screen' : 'Layar'}
                </span>
              </div>
              <input
                id="slider-threshold"
                type="range"
                min={0.07}
                max={0.25}
                step={0.01}
                value={config.swipeThreshold}
                onChange={(e) => onChangeConfig({ swipeThreshold: Number(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>{isEn ? 'Responsive (7%)' : 'Responsif (7%)'}</span>
                <span>{isEn ? 'Standard (12%)' : 'Standar (12%)'}</span>
                <span>{isEn ? 'Strict (25%)' : 'Ketat (25%)'}</span>
              </div>
            </div>

            {/* Cooldown Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-medium">
                <span className="text-slate-300">{isEn ? 'Cooldown Delay Between Actions' : 'Jeda Cooldown Antar Aksi'}</span>
                <span className="font-mono text-emerald-400 font-bold">{config.cooldownMs} ms</span>
              </div>
              <input
                id="slider-cooldown"
                type="range"
                min={500}
                max={1500}
                step={50}
                value={config.cooldownMs}
                onChange={(e) => onChangeConfig({ cooldownMs: Number(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>{isEn ? 'Fast (500 ms)' : 'Cepat (500 ms)'}</span>
                <span>{isEn ? 'Standard (750 ms)' : 'Standar (750 ms)'}</span>
                <span>{isEn ? 'Stable (1500 ms)' : 'Stabil (1500 ms)'}</span>
              </div>
            </div>
          </div>

          {/* Gesture List Cards */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              {isEn ? 'Supported Hand Gestures' : 'Daftar Gestur Tangan yang Didukung'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {gestureCards.map((card, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${card.color} flex flex-col justify-between space-y-3`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {card.icon}
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {card.badge}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono bg-slate-900/60 px-2 py-0.5 rounded text-slate-400">
                        {card.action}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{card.title}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Camera & Interactive Test Log */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Camera View Card */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                Live Camera Test Bed
              </h3>
              <button
                onClick={onToggleCamera}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                {isCameraActive ? (isEn ? 'Turn Off Camera' : 'Matikan Kamera') : (isEn ? 'Turn On Camera' : 'Nyalakan Kamera')}
              </button>
            </div>

            <MiniCameraOverlay
              videoRef={videoRef}
              canvasRef={canvasRef}
              isCameraActive={isCameraActive}
              cameraError={cameraError}
              fps={fps}
              gestureState={gestureState}
              onToggleCamera={onToggleCamera}
              isFloating={false}
            />

            {/* Gesture Active State Display */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{isEn ? 'Finger Status:' : 'Status Jari:'}</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {gestureState.fingerStates
                    ? `${gestureState.fingerStates.extendedCount} ${isEn ? 'Fingers Active' : 'Jari Aktif'}`
                    : (isEn ? 'Not Detected' : 'Belum Terdeteksi')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{isEn ? 'Last Gesture:' : 'Gestur Terakhir:'}</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {gestureState.lastDetectedGesture}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{isEn ? 'Zoom Scale:' : 'Skala Zoom:'}</span>
                <span className="font-mono text-amber-400 font-bold">
                  {Math.round((gestureState.zoomScale || 1) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Event Test Log */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              {isEn ? 'Real-Time Gesture Event Log' : 'Log Respons Gestur Real-Time'}
            </h3>

            {testLog.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-6">
                {isEn
                  ? 'No gestures detected yet. Wave your index finger, 2 fingers, or 3 fingers toward the camera to test.'
                  : 'Belum ada gerakan terdeteksi. Lambaikan jari telunjuk, 2 jari, atau 3 jari ke kamera untuk menguji.'}
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {testLog.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs animate-in fade-in"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-semibold text-slate-200">{log.detected}</span>
                      <span className="text-slate-500">&rarr;</span>
                      <span className="text-indigo-400 font-mono">{log.action}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
