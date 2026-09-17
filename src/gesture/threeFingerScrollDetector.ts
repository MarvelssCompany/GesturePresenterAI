import { HandLandmark, GestureType } from '../types';

export interface ScrollResult {
  gesture: GestureType;
  action: 'SCROLL_UP' | 'SCROLL_DOWN' | null;
  deltaY: number; // Continuous delta in pixels or normalized units
  avgY: number;
}

export class ThreeFingerScrollDetector {
  private prevAvgY: number | null = null;
  private smoothedDeltaY: number = 0;
  private lastTriggerTime: number = 0;
  private cooldownMs: number = 180; // High frequency for smooth scrolling
  private triggerThreshold: number = 0.012; // Sensitive vertical movement threshold

  public reset() {
    this.prevAvgY = null;
    this.smoothedDeltaY = 0;
  }

  /**
   * Detects 3-finger scroll (atas / bawah).
   */
  public update(
    landmarks: HandLandmark[] | null,
    isThreeFingersActive: boolean,
    currentTime: number = performance.now()
  ): ScrollResult {
    if (!landmarks || landmarks.length < 21 || !isThreeFingersActive) {
      this.prevAvgY = null;
      this.smoothedDeltaY = 0;
      return {
        gesture: 'IDLE',
        action: null,
        deltaY: 0,
        avgY: 0.5,
      };
    }

    // Measure average Y of the 3 primary fingers (Index 8, Middle 12, Ring 16)
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];

    const avgY = (indexTip.y + middleTip.y + ringTip.y) / 3;

    if (this.prevAvgY === null) {
      this.prevAvgY = avgY;
      return {
        gesture: 'IDLE',
        action: null,
        deltaY: 0,
        avgY,
      };
    }

    // Delta Y: if avgY decreases, hand is moving UP. If avgY increases, hand is moving DOWN.
    const rawDeltaY = avgY - this.prevAvgY;
    this.smoothedDeltaY += (rawDeltaY - this.smoothedDeltaY) * 0.5;
    this.prevAvgY = avgY;

    let action: 'SCROLL_UP' | 'SCROLL_DOWN' | null = null;
    let gesture: GestureType = 'IDLE';

    // Invert or match natural scroll:
    // When hand moves UP (avgY decreases, rawDeltaY < -threshold) -> scroll content UP (or view down)
    // Here: Hand UP -> SCROLL_UP. Hand DOWN -> SCROLL_DOWN.
    if (currentTime - this.lastTriggerTime > this.cooldownMs) {
      if (this.smoothedDeltaY < -this.triggerThreshold) {
        action = 'SCROLL_UP';
        gesture = 'THREE_FINGER_SCROLL_UP';
        this.lastTriggerTime = currentTime;
      } else if (this.smoothedDeltaY > this.triggerThreshold) {
        action = 'SCROLL_DOWN';
        gesture = 'THREE_FINGER_SCROLL_DOWN';
        this.lastTriggerTime = currentTime;
      }
    }

    return {
      gesture,
      action,
      deltaY: this.smoothedDeltaY * 800, // scaled for pixel scroll
      avgY,
    };
  }
}
