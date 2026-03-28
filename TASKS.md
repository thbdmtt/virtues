# TASKS.md — Franklin Virtues Tracker

## Comment utiliser ce fichier
Copie une tâche à la fois dans Codex.
Vérifie le critère avant de passer à la suivante.
Ne saute jamais une tâche — chaque tâche dépend de la précédente.

---

## PHASE 0 — Bootstrap & Configuration

### Tâche 0.1 — Init Next.js 15 + TypeScript strict
Crée le projet Next.js 15 avec App Router, TypeScript strict,
Tailwind CSS, src/ directory.
Installe les dépendances : drizzle-orm, better-sqlite3, @types/better-sqlite3,
drizzle-kit, date-fns, framer-motion, lucide-react, vitest.
Configure tsconfig.json : strict true, paths alias "@/*" → "./src/*".
Fichiers créés : package.json, tsconfig.json, next.config.ts

Vérification : `npm run dev` démarre sur localhost:3000 sans erreur.

### Tâche 0.2 — Design system : globals.css + fonts
Dans src/styles/globals.css :
- Déclare toutes les CSS variables du design system (palette complète de SPEC.md)
- Déclare --font-display (Playfair Display) et --font-body (Inter) via next/font
- Reset CSS minimal, box-sizing border-box global
- Déclare --transition-base: 150ms ease-out
Configure next/font dans src/app/layout.tsx pour charger les deux polices.

Fichiers créés : src/styles/globals.css, src/app/layout.tsx

Vérification : `npm run dev` → page blanche sans erreur. Inspecter les variables
CSS dans DevTools : toutes les variables --bg-base, --accent-gold etc. sont présentes.

---

## PHASE 1 — Données

### Tâche 1.1 — Schéma Drizzle + seed des vertus
Crée src/lib/db/schema.ts avec les 3 tables : virtues, entries, week_cycles.
Crée src/lib/db/client.ts : initialise better-sqlite3 + Drizzle,
chemin DB : process.env.DB_PATH ?? "./local.db".
Crée src/lib/db/seed.ts : insère les 13 vertus de Franklin
(id, name_fr, name_en, description, week_number dans le cycle).
Configure drizzle.config.ts.
Crée .env.local avec DB_PATH=./local.db.

Fichiers créés : src/lib/db/schema.ts, src/lib/db/client.ts,
src/lib/db/seed.ts, drizzle.config.ts, .env.local

Vérification : `npx drizzle-kit push` réussit.
`npx tsx src/lib/db/seed.ts` → "13 vertus insérées" dans le terminal.

### Tâche 1.2 — Queries typées
Crée src/lib/db/queries.ts avec ces fonctions exactes :
- getVirtues(): Promise<Virtue[]> — toutes les vertus triées par id
- getWeekEntries(weekStart: Date): Promise<Entry[]>
  → toutes les entries entre weekStart et weekStart+6j
- toggleMark(date: string, virtueId: number): Promise<void>
  → si entry existe avec has_mark=true → supprime
  → si entry existe avec has_mark=false → met has_mark=true
  → si entry absente → crée avec has_mark=true
- getVirtueFocusForWeek(weekStart: Date): Promise<Virtue>
  → calcule (ISO week number % 13) pour trouver la vertu focus
- getWeekScore(weekStart: Date): Promise<number>
  → retourne le count de marks dans la semaine
- getLast13WeeksScores(): Promise<{ weekStart: string, score: number }[]>

Crée src/lib/db/queries.test.ts avec tests Vitest pour toggleMark
(cas : première fois, deuxième fois = suppression, troisième = recréation).

Fichiers créés : src/lib/db/queries.ts, src/lib/db/queries.test.ts

Vérification : `npx vitest run` → tous les tests passent.

---

## PHASE 2 — Logique métier

### Tâche 2.1 — Utilitaires dates et cycle
Crée src/lib/utils/dates.ts :
- getCurrentWeekStart(): Date → lundi de la semaine courante
- getWeekDays(weekStart: Date): Date[] → tableau de 7 dates lun→dim
- formatDateKey(date: Date): string → "YYYY-MM-DD"
- getWeekLabel(weekStart: Date): string → "10–16 mars 2026"
- getPreviousWeek(weekStart: Date): Date
- getNextWeek(weekStart: Date): Date

Crée src/lib/utils/dates.test.ts : tests unitaires pour chaque fonction.

Fichiers créés : src/lib/utils/dates.ts, src/lib/utils/dates.test.ts

Vérification : `npx vitest run` → tous les tests passent.

### Tâche 2.2 — Types partagés
Crée src/types/index.ts avec les types :
- Virtue, Entry, WeekData, DayData, CellState ("empty" | "clean" | "marked")
- WeekScore, HistoryItem

Aucun import depuis la DB dans ce fichier — types purs.

Fichiers créés : src/types/index.ts

Vérification : `npx tsc --noEmit` → zéro erreur.

---

## PHASE 3 — API Routes

### Tâche 3.1 — GET /api/week
Crée src/app/api/week/route.ts :
- Accepte ?weekStart=YYYY-MM-DD (optionnel, défaut = semaine courante)
- Retourne { data: { virtues, entries, virtueFocus, weekScore, weekLabel } }
- Construit un objet WeekData structuré : pour chaque jour × vertu,
  l'état CellState correspondant
- Gestion d'erreur complète

Fichiers créés : src/app/api/week/route.ts

Vérification : `curl "localhost:3000/api/week"` → JSON valide avec les 13 vertus.

### Tâche 3.2 — POST /api/mark
Crée src/app/api/mark/route.ts :
- Body : { date: string, virtueId: number }
- Valide les inputs (date format YYYY-MM-DD, virtueId 1-13)
- Appelle toggleMark()
- Retourne { data: { date, virtueId, newState: CellState } }
- revalidatePath("/")

Fichiers créés : src/app/api/mark/route.ts

Vérification : `curl -X POST localhost:3000/api/mark -d '{"date":"2026-03-13","virtueId":1}'`
→ { data: { newState: "marked" } }. Deuxième appel → { data: { newState: "empty" } }.

### Tâche 3.3 — GET /api/history
Crée src/app/api/history/route.ts :
- Retourne { data: getLast13WeeksScores() }

Fichiers créés : src/app/api/history/route.ts

Vérification : `curl localhost:3000/api/history` → tableau de 13 objets.

---

## PHASE 4 — Interface

### Tâche 4.1 — Layout principal + page skeleton
Crée src/app/page.tsx : Server Component qui fetche /api/week
(semaine courante) et passe les données en props.
Layout : sidebar gauche (liste des 13 vertus) + zone centrale (grille) + header.
Pas encore de style complet — juste la structure HTML sémantique avec les classes
Tailwind de base et les fonts chargées.

Fichiers créés : src/app/page.tsx, src/app/layout.tsx (mise à jour)

Vérification : `npm run dev` → page s'affiche avec les 13 noms de vertus listés.

### Tâche 4.2 — Composant VirtueCell
Crée src/components/ui/VirtueCell.tsx :
- Props : date, virtueId, state: CellState, isFocusVirtue: boolean
- Affiche un carré 40×40px
- État "empty" : fond bg-surface, bordure border subtle
- État "marked" : point rouge centré 8px + glow box-shadow
- État "clean" : légère teinte success (uniquement si journée explicitement passée)
- isFocusVirtue : bordure accent-gold
- onClick : POST /api/mark + optimistic update local
- Transition 150ms sur tous les états

Fichiers créés : src/components/ui/VirtueCell.tsx

Vérification : `npm run dev` → cliquer une cellule alterne l'état mark,
transition visible, pas de layout shift.

### Tâche 4.3 — Grille hebdomadaire WeekGrid
Crée src/components/WeekGrid.tsx :
- Props : virtues, weekDays, entries (map date×virtueId → CellState), virtueFocus
- Affiche la grille 7 colonnes (jours) × 13 lignes (vertus)
- Header colonnes : jours de la semaine abrégés + date
- Header lignes : nom de la vertu (fr) avec numéro Franklin
- Colonne de la vertu focus : légèrement surlignée
- Journée courante : header avec accent-gold
- Dimensions fixes : colonnes 48px, lignes 44px, zéro layout shift

Fichiers créés : src/components/WeekGrid.tsx

Vérification : `npm run dev` → grille complète affichée, responsive sur desktop.

### Tâche 4.4 — Navigation + VirtueFocusBanner
Crée src/components/WeekNav.tsx :
- Flèches précédent/suivant changeant weekStart dans les search params
- Label de la semaine (ex: "10–16 mars 2026")
- Score de la semaine (ex: "12 manquements")
- Désactive "suivant" si semaine courante

Crée src/components/VirtueFocusBanner.tsx :
- Banner pleine largeur sous le header
- Affiche : "Vertu de la semaine : [Nom] — [description courte]"
- Fond bg-elevated, bordure accent-gold, typographie Playfair Display

Fichiers créés : src/components/WeekNav.tsx, src/components/VirtueFocusBanner.tsx

Vérification : `npm run dev` → navigation fonctionne, URL change,
grille se met à jour avec les bonnes données.

### Tâche 4.5 — Sidebar des vertus + page d'historique
Crée src/components/VirtueSidebar.tsx :
- Liste scrollable des 13 vertus
- Chaque item : numéro, nom, description au hover (tooltip)
- Vertu focus de la semaine : accent-gold + indicateur visuel

Crée src/app/history/page.tsx :
- Fetche /api/history
- Affiche les 13 dernières semaines avec mini-score
- Visualisation simple : barre proportionnelle au score (moins = vert, plus = rouge)

Fichiers créés : src/components/VirtueSidebar.tsx, src/app/history/page.tsx

Vérification : `npm run dev` → /history affiche le graphique, les données sont cohérentes.

## PHASE 4.6 — Refonte UI/UX : Minimalisme Luxe Mobile

> Refonte complète de l'interface selon la V3.
> Ces tâches remplacent les Tâches 4.1 à 4.6 existantes.
> Lire SPEC.md et AGENTS.md intégralement avant chaque tâche.

---

### Tâche 4.1 — Mise à jour SPEC.md : nouveau design system

Mettre à jour la section "Design system" de SPEC.md :

Palette :
- --void:        #111109  (fond principal)
- --deep:        #171714  (fond secondaire)
- --surface:     #1C1B18  (cartes, cellules)
- --lift:        #22211D  (hover, focus)
- --gold:        #C8A84B  (accent principal)
- --gold-soft:   #8A7030  (accent secondaire)
- --gold-trace:  rgba(200,168,75,0.1)
- --gold-line:   rgba(200,168,75,0.18)
- --cream:       #EDE8DC  (texte principal)
- --cream-mid:   #B8B2A4  (texte secondaire)
- --cream-dim:   #6A6459  (labels, métadonnées)
- --fault:       #8B2A2A  (manquement)
- --fault-glow:  rgba(139,42,42,0.4)

Typographie :
- --font-display : Cormorant Garamond (titres, noms de vertus)
- --font-body    : DM Sans (labels, métadonnées, navigation)
RÈGLE : deux polices uniquement, sans exception.

Principes d'interaction :
- Toutes les transitions : cubic-bezier(0.16, 1, 0.3, 1)
- Bouton de marquage : cercle 56px, zéro texte à l'intérieur
- Animations : respecter prefers-reduced-motion obligatoirement
- Safe areas : env(safe-area-inset-*) sur tous les bords

Fichiers modifiés : SPEC.md

Vérification : relire SPEC.md — la section design system
est cohérente, sans valeur hardcodée manquante.

---

### Tâche 4.2 — globals.css : design system complet

Réécrire src/styles/globals.css intégralement :

Variables CSS (toutes les variables listées dans SPEC.md +) :
- --ease:            cubic-bezier(0.16, 1, 0.3, 1)
- --t-fast:          180ms
- --t-mid:           350ms
- --t-slow:          600ms
- --safe-top:        env(safe-area-inset-top, 0px)
- --safe-bottom:     env(safe-area-inset-bottom, 0px)
- --safe-left:       env(safe-area-inset-left, 0px)
- --safe-right:      env(safe-area-inset-right, 0px)

Charger via next/font dans src/app/layout.tsx :
- Cormorant Garamond weights 300, 400, 500 + italic 300, 400
- DM Sans weights 300, 400

Reset CSS :
- box-sizing: border-box global
- html, body : height 100%, overflow hidden,
  background var(--void), touch-action none
- -webkit-font-smoothing: antialiased

Texture grain (pseudo-élément body::after) :
- SVG fractalNoise baseFrequency 0.8, numOctaves 4
- opacity 0.032, mix-blend-mode overlay
- pointer-events none, z-index 9000

Fichiers modifiés :
- src/styles/globals.css
- src/app/layout.tsx

Vérification : npx tsc --noEmit → zéro erreur.
npm run dev → fond #111109 avec grain subtil visible,
les deux polices chargées (vérifier dans DevTools Network).

---

### Tâche 4.3 — Layout principal : trois zones

Réécrire src/app/layout.tsx et src/app/page.tsx :

Structure HTML exacte :
  <Shell>           → position fixed, inset 0, flex column
    <TopBar>        → position absolute, top, left/right
    <Screens>       → flex 1, overflow hidden, position relative
      <ScreenToday> → position absolute, inset 0
      <ScreenWeek>  → position absolute, inset 0
    </Screens>
  </Shell>
  <MenuPanel>       → position fixed, inset 0, z-index 500

TopBar contient :
- "Franklin" : DM Sans 10px, weight 300, letter-spacing 0.35em,
  color var(--cream-dim), uppercase
- MenuBtn : deux traits horizontaux (20px + 13px),
  hauteur 1px, background var(--cream-dim), gap 5px
  → state open : croix 18px/18px via transform rotate

Padding TopBar : max(env(safe-area-inset-top, 0px), 52px) 28px 0

Fichiers modifiés :
- src/app/layout.tsx
- src/app/page.tsx

Vérification : npm run dev → la structure s'affiche,
le bouton menu alterne son état visuel au clic.
Aucun contenu ne déborde hors du shell.

---

### Tâche 4.4 — ScreenToday : écran principal

Créer src/components/ScreenToday.tsx (Client Component) :

Props : virtue (Virtue), focusWeekNum (number),
        todayMarks (Record<number, boolean>),
        weekMarks (Record<string, boolean>),
        onToggleMark (virtueId: number, dayIdx: number) => void

Structure de bas en haut (justify-content: flex-end) :

1. TodayDate (position absolute, top, right 28px) :
   - Jour en lettres : DM Sans 9px weight 300,
     letter-spacing 0.3em, color var(--cream-dim), uppercase
   - Numéro du jour : Cormorant Garamond 22px weight 300,
     color var(--cream-mid)

2. VirtueHero :
   - Label focus : DM Sans 9px weight 300, letter-spacing 0.35em,
     color var(--gold-soft), uppercase
     → pseudo ::before : cercle 4px gold, animation breathe
       (opacity 1→0.4→1, durée 3s, infini)
   - Nom vertu : Cormorant Garamond clamp(64px,17vw,88px)
     weight 300, line-height 0.86, color var(--cream),
     letter-spacing -0.025em
   - Maxime : Cormorant Garamond 14px italic weight 300,
     line-height 1.8, color var(--cream-dim), max-width 280px

3. MarkZone (display flex, align-items center, gap 20px) :
   - MarkCircle : cercle 56px, border 1px solid
     rgba(237,232,220,0.15), background transparent
     → state marked : border var(--fault),
       background rgba(139,42,42,0.12),
       box-shadow 0 0 20px var(--fault-glow)
     → inner dot 10px : scale 0→1 au marquage,
       background var(--fault) si marqué
     → animation spring au clic :
       scale 1→1.22→0.94→1.06→1 en 350ms
   - MarkLabel : DM Sans 11px weight 300, letter-spacing 0.15em,
     color var(--cream-dim), uppercase
     Texte : "Manquement aujourd'hui" / "Annuler"

4. WeekPips (7 cercles) :
   - Container : display flex, gap 8px
   - Chaque pip : flex 1, max-width 28px
     → Label jour : DM Sans 8px weight 300, uppercase,
       color var(--cream-dim) opacity 0.45
       / today : color var(--gold) opacity 0.9
     → Cercle : border 1px solid rgba(200,168,75,0.12)
       / today : border-color var(--gold-soft),
         box-shadow 0 0 8px rgba(200,168,75,0.2)
       / future : opacity 0.2, pointer-events none
       / marked : background rgba(139,42,42,0.2),
         border-color rgba(139,42,42,0.5),
         inner dot 8px var(--fault) visible
   - Cliquable sur jours passés + aujourd'hui uniquement

5. SwipeUpHint (position absolute, bottom, centré) :
   - Trait vertical 1px×18px, gradient vers le haut
   - Label "Semaine" DM Sans 7px letter-spacing 0.3em
   - opacity 0 → animation fadeHint 5s ease 2s forwards
   - Disparaît définitivement après le 1er swipe
     (useState local, pas localStorage)

Padding bottom : max(env(safe-area-inset-bottom, 0px), 48px)

Fichiers créés :
- src/components/ScreenToday.tsx

Vérification : npm run dev → l'écran today s'affiche complet.
Cliquer le cercle 56px → animation spring visible,
état marked/unmarked. Les 7 pips s'affichent correctement.

---

### Tâche 4.5 — ScreenWeek : grille hebdomadaire

Créer src/components/ScreenWeek.tsx (Client Component) :

Props : virtues (Virtue[]), focusId (number),
        weekDays (Date[]), marks (Record<string, boolean>),
        weekScore (number), weekRange (string),
        onToggle (virtueId: number, dayIdx: number) => void,
        onClose () => void

Transitions d'entrée/sortie :
- hidden : translateY(100%), opacity 0
- visible : translateY(0), opacity 1
- durée : var(--t-slow), easing var(--ease)

Structure :

1. WeekHeader (padding 20px 28px 16px) :
   - Gauche : plage de dates en italique
     Cormorant Garamond 13px weight 300, color var(--cream-mid)
   - Droite : score (nombre) + label "fautes"
     Nombre : Cormorant Garamond 28px weight 300, color var(--cream)
     Label  : DM Sans 9px weight 300, letter-spacing 0.15em,
              color var(--cream-dim), uppercase

2. ThinRule : hauteur 1px, margin 0 28px,
   background linear-gradient(to right, var(--gold-line), transparent)

3. DayHeaders : grid 10px + repeat(7, 1fr), gap 3px
   padding 0 18px 0 28px
   Labels : DM Sans 8px weight 300, letter-spacing 0.1em,
   color var(--cream-dim) opacity 0.5, uppercase
   / today : color var(--gold) opacity 0.9

4. GridBody (overflow-y auto, flex 1) :
   13 lignes (focus en premier, puis les 12 autres ordre canonique)
   Chaque ligne : grid 10px + repeat(7, 1fr), gap 3px
   Cellule 36px max :
   - border 1px solid rgba(200,168,75,0.07)
   - background var(--surface)
   - today-col : border-color rgba(200,168,75,0.2)
   - is-focus   : background rgba(200,168,75,0.05)
   - is-marked  : background rgba(139,42,42,0.18)
                  border-color rgba(139,42,42,0.4)
                  inner dot 6px var(--fault) visible
   - is-future  : opacity 0.2, pointer-events none
   Cliquable sur passé + aujourd'hui → onToggle()

5. BackPill (position absolute, bottom centré) :
   36px × 4px, border-radius 2px,
   background rgba(237,232,220,0.12), cursor pointer → onClose()

Fichiers créés :
- src/components/ScreenWeek.tsx

Vérification : npm run dev → la grille s'affiche avec les
13 vertus. Cliquer une cellule bascule son état.
La ligne focus est visuellement distincte.
Le score se met à jour en temps réel.

---

### Tâche 4.6 — MenuPanel : liste des vertus

Créer src/components/MenuPanel.tsx (Client Component) :

Props : virtues (Virtue[]), focusId (number),
        isOpen (boolean), onClose () => void

Transitions :
- fermé  : translateX(100%)
- ouvert : translateX(0)
- durée  : 0.5s var(--ease)
- background : var(--void), position fixed inset 0, z-index 500

Structure :

1. Padding :
   max(env(safe-area-inset-top, 0px), 52px) 28px
   max(env(safe-area-inset-bottom, 0px), 40px)

2. Sous-titre :
   "Les treize vertus de Benjamin Franklin"
   Cormorant Garamond 11px weight 300 italic,
   color var(--cream-dim), letter-spacing 0.1em
   margin-top 48px, margin-bottom 32px

3. Liste des 13 vertus :
   Chaque item :
   - Séparé par border-bottom 1px solid rgba(237,232,220,0.05)
   - Padding 16px 0
   - Transition padding-left 0.2s au tap actif (→ 6px)

   Ligne haut :
   - Numéro "01"→"13" : DM Sans 9px weight 300,
     letter-spacing 0.25em, color var(--cream-dim) opacity 0.5
   - Badge "Focus" si vertu de la semaine :
     DM Sans 8px, letter-spacing 0.2em, color var(--gold)

   Nom : Cormorant Garamond clamp(22px,6vw,28px) weight 300,
   color var(--cream), letter-spacing -0.01em

   Maxime (accordéon au tap) :
   - max-height 0 → 80px, opacity 0 → 0.75
   - transition 0.4s var(--ease)
   - Cormorant Garamond 12px italic weight 300,
     color var(--cream-dim), line-height 1.7
   - Entre guillemets

   Un seul item expanded à la fois : tapper un autre
   ferme le précédent.

Fichiers créés :
- src/components/MenuPanel.tsx

Vérification : npm run dev → le panel s'ouvre depuis la droite.
Tapper une vertu révèle sa maxime. Tapper une autre
ferme la première. Le badge "Focus" est visible sur la
vertu de la semaine.

---

### Tâche 4.7 — Assemblage et gestion des gestes

Mettre à jour src/app/page.tsx pour assembler tous les composants :

State à gérer (useState) :
- weekOpen : boolean
- menuOpen : boolean
- marks : Record<string, boolean>
  clé format : "${virtueId}-${dayIndex}"
- swipeCount : number (pour masquer le hint après 1 swipe)

Fetching :
- Utiliser l'API GET /api/week pour hydrater les données initiales
- Le state marks est initialisé depuis les entries de l'API
- Les mutations passent par POST /api/mark

Gestion des gestes (sur le container Screens) :
- touchstart : enregistrer Y et X initiaux
- touchend : calculer deltaY et deltaX
  → si |deltaY| > |deltaX| ET |deltaY| > 44px :
    deltaY > 0 ET !weekOpen → openWeek()
    deltaY < 0 ET weekOpen  → closeWeek()
- Wheel (desktop) :
  deltaY > 20 ET !weekOpen → openWeek()
  deltaY < -20 ET weekOpen → closeWeek()

Transition ScreenToday ↔ ScreenWeek :
- weekOpen = false : today translateY(0) opacity 1,
                     week  translateY(100%) opacity 0
- weekOpen = true  : today translateY(-100%) opacity 0,
                     week  translateY(0) opacity 1
- durée var(--t-slow), easing var(--ease)

Synchronisation :
- Un toggle dans ScreenWeek sur la vertu focus / aujourd'hui
  doit aussi mettre à jour l'état du cercle 56px dans ScreenToday
- Le score affiché dans ScreenWeek = count(marks où value = true)

Fichiers modifiés :
- src/app/page.tsx

Vérification : npm run dev → les gestes swipe fonctionnent.
Marquer dans la vue semaine synchronise la vue today.
Marquer via le cercle 56px synchronise la grille semaine.
Le hint "Semaine" disparaît après le 1er swipe.

---

### Tâche 4.8 — État "journée complète" + polish final

Créer src/lib/utils/completion.ts :
- isDayComplete(date: string, entries: Entry[]): boolean
  → true si toutes les 13 vertus ont une entry pour cette date
  → entry absente = journée non renseignée → false

Créer src/lib/utils/completion.test.ts :
Tests :
  - 0 entries → false
  - 12 entries → false
  - 13 entries, toutes vertus distinctes → true
  - 13 entries, doublon d'une vertu → false

Appliquer dans ScreenToday :
- Si isDayComplete(today) :
  Le numéro du jour (ex: "16") change de couleur :
  var(--cream-dim) → var(--gold), transition 400ms
  + "✓" apparaît à droite, DM Sans 10px, color var(--gold),
    opacity 0.7

Polish final — vérifier dans tous les composants :
- Zéro couleur hardcodée (grep "#" dans les .tsx hors globals.css)
- Zéro police non-déclarée en variable
- Tous les éléments interactifs : min touch target 44px
- Tous les padding bottom : intègrent var(--safe-bottom)
- prefers-reduced-motion : toutes les animations remplacées
  par opacity crossfade 150ms

Fichiers créés/modifiés :
- src/lib/utils/completion.ts (nouveau)
- src/lib/utils/completion.test.ts (nouveau)
- src/components/ScreenToday.tsx (mise à jour)

Vérification :
npx vitest run → tous les tests passent.
npx tsc --noEmit → zéro erreur.
npm run build → build propre.
Vérification manuelle sur Chrome DevTools iPhone 14 Pro :
safe areas respectées, gestes fluides, polices correctes.
```

---

---

## PHASE 5 — Mise à jour des vertus personnalisées

> Remplace les 13 vertus Franklin originales par les vertus
> personnalisées définies et validées.
> À exécuter avant la Phase 6 (PWA).

---

### Tâche 5.1 — Mise à jour du seed des vertus

Modifie src/lib/db/seed.ts :

Remplacer intégralement le tableau des vertus par celui-ci.
Le seed doit être idempotent : si les vertus existent déjà,
les mettre à jour (upsert) sans créer de doublons.
```typescript
const virtues = [
  {
    id: 1,
    week_number: 1,
    name_fr: "Énergie",
    name_en: "Energy",
    description: "Que ton corps et ton esprit soient gardiens de ta mission.",
    maxim: "Sommeil, force et attention sont des ressources — gouverne-les.",
  },
  {
    id: 2,
    week_number: 2,
    name_fr: "Écoute",
    name_en: "Silence",
    description: "Celui qui parle peu entend la vérité du monde.",
    maxim: "Écoute avant de répondre, et comprends avant de juger.",
  },
  {
    id: 3,
    week_number: 3,
    name_fr: "Clarté",
    name_en: "Clarity",
    description: "Celui qui sait ce qui importe ne disperse pas ses jours.",
    maxim: "Nomme ce qui compte. Que chaque journée lui obéisse.",
  },
  {
    id: 4,
    week_number: 4,
    name_fr: "Exécution",
    name_en: "Resolution",
    description: "Décide avec prudence ; accomplis avec constance.",
    maxim: "Une résolution sans acte est un mensonge qu'on se fait.",
  },
  {
    id: 5,
    week_number: 5,
    name_fr: "Capital",
    name_en: "Frugality",
    description: "Que tes ressources croissent au lieu de se consumer.",
    maxim: "Ne dépense que ce qui sert la construction — le reste est distraction.",
  },
  {
    id: 6,
    week_number: 6,
    name_fr: "Travail profond",
    name_en: "Deep Work",
    description: "L'esprit entier accomplit ce que l'esprit dispersé abandonne.",
    maxim: "Travaille avec une attention indivisible.",
  },
  {
    id: 7,
    week_number: 7,
    name_fr: "Intégrité",
    name_en: "Sincerity",
    description: "Que ta parole et ta conduite soient d'un même métal.",
    maxim: "La vérité rend l'homme solide.",
  },
  {
    id: 8,
    week_number: 8,
    name_fr: "Responsabilité",
    name_en: "Justice",
    description: "Assume les conséquences de tes actes sans les fuir ni les diminuer.",
    maxim: "Un homme se mesure à ce qu'il assume, pas à ce qu'il réussit.",
  },
  {
    id: 9,
    week_number: 9,
    name_fr: "Équilibre",
    name_en: "Moderation",
    description: "Sache quand pousser et quand te retirer — les deux demandent du courage.",
    maxim: "L'excès d'effort détruit autant que l'excès de repos.",
  },
  {
    id: 10,
    week_number: 10,
    name_fr: "Respect de soi",
    name_en: "Cleanliness",
    description: "Que ton corps, ton espace et ta mise témoignent du soin que tu te portes.",
    maxim: "Ce que tu tolères pour toi-même, tu l'acceptes pour ta vie.",
  },
  {
    id: 11,
    week_number: 11,
    name_fr: "Stoïcisme",
    name_en: "Tranquility",
    description: "Ne trouble pas ton âme pour ce qui ne dépend pas de toi.",
    maxim: "Garde ta paix pour les combats qui comptent.",
  },
  {
    id: 12,
    week_number: 12,
    name_fr: "Relations saines",
    name_en: "Chastity",
    description: "Cultive les liens qui t'élèvent ; protège-toi de ceux qui t'épuisent.",
    maxim: "L'affection véritable nourrit — elle n'exige pas que tu te perdes.",
  },
  {
    id: 13,
    week_number: 13,
    name_fr: "Apprentissage",
    name_en: "Humility",
    description: "L'ignorance assumée est le début de toute maîtrise.",
    maxim: "Reconnais l'erreur sans honte, et transforme-la en sagesse.",
  },
];
```

Modifier la logique d'insertion dans seed.ts :
- Utiliser un INSERT OR REPLACE (upsert Drizzle)
  pour ne pas dupliquer si le seed est rejoué
- Logger : "13 vertus mises à jour."

Modifier src/lib/db/schema.ts si nécessaire :
- Vérifier que la colonne "maxim" existe dans la table virtues
- Si absente : ajouter maxim TEXT NOT NULL DEFAULT ''
- Mettre à jour le type Virtue dans src/types/index.ts
  en conséquence : ajouter maxim: string

Fichiers modifiés :
- src/lib/db/seed.ts
- src/lib/db/schema.ts (si colonne maxim absente)
- src/types/index.ts (si type Virtue incomplet)

Vérification :
`npx drizzle-kit push` → migration appliquée sans erreur.
`npx tsx src/lib/db/seed.ts` → "13 vertus mises à jour."
`curl localhost:3000/api/week` → les noms fr retournés
sont "Énergie", "Écoute", "Clarté"... (pas les noms Franklin).

---

### Tâche 5.2 — Propagation des nouvelles vertus dans l'UI

Les composants qui affichent le nom ou la description
des vertus doivent utiliser les nouveaux champs.

Modifie src/components/ScreenToday.tsx :
- heroName affiche virtue.name_fr (inchangé structurellement)
- heroMaxim affiche virtue.maxim (nouveau champ)
  → vérifier que la prop est bien passée depuis page.tsx

Modifie src/components/MenuPanel.tsx :
- Chaque item affiche :
  → virtue.name_fr (grand titre)
  → virtue.description (ligne italique sous le titre,
    toujours visible, Cormorant Garamond 12px)
  → virtue.maxim (accordéon au tap, entre guillemets)
  → Les deux lignes sont distinctes visuellement :
    description : color var(--cream-mid), opacity 0.6
    maxim       : color var(--cream-dim), opacity 0.75,
                  italic, apparaît au tap

Modifie src/components/ScreenWeek.tsx :
- Le label de la ligne focus dans la grille affiche
  virtue.name_fr correctement (probablement déjà le cas,
  vérifier uniquement)

Modifie src/app/api/week/route.ts :
- S'assurer que le champ maxim est inclus dans
  la réponse { data: { virtues: [...] } }

Fichiers modifiés :
- src/components/ScreenToday.tsx
- src/components/MenuPanel.tsx
- src/components/ScreenWeek.tsx
- src/app/api/week/route.ts

Vérification :
npm run dev → ouvrir le MenuPanel.
Vérifier que les 13 noms personnalisés apparaissent.
Tapper "Énergie" → la description s'affiche en permanence,
la maxime apparaît au tap.
La vertu focus de ScreenToday affiche la bonne maxime.

---

## PHASE 6 — PWA + Déploiement Railway

> Transforme l'app en Progressive Web App installable
> sur iPhone depuis Safari, sans App Store ni Xcode.
> Déploiement sur Railway avec base de données persistante.

---

### Tâche 6.1 — Sécurisation par mot de passe unique

Installe : npm install iron-session

Crée src/middleware.ts :
- Intercepte toutes les routes sauf /login et /api/auth
- Vérifie la présence d'un cookie "franklin_session"
- Cookie absent ou invalide → redirect vers /login
- Cookie valide → laisse passer

Crée src/app/login/page.tsx (Client Component) :
- Page dans le design system existant (fond var(--void))
- Structure centrée verticalement :
  → "Franklin" en Cormorant Garamond 32px weight 300,
    color var(--cream), letter-spacing -0.02em
  → Trait doré 40px sous le titre
  → Champ mot de passe : input type="password",
    style minimaliste, fond var(--surface),
    border 1px solid var(--gold-line),
    color var(--cream), DM Sans 14px,
    padding 14px 16px, width 100%, max-width 280px
    placeholder "···" color var(--cream-dim)
  → Bouton : cercle 48px, border 1px solid var(--gold-line),
    fond transparent, "→" en Cormorant Garamond 20px gold
  → Message d'erreur discret si mauvais mot de passe :
    DM Sans 10px, color var(--fault), opacity 0.8,
    "Mot de passe incorrect"
- Submit via fetch POST /api/auth
- Succès → router.push("/")

Crée src/app/api/auth/route.ts :
- POST uniquement
- Body : { password: string }
- Compare avec process.env.APP_PASSWORD (hash bcrypt)
- Si correct → crée cookie iron-session httpOnly secure
  durée : 30 jours
  payload : { authenticated: true, createdAt: Date.now() }
- Retourne { data: { success: true } } ou { error: "incorrect" }
- Zéro log du mot de passe en clair

Crée src/app/api/auth/logout/route.ts :
- POST → détruit le cookie → { data: { success: true } }

Ajoute dans .env.local :
APP_PASSWORD=           ← à remplir manuellement
SESSION_SECRET=         ← chaîne aléatoire 32 caractères minimum
                           générer avec : openssl rand -hex 32

Fichiers créés :
- src/middleware.ts
- src/app/login/page.tsx
- src/app/api/auth/route.ts
- src/app/api/auth/logout/route.ts

Vérification :
npm run dev → accéder à localhost:3000 sans cookie
→ redirigé vers /login.
Entrer mauvais mot de passe → message "Mot de passe incorrect".
Entrer le bon → accès à l'app, cookie posé.
Fermer et rouvrir → toujours connecté (cookie 30j).
Vérifier dans DevTools → Application → Cookies :
cookie httpOnly, Secure, SameSite=Strict.

---

### Tâche 6.2 — Manifest PWA + meta tags

Crée public/manifest.json :
```json
{
  "name": "Franklin",
  "short_name": "Franklin",
  "description": "Treize vertus pour une vie meilleure.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#111109",
  "theme_color": "#111109",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

Crée public/icons/icon-192.png et icon-512.png :
- Fond #111109
- Lettre "F" centrée en Cormorant Garamond weight 300
  couleur #C8A84B (gold)
- Utiliser sharp ou canvas pour générer programmatiquement
  via un script src/scripts/generate-icons.ts

Modifie src/app/layout.tsx — ajouter dans <head> :
```tsx
<link rel="manifest" href="/manifest.json" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style"
      content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Franklin" />
<meta name="theme-color" content="#111109" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

Fichiers créés/modifiés :
- public/manifest.json
- public/icons/icon-192.png
- public/icons/icon-512.png
- src/scripts/generate-icons.ts
- src/app/layout.tsx

Vérification :
npm run dev → ouvrir sur iPhone dans Safari.
Menu partage → "Sur l'écran d'accueil" est proposé.
Après installation : l'app s'ouvre en plein écran,
sans barre d'adresse Safari, sans interface navigateur.
L'icône sur l'écran d'accueil affiche le "F" doré.

---

### Tâche 6.3 — Service Worker : mode hors-ligne

Crée public/sw.js :

Stratégies de cache :
- Cache-first pour : fonts Google, images, assets statiques
  (/_next/static/*, /icons/*, /manifest.json)
- Network-first pour : toutes les routes /api/*
  → si réseau indisponible, retourner le dernier cache connu
- Stale-while-revalidate pour : pages HTML (/, /history)

Installation du service worker :
```javascript
// Cache name versionné
const CACHE = 'franklin-v1';

// Assets à précacher au premier chargement
const PRECACHE = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
];
```

Modifie src/app/layout.tsx :
- Ajouter un Script Next.js qui enregistre le service worker :
```tsx
<Script
  id="sw-register"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .catch(console.error);
      }
    `
  }}
/>
```

Fichiers créés/modifiés :
- public/sw.js
- src/app/layout.tsx

Vérification :
npm run dev → DevTools → Application → Service Workers :
le SW est enregistré et actif.
DevTools → Network → mode Offline :
recharger l'app → elle s'affiche encore (depuis le cache).
Les routes /api/* en offline retournent les données cachées.

---

### Tâche 6.4 — Configuration Railway + volume persistant

Cette tâche ne produit pas de code — elle configure
l'infrastructure de déploiement.

Crée railway.toml à la racine :
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run start"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
```

Modifie next.config.ts :
- Ajouter output: 'standalone' pour optimiser le build Railway

Modifie src/lib/db/client.ts :
- Le chemin DB doit utiliser process.env.DB_PATH
  avec fallback sécurisé :
```typescript
  const DB_PATH = process.env.DB_PATH ?? path.join(
    process.cwd(), 'local.db'
  );
```
- En production Railway, DB_PATH sera /data/local.db
  (monté sur un volume persistant)

Crée src/app/api/health/route.ts :
- GET → { data: { status: "ok", timestamp: Date.now() } }
- Railway l'utilise comme health check

Ajoute dans package.json scripts :
```json
"db:migrate:prod": "npx drizzle-kit push",
"db:seed:prod": "npx tsx src/lib/db/seed.ts"
```

Fichiers créés/modifiés :
- railway.toml
- next.config.ts
- src/lib/db/client.ts
- src/app/api/health/route.ts
- package.json

Vérification :
npm run build → build standalone sans erreur.
npm run start → l'app tourne en mode production local.
curl localhost:3000/api/health → { data: { status: "ok" } }

---

### Tâche 6.5 — Notifications push PWA

Installe : npm install web-push
           npm install @types/web-push --save-dev

Génère les clés VAPID (une seule fois) :
```bash
npx web-push generate-vapid-keys
```
→ Coller les clés dans .env.local :
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=mailto:ton@email.com

Crée src/app/api/push/subscribe/route.ts :
- POST : reçoit { subscription: PushSubscription }
- Stocke la subscription dans la DB
  (nouvelle table push_subscriptions : id, endpoint,
   keys_p256dh, keys_auth, created_at)
- Retourne { data: { success: true } }

Crée src/app/api/push/send/route.ts :
- POST (interne, protégé par APP_PASSWORD via header)
- Envoie une notification à toutes les subscriptions actives
- Payload : { title: "Franklin", body: "Ta journée t'attend." }

Modifie public/sw.js :
- Ajouter le handler push event :
```javascript
self.addEventListener('push', event => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Franklin', {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'franklin-daily',
    })
  );
});
```

Crée src/components/NotificationSetup.tsx :
- Bouton discret dans ScreenToday (en bas, très petit) :
  "Activer les rappels" DM Sans 9px color var(--cream-dim)
- Au tap : demande la permission push
  Si accordée → POST /api/push/subscribe
  Si refusée → masquer le bouton définitivement
  (useState local, pas localStorage)
- Une fois activé : afficher "Rappels activés ✓"
  en var(--gold) opacity 0.6, disparaît après 2s

Ajoute dans package.json :
```json
"notify": "tsx src/scripts/send-notification.ts"
```

Crée src/scripts/send-notification.ts :
- Script Node qui appelle POST /api/push/send
- À planifier via Railway Cron : "0 21 * * *"
  (tous les soirs à 21h)

Fichiers créés/modifiés :
- src/app/api/push/subscribe/route.ts
- src/app/api/push/send/route.ts
- src/lib/db/schema.ts (table push_subscriptions)
- public/sw.js
- src/components/NotificationSetup.tsx
- src/scripts/send-notification.ts
- package.json

Vérification :
npm run dev → ouvrir sur iPhone dans Safari (PWA installée).
Tapper "Activer les rappels" → iOS demande la permission.
Accepter → bouton devient "Rappels activés ✓".
curl -X POST localhost:3000/api/push/send → notification
reçue sur l'iPhone dans les 5 secondes.

---

## PHASE 7 — Vérification finale complète

### Tâche 7.1 — Audit qualité et déploiement

Exécute dans l'ordre :

1. npx vitest run → 0 failing
2. npx tsc --noEmit → 0 erreur TypeScript
3. npm run build → build propre, 0 warning
4. grep -r "hardcoded-color" src/ → zéro résultat
   (remplacer par : grep -rn "#[0-9a-fA-F]\{3,6\}" src/
    hors globals.css → zéro résultat)

Vérifications manuelles sur iPhone (Safari, PWA installée) :
- [ ] Login : mauvais mdp → message erreur
- [ ] Login : bon mdp → accès, cookie posé 30j
- [ ] ScreenToday : vertu focus correcte pour la semaine
- [ ] Marquer focus aujourd'hui → pip gold se remplit
- [ ] Swipe haut → ScreenWeek apparaît
- [ ] Marquer dans ScreenWeek → synchronisé avec ScreenToday
- [ ] Swipe bas → retour ScreenToday
- [ ] MenuPanel : 13 vertus personnalisées dans l'ordre
- [ ] Tap vertu → description visible, maxime s'étend
- [ ] Mode hors-ligne (avion) → app fonctionne
- [ ] Safe areas : aucun contenu sous l'encoche ou le home indicator
- [ ] Notification test reçue

Déploiement Railway :
1. Push sur GitHub → Railway détecte et build automatiquement
2. Dans Railway Dashboard → Variables :
   APP_PASSWORD=       (ton mot de passe)
   SESSION_SECRET=     (openssl rand -hex 32)
   DB_PATH=/data/local.db
   VAPID_PUBLIC_KEY=
   VAPID_PRIVATE_KEY=
   VAPID_EMAIL=
3. Railway → Volumes → Ajouter volume monté sur /data
4. Une fois déployé :
   curl https://ton-url.railway.app/api/health
   → { data: { status: "ok" } }
5. Ouvrir l'URL sur iPhone → Safari → "Sur l'écran d'accueil"
6. L'app Franklin est installée. Définitivement.

Fichiers modifiés : aucun (audit uniquement)

Vérification finale :
Tout est vert. L'app tourne sur Railway.
Elle est installée sur ton iPhone.
Tes données sont persistantes.
Tu reçois une notification à 21h si tu actives les rappels.
Zéro App Store. Zéro Xcode. Zéro coût.
```

---
Phase M0

Lis SPEC.md et AGENTS.md intégralement avant de commencer.

---

CONTEXTE
─────────
L'app tourne actuellement avec better-sqlite3 (fichier local).
On migre vers Turso (@libsql/client) pour permettre le déploiement
sur Vercel. Le schéma, les queries et toute la logique métier
restent identiques — seul le client de base de données change.

---

TÂCHE M0.1 — Désinstaller better-sqlite3, installer Turso
───────────────────────────────────────────────────────────

Exécute dans le terminal :

  npm uninstall better-sqlite3 @types/better-sqlite3
  npm install @libsql/client
  npm install drizzle-orm@latest

Vérifie que package.json ne contient plus
better-sqlite3 ni @types/better-sqlite3.

Fichiers modifiés : package.json

---

TÂCHE M0.2 — Mettre à jour src/lib/db/client.ts
─────────────────────────────────────────────────

Réécrire src/lib/db/client.ts intégralement :

  import { createClient } from '@libsql/client'
  import { drizzle } from 'drizzle-orm/libsql'
  import * as schema from './schema'

  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error('TURSO_DATABASE_URL manquant')
  }
  if (!process.env.TURSO_AUTH_TOKEN) {
    throw new Error('TURSO_AUTH_TOKEN manquant')
  }

  const client = createClient({
    url:       process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })

  export const db = drizzle(client, { schema })

Règles :
- Zéro import better-sqlite3
- Zéro référence à DB_PATH
- Les deux variables d'env sont obligatoires —
  l'app ne démarre pas sans elles (fail fast)

Fichiers modifiés : src/lib/db/client.ts

---

TÂCHE M0.3 — Mettre à jour drizzle.config.ts
─────────────────────────────────────────────

Réécrire drizzle.config.ts intégralement :

  import type { Config } from 'drizzle-kit'

  export default {
    schema:    './src/lib/db/schema.ts',
    out:       './drizzle',
    dialect:   'turso',
    dbCredentials: {
      url:       process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    },
  } satisfies Config

Fichiers modifiés : drizzle.config.ts

---

TÂCHE M0.4 — Mettre à jour les variables d'environnement
──────────────────────────────────────────────────────────

Modifie .env.local :
- Supprimer la ligne DB_PATH
- Ajouter à la fin :

  TURSO_DATABASE_URL=libsql://REMPLACER_PAR_TON_URL
  TURSO_AUTH_TOKEN=REMPLACER_PAR_TON_TOKEN

Note : les valeurs réelles seront renseignées manuellement
après cette tâche — ne pas inventer de valeurs.

Modifie .env.example (créer si absent) :
  APP_PASSWORD=
  SESSION_SECRET=
  TURSO_DATABASE_URL=libsql://...
  TURSO_AUTH_TOKEN=

Ce fichier documente les variables requises sans exposer
les vraies valeurs. Il est commité dans git.
.env.local ne l'est jamais (vérifier .gitignore).

Vérifier .gitignore :
- .env.local doit être présent
- .env*.local doit être présent
- Si absent, ajouter les deux lignes

Fichiers modifiés/créés :
- .env.local
- .env.example
- .gitignore (vérification uniquement)

---

TÂCHE M0.5 — Adapter les queries async
────────────────────────────────────────

Turso est asynchrone par nature. better-sqlite3 était synchrone.
Vérifier src/lib/db/queries.ts :

Pour chaque fonction :
- Vérifier qu'elle est bien async et retourne une Promise
- Vérifier que tous les appels db sont bien awaités
- Les signatures de fonctions ne changent pas —
  seul l'implémentation interne si nécessaire

Fonctions à vérifier une par une :
  getVirtues()
  getWeekEntries()
  toggleMark()
  getVirtueFocusForWeek()
  getWeekScore()
  getLast13WeeksScores()

Si une fonction utilise des méthodes synchrones
spécifiques à better-sqlite3 (.prepare(), .run(), .get(),
.all()), les remplacer par les équivalents Drizzle async :
  .all()    → await db.select()...
  .get()    → await db.select()... puis [0]
  .run()    → await db.insert() / .update() / .delete()

Fichiers modifiés : src/lib/db/queries.ts

---

TÂCHE M0.6 — Adapter src/lib/db/seed.ts
─────────────────────────────────────────

Turso est asynchrone — le seed doit l'être aussi.

Vérifier src/lib/db/seed.ts :
- La fonction principale doit être async
- Tous les appels db doivent être awaités
- Utiliser INSERT OR REPLACE (upsert Drizzle) :

  await db.insert(virtues)
    .values(virtuesData)
    .onConflictDoUpdate({
      target: virtues.id,
      set: {
        name_fr:     sql`excluded.name_fr`,
        name_en:     sql`excluded.name_en`,
        description: sql`excluded.description`,
        maxim:       sql`excluded.maxim`,
      }
    })

- Logger "13 vertus mises à jour." en fin de script

Fichiers modifiés : src/lib/db/seed.ts

---

TÂCHE M0.7 — Supprimer ensure-standalone.cjs
──────────────────────────────────────────────

Le fichier src/scripts/ensure-standalone.cjs
n'est plus nécessaire avec Vercel.

Supprimer : src/scripts/ensure-standalone.cjs

Modifier package.json :
- Supprimer la ligne "prestart"
- Le script "start" devient :
  "start": "node .next/standalone/server.js"

Fichiers modifiés/supprimés :
- src/scripts/ensure-standalone.cjs (supprimé)
- package.json

---

TÂCHE M0.8 — Vérification TypeScript et build local
─────────────────────────────────────────────────────

Exécute dans l'ordre :

  1. npx tsc --noEmit
     → doit retourner zéro erreur

  2. npm run build
     → doit terminer sans "Killed"
     → les 11 pages doivent être générées

Si des erreurs TypeScript apparaissent liées à
@libsql/client (types manquants), installer :
  npm install --save-dev @libsql/client

Fichiers modifiés : aucun (vérification uniquement)

---

TÂCHE M0.9 — Test de connexion Turso
──────────────────────────────────────

Avant de tester, l'utilisateur doit avoir renseigné
les vraies valeurs dans .env.local :
  TURSO_DATABASE_URL=libsql://franklin-virtues-xxx.turso.io
  TURSO_AUTH_TOKEN=eyJ...

Puis exécuter dans l'ordre :

  1. npx drizzle-kit push
     → applique le schéma sur la base Turso distante
     → doit afficher "All changes applied"

  2. npx tsx src/lib/db/seed.ts
     → doit afficher "13 vertus mises à jour."

  3. npm run dev
     → l'app démarre sur localhost:3000

  4. curl localhost:3000/api/week
     → doit retourner un JSON valide avec les 13 vertus
        dont les noms fr : "Énergie", "Écoute", "Clarté"...

Fichiers modifiés : aucun (vérification uniquement)

---

RAPPELS NON-NÉGOCIABLES
────────────────────────
- Zéro couleur hardcodée dans les .tsx
- Deux polices uniquement : Cormorant Garamond + DM Sans
- Zéro localStorage
- Maximum 300 lignes par fichier
- Annoncer les fichiers avant de les créer ou modifier
- Ne modifier que le nécessaire — zéro refactoring non demandé

---

NOTE 2026-03-28 — Correction durable du basculement hebdomadaire
──────────────────────────────────────────────────────────────────

Réalisé :
- Ajout de `src/lib/utils/cycle.ts` pour calculer la semaine du cycle
  depuis une origine explicite au lieu de `getISOWeek()`.
- Le focus hebdomadaire utilise désormais `virtues.week_number`
  et non plus `virtues.id`, ce qui aligne le calcul avec la règle métier.
- Ajout de `FRANKLIN_CYCLE_ORIGIN_WEEK_START` dans `.env.example`
  avec une valeur par défaut de secours : `2026-03-16`.
- Ajout d'un rafraîchissement client automatique au changement de jour
  pour que l'app bascule sans reload manuel quand la date change.
- Passage du service worker en stratégie `network-first` pour `/`
  et `/history`, avec invalidation des anciens caches via `virtues-v2`.
- Ajout de tests unitaires et d'intégration couvrant :
  le calcul du cycle, le passage à la semaine 2 et le délai jusqu'au
  prochain changement de jour.

Fichiers modifiés/créés :
- src/lib/utils/cycle.ts
- src/lib/utils/cycle.test.ts
- src/lib/utils/dates.ts
- src/lib/utils/dates.test.ts
- src/lib/db/queries.ts
- src/lib/db/queries.test.ts
- src/components/useCalendarRefresh.ts
- src/components/AppShell.tsx
- public/sw.js
- .env.example
- TASKS.md
