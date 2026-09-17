import { HandLandmark, GestureType } from '../types';
import { soundEffects } from '../utils/audioEffects';

export interface ZoomResult {
  gesture: GestureType;
  action: 'ZOOM_IN' | 'ZOOM_OUT' | null;
  distance: number;
  center: { x: number; y: number };
  scale: number; // Current continuous scale 0.7 to 2.5
  scaleDelta: number; // Instant delta for smooth zoom binding
  isZoomModeActive: boolean;
  tapCount: number;
  thumbPos: { x: number; y: number } | null;
  indexPos: { x: number; y: number } | null;
}

interface DistanceSample {
  dist: number;
  time: number;
}

export class TwoFingerZoomDetector {
  private currentScale: number = 1.0;
  private smoothedDistance: number = 0;
  private history: DistanceSample[] = [];
  private lastTriggerTime: number = 0;
  private cooldownMs: number = 320; // Smooth discrete action interval
  private minActionDelta: number = 0.018; // Distinct expansion/pinch threshold
  private prevDistance: number = 0;

  // 3-TAP DETECTION STATE (Telunjuk + Jempol)
  private isZoomModeActive: boolean = false;
  private tapCount: number = 0;
  private lastTapTime: number = 0;
  private isCurrentlyTouching: boolean = false;
  private lastModeSwitchTime: number = 0;

  public reset() {
    this.smoothedDistance = 0;
    this.history = [];
    this.prevDistance = 0;
    this.isCurrentlyTouching = false;
  }

  public resetZoomMode() {
    this.isZoomModeActive = false;
    this.tapCount = 0;
    this.reset();
  }

  public setZoomMode(active: boolean) {
    this.isZoomModeActive = active;
    if (!active) {
      this.tapCount = 0;
    }
  }

  public getIsZoomModeActive(): boolean {
    return this.isZoomModeActive;
  }

  public getTapCount(): number {
    return this.tapCount;
  }

  public setScale(scale: number) {
    this.currentScale = Math.max(0.7, Math.min(2.5, scale));
  }

  public getScale(): number {
    return this.currentScale;
  }

  /**
   * Evaluates 3-tap between index and thumb:
   * - 3 kali tepuk -> Aktifkan titik ke-2 warna hijau di jempol & mode zoom
   * - Rentangkan -> Zoom In
   * - Rapatkan -> Zoom Out
   */
  public update(
    landmarks: HandLandmark[] | null,
    isTwoFingersActive: boolean,
    currentTime: number = performance.now()
  ): ZoomResult {
    if (!landmarks || landmarks.length < 21) {
      this.reset();
      return {
        gesture: 'IDLE',
        action: null,
        distance: 0,
        center: { x: 0.5, y: 0.5 },
        scale: this.currentScale,
        scaleDelta: 0,
        isZoomModeActive: this.isZoomModeActive,
        tapCount: this.tapCount,
        thumbPos: null,
        indexPos: null,
      };
    }

    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];

    // Normalized mirrored coordinates (1 - x)
    const indexUserX = 1 - indexTip.x;
    const indexUserY = indexTip.y;
    const thumbUserX = 1 - thumbTip.x;
    const thumbUserY = thumbTip.y;

    const dx = thumbTip.x - indexTip.x;
    const dy = thumbTip.y - indexTip.y;
    const rawDistance = Math.hypot(dx, dy);

    // Exponential moving average filter
    if (this.smoothedDistance === 0) {
      this.smoothedDistance = rawDistance;
      this.prevDistance = rawDistance;
    } else {
      this.smoothedDistance = this.smoothedDistance * 0.65 + rawDistance * 0.35;
    }

    const centerX = (thumbUserX + indexUserX) / 2;
    const centerY = (thumbUserY + indexUserY) / 2;

    // =========================================================================
    // 3-TAP DETECTION (TEPUK ANTARA JEMPOL & TELUNJUK)
    // =========================================================================
    const contactThreshold = 0.058;
    const releaseThreshold = 0.082;

    // Reset tap count if pause between taps > 2200ms
    if (this.tapCount > 0 && currentTime - this.lastTapTime > 2200) {
      this.tapCount = 0;
    }

    if (!this.isCurrentlyTouching && rawDistance <= contactThreshold) {
      this.isCurrentlyTouching = true;
      const timeSinceLastTap = currentTime - this.lastTapTime;

      // Debounce flutter (at least 90ms between contacts)
      if (timeSinceLastTap > 90) {
        this.tapCount = (this.tapCount % 3) + 1;
        this.lastTapTime = currentTime;
        soundEffects.playTapTick(this.tapCount);

        // Check if 3 Taps achieved
        if (this.tapCount === 3) {
          if (currentTime - this.lastModeSwitchTime > 500) {
            this.isZoomModeActive = !this.isZoomModeActive;
            this.lastModeSwitchTime = currentTime;

            if (this.isZoomModeActive) {
              soundEffects.playZoomActivated();
            }
          }
          this.tapCount = 0;
        }
      }
    } else if (this.isCurrentlyTouching && rawDistance >= releaseThreshold) {
      this.isCurrentlyTouching = false;
    }

    const result: ZoomResult = {
      gesture: 'IDLE',
      action: null,
      distance: this.smoothedDistance,
      center: { x: centerX, y: centerY },
      scale: +(this.currentScale.toFixed(2)),
      scaleDelta: 0,
      isZoomModeActive: this.isZoomModeActive,
      tapCount: this.tapCount,
      thumbPos: this.isZoomModeActive ? { x: thumbUserX, y: thumbUserY } : null,
      indexPos: { x: indexUserX, y: indexUserY },
    };

    // If Zoom Mode is not active yet, do not trigger zoom actions
    if (!this.isZoomModeActive) {
      this.history = [];
      this.prevDistance = this.smoothedDistance;
      return result;
    }

    // =========================================================================
    // ZOOM MODE IS ACTIVE:
    // Evaluates finger spreading (Zoom In) or contracting (Zoom Out)
    // =========================================================================
    this.history.push({ dist: this.smoothedDistance, time: currentTime });
    if (this.history.length > 12) {
      this.history.shift();
    }

    const instantDelta = this.smoothedDistance - this.prevDistance;
    this.prevDistance = this.smoothedDistance;

    let scaleDelta = 0;
    if (Math.abs(instantDelta) > 0.0022) {
      scaleDelta = instantDelta * 2.0;
      this.currentScale = Math.max(0.7, Math.min(2.5, this.currentScale + scaleDelta));
      result.scale = +(this.currentScale.toFixed(2));
      result.scaleDelta = scaleDelta;
    }

    // Discrete action evaluation
    if (currentTime - this.lastTriggerTime < this.cooldownMs) {
      return result;
    }

    const windowPoints = this.history.filter((h) => currentTime - h.time <= 260);
    if (windowPoints.length < 3) {
      return result;
    }

    const oldest = windowPoints[0];
    const newest = windowPoints[windowPoints.length - 1];
    const netDelta = newest.dist - oldest.dist;

    if (netDelta > this.minActionDelta) {
      result.gesture = 'PINCH_ZOOM_IN';
      result.action = 'ZOOM_IN';
      this.currentScale = Math.min(2.5, +(this.currentScale + 0.14).toFixed(2));
      result.scale = this.currentScale;
      this.lastTriggerTime = currentTime;
      this.history = [];
    } else if (netDelta < -this.minActionDelta) {
      result.gesture = 'PINCH_ZOOM_OUT';
      result.action = 'ZOOM_OUT';
      this.currentScale = Math.max(0.7, +(this.currentScale - 0.14).toFixed(2));
      result.scale = this.currentScale;
      this.lastTriggerTime = currentTime;
      this.history = [];
    }

    return result;
  }
}

