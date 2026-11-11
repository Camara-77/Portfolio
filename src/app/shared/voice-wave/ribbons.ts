// =========================================================
// Rubans de « fumée » : 2 rubans distincts (centrés à 42 % et 58 %
// de la hauteur) de 60 à 70 lignes très fines (0,6 px, opacité
// 5 à 10 %). Chaque ligne a sa propre phase et une torsion décalée :
// les lignes se croisent et forment des zones plus sombres (voile).
//
// Au repos : aucun pincement, les rubans commencent et finissent hors
// du canvas et respirent lentement. En lecture : ils partent du micro
// (pincés en un point) et s'ouvrent vers la droite ; le pincement
// s'efface progressivement après.
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
  /** Mode : 0 = repos (toute la largeur), 1 = lecture (depuis le micro). */
  live: number;
  /** Abscisse du centre du micro (px, repère du canvas). */
  anchorX: number;
  /** Ordonnée du centre du micro (px). */
  anchorY: number;
}

export interface Peak {
  x: number;
  y: number;
  born: number;
}

// offset : centre du ruban par rapport au milieu (0,42 et 0,58 de la hauteur)
const RIBBONS = [
  { offset: -0.08, seed: 0, width: 0.26, alpha: 0.06, twist: 1.5 },
  { offset: 0.08, seed: 23, width: 0.22, alpha: 0.09, twist: 1.9 },
];

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export class RibbonRenderer {
  private readonly perlin = new Perlin(11);
  private readonly ctx: CanvasRenderingContext2D;
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
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
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
   * Dessine les rubans. Renvoie la crête (point le plus haut) du premier
   * ruban, pour y poser un point orange lors d'un pic de voix.
   */
  draw(s: RibbonState, peaks: Peak[], now: number): { x: number; y: number } {
    const { ctx, w, h, perlin } = this;
    ctx.clearRect(0, 0, w, h);
    if (!w || !h) return { x: 0, y: 0 };

    const mid = h / 2;
    const steps = Math.max(32, Math.round(w / 14));
    const amp = h * (0.06 + s.level * 0.3); // respiration → voix
    // Départ : hors du canvas au repos (aucun pincement), centre du micro en lecture
    const restStart = -0.06 * w;
    const restEnd = 1.06 * w;
    const x0 = restStart + (s.anchorX - restStart) * s.live;
    const span = Math.max(1, restEnd - x0);
    let crest = { x: (x0 + w) / 2, y: h };

    // Trait d'au moins 1 pixel physique (sinon stries verticales), opacité compensée
    const lw = Math.max(0.6, 1.25 / this.dpr); // > 1 px physique : vrai tracé, pas de « hairline »
    const xs = new Float32Array(steps + 1);
    const ys = new Float32Array(steps + 1);

    RIBBONS.forEach((rb, ri) => {
      ctx.strokeStyle = `rgba(26, 26, 26, ${(rb.alpha * 0.6) / lw})`;
      ctx.lineWidth = lw;

      for (let i = 0; i < this.linesPerRibbon; i++) {
        const jit = this.jitter[ri * this.linesPerRibbon + i];
        const k = (i + jit.offset * 0.9) / (this.linesPerRibbon - 1) - 0.5;

        for (let j = 0; j <= steps; j++) {
          const u = j / steps; // 0 → 1 le long du ruban
          const x = x0 + u * span;
          const nx = x / w;
          // Enveloppe : pleine au repos ; pincée au micro en lecture
          const envLive = smooth(0, 0.22, u);
          const env = 1 + (envLive - 1) * s.live;

          const n1 = perlin.noise(nx * 2.2 + rb.seed, s.t * 0.35 + ri * 3.1);
          const n2 = perlin.noise(nx * 5 + rb.seed + 40, s.t * 0.6 + k * 0.9);
          // Phase propre à la ligne
          const own =
            (perlin.noise(nx * 3.3 + jit.phase, s.t * 0.25 + jit.phase) * 0.6 +
              Math.sin(nx * Math.PI * 2 + jit.phase + s.t * 0.3) * 0.4) *
            h * 0.016;
          const wave = Math.sin(nx * Math.PI * 2.4 + s.t * 0.9 + ri * 1.7) * 0.35;
          // Torsion : la position de la ligne dans le ruban s'inverse le long de x,
          // avec un décalage par ligne → croisements à des endroits différents
          const twist = Math.cos(nx * Math.PI * rb.twist + s.t * 0.18 + ri * 1.9 + k * 1.2);
          const centre = mid + (s.anchorY - mid) * s.live * (1 - smooth(0, 0.3, u));
          const base = centre + rb.offset * h * s.spread * env;
          const thickness = h * rb.width * (0.15 + 0.85 * s.spread);
          const y =
            base +
            (n1 + wave) * amp * env +
            k * thickness * twist * (0.75 + 0.25 * n2) * env +
            n2 * amp * 0.2 * env +
            own * env;
          xs[j] = x;
          ys[j] = y;
          if (ri === 0 && Math.abs(k) < 0.02 && y < crest.y && u > 0.15 && u < 0.9) crest = { x, y };
        }

        // Courbe lissée passant par les milieux
        ctx.beginPath();
        ctx.moveTo(xs[0], ys[0]);
        for (let j = 1; j < steps; j++) {
          ctx.quadraticCurveTo(xs[j], ys[j], (xs[j] + xs[j + 1]) / 2, (ys[j] + ys[j + 1]) / 2);
        }
        ctx.lineTo(xs[steps], ys[steps]);
        ctx.stroke();
      }
    });

    // Points orange (halo) posés sur les crêtes lors des pics, effacés en 1,2 s
    for (const p of peaks) {
      const age = (now - p.born) / 1200;
      if (age >= 1) continue;
      const a = 1 - age;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 14);
      g.addColorStop(0, `rgba(255, 106, 26, ${0.38 * a})`);
      g.addColorStop(1, 'rgba(255, 106, 26, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 106, 26, ${a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }

    return crest;
  }
}
