import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * En-tête éditorial de section :
 *   01 — À PROPOS
 *   Grand titre
 * L'animation (masque lettre par lettre + scramble) arrive en phase 2.
 */
@Component({
  selector: 'app-section-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="section-title__label">
      <span class="section-title__index">{{ index() }}</span>
      <span class="section-title__dash" aria-hidden="true"></span>
      <span>{{ label() }}</span>
    </p>
    @if (title()) {
      <h2 class="section-title__title h2" [id]="headingId()">{{ title() }}</h2>
    }
  `,
  styles: `
    @use 'tokens' as *;

    :host {
      display: block;
      margin-bottom: clamp(2.5rem, 6vw, 5rem);
    }

    .section-title__label {
      @include mono-label;
      display: flex;
      align-items: center;
      gap: 0.9rem;
      color: var(--text-2);
      margin-bottom: clamp(1.25rem, 2.5vw, 2rem);
    }

    .section-title__index {
      color: var(--text);
    }

    .section-title__dash {
      width: 2.5rem;
      height: 1px;
      background: var(--text-3);
    }

    .section-title__title {
      max-width: 14ch;
      text-wrap: balance;
    }
  `,
})
export class SectionTitle {
  readonly index = input.required<string>();
  readonly label = input.required<string>();
  readonly title = input<string>();
  readonly headingId = input<string>();
}
