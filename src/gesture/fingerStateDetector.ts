import { HandLandmark, FingerStates } from '../types';

export class FingerStateDetector {
  /**
   * Detects the extension state (true = extended, false = folded)
   * of each individual finger.
   */
  public detect(landmarks: HandLandmark[] | null): FingerStates {
    if (!landmarks || landmarks.length < 21) {
      return {
        thumb: false,
        index: false,
        middle: false,
        ring: false,
        pinky: false,
        extendedCount: 0,
      };
    }

    const wrist = landmarks[0];

    const distSq = (p1: HandLandmark, p2: HandLandmark) =>
      (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;

    const dist = (p1: HandLandmark, p2: HandLandmark) =>
      Math.sqrt(distSq(p1, p2));

    // Index finger
    const indexTip = landmarks[8];
    const indexPip = landmarks[6];
    const indexMcp = landmarks[5];
    const indexExtended =
      distSq(indexTip, wrist) > distSq(indexPip, wrist) * 1.05 &&
      distSq(indexTip, indexMcp) > distSq(indexPip, indexMcp) * 1.08;

    // Middle finger
    const middleTip = landmarks[12];
    const middlePip = landmarks[10];
    const middleMcp = landmarks[9];
    const middleExtended =
      distSq(middleTip, wrist) > distSq(middlePip, wrist) * 1.08 &&
      distSq(middleTip, middleMcp) > distSq(middlePip, middleMcp) * 1.12;

    // Ring finger
    const ringTip = landmarks[16];
    const ringPip = landmarks[14];
    const ringMcp = landmarks[13];
    const ringExtended =
      distSq(ringTip, wrist) > distSq(ringPip, wrist) * 1.08 &&
      distSq(ringTip, ringMcp) > distSq(ringPip, ringMcp) * 1.12;

    // Pinky finger
    const pinkyTip = landmarks[20];
    const pinkyPip = landmarks[18];
    const pinkyMcp = landmarks[17];
    const pinkyExtended =
      distSq(pinkyTip, wrist) > distSq(pinkyPip, wrist) * 1.08 &&
      distSq(pinkyTip, pinkyMcp) > distSq(pinkyPip, pinkyMcp) * 1.12;

    // Thumb finger
    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    const thumbExtended =
      dist(thumbTip, pinkyMcp) > dist(thumbIp, pinkyMcp) * 1.08 &&
      dist(thumbTip, indexMcp) > 0.07;

    let count = 0;
    if (thumbExtended) count++;
    if (indexExtended) count++;
    if (middleExtended) count++;
    if (ringExtended) count++;
    if (pinkyExtended) count++;

    return {
      thumb: thumbExtended,
      index: indexExtended,
      middle: middleExtended,
      ring: ringExtended,
      pinky: pinkyExtended,
      extendedCount: count,
    };
  }

  /**
   * Specifically detects when 1 index finger is prominently pointing/swiping,
   * forgiving loose curled fingers.
   */
  public isIndexPointing(landmarks: HandLandmark[] | null): boolean {
    if (!landmarks || landmarks.length < 21) return false;

    const wrist = landmarks[0];
    const indexTip = landmarks[8];
    const indexPip = landmarks[6];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const dist = (p1: HandLandmark, p2: HandLandmark) =>
      Math.hypot(p1.x - p2.x, p1.y - p2.y);

    const indexDist = dist(indexTip, wrist);
    const indexPipDist = dist(indexPip, wrist);

    // Index must be extended
    if (indexDist < indexPipDist * 1.05) return false;

    // Index must be clearly more extended than middle, ring, and pinky
    const middleDist = dist(middleTip, wrist);
    const ringDist = dist(ringTip, wrist);
    const pinkyDist = dist(pinkyTip, wrist);

    return (
      indexDist > middleDist * 1.10 &&
      indexDist > ringDist * 1.15 &&
      indexDist > pinkyDist * 1.15
    );
  }

  /**
   * Specifically detects 2 fingers (Thumb + Index) for zoom,
   * while other 3 fingers are curled.
   */
  public isThumbIndexZoom(landmarks: HandLandmark[] | null): boolean {
    if (!landmarks || landmarks.length < 21) return false;

    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const dist = (p1: HandLandmark, p2: HandLandmark) =>
      Math.hypot(p1.x - p2.x, p1.y - p2.y);

    const indexDist = dist(indexTip, wrist);
    const middleDist = dist(middleTip, wrist);
    const ringDist = dist(ringTip, wrist);
    const pinkyDist = dist(pinkyTip, wrist);

    // Index and thumb extended, middle/ring/pinky curled
    const indexDominant = indexDist > middleDist * 1.08 && indexDist > ringDist * 1.12;
    const thumbSeparated = dist(thumbTip, indexTip) > 0.03;

    return indexDominant && thumbSeparated && (ringDist < indexDist * 0.85);
  }
}
