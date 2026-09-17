import {
  HandLandmark,
  GestureConfig,
  GestureState,
  GestureType,
  GestureAction,
  PointerFrameData,
} from '../types';
import { SwipeDetector } from './swipeDetector';
import { PointerDetector } from './pointerDetector';
import { PinchDetector } from './pinchDetector';
import { PalmDetector } from './palmDetector';
import { FingerStateDetector } from './fingerStateDetector';
import { IndexSwipeDetector } from './indexSwipeDetector';
import { TwoFingerZoomDetector } from './twoFingerZoomDetector';
import { ThreeFingerScrollDetector } from './threeFingerScrollDetector';
import { LockStateDetector } from './lockStateDetector';

export class GestureEngine {
  private config: GestureConfig;
  private swipeDetector: SwipeDetector;
  private pointerDetector: PointerDetector;
  private pinchDetector: PinchDetector;
  private palmDetector: PalmDetector;
  private fingerDetector: FingerStateDetector;

  // New specific detectors
  private indexSwipeDetector: IndexSwipeDetector;
  private twoFingerZoomDetector: TwoFingerZoomDetector;
  private threeFingerScrollDetector: ThreeFingerScrollDetector;
  private lockDetector: LockStateDetector;

  private currentState: GestureState;
  private onActionCallback: ((action: GestureAction, gesture: GestureType) => void) | null = null;
  private onStateChangeCallback: ((state: GestureState) => void) | null = null;
  private onPointerUpdateCallback: ((data: PointerFrameData) => void) | null = null;
  private onScrollUpdateCallback: ((deltaY: number) => void) | null = null;
  private onZoomUpdateCallback: ((scale: number) => void) | null = null;

  // State throttling to prevent React from re-rendering 60fps on idle cursor moves
  private lastEmittedStateTime: number = 0;
  private lastEmittedGesture: GestureType = 'IDLE';
  private lastEmittedZoomMode: boolean = false;
  private lastEmittedTapCount: number = 0;
  private lastEmittedHandDetected: boolean = false;
  private lastEmittedLocked: boolean = false;

  constructor(config: GestureConfig) {
    this.config = config;
    this.swipeDetector = new SwipeDetector();
    this.swipeDetector.setConfig(config.swipeThreshold, config.cooldownMs);

    this.pointerDetector = new PointerDetector();
    this.pointerDetector.setSmoothing(config.laserSmoothing);

    this.pinchDetector = new PinchDetector();
    this.palmDetector = new PalmDetector();
    this.fingerDetector = new FingerStateDetector();

    this.indexSwipeDetector = new IndexSwipeDetector();
    this.indexSwipeDetector.setConfig(config.swipeThreshold, config.cooldownMs);

    this.twoFingerZoomDetector = new TwoFingerZoomDetector();
    this.threeFingerScrollDetector = new ThreeFingerScrollDetector();
    this.lockDetector = new LockStateDetector();

    this.currentState = {
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
      statusMessage: 'Kamera siap - Arahkan tangan ke kamera',
      isLocked: false,
      lockCountdown: null,
    };
  }

  public updateConfig(newConfig: Partial<GestureConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.swipeDetector.setConfig(this.config.swipeThreshold, this.config.cooldownMs);
    this.pointerDetector.setSmoothing(this.config.laserSmoothing);
    this.indexSwipeDetector.setConfig(this.config.swipeThreshold, this.config.cooldownMs);
  }

  public setLocked(locked: boolean): void {
    this.lockDetector.setLocked(locked);
    this.currentState.isLocked = locked;
    this.currentState.lockCountdown = null;
    if (locked) {
      this.twoFingerZoomDetector.resetZoomMode();
      this.indexSwipeDetector.reset();
      this.swipeDetector.reset();
      this.currentState.statusMessage = '🔒 Mode Terkunci • Tahan tangan terbuka selama 5 detik untuk membuka';
      this.triggerAction('LOCK_SYSTEM', 'FIST_LOCKED');
    } else {
      this.currentState.statusMessage = '🔓 Mode Terbuka • Semua fungsi & titik laser aktif kembali!';
      this.triggerAction('UNLOCK_SYSTEM', 'OPEN_HAND_UNLOCKED');
    }
    this.emitStateChange();
    if (this.onPointerUpdateCallback) {
      this.onPointerUpdateCallback({
        indexPos: null,
        thumbPos: null,
        isZoomModeActive: false,
        tapCount: 0,
        isLocked: locked,
        lockCountdown: null,
      });
    }
  }

  public getIsLocked(): boolean {
    return this.lockDetector.getIsLocked();
  }

  public onAction(cb: (action: GestureAction, gesture: GestureType) => void): void {
    this.onActionCallback = cb;
  }

  public onStateChange(cb: (state: GestureState) => void): void {
    this.onStateChangeCallback = cb;
  }

  public onPointerUpdate(cb: (data: PointerFrameData) => void): void {
    this.onPointerUpdateCallback = cb;
  }

  public onScrollUpdate(cb: (deltaY: number) => void): void {
    this.onScrollUpdateCallback = cb;
  }

  public onZoomUpdate(cb: (scale: number) => void): void {
    this.onZoomUpdateCallback = cb;
  }

  public setZoomScale(scale: number) {
    this.twoFingerZoomDetector.setScale(scale);
    this.currentState.zoomScale = scale;
  }

  public getIsZoomModeActive(): boolean {
    return this.twoFingerZoomDetector.getIsZoomModeActive();
  }

  public getTapCount(): number {
    return this.twoFingerZoomDetector.getTapCount();
  }

  public resetZoomMode(): void {
    this.twoFingerZoomDetector.resetZoomMode();
    this.currentState.isZoomModeActive = false;
    this.currentState.thumbPos = null;
    this.currentState.zoomTapCount = 0;
    this.emitStateChangeIfMeaningful(true);
  }

  public processLandmarks(landmarks: HandLandmark[] | null, currentTime: number = performance.now()): void {
    if (!landmarks || landmarks.length < 21) {
      this.lockDetector.process(null, null, currentTime);
      const isLocked = this.lockDetector.getIsLocked();

      if (this.currentState.handDetected) {
        this.currentState = {
          ...this.currentState,
          handDetected: false,
          currentGesture: isLocked ? 'FIST_LOCKED' : 'IDLE',
          pointerPos: null,
          pinchPos: null,
          thumbPos: null,
          indexPos: null,
          wristPos: null,
          isZoomModeActive: this.twoFingerZoomDetector.getIsZoomModeActive(),
          zoomTapCount: 0,
          isLocked,
          lockCountdown: null,
          statusMessage: isLocked
            ? '🔒 Mode Terkunci • Tahan tangan terbuka 5 detik untuk membuka kembali'
            : 'Arahkan tangan ke kamera',
        };
        this.emitStateChangeIfMeaningful(true);
        if (this.onPointerUpdateCallback) {
          this.onPointerUpdateCallback({
            indexPos: null,
            thumbPos: null,
            isZoomModeActive: false,
            tapCount: 0,
            isLocked,
            lockCountdown: null,
          });
        }
      }
      this.indexSwipeDetector.reset();
      this.threeFingerScrollDetector.reset();
      this.twoFingerZoomDetector.reset();
      this.swipeDetector.reset();
      return;
    }

    const wrist = landmarks[0];
    const wristPos = { x: 1 - wrist.x, y: wrist.y };
    const indexTip = landmarks[8];

    // 1. Detect individual finger states
    const fingers = this.fingerDetector.detect(landmarks);
    const { extendedCount } = fingers;

    // 2. Lock / Unlock State Processing (5 seconds Fist = Lock, 5 seconds Open Hand = Unlock)
    const lockRes = this.lockDetector.process(landmarks, fingers, currentTime);
    this.currentState.isLocked = lockRes.isLocked;
    this.currentState.lockCountdown = lockRes.lockCountdown;

    // EVENT: Just Locked (5s fist reached)
    if (lockRes.justLocked) {
      this.twoFingerZoomDetector.resetZoomMode();
      this.indexSwipeDetector.reset();
      this.swipeDetector.reset();
      this.currentState = {
        ...this.currentState,
        handDetected: true,
        fingerStates: fingers,
        currentGesture: 'FIST_LOCKED',
        lastDetectedGesture: 'FIST_LOCKED',
        lastActionTime: currentTime,
        statusMessage: '🔒 Sistem Terkunci! Kepalan tangan 5 detik aktif. Semua titik & navigasi dimatikan.',
        wristPos,
        pointerPos: null,
        thumbPos: null,
        indexPos: null,
        isLocked: true,
        lockCountdown: null,
      };
      this.emitStateChange();
      this.triggerAction('LOCK_SYSTEM', 'FIST_LOCKED');
      if (this.onPointerUpdateCallback) {
        this.onPointerUpdateCallback({
          indexPos: null,
          thumbPos: null,
          isZoomModeActive: false,
          tapCount: 0,
          isLocked: true,
          lockCountdown: null,
        });
      }
      return;
    }

    // EVENT: Just Unlocked (5s open hand reached)
    if (lockRes.justUnlocked) {
      this.currentState = {
        ...this.currentState,
        handDetected: true,
        fingerStates: fingers,
        currentGesture: 'OPEN_HAND_UNLOCKED',
        lastDetectedGesture: 'OPEN_HAND_UNLOCKED',
        lastActionTime: currentTime,
        statusMessage: '🔓 Sistem Terbuka! Tangan terbuka 5 detik terdeteksi. Semua fungsi & titik laser aktif kembali.',
        wristPos,
        isLocked: false,
        lockCountdown: null,
      };
      this.emitStateChange();
      this.triggerAction('UNLOCK_SYSTEM', 'OPEN_HAND_UNLOCKED');
      // Continue below to normal tracking
    }

    // IF SYSTEM IS CURRENTLY LOCKED: Suppress all points, gestures, and scrolling!
    if (lockRes.isLocked) {
      let lockMsg = '🔒 Sistem Terkunci • Tahan tangan terbuka selama 5 detik untuk membuka kunci';
      if (lockRes.lockCountdown?.mode === 'UNLOCKING') {
        lockMsg = `🖐️ Membuka kunci dalam ${lockRes.lockCountdown.remainingSeconds}s... (Tahan tangan terbuka)`;
      }

      this.currentState = {
        ...this.currentState,
        handDetected: true,
        fingerStates: fingers,
        currentGesture: 'FIST_LOCKED',
        pointerPos: null,
        thumbPos: null,
        indexPos: null,
        wristPos,
        isLocked: true,
        lockCountdown: lockRes.lockCountdown,
        statusMessage: lockMsg,
      };
      this.emitStateChangeIfMeaningful(false);

      if (this.onPointerUpdateCallback) {
        this.onPointerUpdateCallback({
          indexPos: null,
          thumbPos: null,
          isZoomModeActive: false,
          tapCount: 0,
          isLocked: true,
          lockCountdown: lockRes.lockCountdown,
        });
      }
      return;
    }

    // IF COUNTDOWN TO LOCK IS IN PROGRESS (Holding fist to lock):
    // Show countdown on UI, suppress accidental slide or click gestures while fist is held!
    if (lockRes.lockCountdown?.mode === 'LOCKING') {
      this.currentState = {
        ...this.currentState,
        handDetected: true,
        fingerStates: fingers,
        currentGesture: 'IDLE',
        statusMessage: `✊ Mengunci dalam ${lockRes.lockCountdown.remainingSeconds}s... (Tahan kepalan tangan)`,
        wristPos,
        pointerPos: null,
        thumbPos: null,
        indexPos: null,
        isLocked: false,
        lockCountdown: lockRes.lockCountdown,
      };
      this.emitStateChangeIfMeaningful(false);

      if (this.onPointerUpdateCallback) {
        this.onPointerUpdateCallback({
          indexPos: null,
          thumbPos: null,
          isZoomModeActive: false,
          tapCount: 0,
          isLocked: false,
          lockCountdown: lockRes.lockCountdown,
        });
      }
      return;
    }

    // 3. Continuous 3-Tap and Zoom Detector evaluation
    const zoomRes = this.twoFingerZoomDetector.update(landmarks, true, currentTime);
    const isZoomActive = zoomRes.isZoomModeActive;

    this.currentState.isZoomModeActive = isZoomActive;
    this.currentState.zoomTapCount = zoomRes.tapCount;
    this.currentState.indexPos = zoomRes.indexPos;
    this.currentState.thumbPos = isZoomActive ? zoomRes.thumbPos : null;
    this.currentState.zoomScale = zoomRes.scale;

    // =========================================================================
    // CASE A: MODE ZOOM AKTIF (SETELAH 3X TEPUK ANTARA TELUNJUK DAN JEMPOL)
    // Titik 2 (Hijau) Muncul di Jempol, Titik 1 (Merah) di Telunjuk
    // =========================================================================
    if (isZoomActive) {
      if (this.onZoomUpdateCallback) {
        this.onZoomUpdateCallback(zoomRes.scale);
      }

      if (zoomRes.action === 'ZOOM_IN') {
        this.currentState = {
          ...this.currentState,
          handDetected: true,
          fingerStates: fingers,
          currentGesture: 'PINCH_ZOOM_IN',
          lastDetectedGesture: 'PINCH_ZOOM_IN',
          lastActionTime: currentTime,
          pinchPos: zoomRes.center,
          pointerPos: zoomRes.indexPos,
          statusMessage: `🔍 Mode Zoom: Rentangkan Jari → Perbesar (${Math.round(zoomRes.scale * 100)}%)`,
          wristPos,
        };
        this.emitStateChange();
        this.triggerAction('ZOOM_IN', 'PINCH_ZOOM_IN');
        return;
      } else if (zoomRes.action === 'ZOOM_OUT') {
        this.currentState = {
          ...this.currentState,
          handDetected: true,
          fingerStates: fingers,
          currentGesture: 'PINCH_ZOOM_OUT',
          lastDetectedGesture: 'PINCH_ZOOM_OUT',
          lastActionTime: currentTime,
          pinchPos: zoomRes.center,
          pointerPos: zoomRes.indexPos,
          statusMessage: `🔍 Mode Zoom: Rapatkan Jari → Perkecil (${Math.round(zoomRes.scale * 100)}%)`,
          wristPos,
        };
        this.emitStateChange();
        this.triggerAction('ZOOM_OUT', 'PINCH_ZOOM_OUT');
        return;
      }

      // Tracking state in zoom mode
      this.currentState = {
        ...this.currentState,
        handDetected: true,
        fingerStates: fingers,
        currentGesture: 'IDLE',
        pinchPos: zoomRes.center,
        pointerPos: zoomRes.indexPos,
        statusMessage: `🟢 Mode Zoom Aktif (${Math.round(zoomRes.scale * 100)}%) • Rentangkan/Rapatkan Jari`,
        wristPos,
      };
      this.emitStateChangeIfMeaningful(false);
      if (this.onPointerUpdateCallback) {
        this.onPointerUpdateCallback({
          indexPos: zoomRes.indexPos,
          thumbPos: zoomRes.thumbPos,
          isZoomModeActive: true,
          tapCount: zoomRes.tapCount,
          isLocked: false,
          lockCountdown: null,
        });
      }
      return;
    }

    // =========================================================================
    // CASE B: NORMAL NAVIGATION (1 TITIK MERAH DI TELUNJUK)
    // Belum 3x tepuk: Jempol TIDAK menampilkan titik hijau
    // 1 Jari Telunjuk: Usap Kiri/Kanan, Usap Atas/Bawah, Pointer
    // =========================================================================

    // Update laser pointer position (Titik 1 Merah)
    if (this.onPointerUpdateCallback) {
      this.onPointerUpdateCallback({
        indexPos: zoomRes.indexPos,
        thumbPos: null,
        isZoomModeActive: false,
        tapCount: zoomRes.tapCount,
        isLocked: false,
        lockCountdown: null,
      });
    }

    // Process Index swipes and vertical scrolling
    const indexResult = this.indexSwipeDetector.update(indexTip, true, currentTime);

    // Continuous scroll callback
    if (this.onScrollUpdateCallback && Math.abs(indexResult.scrollDeltaY) > 0.4) {
      this.onScrollUpdateCallback(indexResult.scrollDeltaY);
    }

    // Action 1: Next Slide (Usap Kanan)
    if (indexResult.action === 'NEXT_SLIDE') {
      this.currentState = {
        ...this.currentState,
        handDetected: true,
        fingerStates: fingers,
        currentGesture: 'INDEX_SWIPE_RIGHT',
        lastDetectedGesture: 'INDEX_SWIPE_RIGHT',
        lastActionTime: currentTime,
        statusMessage: '👉 Usap Kanan: Slide Berikutnya',
        wristPos,
        pointerPos: zoomRes.indexPos,
      };
      this.emitStateChange();
      this.triggerAction('NEXT_SLIDE', 'INDEX_SWIPE_RIGHT');
      return;
    }

    // Action 2: Prev Slide (Usap Kiri)
    if (indexResult.action === 'PREV_SLIDE') {
      this.currentState = {
        ...this.currentState,
        handDetected: true,
        fingerStates: fingers,
        currentGesture: 'INDEX_SWIPE_LEFT',
        lastDetectedGesture: 'INDEX_SWIPE_LEFT',
        lastActionTime: currentTime,
        statusMessage: '👈 Usap Kiri: Slide Sebelumnya',
        wristPos,
        pointerPos: zoomRes.indexPos,
      };
      this.emitStateChange();
      this.triggerAction('PREV_SLIDE', 'INDEX_SWIPE_LEFT');
      return;
    }

    // Action 3: Scroll Up (Usap Atas)
    if (indexResult.action === 'SCROLL_UP') {
      this.currentState = {
        ...this.currentState,
        handDetected: true,
        fingerStates: fingers,
        currentGesture: 'INDEX_SCROLL_UP',
        lastDetectedGesture: 'INDEX_SCROLL_UP',
        lastActionTime: currentTime,
        statusMessage: '🔼 Usap Atas: Scroll Ke Atas',
        wristPos,
        pointerPos: zoomRes.indexPos,
      };
      this.emitStateChange();
      this.triggerAction('SCROLL_UP', 'INDEX_SCROLL_UP');
      return;
    }

    // Action 4: Scroll Down (Usap Bawah)
    if (indexResult.action === 'SCROLL_DOWN') {
      this.currentState = {
        ...this.currentState,
        handDetected: true,
        fingerStates: fingers,
        currentGesture: 'INDEX_SCROLL_DOWN',
        lastDetectedGesture: 'INDEX_SCROLL_DOWN',
        lastActionTime: currentTime,
        statusMessage: '🔽 Usap Bawah: Scroll Ke Bawah',
        wristPos,
        pointerPos: zoomRes.indexPos,
      };
      this.emitStateChange();
      this.triggerAction('SCROLL_DOWN', 'INDEX_SCROLL_DOWN');
      return;
    }

    // Action 5: Open Palm -> Toggle Controls Menu
    const isOpenPalm = extendedCount >= 4;
    if (isOpenPalm) {
      const isPalmTriggered = this.palmDetector.detect(landmarks, currentTime);
      if (isPalmTriggered) {
        this.currentState = {
          ...this.currentState,
          handDetected: true,
          fingerStates: fingers,
          currentGesture: 'OPEN_PALM',
          lastDetectedGesture: 'OPEN_PALM',
          lastActionTime: currentTime,
          statusMessage: '✋ Telapak Tangan: Buka/Tutup Menu Kontrol',
          wristPos,
          pointerPos: null,
        };
        this.emitStateChange();
        this.triggerAction('TOGGLE_CONTROLS', 'OPEN_PALM');
        return;
      }
    }

    // Action 6: Whole hand swipe fallback
    const generalSwipe = this.swipeDetector.update(landmarks, currentTime);
    if (generalSwipe === 'SWIPE_RIGHT') {
      this.currentState = {
        ...this.currentState,
        handDetected: true,
        fingerStates: fingers,
        currentGesture: 'SWIPE_RIGHT',
        lastDetectedGesture: 'SWIPE_RIGHT',
        lastActionTime: currentTime,
        statusMessage: '👉 Usap Kanan: Slide Berikutnya',
        wristPos,
      };
      this.emitStateChange();
      this.triggerAction('NEXT_SLIDE', 'SWIPE_RIGHT');
      return;
    } else if (generalSwipe === 'SWIPE_LEFT') {
      this.currentState = {
        ...this.currentState,
        handDetected: true,
        fingerStates: fingers,
        currentGesture: 'SWIPE_LEFT',
        lastDetectedGesture: 'SWIPE_LEFT',
        lastActionTime: currentTime,
        statusMessage: '👈 Usap Kiri: Slide Sebelumnya',
        wristPos,
      };
      this.emitStateChange();
      this.triggerAction('PREV_SLIDE', 'SWIPE_LEFT');
      return;
    }

    // Default 1-Index state (with tap prompt if user started tapping)
    let statusText = '☝️ 1 Telunjuk (🔴): Usap Kiri/Kanan, Usap Atas/Bawah';
    if (zoomRes.tapCount > 0) {
      statusText = `👆 Tepuk Jempol & Telunjuk: ${zoomRes.tapCount}/3 untuk aktifkan Mode Zoom`;
    }

    this.currentState = {
      ...this.currentState,
      handDetected: true,
      fingerStates: fingers,
      currentGesture: 'INDEX_POINTER',
      pointerPos: zoomRes.indexPos,
      statusMessage: statusText,
      wristPos,
    };
    this.emitStateChangeIfMeaningful(false);
  }

  private triggerAction(action: GestureAction, gesture: GestureType): void {
    if (this.onActionCallback) {
      this.onActionCallback(action, gesture);
    }
  }

  public emitStateChangeIfMeaningful(force: boolean = false): void {
    const now = performance.now();
    const gestureChanged = this.currentState.currentGesture !== this.lastEmittedGesture;
    const zoomChanged = this.currentState.isZoomModeActive !== this.lastEmittedZoomMode;
    const tapChanged = this.currentState.zoomTapCount !== this.lastEmittedTapCount;
    const handChanged = this.currentState.handDetected !== this.lastEmittedHandDetected;
    const lockChanged = this.currentState.isLocked !== this.lastEmittedLocked;
    const hasActiveCountdown = !!this.currentState.lockCountdown;
    const isInterval = now - this.lastEmittedStateTime > (hasActiveCountdown ? 80 : 160);

    if (force || gestureChanged || zoomChanged || tapChanged || handChanged || lockChanged || hasActiveCountdown || isInterval) {
      this.lastEmittedStateTime = now;
      this.lastEmittedGesture = this.currentState.currentGesture;
      this.lastEmittedZoomMode = !!this.currentState.isZoomModeActive;
      this.lastEmittedTapCount = this.currentState.zoomTapCount || 0;
      this.lastEmittedHandDetected = this.currentState.handDetected;
      this.lastEmittedLocked = !!this.currentState.isLocked;
      this.emitStateChange();
    }
  }

  private emitStateChange(): void {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback({ ...this.currentState });
    }
  }

  public getState(): GestureState {
    return { ...this.currentState };
  }
}
