import { HandLandmark, GestureType } from '../types';

interface PointRecord {
  x: number;
  y: number;
  time: number;
}

export class SwipeDetector {
  private history: PointRecord[] = [];
  private maxHistory: number = 12; // 8 - 15 positions as requested
  private lastTriggerTime: number = 0;
  private cooldownMs: number = 950;
  private threshold: number = 0.14; // Normalized screen distance (0.10 - 0.22)
  private minVelocity: number = 0.28; // Normalized distance per second

  public setConfig(threshold: number, cooldownMs: number) {
    this.threshold = threshold;
    this.cooldownMs = cooldownMs;
  }

  public reset() {
    this.history = [];
  }

  public update(landmarks: HandLandmark[] | null, currentTime: number = performance.now()): GestureType {
    if (!landmarks || landmarks.length < 21) {
      if (this.history.length > 0) {
        this.history = [];
      }
      return 'IDLE';
    }

    // Cooldown check
    if (currentTime - this.lastTriggerTime < this.cooldownMs) {
      return 'IDLE';
    }

    // Calculate palm center: average of wrist (0), MCPs (5, 9, 13, 17)
    // IMPORTANT: Mirror X (1 - rawX) so user hand moving to their right yields positive deltaX
    const rawX = (landmarks[0].x + landmarks[5].x + landmarks[9].x + landmarks[13].x + landmarks[17].x) / 5;
    const rawY = (landmarks[0].y + landmarks[5].y + landmarks[9].y + landmarks[13].y + landmarks[17].y) / 5;
    const userX = 1 - rawX;
    const userY = rawY;

    // Add to history
    this.history.push({ x: userX, y: userY, time: currentTime });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    if (this.history.length < 5) {
      return 'IDLE';
    }

    // Prune history older than 500ms
    const recent = this.history.filter((p) => currentTime - p.time <= 480);
    if (recent.length < 4) {
      return 'IDLE';
    }

    const first = recent[0];
    const last = recent[recent.length - 1];
    const deltaTime = (last.time - first.time) / 1000; // in seconds

    if (deltaTime < 0.08 || deltaTime > 0.55) {
      return 'IDLE';
    }

    const deltaX = last.x - first.x;
    const deltaY = last.y - first.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Ensure horizontal motion is dominant over vertical motion (not waving up/down)
    if (absDeltaX < this.threshold || absDeltaX < absDeltaY * 1.35) {
      return 'IDLE';
    }

    // Calculate velocity
    const velocity = absDeltaX / deltaTime;
    if (velocity < this.minVelocity) {
      return 'IDLE';
    }

    // Check direction consistency across the path (monotonic tendency)
    let consistentSteps = 0;
    for (let i = 1; i < recent.length; i++) {
      const step = recent[i].x - recent[i - 1].x;
      if (deltaX > 0 && step >= -0.02) consistentSteps++;
      if (deltaX < 0 && step <= 0.02) consistentSteps++;
    }

    const consistencyRatio = consistentSteps / (recent.length - 1);
    if (consistencyRatio < 0.65) {
      return 'IDLE';
    }

    // Trigger gesture
    this.lastTriggerTime = currentTime;
    this.history = []; // clear after detection to prevent double triggers

    if (deltaX > 0) {
      return 'SWIPE_RIGHT';
    } else {
      return 'SWIPE_LEFT';
    }
  }
}
