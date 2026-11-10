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
  role?: string;
  stack: string[];
  repo: SocialLink;
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
  /** Contexte et date, si connus (ex. « Projet perso · Juillet 2026 »). */
  meta?: string;
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
  /** Savoir-être : affiché sous les groupes, hors cartes. */
  softSkills: SkillGroup;
  marquee: string[];
  timeline: TimelineItem[];
  contact: { title: string };
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
      "Diplômée d'une Licence en Biologie, Chimie et Géosciences (UCAD), je me suis reconvertie dans le développement chez Simplon Sénégal.",
      "Je construis des applications complètes avec Django, Angular et FastAPI, et j'y intègre l'IA : transcription vocale, chatbots, RAG, analyse de sentiments.",
      'Ma formation scientifique me donne une méthode rigoureuse : analyser, tester, documenter.',
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
      // Dépôts : organisation publique github.com/Ayyou-all
      {
        name: 'Front-end',
        stack: ['Angular', 'TypeScript', 'Tailwind CSS', 'Leaflet', 'Chart.js'],
        repo: {
          label: 'GitHub',
          href: 'https://github.com/Ayyou-all/ayyou-frontend',
          display: 'ayyou-frontend',
        },
      },
      {
        name: 'Back-end',
        stack: ['Django', 'Django REST Framework', 'JWT', 'PostgreSQL', 'OpenAPI'],
        repo: {
          label: 'GitHub',
          href: 'https://github.com/Ayyou-all/ayyou-backend',
          display: 'ayyou-backend',
        },
      },
      {
        name: 'Service IA',
        role: 'Microservice séparé, accessible seulement par le back-end via une clé interne.',
        stack: ['FastAPI'],
        repo: {
          label: 'GitHub',
          href: 'https://github.com/Ayyou-all/ayyou-ai',
          display: 'ayyou-ai',
        },
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
      description:
        'Répond en langage naturel aux questions sur un règlement intérieur PDF, avec un index vectoriel FAISS et Llama 3.2 en local.',
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
      meta: 'Projet perso · Juillet 2026',
      link: {
        label: 'GitHub',
        href: 'https://github.com/Camara-77/huggin-face',
        display: 'Camara-77/huggin-face',
      },
    },
    {
      name: 'JOJ News',
      category: 'Full-Stack',
      description:
        "Journal des supporters des JOJ Dakar : articles, commentaires sécurisés et e-mail automatique à l'administrateur.",
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
      description:
        "API REST de gestion d'entrepôts pour la logistique du don alimentaire, avec transferts bloqués pour les produits périmés et routes sécurisées par JWT.",
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
      description:
        "Centralise les demandes de support d'un centre de formation, avec mots de passe hachés (bcrypt) et données isolées par utilisateur.",
      stack: ['Python', 'MySQL', 'bcrypt'],
      link: {
        label: 'GitHub',
        href: 'https://github.com/Camara-77/gestion_simplon',
        display: 'Camara-77/gestion_simplon',
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
      title: 'Outils & DevOps',
      items: ['Git', 'GitHub', 'Git Flow', 'Docker', 'Nginx', 'Postman', 'pytest'],
    },
    {
      title: 'Conception',
      items: ['UML', 'Figma', 'Cahier des charges', 'Scrum', 'Kanban'],
    },
  ],

  softSkills: {
    title: 'Savoir-être',
    items: ['Autonomie', 'Rigueur', "Esprit d'analyse", 'Travail en équipe'],
  },

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

  contact: { title: 'Travaillons ensemble' },

  // CV : public/CV-Aissatou-Combe-Camara.pdf
  cv: {
    href: 'CV-Aissatou-Combe-Camara.pdf',
    fileName: 'CV-Aissatou-Combe-Camara.pdf',
    todo: false,
  },

  footer: '© 2026 Aïssatou Combe Camara · Conçu et développé avec Angular',
};
