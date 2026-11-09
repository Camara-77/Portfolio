import { Injectable, inject, signal } from '@angular/core';
import { MotionService } from './motion.service';

const STORAGE_KEY = 'acc-intro-seen';

/**
 * Écran d'intro : affiché une seule fois par visite (sessionStorage),
 * jamais si l'utilisateur préfère réduire les animations.
 * `done` passe à true quand le rideau commence à s'ouvrir : les
 * animations du hero démarrent à ce moment-là.
 */
@Injectable({ providedIn: 'root' })
export class IntroService {
  private readonly motion = inject(MotionService);

  readonly shouldPlay = !this.motion.reducedMotion() && !this.alreadySeen();
  readonly done = signal(!this.shouldPlay);

  finish(): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* stockage indisponible : l'intro rejouera, sans gravité */
    }
    this.done.set(true);
  }

  private alreadySeen(): boolean {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }
}
