import {
  DestroyRef,
  Directive,
  ElementRef,
  NgZone,
  afterNextRender,
  effect,
  inject,
  input,
} from '@angular/core';
import { gsap, ScrollTrigger, SplitText, SCRAMBLE_CHARS } from '../gsap';
import { IntroService } from '../services/intro.service';
import { MotionService } from '../services/motion.service';

/**
 * Titre animé :
 *  - apparition lettre par lettre avec un masque qui monte
 *  - (option) brouillage : chaque lettre fait défiler des glyphes avant de se fixer
 *  - au survol, chaque lettre s'incline légèrement (styles globaux .tr-char)
 *
 *   <h1 appTextReveal trigger="intro" [scramble]="true">…</h1>
 *   <h2 appTextReveal trigger="scroll">…</h2>
 */
@Directive({
  selector: '[appTextReveal]',
  host: { class: 'tr' },
})
export class TextRevealDirective {
  /** `intro` : après l'écran d'intro ; `scroll` : à l'entrée dans l'écran. */
  readonly trigger = input<'intro' | 'scroll'>('scroll');
  readonly scramble = input(false);
  readonly delay = input(0);

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private readonly intro = inject(IntroService);
  private readonly motion = inject(MotionService);

  private split?: SplitText;
  private tween?: gsap.core.Timeline;
  private st?: ScrollTrigger;
  private ready = false;
  private played = false;

  constructor() {
    afterNextRender(() => {
      if (this.motion.reducedMotion()) {
        this.el.classList.add('is-revealed');
        return;
      }
      this.zone.runOutsideAngular(() => this.prepare());
    });

    // Déclenchement après l'intro
    effect(() => {
      if (this.trigger() === 'intro' && this.intro.done() && this.ready) this.play();
    });

    inject(DestroyRef).onDestroy(() => {
      this.tween?.kill();
      this.st?.kill();
      this.split?.revert();
    });
  }

  private async prepare(): Promise<void> {
    // Découper après le chargement des polices, sinon les largeurs sont fausses
    await document.fonts.ready;

    this.split = SplitText.create(this.el, {
      type: 'words,chars',
      mask: 'chars',
      charsClass: 'tr-char',
      wordsClass: 'tr-word',
      aria: 'auto',
    });
    gsap.set(this.split.chars, { yPercent: 115 });
    this.el.classList.add('is-split');
    this.ready = true;

    if (this.trigger() === 'scroll') {
      this.st = ScrollTrigger.create({
        trigger: this.el,
        start: 'top 88%',
        once: true,
        onEnter: () => this.play(),
      });
    } else if (this.intro.done()) {
      this.play();
    }
  }

  private play(): void {
    if (this.played || !this.split) return;
    this.played = true;

    this.zone.runOutsideAngular(() => {
      const chars = this.split!.chars as HTMLElement[];
      const stagger = Math.min(0.045, 0.7 / chars.length);
      const tl = gsap.timeline({
        delay: this.delay(),
        onComplete: () => this.el.classList.add('is-revealed'),
      });

      tl.to(chars, { yPercent: 0, duration: 1.1, stagger });

      if (this.scramble()) {
        chars.forEach((c, i) => this.scrambleChar(tl, c, i * stagger));
      }
      this.tween = tl;
    });
  }

  /** Fait défiler des glyphes aléatoires dans une lettre avant de la fixer. */
  private scrambleChar(tl: gsap.core.Timeline, char: HTMLElement, at: number): void {
    const final = char.textContent ?? '';
    if (!final.trim()) return;

    // Largeur figée pendant le brouillage pour éviter que la ligne ne tremble
    const width = char.getBoundingClientRect().width;
    const state = { p: 0 };
    tl.to(
      state,
      {
        p: 1,
        duration: 0.6,
        ease: 'none',
        onStart: () => {
          char.style.display = 'inline-block';
          char.style.width = `${width}px`;
          char.style.textAlign = 'center';
        },
        onUpdate: () => {
          char.textContent =
            state.p < 0.85
              ? SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0]
              : final;
        },
        onComplete: () => {
          char.textContent = final;
          char.style.width = '';
          char.style.textAlign = '';
        },
      },
      at,
    );
  }
}
