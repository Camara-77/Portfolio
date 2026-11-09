import { DestroyRef, Directive, ElementRef, NgZone, afterNextRender, inject } from '@angular/core';
import { gsap, SplitText } from '../gsap';
import { MotionService } from '../services/motion.service';

/**
 * Les mots s'éclairent un à un au rythme du défilement (texte gris → blanc).
 *   <p appScrubWords>…</p>
 */
@Directive({ selector: '[appScrubWords]' })
export class ScrubWordsDirective {
  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    const motion = inject(MotionService);
    let split: SplitText | undefined;
    let tween: gsap.core.Tween | undefined;
    let destroyed = false;

    afterNextRender(() => {
      if (motion.reducedMotion()) return;
      zone.runOutsideAngular(async () => {
        await document.fonts.ready;
        if (destroyed) return;
        split = SplitText.create(el, { type: 'words', aria: 'auto' });
        tween = gsap.fromTo(
          split.words,
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.1,
            scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 45%', scrub: 0.6 },
          },
        );
      });
    });

    inject(DestroyRef).onDestroy(() => {
      destroyed = true;
      tween?.scrollTrigger?.kill();
      tween?.kill();
      split?.revert();
    });
  }
}
