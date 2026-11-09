import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  input,
} from '@angular/core';

/**
 * Carte en verre réutilisable.
 * - reflet en haut à gauche (::before)
 * - halo blanc qui suit la souris (::after, piloté par --mx / --my)
 */
@Component({
  selector: 'app-glass-card',
  template: '<ng-content />',
  styleUrl: './glass-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'glass-card',
    '[class.glass-card--interactive]': 'interactive()',
    '[attr.data-pad]': 'padding()',
  },
})
export class GlassCard {
  /** Active le halo qui suit la souris. */
  readonly interactive = input(true);
  /** Rembourrage interne. */
  readonly padding = input<'none' | 'sm' | 'md' | 'lg'>('md');

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (!this.interactive()) return;
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

      let frame = 0;
      const onMove = (e: PointerEvent) => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const r = host.getBoundingClientRect();
          host.style.setProperty('--mx', `${e.clientX - r.left}px`);
          host.style.setProperty('--my', `${e.clientY - r.top}px`);
        });
      };

      zone.runOutsideAngular(() => host.addEventListener('pointermove', onMove, { passive: true }));
      destroyRef.onDestroy(() => {
        cancelAnimationFrame(frame);
        host.removeEventListener('pointermove', onMove);
      });
    });
  }
}
