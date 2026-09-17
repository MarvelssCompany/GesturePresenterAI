import { HandLandmark, FingerStates, LockCountdownInfo } from '../types';
import { soundEffects } from '../utils/audioEffects';

export interface LockProcessResult {
  isLocked: boolean;
  justLocked: boolean;
  justUnlocked: boolean;
  lockCountdown: LockCountdownInfo | null;
}

export class LockStateDetector {
  private isLocked: boolean = false;
  private holdDurationMs: number = 3000; // 3 seconds per user specification
  private gracePeriodMs: number = 380; // Grace period for brief landmark flickers

  private fistStartTime: number | null = null;
  private lastSeenFistTime: number = 0;

  private openStartTime: number | null = null;
  private lastSeenOpenTime: number = 0;

  private lastCountdownSecond: number = -1;

  public getIsLocked(): boolean {
    return this.isLocked;
  }

  public setLocked(locked: boolean): void {
    if (this.isLocked !== locked) {
      this.isLocked = locked;
      this.resetTimers();
      if (locked) {
        soundEffects.playLock();
      } else {
        soundEffects.playUnlock();
      }
    }
  }

  public resetTimers(): void {
    this.fistStartTime = null;
    this.openStartTime = null;
    this.lastSeenFistTime = 0;
    this.lastSeenOpenTime = 0;
    this.lastCountdownSecond = -1;
  }

  /**
   * Evaluates if hand matches a closed fist (tangan dikepal / ditutup).
   * Strict criteria to avoid false triggers during pointing, swiping, or casual talking.
   */
  public isFist(landmarks: HandLandmark[] | null, fingerStates: FingerStates | null): boolean {
    if (!landmarks || landmarks.length < 21 || !fingerStates) return false;

    // RULE 1: If index finger is extended, this is NEVER a fist (user is pointing/navigating)
    if (fingerStates.index) return false;

    // RULE 2: If more than 1 finger is extended, this is NOT a fist
    if (fingerStates.extendedCount > 1) return false;

    // RULE 3: Middle, ring, and pinky MUST NOT be extended
    if (fingerStates.middle || fingerStates.ring || fingerStates.pinky) return false;

    const wrist = landmarks[0];
    const dist = (p1: HandLandmark, p2: HandLandmark) =>
      Math.hypot(p1.x - p2.x, p1.y - p2.y);

    // Anatomical check: All 4 fingertips (8, 12, 16, 20) must be curled close to the palm/wrist
    // Distance from tip to wrist must be less than or equal to PIP joint to wrist
    const indexCurled = dist(landmarks[8], wrist) <= dist(landmarks[6], wrist) * 1.02;
    const middleCurled = dist(landmarks[12], wrist) <= dist(landmarks[10], wrist) * 1.02;
    const ringCurled = dist(landmarks[16], wrist) <= dist(landmarks[14], wrist) * 1.02;
    const pinkyCurled = dist(landmarks[20], wrist) <= dist(landmarks[18], wrist) * 1.02;

    // In a true fist, all 4 main fingers are tightly folded into the palm
    return indexCurled && middleCurled && ringCurled && pinkyCurled;
  }

  /**
   * Evaluates if hand matches an open hand (tangan dibuka).
   * Strict criteria: all 4 fingers (index, middle, ring, pinky) must be extended away from wrist.
   */
  public isOpenHand(landmarks: HandLandmark[] | null, fingerStates: FingerStates | null): boolean {
    if (!landmarks || landmarks.length < 21 || !fingerStates) return false;

    // If 2 or fewer fingers extended, definitely not open palm
    if (fingerStates.extendedCount < 4) return false;

    const wrist = landmarks[0];
    const dist = (p1: HandLandmark, p2: HandLandmark) =>
      Math.hypot(p1.x - p2.x, p1.y - p2.y);

    // All main 4 fingers must be extended well past their PIP joints
    const indexExtended = dist(landmarks[8], wrist) > dist(landmarks[6], wrist) * 1.15;
    const middleExtended = dist(landmarks[12], wrist) > dist(landmarks[10], wrist) * 1.15;
    const ringExtended = dist(landmarks[16], wrist) > dist(landmarks[14], wrist) * 1.15;
    const pinkyExtended = dist(landmarks[20], wrist) > dist(landmarks[18], wrist) * 1.15;

    const extendedCount =
      (indexExtended ? 1 : 0) +
      (middleExtended ? 1 : 0) +
      (ringExtended ? 1 : 0) +
      (pinkyExtended ? 1 : 0);

    return extendedCount >= 4 && fingerStates.index && fingerStates.middle && fingerStates.ring && fingerStates.pinky;
  }

  /**
   * Core processing loop executed on each hand landmark frame.
   */
  public process(
    landmarks: HandLandmark[] | null,
    fingerStates: FingerStates | null,
    currentTime: number = performance.now()
  ): LockProcessResult {
    // If no hand detected, grace period handles brief loss
    if (!landmarks || landmarks.length < 21 || !fingerStates) {
      if (this.fistStartTime && currentTime - this.lastSeenFistTime > this.gracePeriodMs) {
        this.fistStartTime = null;
        this.lastCountdownSecond = -1;
      }
      if (this.openStartTime && currentTime - this.lastSeenOpenTime > this.gracePeriodMs) {
        this.openStartTime = null;
        this.lastCountdownSecond = -1;
      }

      return {
        isLocked: this.isLocked,
        justLocked: false,
        justUnlocked: false,
        lockCountdown: null,
      };
    }

    const fistDetected = this.isFist(landmarks, fingerStates);
    const openDetected = this.isOpenHand(landmarks, fingerStates);

    // =========================================================================
    // STATE 1: CURRENTLY UNLOCKED -> CAN BE LOCKED BY HOLDING FIST FOR 3 SECONDS
    // =========================================================================
    if (!this.isLocked) {
      // Clear open hand timers
      this.openStartTime = null;

      if (fistDetected) {
        this.lastSeenFistTime = currentTime;

        if (this.fistStartTime === null) {
          this.fistStartTime = currentTime;
          this.lastCountdownSecond = 3;
          soundEffects.playCountdownTick(3);
        }

        const elapsed = currentTime - this.fistStartTime;
        const remainingSec = Math.max(1, Math.ceil((this.holdDurationMs - elapsed) / 1000));

        if (remainingSec !== this.lastCountdownSecond && remainingSec >= 1 && remainingSec < 3) {
          this.lastCountdownSecond = remainingSec;
          soundEffects.playCountdownTick(remainingSec);
        }

        if (elapsed >= this.holdDurationMs) {
          // 3 SECONDS FIST HELD -> LOCK SYSTEM!
          this.isLocked = true;
          this.resetTimers();
          soundEffects.playLock();

          return {
            isLocked: true,
            justLocked: true,
            justUnlocked: false,
            lockCountdown: null,
          };
        }

        return {
          isLocked: false,
          justLocked: false,
          justUnlocked: false,
          lockCountdown: {
            mode: 'LOCKING',
            remainingSeconds: remainingSec,
            progress: Math.min(1, elapsed / this.holdDurationMs),
            elapsedMs: elapsed,
          },
        };
      } else {
        // Fist broken
        if (this.fistStartTime && currentTime - this.lastSeenFistTime > this.gracePeriodMs) {
          this.fistStartTime = null;
          this.lastCountdownSecond = -1;
        }

        return {
          isLocked: false,
          justLocked: false,
          justUnlocked: false,
          lockCountdown: null,
        };
      }
    }

    // =========================================================================
    // STATE 2: CURRENTLY LOCKED -> CAN BE UNLOCKED BY HOLDING OPEN HAND FOR 3s
    // =========================================================================
    // Clear fist timers
    this.fistStartTime = null;

    if (openDetected) {
      this.lastSeenOpenTime = currentTime;

      if (this.openStartTime === null) {
        this.openStartTime = currentTime;
        this.lastCountdownSecond = 3;
        soundEffects.playCountdownTick(3);
      }

      const elapsed = currentTime - this.openStartTime;
      const remainingSec = Math.max(1, Math.ceil((this.holdDurationMs - elapsed) / 1000));

      if (remainingSec !== this.lastCountdownSecond && remainingSec >= 1 && remainingSec < 3) {
        this.lastCountdownSecond = remainingSec;
        soundEffects.playCountdownTick(remainingSec);
      }

      if (elapsed >= this.holdDurationMs) {
        // 3 SECONDS OPEN HAND HELD -> UNLOCK SYSTEM!
        this.isLocked = false;
        this.resetTimers();
        soundEffects.playUnlock();

        return {
          isLocked: false,
          justLocked: false,
          justUnlocked: true,
          lockCountdown: null,
        };
      }

      return {
        isLocked: true,
        justLocked: false,
        justUnlocked: false,
        lockCountdown: {
          mode: 'UNLOCKING',
          remainingSeconds: remainingSec,
          progress: Math.min(1, elapsed / this.holdDurationMs),
          elapsedMs: elapsed,
        },
      };
    } else {
      // Open hand broken
      if (this.openStartTime && currentTime - this.lastSeenOpenTime > this.gracePeriodMs) {
        this.openStartTime = null;
        this.lastCountdownSecond = -1;
      }

      return {
        isLocked: true,
        justLocked: false,
        justUnlocked: false,
        lockCountdown: null,
      };
    }
  }
}

export const lockStateDetector = new LockStateDetector();
