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
import { SectionTitle } from '../../shared/section-title/section-title';
import { GlassCard } from '../../shared/glass-card/glass-card';
import { Icon } from '../../shared/icon/icon';

/**
 * Frise verticale : la ligne se remplit au rythme du défilement,
 * chaque étape s'allume quand la ligne l'atteint.
 */
@Component({
  selector: 'app-timeline',
  imports: [SectionTitle, GlassCard, Icon],
  templateUrl: './timeline.html',
  styleUrl: './timeline.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Timeline {
  protected readonly items = PORTFOLIO.timeline;
  private readonly list = viewChild.required<ElementRef<HTMLElement>>('list');

  constructor() {
    const zone = inject(NgZone);
    const motion = inject(MotionService);
    let ctx: gsap.Context | undefined;

    afterNextRender(() => {
      const list = this.list().nativeElement;
      if (motion.reducedMotion()) {
        list.classList.add('is-static');
        return;
      }

      zone.runOutsideAngular(() => {
        ctx = gsap.context(() => {
          gsap.fromTo(
            '.timeline__progress',
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: 'none',
              scrollTrigger: { trigger: list, start: 'top 65%', end: 'bottom 65%', scrub: 0.4 },
            },
          );

          gsap.utils.toArray<HTMLElement>('.timeline__item').forEach((item) => {
            gsap.from(item.querySelector('.timeline__content'), {
              autoAlpha: 0,
              x: 40,
              duration: 1,
              scrollTrigger: { trigger: item, start: 'top 85%', once: true },
            });
            gsap.timeline({
              scrollTrigger: {
                trigger: item,
                start: 'top 65%',
                toggleClass: { targets: item, className: 'is-active' },
              },
            });
          });
        }, list);
      });
    });

    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }
}
