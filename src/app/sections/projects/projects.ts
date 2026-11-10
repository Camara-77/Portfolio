import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { PORTFOLIO, ProjectCategory } from '../../data/portfolio.data';
import { SectionTitle } from '../../shared/section-title/section-title';
import { GlassCard } from '../../shared/glass-card/glass-card';
import { Badge } from '../../shared/badge/badge';
import { Icon } from '../../shared/icon/icon';
import { RevealDirective } from '../../core/directives/reveal.directive';
import { TiltDirective } from '../../core/directives/tilt.directive';

type Filter = 'Tous' | ProjectCategory;

@Component({
  selector: 'app-projects',
  imports: [SectionTitle, GlassCard, Badge, Icon, RevealDirective, TiltDirective],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Projects {
  protected readonly filters = PORTFOLIO.projectFilters;
  protected readonly projects = PORTFOLIO.projects;
  protected readonly active = signal<Filter>('Tous');

  protected readonly visible = computed(() => {
    const f = this.active();
    return f === 'Tous' ? this.projects : this.projects.filter((p) => p.category === f);
  });

  protected count(f: Filter): number {
    return f === 'Tous' ? this.projects.length : this.projects.filter((p) => p.category === f).length;
  }

  protected pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  /** Numéro fixe du projet dans la liste complète. */
  protected number(name: string): string {
    return this.pad(this.projects.findIndex((p) => p.name === name) + 1);
  }
}
