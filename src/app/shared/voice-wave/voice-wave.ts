import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { VoiceMarker } from '../../data/portfolio.data';
import { Icon } from '../icon/icon';
import { NumText } from '../num-text/num-text';
import { AudioService, formatTime } from '../audio/audio.service';
import { MotionService } from '../../core/services/motion.service';
import { Peak, RibbonRenderer, RibbonState } from './ribbons';

/**
 * Note vocale visualisée par des rubans de lignes fines.
 *  - Repos : 2 rubans sur toute la largeur, bouton orange clair au centre.
 *  - Lecture : le bouton glisse à gauche (0,7 s) et devient un micro orange
 *    plein ; les rubans partent du micro et s'ouvrent vers la droite avec la
 *    voix (Web Audio, AnalyserNode) ; un point orange marque chaque pic.
 *  - Pause / fin : retour au centre, libellé « Réécouter ».
 *  - Variante outro : rubans réunis en une ligne au repos et à la fin.
 * Jamais de lecture automatique. « bientôt » si le fichier n'existe pas.
 */
@Component({
  selector: 'app-voice-wave',
  imports: [Icon, NumText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './voice-wave.html',
  styleUrl: './voice-wave.scss',
  host: { '[attr.data-variant]': 'variant()' },
})
export class VoiceWave {
  /** Fichier joué (voix + musique). */
  readonly src = input.required<string>();
  /** Voix seule synchronisée : analysée pour animer les rubans (non entendue). */
  readonly analysisSrc = input<string>();
  readonly label = input.required<string>();
  readonly transcript = input<string[]>([]);
  readonly variant = input<'intro' | 'outro'>('intro');
  readonly markers = input<VoiceMarker[]>([]);

  private readonly audioService = inject(AudioService);
  protected readonly reduced = inject(MotionService).reducedMotion;
  private readonly audioRef = viewChild<ElementRef<HTMLAudioElement>>('audio');
  private readonly voiceRef = viewChild<ElementRef<HTMLAudioElement>>('voice');
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly buttonRef = viewChild.required<ElementRef<HTMLButtonElement>>('button');

  protected readonly available = signal(false);
  /** La voix seule est disponible : elle anime les rubans à la place du mélange. */
  protected readonly hasVoiceTrack = signal(false);
  protected readonly playing = signal(false);
  /** A déjà été écoutée (au moins en partie) : libellé « Réécouter ». */
  protected readonly started = signal(false);
  protected readonly time = signal(0);
  protected readonly duration = signal(0);

  protected readonly elapsed = computed(() => formatTime(this.time()));
  protected readonly total = computed(() => formatTime(this.duration()));
  protected readonly progress = computed(() => (this.duration() ? (this.time() / this.duration()) * 100 : 0));
  protected readonly shownLabel = computed(() => (this.started() ? 'Réécouter' : this.label()));
  protected readonly ariaLabel = computed(() => {
    if (!this.available()) return `${this.label()} — bientôt disponible`;
    if (this.playing()) return `Pause : ${this.label()}`;
    return this.started() ? `Réécouter : ${this.label()}` : `Écouter : ${this.label()}`;
  });
  /** Repères avec un temps connu (un repère sans temps ne s'affiche pas). */
  protected readonly visibleMarkers = computed(() =>
    this.markers().filter((m): m is { time: number; label: string } => typeof m.time === 'number'),
  );

  // Web Audio
  private audioCtx?: AudioContext;
  private analyser?: AnalyserNode;
  private samples?: Uint8Array<ArrayBuffer>;

  constructor() {
    const zone = inject(NgZone);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      this.available.set(this.audioService.isAvailable(this.src()));
      const a = this.analysisSrc();
      this.hasVoiceTrack.set(!!a && this.audioService.isAvailable(a));
      zone.runOutsideAngular(() => destroyRef.onDestroy(this.startCanvas()));
    });

    destroyRef.onDestroy(() => {
      this.audioRef()?.nativeElement.pause();
      this.voiceRef()?.nativeElement.pause();
      void this.audioCtx?.close();
    });
  }

  protected async toggle(): Promise<void> {
    const el = this.audioRef()?.nativeElement;
    if (!el) return;
    if (!el.paused) {
      el.pause();
      return;
    }
    if (el.ended || (this.duration() && el.currentTime >= this.duration() - 0.05)) el.currentTime = 0;
    this.ensureAnalyser(el);
    await this.audioCtx?.resume();
    this.audioService.claim(el);
    this.started.set(true);
    const voice = this.voiceRef()?.nativeElement;
    if (voice) {
      voice.currentTime = el.currentTime;
      await Promise.all([el.play(), voice.play()]);
    } else {
      await el.play();
    }
  }

  protected seekTo(seconds: number): void {
    const el = this.audioRef()?.nativeElement;
    if (!el) return;
    el.currentTime = seconds;
    const voice = this.voiceRef()?.nativeElement;
    if (voice) voice.currentTime = seconds;
    this.time.set(seconds);
  }

  protected onSeek(event: Event): void {
    this.seekTo(Number((event.target as HTMLInputElement).value));
  }

  protected markerLeft(t: number): string {
    return this.duration() ? `${Math.min(100, (t / this.duration()) * 100)}%` : '0%';
  }

  protected onEnded(): void {
    this.playing.set(false);
    this.voiceRef()?.nativeElement.pause();
    this.time.set(this.duration());
  }

  protected onPause(): void {
    this.playing.set(false);
    this.voiceRef()?.nativeElement.pause();
  }

  /** Garde la voix seule calée sur le mélange (écart toléré : 0,12 s). */
  protected onTimeUpdate(t: number): void {
    this.time.set(t);
    const voice = this.voiceRef()?.nativeElement;
    if (voice && !voice.paused && Math.abs(voice.currentTime - t) > 0.12) voice.currentTime = t;
  }

  private ensureAnalyser(el: HTMLAudioElement): void {
    if (this.audioCtx) return;
    try {
      this.audioCtx = new AudioContext();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.6;
      const voice = this.voiceRef()?.nativeElement;
      if (voice) {
        // Le mélange joue normalement ; la voix seule est analysée mais jamais entendue
        const source = this.audioCtx.createMediaElementSource(voice);
        const mute = this.audioCtx.createGain();
        mute.gain.value = 0;
        source.connect(this.analyser);
        this.analyser.connect(mute);
        mute.connect(this.audioCtx.destination);
      } else {
        const source = this.audioCtx.createMediaElementSource(el);
        source.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
      }
      this.samples = new Uint8Array(new ArrayBuffer(this.analyser.fftSize));
    } catch {
      this.audioCtx = undefined; // lecture sans visualisation
    }
  }

  /** Volume instantané de la voix (RMS), 0 → 1. */
  private readLevel(): number {
    if (!this.analyser || !this.samples || !this.playing()) return 0;
    this.analyser.getByteTimeDomainData(this.samples);
    let sum = 0;
    for (let i = 0; i < this.samples.length; i++) {
      const v = (this.samples[i] - 128) / 128;
      sum += v * v;
    }
    return Math.min(1, Math.sqrt(sum / this.samples.length) * 3.2);
  }

  /** Boucle du canvas : en pause hors écran et quand l'onglet est caché. */
  private startCanvas(): () => void {
    const canvas = this.canvasRef().nativeElement;
    const button = this.buttonRef().nativeElement;
    const mobile = window.matchMedia('(max-width: 767.98px)').matches;
    const renderer = new RibbonRenderer(canvas, mobile ? 40 : 66);
    const outro = this.variant() === 'outro';
    const closed = 0.04;
    const state: RibbonState = {
      t: Math.random() * 10,
      level: 0,
      spread: outro ? closed : 1,
      live: 0,
      anchorX: 0,
      anchorY: 0,
    };
    const peaks: Peak[] = [];
    let raf = 0;
    let last = performance.now();
    let visible = false;
    let prevLevel = 0;
    let lastPeak = 0;

    /** Centre du bouton dans le repère du canvas (suit le glissement). */
    const anchor = () => {
      const c = canvas.getBoundingClientRect();
      const b = button.getBoundingClientRect();
      state.anchorX = b.left + b.width / 2 - c.left;
      state.anchorY = b.top + b.height / 2 - c.top;
    };

    renderer.resize();
    anchor();
    renderer.draw(state, peaks, last);

    const ro = new ResizeObserver(() => {
      renderer.resize();
      anchor();
      if (!raf) renderer.draw(state, peaks, performance.now());
    });
    ro.observe(canvas);
    if (this.reduced()) return () => ro.disconnect(); // rubans fixes

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const playing = this.playing();
      const raw = this.readLevel();
      // Lissage : montée rapide, descente douce
      state.level += (raw - state.level) * (raw > state.level ? 0.25 : 0.06);
      state.t += dt * (0.12 + state.level * 1.6);
      // Passage repos ↔ lecture, au rythme du glissement du bouton (~0,7 s)
      state.live += ((playing ? 1 : 0) - state.live) * (1 - Math.exp(-dt * 6));
      const targetSpread = outro ? (playing ? Math.min(1, 0.3 + state.level * 1.2) : closed) : 1;
      state.spread += (targetSpread - state.spread) * (1 - Math.exp(-dt * 3));
      anchor();

      const crest = renderer.draw(state, peaks, now);

      // Pic de voix : point orange sur la crête du premier ruban
      if (playing && raw > 0.32 && raw > prevLevel * 1.18 && now - lastPeak > 280) {
        peaks.push({ x: crest.x, y: crest.y, born: now });
        lastPeak = now;
      }
      prevLevel = raw;
      while (peaks.length && now - peaks[0].born > 1300) peaks.shift();

      button.style.setProperty('--level', state.level.toFixed(3));
      raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0;
    };

    const sync = () => {
      if (visible && !document.hidden && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    });
    io.observe(canvas);
    document.addEventListener('visibilitychange', sync);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }
}
