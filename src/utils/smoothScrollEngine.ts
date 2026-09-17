import { soundEffects } from './audioEffects';

export type ScrollDirectionFeedback = 'SCROLL_DOWN_SLOW' | 'SCROLL_DOWN_FAST' | 'SCROLL_UP_SLOW' | 'SCROLL_UP_FAST' | null;

export class SmoothScrollEngine {
  private velocityY: number = 0;
  private targetVelocityY: number = 0;
  private friction: number = 0.88; // Buttery momentum deceleration
  private isRunning: boolean = false;
  private rafId: number | null = null;
  private lastSoundTime: number = 0;
  private currentFeedback: ScrollDirectionFeedback = null;
  private suppressUntil: number = 0;

  public getScrollTarget(): HTMLElement | null {
    // 1. Docx Reader Body
    const docx = document.getElementById('docx-scrollable-body');
    if (docx && docx.scrollHeight > docx.clientHeight) return docx;

    // 2. Slide Content Body
    const slide = document.getElementById('slide-scrollable-body');
    if (slide && slide.scrollHeight > slide.clientHeight) return slide;

    // 3. Zoom Container (when zoomed in)
    const zoom = document.getElementById('presentation-zoom-container');
    if (zoom && zoom.scrollHeight > zoom.clientHeight) return zoom;

    // Fallbacks
    return docx || slide || zoom;
  }

  /**
   * Temporarily suppresses positional scroll, e.g. during a horizontal slide swipe
   */
  public suppressPositionalScroll(durationMs: number = 400): void {
    this.suppressUntil = performance.now() + durationMs;
    this.targetVelocityY = 0;
  }

  /**
   * Continuous finger-level vertical scroll based on user hand position:
   * - Halfway down (setengah di bawah layar) -> Pelan aja (1.2 - 4.5 px/frame)
   * - Full down (full di bawah layar) -> Cepat banget (12 - 32 px/frame)
   * - Center (deadzone 0.44 - 0.56) -> Diam (0 px/frame) untuk menunjuk materi
   * - Halfway up (setengah di atas layar) -> Pelan aja (-1.2 - -4.5 px/frame)
   * - Full up (full di atas layar) -> Cepat banget (-12 - -32 px/frame)
   */
  public updateFingerPosition(pointerY: number | null, isActive: boolean = true): ScrollDirectionFeedback {
    if (!isActive || pointerY === null || performance.now() < this.suppressUntil) {
      this.targetVelocityY = 0;
      this.currentFeedback = null;
      return null;
    }

    // Deadzone: between 0.44 and 0.56 (center area) - Laser pointer is calm
    if (pointerY >= 0.44 && pointerY <= 0.56) {
      this.targetVelocityY = 0;
      this.currentFeedback = null;
      return null;
    }

    if (pointerY > 0.56) {
      // Finger pointing towards the lower half (Scroll Down)
      const ratio = Math.min(1, Math.max(0, (pointerY - 0.56) / (0.92 - 0.56)));

      if (ratio <= 0.40) {
        // Setengah di bawah layar: Pelan aja
        const subRatio = ratio / 0.40;
        this.targetVelocityY = 1.0 + subRatio * 3.5;
        this.currentFeedback = 'SCROLL_DOWN_SLOW';
      } else {
        // Full di bawah: Cepat banget
        const highRatio = (ratio - 0.40) / 0.60;
        this.targetVelocityY = 4.5 + Math.pow(highRatio, 1.7) * 28.0;
        this.currentFeedback = 'SCROLL_DOWN_FAST';
      }
    } else {
      // Finger pointing towards the upper half (Scroll Up)
      const ratio = Math.min(1, Math.max(0, (0.44 - pointerY) / (0.44 - 0.08)));

      if (ratio <= 0.40) {
        // Setengah di atas layar: Pelan aja
        const subRatio = ratio / 0.40;
        this.targetVelocityY = -(1.0 + subRatio * 3.5);
        this.currentFeedback = 'SCROLL_UP_SLOW';
      } else {
        // Full di atas: Cepat banget
        const highRatio = (ratio - 0.40) / 0.60;
        this.targetVelocityY = -(4.5 + Math.pow(highRatio, 1.7) * 28.0);
        this.currentFeedback = 'SCROLL_UP_FAST';
      }
    }

    if (!this.isRunning && Math.abs(this.targetVelocityY) > 0.1) {
      this.startLoop();
    }

    return this.currentFeedback;
  }

  /**
   * Triggered on distinct 1-Index vertical flick gestures (Usap Atas / Usap Bawah)
   */
  public scrollFlick(direction: 'up' | 'down', strength: number = 24): void {
    const el = this.getScrollTarget();
    if (!el) return;

    const sign = direction === 'down' ? 1 : -1;
    this.velocityY += sign * strength;
    this.velocityY = Math.max(-42, Math.min(42, this.velocityY));

    this.playThrottledTick();

    if (!this.isRunning) {
      this.startLoop();
    }
  }

  /**
   * Continuous delta from gesture movement
   */
  public scrollContinuous(deltaY: number): void {
    const el = this.getScrollTarget();
    if (!el) return;

    this.velocityY += deltaY * 0.10;
    this.velocityY = Math.max(-36, Math.min(36, this.velocityY));

    if (Math.abs(deltaY) > 2) {
      this.playThrottledTick();
    }

    if (!this.isRunning) {
      this.startLoop();
    }
  }

  public getCurrentFeedback(): ScrollDirectionFeedback {
    return this.currentFeedback;
  }

  private playThrottledTick(): void {
    const now = performance.now();
    if (now - this.lastSoundTime > 240) {
      soundEffects.playScrollTick();
      this.lastSoundTime = now;
    }
  }

  private startLoop(): void {
    this.isRunning = true;

    const tick = () => {
      const el = this.getScrollTarget();

      // Silky smooth velocity approach towards target velocity
      this.velocityY += (this.targetVelocityY - this.velocityY) * 0.14;

      if (!el || (Math.abs(this.velocityY) < 0.15 && Math.abs(this.targetVelocityY) < 0.1)) {
        this.velocityY = 0;
        this.targetVelocityY = 0;
        this.isRunning = false;
        this.rafId = null;
        return;
      }

      const prevScroll = el.scrollTop;
      el.scrollTop += this.velocityY;

      if (Math.abs(this.velocityY) > 1.2) {
        this.playThrottledTick();
      }

      // Check boundary hit
      if (el.scrollTop === prevScroll && Math.abs(this.velocityY) > 2) {
        if (Math.abs(this.targetVelocityY) < 0.2) {
          this.velocityY = 0;
          this.isRunning = false;
          this.rafId = null;
          return;
        }
      }

      // Exponential decay if target is 0
      if (Math.abs(this.targetVelocityY) < 0.1) {
        this.velocityY *= this.friction;
      }

      this.rafId = requestAnimationFrame(tick);
    };

    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(tick);
  }

  public stop(): void {
    this.velocityY = 0;
    this.targetVelocityY = 0;
    this.currentFeedback = null;
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}

export const smoothScrollEngine = new SmoothScrollEngine();
