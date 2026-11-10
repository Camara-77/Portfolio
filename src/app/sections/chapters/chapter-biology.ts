import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { ChapterHead } from './chapter-head';
import { Scene } from '../../layout/stage/scene';
import { RevealDirective } from '../../core/directives/reveal.directive';
import { Milestones } from './milestones';

/** Chapitre 1 · Biologie (2021 – 2024). */
@Component({
  selector: 'app-chapter-biology',
  imports: [ChapterHead, Milestones, Scene, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section [id]="c.id" class="chapter" aria-labelledby="biologie-title" data-chapter="biologie">
      <div class="container chapter__grid">
        <div class="chapter__text">
          <app-chapter-head [index]="c.index" [label]="c.label" [period]="c.period" headingId="biologie-title">
            {{ c.title }}
          </app-chapter-head>

          <p class="lead">{{ c.summary }}</p>
          <p class="chapter__motto">{{ c.motto }}</p>

          <div>
            <h3 class="chapter__block-title">Étapes</h3>
            <app-milestones [items]="c.milestones" />
          </div>
        </div>
        <app-scene class="chapter__visual" name="bio" [crop]="true" appReveal />
      </div>
    </section>
  `,
})
export class ChapterBiology {
  protected readonly c = PORTFOLIO.biology;
}
