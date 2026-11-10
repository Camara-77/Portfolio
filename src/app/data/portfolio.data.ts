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

/** Note vocale : le lecteur est désactivé (« bientôt ») si le fichier est absent. */
export interface VoiceNote {
  src: string;
  label: string;
  /** Paragraphes de la transcription ; vide = transcription à venir. */
  transcript: string[];
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
  paragraphs: string[];
  milestones: Milestone[];
}

export interface CodeChapter extends ChapterBase {
  projectsTitle: string;
  projects: Project[];
}

export interface AyyouChapter extends ChapterBase {
  origin: string[];
  built: string;
  services: Service[];
  facts: string[];
  status: string;
  award: Award;
  links: Link[];
  othersTitle: string;
  others: Project[];
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
  opening: { scrollHint: string; voice: VoiceNote };
  biology: ChapterBase;
  code: CodeChapter;
  ayyou: AyyouChapter;
  epilogue: {
    index: string;
    label: string;
    title: string;
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
    { id: 'ayyou', index: '03', label: 'AYYOU' },
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
    scrollHint: 'Faites défiler : trois chapitres',
    voice: {
      src: 'audio/note-intro.mp3',
      label: 'Écouter ma présentation',
      transcript: [
        "Bonjour, moi c'est Aïssatou Combe Camara. J'ai commencé par la biologie, puis j'ai découvert le code et l'intelligence artificielle. Aujourd'hui, je suis développeuse et créatrice d'AYYOU. Faites défiler, je vous emmène dans mon voyage.",
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
    paragraphs: [],
    built: "Je l'ai construite seule, du front-end au service d'IA.",
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
          src: 'images/prix-portrait.jpg',
          caption: 'Avec le trophée',
          alt: 'Aïssatou Combe Camara, souriante, tient le trophée du 1er prix et son attestation Simplon Sénégal.',
          width: 810,
          height: 1080,
        },
        {
          src: 'images/prix-attestation.jpg',
          caption: 'Trophée et attestation',
          alt: "Le trophée en verre du 1er prix posé devant l'attestation de participation au Pitch Day 2026, au nom d'Aïssatou Combe Camara.",
          width: 1080,
          height: 810,
        },
        {
          src: 'images/prix-remise.jpg',
          caption: 'Remise du prix',
          alt: 'Remise du prix sur scène lors du Pitch Day 2026 à la Fabrique 360, devant les kakémonos Simplon Sénégal.',
          width: 810,
          height: 1080,
        },
        {
          src: 'images/prix-trophee.jpg',
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

  // ------------------------------------------------ Épilogue
  epilogue: {
    index: '—',
    label: 'Contact',
    title: 'Travaillons ensemble',
    intro: "Le voyage continue. Écoutez la suite de mon parcours, ou écrivez-moi.",
    voice: {
      src: 'audio/note-parcours.mp3',
      label: 'Mon parcours, en quelques minutes',
      // TODO : transcription de note-parcours.mp3 à fournir
      transcript: [],
    },
    tiktokLine: "Je partage aussi la tech et l'informatique sur TikTok.",
  },

  cv: {
    href: 'CV-Aissatou-Combe-Camara.pdf',
    fileName: 'CV-Aissatou-Combe-Camara.pdf',
  },

  footer: '© 2026 Aïssatou Combe Camara · Conçu et développé avec Angular',
};
