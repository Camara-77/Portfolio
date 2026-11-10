import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Project } from '../../data/portfolio.data';
import { Icon } from '../../shared/icon/icon';

/**
 * Liste sobre de projets : nom, rôle / contexte, description, stack, lien.
 * `compact` : variante plus serrée (autres projets en fin de chapitre 3).
 */
@Component({
  selector: 'app-project-list',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-compact]': 'compact()' },
  template: `
    <ul class="pl">
      @for (p of projects(); track p.name) {
        <li class="pl__item">
          <a class="pl__link" [href]="p.link.href" target="_blank" rel="noopener">
            <span class="pl__head">
              <span class="pl__name">{{ p.name }}</span>
              <span class="pl__cta">
                <app-icon [name]="p.link.label === 'GitHub' ? 'github' : 'external'" />
                <span class="pl__cta-label">{{ p.link.label }}</span>
                <app-icon name="arrow-up-right" />
              </span>
            </span>
            @if (p.role || p.meta) {
              <span class="pl__meta">{{ p.role ?? p.meta }}</span>
            }
            <span class="pl__desc">{{ p.description }}</span>
            <span class="pl__stack">{{ p.stack.join(' · ') }}</span>
          </a>
        </li>
      }
    </ul>
  `,
  styles: `
    @use 'tokens' as *;

    :host {
      display: block;
    }

    .pl__item {
      border-top: 1px solid var(--line);

      &:last-child {
        border-bottom: 1px solid var(--line);
      }
    }

    .pl__link {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      padding-block: 1.25rem;
      transition: padding-left 0.5s var(--ease-out);

      @include hover {
        padding-left: 0.75rem;

        .pl__name {
          text-decoration-color: var(--accent);
        }
        .pl__cta {
          color: var(--text);
        }
      }
    }

    .pl__head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
    }

    .pl__name {
      font-family: var(--font-serif);
      font-size: 1.625rem;
      line-height: 1.15;
      text-decoration: underline;
      text-decoration-color: transparent;
      text-underline-offset: 0.2em;
      text-decoration-thickness: 1px;
      transition: text-decoration-color 0.3s var(--ease-out);
    }

    .pl__cta {
      @include mono-label(0.625rem);
      --icon-size: 0.95rem;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      flex: none;
      color: var(--text-3);
      transition: color 0.3s var(--ease-out);
    }

    .pl__meta {
      @include mono-label(0.625rem);
      color: var(--text-2);
    }

    .pl__desc {
      color: var(--text-2);
      font-size: 0.9375rem;
    }

    .pl__stack {
      @include mono-label(0.5625rem);
      color: var(--text-3);
      margin-top: 0.2rem;
    }

    :host(.is-compact) {
      .pl__link {
        padding-block: 1rem;
      }
      .pl__name {
        font-size: 1.3125rem;
      }
    }

    @include down($bp-sm) {
      .pl__cta-label {
        display: none;
      }
    }
  `,
})
export class ProjectList {
  readonly projects = input.required<Project[]>();
  readonly compact = input(false);
}
