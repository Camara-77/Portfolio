import { DestroyRef, Injectable, NgZone, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * État de défilement partagé : navbar cachée/visible, page défilée,
 * section active. Les écouteurs tournent hors zone Angular et ne
 * mettent à jour les signals que lorsque la valeur change.
 */
@Injectable({ providedIn: 'root' })
export class ScrollService {
  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly scrolled = signal(false);
  readonly navHidden = signal(false);
  readonly activeSection = signal<string | null>(null);

  private lastY = 0;
  private ticking = false;
  private observer?: IntersectionObserver;

  constructor() {
    if (!this.isBrowser) return;

    const onScroll = () => {
      if (this.ticking) return;
      this.ticking = true;
      requestAnimationFrame(() => {
        this.update(window.scrollY);
        this.ticking = false;
      });
    };

    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', onScroll, { passive: true });
    });
    this.update(window.scrollY);

    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      this.observer?.disconnect();
    });
  }

  /** Observe les sections pour mettre en évidence le lien actif. */
  observeSections(ids: string[]): void {
    if (!this.isBrowser) return;
    this.observer?.disconnect();

    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) this.activeSection.set(entry.target.id);
          }
        },
        // Une section est « active » quand elle traverse le milieu de l'écran
        { rootMargin: '-45% 0px -50% 0px' },
      );
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el) this.observer.observe(el);
      }
    });
  }

  /** Affiche la navbar (ex. quand le menu mobile s'ouvre). */
  revealNav(): void {
    this.navHidden.set(false);
  }

  private update(y: number): void {
    const delta = y - this.lastY;
    const scrolled = y > 8;
    if (scrolled !== this.scrolled()) this.scrolled.set(scrolled);

    // Cache en descendant (au-delà de 120px), réaffiche en remontant
    if (Math.abs(delta) > 6) {
      const hidden = delta > 0 && y > 120;
      if (hidden !== this.navHidden()) this.navHidden.set(hidden);
    }
    if (y < 120 && this.activeSection() !== null && y < 40) {
      this.activeSection.set(null);
    }
    this.lastY = y;
  }
}
