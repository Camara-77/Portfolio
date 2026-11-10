import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';
import { PORTFOLIO } from './data/portfolio.data';
import { ScrollService } from './core/services/scroll.service';
import { ChapterNav } from './layout/chapter-nav/chapter-nav';
import { Footer } from './layout/footer/footer';
import { Opening } from './sections/opening/opening';
import { ChapterBiology } from './sections/chapters/chapter-biology';
import { ChapterCode } from './sections/chapters/chapter-code';
import { ChapterAyyou } from './sections/chapters/chapter-ayyou';
import { Epilogue } from './sections/chapters/epilogue';

@Component({
  selector: 'app-root',
  imports: [ChapterNav, Footer, Opening, ChapterBiology, ChapterCode, ChapterAyyou, Epilogue],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  constructor() {
    const scroll = inject(ScrollService);
    afterNextRender(() => scroll.observeSections(PORTFOLIO.nav.map((n) => n.id)));
  }
}
