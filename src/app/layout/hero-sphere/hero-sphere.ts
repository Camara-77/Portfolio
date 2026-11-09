import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { MotionService } from '../../core/services/motion.service';
import type { SphereScene } from './sphere-scene';

/**
 * Fond 3D du hero. Three.js est chargé à la demande (bundle séparé),
 * l'animation tourne hors zone Angular et se met en pause quand le hero
 * n'est pas visible ou que l'onglet est caché.
 */
@Component({
  selector: 'app-hero-sphere',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `<canvas #canvas class="sphere"></canvas>`,
  styles: `
    :host {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    /* Mobile : la sphère se place derrière le portrait, pas derrière le texte */
    @media (max-width: 1023.98px) {
      :host {
        top: auto;
        height: 62%;
      }
    }
    .sphere {
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 1.6s var(--ease-out);
    }
    .sphere.is-ready {
      opacity: 1;
    }
  `,
})
export class HeroSphere {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    const zone = inject(NgZone);
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);
    let scene: SphereScene | undefined;
    let destroyed = false;
    const cleanups: (() => void)[] = [];

    destroyRef.onDestroy(() => {
      destroyed = true;
      cleanups.forEach((fn) => fn());
      scene?.dispose();
    });

    afterNextRender(() => {
      zone.runOutsideAngular(async () => {
        const canvas = this.canvas().nativeElement;
        const lite = !motion.finePointer() || window.innerWidth < 768;

        let mod: typeof import('./sphere-scene');
        try {
          mod = await import('./sphere-scene');
        } catch {
          return; // pas de 3D : le hero reste lisible sans
        }
        if (destroyed) return;

        try {
          scene = new mod.SphereScene(canvas, { lite, animate: !motion.reducedMotion() });
        } catch {
          return; // WebGL indisponible
        }
        scene.render();
        canvas.classList.add('is-ready');

        // Pause hors écran
        let inView = true;
        const io = new IntersectionObserver(([e]) => {
          inView = e.isIntersecting;
          sync();
        });
        io.observe(canvas);

        const sync = () => {
          if (inView && !document.hidden) scene?.start();
          else scene?.stop();
        };
        const onVisibility = () => sync();
        const onResize = () => scene?.resize();
        const ro = new ResizeObserver(onResize);
        ro.observe(canvas);

        // Souris (sur tout le hero, pas seulement le canvas)
        const onMove = (e: PointerEvent) => {
          if (e.pointerType !== 'mouse') return;
          scene?.pointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
        };
        const onLeave = () => scene?.pointerLeave();

        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('pointermove', onMove, { passive: true });
        document.documentElement.addEventListener('pointerleave', onLeave);

        cleanups.push(() => {
          io.disconnect();
          ro.disconnect();
          document.removeEventListener('visibilitychange', onVisibility);
          window.removeEventListener('pointermove', onMove);
          document.documentElement.removeEventListener('pointerleave', onLeave);
        });
        sync();
      });
    });
  }
}
