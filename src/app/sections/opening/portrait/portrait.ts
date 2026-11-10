import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { MotionService } from '../../../core/services/motion.service';

const RADIUS = 110; // rayon du cercle (px) : zone pleine ≈ 160 px de diamètre
const LERP = 0.14; // retard du cercle sur le curseur
const TRAIL_FADE = 0.035; // vitesse d'effacement de la traînée (par image)

/**
 * Portrait signature : noir et blanc par défaut, devient orange là où
 * passe le curseur (ou le doigt).
 *  - couche orange masquée par un radial-gradient piloté par --x / --y / --r
 *  - traînée lumineuse : canvas où la version orange est dessinée à travers
 *    un masque de cercles qui s'effacent lentement
 */
@Component({
  selector: 'app-portrait',
  templateUrl: './portrait.html',
  styleUrl: './portrait.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Portrait {
  readonly alt = input.required<string>();

  protected readonly srcNb = 'images/portrait-nb.webp';
  protected readonly srcOrange = 'images/portrait-orange.webp';
  protected readonly width = 701;
  protected readonly height = 877;

  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private readonly reveal = viewChild.required<ElementRef<HTMLElement>>('reveal');
  private readonly trail = viewChild.required<ElementRef<HTMLCanvasElement>>('trail');
  private readonly orangeImg = viewChild.required<ElementRef<HTMLImageElement>>('orange');

  constructor() {
    const zone = inject(NgZone);
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      zone.runOutsideAngular(() => {
        const cleanup = this.setup(motion.reducedMotion());
        destroyRef.onDestroy(cleanup);
      });
    });
  }

  private setup(reduced: boolean): () => void {
    const stage = this.stage().nativeElement;
    const reveal = this.reveal().nativeElement;
    const canvas = this.trail().nativeElement;
    const img = this.orangeImg().nativeElement;
    const ctx = canvas.getContext('2d');

    // Masque de la traînée (hors écran)
    const mask = document.createElement('canvas');
    const mctx = mask.getContext('2d');

    const pos = { x: 0, y: 0, tx: 0, ty: 0, r: 0, tr: 0 };
    let rect = stage.getBoundingClientRect();
    let raf = 0;
    let running = false;
    let idle = 0;
    let releaseTimer = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const sizeCanvases = () => {
      rect = stage.getBoundingClientRect();
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      for (const c of [canvas, mask]) {
        c.width = w;
        c.height = h;
      }
    };
    sizeCanvases();

    const apply = () => {
      reveal.style.setProperty('--x', `${pos.x}px`);
      reveal.style.setProperty('--y', `${pos.y}px`);
      reveal.style.setProperty('--r', `${pos.r}px`);
    };

    const drawTrail = () => {
      if (!ctx || !mctx || reduced || !img.complete) return;
      const w = mask.width;
      const h = mask.height;

      // Efface lentement la traînée existante
      mctx.globalCompositeOperation = 'destination-out';
      mctx.fillStyle = `rgba(0,0,0,${TRAIL_FADE})`;
      mctx.fillRect(0, 0, w, h);

      // Ajoute un point doux à la position actuelle
      if (pos.r > 4) {
        mctx.globalCompositeOperation = 'source-over';
        const r = pos.r * 0.7 * dpr;
        const g = mctx.createRadialGradient(pos.x * dpr, pos.y * dpr, 0, pos.x * dpr, pos.y * dpr, r);
        g.addColorStop(0, 'rgba(0,0,0,0.22)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        mctx.fillStyle = g;
        mctx.fillRect(pos.x * dpr - r, pos.y * dpr - r, r * 2, r * 2);
      }

      // Version orange vue à travers le masque
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(mask, 0, 0);
    };

    const loop = () => {
      pos.x += (pos.tx - pos.x) * LERP;
      pos.y += (pos.ty - pos.y) * LERP;
      pos.r += (pos.tr - pos.r) * (pos.tr > pos.r ? 0.12 : 0.08);
      apply();
      drawTrail();

      // S'arrête quand tout est revenu au repos (cercle rétracté, traînée effacée)
      const settled = pos.tr === 0 && pos.r < 0.5;
      idle = settled ? idle + 1 : 0;
      if (idle > 90) {
        running = false;
        pos.r = 0;
        apply();
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        mctx?.clearRect(0, 0, mask.width, mask.height);
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const ensureRunning = () => {
      if (running) return;
      running = true;
      idle = 0;
      raf = requestAnimationFrame(loop);
    };

    const setTarget = (e: PointerEvent, snap: boolean) => {
      rect = stage.getBoundingClientRect();
      pos.tx = e.clientX - rect.left;
      pos.ty = e.clientY - rect.top;
      if (snap) {
        pos.x = pos.tx;
        pos.y = pos.ty;
      }
      pos.tr = RADIUS;
      ensureRunning();
    };

    const onEnter = (e: PointerEvent) => setTarget(e, pos.r < 1);
    const onMove = (e: PointerEvent) => setTarget(e, false);
    const retract = () => {
      pos.tr = 0;
      ensureRunning();
    };
    // Au toucher, pointerleave suit immédiatement pointerup : on laisse
    // le minuteur de onUp gérer la rétraction.
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') retract();
    };
    // Tactile : la couleur apparaît là où l'on touche, puis se rétracte
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      clearTimeout(releaseTimer);
      setTarget(e, true);
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      releaseTimer = window.setTimeout(retract, 900);
    };

    const ro = new ResizeObserver(() => sizeCanvases());
    ro.observe(stage);

    stage.addEventListener('pointerenter', onEnter);
    stage.addEventListener('pointermove', onMove, { passive: true });
    stage.addEventListener('pointerleave', onLeave);
    stage.addEventListener('pointerdown', onDown);
    stage.addEventListener('pointerup', onUp);
    stage.addEventListener('pointercancel', onUp);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(releaseTimer);
      ro.disconnect();
      stage.removeEventListener('pointerenter', onEnter);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
      stage.removeEventListener('pointerdown', onDown);
      stage.removeEventListener('pointerup', onUp);
      stage.removeEventListener('pointercancel', onUp);
    };
  }
}
