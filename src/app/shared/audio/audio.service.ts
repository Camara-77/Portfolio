import { Injectable } from '@angular/core';
import { AUDIO_FILES } from '../../data/audio-manifest';

/**
 * - Disponibilité d'une note vocale : d'après la liste générée au build
 *   (scripts/audio-manifest.mjs), sans requête réseau ni erreur 404.
 * - Garantit qu'un seul lecteur joue à la fois.
 */
@Injectable({ providedIn: 'root' })
export class AudioService {
  private playing: HTMLAudioElement | null = null;

  isAvailable(src: string): boolean {
    return AUDIO_FILES.includes(src);
  }

  /** À appeler avant de lancer une lecture : met en pause l'audio précédent. */
  claim(audio: HTMLAudioElement): void {
    if (this.playing && this.playing !== audio) this.playing.pause();
    this.playing = audio;
  }
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
