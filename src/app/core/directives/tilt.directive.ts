import { DestroyRef, Directive, ElementRef, NgZone, afterNextRender, inject, input } from '@angular/core';
import { gsap } from '../gsap';
import { MotionService } from '../services/motion.service';

/**
 * Inclinaison 3D au survol (souris uniquement, désactivée si
 * prefers-reduced-motion). Le reflet est assuré par la glass-card.
 *   <div appTilt>…</div>
 */
@Directive({ selector: '[appTilt]' })
export class TiltDirective {
  /** Angle maximal en degrés. */
  readonly tiltMax = input(8);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (motion.reducedMotion() || !motion.finePointer()) return;

      zone.runOutsideAngular(() => {
        gsap.set(el, { transformPerspective: 900, transformStyle: 'preserve-3d' });
        const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' });
        const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' });

        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          const max = this.tiltMax();
          ry(px * max * 2);
          rx(-py * max * 2);
        };
        const onLeave = () => {
          rx(0);
          ry(0);
        };

        el.addEventListener('pointermove', onMove, { passive: true });
        el.addEventListener('pointerleave', onLeave);
        destroyRef.onDestroy(() => {
          el.removeEventListener('pointermove', onMove);
          el.removeEventListener('pointerleave', onLeave);
          gsap.killTweensOf(el);
        });
      });
    });
  }
}
