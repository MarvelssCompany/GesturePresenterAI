export interface CameraConfig {
  width: number;
  height: number;
  frameRate: number;
}

export class CameraController {
  private videoElement: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private isRunning: boolean = false;
  private onFrameCallback: ((video: HTMLVideoElement) => void) | null = null;
  private animFrameId: number | null = null;
  private lastFrameTimestamp: number = 0;
  private targetFps: number = 20;
  private currentFps: number = 0;
  private fpsCalculationFrames: number = 0;
  private fpsCalculationStart: number = 0;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onFpsChangeCallback: ((fps: number) => void) | null = null;

  constructor(targetFps: number = 20) {
    this.targetFps = targetFps;
  }

  public setTargetFps(fps: number) {
    this.targetFps = Math.max(10, Math.min(30, fps));
  }

  public getTargetFps(): number {
    return this.targetFps;
  }

  public getCurrentFps(): number {
    return this.currentFps;
  }

  public onError(cb: (error: string) => void) {
    this.onErrorCallback = cb;
  }

  public onFpsChange(cb: (fps: number) => void) {
    this.onFpsChangeCallback = cb;
  }

  public async start(
    videoEl: HTMLVideoElement,
    onFrame: (video: HTMLVideoElement) => void
  ): Promise<boolean> {
    if (this.isRunning) {
      this.onFrameCallback = onFrame;
      return true;
    }

    this.videoElement = videoEl;
    this.onFrameCallback = onFrame;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.notifyError('Browser does not support webcam media devices.');
      return false;
    }

    try {
      // 640x480 resolution for lightweight hand tracking as requested
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30, max: 30 },
          facingMode: 'user',
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.stream = stream;
      this.videoElement.srcObject = stream;
      this.videoElement.setAttribute('playsinline', 'true');
      this.videoElement.muted = true;

      await new Promise<void>((resolve) => {
        if (!this.videoElement) return resolve();
        this.videoElement.onloadedmetadata = () => {
          this.videoElement?.play().then(resolve).catch(resolve);
        };
      });

      this.isRunning = true;
      this.fpsCalculationStart = performance.now();
      this.fpsCalculationFrames = 0;
      this.loop();
      return true;
    } catch (err: any) {
      console.error('Camera access error:', err);
      let message = 'Camera access is required for gesture control.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No webcam was detected on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Webcam is currently in use by another application or tab.';
      }
      this.notifyError(message);
      return false;
    }
  }

  private loop = () => {
    if (!this.isRunning || !this.videoElement) return;

    const now = performance.now();
    const interval = 1000 / this.targetFps;
    const delta = now - this.lastFrameTimestamp;

    if (delta >= interval) {
      this.lastFrameTimestamp = now - (delta % interval);

      if (this.videoElement.readyState >= 2 && this.onFrameCallback) {
        this.onFrameCallback(this.videoElement);
      }

      // Calculate FPS every 1 second
      this.fpsCalculationFrames++;
      if (now - this.fpsCalculationStart >= 1000) {
        const elapsed = (now - this.fpsCalculationStart) / 1000;
        this.currentFps = Math.round(this.fpsCalculationFrames / elapsed);
        this.fpsCalculationFrames = 0;
        this.fpsCalculationStart = now;
        if (this.onFpsChangeCallback) {
          this.onFpsChangeCallback(this.currentFps);
        }
      }
    }

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  private notifyError(msg: string) {
    if (this.onErrorCallback) {
      this.onErrorCallback(msg);
    }
  }
}
