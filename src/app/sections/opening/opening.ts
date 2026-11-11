import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, NgZone, afterNextRender, inject } from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { gsap } from '../../core/gsap';
import { MotionService } from '../../core/services/motion.service';
import { Portrait } from './portrait/portrait';
import { VoiceWave } from '../../shared/voice-wave/voice-wave';

/**
 * Ouverture « couverture de magazine » :
 * AÏSSATOU en petit, puis COMBE / CAMARA en grand (Anton).
 * Superposition : COMBE (1) < portrait (2) < CAMARA (3).
 */
@Component({
  selector: 'app-opening',
  imports: [Portrait, VoiceWave],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './opening.html',
  styleUrl: './opening.scss',
})
export class Opening {
  protected readonly id = PORTFOLIO.identity;
  protected readonly o = PORTFOLIO.opening;

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (motion.reducedMotion()) return;
      zone.runOutsideAngular(async () => {
        await document.fonts.load('100px Anton');
        // Arrivée : COMBE et CAMARA montent en fondu, puis le portrait
        const ctx = gsap.context(() => {
          gsap
            .timeline({ delay: 0.1 })
            .from('.op__kicker', { autoAlpha: 0, y: 10, duration: 0.6 })
            .from('.op__line', { yPercent: 40, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: 0.14 }, 0.1)
            .from('.op__portrait', { y: 70, autoAlpha: 0, duration: 1.3, ease: 'expo.out' }, 0.55)
            .from('.op__foot > *', { autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0.9);
        }, host);
        destroyRef.onDestroy(() => ctx.revert());
      });
    });
  }
}
