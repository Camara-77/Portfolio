import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MagneticDirective } from '../../core/directives/magnetic.directive';

/**
 * Bouton / lien stylé. S'applique sur <a> ou <button> :
 *   <a appButton href="#contact">Me contacter</a>
 *   <a appButton variant="ghost">…</a>
 * Tous les boutons sont magnétiques (directive appMagnetic en hostDirective).
 */
@Component({
  selector: 'a[appButton], button[appButton]',
  template: `<span class="btn__label"><ng-content /></span>`,
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: MagneticDirective, inputs: ['magneticStrength'] }],
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
