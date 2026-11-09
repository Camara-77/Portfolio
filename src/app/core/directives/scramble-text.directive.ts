import { DestroyRef, Directive, ElementRef, NgZone, afterNextRender, inject, input } from '@angular/core';
import { gsap, ScrollTrigger, SCRAMBLE_CHARS } from '../gsap';
import { MotionService } from '../services/motion.service';

/**
 * Brouillage de caractères à l'entrée dans l'écran (labels en JetBrains Mono :
 * chasse fixe, donc aucune variation de largeur).
 *   <p appScrambleText>01 — À PROPOS</p>
 */
@Directive({ selector: '[appScrambleText]' })
export class ScrambleTextDirective {
  readonly delay = input(0);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    const motion = inject(MotionService);
    let st: ScrollTrigger | undefined;
    let tween: gsap.core.Tween | undefined;

    afterNextRender(() => {
      if (motion.reducedMotion()) return;
      const text = el.textContent ?? '';
      el.setAttribute('aria-label', text.trim());

      zone.runOutsideAngular(() => {
        st = ScrollTrigger.create({
          trigger: el,
          start: 'top 92%',
          once: true,
          onEnter: () => {
            tween = gsap.to(el, {
              duration: 1.2,
              delay: this.delay(),
              ease: 'none',
              scrambleText: { text, chars: SCRAMBLE_CHARS, speed: 0.5, revealDelay: 0.25 },
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
