import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import * as P from './scene-paths';

/**
 * Un décor au trait. `crop` : cadrage serré (dessin mobile) ;
 * sinon repère complet 1600 × 1000 (arrière-plan desktop).
 * Les éléments qui participent au morphing portent une classe
 * (s-dna, s-code, s-net, s-map) pour être masqués pendant la transition.
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
          <path class="s-soft" [attr.d]="p.BIO_CONTOURS" />
          <g class="s-dna"><path class="s-line" [attr.d]="p.DNA_STRANDS" /></g>
          <path class="s-line s-thin s-rungs" [attr.d]="p.DNA_RUNGS" />
          <path class="s-accent-fill" [attr.d]="p.FLASK.liquid" />
          <path class="s-line" [attr.d]="p.FLASK.outline" />
          <path class="s-line s-thin" [attr.d]="p.FLASK.marks" />
          @for (b of p.FLASK.bubbles; track $index) {
            <circle class="s-line s-thin" [attr.cx]="b.cx" [attr.cy]="b.cy" [attr.r]="b.r" />
          }
          <path class="s-line" [attr.d]="p.TUBES.rack" />
          <path class="s-line" [attr.d]="p.TUBES.tubes" />
          <path class="s-line s-thin" [attr.d]="p.TUBES.levels" />
          <path class="s-line" [attr.d]="p.SNAKE.body" />
          <path class="s-line" [attr.d]="p.SNAKE.head" />
          <path class="s-line s-thin" [attr.d]="p.SNAKE.tongue" />
          <circle class="s-dot" cx="1534" cy="888" r="2.2" />
        }
        @case ('code') {
          <!-- Éditeur : vraies lignes de Python -->
          <path class="s-line" [attr.d]="p.EDITOR.frame" />
          @for (x of p.EDITOR.dots; track x) {
            <circle class="s-line s-thin" [attr.cx]="x" cy="169" r="5" />
          }
          <g class="s-code"><path class="s-soft s-code-lines" [attr.d]="p.CODE_LINES" /></g>
          @for (line of p.CODE_TEXT; track $index; let i = $index) {
            <text class="s-type" [attr.x]="p.CODE_X" [attr.y]="p.CODE_Y(i)" [attr.data-text]="line">{{ line }}</text>
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
