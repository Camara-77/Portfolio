import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { ChapterHead } from './chapter-head';
import { AudioPlayer } from '../../shared/audio/audio-player';
import { Button } from '../../shared/button/button';
import { Icon, IconName } from '../../shared/icon/icon';
import { NumText } from '../../shared/num-text/num-text';

interface ContactRow {
  label: string;
  value: string;
  href: string;
  icon: IconName;
  external: boolean;
  note?: string;
}

/** Épilogue · Contact : note vocale du parcours, CV, coordonnées. */
@Component({
  selector: 'app-epilogue',
  imports: [ChapterHead, AudioPlayer, Button, Icon, NumText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './epilogue.html',
  styleUrl: './epilogue.scss',
})
export class Epilogue {
  protected readonly e = PORTFOLIO.epilogue;
  protected readonly id = PORTFOLIO.identity;
  protected readonly cv = PORTFOLIO.cv;
  protected readonly emailParts = (() => {
    const at = this.id.email.indexOf('@');
    return [this.id.email.slice(0, at), this.id.email.slice(at)];
  })();

  protected readonly rows: ContactRow[] = [
    { label: 'Téléphone', value: this.id.phone, href: this.id.phoneHref, icon: 'phone', external: false },
    { label: 'LinkedIn', value: this.id.linkedin.display, href: this.id.linkedin.href, icon: 'linkedin', external: true },
    { label: 'GitHub', value: this.id.github.display, href: this.id.github.href, icon: 'github', external: true },
    {
      label: 'TikTok',
      value: this.id.tiktok.display,
      href: this.id.tiktok.href,
      icon: 'tiktok',
      external: true,
      note: PORTFOLIO.epilogue.tiktokLine,
    },
  ];

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
