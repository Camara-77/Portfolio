import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Formes grises floues qui dérivent lentement derrière le contenu,
 * pour rendre l'effet de verre visible. Dégradés radiaux (pas de
 * filter: blur) : peu coûteux et fluides, même sur mobile.
 */
@Component({
  selector: 'app-ambient-background',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <span class="blob blob--1"></span>
    <span class="blob blob--2"></span>
    <span class="blob blob--3"></span>
    <span class="grain"></span>
  `,
  styles: `
    @use 'tokens' as *;

    :host {
      position: fixed;
      inset: 0;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .blob {
      position: absolute;
      border-radius: 50%;
      will-change: transform;
    }

    .blob--1 {
      top: -10vmax;
      left: -12vmax;
      width: 60vmax;
      height: 60vmax;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.075), transparent 62%);
      animation: drift-1 38s var(--ease-in-out) infinite alternate;
    }

    .blob--2 {
      top: 30vh;
      right: -18vmax;
      width: 55vmax;
      height: 55vmax;
      background: radial-gradient(circle, rgba(200, 200, 200, 0.06), transparent 62%);
      animation: drift-2 46s var(--ease-in-out) infinite alternate;
    }

    .blob--3 {
      bottom: -22vmax;
      left: 20vw;
      width: 50vmax;
      height: 50vmax;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.05), transparent 62%);
      animation: drift-3 52s var(--ease-in-out) infinite alternate;
    }

    // Grain très léger pour éviter les bandes dans les dégradés
    .grain {
      position: absolute;
      inset: 0;
      opacity: 0.05;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }

    @keyframes drift-1 {
      to {
        transform: translate3d(18vw, 22vh, 0) scale(1.1);
      }
    }
    @keyframes drift-2 {
      to {
        transform: translate3d(-22vw, -14vh, 0) scale(0.9);
      }
    }
    @keyframes drift-3 {
      to {
        transform: translate3d(14vw, -26vh, 0) scale(1.15);
      }
    }

    @include reduced-motion {
      .blob {
        animation: none;
      }
    }
  `,
})
export class AmbientBackground {}
