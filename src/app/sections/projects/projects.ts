import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { gsap, ScrollTrigger } from '../../core/gsap';
import { ChapterHead } from '../chapters/chapter-head';
import { AwardGallery } from '../chapters/award-gallery/award-gallery';
import { ProjectArt } from './project-art';
import { Icon } from '../../shared/icon/icon';

/**
 * Chapitre « Projets ».
 * Desktop : la section est épinglée et les cadres défilent horizontalement
 * au rythme du scroll (un cadre par écran) ; l'illustration se dessine
 * quand le cadre arrive au centre.
 * Mobile et prefers-reduced-motion : cadres empilés, sans épinglage.
 */
@Component({
  selector: 'app-projects',
  imports: [ChapterHead, AwardGallery, ProjectArt, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects {
  protected readonly c = PORTFOLIO.projects;
  protected readonly award = PORTFOLIO.ayyou.award;
  protected readonly total = PORTFOLIO.projects.frames.length;

  private readonly section = viewChild.required<ElementRef<HTMLElement>>('section');
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly count = viewChild.required<ElementRef<HTMLElement>>('count');
  private readonly bar = viewChild.required<ElementRef<HTMLElement>>('bar');

  constructor() {
    const zone = inject(NgZone);
    let mm: gsap.MatchMedia | undefined;

    afterNextRender(() => {
      zone.runOutsideAngular(() => {
        mm = gsap.matchMedia();
        const section = this.section().nativeElement;
        const track = this.track().nativeElement;
        const slides = Array.from(track.querySelectorAll<HTMLElement>('.pj__slide'));

        // Desktop : épinglage + défilement horizontal
        mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
          section.classList.add('is-pinned');
          slides.forEach((s) => this.prepareDraw(s));

          const distance = () => track.scrollWidth - window.innerWidth;
          const tween = gsap.to(track, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              pin: true,
              // Épinglée juste sous la barre de navigation
              start: () => `top top+=${this.navHeight()}`,
              end: () => `+=${distance()}`,
              scrub: 0.6,
              invalidateOnRefresh: true,
              onUpdate: (self) => this.setProgress(self.progress),
            },
          });

          // Dessin du premier cadre à l'arrivée dans la section, des suivants au centre
          ScrollTrigger.create({
            trigger: section,
            start: 'top 60%',
            once: true,
            onEnter: () => this.draw(slides[0]),
          });
          slides.slice(1).forEach((slide) =>
            ScrollTrigger.create({
              trigger: slide,
              containerAnimation: tween,
              start: 'left 60%',
              once: true,
              onEnter: () => this.draw(slide),
            }),
          );

          return () => section.classList.remove('is-pinned');
        });

        // Mobile (animations autorisées) : cadres empilés, dessin à l'apparition
        mm.add('(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)', () => {
          slides.forEach((slide) => {
            this.prepareDraw(slide);
            ScrollTrigger.create({ trigger: slide, start: 'top 75%', once: true, onEnter: () => this.draw(slide) });
          });
        });
      });
    });

    inject(DestroyRef).onDestroy(() => mm?.revert());
  }

  private navHeight(): number {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
  }

  protected pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  private setProgress(p: number): void {
    const i = Math.min(this.total, Math.round(p * (this.total - 1)) + 1);
    this.count().nativeElement.textContent = `${i} / ${this.total}`;
    this.bar().nativeElement.style.transform = `scaleX(${(i / this.total).toFixed(4)})`;
  }

  /** Masque les traits avant leur dessin (stroke-dasharray). */
  private prepareDraw(slide: HTMLElement): void {
    slide.querySelectorAll<SVGGeometryElement>('.d').forEach((el) => {
      if (el.classList.contains('dots') || el.classList.contains('dash')) {
        gsap.set(el, { opacity: 0 });
        return;
      }
      const len = el.getTotalLength();
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
    });
    const accents = slide.querySelectorAll('.o, .o-line, .paper');
    if (accents.length) gsap.set(accents, { opacity: 0 });
  }

  private draw(slide: HTMLElement): void {
    const lines = Array.from(slide.querySelectorAll<SVGGeometryElement>('.d'));
    const solid = lines.filter((el) => !el.classList.contains('dots') && !el.classList.contains('dash'));
    const dashed = lines.filter((el) => !solid.includes(el));
    const accents = slide.querySelectorAll('.o, .o-line, .paper');
    const tl = gsap.timeline();
    tl.to(solid, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: 0.05 });
    if (dashed.length) tl.to(dashed, { opacity: 1, duration: 0.6 }, '-=0.6');
    if (accents.length) tl.to(accents, { opacity: 1, duration: 0.5 }, '-=0.3');
  }
}
