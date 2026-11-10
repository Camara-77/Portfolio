import { DestroyRef, Directive, ElementRef, NgZone, afterNextRender, inject, input } from '@angular/core';
import { gsap } from '../gsap';
import { MotionService } from '../services/motion.service';

/**
 * Bouton magnétique : l'élément est attiré vers le curseur quand celui-ci
 * s'approche, puis revient avec un léger rebond.
 * Appliqué automatiquement à tous les boutons (hostDirectives de Button).
 */
@Directive({ selector: '[appMagnetic]' })
export class MagneticDirective {
  /** Part du déplacement du curseur suivie par l'élément. */
  readonly magneticStrength = input(0.35);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (motion.reducedMotion() || !motion.finePointer()) return;

      zone.runOutsideAngular(() => {
        const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
        const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const s = this.magneticStrength();
          x((e.clientX - (r.left + r.width / 2)) * s);
          y((e.clientY - (r.top + r.height / 2)) * s);
        };
        const onLeave = () => {
          gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)', overwrite: true });
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
