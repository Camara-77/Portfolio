import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { gsap } from '../../core/gsap';
import { MotionService } from '../../core/services/motion.service';
import { Portrait } from './portrait/portrait';
import { VoiceMic } from '../../shared/audio/voice-mic';
import { Icon } from '../../shared/icon/icon';

/**
 * Ouverture « couverture de magazine » :
 * le prénom en très grand (Anton) sur toute la largeur, le portrait détouré
 * devant. Deux calques du mot : plein derrière le portrait, contour seul
 * devant — les lettres paraissent pleines autour du portrait, en contour sur lui.
 */
@Component({
  selector: 'app-opening',
  imports: [Portrait, VoiceMic, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './opening.html',
  styleUrl: './opening.scss',
})
export class Opening {
  protected readonly id = PORTFOLIO.identity;
  protected readonly opening = PORTFOLIO.opening;
  protected readonly word = PORTFOLIO.opening.word;
  protected readonly letters = [...PORTFOLIO.opening.word];

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly measure = viewChild.required<ElementRef<HTMLElement>>('measure');

  constructor() {
    const zone = inject(NgZone);
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      zone.runOutsideAngular(async () => {
        await document.fonts.load('100px Anton');
        this.fit();
        const onResize = () => this.fit();
        window.addEventListener('resize', onResize, { passive: true });
        destroyRef.onDestroy(() => window.removeEventListener('resize', onResize));

        if (motion.reducedMotion()) return;
        // Arrivée : le mot lettre par lettre (les deux calques ensemble), puis le portrait
        const ctx = gsap.context(() => {
          const tl = gsap.timeline({ delay: 0.15 });
          tl.from('.op__word .op__letter', {
            yPercent: 60,
            autoAlpha: 0,
            duration: 0.9,
            ease: 'expo.out',
            stagger: (i: number) => (i % this.letters.length) * 0.07,
          })
            .from('.op__portrait', { y: 80, autoAlpha: 0, duration: 1.3, ease: 'expo.out' }, '-=0.35')
            .from('.op__corner, .op__voice', { autoAlpha: 0, duration: 0.8, stagger: 0.06 }, '-=0.8');
        }, this.host);
        destroyRef.onDestroy(() => ctx.revert());
      });
    });
  }

  /** Taille du mot pour qu'il occupe toute la largeur disponible. */
  private fit(): void {
    const el = this.measure().nativeElement;
    const stage = this.host.querySelector<HTMLElement>('.op__stage')!;
    const style = getComputedStyle(stage);
    const available = stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const width = el.getBoundingClientRect().width; // mesuré à 100px
    if (!width || !available) return;
    this.host.style.setProperty('--word-size', `${(available / width) * 100 * 0.99}px`);
  }
}
