import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { gsap } from '../../core/gsap';
import { IntroService } from '../../core/services/intro.service';
import { PORTFOLIO } from '../../data/portfolio.data';

/**
 * Écran d'intro (≤ 1,5 s) : compteur 0 → 100 puis rideau noir qui s'ouvre.
 * Une seule fois par visite ; absent si prefers-reduced-motion.
 */
@Component({
  selector: 'app-intro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div class="intro" #root aria-hidden="true">
        <div class="intro__panel intro__panel--top"></div>
        <div class="intro__panel intro__panel--bottom"></div>
        <div class="intro__content" #content>
          <span class="intro__name">{{ initials }}</span>
          <span class="intro__count"><span #count>000</span><span class="intro__pct">%</span></span>
          <span class="intro__bar"><span class="intro__bar-fill" #bar></span></span>
        </div>
      </div>
    }
  `,
  styles: `
    @use 'tokens' as *;

    .intro {
      position: fixed;
      inset: 0;
      z-index: 2000;
      pointer-events: all;
    }

    .intro__panel {
      position: absolute;
      left: 0;
      right: 0;
      height: 50.5%;
      background: var(--bg);
    }
    .intro__panel--top {
      top: 0;
    }
    .intro__panel--bottom {
      bottom: 0;
    }

    .intro__content {
      position: absolute;
      inset: auto var(--gutter) clamp(1.5rem, 5vh, 3rem);
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: end;
      gap: 1rem;
    }

    .intro__name {
      @include mono-label(0.75rem);
      color: var(--text-2);
    }

    .intro__count {
      font-family: var(--font-mono);
      font-size: clamp(3rem, 12vw, 9rem);
      font-weight: 400;
      line-height: 0.8;
      letter-spacing: -0.04em;
      color: var(--text);
      font-variant-numeric: tabular-nums;
    }

    .intro__pct {
      font-size: 0.35em;
      color: var(--text-3);
      margin-left: 0.1em;
    }

    .intro__bar {
      grid-column: 1 / -1;
      height: 1px;
      background: var(--line);
      overflow: hidden;
    }

    .intro__bar-fill {
      display: block;
      height: 100%;
      background: var(--text);
      transform-origin: left;
      transform: scaleX(0);
    }
  `,
})
export class Intro {
  private readonly intro = inject(IntroService);
  private readonly zone = inject(NgZone);
  private readonly document = inject(DOCUMENT);

  protected readonly initials = PORTFOLIO.identity.initials;
  protected readonly visible = signal(this.intro.shouldPlay);

  private readonly root = viewChild<ElementRef<HTMLElement>>('root');
  private readonly content = viewChild<ElementRef<HTMLElement>>('content');
  private readonly count = viewChild<ElementRef<HTMLElement>>('count');
  private readonly bar = viewChild<ElementRef<HTMLElement>>('bar');

  constructor() {
    let tl: gsap.core.Timeline | undefined;

    afterNextRender(() => {
      if (!this.visible()) return;
      const html = this.document.documentElement;
      html.style.overflow = 'hidden';

      this.zone.runOutsideAngular(() => {
        const root = this.root()!.nativeElement;
        const countEl = this.count()!.nativeElement;
        const state = { v: 0 };

        tl = gsap.timeline({
          onComplete: () => {
            html.style.overflow = '';
            this.visible.set(false);
          },
        });

        tl.to(state, {
          v: 100,
          duration: 0.8,
          ease: 'power2.inOut',
          onUpdate: () => (countEl.textContent = String(Math.round(state.v)).padStart(3, '0')),
        })
          .to(this.bar()!.nativeElement, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, 0)
          .to(this.content()!.nativeElement, { autoAlpha: 0, y: -12, duration: 0.15, ease: 'power2.in' })
          .add(() => this.intro.finish())
          .to(root.querySelector('.intro__panel--top'), { yPercent: -101, duration: 0.5, ease: 'expo.inOut' }, '<0.05')
          .to(root.querySelector('.intro__panel--bottom'), { yPercent: 101, duration: 0.5, ease: 'expo.inOut' }, '<');
      });
    });

    inject(DestroyRef).onDestroy(() => {
      tl?.kill();
      this.document.documentElement.style.overflow = '';
    });
  }
}
