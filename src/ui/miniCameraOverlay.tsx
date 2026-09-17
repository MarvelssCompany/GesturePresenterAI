import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  GripHorizontal,
} from 'lucide-react';
import { GestureState } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface MiniCameraOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isCameraActive: boolean;
  cameraError: string | null;
  fps: number;
  gestureState: GestureState;
  onToggleCamera: () => void;
  className?: string;
  isFloating?: boolean;
}

export const MiniCameraOverlay: React.FC<MiniCameraOverlayProps> = ({
  videoRef,
  canvasRef,
  isCameraActive,
  cameraError,
  fps,
  gestureState,
  onToggleCamera,
  className = '',
  isFloating = true,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  // Minimize state: shrinks the camera down to ultra-compact size without unmounting!
  const [isMinimized, setIsMinimized] = useState(false);
  // Toggle skeleton lines
  const [showSkeleton, setShowSkeleton] = useState(true);

  // Position state for draggable floating window
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [boxWidth, setBoxWidth] = useState<number>(230);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragOffsetRef = useRef<{ offsetX: number; offsetY: number }>({ offsetX: 0, offsetY: 0 });

  const isResizingRef = useRef<boolean>(false);
  const resizeStartRef = useRef<{ startX: number; startWidth: number }>({ startX: 0, startWidth: 230 });

  // Minimized width: compact 130px, normal width: boxWidth (default 230px)
  const MINIMIZED_WIDTH = 130;
  const currentCardWidth = isMinimized ? MINIMIZED_WIDTH : boxWidth;

  // Set default position bottom-right
  useEffect(() => {
    if (isFloating && position === null && typeof window !== 'undefined') {
      const defaultX = Math.max(16, window.innerWidth - boxWidth - 24);
      const defaultY = Math.max(16, window.innerHeight - 300);
      setPosition({ x: defaultX, y: defaultY });
    }
  }, [isFloating, position, boxWidth]);

  // Handle Dragging via Header
  const handleDragStart = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    const rect = cardRef.current?.getBoundingClientRect();
    const curX = rect ? rect.left : (position?.x ?? 20);
    const curY = rect ? rect.top : (position?.y ?? 20);

    dragOffsetRef.current = {
      offsetX: clientX - curX,
      offsetY: clientY - curY,
    };
  };

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const targetX = moveEvent.clientX - dragOffsetRef.current.offsetX;
      const targetY = moveEvent.clientY - dragOffsetRef.current.offsetY;

      const maxX = Math.max(10, window.innerWidth - currentCardWidth - 10);
      const maxY = Math.max(10, window.innerHeight - 50);

      setPosition({
        x: Math.max(8, Math.min(maxX, targetX)),
        y: Math.max(8, Math.min(maxY, targetY)),
      });
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleHeaderTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);

    const onTouchMove = (moveEvent: TouchEvent) => {
      if (!isDraggingRef.current || moveEvent.touches.length !== 1) return;
      const t = moveEvent.touches[0];
      const targetX = t.clientX - dragOffsetRef.current.offsetX;
      const targetY = t.clientY - dragOffsetRef.current.offsetY;

      const maxX = Math.max(10, window.innerWidth - currentCardWidth - 10);
      const maxY = Math.max(10, window.innerHeight - 50);

      setPosition({
        x: Math.max(8, Math.min(maxX, targetX)),
        y: Math.max(8, Math.min(maxY, targetY)),
      });
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
  };

  // Handle Resize Handle Dragging (only active when not minimized)
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    resizeStartRef.current = {
      startX: e.clientX,
      startWidth: boxWidth,
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current) return;
      const delta = moveEvent.clientX - resizeStartRef.current.startX;
      const newWidth = Math.max(160, Math.min(480, resizeStartRef.current.startWidth + delta));
      setBoxWidth(newWidth);
    };

    const onMouseUp = () => {
      isResizingRef.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleResizeTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length !== 1) return;
    isResizingRef.current = true;
    resizeStartRef.current = {
      startX: e.touches[0].clientX,
      startWidth: boxWidth,
    };

    const onTouchMove = (moveEvent: TouchEvent) => {
      if (!isResizingRef.current || moveEvent.touches.length !== 1) return;
      const delta = moveEvent.touches[0].clientX - resizeStartRef.current.startX;
      const newWidth = Math.max(160, Math.min(480, resizeStartRef.current.startWidth + delta));
      setBoxWidth(newWidth);
    };

    const onTouchEnd = () => {
      isResizingRef.current = false;
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
  };

  // Simplified gesture badge text & styling
  const getGestureInfo = () => {
    if (gestureState.isLocked) {
      if (gestureState.lockCountdown?.mode === 'UNLOCKING') {
        return {
          text: isMinimized
            ? (isEn ? `Unlock (${gestureState.lockCountdown.remainingSeconds}s)` : `Buka (${gestureState.lockCountdown.remainingSeconds}s)`)
            : (isEn ? `Unlocking (${gestureState.lockCountdown.remainingSeconds}s)` : `Buka Kunci (${gestureState.lockCountdown.remainingSeconds}s)`),
          badgeClass: 'bg-emerald-500 text-slate-950 font-bold',
        };
      }
      return {
        text: isMinimized
          ? (isEn ? 'Locked' : 'Terkunci')
          : (isEn ? 'Locked (Hold 3s)' : 'Terkunci (Tahan 3s)'),
        badgeClass: 'bg-rose-500 text-white font-bold',
      };
    }

    if (gestureState.lockCountdown?.mode === 'LOCKING') {
      return {
        text: isMinimized
          ? (isEn ? `Lock (${gestureState.lockCountdown.remainingSeconds}s)` : `Kunci (${gestureState.lockCountdown.remainingSeconds}s)`)
          : (isEn ? `Locking (${gestureState.lockCountdown.remainingSeconds}s)` : `Mengunci (${gestureState.lockCountdown.remainingSeconds}s)`),
        badgeClass: 'bg-rose-500 text-white font-bold',
      };
    }

    if (gestureState.isZoomModeActive) {
      if (gestureState.currentGesture === 'PINCH_ZOOM_IN') {
        return { text: isMinimized ? 'Zoom +' : 'Zoom In (+)', badgeClass: 'bg-emerald-400 text-slate-950 font-bold' };
      }
      if (gestureState.currentGesture === 'PINCH_ZOOM_OUT') {
        return { text: isMinimized ? 'Zoom -' : 'Zoom Out (-)', badgeClass: 'bg-emerald-300 text-slate-950 font-bold' };
      }
      return { text: 'Zoom', badgeClass: 'bg-emerald-500 text-slate-950 font-bold' };
    }

    switch (gestureState.currentGesture) {
      case 'INDEX_SWIPE_RIGHT':
      case 'SWIPE_RIGHT':
        return {
          text: isMinimized ? (isEn ? 'Next 👉' : 'Maju 👉') : (isEn ? 'Next 👉' : 'Berikutnya 👉'),
          badgeClass: 'bg-sky-400 text-slate-950 font-bold',
        };
      case 'INDEX_SWIPE_LEFT':
      case 'SWIPE_LEFT':
        return {
          text: isMinimized ? (isEn ? '👈 Prev' : '👈 Mundur') : (isEn ? '👈 Previous' : '👈 Sebelumnya'),
          badgeClass: 'bg-sky-400 text-slate-950 font-bold',
        };
      case 'INDEX_SCROLL_UP':
        return {
          text: isMinimized ? (isEn ? 'Up 🔼' : 'Atas 🔼') : (isEn ? 'Scroll Up 🔼' : 'Scroll Atas 🔼'),
          badgeClass: 'bg-indigo-400 text-slate-950 font-bold',
        };
      case 'INDEX_SCROLL_DOWN':
        return {
          text: isMinimized ? (isEn ? 'Down 🔽' : 'Bawah 🔽') : (isEn ? 'Scroll Down 🔽' : 'Scroll Bawah 🔽'),
          badgeClass: 'bg-indigo-400 text-slate-950 font-bold',
        };
      case 'INDEX_POINTER':
        return {
          text: isMinimized ? 'Laser 🔴' : 'Laser Pointer 🔴',
          badgeClass: 'bg-rose-500 text-white font-bold',
        };
      default:
        if (gestureState.handDetected) {
          return {
            text: isMinimized ? (isEn ? 'Ready' : 'Siap') : (isEn ? 'Hand Ready' : 'Tangan Siap'),
            badgeClass: 'bg-slate-800 text-cyan-300 font-medium',
          };
        }
        return {
          text: isMinimized ? '...' : (isEn ? 'Waiting...' : 'Menunggu...'),
          badgeClass: 'bg-slate-800/80 text-slate-400 font-medium',
        };
    }
  };

  const currentGestureInfo = getGestureInfo();

  const floatingStyle: React.CSSProperties = isFloating && position
    ? {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${currentCardWidth}px`,
        zIndex: 50,
        transition: isDraggingRef.current ? 'none' : 'width 0.18s ease-out',
      }
    : {
        width: `${currentCardWidth}px`,
        transition: 'width 0.18s ease-out',
      };

  return (
    <div
      ref={cardRef}
      id="mini-camera-card"
      style={floatingStyle}
      className={`shadow-2xl rounded-2xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-md overflow-hidden select-none transition-shadow ${className}`}
    >
      {/* HEADER: Bersih & Ringkas */}
      <div
        id="camera-card-header"
        onMouseDown={handleHeaderMouseDown}
        onTouchStart={handleHeaderTouchStart}
        className={`flex items-center justify-between px-2.5 py-1.5 bg-slate-950 border-b border-slate-800 text-xs cursor-grab active:cursor-grabbing hover:bg-slate-900/80 transition-colors ${
          isMinimized ? 'py-1' : 'py-1.5'
        }`}
        title={isEn ? 'Drag to reposition camera' : 'Geser posisi kotak kamera'}
      >
        {/* Sisi Kiri: Status Kamera Singkat */}
        <div className="flex items-center gap-1.5 pointer-events-none truncate">
          <GripHorizontal className="w-3 h-3 text-slate-500 shrink-0" />
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isCameraActive ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-rose-500'
            }`}
          />
          {!isMinimized && (
            <span className="font-semibold text-slate-200 text-[11px] tracking-wide truncate">
              {isEn ? 'Camera' : 'Kamera'}
            </span>
          )}
          {isCameraActive && fps > 0 && !isMinimized && (
            <span className="text-[10px] text-slate-400 font-mono shrink-0">
              {fps}fps
            </span>
          )}
        </div>

        {/* Sisi Kanan: Kontrol Sederhana */}
        <div className="flex items-center gap-0.5 shrink-0">
          {/* Toggle Garis Rangka Sendi (Hanya saat ukuran normal) */}
          {isCameraActive && !isMinimized && (
            <button
              id="camera-toggle-skeleton-btn"
              onClick={() => setShowSkeleton(!showSkeleton)}
              title={
                showSkeleton
                  ? (isEn ? 'Hide Skeleton Joints' : 'Sembunyikan Garis Sendi')
                  : (isEn ? 'Show Skeleton Joints' : 'Tampilkan Garis Sendi')
              }
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              {showSkeleton ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Tombol Minimize / Expand */}
          <button
            id="camera-minimize-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={
              isMinimized
                ? (isEn ? 'Maximize Camera' : 'Perbesar Kamera')
                : (isEn ? 'Minimize Camera' : 'Kecilkan Kamera')
            }
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            {isMinimized ? <Maximize2 className="w-3 h-3 text-cyan-400" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* VIDEO VIEWPORT: SELALU TERPASANG DI DOM (TIDAK PERNAH DI-UNMOUNT AGAR TIDAK NGE-LAG/FREEZE) */}
      <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef as any}
          className={`w-full h-full object-cover -scale-x-100 ${!isCameraActive ? 'hidden' : ''}`}
          playsInline
          muted
          autoPlay
        />

        <canvas
          ref={canvasRef as any}
          width={320}
          height={240}
          className={`absolute inset-0 w-full h-full pointer-events-none ${
            !isCameraActive || !showSkeleton ? 'hidden' : ''
          }`}
        />

        {/* Fallback Jika Kamera Belum Aktif */}
        {!isCameraActive && (
          <div className="p-3 text-center flex flex-col items-center justify-center gap-1.5">
            <Camera className="w-5 h-5 text-slate-500" />
            {!isMinimized && (
              <>
                {cameraError ? (
                  <p className="text-[10px] text-rose-400 leading-snug">
                    {cameraError}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400">
                    {isEn ? 'Camera inactive' : 'Kamera nonaktif'}
                  </p>
                )}
              </>
            )}
            <button
              id="camera-enable-btn"
              onClick={onToggleCamera}
              className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-semibold transition cursor-pointer"
            >
              {isEn ? 'Turn On' : 'Nyalakan'}
            </button>
          </div>
        )}

        {/* Sudut Handle Resize (Hanya aktif jika tidak sedang diminimize) */}
        {!isMinimized && (
          <div
            id="camera-corner-resize-handle"
            onMouseDown={handleResizeMouseDown}
            onTouchStart={handleResizeTouchStart}
            title={isEn ? 'Drag corner to resize camera window' : 'Tarik sudut untuk menyesuaikan ukuran kotak kamera'}
            className="absolute bottom-1 right-1 w-4 h-4 flex items-center justify-center cursor-se-resize text-slate-500 hover:text-cyan-400 transition z-20"
          >
            <div className="w-2 h-2 border-r-2 border-b-2 border-current" />
          </div>
        )}
      </div>

      {/* STATUS BAR: Bersih & Menyesuaikan Ukuran */}
      <div
        className={`bg-slate-950 border-t border-slate-800/80 flex items-center transition-all ${
          isMinimized
            ? 'px-2 py-1 justify-center'
            : 'px-3 py-1.5 justify-between gap-2'
        }`}
      >
        {!isMinimized && (
          <span className="text-[10px] text-slate-400 truncate">
            {gestureState.statusMessage || (gestureState.handDetected ? (isEn ? 'Detected' : 'Terdeteksi') : (isEn ? 'Ready' : 'Siap'))}
          </span>
        )}

        <span
          className={`rounded-full tracking-wide shrink-0 transition-all font-semibold ${
            isMinimized
              ? 'px-2 py-0.5 text-[9px] truncate max-w-full text-center'
              : 'px-2 py-0.5 text-[10px]'
          } ${currentGestureInfo.badgeClass}`}
        >
          {currentGestureInfo.text}
        </span>
      </div>
    </div>
  );
};
