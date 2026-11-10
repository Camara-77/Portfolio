import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { VoiceNote } from '../../data/portfolio.data';
import { Icon } from '../icon/icon';
import { AudioService, formatTime } from './audio.service';

/**
 * Lecteur audio complet et sobre : lecture/pause, barre de progression
 * (réglable au clavier), durée, transcription dépliable.
 * Pas de lecture automatique ; désactivé (« bientôt ») si le fichier manque.
 */
@Component({
  selector: 'app-audio-player',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="player" [class.is-disabled]="!available()">
      <button
        type="button"
        class="player__btn"
        [disabled]="!available()"
        [attr.aria-label]="playing() ? 'Pause' : 'Lire la note vocale'"
        (click)="toggle()"
      >
        <app-icon [name]="playing() ? 'pause' : 'play'" />
      </button>

      <div class="player__body">
        <p class="player__title">
          {{ note().label }}
          @if (!available()) {
            <span class="player__soon">bientôt</span>
          }
        </p>
        <div class="player__track">
          <input
            class="player__range"
            type="range"
            min="0"
            [max]="duration() || 1"
            step="0.1"
            [value]="time()"
            [disabled]="!available()"
            [style.--p]="progress()"
            aria-label="Position dans la note vocale"
            [attr.aria-valuetext]="elapsed() + ' sur ' + total()"
            (input)="seek($event)"
          />
          <span class="player__time">{{ elapsed() }} / {{ total() }}</span>
        </div>
      </div>

      @if (available()) {
        <audio #audio [src]="note().src" preload="metadata"
          (play)="playing.set(true)" (pause)="playing.set(false)" (ended)="playing.set(false)"
          (timeupdate)="time.set(audio.currentTime)" (loadedmetadata)="duration.set(audio.duration)">
        </audio>
      }
    </div>

    <details class="player__transcript">
      <summary>Transcription</summary>
      @if (note().transcript.length) {
        @for (p of note().transcript; track $index) {
          <p>{{ p }}</p>
        }
      } @else {
        <p class="player__todo"><span class="todo">Transcription à venir</span></p>
      }
    </details>
  `,
  styleUrl: './audio-player.scss',
})
export class AudioPlayer {
  readonly note = input.required<VoiceNote>();

  private readonly audioService = inject(AudioService);
  private readonly audio = viewChild<ElementRef<HTMLAudioElement>>('audio');

  protected readonly available = signal(false);
  protected readonly playing = signal(false);
  protected readonly time = signal(0);
  protected readonly duration = signal(0);
  protected readonly elapsed = computed(() => formatTime(this.time()));
  protected readonly total = computed(() => formatTime(this.duration()));
  protected readonly progress = computed(() =>
    this.duration() ? `${(this.time() / this.duration()) * 100}%` : '0%',
  );

  constructor() {
    queueMicrotask(() => this.available.set(this.audioService.isAvailable(this.note().src)));
  }

  protected toggle(): void {
    const el = this.audio()?.nativeElement;
    if (!el) return;
    if (el.paused) {
      this.audioService.claim(el);
      void el.play();
    } else {
      el.pause();
    }
  }

  protected seek(event: Event): void {
    const el = this.audio()?.nativeElement;
    if (!el) return;
    el.currentTime = Number((event.target as HTMLInputElement).value);
  }
}
