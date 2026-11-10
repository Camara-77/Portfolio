// =========================================================
// Géométrie des décors « Voyage ».
// Toutes les scènes partagent le repère 0 0 1600 1000 : un tracé
// d'une scène peut ainsi se transformer (morphing) en un tracé
// d'une autre scène sans recalage.
// =========================================================

export const VIEWBOX = '0 0 1600 1000';
export type SceneName = 'bio' | 'code' | 'ayyou' | 'horizon';

/** Cadrage serré de chaque dessin (mobile : un dessin par chapitre). */
export const CROP: Record<SceneName, string> = {
  bio: '690 70 945 860',
  code: '700 90 880 840',
  ayyou: '690 90 925 820',
  horizon: '0 860 1600 140',
};

const r = (n: number) => Math.round(n * 10) / 10;

/** Lissage Catmull-Rom → Bézier (ouvert ou fermé). */
function smooth(pts: [number, number][], closed = false): string {
  const n = pts.length;
  const get = (i: number) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M${r(pts[0][0])} ${r(pts[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${r(c1[0])} ${r(c1[1])} ${r(c2[0])} ${r(c2[1])} ${r(p2[0])} ${r(p2[1])}`;
  }
  return closed ? d + ' Z' : d;
}

// ---------------------------------------------------------------- BIOLOGIE

/** Courbes de niveau (géosciences) : boucles concentriques irrégulières. */
function contours(cx: number, cy: number, radii: number[], squash: number, seed: number): string {
  return radii
    .map((rad, k) => {
      const pts: [number, number][] = [];
      const steps = 14;
      for (let i = 0; i < steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        const wob = 1 + 0.09 * Math.sin(a * 3 + seed + k * 0.7) + 0.05 * Math.cos(a * 5 + seed * 2);
        pts.push([cx + Math.cos(a) * rad * wob, cy + Math.sin(a) * rad * wob * squash]);
      }
      return smooth(pts, true);
    })
    .join(' ');
}

export const BIO_CONTOURS =
  contours(360, 790, [70, 140, 210, 280], 0.55, 1.2) +
  ' ' +
  contours(1420, 190, [50, 100, 150], 0.6, 2.7);

/** Double hélice d'ADN : deux brins sinusoïdaux (+ barreaux séparés). */
const DNA = { x: 830, top: 90, bottom: 910, amp: 72, period: 270 };

function strand(phase: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let y = DNA.top; y <= DNA.bottom; y += 15) {
    const t = ((y - DNA.top) / DNA.period) * Math.PI * 2 + phase;
    pts.push([DNA.x + DNA.amp * Math.sin(t), y]);
  }
  return pts;
}

export const DNA_STRANDS = `${smooth(strand(0))} ${smooth(strand(Math.PI))}`;

export const DNA_RUNGS = (() => {
  let d = '';
  for (let y = DNA.top + 12; y < DNA.bottom; y += 27) {
    const t = ((y - DNA.top) / DNA.period) * Math.PI * 2;
    const xa = DNA.x + DNA.amp * Math.sin(t);
    const xb = DNA.x - DNA.amp * Math.sin(t);
    if (Math.abs(xa - xb) > 18) d += `M${r(Math.min(xa, xb) + 6)} ${y} H${r(Math.max(xa, xb) - 6)} `;
  }
  return d.trim();
})();

/** Erlenmeyer : contour, graduations, liquide (orange), bulles. */
export const FLASK = {
  outline:
    'M1096 330 H1184 M1110 330 V438 L1006 708 Q999 732 1024 732 H1256 Q1281 732 1274 708 L1170 438 V330',
  marks: 'M1052 560 H1072 M1040 600 H1056 M1066 520 H1080',
  liquid: 'M1044 612 Q1140 596 1236 612 L1274 708 Q1281 732 1256 732 H1024 Q999 732 1006 708 Z',
  bubbles: [
    { cx: 1108, cy: 556, r: 7 },
    { cx: 1150, cy: 520, r: 4.5 },
    { cx: 1186, cy: 574, r: 5.5 },
    { cx: 1132, cy: 470, r: 3.5 },
  ],
};

/** Portoir et éprouvettes. */
export const TUBES = {
  rack: 'M1322 560 H1546 M1322 576 H1546 M1334 576 V760 M1534 576 V760 M1310 760 H1558',
  tubes: [1362, 1420, 1478]
    .map((x) => `M${x} 478 V706 A15 15 0 0 0 ${x + 30} 706 V478 M${x - 5} 478 H${x + 35}`)
    .join(' '),
  levels: 'M1362 640 H1392 M1420 676 H1450 M1478 610 H1508',
};

/** Serpent : corps en double trait, tête, langue fourchue. */
export const SNAKE = {
  body:
    'M1100 900 C1170 846 1240 958 1312 902 S1452 846 1508 884 ' +
    'M1106 918 C1176 866 1246 978 1318 920 S1456 866 1510 902',
  head: 'M1508 884 C1528 872 1552 880 1554 893 C1555 906 1530 912 1510 902',
  tongue: 'M1554 893 H1570 M1570 893 L1578 887 M1570 893 L1578 899',
};

// ---------------------------------------------------------------- CODE ET IA

/** Fenêtre d'éditeur. */
export const EDITOR = {
  frame: 'M736 112 H1182 Q1196 112 1196 126 V548 Q1196 562 1182 562 H736 Q722 562 722 548 V126 Q722 112 736 112 Z M722 150 H1196',
  dots: [748, 770, 792],
};

/** Lignes de code (cible du morphing de l'ADN). */
export const CODE_LINES = (() => {
  const lens = [230, 170, 270, 190, 120, 250, 210, 96, 240, 150, 196, 116, 180];
  const ind = [0, 1, 1, 2, 2, 1, 0, 1, 2, 2, 1, 0, 0];
  return lens
    .map((len, i) => {
      const x = 768 + ind[i] * 34;
      const y = 186 + i * 28;
      return `M${x} ${y} H${x + len}`;
    })
    .join(' ');
})();

/** Réseau de neurones : nœuds et liaisons (source du morphing vers la carte). */
const LAYERS = [
  { x: 1262, n: 4 },
  { x: 1350, n: 5 },
  { x: 1438, n: 4 },
  { x: 1530, n: 1 },
];
export const NET_NODES = LAYERS.flatMap((l, li) =>
  Array.from({ length: l.n }, (_, i) => ({
    cx: l.x,
    cy: 340 + (i - (l.n - 1) / 2) * 78,
    r: 13,
    out: li === LAYERS.length - 1,
  })),
);
export const NET_EDGES = (() => {
  let d = '';
  for (let li = 0; li < LAYERS.length - 1; li++) {
    const a = NET_NODES.filter((n) => n.cx === LAYERS[li].x);
    const b = NET_NODES.filter((n) => n.cx === LAYERS[li + 1].x);
    for (const p of a) for (const q of b) d += `M${p.cx + 13} ${r(p.cy)} L${q.cx - 13} ${r(q.cy)} `;
  }
  return d.trim();
})();

/** Onde vocale : barres verticales sous une enveloppe. */
export const VOICE_WAVE = (() => {
  let d = '';
  for (let i = 0; i <= 38; i++) {
    const x = 736 + i * 12;
    const env = Math.sin((i / 38) * Math.PI);
    const h = 6 + env * (22 + 18 * Math.abs(Math.sin(i * 1.7)) + 10 * Math.abs(Math.cos(i * 0.9)));
    d += `M${x} ${r(640 - h)} V${r(640 + h)} `;
  }
  return d.trim();
})();

/** Clavier au trait. */
export const KEYBOARD = (() => {
  const x0 = 900, y0 = 712, w = 620, h = 196;
  let d = `M${x0 + 16} ${y0} H${x0 + w - 16} Q${x0 + w} ${y0} ${x0 + w} ${y0 + 16} V${y0 + h - 16} Q${x0 + w} ${y0 + h} ${x0 + w - 16} ${y0 + h} H${x0 + 16} Q${x0} ${y0 + h} ${x0} ${y0 + h - 16} V${y0 + 16} Q${x0} ${y0} ${x0 + 16} ${y0} Z`;
  const key = (x: number, y: number, kw: number) =>
    ` M${x + 4} ${y} H${x + kw - 4} Q${x + kw} ${y} ${x + kw} ${y + 4} V${y + 30} Q${x + kw} ${y + 34} ${x + kw - 4} ${y + 34} H${x + 4} Q${x} ${y + 34} ${x} ${y + 30} V${y + 4} Q${x} ${y} ${x + 4} ${y} Z`;
  const rows = [
    { off: 18, n: 13, kw: 40 },
    { off: 34, n: 12, kw: 40 },
    { off: 50, n: 11, kw: 40 },
  ];
  rows.forEach((row, ri) => {
    for (let i = 0; i < row.n; i++) d += key(x0 + row.off + i * 46, y0 + 18 + ri * 42, row.kw);
  });
  d += key(x0 + 150, y0 + 144, 320);
  return d;
})();

// ---------------------------------------------------------------- AYYOU

/** Carte stylisée de la presqu'île du Cap-Vert (Dakar) + grands axes. */
export const MAP_OUTLINE = smooth(
  [
    [1572, 268],
    [1470, 240],
    [1360, 226],
    [1250, 204],
    [1140, 182],
    [1046, 170],
    [976, 186],
    [944, 230],
    [968, 286],
    [1022, 330],
    [1080, 372],
    [1130, 420],
    [1168, 478],
    [1196, 530],
    [1236, 510],
    [1290, 470],
    [1380, 440],
    [1480, 430],
    [1572, 424],
  ],
  false,
);
export const MAP_ROADS =
  'M1000 252 C1150 270 1330 300 1560 346 M1110 214 C1150 300 1180 380 1196 500 M1060 330 C1220 300 1380 290 1560 300';
export const MAP = `${MAP_OUTLINE} ${MAP_ROADS}`;

/** Trajet de livraison (orange, pointillé) et repères. */
export const ROUTE = 'M1452 372 C1390 332 1330 392 1262 344 S1132 268 1066 250';
export const ROUTE_FROM = { cx: 1452, cy: 372 };
export const ROUTE_TO_PIN = 'M1066 250 C1066 232 1050 222 1050 208 A16 16 0 1 1 1082 208 C1082 222 1066 232 1066 250 Z';

/** Gargote : auvent rayé, comptoir, marmite fumante. */
export const GARGOTE = {
  awning:
    'M716 600 H1004 L986 650 H734 Z M752 600 L746 650 M788 600 L784 650 M824 600 L822 650 M860 600 V650 M896 600 L898 650 M932 600 L936 650 M968 600 L974 650',
  posts: 'M738 650 V888 M982 650 V888',
  counter: 'M720 806 H1000 M720 820 H1000 M730 820 V888 M990 820 V888',
  pot: 'M826 806 V760 Q826 742 846 742 H930 Q950 742 950 760 V806 M816 742 H960 M836 742 Q888 722 940 742 M812 768 H826 M950 768 H964',
  steam: 'M858 712 C846 692 870 680 858 656 M888 706 C876 684 900 672 888 646 M918 712 C906 692 930 680 918 656',
};

/** Plat : thiéboudienne stylisé (assiette, riz, poisson). */
export const PLATE = {
  plate: 'M1030 834 A86 26 0 1 0 1202 834 A86 26 0 1 0 1030 834 Z M1050 834 A66 18 0 1 0 1182 834',
  food: 'M1062 830 Q1116 790 1170 830 M1086 818 Q1106 804 1130 812 Q1146 806 1156 816 Q1146 822 1130 818 Q1106 826 1086 818 Z',
};

/** Livreur à moto (scooter vu de profil, caisse de livraison à l'arrière). */
export const MOTO = {
  wheels: [
    { cx: 1296, cy: 842, r: 38 },
    { cx: 1470, cy: 842, r: 38 },
  ],
  hubs: [
    { cx: 1296, cy: 842, r: 6 },
    { cx: 1470, cy: 842, r: 6 },
  ],
  body:
    'M1250 840 C1246 800 1280 776 1334 776 H1392 ' + // capot arrière + selle
    'M1340 776 C1354 802 1356 818 1344 824 H1430 ' + // plancher
    'C1446 800 1452 776 1450 752 ' + // tablier avant
    'M1470 842 L1446 744 M1432 744 H1468 ' + // fourche + guidon
    'M1258 842 H1334', // bas de caisse
  rider: 'M1386 776 L1402 712 L1448 744 M1386 776 L1414 798 L1404 824',
  head: { cx: 1404, cy: 690, r: 17 },
  box: 'M1296 714 H1360 V774 H1296 Z M1296 732 H1360',
};

/** Trophée (petite touche orange). */
export const TROPHY =
  'M1520 560 H1572 V590 A26 26 0 0 1 1520 590 Z M1520 568 H1506 Q1500 568 1500 576 Q1502 594 1522 598 M1572 568 H1586 Q1592 568 1592 576 Q1590 594 1570 598 M1546 616 V632 M1530 646 H1562 L1558 632 H1534 Z';

// ---------------------------------------------------------------- ÉPILOGUE

// Bas du décor : ne traverse pas les coordonnées de contact
export const HORIZON = 'M0 968 H1600';
