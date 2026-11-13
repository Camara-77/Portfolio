import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  computed,
  inject,
} from '@angular/core';
import { gsap } from '../../core/gsap';
import { ScrollService } from '../../core/services/scroll.service';
import { Scene } from './scene';
import {
  CODE_ACCENT_LINE,
  CODE_LINE_PATHS,
  CODE_TEXT,
  DNA_RUNGS,
  DNA_RUNGS_ACCENT,
  DNA_STRANDS,
  EDITOR,
  SceneName,
  VIEWBOX,
} from './scene-paths';

const SCENE_OF: Record<string, SceneName> = {
  biologie: 'bio',
  code: 'code',
  outils: 'horizon',
  contact: 'horizon',
};

/**
 * Voile par chapitre : « split » = dessins à ~15 % derrière la colonne de
 * texte (gauche) et à 100 % à droite ; « full » = ~15 % partout (le contenu
 * occupe toute la largeur).
 */
const FOG_OF: Record<string, 'split' | 'full' | 'none'> = {
  biologie: 'split',
  code: 'split',
  projets: 'none', // aucun décor derrière les cadres
  outils: 'full',
  contact: 'split',
};

/**
 * Décor d'arrière-plan (desktop) : les scènes superposées dans le même
 * repère. La petite hélice d'ADN se transforme en lignes de code au
 * défilement ; Code et IA : éditeur, terminal, architecture, robot et réseau
 * de neurones ; Projets : fond de code propre à la section ; Boîte à outils
 * et Contact : une ligne de terminal en guise d'horizon.
 * Sans animation (prefers-reduced-motion) : le décor du chapitre en cours
 * s'affiche directement, sans morphing.
 */
@Component({
  selector: 'app-stage',
  imports: [Scene],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[attr.data-static]': 'staticScene()',
    '[attr.data-fog]': 'fog()',
  },
  template: `
    <div class="stage__frame">
      @for (s of scenes; track s) {
        <app-scene class="stage__layer" [name]="s" />
      }
      <svg class="stage__morph" [attr.viewBox]="viewBox" preserveAspectRatio="xMaxYMid meet">
        <path class="m m1" [attr.d]="strands" />
        <path class="m m2" [attr.d]="rungs" />
        <path class="m m3" [attr.d]="accent" />
      </svg>
      <div class="stage__fog stage__fog--split"></div>
      <div class="stage__fog stage__fog--full"></div>
    </div>
  `,
  styleUrl: './stage.scss',
})
export class Stage {
  private readonly scroll = inject(ScrollService);

  protected readonly scenes: SceneName[] = ['bio', 'code', 'ayyou', 'horizon'];
  protected readonly viewBox = VIEWBOX;
  protected readonly strands = DNA_STRANDS;
  protected readonly rungs = DNA_RUNGS;
  protected readonly accent = DNA_RUNGS_ACCENT;

  /** Décor affiché sans animation (mode « mouvement réduit »). */
  protected readonly staticScene = computed(() => SCENE_OF[this.scroll.activeSection() ?? ''] ?? null);
  /** Pas de voile sur l'ouverture ni la section voix (aucun décor visible). */
  protected readonly fog = computed(() => FOG_OF[this.scroll.activeSection() ?? ''] ?? 'none');

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    let mm: gsap.MatchMedia | undefined;

    afterNextRender(() => {
      zone.runOutsideAngular(() => {
        mm = gsap.matchMedia();
        mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
          host.classList.add('is-animated');
          const cleanup = this.build(host);
          return () => {
            cleanup();
            host.classList.remove('is-animated');
          };
        });
      });
    });

    inject(DestroyRef).onDestroy(() => mm?.revert());
  }

  /**
   * Une seule timeline pilotée par le défilement de toute la page : chaque
   * propriété n'a qu'un seul « pilote », l'état est donc toujours cohérent,
   * même après un saut direct (navigation, retour en arrière).
   * Le temps de la timeline = la position de défilement en pixels.
   */
  private build(host: HTMLElement): () => void {
    const layer = (s: SceneName) => host.querySelector<HTMLElement>(`.stage__layer[data-scene="${s}"]`)!;
    const part = (s: SceneName, sel: string) => layer(s).querySelector(sel)!;
    const [m1, m2, m3] = ['.m1', '.m2', '.m3'].map((c) => host.querySelector<SVGPathElement>(c)!);
    let tl: gsap.core.Timeline | undefined;

    const make = () => {
      const progress = tl?.scrollTrigger?.progress ?? 0;
      tl?.scrollTrigger?.kill();
      tl?.kill();

      const vh = window.innerHeight;
      const max = Math.max(1, document.documentElement.scrollHeight - vh);
      const top = (id: string) => (document.getElementById(id)?.getBoundingClientRect().top ?? 0) + window.scrollY;
      const range = (id: string, a: number, b: number) => {
        const s0 = Math.max(0, top(id) - a * vh);
        return [s0, Math.max(s0 + 1, top(id) - b * vh)] as const;
      };

      // État de départ : aucun décor sur l'ouverture
      gsap.set(this.scenes.map(layer), { autoAlpha: 0 });
      gsap.set([m1, m2, m3], { autoAlpha: 0 });

      tl = gsap.timeline({
        defaults: { ease: 'none', immediateRender: false },
        scrollTrigger: { start: 0, end: max, scrub: 0.8 },
      });
      const fade = (el: Element, from: number, to: number, at: number, dur: number) =>
        tl!.fromTo(el, { autoAlpha: from }, { autoAlpha: to, duration: dur }, at);
      const swap = (el: Element, from: number, to: number, at: number) =>
        tl!.fromTo(el, { autoAlpha: from }, { autoAlpha: to, duration: 0.01 }, at);

      // Cibles du morphing : cadre de l'éditeur et traits des lignes de code
      const codeLines = part('code', '.s-code');
      const editor = part('code', '.s-editor');
      gsap.set([codeLines, editor], { autoAlpha: 0 });

      // Parcours (chapitre court) : l'hélice apparaît une fois la section
      // voix sortie de l'écran, puis se transforme progressivement en code
      // pendant que le chapitre Code et IA arrive : les brins deviennent la
      // fenêtre de l'éditeur, les barreaux deviennent les lignes de code.
      const [a, b] = range('code', 0.8, 0.25);
      const d = b - a;
      const voice = document.querySelector('.op-voice');
      const voiceGone = voice ? voice.getBoundingClientRect().bottom + window.scrollY - 64 : 0;
      const [b0] = range('biologie', 0.85, 0.85);
      const bi1 = Math.max(1, a - vh * 0.1);
      const bi0 = Math.max(0, Math.min(Math.max(b0, voiceGone), bi1 - vh * 0.12));
      fade(layer('bio'), 0, 1, bi0, bi1 - bi0);

      const ink = 'rgba(26, 26, 26, 0.6)';
      const soft = getComputedStyle(document.documentElement).getPropertyValue('--stroke-soft').trim() || '#a8a6a1';
      const stroke = getComputedStyle(document.documentElement).getPropertyValue('--stroke').trim() || '#3a3a3a';
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ff6a1a';
      const plain = CODE_LINE_PATHS.filter((_, i) => i !== CODE_ACCENT_LINE).join(' ');
      const morphs: [SVGPathElement, string, string, string, string][] = [
        [m1, DNA_STRANDS, EDITOR.frame, ink, stroke],
        [m2, DNA_RUNGS, plain, ink, soft],
        [m3, DNA_RUNGS_ACCENT, CODE_LINE_PATHS[CODE_ACCENT_LINE], accent, soft],
      ];
      swap(part('bio', '.s-dna'), 1, 0, a);
      fade(layer('bio'), 1, 0, a, d * 0.2);
      for (const [el, from, to, c0, c1] of morphs) {
        swap(el, 0, 1, a);
        tl.fromTo(
          el,
          { morphSVG: from, stroke: c0 },
          { morphSVG: to, stroke: c1, duration: d, ease: 'power1.inOut' },
          a,
        );
        swap(el, 1, 0, b - 0.01);
      }
      fade(layer('code'), 0, 1, a + d * 0.55, d * 0.45);
      swap(editor, 0, 1, b - 0.01);
      swap(codeLines, 0, 1, b - 0.01);

      // Les lignes de Python s'écrivent au défilement (machine à écrire)
      const typed = Array.from(layer('code').querySelectorAll<SVGTextElement>('.s-type'));
      const totalChars = CODE_TEXT.reduce((n, l) => n + l.length, 0);
      const type = (count: number) => {
        let left = Math.round(count);
        typed.forEach((el, i) => {
          const line = CODE_TEXT[i];
          const shown = Math.max(0, Math.min(line.length, left));
          const typing = shown > 0 && shown < line.length;
          el.textContent = line.slice(0, shown) + (typing ? '▌' : '');
          left -= line.length;
        });
      };
      type(0);
      const [ty0] = range('code', 0.22, 0.22);
      const [, pjIn] = range('projets', 0.35, 0.35);
      const ty1 = Math.max(ty0 + vh * 0.7, pjIn);
      const typer = { n: 0 };
      fade(codeLines, 1, 0, ty0, (ty1 - ty0) * 0.15);
      tl.fromTo(
        typer,
        { n: 0 },
        { n: totalChars, duration: Math.max(1, ty1 - ty0), ease: 'none', onUpdate: () => type(typer.n) },
        ty0,
      );

      // Projets : aucun décor derrière les cadres
      const [pj0, pj1] = range('projets', 0.6, 0.1);
      fade(layer('code'), 1, 0, pj0, pj1 - pj0);

      // Boîte à outils et contact : décor apaisé, une ligne de terminal
      const [ou0, ou1] = range('outils', 0.7, 0.2);
      fade(layer('horizon'), 0, 1, ou0, ou1 - ou0);
      tl.set({}, {}, max); // la timeline couvre toute la page

      tl.scrollTrigger?.update();
      if (progress) tl.progress(tl.scrollTrigger?.progress ?? progress);
    };

    make();

    // Recalcul si la hauteur de la page change (images, polices, redimensionnement)
    let timer = 0;
    const schedule = () => {
      clearTimeout(timer);
      timer = window.setTimeout(make, 150);
    };
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    window.addEventListener('resize', schedule);

    return () => {
      clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener('resize', schedule);
      tl?.scrollTrigger?.kill();
      tl?.kill();
    };
  }
}
