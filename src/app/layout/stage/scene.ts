import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import * as P from './scene-paths';

/**
 * Un décor au trait. `crop` : cadrage serré (dessin mobile) ;
 * sinon repère complet 1600 × 1000 (arrière-plan desktop).
 * Les éléments qui participent au morphing portent une classe
 * (s-dna, s-code, s-editor, s-map) pour être masqués pendant la transition.
 */
@Component({
  selector: 'app-scene',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[attr.data-scene]': 'name()' },
  template: `
    <svg
      class="scene"
      [attr.viewBox]="viewBox()"
      [attr.preserveAspectRatio]="crop() ? 'xMidYMid meet' : 'xMaxYMid meet'"
      focusable="false"
    >
      @switch (name()) {
        @case ('bio') {
          <g class="s-dna">
            <path class="s-dna-line" [attr.d]="p.DNA_STRANDS" />
            <path class="s-dna-line s-dna-rung" [attr.d]="p.DNA_RUNGS" />
            <path class="s-dna-accent" [attr.d]="p.DNA_RUNGS_ACCENT" />
          </g>
        }
        @case ('code') {
          <!-- Éditeur : vraies lignes de Python -->
          <g class="s-editor"><path class="s-line" [attr.d]="p.EDITOR.frame" /></g>
          @for (x of p.EDITOR.dots; track x) {
            <circle class="s-line s-thin" [attr.cx]="x" cy="169" r="5" />
          }
          <g class="s-code"><path class="s-soft s-code-lines" [attr.d]="p.CODE_LINES" /></g>
          @for (line of p.CODE_TEXT; track $index; let i = $index) {
            <text class="s-type" [attr.x]="p.CODE_X" [attr.y]="p.CODE_Y(i)" [attr.data-text]="line">{{ line }}</text>
          }
          <!-- Terminal : vraies commandes de lancement -->
          <path class="s-line" [attr.d]="p.TERMINAL.frame" />
          @for (x of p.TERMINAL.dots; track x) {
            <circle class="s-line s-thin" [attr.cx]="x" [attr.cy]="p.TERMINAL.dotsY" r="5" />
          }
          @for (cmd of p.TERMINAL.lines; track cmd; let i = $index) {
            <text class="s-term" [attr.x]="p.TERMINAL.x" [attr.y]="p.TERMINAL.y(i)"><tspan class="s-prompt">$ </tspan>{{ cmd }}</text>
          }
          <!-- Architecture : les requêtes API circulent (points orange) -->
          @for (b of p.ARCH.boxes; track b.label) {
            <path class="s-line s-paper" [attr.d]="b.d" />
            <text class="s-arch" [attr.x]="b.cx" [attr.y]="p.ARCH.textY">{{ b.label }}</text>
          }
          @for (l of p.ARCH.links; track l.x0; let i = $index) {
            <path class="s-line s-thin" [attr.d]="l.d" />
            <circle
              class="s-packet"
              [attr.cx]="l.x0 + 4"
              [attr.cy]="p.ARCH.y"
              r="4"
              [style.--travel.px]="p.ARCH.travel"
              [style.animation-delay.s]="i * 0.7"
            />
          }
          <!-- Réseau de neurones -->
          <path class="s-soft" [attr.d]="p.NET_EDGES" />
          @for (n of p.NET_NODES; track $index) {
            <circle class="s-line s-paper" [attr.cx]="n.cx" [attr.cy]="n.cy" [attr.r]="n.r" />
          }
          <!-- Robot (l'IA) qui écoute : onde orange depuis l'antenne -->
          <path class="s-accent-line s-waves" [attr.d]="p.ROBOT_WAVES" />
          <path class="s-line" [attr.d]="p.ROBOT.antenna" />
          <circle class="s-line s-paper" [attr.cx]="p.ROBOT.ball.cx" [attr.cy]="p.ROBOT.ball.cy" [attr.r]="p.ROBOT.ball.r" />
          <path class="s-line s-paper" [attr.d]="p.ROBOT.head" />
          <path class="s-line" [attr.d]="p.ROBOT.ears" />
          @for (e of p.ROBOT.eyes; track $index) {
            <circle class="s-line" [attr.cx]="e.cx" [attr.cy]="e.cy" [attr.r]="e.r" />
          }
          <path class="s-line" [attr.d]="p.ROBOT.smile" />
          <path class="s-line" [attr.d]="p.ROBOT.neck" />
          <path class="s-line s-paper" [attr.d]="p.ROBOT.body" />
          <path class="s-line s-thin" [attr.d]="p.ROBOT.panel" />
          <path class="s-line" [attr.d]="p.ROBOT.arms" />
          <path class="s-line" [attr.d]="p.ROBOT.legs" />
        }
        @case ('ayyou') {
          <g class="s-map"><path class="s-line" [attr.d]="p.MAP" /></g>
          <path class="s-route" [attr.d]="p.ROUTE" />
          <circle class="s-accent-fill" [attr.cx]="p.ROUTE_FROM.cx" [attr.cy]="p.ROUTE_FROM.cy" r="7" />
          <path class="s-accent-fill" [attr.d]="p.ROUTE_TO_PIN" />
          <circle class="s-paper-fill" cx="1066" cy="208" r="5" />
          <path class="s-line" [attr.d]="p.GARGOTE.awning" />
          <path class="s-line" [attr.d]="p.GARGOTE.posts" />
          <path class="s-line" [attr.d]="p.GARGOTE.counter" />
          <path class="s-line" [attr.d]="p.GARGOTE.pot" />
          <path class="s-line s-thin s-steam" [attr.d]="p.GARGOTE.steam" />
          <path class="s-line" [attr.d]="p.PLATE.plate" />
          <path class="s-line s-thin" [attr.d]="p.PLATE.food" />
          @for (w of p.MOTO.wheels; track $index) {
            <circle class="s-line" [attr.cx]="w.cx" [attr.cy]="w.cy" [attr.r]="w.r" />
          }
          @for (w of p.MOTO.hubs; track $index) {
            <circle class="s-line s-thin" [attr.cx]="w.cx" [attr.cy]="w.cy" [attr.r]="w.r" />
          }
          <path class="s-line" [attr.d]="p.MOTO.body" />
          <path class="s-line" [attr.d]="p.MOTO.rider" />
          <circle class="s-line" [attr.cx]="p.MOTO.head.cx" [attr.cy]="p.MOTO.head.cy" [attr.r]="p.MOTO.head.r" />
          <path class="s-line" [attr.d]="p.MOTO.box" />
          <path class="s-accent-line" [attr.d]="p.TROPHY" />
        }
        @case ('horizon') {
          <!-- Ligne de terminal : invite, curseur qui clignote, horizon -->
          <text class="s-term" [attr.x]="p.PROMPT.x" [attr.y]="p.PROMPT.y">{{ p.PROMPT.text }}</text>
          <rect class="s-cursor" [attr.x]="p.CURSOR.x" [attr.y]="p.CURSOR.y" [attr.width]="p.CURSOR.w" [attr.height]="p.CURSOR.h" />
          <path class="s-line s-horizon" [attr.d]="p.HORIZON" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: block;
    }

    .scene {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    path,
    circle {
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
      vector-effect: non-scaling-stroke;
    }

    .s-line {
      stroke: var(--stroke);
      stroke-width: 1.5;
    }

    // Hélice : trait fin, noir à 60 %, trois barreaux orange
    .s-dna-line {
      stroke: var(--text);
      stroke-opacity: 0.6;
      stroke-width: 1.25;
    }

    .s-dna-rung {
      stroke-width: 1;
    }

    .s-dna-accent {
      stroke: var(--accent);
      stroke-width: 1.5;
    }

    .s-thin {
      stroke-width: 1;
    }

    .s-soft {
      stroke: var(--stroke-soft);
      stroke-width: 1;
    }

    .s-paper {
      fill: var(--bg);
    }

    .s-paper-fill {
      fill: var(--bg);
      stroke: none;
    }

    .s-dot {
      fill: var(--stroke);
      stroke: none;
    }

    .s-accent-fill {
      fill: var(--accent);
      stroke: none;
    }

    .s-accent-line {
      stroke: var(--accent);
      stroke-width: 1.5;
    }

    .s-type {
      font-family: var(--font-mono);
      font-size: 17px;
      fill: var(--text);
      white-space: pre;
    }

    .s-term {
      font-family: var(--font-mono);
      font-size: 17px;
      fill: var(--text-2);
      white-space: pre;
    }

    .s-prompt {
      fill: var(--text-3);
    }

    .s-arch {
      font-family: var(--font-mono);
      font-size: 15px;
      fill: var(--text-2);
      text-anchor: middle;
    }

    // Requête API : un point orange qui file d'une boîte à l'autre
    .s-packet {
      fill: var(--accent);
      stroke: none;
      animation: packet 2.1s cubic-bezier(0.45, 0, 0.55, 1) infinite backwards;
    }

    @keyframes packet {
      0% {
        transform: translateX(0);
        opacity: 0;
      }
      15%,
      80% {
        opacity: 1;
      }
      100% {
        transform: translateX(var(--travel));
        opacity: 0;
      }
    }

    // Curseur du terminal (épilogue)
    .s-cursor {
      fill: var(--accent);
      animation: blink 1.1s steps(1, end) infinite;
    }

    @keyframes blink {
      50% {
        opacity: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .s-packet {
        animation: none;
        transform: translateX(calc(var(--travel) / 2));
      }

      .s-cursor {
        animation: none;
      }
    }

    .s-route {
      stroke: var(--accent);
      stroke-width: 2;
      stroke-dasharray: 2 9;
    }
  `,
})
export class Scene {
  readonly name = input.required<P.SceneName>();
  readonly crop = input(false);

  protected readonly p = P;
  protected readonly viewBox = computed(() => (this.crop() ? P.CROP[this.name()] : P.VIEWBOX));
}
