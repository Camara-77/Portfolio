import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { ChapterHead } from './chapter-head';
import { Scene } from '../../layout/stage/scene';
import { RevealDirective } from '../../core/directives/reveal.directive';

/**
 * Chapitre 1 · Parcours (biologie, 2021 – 2024).
 * Un seul écran court : la licence et la devise, rien de plus.
 * Le décor se limite à une petite double hélice qui devient du code.
 */
@Component({
  selector: 'app-chapter-biology',
  imports: [ChapterHead, Scene, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section [id]="c.id" class="chapter chapter--short" aria-labelledby="biologie-title" data-chapter="biologie">
      <div class="container chapter__grid">
        <div class="chapter__text">
          <app-chapter-head [index]="c.index" [label]="c.label" [period]="c.period" headingId="biologie-title" [compact]="true" [title]="c.title" [outline]="c.outline" />

          <p class="lead">{{ c.summary }}</p>
          <p class="chapter__motto">{{ c.motto }}</p>
        </div>
        <app-scene class="chapter__visual" name="bio" [crop]="true" appReveal />
      </div>
    </section>
  `,
  styles: `
    .chapter--short .chapter__text {
      gap: clamp(1.25rem, 2.5vw, 1.75rem);
    }
  `,
})
export class ChapterBiology {
  protected readonly c = PORTFOLIO.biology;
}
