import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { SectionTitle } from '../../shared/section-title/section-title';
import { GlassCard } from '../../shared/glass-card/glass-card';
import { RevealDirective } from '../../core/directives/reveal.directive';
import { CountUpDirective } from '../../core/directives/count-up.directive';
import { ScrubWordsDirective } from '../../core/directives/scrub-words.directive';

@Component({
  selector: 'app-about',
  imports: [SectionTitle, GlassCard, RevealDirective, CountUpDirective, ScrubWordsDirective],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  protected readonly about = PORTFOLIO.about;
  protected readonly languages = PORTFOLIO.identity.languages;
  /** Première phrase en grand, les suivantes en texte courant. */
  protected readonly statement = PORTFOLIO.about.paragraphs[0];
  protected readonly body = PORTFOLIO.about.paragraphs.slice(1);
}
