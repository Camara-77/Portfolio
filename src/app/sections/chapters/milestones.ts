import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Milestone } from '../../data/portfolio.data';
import { NumText } from '../../shared/num-text/num-text';

/** Étapes d'un chapitre : date en mono, titre, lieu. */
@Component({
  selector: 'app-milestones',
  imports: [NumText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol class="ms">
      @for (m of items(); track m.title) {
        <li class="ms__item">
          <span class="ms__date">{{ m.date ?? '' }}</span>
          <span class="ms__body">
            <span class="ms__title"><app-num-text [text]="m.title" /></span>
            @if (m.place) {
              <span class="ms__place">{{ m.place }}</span>
            }
          </span>
        </li>
      }
    </ol>
  `,
  styles: `
    @use 'tokens' as *;

    .ms__item {
      display: grid;
      grid-template-columns: 9.5rem 1fr;
      gap: 1rem;
      padding-block: 1rem;
      border-top: 1px solid var(--line);

      &:last-child {
        border-bottom: 1px solid var(--line);
      }

      @include down($bp-sm) {
        grid-template-columns: 1fr;
        gap: 0.35rem;
      }
    }

    .ms__date {
      @include mono-label(0.6875rem);
      color: var(--text-2);
      padding-top: 0.35rem;
    }

    .ms__body {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .ms__title {
      font-family: var(--font-serif);
      font-size: 1.375rem;
      line-height: 1.25;
    }

    .ms__place {
      @include mono-label(0.625rem);
      color: var(--text-3);
    }
  `,
})
export class Milestones {
  readonly items = input.required<Milestone[]>();
}
