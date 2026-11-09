import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';
import { PORTFOLIO } from './data/portfolio.data';
import { ScrollService } from './core/services/scroll.service';
import { AmbientBackground } from './layout/ambient-background/ambient-background';
import { Navbar } from './layout/navbar/navbar';
import { Footer } from './layout/footer/footer';
import { GlassCard } from './shared/glass-card/glass-card';
import { SectionTitle } from './shared/section-title/section-title';
import { Badge } from './shared/badge/badge';
import { Button } from './shared/button/button';
import { Icon } from './shared/icon/icon';

@Component({
  selector: 'app-root',
  imports: [AmbientBackground, Navbar, Footer, GlassCard, SectionTitle, Badge, Button, Icon],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly data = PORTFOLIO;

  // Sections temporaires (phase 1) — remplacées par les vrais composants
  // dans les phases suivantes.
  protected readonly placeholders = PORTFOLIO.nav.map((link, i) => ({
    ...link,
    index: String(i + 1).padStart(2, '0'),
  }));

  constructor() {
    const scroll = inject(ScrollService);
    afterNextRender(() => scroll.observeSections(PORTFOLIO.nav.map((l) => l.id)));
  }
}
