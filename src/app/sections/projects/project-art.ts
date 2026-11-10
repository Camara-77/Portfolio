import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ProjectArt as ArtName } from '../../data/portfolio.data';

/**
 * Illustrations au trait des projets (repère 400 × 260), même style que
 * les décors : noir et gris, une seule touche d'orange (classe .o).
 * Chaque tracé porte la classe .d : il se dessine (stroke-dasharray)
 * quand le cadre arrive au centre.
 */
@Component({
  selector: 'app-project-art',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 400 260" focusable="false">
      @switch (name()) {
        @case ('ayyou') {
          <!-- carte : routes -->
          <path class="d soft" d="M18 58 C90 38 160 72 232 50 S340 36 386 58 M24 104 C120 86 210 118 384 96 M210 20 C220 70 214 110 236 150" />
          <path class="d dots" d="M112 158 C150 130 190 120 230 104 S280 80 300 92" />
          <!-- gargote -->
          <path class="d" d="M24 132 H150 L142 154 H32 Z M42 132 L40 154 M64 132 L63 154 M86 132 V154 M108 132 L109 154 M130 132 L132 154" />
          <path class="d" d="M36 154 V244 M138 154 V244 M24 204 H150 M24 212 H150" />
          <path class="d" d="M66 204 V184 Q66 178 72 178 H102 Q108 178 108 184 V204 M60 178 H114" />
          <path class="d thin" d="M78 170 C74 162 82 158 78 150 M94 170 C90 162 98 158 94 150" />
          <!-- livreur à moto -->
          <circle class="d" cx="232" cy="226" r="18" />
          <circle class="d" cx="318" cy="226" r="18" />
          <path class="d" d="M212 224 C210 202 228 192 254 192 H284 M258 192 C266 206 266 216 260 218 H306 C312 206 316 194 315 182 M318 226 L304 178 M296 178 H314" />
          <path class="d" d="M280 192 L288 160 L310 176 M280 192 L294 206 L290 218" />
          <circle class="d" cx="290" cy="146" r="10" />
          <path class="d" d="M228 160 H262 V192 H228 Z M228 170 H262" />
          <!-- épingle orange -->
          <path class="o" d="M300 92 C300 80 288 74 288 64 A12 12 0 1 1 312 64 C312 74 300 80 300 92 Z" />
          <circle class="paper" cx="300" cy="64" r="4" />
        }
        @case ('rag') {
          <!-- document ouvert -->
          <path class="d" d="M48 56 Q124 44 200 66 V224 Q124 204 48 214 Z M200 66 Q276 44 352 56 V214 Q276 204 200 224" />
          <path class="d thin" d="M70 86 H178 M70 106 H168 M70 126 H182 M70 146 H150 M70 166 H174 M70 186 H140" />
          <path class="d thin" d="M222 86 H330 M222 106 H316 M222 166 H326 M222 186 H300" />
          <!-- loupe -->
          <circle class="d paper-fill" cx="276" cy="136" r="38" />
          <path class="d" d="M303 163 L344 204 M338 198 L350 210" />
          <path class="o-line" d="M252 136 H300" />
          <path class="d thin" d="M256 122 H294 M256 150 H286" />
        }
        @case ('sentiment') {
          <!-- bulle de message -->
          <path class="d" d="M36 44 H206 Q222 44 222 60 V132 Q222 148 206 148 H106 L76 178 V148 H52 Q36 148 36 132 V60 Q36 44 52 44 Z" />
          <path class="d thin" d="M58 76 H196 M58 98 H184 M58 120 H150" />
          <!-- jauge négatif / neutre / positif -->
          <path class="d" d="M236 214 A72 72 0 0 1 380 214" />
          <path class="d thin" d="M248 214 A60 60 0 0 1 368 214 M278 162 L284 172 M338 162 L332 172" />
          <path class="d thin" d="M254 194 H266 M302 142 V154 M302 142 V154 M348 194 H360 M354 188 V200" />
          <path class="o-line" d="M308 214 L350 168" />
          <circle class="d paper-fill" cx="308" cy="214" r="6" />
        }
        @case ('ande') {
          <!-- fiches en entrée -->
          <path class="d" d="M24 56 H104 V98 H24 Z M34 70 H90 M34 84 H74" />
          <path class="d" d="M32 112 H112 V154 H32 Z M42 126 H98 M42 140 H82" />
          <path class="d" d="M24 168 H104 V210 H24 Z M34 182 H90 M34 196 H74" />
          <!-- petit réseau -->
          <path class="d thin" d="M112 78 L160 100 M120 133 L160 132 M112 189 L160 164 M172 100 L222 116 M172 100 L222 148 M172 132 L222 116 M172 132 L222 148 M172 164 L222 116 M172 164 L222 148" />
          <circle class="d paper-fill" cx="166" cy="100" r="7" />
          <circle class="d paper-fill" cx="166" cy="132" r="7" />
          <circle class="d paper-fill" cx="166" cy="164" r="7" />
          <circle class="d paper-fill" cx="228" cy="148" r="7" />
          <circle class="o" cx="228" cy="116" r="7" />
          <!-- fiches triées -->
          <path class="d thin" d="M236 112 L276 84 M236 152 L276 182" />
          <path class="d" d="M284 56 H364 V98 H284 Z M290 50 H370 V92 M296 44 H376 V86" />
          <path class="d" d="M284 160 H364 V202 H284 Z M290 154 H370 V196" />
        }
        @case ('joj-event') {
          <!-- billet -->
          <path class="d" d="M28 52 H208 V90 A12 12 0 0 0 208 114 V152 H28 V114 A12 12 0 0 0 28 90 Z" />
          <path class="d dash" d="M168 56 V148" />
          <path class="d thin" d="M48 78 H140 M48 98 H120 M48 128 H132" />
          <path class="o" d="M188 92 L191 100 L199 100 L193 105 L195 113 L188 108 L181 113 L183 105 L177 100 L185 100 Z" />
          <!-- gradins -->
          <path class="d" d="M216 236 H388 M230 216 H388 M244 196 H388 M258 176 H388 M272 156 H388 M286 136 H388" />
          <path class="d" d="M216 236 V228 L230 216 V208 L244 196 V188 L258 176 V168 L272 156 V148 L286 136 V128" />
          <path class="d thin" d="M300 136 V236 M330 136 V236 M360 136 V236" />
          <path class="d" d="M350 40 V128 M336 40 H364 L360 52 H340 Z" />
        }
        @case ('joj-news') {
          <!-- journal plié -->
          <path class="d" d="M30 44 H220 V214 H30 Z M125 44 V214" />
          <path class="d" d="M44 64 H206" />
          <path class="d thin" d="M44 84 H112 M44 100 H112 M44 116 H104 M44 132 H112 M44 148 H96 M44 164 H112 M44 180 H108" />
          <path class="d thin" d="M138 84 H206 V132 H138 Z M138 148 H206 M138 164 H196 M138 180 H206" />
          <!-- enveloppe -->
          <path class="d" d="M246 116 H374 V214 H246 Z M246 116 L310 168 L374 116 M246 214 L294 168 M374 214 L326 168" />
          <circle class="o" cx="372" cy="116" r="10" />
        }
        @case ('ecostock') {
          <!-- entrepôt A -->
          <path class="d" d="M24 232 V140 L84 100 L144 140 V232 Z M24 232 H144" />
          <path class="d thin" d="M62 232 V184 H106 V232 M62 196 H106 M62 208 H106 M62 220 H106" />
          <!-- cagettes en transit -->
          <path class="d" d="M160 202 H192 V232 H160 Z M160 202 L192 232 M192 202 L160 232" />
          <path class="d" d="M200 172 H232 V202 H200 Z M200 172 L232 202 M232 172 L200 202" />
          <path class="o-line" d="M152 150 C182 118 222 118 248 142 M240 132 L250 144 L236 148" />
          <!-- entrepôt B -->
          <path class="d" d="M256 232 V140 L316 100 L376 140 V232 Z M256 232 H376" />
          <path class="d thin" d="M294 232 V184 H338 V232 M294 196 H338 M294 208 H338 M294 220 H338" />
        }
        @case ('helpdesk') {
          <!-- casque d'assistance -->
          <path class="d" d="M58 140 A64 64 0 0 1 186 140" />
          <path class="d" d="M48 138 H72 V196 H48 Q40 196 40 188 V146 Q40 138 48 138 Z M172 138 H196 Q204 138 204 146 V188 Q204 196 196 196 H172 Z" />
          <path class="d" d="M186 196 Q186 226 146 228 M146 228 H134" />
          <circle class="d" cx="128" cy="228" r="6" />
          <!-- ticket -->
          <path class="d" d="M232 40 H364 V126 H232 Z" />
          <path class="d thin" d="M248 62 H300 M248 82 H348 M248 102 H330" />
          <path class="d thin" d="M330 54 H352 V70 H330 Z" />
          <!-- cadenas -->
          <path class="o-line" d="M276 176 V158 A22 22 0 0 1 320 158 V176" />
          <path class="d" d="M262 176 H334 V236 H262 Z" />
          <path class="d" d="M298 198 V214 M292 198 A6 6 0 1 1 304 198" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: block;
    }

    svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    path,
    circle {
      fill: none;
      stroke: var(--stroke);
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
      vector-effect: non-scaling-stroke;
    }

    .thin {
      stroke-width: 1;
    }

    .soft {
      stroke: var(--stroke-soft);
      stroke-width: 1;
    }

    .dots {
      stroke: var(--stroke-soft);
      stroke-dasharray: 2 7;
    }

    .dash {
      stroke-dasharray: 4 5;
    }

    .paper-fill {
      fill: var(--bg);
    }

    .paper {
      fill: var(--bg);
      stroke: none;
    }

    .o {
      fill: var(--accent);
      stroke: none;
    }

    .o-line {
      stroke: var(--accent);
      stroke-width: 2.5;
    }
  `,
})
export class ProjectArt {
  readonly name = input.required<ArtName>();
}
