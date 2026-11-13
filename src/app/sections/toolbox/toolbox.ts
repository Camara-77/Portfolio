import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { ChapterHead } from '../chapters/chapter-head';
import { RevealDirective } from '../../core/directives/reveal.directive';
import { TECH_LOGOS } from '../../data/tech-logos';

/** Chapitre « Ma boîte à outils » : 5 tuiles avec les logos officiels + savoir-être. */
@Component({
  selector: 'app-toolbox',
  imports: [ChapterHead, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section [id]="t.id" class="chapter tb" aria-labelledby="outils-title" data-chapter="outils">
      <div class="container">
        <app-chapter-head [index]="t.index" [label]="t.label" headingId="outils-title" [title]="t.title" [outline]="t.outline" />

        <ul class="tb__grid" appReveal [revealStagger]="true">
          @for (g of t.groups; track g.title) {
            <li class="tb__tile glass">
              <ul class="tb__logos" role="list">
                @for (k of g.logos; track k) {
                  <li class="tb__logo" [style.--brand]="logos[k].hex" [attr.title]="logos[k].title">
                    <svg viewBox="0 0 24 24" role="img" focusable="false">
                      <title>{{ logos[k].title }}</title>
                      <path [attr.d]="logos[k].path" />
                    </svg>
                  </li>
                }
              </ul>
              <h3 class="tb__title">{{ g.title }}</h3>
              <ul class="tb__items">
                @for (item of g.items; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
            </li>
          }
        </ul>

        <p class="tb__soft" appReveal>
          @for (s of t.soft; track s; let last = $last) {
            <span>{{ s }}</span>
            @if (!last) {
              <span class="tb__dot" aria-hidden="true">·</span>
            }
          }
        </p>
      </div>
    </section>
  `,
  styles: `
    @use 'tokens' as *;

    :host {
      display: block;
    }

    .tb__grid {
      display: grid;
      margin-top: clamp(1.75rem, 3.5vw, 2.5rem);
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;

      @include up($bp-md) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1rem;
      }

      @include up($bp-lg) {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
    }

    .tb__tile {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      padding: 1.25rem; // fond, bordure et ombre : classe .glass
    }

    // Logos officiels : gris foncé, couleur de la marque au survol
    .tb__logos {
      display: flex;
      flex-wrap: wrap;
      gap: 0.85rem;
      min-height: 32px;
    }

    .tb__logo {
      display: flex;

      svg {
        width: 30px;
        height: 30px;
      }

      path {
        fill: var(--stroke);
        transition: fill 0.35s var(--ease-out);
      }

      @include hover {
        path {
          fill: var(--brand);
        }
      }
    }

    .tb__title {
      font-family: var(--font-serif);
      font-size: 1.625rem;
      font-weight: 400;
      line-height: 1;
    }

    .tb__items {
      display: grid;
      gap: 0.3rem;

      li {
        @include mono-label(0.625rem);
        color: var(--text-2);
      }
    }

    .tb__soft {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem 0.75rem;
      margin-top: clamp(1.5rem, 3vw, 2rem);
      font-family: var(--font-serif);
      font-size: clamp(1.25rem, 2vw, 1.625rem);
      font-style: italic;
    }

    .tb__dot {
      color: var(--accent);
      font-style: normal;
    }
  `,
})
export class Toolbox {
  protected readonly t = PORTFOLIO.toolbox;

  protected readonly logos = TECH_LOGOS;
}
