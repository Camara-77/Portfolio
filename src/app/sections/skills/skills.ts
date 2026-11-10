import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { SectionTitle } from '../../shared/section-title/section-title';
import { GlassCard } from '../../shared/glass-card/glass-card';
import { Badge } from '../../shared/badge/badge';
import { RevealDirective } from '../../core/directives/reveal.directive';

@Component({
  selector: 'app-skills',
  imports: [SectionTitle, GlassCard, Badge, RevealDirective],
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Skills {
  protected readonly groups = PORTFOLIO.skills;
  protected readonly soft = PORTFOLIO.softSkills;
  protected readonly marquee = PORTFOLIO.marquee;

  protected pad(i: number): string {
    return String(i + 1).padStart(2, '0');
  }
}
