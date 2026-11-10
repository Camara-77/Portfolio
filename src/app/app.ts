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
import { Contact } from './sections/contact/contact';
import { Cursor } from './layout/cursor/cursor';
import { ScrollProgress } from './layout/scroll-progress/scroll-progress';

@Component({
  selector: 'app-root',
  imports: [
    Intro,
    ScrollProgress,
    Cursor,
    AmbientBackground,
    Navbar,
    Footer,
    Hero,
    About,
    Ayyou,
    Projects,
    Skills,
    Timeline,
    Contact,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  constructor() {
    const scroll = inject(ScrollService);
    afterNextRender(() => scroll.observeSections(PORTFOLIO.nav.map((l) => l.id)));
  }
}
