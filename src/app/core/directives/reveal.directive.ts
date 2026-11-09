import { DestroyRef, Directive, ElementRef, NgZone, afterNextRender, inject, input } from '@angular/core';
import { gsap, ScrollTrigger } from '../gsap';
import { MotionService } from '../services/motion.service';

/**
 * Apparition au défilement : fondu + glissement.
 *   <div appReveal>…</div>                    l'élément lui-même
 *   <ul appReveal [revealStagger]="true">…</ul>  ses enfants, en cascade
 */
@Directive({ selector: '[appReveal]' })
export class RevealDirective {
  readonly revealStagger = input(false);
  readonly revealDelay = input(0);
  readonly revealY = input(32);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    const motion = inject(MotionService);
    let st: ScrollTrigger | undefined;
    let tween: gsap.core.Tween | undefined;

    afterNextRender(() => {
      if (motion.reducedMotion()) return;
      zone.runOutsideAngular(() => {
        const targets = this.revealStagger() ? Array.from(el.children) : [el];
        if (!targets.length) return;
        gsap.set(targets, { autoAlpha: 0, y: this.revealY() });

        st = ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          once: true,
          onEnter: () => {
            tween = gsap.to(targets, {
              autoAlpha: 1,
              y: 0,
              duration: 1.1,
              delay: this.revealDelay(),
              stagger: 0.08,
              clearProps: 'transform,opacity,visibility',
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
