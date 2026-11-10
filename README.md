# Portfolio — Aïssatou Combe Camara

Portfolio personnel d'Aïssatou Combe Camara, développeuse Full-Stack & IA à Dakar.

## Stack

- **Angular 22** : composants standalone, signals, `@if` / `@for`, `OnPush`, SCSS
- **Three.js** : sphère 3D du hero, chargée à la demande
- **GSAP** : ScrollTrigger, SplitText, ScrambleText pour les animations
- Aucune librairie UI ; polices auto-hébergées (Clash Display, Inter, JetBrains Mono)

## Démarrer

```bash
npm install
npm start          # http://localhost:4200
npm run build      # sortie : dist/portfolio/browser
```

## Modifier le contenu

Tout le texte du site est dans [`src/app/data/portfolio.data.ts`](src/app/data/portfolio.data.ts) :
identité, À propos, AYYOU, projets, compétences, parcours, contact, CV.

Le CV est servi depuis `public/CV-Aissatou-Combe-Camara.pdf`.

## Structure

```
src/app/
  core/       directives (reveal, tilt, magnetic, text-reveal…) et services
  shared/     glass-card, section-title, badge, bouton, icônes
  sections/   hero, about, ayyou, projects, skills, timeline, contact
  layout/     navbar, footer, intro, curseur, barre de progression, fond 3D
  data/       portfolio.data.ts
scripts/      prepare-photo.py (détourage et versions N&B / orange du portrait)
```

## Photo

Les images `public/images/portrait-nb.webp` et `portrait-orange.webp` sont générées par
`scripts/prepare-photo.py` (instructions en tête du fichier).

## Déploiement

Déployé sur Vercel. La configuration est dans [`vercel.json`](vercel.json)
(sortie `dist/portfolio/browser`, réécriture de toutes les routes vers `index.html`).
