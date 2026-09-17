import { HandLandmark } from '../types';

export interface PointerResult {
  isPointing: boolean;
  x: number; // 0 - 1 normalized screen coordinate
  y: number; // 0 - 1 normalized screen coordinate
}

export class PointerDetector {
  private smoothedX: number = 0.5;
  private smoothedY: number = 0.5;
  private smoothingAlpha: number = 0.35; // Responsive yet smooth
  private isPointingActive: boolean = false;

  public setSmoothing(alpha: number) {
    this.smoothingAlpha = Math.max(0.1, Math.min(0.8, alpha));
  }

  public detect(landmarks: HandLandmark[] | null): PointerResult {
    if (!landmarks || landmarks.length < 21) {
      this.isPointingActive = false;
      return { isPointing: false, x: this.smoothedX, y: this.smoothedY };
    }

    const wrist = landmarks[0];
    const indexTip = landmarks[8];
    const indexPip = landmarks[6];
    const indexMcp = landmarks[5];

    const middleTip = landmarks[12];
    const middlePip = landmarks[10];

    const ringTip = landmarks[16];
    const ringPip = landmarks[14];

    const pinkyTip = landmarks[20];
    const pinkyPip = landmarks[18];

    // Distance function
    const distSq = (p1: HandLandmark, p2: HandLandmark) =>
      (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;

    const indexExtended = distSq(indexTip, wrist) > distSq(indexPip, wrist) * 1.25;
    const middleFolded = distSq(middleTip, wrist) < distSq(indexTip, wrist) * 0.75;
    const ringFolded = distSq(ringTip, wrist) < distSq(indexTip, wrist) * 0.75;
    const pinkyFolded = distSq(pinkyTip, wrist) < distSq(indexTip, wrist) * 0.75;

    // Index is pointing if index is prominently extended and other fingers are relatively curled
    const isPointing = indexExtended && (middleFolded || (ringFolded && pinkyFolded));

    this.isPointingActive = isPointing;

    if (isPointing) {
      // Mirrored X so pointing left on camera points left on screen
      const rawUserX = 1 - indexTip.x;
      const rawUserY = indexTip.y;

      // Mild edge amplification so reaching slide edges doesn't require stretching arm outside camera FOV
      const margin = 0.15;
      const clampedX = Math.max(0, Math.min(1, (rawUserX - margin) / (1 - 2 * margin)));
      const clampedY = Math.max(0, Math.min(1, (rawUserY - margin) / (1 - 2 * margin)));

      // Smoothing
      this.smoothedX += (clampedX - this.smoothedX) * this.smoothingAlpha;
      this.smoothedY += (clampedY - this.smoothedY) * this.smoothingAlpha;
    }

    return {
      isPointing,
      x: this.smoothedX,
      y: this.smoothedY,
    };
  }
}
