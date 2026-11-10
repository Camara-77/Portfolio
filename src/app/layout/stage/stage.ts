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
import { CODE_LINES, DNA_STRANDS, MAP, NET_EDGES, SceneName, VIEWBOX } from './scene-paths';

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
const FOG_OF: Record<string, 'split' | 'full'> = {
  biologie: 'split',
  code: 'split',
  projets: 'full',
  outils: 'full',
  contact: 'split',
};

/**
 * Décor d'arrière-plan (desktop) : les scènes superposées dans le même
 * repère. L'ADN se transforme en lignes de code au défilement ; aucun décor
 * derrière les cadres du chapitre Projets ; horizon pour la fin.
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
        <path class="m m1" [attr.d]="dna" />
        <path class="m m2" [attr.d]="net" />
        <path class="m m3" [attr.d]="map" />
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
  protected readonly dna = DNA_STRANDS;
  protected readonly net = NET_EDGES;
  protected readonly map = MAP;

  /** Décor affiché sans animation (mode « mouvement réduit »). */
  protected readonly staticScene = computed(() => SCENE_OF[this.scroll.activeSection() ?? ''] ?? null);
  protected readonly fog = computed(() => FOG_OF[this.scroll.activeSection() ?? ''] ?? 'split');

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

      /** Transition entre deux chapitres, avec un tracé qui se transforme. */
      const transition = (
        id: string,
        from: SceneName,
        to: SceneName,
        morph: SVGPathElement,
        fromShape: string,
        fromPart: Element,
        toShape: string,
        toPart: Element,
      ) => {
        const [a, b] = range(id, 0.92, 0.22);
        const d = b - a;
        swap(fromPart, 1, 0, a);
        swap(morph, 0, 1, a);
        fade(layer(from), 1, 0, a, d * 0.45);
        tl!.fromTo(morph, { morphSVG: fromShape }, { morphSVG: toShape, duration: d, ease: 'power1.inOut' }, a);
        fade(layer(to), 0, 1, a + d * 0.55, d * 0.45);
        swap(toPart, 0, 1, b - 0.01);
        swap(morph, 1, 0, b - 0.01);
      };

      // Les lignes de code arrivent par morphing (ADN → code)
      const codeLines = part('code', '.s-code');
      gsap.set(codeLines, { autoAlpha: 0 });

      const [bi0, bi1] = range('biologie', 0.8, 0.3);
      fade(layer('bio'), 0, 1, bi0, bi1 - bi0);
      transition('code', 'bio', 'code', m1, DNA_STRANDS, part('bio', '.s-dna'), CODE_LINES, codeLines);

      // Projets : aucun décor derrière les cadres
      const [pj0, pj1] = range('projets', 0.6, 0.1);
      fade(layer('code'), 1, 0, pj0, pj1 - pj0);

      // Boîte à outils et contact : décor apaisé, une seule ligne d'horizon
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
