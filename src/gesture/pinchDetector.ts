import { HandLandmark } from '../types';

export interface PinchResult {
  isPinching: boolean;
  x: number;
  y: number;
  distance: number;
}

export class PinchDetector {
  private pinchThreshold: number = 0.06; // Normalized distance
  private wasPinching: boolean = false;

  public detect(landmarks: HandLandmark[] | null): PinchResult {
    if (!landmarks || landmarks.length < 21) {
      this.wasPinching = false;
      return { isPinching: false, x: 0.5, y: 0.5, distance: 1.0 };
    }

    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];

    const dx = thumbTip.x - indexTip.x;
    const dy = thumbTip.y - indexTip.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const isPinching = distance < this.pinchThreshold;
    const centerX = 1 - (thumbTip.x + indexTip.x) / 2;
    const centerY = (thumbTip.y + indexTip.y) / 2;

    this.wasPinching = isPinching;

    return {
      isPinching,
      x: centerX,
      y: centerY,
      distance,
    };
  }
}
