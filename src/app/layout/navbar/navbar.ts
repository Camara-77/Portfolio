import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { ScrollService } from '../../core/services/scroll.service';
import { Button } from '../../shared/button/button';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-navbar',
  imports: [Button, Icon],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-hidden]': 'hidden()',
    '[class.is-scrolled]': 'scroll.scrolled()',
    '[class.is-open]': 'menuOpen()',
    '(document:keydown.escape)': 'closeMenu()',
  },
})
export class Navbar {
  protected readonly scroll = inject(ScrollService);
  private readonly document = inject(DOCUMENT);

  protected readonly data = PORTFOLIO;
  protected readonly links = PORTFOLIO.nav;
  protected readonly menuOpen = signal(false);
  protected readonly hidden = computed(() => this.scroll.navHidden() && !this.menuOpen());

  constructor() {
    // Bloque le défilement de la page quand le menu mobile est ouvert
    effect(() => {
      this.document.documentElement.style.overflow = this.menuOpen() ? 'hidden' : '';
    });
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
    if (this.menuOpen()) this.scroll.revealNav();
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected pad(i: number): string {
    return String(i + 1).padStart(2, '0');
  }
}
