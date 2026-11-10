import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { ChapterHead } from './chapter-head';
import { Scene } from '../../layout/stage/scene';
import { RevealDirective } from '../../core/directives/reveal.directive';
import { Milestones } from './milestones';
import { ProjectList } from './project-list';

/** Chapitre 2 · Code et IA (2024 – 2026). */
@Component({
  selector: 'app-chapter-code',
  imports: [ChapterHead, Milestones, ProjectList, Scene, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section [id]="c.id" class="chapter" aria-labelledby="code-title" data-chapter="code">
      <div class="container chapter__grid">
        <div class="chapter__text">
          <app-chapter-head [index]="c.index" [label]="c.label" [period]="c.period" headingId="code-title">
            {{ c.title }}
          </app-chapter-head>

          <div class="chapter__paragraphs">
            @for (p of c.paragraphs; track $index) {
              <p class="lead">{{ p }}</p>
            }
          </div>

          <div>
            <h3 class="chapter__block-title">Étapes</h3>
            <app-milestones [items]="c.milestones" />
          </div>

          <div>
            <h3 class="chapter__block-title">{{ c.projectsTitle }}</h3>
            <app-project-list [projects]="c.projects" />
          </div>
        </div>
        <app-scene class="chapter__visual" name="code" [crop]="true" appReveal />
      </div>
    </section>
  `,
})
export class ChapterCode {
  protected readonly c = PORTFOLIO.code;
}
