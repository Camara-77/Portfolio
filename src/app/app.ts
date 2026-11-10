import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';
import { PORTFOLIO } from './data/portfolio.data';
import { ScrollService } from './core/services/scroll.service';
import { AmbientBackground } from './layout/ambient-background/ambient-background';
import { Intro } from './layout/intro/intro';
import { Navbar } from './layout/navbar/navbar';
import { Footer } from './layout/footer/footer';
import { Hero } from './sections/hero/hero';
import { About } from './sections/about/about';
import { Ayyou } from './sections/ayyou/ayyou';
import { Projects } from './sections/projects/projects';
import { Skills } from './sections/skills/skills';
import { Timeline } from './sections/timeline/timeline';
import { SectionTitle } from './shared/section-title/section-title';

@Component({
  selector: 'app-root',
  imports: [Intro, AmbientBackground, Navbar, Footer, Hero, About, Ayyou, Projects, Skills, Timeline, SectionTitle],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // Section temporaire (06) : remplacée en phase 5
  protected readonly sections = PORTFOLIO.nav
    .map((link, i) => ({ ...link, index: String(i + 1).padStart(2, '0') }))
    .filter((s) => s.id === 'contact');

  constructor() {
    const scroll = inject(ScrollService);
    afterNextRender(() => scroll.observeSections(PORTFOLIO.nav.map((l) => l.id)));
  }
}
