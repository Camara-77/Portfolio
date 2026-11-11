// =========================================================
// Rubans de « fumée » : chaque ruban = des dizaines de courbes
// très fines et presque transparentes, déformées par du bruit
// de Perlin + des sinusoïdes. Leurs croisements créent des
// zones plus sombres.
// =========================================================

/** Bruit de Perlin 2D (gradients), valeurs ≈ [-1, 1]. */
export class Perlin {
  private readonly p = new Uint8Array(512);

  constructor(seed = 7) {
    const perm = Array.from({ length: 256 }, (_, i) => i);
    let s = seed;
    for (let i = 255; i > 0; i--) {
      s = (s * 16807) % 2147483647;
      const j = s % (i + 1);
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    for (let i = 0; i < 512; i++) this.p[i] = perm[i & 255];
  }

  noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = x * x * x * (x * (x * 6 - 15) + 10);
    const v = y * y * y * (y * (y * 6 - 15) + 10);
    const p = this.p;
    const g = (h: number, dx: number, dy: number) => {
      const k = h & 3;
      return (k & 1 ? -dx : dx) + (k & 2 ? -dy : dy);
    };
    const a = p[X] + Y;
    const b = p[X + 1] + Y;
    const l1 = g(p[a], x, y) + u * (g(p[b], x - 1, y) - g(p[a], x, y));
    const l2 = g(p[a + 1], x, y - 1) + u * (g(p[b + 1], x - 1, y - 1) - g(p[a + 1], x, y - 1));
    return l1 + v * (l2 - l1);
  }
}

export interface RibbonState {
  /** Temps interne (avance plus vite quand la voix est forte). */
  t: number;
  /** Niveau de la voix lissé, 0 → 1. */
  level: number;
  /** Ouverture des rubans : 0 = réunis en une ligne, 1 = ouverts. */
  spread: number;
}

export interface Peak {
  x: number;
  y: number;
  born: number;
}

const RIBBONS = [
  { offset: -0.24, seed: 0, width: 0.22, alpha: 0.05 },
  { offset: -0.04, seed: 11, width: 0.3, alpha: 0.04 },
  { offset: 0.16, seed: 23, width: 0.24, alpha: 0.06 },
  { offset: 0.3, seed: 37, width: 0.16, alpha: 0.035 },
];

export class RibbonRenderer {
  private readonly perlin = new Perlin(11);
  private ctx: CanvasRenderingContext2D;
  /** Variation propre à chaque ligne (évite le moiré des lignes parallèles). */
  private readonly jitter: { phase: number; offset: number }[];
  private w = 0;
  private h = 0;
  private dpr = 1;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly linesPerRibbon: number,
  ) {
    this.ctx = canvas.getContext('2d')!;
    let seed = 1234567;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    this.jitter = Array.from({ length: RIBBONS.length * linesPerRibbon }, () => ({
      phase: rand() * 100,
      offset: rand() - 0.5,
    }));
  }

  resize(): void {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = this.canvas.clientWidth;
    this.h = this.canvas.clientHeight;
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  /**
   * Dessine les rubans. Renvoie la crête (point le plus haut) du ruban
   * le plus haut, pour y poser un point orange lors d'un pic de voix.
   */
  draw(s: RibbonState, peaks: Peak[], now: number): { x: number; y: number } {
    const { ctx, w, h, perlin } = this;
    ctx.clearRect(0, 0, w, h);
    if (!w || !h) return { x: 0, y: 0 };

    const mid = h / 2;
    const steps = Math.max(24, Math.round(w / 22));
    const amp = h * (0.07 + s.level * 0.26); // amplitude : respiration → voix
    let crest = { x: w / 2, y: h };

    RIBBONS.forEach((rb, ri) => {
      const base = mid + rb.offset * h * s.spread;
      const thickness = h * rb.width * (0.15 + 0.85 * s.spread);
      // Trait d'au moins 1 pixel physique : en dessous, le navigateur dessine
      // segment par segment et les jonctions forment des stries verticales.
      // On compense par l'opacité pour garder l'aspect d'un trait de 0,5 px.
      const lw = Math.max(0.5, 1 / this.dpr);
      ctx.strokeStyle = `rgba(26, 26, 26, ${(rb.alpha * 0.5) / lw})`;
      ctx.lineWidth = lw;

      const xs = new Float32Array(steps + 1);
      const ys = new Float32Array(steps + 1);
      for (let i = 0; i < this.linesPerRibbon; i++) {
        const jit = this.jitter[ri * this.linesPerRibbon + i];
        // Position dans le ruban, légèrement irrégulière
        const k = (i + jit.offset * 0.9) / (this.linesPerRibbon - 1) - 0.5;
        for (let j = 0; j <= steps; j++) {
          const x = (j / steps) * w;
          const nx = j / steps;
          // Enveloppe : les rubans s'amincissent vers les bords
          const env = Math.sin(nx * Math.PI) ** 0.8;
          const n1 = perlin.noise(nx * 2.2 + rb.seed, s.t * 0.35 + ri * 3.1);
          const n2 = perlin.noise(nx * 5 + rb.seed + 40, s.t * 0.6 + k * 0.9);
          const wave = Math.sin(nx * Math.PI * 2.4 + s.t * 0.9 + ri * 1.7) * 0.35;
          // Petite ondulation propre à la ligne : pentes toutes différentes
          const own = perlin.noise(nx * 3.3 + jit.phase, s.t * 0.25 + jit.phase) * h * 0.012;
          const y =
            base +
            (n1 + wave) * amp * env +
            k * thickness * (0.6 + 0.4 * (n2 + 1)) * env +
            n2 * amp * 0.25 * env +
            own * env;
          xs[j] = x;
          ys[j] = y;
          if (ri === 0 && Math.abs(k) < 0.02 && y < crest.y && nx > 0.12 && nx < 0.88) crest = { x, y };
        }
        // Courbe lissée passant par les milieux : aucune couture visible
        ctx.beginPath();
        ctx.moveTo(xs[0], ys[0]);
        for (let j = 1; j < steps; j++) {
          ctx.quadraticCurveTo(xs[j], ys[j], (xs[j] + xs[j + 1]) / 2, (ys[j] + ys[j + 1]) / 2);
        }
        ctx.lineTo(xs[steps], ys[steps]);
        ctx.stroke();
      }
    });

    // Points orange posés sur les crêtes lors des pics, effacés en ~1,2 s
    for (const p of peaks) {
      const age = (now - p.born) / 1200;
      if (age >= 1) continue;
      const a = 1 - age;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 12);
      g.addColorStop(0, `rgba(255, 106, 26, ${0.35 * a})`);
      g.addColorStop(1, 'rgba(255, 106, 26, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 106, 26, ${a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    return crest;
  }
}
