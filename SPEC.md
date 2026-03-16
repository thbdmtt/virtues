# Franklin Virtues Tracker — Spécification V1

## Vision
Application web locale de suivi quotidien des 13 vertus de Benjamin Franklin.
L'utilisateur marque chaque jour les vertus non tenues (système de points noirs),
visualise ses progrès sur un cycle de 13 semaines, et consulte son historique.
Usage strictement personnel, zéro backend cloud, zéro authentification.

## Stack décidée

| Rôle             | Choix          | Raison                                     |
|------------------|----------------|--------------------------------------------|
| Framework        | Next.js 15     | App Router, RSC, standard 2026             |
| Base de données  | SQLite (local) | Zéro infra, fichier local, persistance     |
| ORM              | Drizzle        | Inférence TypeScript précise               |
| Styling          | Tailwind CSS   | Utilitaires + custom CSS variables         |
| Animations       | Framer Motion  | Transitions élégantes, micro-interactions  |
| Icônes           | Lucide React   | Set minimal, cohérent                      |
| Dates            | date-fns       | Léger, tree-shakeable                      |
| Tests            | Vitest         | Rapide, compatible Vite/Next               |

## Ce qu'on n'installe PAS
- Prisma → remplacé par Drizzle (plus léger, inférence TS meilleure)
- shadcn/ui → tout est custom, design system maison
- Zustand / Redux → pas de state global complexe, useState suffit
- NextAuth → pas d'auth en V1
- Vercel Analytics → usage local uniquement

## Périmètre V1

### Inclus
- Tableau de suivi hebdomadaire (7 jours × 13 vertus)
- Marquage d'un manquement par clic (point noir)
- Navigation semaine par semaine
- Vue calendrier mensuelle des vertus
- Système de cycle : 1 vertu focus par semaine (rotation de 13 semaines)
- Score journalier et score de la semaine
- Historique des 12 dernières semaines (1 cycle complet)
- Design système : thème sombre élégant, palette crème/charbon/or

### Explicitement exclu
- Authentification (V2)
- Sync cloud (V2)
- Notifications / rappels (V2)
- Multi-utilisateur (jamais, usage perso)
- Import/export de données (V2)
- Statistiques avancées (V2)

## Modèle de données

### Entité `virtue`
- id (1–13), name (fr + en), description courte, semaine d'appartenance dans le cycle
- Statique, jamais modifié

### Entité `entry`
- date (YYYY-MM-DD), virtue_id, has_mark (boolean)
- Contrainte d'unicité : (date, virtue_id)
- Règle métier : un mark = une faute ce jour-là contre cette vertu
- Règle métier : absence d'entry = journée non renseignée (≠ zéro faute)

### Entité `week_cycle`
- week_start (YYYY-MM-DD, toujours un lundi), virtue_focus_id
- Calculé automatiquement par modulo 13 depuis une date d'origine fixe

## Design system

### Palette (CSS tokens)
- `--void`: #111109 (fond principal)
- `--deep`: #171714 (fond secondaire)
- `--surface`: #1C1B18 (cartes, cellules)
- `--lift`: #22211D (hover, focus)
- `--gold`: #C8A84B (accent principal)
- `--gold-soft`: #8A7030 (accent secondaire)
- `--gold-trace`: rgba(200,168,75,0.1)
- `--gold-line`: rgba(200,168,75,0.18)
- `--cream`: #EDE8DC (texte principal)
- `--cream-mid`: #B8B2A4 (texte secondaire)
- `--cream-dim`: #6A6459 (labels, métadonnées)
- `--fault`: #8B2A2A (manquement)
- `--fault-glow`: rgba(139,42,42,0.4)

### Typographie
- `--font-display`: `Cormorant Garamond` (titres, noms de vertus)
- `--font-body`: `DM Sans` (labels, métadonnées, navigation)
- Règle : deux polices uniquement, sans exception

### Principes d'interaction
- Toutes les transitions : `cubic-bezier(0.16, 1, 0.3, 1)`
- Bouton de marquage : cercle 56px, zéro texte à l'intérieur
- Animations : respecter `prefers-reduced-motion` obligatoirement
- Safe areas : `env(safe-area-inset-*)` sur tous les bords
- Zéro saut de layout (dimensions fixes sur les grilles)
