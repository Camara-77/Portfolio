import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, NgZone, afterNextRender, inject } from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { gsap } from '../../core/gsap';
import { MotionService } from '../../core/services/motion.service';
import { Portrait } from './portrait/portrait';
import { VoiceWave } from '../../shared/voice-wave/voice-wave';

/**
 * Ouverture « couverture de magazine » : AÏSSATOU / COMBE / CAMARA en
 * Big Shoulders Display, lettres pleines DERRIÈRE le portrait détouré.
 * Le visage cache le milieu de COMBE, le buste celui de CAMARA.
 * Tréma du Ï en orange (deux ronds calqués sur le vrai tréma de la police).
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
      zone.runOutsideAngular(() => {
        const ctx = gsap.context(() => {
          // Portrait visible immédiatement : léger mouvement (0,6 s) depuis un état visible
          gsap.from('.op__portrait', { y: 18, scale: 0.985, duration: 0.6, ease: 'power3.out' });
          // Noir #1A1A1A en moins de 0,8 s : opacité de départ 0,4 + léger mouvement vertical
          gsap.from('.op__line', { opacity: 0.4, y: 14, duration: 0.6, ease: 'power2.out', stagger: 0.06 });
          gsap.from('.op__foot > *', { autoAlpha: 0, duration: 0.6, delay: 0.3, stagger: 0.08 });
        }, host);
        destroyRef.onDestroy(() => ctx.revert());
      });
    });
  }
}
