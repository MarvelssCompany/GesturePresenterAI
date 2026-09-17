import { HandLandmark, GestureType } from '../types';

interface PointRecord {
  x: number;
  y: number;
  time: number;
}

export interface IndexGestureResult {
  gesture: GestureType;
  action: 'NEXT_SLIDE' | 'PREV_SLIDE' | 'SCROLL_UP' | 'SCROLL_DOWN' | null;
  scrollDeltaY: number; // Continuous scroll offset for real-time scrolling
  isPointing: boolean;
  position: { x: number; y: number };
}

export class IndexSwipeDetector {
  private history: PointRecord[] = [];
  private maxHistory: number = 24;
  private lastTriggerTime: number = 0;
  private cooldownMs: number = 420; // Responsive cooldown
  private swipeDistanceThreshold: number = 0.07; // Normalized screen distance for swipe
  private scrollThreshold: number = 0.055; // Normalized screen distance for vertical flick
  private prevUserY: number | null = null;

  public setConfig(threshold: number, cooldownMs: number) {
    this.swipeDistanceThreshold = Math.max(0.05, threshold);
    this.scrollThreshold = Math.max(0.045, threshold * 0.85);
    this.cooldownMs = Math.max(300, cooldownMs);
  }

  public reset() {
    this.history = [];
    this.prevUserY = null;
  }

  /**
   * Evaluates 1 Index Finger movements:
   * - Usap Kanan: Next Slide
   * - Usap Kiri: Previous Slide
   * - Usap Atas: Scroll Up
   * - Usap Bawah: Scroll Down
   * - Diam/Arahkan: Laser Pointer
   */
  public update(
    indexTip: HandLandmark | null,
    isIndexActive: boolean,
    currentTime: number = performance.now()
  ): IndexGestureResult {
    if (!indexTip || !isIndexActive) {
      this.history = [];
      this.prevUserY = null;
      return {
        gesture: 'IDLE',
        action: null,
        scrollDeltaY: 0,
        isPointing: false,
        position: { x: 0.5, y: 0.5 },
      };
    }

    // Mirror X (1 - indexTip.x) so user moving hand to the right produces positive deltaX
    const userX = 1 - indexTip.x;
    const userY = indexTip.y;

    // Calculate continuous vertical delta for smooth real-time scrolling
    let continuousScrollDelta = 0;
    if (this.prevUserY !== null) {
      const frameDeltaY = userY - this.prevUserY;
      // Filter micro-jitters
      if (Math.abs(frameDeltaY) > 0.002) {
        continuousScrollDelta = frameDeltaY * 420;
      }
    }
    this.prevUserY = userY;

    this.history.push({ x: userX, y: userY, time: currentTime });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Default result
    const result: IndexGestureResult = {
      gesture: 'IDLE',
      action: null,
      scrollDeltaY: continuousScrollDelta,
      isPointing: true,
      position: { x: userX, y: userY },
    };

    // Check cooldown for discrete swipe/flick gestures
    if (currentTime - this.lastTriggerTime < this.cooldownMs) {
      return result;
    }

    if (this.history.length < 3) {
      return result;
    }

    // Find reference points in history between 50ms and 600ms ago
    const candidates = this.history.filter((p) => {
      const dt = currentTime - p.time;
      return dt >= 50 && dt <= 600;
    });

    if (candidates.length === 0) {
      return result;
    }

    // Check displacement from candidates in that window
    let bestDx = 0;
    let bestDy = 0;
    let maxDist = 0;

    for (const p of candidates) {
      const dx = userX - p.x;
      const dy = userY - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist > maxDist) {
        maxDist = dist;
        bestDx = dx;
        bestDy = dy;
      }
    }

    const absDx = Math.abs(bestDx);
    const absDy = Math.abs(bestDy);

    // =========================================================================
    // 1. HORIZONTAL SWIPE (Usap Kiri & Kanan -> Ganti Slide)
    // =========================================================================
    if (absDx >= 0.058 && absDx > absDy * 0.88) {
      this.lastTriggerTime = currentTime;
      this.history = [];
      this.prevUserY = null;

      if (bestDx > 0) {
        // Moved right
        result.gesture = 'INDEX_SWIPE_RIGHT';
        result.action = 'NEXT_SLIDE';
      } else {
        // Moved left
        result.gesture = 'INDEX_SWIPE_LEFT';
        result.action = 'PREV_SLIDE';
      }
      return result;
    }

    // =========================================================================
    // 2. VERTICAL SWIPE / FLICK (Usap Atas & Bawah -> Scroll Dokumen)
    // =========================================================================
    if (absDy >= 0.050 && absDy > absDx * 0.88) {
      this.lastTriggerTime = currentTime;
      this.history = [];
      this.prevUserY = null;

      if (bestDy < 0) {
        // Moved UP -> Scroll Up
        result.gesture = 'INDEX_SCROLL_UP';
        result.action = 'SCROLL_UP';
      } else {
        // Moved DOWN -> Scroll Down
        result.gesture = 'INDEX_SCROLL_DOWN';
        result.action = 'SCROLL_DOWN';
      }
      return result;
    }

    return result;
  }
}
