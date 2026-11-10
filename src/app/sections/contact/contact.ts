import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { SectionTitle } from '../../shared/section-title/section-title';
import { GlassCard } from '../../shared/glass-card/glass-card';
import { Button } from '../../shared/button/button';
import { Icon, IconName } from '../../shared/icon/icon';
import { RevealDirective } from '../../core/directives/reveal.directive';
import { TextRevealDirective } from '../../core/directives/text-reveal.directive';

interface ContactRow {
  label: string;
  value: string;
  href: string;
  icon: IconName;
  external: boolean;
}

@Component({
  selector: 'app-contact',
  imports: [SectionTitle, GlassCard, Button, Icon, RevealDirective, TextRevealDirective],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  protected readonly id = PORTFOLIO.identity;
  protected readonly title = PORTFOLIO.contact.title;
  protected readonly cv = PORTFOLIO.cv;
  /** L'email n'est coupé qu'avant le « @ » sur les petits écrans. */
  protected readonly emailParts = (() => {
    const at = this.id.email.indexOf('@');
    return [this.id.email.slice(0, at), this.id.email.slice(at)];
  })();

  protected readonly rows: ContactRow[] = [
    { label: 'Téléphone', value: this.id.phone, href: this.id.phoneHref, icon: 'phone', external: false },
    {
      label: this.id.linkedin.label,
      value: this.id.linkedin.display,
      href: this.id.linkedin.href,
      icon: 'linkedin',
      external: true,
    },
    {
      label: this.id.github.label,
      value: this.id.github.display,
      href: this.id.github.href,
      icon: 'github',
      external: true,
    },
  ];

  /** État de la copie : idle → copied (ou error) → idle. */
  protected readonly copyState = signal<'idle' | 'copied' | 'error'>('idle');
  private timer = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected async copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.id.email);
      this.copyState.set('copied');
    } catch {
      this.copyState.set('error');
    }
    clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.copyState.set('idle'), 2600);
  }
}
