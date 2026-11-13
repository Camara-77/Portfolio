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
  bio: '640 120 1100 780',
  code: '680 120 910 820',
  ayyou: '690 90 925 820',
  horizon: '0 780 1600 140',
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

// ---------------------------------------------------------------- PARCOURS (BIOLOGIE)

/**
 * Double hélice d'ADN, centrée dans la moitié droite (desktop) et
 * inclinée de 12°. Hauteur ≈ 80 % de la section Parcours quand elle
 * est à l'écran. Deux brins sinusoïdaux + barreaux (3 en orange).
 */
const DNA = { cx: 1190, cy: 520, height: 520, amp: 62, period: 205, tilt: 12 };

const TILT = (DNA.tilt * Math.PI) / 180;
/** Rotation autour du centre de l'hélice (inclinaison intégrée au tracé). */
function tilt([x, y]: [number, number]): [number, number] {
  const dx = x - DNA.cx, dy = y - DNA.cy;
  return [DNA.cx + dx * Math.cos(TILT) - dy * Math.sin(TILT), DNA.cy + dx * Math.sin(TILT) + dy * Math.cos(TILT)];
}

const DNA_TOP = DNA.cy - DNA.height / 2;
const DNA_BOTTOM = DNA.cy + DNA.height / 2;
const dnaX = (y: number, phase: number) =>
  DNA.cx + DNA.amp * Math.sin(((y - DNA_TOP) / DNA.period) * Math.PI * 2 + phase);

function strand(phase: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let y = DNA_TOP; y <= DNA_BOTTOM; y += 6) pts.push(tilt([dnaX(y, phase), y]));
  return pts;
}

export const DNA_STRANDS = `${smooth(strand(0))} ${smooth(strand(Math.PI))}`;

/** Barreaux de l'échelle ; les indices de DNA_ACCENT_AT sont en orange. */
const DNA_ACCENT_AT = [7, 17, 27];
const RUNGS = (() => {
  const out: string[] = [];
  for (let y = DNA_TOP + 8; y < DNA_BOTTOM; y += 16) {
    const xa = dnaX(y, 0), xb = dnaX(y, Math.PI);
    if (Math.abs(xa - xb) < 16) continue;
    const [p, q] = [tilt([Math.min(xa, xb) + 5, y]), tilt([Math.max(xa, xb) - 5, y])];
    out.push(`M${r(p[0])} ${r(p[1])} L${r(q[0])} ${r(q[1])}`);
  }
  return out;
})();
export const DNA_RUNGS = RUNGS.filter((_, i) => !DNA_ACCENT_AT.includes(i)).join(' ');
export const DNA_RUNGS_ACCENT = RUNGS.filter((_, i) => DNA_ACCENT_AT.includes(i)).join(' ');

// ---------------------------------------------------------------- CODE ET IA

/** Fenêtre d'éditeur. */
export const EDITOR = {
  frame:
    'M716 150 H1256 Q1272 150 1272 166 V456 Q1272 472 1256 472 H716 Q700 472 700 456 V166 Q700 150 716 150 Z M700 188 H1272',
  dots: [722, 744, 766],
};

/** Vraies lignes de Python, écrites au défilement (effet machine à écrire). */
export const CODE_TEXT = [
  'import whisper',
  'model = whisper.load_model("small")',
  'text = model.transcribe("note.mp3")["text"]',
  'reply = chatbot.ask(text)',
  'print(reply)',
];
export const CODE_FONT = 17; // unités du repère
export const CODE_X = 726;
export const CODE_Y = (i: number) => 236 + i * 46;
const CHAR_W = CODE_FONT * 0.6; // JetBrains Mono : chasse fixe

/** Traits à l'emplacement des lignes de code (cible du morphing des barreaux). */
export const CODE_LINE_PATHS = CODE_TEXT.map(
  (t, i) => `M${CODE_X} ${CODE_Y(i) - 6} H${Math.round(CODE_X + t.length * CHAR_W)}`,
);
export const CODE_LINES = CODE_LINE_PATHS.join(' ');
/** Ligne de code qui reçoit les barreaux orange. */
export const CODE_ACCENT_LINE = 2;

/** Terminal : vraies commandes de lancement des trois services. */
export const TERMINAL = {
  frame:
    'M716 540 H1164 Q1180 540 1180 556 V724 Q1180 740 1164 740 H716 Q700 740 700 724 V556 Q700 540 716 540 Z M700 574 H1180',
  dots: [722, 744, 766],
  dotsY: 557,
  lines: ['python manage.py runserver', 'ng serve', 'uvicorn main:app'],
  x: 726,
  y: (i: number) => 612 + i * 40,
};

/** Schéma d'architecture : Angular → Django REST → FastAPI → PostgreSQL. */
const ARCH_W = 150, ARCH_GAP = 92, ARCH_X = 700, ARCH_Y = 840, ARCH_H = 56;
export const ARCH = (() => {
  const labels = ['Angular', 'Django REST', 'FastAPI', 'PostgreSQL'];
  const boxes = labels.map((label, i) => {
    const x = ARCH_X + i * (ARCH_W + ARCH_GAP);
    return {
      label,
      cx: x + ARCH_W / 2,
      d: `M${x + 10} ${ARCH_Y} H${x + ARCH_W - 10} Q${x + ARCH_W} ${ARCH_Y} ${x + ARCH_W} ${ARCH_Y + 10} V${ARCH_Y + ARCH_H - 10} Q${x + ARCH_W} ${ARCH_Y + ARCH_H} ${x + ARCH_W - 10} ${ARCH_Y + ARCH_H} H${x + 10} Q${x} ${ARCH_Y + ARCH_H} ${x} ${ARCH_Y + ARCH_H - 10} V${ARCH_Y + 10} Q${x} ${ARCH_Y} ${x + 10} ${ARCH_Y} Z`,
    };
  });
  const y = ARCH_Y + ARCH_H / 2;
  const links = labels.slice(1).map((_, i) => {
    const x0 = ARCH_X + (i + 1) * ARCH_W + i * ARCH_GAP + 10;
    const x1 = x0 + ARCH_GAP - 20;
    return { x0, x1, d: `M${x0} ${y} H${x1} M${x1 - 8} ${y - 6} L${x1} ${y} L${x1 - 8} ${y + 6}` };
  });
  return { boxes, links, y, textY: y + 5, travel: ARCH_GAP - 32 };
})();

/** Petit robot sympathique (l'IA) qui « écoute ». */
export const ROBOT = {
  antenna: 'M1435 300 V264',
  ball: { cx: 1435, cy: 255, r: 9 },
  head: 'M1393 300 H1477 Q1495 300 1495 318 V372 Q1495 390 1477 390 H1393 Q1375 390 1375 372 V318 Q1375 300 1393 300 Z',
  ears: 'M1375 332 H1365 V358 H1375 M1495 332 H1505 V358 H1495',
  eyes: [
    { cx: 1412, cy: 340, r: 8 },
    { cx: 1458, cy: 340, r: 8 },
  ],
  smile: 'M1418 364 Q1435 377 1452 364',
  neck: 'M1424 390 V404 M1446 390 V404',
  body: 'M1381 404 H1489 Q1505 404 1505 420 V524 Q1505 540 1489 540 H1381 Q1365 540 1365 524 V420 Q1365 404 1381 404 Z',
  panel: 'M1435 449 A16 16 0 1 1 1434.9 449 M1395 506 H1475 M1395 520 H1450',
  arms: 'M1365 432 Q1336 470 1346 522 M1505 432 Q1536 438 1548 402 M1542 396 L1548 402 L1556 398',
  legs: 'M1405 540 V598 M1465 540 V598 M1390 598 H1420 M1450 598 H1480',
};

/** Onde sonore orange qui part de l'antenne (le robot écoute). */
export const ROBOT_WAVES = (() => {
  const { cx, cy } = ROBOT.ball;
  const arc = (r: number, a0: number, a1: number) => {
    const p = (a: number) => `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
    return `M${p(a0)} A${r} ${r} 0 0 1 ${p(a1)}`;
  };
  const d = (deg: number) => (deg * Math.PI) / 180;
  return [20, 32, 44]
    .map((r) => `${arc(r, d(-45), d(45))} ${arc(r, d(135), d(225))}`)
    .join(' ');
})();

/** Réseau de neurones : nœuds et liaisons (source du morphing vers la carte). */
const NET_R = 8;
const LAYERS = [
  { x: 1270, n: 4 },
  { x: 1360, n: 5 },
  { x: 1450, n: 4 },
  { x: 1540, n: 1 },
];
export const NET_NODES = LAYERS.flatMap((l, li) =>
  Array.from({ length: l.n }, (_, i) => ({
    cx: l.x,
    cy: 720 + (i - (l.n - 1) / 2) * 30,
    r: NET_R,
    out: li === LAYERS.length - 1,
  })),
);
export const NET_EDGES = (() => {
  let d = '';
  for (let li = 0; li < LAYERS.length - 1; li++) {
    const a = NET_NODES.filter((n) => n.cx === LAYERS[li].x);
    const b = NET_NODES.filter((n) => n.cx === LAYERS[li + 1].x);
    for (const p of a) for (const q of b) d += `M${p.cx + NET_R} ${r(p.cy)} L${q.cx - NET_R} ${r(q.cy)} `;
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

// Bas du décor : une ligne de terminal (l'horizon sert de ligne de saisie,
// invite et curseur qui clignote) ; ne traverse pas les coordonnées de contact.
// L'invite est à droite : la moitié gauche est voilée derrière le texte.
export const PROMPT = { text: 'aissatou@dakar:~$', x: 1220, y: 846 };
export const CURSOR = { x: Math.round(1220 + 17 * 17 * 0.6 + 10), y: 830, w: 10, h: 20 };
export const HORIZON = 'M0 862 H1600';
