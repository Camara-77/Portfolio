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

/** Fine barre de progression du défilement, en haut de la page. */
@Component({
  selector: 'app-scroll-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `<span class="bar" #bar></span>`,
  styles: `
    :host {
      position: fixed;
      inset: 0 0 auto;
      z-index: 200;
      height: 2px;
      pointer-events: none;
    }
    .bar {
      display: block;
      height: 100%;
      background: var(--text);
      transform: scaleX(0);
      transform-origin: left;
      will-change: transform;
    }
  `,
})
export class ScrollProgress {
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
