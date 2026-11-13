import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO, ProjectFrame } from '../../data/portfolio.data';

/** Un projet réel, écrit en JSON (aucune donnée ajoutée). */
function json(f: ProjectFrame): string[] {
  return [
    '{',
    `  "name": ${JSON.stringify(f.name)},`,
    `  "stack": [${f.stack.map((t) => JSON.stringify(t)).join(', ')}],`,
    `  "links": [${f.links.map((l) => JSON.stringify(l.display)).join(', ')}]`,
    '}',
  ];
}

/**
 * Fond très pâle du chapitre Projets : accolades, balise </> et lignes
 * de JSON reprenant les vrais projets. Purement décoratif.
 */
@Component({
  selector: 'app-code-backdrop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" focusable="false">
      <text class="cb-glyph" x="18" y="640" font-size="560">{{ '{' }}</text>
      <text class="cb-glyph" x="1290" y="700" font-size="560">{{ '}' }}</text>
      <text class="cb-glyph" x="1150" y="880" font-size="150">&lt;/&gt;</text>
      @for (block of blocks; track $index) {
        @for (line of block.lines; track $index; let i = $index) {
          <text class="cb-json" [attr.x]="block.x" [attr.y]="block.y + i * 24">{{ line }}</text>
        }
      }
    </svg>
  `,
  styles: `
    :host {
      position: absolute;
      inset: 0;
      z-index: -1;
      overflow: hidden;
      pointer-events: none;
      opacity: 0.1;
    }

    svg {
      width: 100%;
      height: 100%;
    }

    .cb-glyph {
      font-family: var(--font-mono);
      fill: none;
      stroke: var(--stroke);
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }

    .cb-json {
      font-family: var(--font-mono);
      font-size: 15px;
      fill: var(--stroke);
      white-space: pre;
    }
  `,
})
export class CodeBackdrop {
  private readonly frames = PORTFOLIO.projects.frames;
  protected readonly blocks = [
    { x: 1060, y: 60, lines: json(this.frames[0]) },
    { x: 60, y: 760, lines: json(this.frames[1]) },
  ];
}
