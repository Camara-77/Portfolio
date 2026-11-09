import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Préférences de mouvement et type de pointeur.
 * - reducedMotion : l'utilisateur a demandé moins d'animations
 * - finePointer : souris (curseur perso, tilt, halo) vs tactile
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly reducedMotion = signal(false);
  readonly finePointer = signal(false);

  constructor() {
    if (!this.isBrowser) return;

    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fp = window.matchMedia('(hover: hover) and (pointer: fine)');
    this.reducedMotion.set(rm.matches);
    this.finePointer.set(fp.matches);

    const onRm = (e: MediaQueryListEvent) => this.reducedMotion.set(e.matches);
    const onFp = (e: MediaQueryListEvent) => this.finePointer.set(e.matches);
    rm.addEventListener('change', onRm);
    fp.addEventListener('change', onFp);

    inject(DestroyRef).onDestroy(() => {
      rm.removeEventListener('change', onRm);
      fp.removeEventListener('change', onFp);
    });
  }
}
