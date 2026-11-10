import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { MotionService } from '../../core/services/motion.service';

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, summary';

/**
 * Curseur personnalisé : point blanc + cercle qui suit avec retard.
 * Le cercle grossit sur les éléments cliquables. mix-blend-mode: difference.
 * Absent sur écran tactile.
 */
@Component({
  selector: 'app-cursor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <div class="cursor__ring" #ring></div>
    <div class="cursor__dot" #dot></div>
  `,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: 3000;
      pointer-events: none;
      mix-blend-mode: difference;
    }

    .cursor__dot,
    .cursor__ring {
      position: fixed;
      top: 0;
      left: 0;
      border-radius: 50%;
      opacity: 0;
      will-change: transform;
      transition: opacity 0.3s ease;
    }

    .cursor__dot {
      width: 6px;
      height: 6px;
      margin: -3px 0 0 -3px;
      background: #fff;
    }

    .cursor__ring {
      width: 36px;
      height: 36px;
      margin: -18px 0 0 -18px;
      border: 1px solid #fff;
    }

    :host(.is-visible) .cursor__dot,
    :host(.is-visible) .cursor__ring {
      opacity: 1;
    }
  `,
})
export class Cursor {
  private readonly dot = viewChild.required<ElementRef<HTMLElement>>('dot');
  private readonly ring = viewChild.required<ElementRef<HTMLElement>>('ring');

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    const motion = inject(MotionService);
    const doc = inject(DOCUMENT);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (!motion.finePointer()) return;

      zone.runOutsideAngular(() => {
        const dot = this.dot().nativeElement;
        const ring = this.ring().nativeElement;
        const html = doc.documentElement;
        html.classList.add('has-custom-cursor');

        const lag = motion.reducedMotion() ? 1 : 0.18;
        const p = { x: -100, y: -100, rx: -100, ry: -100, s: 1, ts: 1 };
        let raf = 0;

        const loop = () => {
          p.rx += (p.x - p.rx) * lag;
          p.ry += (p.y - p.ry) * lag;
          p.s += (p.ts - p.s) * 0.2;
          dot.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
          ring.style.transform = `translate3d(${p.rx}px, ${p.ry}px, 0) scale(${p.s})`;
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);

        const onMove = (e: PointerEvent) => {
          if (e.pointerType !== 'mouse') return;
          p.x = e.clientX;
          p.y = e.clientY;
          host.classList.add('is-visible');
        };
        const onOver = (e: Event) => {
          const t = e.target as Element | null;
          p.ts = t?.closest(INTERACTIVE) ? 1.9 : 1;
        };
        const onDown = () => (p.ts *= 0.8);
        const onUp = (e: Event) => onOver(e);
        const onLeave = () => host.classList.remove('is-visible');

        window.addEventListener('pointermove', onMove, { passive: true });
        doc.addEventListener('pointerover', onOver, { passive: true });
        window.addEventListener('pointerdown', onDown, { passive: true });
        window.addEventListener('pointerup', onUp, { passive: true });
        html.addEventListener('pointerleave', onLeave);

        destroyRef.onDestroy(() => {
          cancelAnimationFrame(raf);
          html.classList.remove('has-custom-cursor');
          window.removeEventListener('pointermove', onMove);
          doc.removeEventListener('pointerover', onOver);
          window.removeEventListener('pointerdown', onDown);
          window.removeEventListener('pointerup', onUp);
          html.removeEventListener('pointerleave', onLeave);
        });
      });
    });
  }
}
