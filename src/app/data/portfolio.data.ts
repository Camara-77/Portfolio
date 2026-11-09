// =========================================================
// Tout le contenu texte du portfolio.
// Règle : aucune information inventée. Les éléments manquants
// sont signalés par `todo` et affichés comme TODO visibles.
// =========================================================

export interface NavLink {
  id: string;
  label: string;
}

export interface SocialLink {
  label: string;
  href: string;
  display: string;
}

export interface Identity {
  name: string;
  firstName: string;
  initials: string;
  title: string;
  location: string;
  locationShort: string;
  email: string;
  phone: string;
  phoneHref: string;
  linkedin: SocialLink;
  github: SocialLink;
  languages: Language[];
  tagline: string;
}

export interface Language {
  name: string;
  level: string;
}

export interface Stat {
  value: number;
  suffix?: string;
  label: string;
}

export interface About {
  paragraphs: string[];
  stats: Stat[];
}

export interface FloatingCard {
  label: string;
}

export interface ArchitectureBlock {
  name: string;
  role: string;
  stack: string[];
}

export interface FeaturedProject {
  name: string;
  kicker: string;
  summary: string;
  context: string;
  status: string;
  stats: Stat[];
  architecture: ArchitectureBlock[];
  deployment: string[];
  spaces: string[];
  payments: string;
  aiFeatures: string[];
  links: SocialLink[];
}

export type ProjectCategory = 'IA' | 'Full-Stack' | 'Back-end';

export interface Project {
  name: string;
  category: ProjectCategory;
  description: string;
  stack: string[];
  link: SocialLink;
}

export interface SkillGroup {
  title: string;
  items: string[];
}

export interface TimelineItem {
  date: string;
  title: string;
  place?: string;
}

export interface Seo {
  title: string;
  description: string;
}

export interface Portfolio {
  seo: Seo;
  nav: NavLink[];
  identity: Identity;
  heroFloatingCards: FloatingCard[];
  about: About;
  featured: FeaturedProject;
  projectFilters: ('Tous' | ProjectCategory)[];
  projects: Project[];
  skills: SkillGroup[];
  marquee: string[];
  timeline: TimelineItem[];
  cv: { href: string; fileName: string; todo: boolean };
  footer: string;
}

export const PORTFOLIO: Portfolio = {
  seo: {
    title: 'Aïssatou Combe Camara — Développeuse Full-Stack & IA',
    description:
      "Développeuse Full-Stack & IA à Dakar. Je conçois et développe des applications web complètes, du back-end à l'interface, en y intégrant l'intelligence artificielle.",
  },

  nav: [
    { id: 'about', label: 'À propos' },
    { id: 'ayyou', label: 'AYYOU' },
    { id: 'projects', label: 'Projets' },
    { id: 'skills', label: 'Compétences' },
    { id: 'timeline', label: 'Parcours' },
    { id: 'contact', label: 'Contact' },
  ],

  identity: {
    name: 'Aïssatou Combe Camara',
    firstName: 'Aïssatou',
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
    github: {
      label: 'GitHub',
      href: 'https://github.com/Camara-77',
      display: 'Camara-77',
    },
    languages: [
      { name: 'Français', level: 'courant' },
      { name: 'Wolof', level: 'courant' },
      { name: 'Bambara', level: 'courant' },
      { name: 'Anglais', level: 'intermédiaire' },
    ],
    tagline:
      "Je conçois et développe des applications web complètes, du back-end à l'interface, en y intégrant l'intelligence artificielle pour résoudre des problèmes concrets.",
  },

  heroFloatingCards: [
    { label: 'Django · DRF' },
    { label: 'Angular' },
    { label: 'FastAPI · IA' },
    { label: '156 tests' },
  ],

  about: {
    paragraphs: [
      "Diplômée d'une Licence en Biologie, Chimie et Géosciences (UCAD), Aïssatou s'est reconvertie dans le développement chez Simplon Sénégal.",
      "Elle construit des applications complètes avec Django, Angular et FastAPI, et y intègre l'IA : transcription vocale, chatbots, RAG, analyse de sentiments.",
      'Sa formation scientifique lui donne une méthode rigoureuse : analyser, tester, documenter.',
    ],
    stats: [
      { value: 10, suffix: '+', label: 'projets réalisés' },
      { value: 1, label: 'plateforme complète déployée en solo' },
      { value: 156, label: 'tests automatisés sur AYYOU' },
    ],
  },

  featured: {
    name: 'AYYOU',
    kicker: 'Projet phare',
    summary: 'Plateforme FoodTech de commande et livraison de repas au Sénégal.',
    context:
      'Projet de soutenance réalisé seule (front, back, IA), validé le 23 octobre 2026.',
    status: 'Déployée en ligne, lancement en préparation.',
    stats: [
      { value: 172, label: 'commits' },
      { value: 156, label: 'tests' },
      { value: 3, label: 'services' },
      { value: 15, label: 'modules back-end' },
      { value: 4, label: 'espaces utilisateurs' },
    ],
    architecture: [
      {
        name: 'Front-end',
        role: 'Interface des 4 espaces utilisateurs',
        stack: ['Angular', 'TypeScript', 'Tailwind CSS', 'Leaflet', 'Chart.js'],
      },
      {
        name: 'Back-end',
        role: 'API REST, authentification, données',
        stack: ['Django', 'Django REST Framework', 'JWT', 'PostgreSQL', 'OpenAPI'],
      },
      {
        name: 'Service IA',
        role: 'Microservice séparé, accessible seulement par le back-end via une clé interne',
        stack: ['FastAPI'],
      },
    ],
    deployment: ['Docker', 'Nginx', 'Gunicorn', 'VPS', 'HTTPS'],
    spaces: ['Client', 'Restaurant', 'Livreur', 'Administrateur'],
    payments: 'Paiement Wave et Orange Money via PayTech.',
    aiFeatures: [
      'Transcription vocale (Whisper)',
      'Recherche vocale convertie en filtres',
      'Chatbot culinaire LLM',
      'Recommandations',
      'Rapport hebdomadaire',
    ],
    links: [
      { label: 'Site', href: 'https://ayyou.site', display: 'ayyou.site' },
      { label: 'GitHub', href: 'https://github.com/Ayyou-all', display: 'Ayyou-all' },
    ],
  },

  projectFilters: ['Tous', 'IA', 'Full-Stack', 'Back-end'],

  projects: [
    {
      name: 'Andë Sétal',
      category: 'IA',
      description: 'Responsable IA dans une équipe de 4 ; microservices Django et FastAPI.',
      stack: ['Django', 'FastAPI', 'JWT', 'Docker'],
      link: {
        label: 'GitHub',
        href: 'https://github.com/AndeSetale/ai-ande-settal',
        display: 'AndeSetale/ai-ande-settal',
      },
    },
    {
      name: 'Assistant RAG',
      category: 'IA',
      description: 'Questions-réponses sur un PDF.',
      stack: ['LangChain', 'FAISS', 'Hugging Face', 'Llama 3.2'],
      link: {
        label: 'GitHub',
        href: 'https://github.com/Camara-77/mon-rag',
        display: 'Camara-77/mon-rag',
      },
    },
    {
      name: "API d'analyse de sentiments",
      category: 'IA',
      description: "Détecte le sentiment d'un avis et signale les urgences.",
      stack: ['FastAPI', 'Transformers'],
      link: {
        label: 'GitHub',
        href: 'https://github.com/Camara-77/huggin-face',
        display: 'Camara-77/huggin-face',
      },
    },
    {
      name: 'JOJ_EVENT',
      category: 'Full-Stack',
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
      category: 'Full-Stack',
      description: 'Journal des supporters, commentaires sécurisés, notifications email.',
      stack: ['Django', 'Bootstrap', 'MySQL'],
      link: {
        label: 'GitHub',
        href: 'https://github.com/moussacode/joj_news',
        display: 'moussacode/joj_news',
      },
    },
    {
      name: 'API Eco-Stock',
      category: 'Back-end',
      description: 'Logistique du don alimentaire.',
      stack: ['Django REST Framework', 'JWT'],
      link: {
        label: 'GitHub',
        href: 'https://github.com/Camara-77/ecostock',
        display: 'Camara-77/ecostock',
      },
    },
    {
      name: 'Helpdesk sécurisé',
      category: 'Back-end',
      description: 'Support avec mots de passe hachés.',
      stack: ['Python', 'MySQL', 'bcrypt'],
      link: {
        label: 'GitHub',
        href: 'https://github.com/Camara-77/gestion_simplon',
        display: 'Camara-77/gestion_simplon',
      },
    },
    {
      name: 'Star Buffet',
      category: 'Full-Stack',
      description: 'Gestion de traiteurs.',
      stack: ['Django'],
      link: {
        label: 'GitHub',
        href: 'https://github.com/Camara-77/djqngob_brief1',
        display: 'Camara-77/djqngob_brief1',
      },
    },
  ],

  skills: [
    {
      title: 'Front-end',
      items: ['Angular', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'],
    },
    {
      title: 'Back-end',
      items: ['Python', 'Django', 'Django REST Framework', 'FastAPI', 'API REST', 'JWT'],
    },
    {
      title: 'IA',
      items: ['LLM', 'RAG', 'LangChain', 'Hugging Face', 'Whisper', 'Embeddings', 'FAISS', 'Ollama'],
    },
    {
      title: 'Bases de données',
      items: ['PostgreSQL', 'MySQL', 'SQLite'],
    },
    {
      title: 'Outils',
      items: ['Git', 'GitHub', 'Git Flow', 'Docker', 'Nginx', 'Postman', 'pytest'],
    },
    {
      title: 'Conception',
      items: ['UML', 'Figma', 'Cahier des charges', 'Scrum', 'Kanban'],
    },
    {
      title: 'Savoir-être',
      items: ['Autonomie', 'Rigueur', "Esprit d'analyse", 'Travail en équipe'],
    },
  ],

  marquee: [
    'Angular',
    'TypeScript',
    'Python',
    'Django',
    'Django REST Framework',
    'FastAPI',
    'PostgreSQL',
    'LangChain',
    'Hugging Face',
    'Whisper',
    'FAISS',
    'Ollama',
    'Docker',
    'Nginx',
    'pytest',
  ],

  timeline: [
    { date: '2021', title: 'Baccalauréat S2' },
    {
      date: '2021 – 2024',
      title: 'Licence Biologie, Chimie, Géosciences',
      place: 'UCAD, Dakar',
    },
    {
      date: 'Nov. 2025 – Oct. 2026',
      title: 'Développeuse Web & Web Mobile, IA',
      place: 'Simplon Sénégal',
    },
    {
      date: '23 oct. 2026',
      title: 'Soutenance validée',
      place: 'Projet AYYOU',
    },
  ],

  // TODO : déposer cv-aissatou-combe-camara.pdf dans public/ puis passer todo à false
  cv: {
    href: 'cv-aissatou-combe-camara.pdf',
    fileName: 'cv-aissatou-combe-camara.pdf',
    todo: true,
  },

  footer: '© 2026 Aïssatou Combe Camara · Conçu et développé avec Angular',
};
