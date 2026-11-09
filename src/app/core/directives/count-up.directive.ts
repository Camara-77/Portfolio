import { DestroyRef, Directive, ElementRef, NgZone, afterNextRender, inject, input } from '@angular/core';
import { gsap, ScrollTrigger } from '../gsap';
import { MotionService } from '../services/motion.service';

/**
 * Compteur qui monte de 0 à sa valeur quand il entre dans l'écran.
 *   <span [appCountUp]="156" suffix="+"></span>
 * La valeur finale est écrite d'emblée (lisible sans JS et par les
 * lecteurs d'écran via aria-label).
 */
@Directive({
  selector: '[appCountUp]',
  host: {
    '[attr.aria-label]': 'appCountUp() + suffix()',
    style: 'font-variant-numeric: tabular-nums',
  },
})
export class CountUpDirective {
  readonly appCountUp = input.required<number>();
  readonly suffix = input('');

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    const motion = inject(MotionService);
    let st: ScrollTrigger | undefined;
    let tween: gsap.core.Tween | undefined;

    afterNextRender(() => {
      const value = this.appCountUp();
      const suffix = this.suffix();
      const write = (v: number) => (el.textContent = `${Math.round(v)}${suffix}`);
      write(value);
      if (motion.reducedMotion()) return;

      zone.runOutsideAngular(() => {
        write(0);
        const state = { v: 0 };
        st = ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            tween = gsap.to(state, {
              v: value,
              duration: value > 20 ? 2 : 1.4,
              ease: 'power3.out',
              onUpdate: () => write(state.v),
            });
          },
        });
      });
    });

    inject(DestroyRef).onDestroy(() => {
      st?.kill();
      tween?.kill();
    });
  }
}
