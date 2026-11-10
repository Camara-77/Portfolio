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
import { ScrollService } from '../../core/services/scroll.service';

/**
 * Barre du haut : indique le chapitre en cours (cliquable) et la
 * progression dans le voyage.
 */
@Component({
  selector: 'app-chapter-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chapter-nav.html',
  styleUrl: './chapter-nav.scss',
  host: { '[class.is-scrolled]': 'scroll.scrolled()' },
})
export class ChapterNav {
  protected readonly scroll = inject(ScrollService);
  protected readonly items = PORTFOLIO.nav;
  protected readonly initials = PORTFOLIO.identity.initials;

  private readonly bar = viewChild.required<ElementRef<HTMLElement>>('bar');

  constructor() {
    const zone = inject(NgZone);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const bar = this.bar().nativeElement;
      let raf = 0;
      const update = () => {
        raf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
      };
      const schedule = () => {
        if (!raf) raf = requestAnimationFrame(update);
      };
      zone.runOutsideAngular(() => {
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule, { passive: true });
      });
      update();
      destroyRef.onDestroy(() => {
        cancelAnimationFrame(raf);
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
      });
    });
  }
}
