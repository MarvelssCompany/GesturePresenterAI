import { HandLandmark } from '../types';

export class PalmDetector {
  private lastTriggerTime: number = 0;
  private cooldownMs: number = 1100;
  private consecutiveFrames: number = 0;
  private requiredFrames: number = 4;

  public detect(landmarks: HandLandmark[] | null, currentTime: number = performance.now()): boolean {
    if (!landmarks || landmarks.length < 21) {
      this.consecutiveFrames = 0;
      return false;
    }

    if (currentTime - this.lastTriggerTime < this.cooldownMs) {
      return false;
    }

    const wrist = landmarks[0];

    // Check all 5 fingers extended relative to their PIP joints
    const thumbExtended = this.dist(landmarks[4], wrist) > this.dist(landmarks[2], wrist) * 1.15;
    const indexExtended = this.dist(landmarks[8], wrist) > this.dist(landmarks[6], wrist) * 1.2;
    const middleExtended = this.dist(landmarks[12], wrist) > this.dist(landmarks[10], wrist) * 1.2;
    const ringExtended = this.dist(landmarks[16], wrist) > this.dist(landmarks[14], wrist) * 1.2;
    const pinkyExtended = this.dist(landmarks[20], wrist) > this.dist(landmarks[18], wrist) * 1.2;

    const allFiveExtended =
      thumbExtended && indexExtended && middleExtended && ringExtended && pinkyExtended;

    // Check spread (fingertips are reasonably spaced)
    const spread1 = this.dist(landmarks[4], landmarks[8]);
    const spread2 = this.dist(landmarks[8], landmarks[12]);
    const spread3 = this.dist(landmarks[12], landmarks[16]);
    const spread4 = this.dist(landmarks[16], landmarks[20]);
    const isSpread = spread1 > 0.08 && spread2 > 0.03 && spread3 > 0.03 && spread4 > 0.03;

    if (allFiveExtended && isSpread) {
      this.consecutiveFrames++;
      if (this.consecutiveFrames >= this.requiredFrames) {
        this.lastTriggerTime = currentTime;
        this.consecutiveFrames = 0;
        return true;
      }
    } else {
      this.consecutiveFrames = 0;
    }

    return false;
  }

  private dist(p1: HandLandmark, p2: HandLandmark): number {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  }
}
