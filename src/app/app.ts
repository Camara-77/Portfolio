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
import { SectionTitle } from './shared/section-title/section-title';

@Component({
  selector: 'app-root',
  imports: [Intro, AmbientBackground, Navbar, Footer, Hero, About, Ayyou, SectionTitle],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // Sections temporaires (03 à 06) : remplacées aux phases 4 et 5
  protected readonly sections = PORTFOLIO.nav
    .map((link, i) => ({ ...link, index: String(i + 1).padStart(2, '0') }))
    .filter((s) => !['about', 'ayyou'].includes(s.id));

  constructor() {
    const scroll = inject(ScrollService);
    afterNextRender(() => scroll.observeSections(PORTFOLIO.nav.map((l) => l.id)));
  }
}
