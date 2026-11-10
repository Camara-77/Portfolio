import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Affiche un texte en serif en composant les chiffres en sans-serif :
 * dans Instrument Serif, « 1 » ressemble à « l » (« 1er » se lirait « ler »).
 */
@Component({
  selector: 'app-num-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@for (s of parts(); track $index) {@if (s.num) {<span class="num">{{ s.t }}</span>} @else {{{ s.t }}}}`,
  styles: `
    .num {
      font-family: var(--font-body);
      font-size: 0.86em;
      font-weight: 400;
      letter-spacing: -0.02em;
    }
  `,
})
export class NumText {
  readonly text = input.required<string>();
  protected readonly parts = computed(() =>
    this.text()
      .split(/(\d+)/)
      .filter(Boolean)
      .map((t) => ({ t, num: /^\d+$/.test(t) })),
  );
}
