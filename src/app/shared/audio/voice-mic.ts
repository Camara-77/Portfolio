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
 * Petite note vocale : micro + ondes orange qui respirent lentement.
 * Lecture uniquement au clic. Désactivée (« bientôt ») si le fichier manque.
 */
@Component({
  selector: 'app-voice-mic',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mic" [class.is-playing]="playing()" [class.is-disabled]="!available()">
      <button
        type="button"
        class="mic__btn"
        [disabled]="!available()"
        [attr.aria-pressed]="available() ? playing() : null"
        [attr.aria-label]="buttonLabel()"
        (click)="toggle()"
      >
        <span class="mic__icon"><app-icon [name]="playing() ? 'pause' : 'mic'" /></span>
        <span class="mic__waves" aria-hidden="true">
          @for (b of bars; track $index) {
            <span class="mic__bar" [style.--d]="b"></span>
          }
        </span>
      </button>

      <span class="mic__text">
        <span class="mic__label">{{ note().label }}</span>
        <span class="mic__meta">
          @if (!available()) {
            bientôt
          } @else if (playing()) {
            {{ elapsed() }} / {{ total() }}
          } @else {
            {{ total() === '0:00' ? 'environ 15 s' : total() }}
          }
        </span>
      </span>

      @if (available()) {
        <audio #audio [src]="note().src" preload="metadata"
          (play)="playing.set(true)" (pause)="playing.set(false)" (ended)="onEnded()"
          (timeupdate)="time.set(audio.currentTime)" (loadedmetadata)="duration.set(audio.duration)">
        </audio>
      }
    </div>

    @if (note().transcript.length && compact()) {
      <div class="sr-only">
        <p>Transcription :</p>
        @for (p of note().transcript; track $index) {
          <p>{{ p }}</p>
        }
      </div>
    } @else if (note().transcript.length) {
      <details class="mic__transcript">
        <summary>Lire la transcription</summary>
        @for (p of note().transcript; track $index) {
          <p>{{ p }}</p>
        }
      </details>
    }
  `,
  styleUrl: './voice-mic.scss',
})
export class VoiceMic {
  readonly note = input.required<VoiceNote>();
  /** Version compacte (hero) : sans transcription dépliable visible. */
  readonly compact = input(false);

  private readonly audioService = inject(AudioService);
  private readonly audio = viewChild<ElementRef<HTMLAudioElement>>('audio');

  protected readonly bars = [0, 0.35, 0.7, 0.2, 0.55];
  protected readonly available = signal(false);
  protected readonly playing = signal(false);
  protected readonly time = signal(0);
  protected readonly duration = signal(0);

  protected readonly elapsed = computed(() => formatTime(this.time()));
  protected readonly total = computed(() => formatTime(this.duration()));
  protected readonly buttonLabel = computed(() =>
    !this.available()
      ? `${this.note().label} — bientôt disponible`
      : this.playing()
        ? 'Mettre en pause la présentation'
        : `${this.note().label} (audio)`,
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

  protected onEnded(): void {
    this.playing.set(false);
    this.time.set(0);
  }
}
