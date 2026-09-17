import { useEffect, useRef, useState, useCallback } from 'react';
import { CameraController } from './cameraController';
import { HandTracker } from '../handTracking/handTracker';
import { GestureEngine } from '../gesture/gestureEngine';
import {
  GestureConfig,
  GestureState,
  GestureType,
  GestureAction,
  HandLandmark,
  PointerFrameData,
} from '../types';

const DEFAULT_CONFIG: GestureConfig = {
  sensitivity: 7,
  swipeThreshold: 0.12,
  cooldownMs: 750,
  targetFPS: 20,
  laserSmoothing: 0.3,
};

export function useHandCamera(initialConfig?: Partial<GestureConfig>) {
  const mergedConfig: GestureConfig = { ...DEFAULT_CONFIG, ...initialConfig };
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const cameraControllerRef = useRef<CameraController | null>(null);
  const handTrackerRef = useRef<HandTracker | null>(null);
  const gestureEngineRef = useRef<GestureEngine | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(0);
  const [gestureState, setGestureState] = useState<GestureState>({
    currentGesture: 'IDLE',
    confidence: 0,
    lastActionTime: 0,
    lastDetectedGesture: 'IDLE',
    handDetected: false,
    pointerPos: null,
    pinchPos: null,
    wristPos: null,
    zoomScale: 1.0,
    scrollDelta: 0,
    statusMessage: 'Arahkan tangan ke kamera',
  });

  const [lastAction, setLastAction] = useState<{ action: string; time: number } | null>(null);
  const actionListenerRef = useRef<((action: GestureAction, gesture: GestureType) => void) | null>(null);
  const pointerListenerRef = useRef<((data: PointerFrameData) => void) | null>(null);
  const scrollListenerRef = useRef<((deltaY: number) => void) | null>(null);
  const zoomListenerRef = useRef<((scale: number) => void) | null>(null);

  // Initialize controllers once
  if (!cameraControllerRef.current) {
    cameraControllerRef.current = new CameraController(mergedConfig.targetFPS);
  }
  if (!handTrackerRef.current) {
    handTrackerRef.current = new HandTracker();
  }
  if (!gestureEngineRef.current) {
    gestureEngineRef.current = new GestureEngine(mergedConfig);
  }

  const setActionListener = useCallback((cb: (action: GestureAction, gesture: GestureType) => void) => {
    actionListenerRef.current = cb;
  }, []);

  const setPointerListener = useCallback((cb: (data: PointerFrameData) => void) => {
    pointerListenerRef.current = cb;
  }, []);

  const setScrollListener = useCallback((cb: (deltaY: number) => void) => {
    scrollListenerRef.current = cb;
  }, []);

  const setZoomListener = useCallback((cb: (scale: number) => void) => {
    zoomListenerRef.current = cb;
  }, []);

  const setZoomScale = useCallback((scale: number) => {
    if (gestureEngineRef.current) {
      gestureEngineRef.current.setZoomScale(scale);
    }
  }, []);

  const updateConfig = useCallback((cfg: Partial<GestureConfig>) => {
    if (cfg.targetFPS && cameraControllerRef.current) {
      cameraControllerRef.current.setTargetFps(cfg.targetFPS);
    }
    if (gestureEngineRef.current) {
      gestureEngineRef.current.updateConfig(cfg);
    }
  }, []);

  const startCamera = useCallback(async (): Promise<boolean> => {
    if (!videoRef.current) return false;
    setCameraError(null);

    const tracker = handTrackerRef.current!;
    const trackerReady = await tracker.initialize();
    if (!trackerReady) {
      setCameraError('Gagal menginisialisasi pelacakan tangan MediaPipe.');
      return false;
    }

    const camera = cameraControllerRef.current!;
    camera.onError((err) => setCameraError(err));
    camera.onFpsChange((currentFps) => {
      setFps(currentFps);
      if (currentFps < 12 && camera.getTargetFps() > 15) {
        camera.setTargetFps(15);
      }
    });

    const engine = gestureEngineRef.current!;

    engine.onStateChange((newState) => {
      setGestureState(newState);
    });

    engine.onAction((action, gesture) => {
      setLastAction({ action, time: Date.now() });
      if (actionListenerRef.current) {
        actionListenerRef.current(action, gesture);
      }
    });

    engine.onPointerUpdate((data) => {
      if (pointerListenerRef.current) {
        pointerListenerRef.current(data);
      }
    });

    engine.onScrollUpdate((deltaY) => {
      if (scrollListenerRef.current) {
        scrollListenerRef.current(deltaY);
      }
    });

    engine.onZoomUpdate((scale) => {
      if (zoomListenerRef.current) {
        zoomListenerRef.current(scale);
      }
    });

    tracker.onResults((landmarks: HandLandmark[] | null) => {
      engine.processLandmarks(landmarks);

      if (canvasRef.current && landmarks) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          const isZoomActive = engine.getIsZoomModeActive();
          const tapCount = engine.getTapCount();
          tracker.drawLandmarks(ctx, landmarks, canvasRef.current.width, canvasRef.current.height, isZoomActive, tapCount);
        }
      } else if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    });

    const ok = await camera.start(videoRef.current, (videoEl) => {
      tracker.processFrame(videoEl);
    });

    setIsCameraActive(ok);
    return ok;
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraControllerRef.current) {
      cameraControllerRef.current.stop();
    }
    setIsCameraActive(false);
    setGestureState((prev) => ({
      ...prev,
      handDetected: false,
      currentGesture: 'IDLE',
      pointerPos: null,
      statusMessage: 'Kamera nonaktif',
    }));
  }, []);

  useEffect(() => {
    return () => {
      if (cameraControllerRef.current) {
        cameraControllerRef.current.stop();
      }
    };
  }, []);

  const resetZoomMode = useCallback(() => {
    if (gestureEngineRef.current) {
      gestureEngineRef.current.resetZoomMode();
    }
  }, []);

  const setLocked = useCallback((locked: boolean) => {
    if (gestureEngineRef.current) {
      gestureEngineRef.current.setLocked(locked);
    }
  }, []);

  return {
    videoRef,
    canvasRef,
    isCameraActive,
    cameraError,
    fps,
    gestureState,
    isLocked: gestureState.isLocked ?? false,
    lastAction,
    startCamera,
    stopCamera,
    setLocked,
    setActionListener,
    setPointerListener,
    setScrollListener,
    setZoomListener,
    setZoomScale,
    resetZoomMode,
    updateConfig,
  };
}
