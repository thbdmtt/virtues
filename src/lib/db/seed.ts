import { sql } from "drizzle-orm";

import { db } from "./client";
import { virtues } from "./schema";

type SeedVirtue = {
  id: number;
  nameFr: string;
  nameEn: string;
  description: string;
  maxim: string;
  reflection: string;
  weekNumber: number;
};

const VIRTUES = [
  {
    id: 1,
    weekNumber: 1,
    nameFr: "Énergie",
    nameEn: "Energy",
    description: "Que ton corps et ton esprit soient gardiens de ta mission.",
    maxim: "Sommeil, force et attention sont des ressources — gouverne-les.",
    reflection:
      "Tu n'es pas une source — tu es un feu. Ce que tu alimentes brûle. Ce que tu négliges s'éteint. Gouverne la flamme.",
  },
  {
    id: 2,
    weekNumber: 2,
    nameFr: "Écoute",
    nameEn: "Silence",
    description: "Celui qui parle peu entend la vérité du monde.",
    maxim: "Écoute avant de répondre, et comprends avant de juger.",
    reflection:
      "Avant la réponse, il y a le silence. Dans ce silence, tout ce que l'autre n'a pas encore su dire. Ne le vole pas.",
  },
  {
    id: 3,
    weekNumber: 3,
    nameFr: "Clarté",
    nameEn: "Clarity",
    description: "Celui qui sait ce qui importe ne disperse pas ses jours.",
    maxim: "Nomme ce qui compte. Que chaque journée lui obéisse.",
    reflection:
      "La dispersion est confortable. Elle ressemble à l'activité sans en avoir le coût. Nommer ce qui compte — vraiment — est l'acte le plus difficile et le plus libérateur que tu puisses faire.",
  },
  {
    id: 4,
    weekNumber: 4,
    nameFr: "Exécution",
    nameEn: "Resolution",
    description: "Décide avec prudence ; accomplis avec constance.",
    maxim: "Une résolution sans acte est un mensonge qu'on se fait.",
    reflection:
      "Chaque promesse tenue à toi-même dépose une pierre. Chaque promesse brisée en retire une. Tu construis ou tu défais — il n'y a pas de milieu.",
  },
  {
    id: 5,
    weekNumber: 5,
    nameFr: "Capital",
    nameEn: "Frugality",
    description: "Que tes ressources croissent au lieu de se consumer.",
    maxim: "Ne dépense que ce qui sert la construction — le reste est distraction.",
    reflection:
      "L'argent dépensé sans intention est du temps futur brûlé. Pas de privation. Pas de culpabilité. Seulement cette question, avant chaque choix : est-ce que ça me rapproche ou m'éloigne ?",
  },
  {
    id: 6,
    weekNumber: 6,
    nameFr: "Travail profond",
    nameEn: "Deep Work",
    description: "L'esprit entier accomplit ce que l'esprit dispersé abandonne.",
    maxim: "Travaille avec une attention indivisible.",
    reflection:
      "La surface produit du bruit. La profondeur produit des œuvres. Chaque interruption acceptée est un renoncement à ce que tu aurais pu créer.",
  },
  {
    id: 7,
    weekNumber: 7,
    nameFr: "Intégrité",
    nameEn: "Sincerity",
    description: "Que ta parole et ta conduite soient d'un même métal.",
    maxim: "La vérité rend l'homme solide.",
    reflection:
      "Ce que tu penses. Ce que tu dis. Ce que tu fais. Quand les trois coïncident, tu es entier. Quand ils divergent, tu te fractures — lentement, invisiblement, sûrement.",
  },
  {
    id: 8,
    weekNumber: 8,
    nameFr: "Responsabilité",
    nameEn: "Justice",
    description: "Assume les conséquences de tes actes sans les fuir ni les diminuer.",
    maxim: "Un homme se mesure à ce qu'il assume, pas à ce qu'il réussit.",
    reflection:
      "Ne te flagelle pas. Ne fuis pas non plus. Regarde. Comprends. Corrige. C'est tout — et c'est immense.",
  },
  {
    id: 9,
    weekNumber: 9,
    nameFr: "Équilibre",
    nameEn: "Moderation",
    description: "Sache quand pousser et quand te retirer — les deux demandent du courage.",
    maxim: "L'excès d'effort détruit autant que l'excès de repos.",
    reflection:
      "Pousser sans relâche n'est pas de la force — c'est de l'ignorance du temps long. Le repos n'est pas une récompense. C'est une condition.",
  },
  {
    id: 10,
    weekNumber: 10,
    nameFr: "Respect de soi",
    nameEn: "Cleanliness",
    description: "Que ton corps, ton espace et ta mise témoignent du soin que tu te portes.",
    maxim: "Ce que tu tolères pour toi-même, tu l'acceptes pour ta vie.",
    reflection:
      "Tu te traites d'une certaine façon. Cette façon devient ta norme. Cette norme devient ta vie. Commence par les petites choses — elles ne sont jamais petites.",
  },
  {
    id: 11,
    weekNumber: 11,
    nameFr: "Stoïcisme",
    nameEn: "Tranquility",
    description: "Ne trouble pas ton âme pour ce qui ne dépend pas de toi.",
    maxim: "Garde ta paix pour les combats qui comptent.",
    reflection:
      "Deux colonnes. Ce qui dépend de toi. Ce qui n'en dépend pas. Tout ce que tu verses dans la mauvaise colonne t'est volé. Choisis où tu dépenses ta force.",
  },
  {
    id: 12,
    weekNumber: 12,
    nameFr: "Liens",
    nameEn: "Bonds",
    description: "Cultive les liens qui t'élèvent ; protège-toi de ceux qui t'épuisent.",
    maxim: "L'affection véritable nourrit — elle n'exige pas que tu te perdes.",
    reflection:
      "Certains liens te construisent. D'autres te consomment si lentement que tu ne remarques pas la perte. Le discernement ici n'est pas de la froideur — c'est de la lucidité.",
  },
  {
    id: 13,
    weekNumber: 13,
    nameFr: "Apprentissage",
    nameEn: "Humility",
    description: "L'ignorance assumée est le début de toute maîtrise.",
    maxim: "Reconnais l'erreur sans honte, et transforme-la en sagesse.",
    reflection:
      "L'erreur détournée se répète. L'erreur regardée devient matière. Tu ne choisis pas de te tromper. Tu choisis ce que tu en fais.",
  },
] satisfies ReadonlyArray<SeedVirtue>;

async function seedVirtues() {
  await db
    .insert(virtues)
    .values(VIRTUES)
    .onConflictDoUpdate({
      target: virtues.id,
      set: {
        nameFr: sql`excluded.name_fr`,
        nameEn: sql`excluded.name_en`,
        description: sql`excluded.description`,
        maxim: sql`excluded.maxim`,
        reflection: sql`excluded.reflection`,
        weekNumber: sql`excluded.week_number`,
      },
    });

  console.log("13 vertus mises à jour.");
}

seedVirtues().catch((error: unknown) => {
  console.error("Failed to seed virtues.", error);
  process.exitCode = 1;
});
