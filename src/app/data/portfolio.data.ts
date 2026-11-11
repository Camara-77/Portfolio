// =========================================================
// Portfolio « Voyage » — tout le contenu texte du site.
// Règle : aucune information inventée. Ce qui manque est
// signalé par `todo` et affiché comme TODO visible.
// =========================================================

export interface Link {
  label: string;
  href: string;
  display: string;
}

export interface Identity {
  name: string;
  initials: string;
  title: string;
  location: string;
  locationShort: string;
  email: string;
  phone: string;
  phoneHref: string;
  linkedin: Link;
  github: Link;
  tiktok: Link;
  tagline: string;
}

/** Repère cliquable sur la barre de progression d'une note vocale. */
export interface VoiceMarker {
  /** Position en secondes ; null = pas encore connue (le repère ne s'affiche pas). */
  time: number | null;
  label: string;
}

/** Note vocale : le lecteur est désactivé (« bientôt ») si le fichier est absent. */
export interface VoiceNote {
  /** Fichier joué (voix + musique). */
  src: string;
  /** Voix seule, calée sur la même timeline : sert à animer les rubans. */
  analysisSrc?: string;
  label: string;
  /** Paragraphes de la transcription ; vide = transcription à venir. */
  transcript: string[];
  markers?: VoiceMarker[];
}

export interface Milestone {
  date?: string;
  title: string;
  place?: string;
}

export interface Project {
  name: string;
  description: string;
  stack: string[];
  link: Link;
  role?: string;
  meta?: string;
}

export interface AwardPhoto {
  src: string;
  caption: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface Award {
  label: string;
  rank: string;
  title: string;
  organization: string;
  event: string;
  venue: string;
  date: string;
  /** Galerie : la 1re photo est la grande image de la grille. */
  photos: AwardPhoto[];
}

export interface Service {
  name: string;
  role?: string;
  stack: string[];
  repo: Link;
}

export interface ChapterBase {
  id: string;
  index: string;
  label: string;
  period: string;
  title: string;
  /** Mot du titre affiché en contour. */
  outline?: string;
  /** Phrase affichée (version courte). */
  summary: string;
  /** Textes longs conservés (non affichés). */
  paragraphs: string[];
  milestones: Milestone[];
}

export interface KeyFigure {
  value: string;
  label: string;
}

export interface CodeChapter extends ChapterBase {
  projectsTitle: string;
  projects: Project[];
}

export interface AyyouChapter extends ChapterBase {
  origin: string[];
  /** Ligne d'architecture affichée : Angular → Django → FastAPI (IA). */
  pipeline: { label: string; repo: Link }[];
  figures: KeyFigure[];
  built: string;
  services: Service[];
  facts: string[];
  status: string;
  award: Award;
  links: Link[];
  othersTitle: string;
  othersToggle: string;
  others: Project[];
}

export type ProjectArt =
  | 'ayyou'
  | 'rag'
  | 'sentiment'
  | 'ande'
  | 'joj-event'
  | 'joj-news'
  | 'ecostock'
  | 'helpdesk';

/** Un cadre du chapitre « Projets ». */
export interface ProjectFrame {
  art: ProjectArt;
  name: string;
  phrase: string;
  stack: string[];
  links: Link[];
  /** Cadre mis en avant (AYYOU) avec le tampon du prix. */
  feature?: boolean;
}

export type ToolIcon = 'wrench' | 'brush' | 'beaker' | 'cylinder' | 'gear';

export interface ToolGroup {
  icon: ToolIcon;
  title: string;
  items: string[];
}

export interface NavItem {
  id: string;
  index: string;
  label: string;
}

export interface Portfolio {
  seo: { title: string; description: string };
  nav: NavItem[];
  identity: Identity;
  opening: {
    word: string;
    /** Couverture : prénom en petit, nom sur deux lignes. */
    kicker: string;
    lines: string[];
    phrase: string;
    dateline: string;
    scrollHint: string;
    voice: VoiceNote;
  };
  biology: ChapterBase & { motto: string };
  code: CodeChapter;
  ayyou: AyyouChapter;
  projects: {
    id: string;
    index: string;
    label: string;
    title: string;
    outline: string;
    stamp: string;
    frames: ProjectFrame[];
  };
  toolbox: {
    id: string;
    index: string;
    label: string;
    title: string;
    outline: string;
    groups: ToolGroup[];
    soft: string[];
  };
  epilogue: {
    index: string;
    label: string;
    title: string;
    outline: string;
    intro: string;
    voice: VoiceNote;
    tiktokLine: string;
  };
  cv: { href: string; fileName: string };
  footer: string;
}

const GITHUB = (repo: string): Link => ({
  label: 'GitHub',
  href: `https://github.com/${repo}`,
  display: repo,
});

export const PORTFOLIO: Portfolio = {
  seo: {
    title: 'Aïssatou Combe Camara — Développeuse Full-Stack & IA',
    description:
      "De la biologie au code et à l'IA, jusqu'à AYYOU : le parcours d'Aïssatou Combe Camara, développeuse Full-Stack & IA à Dakar.",
  },

  nav: [
    { id: 'biologie', index: '01', label: 'Biologie' },
    { id: 'code', index: '02', label: 'Code et IA' },
    { id: 'projets', index: '03', label: 'Projets' },
    { id: 'outils', index: '04', label: 'Boîte à outils' },
    { id: 'contact', index: '—', label: 'Contact' },
  ],

  identity: {
    name: 'Aïssatou Combe Camara',
    initials: 'A.C.C',
    title: 'Développeuse Full-Stack & IA',
    location: 'Keur Massar, Dakar, Sénégal',
    locationShort: 'Dakar, Sénégal',
    email: 'aissatoucombecamara71@gmail.com',
    phone: '+221 77 385 26 51',
    phoneHref: 'tel:+221773852651',
    linkedin: {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/a%C3%AFssatou-combe-camara-3470b0221',
      display: 'aïssatou-combe-camara',
    },
    github: { label: 'GitHub', href: 'https://github.com/Camara-77', display: 'Camara-77' },
    tiktok: { label: 'TikTok', href: 'https://www.tiktok.com/@aissatouotaku', display: '@aissatouotaku' },
    tagline:
      "Je conçois et développe des applications web complètes, du back-end à l'interface, en y intégrant l'intelligence artificielle pour résoudre des problèmes concrets.",
  },

  opening: {
    word: 'AÏSSATOU',
    kicker: 'AÏSSATOU',
    lines: ['AÏSSATOU', 'COMBE', 'CAMARA'],
    phrase: 'J’apprends aux machines à écouter, et je crée des solutions utiles.',
    dateline: 'Dakar, 2026',
    scrollHint: 'Faites défiler : trois chapitres',
    voice: {
      src: 'audio/note-intro.mp3',
      analysisSrc: 'audio/note-intro-voix.mp3',
      label: 'Écouter mon histoire',
      transcript: [
        "Il y a quelques années, j’étudiais les cellules, les molécules et les roches de la Terre. Aujourd’hui, j’apprends aux machines à écouter, à transcrire, et je crée des solutions innovantes. Entre les deux, il y a une gargote, une maman, et un projet qui a tout changé. Moi, c’est Aïssatou Combe Camara. Faites défiler, je vous emmène dans mon histoire.",
      ],
    },
  },

  // ------------------------------------------------ Chapitre 1
  biology: {
    id: 'biologie',
    index: '01',
    label: 'Biologie',
    period: '2021 – 2024',
    title: 'Le vivant',
    outline: 'vivant',
    summary:
      'Tout a commencé par le vivant : un bac S2, puis une licence en Biologie, Chimie et Géosciences à l’UCAD.',
    motto: 'Analyser. Tester. Documenter.',
    paragraphs: [
      "Tout a commencé par la biologie. Après un baccalauréat S2, j'ai suivi une Licence en Biologie, Chimie et Géosciences à l'UCAD.",
      "J'y ai nourri ma curiosité pour le vivant, et une méthode que je garde aujourd'hui : analyser, tester, documenter.",
    ],
    milestones: [
      { date: '2021', title: 'Baccalauréat S2' },
      { date: '2021 – 2024', title: 'Licence Biologie, Chimie, Géosciences', place: 'UCAD, Dakar' },
    ],
  },

  // ------------------------------------------------ Chapitre 2
  code: {
    id: 'code',
    index: '02',
    label: 'Code et IA',
    period: '2024 – 2026',
    title: 'Du vivant au code',
    outline: 'code',
    summary:
      'J’ai appris à coder en génie logiciel, puis chez Simplon Sénégal. Aujourd’hui, j’apprends aux machines à écouter.',
    paragraphs: [
      "J'ai découvert la programmation avec une L1 en génie logiciel, puis j'ai rejoint Simplon Sénégal, Promo 9, en développement web, web mobile et IA.",
      "Je construis des applications complètes avec Django, Angular et FastAPI, et j'y intègre l'IA : transcription vocale, chatbots, RAG, analyse de sentiments.",
    ],
    milestones: [
      { title: 'L1 Génie logiciel' },
      {
        date: 'Nov. 2025 – Oct. 2026',
        title: 'Développeuse Web & Web Mobile, IA',
        place: 'Simplon Sénégal · Promo 9',
      },
    ],
    projectsTitle: 'Projets IA',
    projects: [
      {
        name: 'Assistant RAG',
        description:
          'Répond en langage naturel aux questions sur un règlement intérieur PDF, avec un index vectoriel FAISS et Llama 3.2 en local.',
        stack: ['LangChain', 'FAISS', 'Hugging Face', 'Llama 3.2'],
        link: GITHUB('Camara-77/mon-rag'),
      },
      {
        name: "API d'analyse de sentiments",
        description:
          "API FastAPI qui détecte le sentiment d'un avis client et signale les cas urgents, avec un modèle Hugging Face multilingue choisi après une comparaison documentée.",
        stack: ['FastAPI', 'Transformers'],
        meta: 'Projet perso · Juillet 2026',
        link: GITHUB('Camara-77/huggin-face'),
      },
      {
        name: 'Andë Sétal',
        role: 'Responsable IA',
        description: 'Responsable IA dans une équipe de 4 ; microservices Django et FastAPI.',
        stack: ['Django', 'FastAPI', 'JWT', 'Docker'],
        link: GITHUB('AndeSetale/ai-ande-settal'),
      },
    ],
  },

  // ------------------------------------------------ Chapitre 3
  ayyou: {
    id: 'ayyou',
    index: '03',
    label: 'AYYOU',
    period: '2026',
    title: 'AYYOU',
    origin: [
      'Ma mère tient une gargote, exclue des grandes plateformes de livraison.',
      'AYYOU est né de là : une plateforme FoodTech de commande et de livraison de repas au Sénégal.',
    ],
    summary: 'Alors j’ai construit AYYOU, seule.',
    paragraphs: [],
    built: "Je l'ai construite seule, du front-end au service d'IA.",
    pipeline: [
      { label: 'Angular', repo: GITHUB('Ayyou-all/ayyou-frontend') },
      { label: 'Django', repo: GITHUB('Ayyou-all/ayyou-backend') },
      { label: 'FastAPI (IA)', repo: GITHUB('Ayyou-all/ayyou-ai') },
    ],
    figures: [
      { value: '156', label: 'tests' },
      { value: '3', label: 'services' },
      { value: '1er prix', label: 'Pitch Day 2026' },
    ],
    services: [
      {
        name: 'Front-end',
        stack: ['Angular', 'TypeScript', 'Tailwind CSS', 'Leaflet', 'Chart.js'],
        repo: GITHUB('Ayyou-all/ayyou-frontend'),
      },
      {
        name: 'Back-end',
        stack: ['Django', 'Django REST Framework', 'JWT', 'PostgreSQL', 'OpenAPI'],
        repo: GITHUB('Ayyou-all/ayyou-backend'),
      },
      {
        name: 'Service IA',
        role: 'Microservice séparé, accessible seulement par le back-end via une clé interne.',
        stack: ['FastAPI'],
        repo: GITHUB('Ayyou-all/ayyou-ai'),
      },
    ],
    facts: [
      '4 espaces : client, restaurant, livreur, administrateur',
      'Paiement Wave et Orange Money via PayTech',
      'Recherche vocale, chatbot culinaire, recommandations',
      '172 commits · 156 tests · 15 modules back-end',
    ],
    status: 'Déployée en ligne, lancement en préparation.',
    milestones: [
      { date: '23 oct. 2026', title: 'Soutenance validée', place: 'Simplon Sénégal' },
      {
        date: '28 oct. 2026',
        title: '1er prix — Meilleur projet entrepreneurial',
        place: 'Pitch Day 2026, Fabrique 360 · Simplon Sénégal',
      },
    ],
    award: {
      label: '1er prix — Meilleur projet entrepreneurial · Simplon Sénégal',
      rank: '1er prix',
      title: 'Meilleur projet entrepreneurial',
      organization: 'Simplon Sénégal',
      event: 'Pitch Day 2026',
      venue: 'Fabrique 360, incubateur de Simplon Sénégal',
      date: '28 octobre 2026',
      // Ordre = grille : grande photo à gauche, attestation (paysage) en haut
      // à droite, remise et trophée (portrait) en dessous.
      photos: [
        {
          src: 'images/prix-portrait.webp',
          caption: 'Avec le trophée',
          alt: 'Aïssatou Combe Camara, souriante, tient le trophée du 1er prix et son attestation Simplon Sénégal.',
          width: 810,
          height: 1080,
        },
        {
          src: 'images/prix-attestation.webp',
          caption: 'Trophée et attestation',
          alt: "Le trophée en verre du 1er prix posé devant l'attestation de participation au Pitch Day 2026, au nom d'Aïssatou Combe Camara.",
          width: 1080,
          height: 810,
        },
        {
          src: 'images/prix-remise.webp',
          caption: 'Remise du prix',
          alt: 'Remise du prix sur scène lors du Pitch Day 2026 à la Fabrique 360, devant les kakémonos Simplon Sénégal.',
          width: 810,
          height: 1080,
        },
        {
          src: 'images/prix-trophee.webp',
          caption: 'Le trophée',
          alt: 'Trophée en verre « 1er prix — Meilleur projet entrepreneurial », Pitch Day 2026, Simplon Sénégal, 28 octobre 2026.',
          width: 810,
          height: 1080,
        },
      ],
    },
    links: [
      { label: 'Site', href: 'https://ayyou.site', display: 'ayyou.site' },
      { label: 'GitHub', href: 'https://github.com/Ayyou-all', display: 'Ayyou-all' },
    ],
    othersTitle: 'Autres projets',
    othersToggle: 'Voir mes autres projets',
    others: [
      {
        name: 'JOJ_EVENT',
        description: 'Plateforme spectateurs des JOJ Dakar, équipe de 4.',
        stack: ['Django', 'Figma', 'Agile'],
        link: {
          label: 'Figma',
          href: 'https://www.figma.com/design/u7zX1iIs5N9tuLfWl2xlXx/JOJ-EVENTS',
          display: 'JOJ-EVENTS',
        },
      },
      {
        name: 'JOJ News',
        description:
          "Journal des supporters des JOJ Dakar : articles, commentaires sécurisés et e-mail automatique à l'administrateur.",
        stack: ['Django', 'Bootstrap', 'MySQL'],
        link: GITHUB('moussacode/joj_news'),
      },
      {
        name: 'API Eco-Stock',
        description:
          "API REST de gestion d'entrepôts pour la logistique du don alimentaire, avec transferts bloqués pour les produits périmés et routes sécurisées par JWT.",
        stack: ['Django REST Framework', 'JWT'],
        link: GITHUB('Camara-77/ecostock'),
      },
      {
        name: 'Helpdesk sécurisé',
        description:
          "Centralise les demandes de support d'un centre de formation, avec mots de passe hachés (bcrypt) et données isolées par utilisateur.",
        stack: ['Python', 'MySQL', 'bcrypt'],
        link: GITHUB('Camara-77/gestion_simplon'),
      },
    ],
  },

  // ------------------------------------------------ Chapitre 3 · Projets
  projects: {
    id: 'projets',
    index: '03',
    label: 'Projets',
    title: 'Ce que j’ai construit',
    outline: 'construit',
    stamp: '1er prix · Pitch Day 2026',
    frames: [
      {
        art: 'ayyou',
        name: 'AYYOU',
        phrase:
          'Plateforme de commande et de livraison de repas au Sénégal, née de la gargote de ma mère. Construite seule.',
        stack: ['Angular', 'Django', 'FastAPI'],
        links: [
          { label: 'Site', href: 'https://ayyou.site', display: 'ayyou.site' },
          GITHUB('Ayyou-all'),
        ],
        feature: true,
      },
      {
        art: 'rag',
        name: 'Assistant RAG',
        phrase:
          'Répond en langage naturel aux questions sur un règlement intérieur PDF, avec un index vectoriel FAISS et Llama 3.2 en local.',
        stack: ['LangChain', 'FAISS', 'Hugging Face', 'Llama 3.2'],
        links: [GITHUB('Camara-77/mon-rag')],
      },
      {
        art: 'sentiment',
        name: "API d'analyse de sentiments",
        phrase:
          "Détecte le sentiment d'un avis client et signale les cas urgents, avec un modèle Hugging Face multilingue choisi après une comparaison documentée.",
        stack: ['FastAPI', 'Transformers'],
        links: [GITHUB('Camara-77/huggin-face')],
      },
      {
        art: 'ande',
        name: 'Andë Sétal',
        phrase: 'Responsable IA dans une équipe de 4 ; microservices Django et FastAPI.',
        stack: ['Django', 'FastAPI', 'JWT', 'Docker'],
        links: [GITHUB('AndeSetale/ai-ande-settal')],
      },
      {
        art: 'joj-event',
        name: 'JOJ_EVENT',
        phrase: 'Plateforme spectateurs des JOJ Dakar, équipe de 4.',
        stack: ['Django', 'Figma', 'Agile'],
        links: [
          {
            label: 'Figma',
            href: 'https://www.figma.com/design/u7zX1iIs5N9tuLfWl2xlXx/JOJ-EVENTS',
            display: 'JOJ-EVENTS',
          },
        ],
      },
      {
        art: 'joj-news',
        name: 'JOJ News',
        phrase:
          "Journal des supporters des JOJ Dakar : articles, commentaires sécurisés et e-mail automatique à l'administrateur.",
        stack: ['Django', 'Bootstrap', 'MySQL'],
        links: [GITHUB('moussacode/joj_news')],
      },
      {
        art: 'ecostock',
        name: 'API Eco-Stock',
        phrase:
          "API REST de gestion d'entrepôts pour la logistique du don alimentaire, avec transferts bloqués pour les produits périmés et routes sécurisées par JWT.",
        stack: ['Django REST Framework', 'JWT'],
        links: [GITHUB('Camara-77/ecostock')],
      },
      {
        art: 'helpdesk',
        name: 'Helpdesk sécurisé',
        phrase:
          "Centralise les demandes de support d'un centre de formation, avec mots de passe hachés (bcrypt) et données isolées par utilisateur.",
        stack: ['Python', 'MySQL', 'bcrypt'],
        links: [GITHUB('Camara-77/gestion_simplon')],
      },
    ],
  },

  // ------------------------------------------------ Chapitre 4 · Boîte à outils
  toolbox: {
    id: 'outils',
    index: '04',
    label: 'Boîte à outils',
    title: 'Ma boîte à outils',
    outline: 'outils',
    groups: [
      { icon: 'wrench', title: 'Back-end', items: ['Python', 'Django', 'DRF', 'FastAPI'] },
      { icon: 'brush', title: 'Front-end', items: ['Angular', 'TypeScript', 'Tailwind'] },
      { icon: 'beaker', title: 'IA', items: ['LLM', 'RAG', 'LangChain', 'Whisper'] },
      { icon: 'cylinder', title: 'Données', items: ['PostgreSQL', 'MySQL'] },
      { icon: 'gear', title: 'Outils', items: ['Git', 'Docker', 'pytest'] },
    ],
    soft: ['Autonomie', 'Rigueur', "Esprit d'analyse", 'Travail en équipe'],
  },

  // ------------------------------------------------ Épilogue
  epilogue: {
    index: '—',
    label: 'Contact',
    title: 'Travaillons ensemble',
    outline: 'ensemble',
    intro: "Le voyage continue. Écoutez la suite de mon parcours, ou écrivez-moi.",
    voice: {
      src: 'audio/note-parcours.mp3',
      analysisSrc: 'audio/note-parcours-voix.mp3',
      label: 'Mon parcours, en 1 minute',
      markers: [
        // À REMPLIR après l'enregistrement (temps en secondes)
        { time: null, label: 'Biologie' },
        { time: null, label: 'Code' },
        { time: null, label: 'Simplon' },
        { time: null, label: 'AYYOU' },
        { time: null, label: '1er prix' },
      ],
      transcript: [
        "Bonjour, je suis Aïssatou Combe Camara, développeuse Full-Stack et IA, à Dakar. Pendant longtemps, l’informatique m’a fait peur : elle me semblait inaccessible. Après mon bac S2 en 2021, j’ai fait une licence en Biologie, Chimie et Géosciences à l’UCAD. Mais petit à petit, j’ai compris que l’informatique était partout, que c’était là que le monde changeait.",
        "En deuxième année, je m’y suis vraiment intéressée, et après ma licence, plutôt que de continuer en master d’environnement, j’ai recommencé une première année en génie logiciel. Puis j’ai réussi le concours de Simplon Sénégal, où je me suis formée au développement web et à l’intelligence artificielle.",
        "Mon projet de fin de formation, AYYOU, vient de ma mère : elle tient une gargote, et les grandes plateformes de livraison ne sont pas faites pour les petits restaurants. AYYOU leur donne une place, et permet à chacun de commander la cuisine de quartier qu’il aime. Ce projet a été validé en soutenance et a remporté le premier prix du meilleur projet entrepreneurial au Pitch Day de Simplon.",
        "Ce que j’aime dans ce métier, c’est la découverte, et l’absence de limites. Merci de m’avoir écoutée.",
      ],
    },
    tiktokLine: "Je partage aussi la tech et l'informatique sur TikTok.",
  },

  cv: {
    href: 'CV-Aissatou-Combe-Camara.pdf',
    fileName: 'CV-Aissatou-Combe-Camara.pdf',
  },

  footer: '© 2026 Aïssatou Combe Camara · Conçu et développé avec Angular',
};
