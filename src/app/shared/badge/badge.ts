import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Petite étiquette en verre, JetBrains Mono majuscules. */
@Component({
  selector: 'app-badge',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'badge' },
  styles: `
    @use 'tokens' as *;

    :host {
      @include glass(var(--radius-pill));
      @include mono-label(0.6875rem);
      display: inline-flex;
      align-items: center;
      gap: 0.5em;
      padding: 0.45em 0.95em;
      color: var(--text-2);
      line-height: 1.2;
      white-space: nowrap;
      box-shadow: none;
    }
  `,
})
export class Badge {}
