import { HandLandmark } from '../types';

declare global {
  interface Window {
    Hands?: any;
  }
}

export class HandTracker {
  private handsInstance: any = null;
  private isLoaded: boolean = false;
  private isProcessing: boolean = false;
  private onResultsCallback: ((landmarks: HandLandmark[] | null) => void) | null = null;
  private smoothedLandmarks: HandLandmark[] = [];
  private smoothingAlpha: number = 0.65; // High responsiveness with gentle anti-jitter

  constructor() {
    this.smoothedLandmarks = Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 }));
  }

  public async initialize(): Promise<boolean> {
    if (this.isLoaded && this.handsInstance) return true;

    try {
      // Check if window.Hands is loaded from script tag
      if (!window.Hands) {
        await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
      }

      if (!window.Hands) {
        throw new Error('MediaPipe Hands could not be initialized.');
      }

      this.handsInstance = new window.Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      // Configured for optimal performance:
      // maxNumHands: 1 (as requested by user)
      // modelComplexity: 0 (lightweight model for fast FPS)
      this.handsInstance.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.5,
      });

      this.handsInstance.onResults(this.handleResults);
      this.isLoaded = true;
      return true;
    } catch (err) {
      console.error('HandTracker initialization failed:', err);
      return false;
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        return resolve();
      }
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve();
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  }

  public onResults(cb: (landmarks: HandLandmark[] | null) => void) {
    this.onResultsCallback = cb;
  }

  public async processFrame(videoElement: HTMLVideoElement): Promise<void> {
    if (!this.isLoaded || !this.handsInstance || this.isProcessing) return;

    try {
      this.isProcessing = true;
      await this.handsInstance.send({ image: videoElement });
    } catch {
      // Ignored non-critical frame skip
    } finally {
      this.isProcessing = false;
    }
  }

  private handleResults = (results: any) => {
    if (!this.onResultsCallback) return;

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      this.onResultsCallback(null);
      return;
    }

    const raw = results.multiHandLandmarks[0];
    if (!raw || raw.length < 21) {
      this.onResultsCallback(null);
      return;
    }

    // Apply velocity-adaptive smoothing
    // Fast gestures/finger movements get high alpha (up to 0.96) for instant, lag-free tracking.
    // Steady or resting hand gets moderate alpha (0.50) to filter sensor noise.
    for (let i = 0; i < 21; i++) {
      const p = raw[i];
      if (this.smoothedLandmarks[i].x === 0 && this.smoothedLandmarks[i].y === 0) {
        this.smoothedLandmarks[i].x = p.x;
        this.smoothedLandmarks[i].y = p.y;
        this.smoothedLandmarks[i].z = p.z;
      } else {
        const dx = p.x - this.smoothedLandmarks[i].x;
        const dy = p.y - this.smoothedLandmarks[i].y;
        const dist = Math.hypot(dx, dy);

        // Index tip (8) and Thumb tip (4) require ultra-low latency for laser pointing
        const isFingertip = i === 8 || i === 4;
        const speedBoost = isFingertip ? 42 : 28;
        const baseAlpha = isFingertip ? 0.72 : 0.60;
        const dynamicAlpha = Math.min(0.97, baseAlpha + Math.min(1, dist * speedBoost) * (1 - baseAlpha));

        this.smoothedLandmarks[i].x += dx * dynamicAlpha;
        this.smoothedLandmarks[i].y += dy * dynamicAlpha;
        this.smoothedLandmarks[i].z += (p.z - this.smoothedLandmarks[i].z) * dynamicAlpha;
      }
    }

    this.onResultsCallback(this.smoothedLandmarks);
  };

  public drawLandmarks(
    ctx: CanvasRenderingContext2D,
    landmarks: HandLandmark[],
    width: number,
    height: number,
    isZoomModeActive: boolean = false,
    tapCount: number = 0
  ) {
    ctx.clearRect(0, 0, width, height);

    // Skeleton connections for hand
    const connections = [
      // Thumb
      [0, 1], [1, 2], [2, 3], [3, 4],
      // Index
      [0, 5], [5, 6], [6, 7], [7, 8],
      // Middle
      [0, 9], [9, 10], [10, 11], [11, 12],
      // Ring
      [0, 13], [13, 14], [14, 15], [15, 16],
      // Pinky
      [0, 17], [17, 18], [18, 19], [19, 20],
      // Palm base
      [5, 9], [9, 13], [13, 17],
    ];

    ctx.save();
    // Mirror horizontally for intuitive selfie view
    ctx.translate(width, 0);
    ctx.scale(-1, 1);

    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#38bdf880'; // Sky blue bones

    for (const [start, end] of connections) {
      const p1 = landmarks[start];
      const p2 = landmarks[end];
      ctx.beginPath();
      ctx.moveTo(p1.x * width, p1.y * height);
      ctx.lineTo(p2.x * width, p2.y * height);
      ctx.stroke();
    }

    // If Zoom Mode is active: Draw connecting laser line between Index (8) and Thumb (4)
    if (isZoomModeActive) {
      const pIndex = landmarks[8];
      const pThumb = landmarks[4];
      ctx.save();
      ctx.setLineDash([4, 3]);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(pIndex.x * width, pIndex.y * height);
      ctx.lineTo(pThumb.x * width, pThumb.y * height);
      ctx.stroke();
      ctx.restore();
    }

    // Draw joints
    for (let i = 0; i < landmarks.length; i++) {
      const p = landmarks[i];
      const px = p.x * width;
      const py = p.y * height;

      // 1. UJUNG TELUNJUK (Landmark 8): TITIK 1 MERAH (SELALU AKTIF)
      if (i === 8) {
        // Outer halo
        ctx.beginPath();
        ctx.arc(px, py, 9, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
        ctx.fill();

        // Core red dot
        ctx.beginPath();
        ctx.arc(px, py, 5.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#f43f5e';
        ctx.fill();

        // Inner white highlight
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        continue;
      }

      // 2. UJUNG JEMPOL (Landmark 4): TITIK 2 HIJAU (HANYA SETELAH 3X TEPUK / ZOOM AKTIF)
      if (i === 4) {
        if (isZoomModeActive) {
          // Outer emerald halo
          ctx.beginPath();
          ctx.arc(px, py, 9, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
          ctx.fill();

          // Core green dot
          ctx.beginPath();
          ctx.arc(px, py, 5.5, 0, 2 * Math.PI);
          ctx.fillStyle = '#10b981';
          ctx.fill();

          // Inner white highlight
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, 2 * Math.PI);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        } else {
          // Standard faint joint when zoom mode is not active
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, 2 * Math.PI);
          ctx.fillStyle = tapCount > 0 ? '#f59e0b' : '#64748b';
          ctx.fill();
        }
        continue;
      }

      // Other joints
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#38bdf880';
      ctx.fill();
    }

    ctx.restore();
  }
}
