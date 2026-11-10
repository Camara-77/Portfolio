import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * En-tête de chapitre :
 *   BIOLOGIE                2021 – 2024
 *   Titre en serif
 */
@Component({
  selector: 'app-chapter-head',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="head__meta">
      <span class="head__chapter">{{ label() }}</span>
      @if (period()) {
        <span class="head__period">{{ period() }}</span>
      }
    </p>
    <h2 class="head__title" [class.head__title--compact]="compact()" [id]="headingId()">
      <ng-content />
    </h2>
  `,
  styles: `
    @use 'tokens' as *;

    :host {
      display: block;
    }

    .head__meta {
      @include mono-label(0.6875rem);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem 1.5rem;
      color: var(--text-2);
      padding-bottom: 1rem;
      margin-bottom: clamp(1.5rem, 3vw, 2.25rem);
      border-bottom: 1px solid var(--line);
    }

    .head__index {
      color: var(--accent);
    }

    .head__period {
      color: var(--text-3);
    }

    .head__title--compact {
      font-size: clamp(2.5rem, 5vw, 4.5rem) !important;
    }

    .head__title {
      font-family: var(--font-serif);
      font-size: var(--fs-chapter);
      font-weight: 400;
      line-height: 0.95;
      letter-spacing: -0.02em;
      text-wrap: balance;
    }
  `,
})
export class ChapterHead {
  readonly index = input.required<string>();
  readonly label = input.required<string>();
  readonly period = input<string>();
  readonly headingId = input.required<string>();
  /** Titre plus petit (chapitre épinglé). */
  readonly compact = input(false);
}
