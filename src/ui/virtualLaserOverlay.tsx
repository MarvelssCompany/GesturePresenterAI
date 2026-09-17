import React, { useEffect, useRef, useState } from 'react';
import { PointerFrameData } from '../types';
import { smoothScrollEngine, ScrollDirectionFeedback } from '../utils/smoothScrollEngine';

interface VirtualLaserOverlayProps {
  isLaserEnabled: boolean;
  setPointerListener?: (cb: (data: PointerFrameData) => void) => void;
  zoomLevel: number;
  onResetZoom?: () => void;
  resetZoomMode?: () => void;
  onUnlockManual?: () => void;
}

export const VirtualLaserOverlay: React.FC<VirtualLaserOverlayProps> = ({
  isLaserEnabled,
  setPointerListener,
  zoomLevel,
  onResetZoom,
  resetZoomMode,
  onUnlockManual,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const indexDotRef = useRef<HTMLDivElement | null>(null);
  const thumbDotRef = useRef<HTMLDivElement | null>(null);
  const svgLineRef = useRef<SVGLineElement | null>(null);
  const tapBadgeRef = useRef<HTMLDivElement | null>(null);
  const tapTextRef = useRef<HTMLSpanElement | null>(null);
  const scrollBadgeRef = useRef<HTMLDivElement | null>(null);
  const scrollBadgeTextRef = useRef<HTMLSpanElement | null>(null);
  const hudRef = useRef<HTMLDivElement | null>(null);

  // Keep latest tracking data without triggering React re-renders
  const latestDataRef = useRef<PointerFrameData>({
    indexPos: null,
    thumbPos: null,
    isZoomModeActive: false,
    tapCount: 0,
    isLocked: false,
    lockCountdown: null,
  });

  // Current interpolated positions for 60-120fps buttery smoothing
  const currIndexRef = useRef<{ x: number; y: number } | null>(null);
  const currThumbRef = useRef<{ x: number; y: number } | null>(null);
  const isZoomActiveStateRef = useRef<boolean>(false);
  const [isZoomActiveState, setIsZoomActiveState] = useState<boolean>(false);

  useEffect(() => {
    if (!setPointerListener) return;

    setPointerListener((data: PointerFrameData) => {
      latestDataRef.current = data;

      // Only update local React state if zoom mode actively toggled
      if (data.isZoomModeActive !== isZoomActiveStateRef.current) {
        isZoomActiveStateRef.current = data.isZoomModeActive;
        setIsZoomActiveState(data.isZoomModeActive);
      }
    });
  }, [setPointerListener]);

  // High-performance RAF animation loop directly updating DOM transforms
  useEffect(() => {
    let rafId: number;

    const tick = () => {
      const { indexPos, thumbPos, isZoomModeActive, tapCount, isLocked } = latestDataRef.current;
      const width = window.innerWidth;
      const height = window.innerHeight;

      // If system is currently LOCKED: HIDE ALL DOTS AND STOP SCROLL ENGINE!
      if (isLocked) {
        if (indexDotRef.current) indexDotRef.current.style.opacity = '0';
        if (thumbDotRef.current) thumbDotRef.current.style.opacity = '0';
        if (svgLineRef.current) svgLineRef.current.style.opacity = '0';
        if (tapBadgeRef.current) tapBadgeRef.current.style.display = 'none';
        if (scrollBadgeRef.current) scrollBadgeRef.current.style.display = 'none';
        currIndexRef.current = null;
        currThumbRef.current = null;
        smoothScrollEngine.updateFingerPosition(null, false);

        rafId = requestAnimationFrame(tick);
        return;
      }

      // =======================================================================
      // 1. RED DOT (INDEX FINGER) - BUTTERY SMOOTH ANTI-JITTER LERP
      // =======================================================================
      if (indexDotRef.current) {
        if (isLaserEnabled && indexPos) {
          const targetX = indexPos.x * width;
          const targetY = indexPos.y * height;

          if (!currIndexRef.current) {
            currIndexRef.current = { x: targetX, y: targetY };
          } else {
            const dist = Math.hypot(targetX - currIndexRef.current.x, targetY - currIndexRef.current.y);
            // Ultra-smooth dual-stage dampening:
            // - Sub-pixel jitter (< 3px): high dampening (0.16) eliminates webcam landmark shake
            // - Smooth movement (3px - 35px): silky glide (0.36 - 0.58)
            // - Rapid flick (> 35px): immediate tracking (0.84)
            let lerpFactor = 0.46;
            if (dist < 3.0) {
              lerpFactor = 0.16;
            } else if (dist < 35.0) {
              lerpFactor = 0.36 + (dist / 35.0) * 0.22;
            } else {
              lerpFactor = Math.min(0.86, 0.58 + Math.min(1, (dist - 35) / 55) * 0.28);
            }

            currIndexRef.current.x += (targetX - currIndexRef.current.x) * lerpFactor;
            currIndexRef.current.y += (targetY - currIndexRef.current.y) * lerpFactor;
          }

          indexDotRef.current.style.opacity = '1';
          indexDotRef.current.style.transform = `translate3d(${currIndexRef.current.x}px, ${currIndexRef.current.y}px, 0)`;

          // Tap Counter Badge (1/3, 2/3)
          if (tapBadgeRef.current && tapTextRef.current) {
            if (tapCount > 0 && !isZoomModeActive) {
              tapBadgeRef.current.style.display = 'flex';
              tapTextRef.current.textContent = `Tepuk: ${tapCount}/3`;
            } else {
              tapBadgeRef.current.style.display = 'none';
            }
          }

          // Smooth Positional Scrolling according to finger elevation (tingkatan jari)
          if (!isZoomModeActive) {
            const feedback: ScrollDirectionFeedback = smoothScrollEngine.updateFingerPosition(indexPos.y, true);
            if (scrollBadgeRef.current && scrollBadgeTextRef.current) {
              if (feedback) {
                scrollBadgeRef.current.style.display = 'flex';
                if (feedback === 'SCROLL_DOWN_SLOW') {
                  scrollBadgeTextRef.current.textContent = '↓ Pelan';
                  scrollBadgeRef.current.className = 'absolute -bottom-7 px-2 py-0.5 rounded-full bg-cyan-500/90 text-slate-950 font-bold text-[10px] shadow-lg border border-cyan-300 whitespace-nowrap flex items-center gap-1';
                } else if (feedback === 'SCROLL_DOWN_FAST') {
                  scrollBadgeTextRef.current.textContent = '⏬ Cepat';
                  scrollBadgeRef.current.className = 'absolute -bottom-7 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow-lg border border-white whitespace-nowrap animate-pulse flex items-center gap-1';
                } else if (feedback === 'SCROLL_UP_SLOW') {
                  scrollBadgeTextRef.current.textContent = '↑ Pelan';
                  scrollBadgeRef.current.className = 'absolute -bottom-7 px-2 py-0.5 rounded-full bg-cyan-500/90 text-slate-950 font-bold text-[10px] shadow-lg border border-cyan-300 whitespace-nowrap flex items-center gap-1';
                } else if (feedback === 'SCROLL_UP_FAST') {
                  scrollBadgeTextRef.current.textContent = '⏫ Cepat';
                  scrollBadgeRef.current.className = 'absolute -bottom-7 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow-lg border border-white whitespace-nowrap animate-pulse flex items-center gap-1';
                }
              } else {
                scrollBadgeRef.current.style.display = 'none';
              }
            }
          } else {
            smoothScrollEngine.updateFingerPosition(null, false);
            if (scrollBadgeRef.current) scrollBadgeRef.current.style.display = 'none';
          }
        } else {
          indexDotRef.current.style.opacity = '0';
          currIndexRef.current = null;
          if (tapBadgeRef.current) tapBadgeRef.current.style.display = 'none';
          if (scrollBadgeRef.current) scrollBadgeRef.current.style.display = 'none';
          smoothScrollEngine.updateFingerPosition(null, false);
        }
      }

      // =======================================================================
      // 2. GREEN DOT (THUMB FINGER) - ONLY WHEN ZOOM MODE ACTIVE
      // =======================================================================
      if (thumbDotRef.current) {
        if (isLaserEnabled && isZoomModeActive && thumbPos) {
          const targetThumbX = thumbPos.x * width;
          const targetThumbY = thumbPos.y * height;

          if (!currThumbRef.current) {
            currThumbRef.current = { x: targetThumbX, y: targetThumbY };
          } else {
            const dist = Math.hypot(targetThumbX - currThumbRef.current.x, targetThumbY - currThumbRef.current.y);
            const lerpFactor = Math.min(0.92, 0.68 + Math.min(1, dist / 80) * 0.24);
            currThumbRef.current.x += (targetThumbX - currThumbRef.current.x) * lerpFactor;
            currThumbRef.current.y += (targetThumbY - currThumbRef.current.y) * lerpFactor;
          }

          thumbDotRef.current.style.opacity = '1';
          thumbDotRef.current.style.transform = `translate3d(${currThumbRef.current.x}px, ${currThumbRef.current.y}px, 0)`;
        } else {
          thumbDotRef.current.style.opacity = '0';
          currThumbRef.current = null;
        }
      }

      // =======================================================================
      // 3. LASER BEAM LINE CONNECTING RED & GREEN DOTS
      // =======================================================================
      if (svgLineRef.current) {
        if (
          isLaserEnabled &&
          isZoomModeActive &&
          currIndexRef.current &&
          currThumbRef.current &&
          thumbPos
        ) {
          svgLineRef.current.setAttribute('x1', `${currIndexRef.current.x}`);
          svgLineRef.current.setAttribute('y1', `${currIndexRef.current.y}`);
          svgLineRef.current.setAttribute('x2', `${currThumbRef.current.x}`);
          svgLineRef.current.setAttribute('y2', `${currThumbRef.current.y}`);
          svgLineRef.current.style.opacity = '1';
        } else {
          svgLineRef.current.style.opacity = '0';
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isLaserEnabled]);

  return (
    <div
      ref={containerRef}
      id="virtual-laser-overlay-root"
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
    >
      {/* Laser Connector Line in Zoom Mode */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-40">
        <line
          ref={svgLineRef}
          x1="0"
          y1="0"
          x2="0"
          y2="0"
          stroke="#10b981"
          strokeWidth="3"
          strokeDasharray="6 4"
          className="animate-pulse"
          style={{ opacity: 0, transition: 'opacity 0.15s ease' }}
        />
      </svg>

      {/* Titik 1: Merah 🔴 (Telunjuk) */}
      <div
        ref={indexDotRef}
        id="virtual-index-dot-red"
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center will-change-transform"
        style={{ opacity: 0 }}
      >
        {/* Tap Counter Badge */}
        <div
          ref={tapBadgeRef}
          style={{ display: 'none' }}
          className="absolute -top-9 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-xl border-2 border-white whitespace-nowrap animate-bounce flex items-center gap-1"
        >
          <span>👆</span>
          <span ref={tapTextRef}>Tepuk: 0/3</span>
        </div>

        <div className="relative flex items-center justify-center">
          {/* Subtle Laser Aura */}
          <div className="absolute w-8 h-8 rounded-full bg-rose-500/25 blur-[3px]" />
          {/* Concentric high-contrast core */}
          <div className="w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_12px_#f43f5e,0_0_22px_#e11d48] border-2 border-white flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_3px_#ffffff]" />
          </div>
        </div>

        <span className="mt-1 text-[9px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-slate-950/80 border border-rose-500/50 text-rose-300">
          Telunjuk 🔴
        </span>

        {/* Dynamic Scroll Speed Feedback Badge (Sesuai Tingkatan Jari) */}
        <div
          ref={scrollBadgeRef}
          style={{ display: 'none' }}
          className="absolute -bottom-7 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] shadow-lg border border-cyan-300 whitespace-nowrap flex items-center gap-1"
        >
          <span ref={scrollBadgeTextRef}>↓ Pelan</span>
        </div>
      </div>

      {/* Titik 2: Hijau 🟢 (Jempol) - HANYA MUNCUL SETELAH 3X TEPUK */}
      <div
        ref={thumbDotRef}
        id="virtual-thumb-dot-green"
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center will-change-transform"
        style={{ opacity: 0 }}
      >
        <div className="relative">
          <div className="w-5 h-5 rounded-full bg-emerald-500 shadow-[0_0_18px_#10b981,0_0_32px_#10b981] border-2 border-white flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
          <div className="absolute inset-0 w-5 h-5 rounded-full bg-emerald-500/50 animate-ping" />
        </div>

        <span className="mt-1 text-[9px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-slate-950/80 border border-emerald-500/50 text-emerald-300">
          Jempol 🟢
        </span>
      </div>

      {/* Floating Mode Zoom Active Indicator HUD */}
      {isZoomActiveState && (
        <div
          ref={hudRef}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-auto bg-emerald-950/90 border border-emerald-500/60 shadow-2xl backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3 text-xs text-emerald-200 animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-white">🟢 Mode Zoom Aktif (2 Titik: 🔴+🟢)</span>
          </div>
          <span className="text-emerald-400 font-mono font-bold">
            {Math.round(zoomLevel * 100)}%
          </span>
          <span className="text-emerald-300/80 text-[11px] hidden sm:inline">
            Rentangkan = Perbesar &bull; Rapatkan = Perkecil
          </span>
          {resetZoomMode && (
            <button
              onClick={() => {
                if (onResetZoom) onResetZoom();
                resetZoomMode();
              }}
              className="ml-1 px-2.5 py-0.5 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-[11px] border border-emerald-400/50 transition cursor-pointer"
            >
              Reset Zoom
            </button>
          )}
        </div>
      )}
    </div>
  );
};
