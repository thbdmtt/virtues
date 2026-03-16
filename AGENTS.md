# AGENTS.md — Règles pour Codex

Lis ce fichier intégralement avant chaque tâche.
Ces règles s'appliquent à tous les fichiers, sans exception.

## Identité du projet
Franklin Virtues Tracker — app locale Next.js 15, SQLite/Drizzle.
Esthétique : minimaliste élégant, thème sombre, typographie sérieuse.
Stack complète dans SPEC.md.

## Règles TypeScript
- strict: true — zéro exception
- Zéro `any` implicite — utilise `unknown` et narrow-le
- Zéro `as` casting sauf nécessité absolue documentée
- Préfère `type` à `interface` sauf contrats extensibles
- Utilise `satisfies` pour valider les objets de configuration

## Règles d'architecture
- Zéro logique métier dans les composants React
- Toute logique métier dans src/lib/
- Toutes les queries Drizzle dans src/lib/db/queries.ts uniquement
- Zéro appel base de données côté client
- Maximum 300 lignes par fichier — au-delà, découpe et explique pourquoi
- Un fichier = une responsabilité

## Organisation des dossiers
src/
  lib/           → logique pure, calculateurs, helpers
  lib/db/        → schema, queries, client Drizzle
  components/    → React uniquement, zéro logique métier
  components/ui/ → primitives réutilisables (boutons, cellules)
  app/           → pages et layouts Next.js
  app/api/       → route handlers
  types/         → types partagés entre lib et components
  styles/        → globals.css avec les CSS variables

## Règles domaine Franklin
- Une "semaine" commence toujours le lundi
- La vertu focus de la semaine = (numéro_semaine_depuis_origine % 13) + 1
- Un mark = faute (point noir). Absence d'entry ≠ journée parfaite.
- Ne jamais confondre "0 mark" (journée parfaite renseignée) et "entry absente"
- Le score hebdomadaire = nombre total de marks dans la semaine (moins = mieux)
- Afficher toujours les 13 vertus dans l'ordre canonique de Franklin (1 à 13)

## Pattern API obligatoire
- Toutes les routes retournent { data } ou { error }, jamais autre chose
- Toujours try/catch. Toujours logger l'erreur. Code HTTP précis (200/201/400/404/500)
- Les mutations (POST/PATCH/DELETE) revalidatent le bon path Next.js

## Règles CSS / Design
- Toutes les couleurs viennent des CSS variables de globals.css
- Zéro valeur couleur hardcodée dans le JSX ou les modules CSS
- Toutes les transitions : 150ms ease-out (définie en variable --transition-base)
- La grille principale (7 jours × 13 vertus) a des dimensions fixes — zéro layout shift
- Utiliser `font-family: var(--font-display)` pour Playfair Display (titres)
- Utiliser `font-family: var(--font-body)` pour Inter (corps)

## Interdictions absolues
- Ne jamais installer Prisma, shadcn/ui, Zustand, Redux, NextAuth
- Ne jamais utiliser localStorage ou sessionStorage (données dans SQLite uniquement)
- Ne jamais créer un fichier de plus de 300 lignes
- Ne jamais laisser de // TODO dans les fichiers livrés
- Ne jamais hardcoder les 13 vertus en dur dans un composant (toujours depuis la DB ou la config)
- Ne jamais créer de state global côté client — chaque page fetche ses données

## Format de réponse attendu
1. Annonce les fichiers que tu vas créer/modifier
2. Crée chaque fichier complet, sans placeholder ni [...] abrégés
3. Explique en 2-3 phrases ce que tu as fait et pourquoi
4. Indique la prochaine tâche logique