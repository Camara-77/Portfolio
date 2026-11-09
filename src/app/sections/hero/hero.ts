import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { gsap } from '../../core/gsap';
import { IntroService } from '../../core/services/intro.service';
import { MotionService } from '../../core/services/motion.service';
import { TextRevealDirective } from '../../core/directives/text-reveal.directive';
import { HeroSphere } from '../../layout/hero-sphere/hero-sphere';
import { Portrait } from './portrait/portrait';
import { Button } from '../../shared/button/button';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-hero',
  imports: [TextRevealDirective, HeroSphere, Portrait, Button, Icon],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  protected readonly id = PORTFOLIO.identity;
  protected readonly cards = PORTFOLIO.heroFloatingCards;
  /** Le nom en trois lignes. */
  protected readonly nameLines = PORTFOLIO.identity.name.split(' ');

  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');
  private readonly visual = viewChild.required<ElementRef<HTMLElement>>('visual');

  constructor() {
    const zone = inject(NgZone);
    const intro = inject(IntroService);
    const motion = inject(MotionService);
    let ctx: gsap.Context | undefined;
    let ready = false;
    let played = false;

    // Apparition des éléments secondaires après l'intro
    const play = () => {
      if (played || !ready || !intro.done()) return;
      played = true;
      zone.runOutsideAngular(() => {
        ctx?.add(() => {
          const tl = gsap.timeline({ delay: 0.15 });
          tl.to('[data-hero-fade]', { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0.35)
            .to('[data-hero-visual]', { autoAlpha: 1, scale: 1, y: 0, duration: 1.6 }, 0.1)
            .to('[data-hero-card]', { autoAlpha: 1, scale: 1, duration: 1, stagger: 0.1 }, 0.7);
        });
      });
    };

    afterNextRender(() => {
      if (motion.reducedMotion()) return;
      zone.runOutsideAngular(() => {
        ctx = gsap.context(() => {
          gsap.set('[data-hero-fade]', { autoAlpha: 0, y: 24 });
          gsap.set('[data-hero-visual]', { autoAlpha: 0, scale: 0.96, y: 30 });
          gsap.set('[data-hero-card]', { autoAlpha: 0, scale: 0.85 });

          // Parallaxe du portrait au défilement
          gsap.to(this.visual().nativeElement, {
            yPercent: -10,
            ease: 'none',
            scrollTrigger: {
              trigger: this.root().nativeElement,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });
        }, this.root().nativeElement);
      });
      ready = true;
      play();
    });

    effect(() => {
      if (intro.done()) play();
    });

    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }
}
