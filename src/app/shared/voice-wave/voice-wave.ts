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
 *  - intro : rubans ouverts, respiration lente au repos
 *  - outro : rubans réunis en une ligne au repos, qui s'ouvrent avec la voix
 *    et se referment à la fin
 * En lecture, l'amplitude et la vitesse suivent le volume (Web Audio,
 * AnalyserNode) ; un point orange marque chaque pic de voix.
 * Jamais de lecture automatique. Désactivée (« bientôt ») si le fichier manque.
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
  readonly src = input.required<string>();
  readonly label = input.required<string>();
  readonly transcript = input<string[]>([]);
  readonly variant = input<'intro' | 'outro'>('intro');
  readonly markers = input<VoiceMarker[]>([]);

  private readonly audioService = inject(AudioService);
  private readonly motion = inject(MotionService);
  private readonly audioRef = viewChild<ElementRef<HTMLAudioElement>>('audio');
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly ringRef = viewChild.required<ElementRef<HTMLElement>>('ring');

  protected readonly available = signal(false);
  protected readonly playing = signal(false);
  protected readonly time = signal(0);
  protected readonly duration = signal(0);
  protected readonly elapsed = computed(() => formatTime(this.time()));
  protected readonly total = computed(() => formatTime(this.duration()));
  protected readonly progress = computed(() => (this.duration() ? (this.time() / this.duration()) * 100 : 0));
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
      zone.runOutsideAngular(() => destroyRef.onDestroy(this.startCanvas()));
    });

    destroyRef.onDestroy(() => {
      this.audioRef()?.nativeElement.pause();
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
    this.ensureAnalyser(el);
    await this.audioCtx?.resume();
    this.audioService.claim(el);
    await el.play();
  }

  protected seekTo(seconds: number): void {
    const el = this.audioRef()?.nativeElement;
    if (!el) return;
    el.currentTime = seconds;
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
    this.time.set(0);
  }

  private ensureAnalyser(el: HTMLAudioElement): void {
    if (this.audioCtx) return;
    try {
      this.audioCtx = new AudioContext();
      const source = this.audioCtx.createMediaElementSource(el);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.6;
      source.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
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
    const ring = this.ringRef().nativeElement;
    const mobile = window.matchMedia('(max-width: 767.98px)').matches;
    const renderer = new RibbonRenderer(canvas, mobile ? 50 : 96);
    const outro = this.variant() === 'outro';
    const restSpread = outro ? 0.04 : 1;
    const state: RibbonState = { t: Math.random() * 10, level: 0, spread: restSpread };
    const peaks: Peak[] = [];
    let raf = 0;
    let last = performance.now();
    let visible = false;
    let prevLevel = 0;
    let lastPeak = 0;

    renderer.resize();
    renderer.draw(state, peaks, last);

    const reduced = this.motion.reducedMotion();
    const ro = new ResizeObserver(() => {
      renderer.resize();
      if (!raf) renderer.draw(state, peaks, performance.now());
    });
    ro.observe(canvas);
    if (reduced) return () => ro.disconnect(); // rubans figés

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const raw = this.readLevel();
      // Lissage : montée rapide, descente douce
      state.level += (raw - state.level) * (raw > state.level ? 0.25 : 0.06);
      state.t += dt * (0.12 + state.level * 1.6);
      const targetSpread = outro ? (this.playing() ? 0.25 + state.level * 1.1 : restSpread) : 1;
      state.spread += (Math.min(1, targetSpread) - state.spread) * 0.04;

      const crest = renderer.draw(state, peaks, now);

      // Pic de voix : point orange sur la crête du ruban le plus haut
      if (this.playing() && raw > 0.32 && raw > prevLevel * 1.18 && now - lastPeak > 280) {
        peaks.push({ x: crest.x, y: crest.y, born: now });
        lastPeak = now;
      }
      prevLevel = raw;
      while (peaks.length && now - peaks[0].born > 1300) peaks.shift();

      ring.style.setProperty('--level', state.level.toFixed(3));
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
