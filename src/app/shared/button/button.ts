import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Bouton / lien stylé. S'applique sur <a> ou <button> :
 *   <a appButton href="#contact">Me contacter</a>
 *   <a appButton variant="ghost">…</a>
 * L'effet magnétique sera ajouté par la directive appMagnetic (phase 5).
 */
@Component({
  selector: 'a[appButton], button[appButton]',
  template: `<span class="btn__label"><ng-content /></span>`,
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'btn',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
})
export class Button {
  readonly variant = input<'primary' | 'ghost'>('primary');
  readonly size = input<'sm' | 'md'>('md');
}
