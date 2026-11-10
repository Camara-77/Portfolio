import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { ChapterHead } from '../chapters/chapter-head';
import { RevealDirective } from '../../core/directives/reveal.directive';

/** Chapitre « Ma boîte à outils » : 5 tuiles dessinées + savoir-être. */
@Component({
  selector: 'app-toolbox',
  imports: [ChapterHead, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section [id]="t.id" class="chapter tb" aria-labelledby="outils-title" data-chapter="outils">
      <div class="container">
        <app-chapter-head [index]="t.index" [label]="t.label" headingId="outils-title">
          {{ t.title }}
        </app-chapter-head>

        <ul class="tb__grid" appReveal [revealStagger]="true">
          @for (g of t.groups; track g.title) {
            <li class="tb__tile">
              <svg class="tb__icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
                @switch (g.icon) {
                  @case ('wrench') {
                    <path d="M42 8 A14 14 0 0 0 30 28 L10 48 A6 6 0 0 0 18 56 L38 36 A14 14 0 0 0 56 22 L47 28 L39 25 L36 17 Z" />
                  }
                  @case ('brush') {
                    <path d="M30 34 L50 10 Q54 6 57 9 Q60 12 56 16 L36 38" />
                    <path d="M30 34 L36 38 Q38 44 32 48 Q24 54 10 56 Q14 46 18 40 Q22 34 30 34 Z" />
                  }
                  @case ('beaker') {
                    <path class="o" d="M17 44 H47 L52 54 Q53 58 49 58 H15 Q11 58 12 54 Z" />
                    <path d="M22 8 H42 M26 8 V26 L12 54 Q10 58 14 58 H50 Q54 58 52 54 L38 26 V8" />
                  }
                  @case ('cylinder') {
                    <ellipse cx="32" cy="14" rx="20" ry="6" />
                    <path d="M12 14 V50 A20 6 0 0 0 52 50 V14 M12 26 A20 6 0 0 0 52 26 M12 38 A20 6 0 0 0 52 38" />
                  }
                  @case ('gear') {
                    <circle cx="32" cy="32" r="9" />
                    <path [attr.d]="gear" />
                  }
                }
              </svg>
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
      padding: 1.25rem;
      border: 1px solid rgba(26, 26, 26, 0.22);
      border-radius: 12px;
      background: rgba(233, 232, 229, 0.82);
    }

    .tb__icon {
      width: 48px;
      height: 48px;

      path,
      circle,
      ellipse {
        fill: none;
        stroke: var(--stroke);
        stroke-width: 1.5;
        stroke-linecap: round;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
      }

      .o {
        fill: var(--accent);
        stroke: none;
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

  /** Couronne dentée (8 dents) de l'icône engrenage. */
  protected readonly gear = (() => {
    const pts: string[] = [];
    const teeth = 8;
    for (let i = 0; i < teeth * 2; i++) {
      const a0 = (i / (teeth * 2)) * Math.PI * 2;
      const a1 = ((i + 1) / (teeth * 2)) * Math.PI * 2;
      const r = i % 2 === 0 ? 24 : 18;
      const p = (a: number) => `${(32 + Math.cos(a) * r).toFixed(1)} ${(32 + Math.sin(a) * r).toFixed(1)}`;
      pts.push(`${i === 0 ? 'M' : 'L'}${p(a0)} L${p(a1)}`);
    }
    return pts.join(' ') + ' Z';
  })();
}
