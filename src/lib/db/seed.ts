import { sql } from "drizzle-orm";

import { db } from "./client";
import { virtues } from "./schema";

type SeedVirtue = {
  id: number;
  nameFr: string;
  nameEn: string;
  description: string;
  maxim: string;
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
  },
  {
    id: 2,
    weekNumber: 2,
    nameFr: "Écoute",
    nameEn: "Silence",
    description: "Celui qui parle peu entend la vérité du monde.",
    maxim: "Écoute avant de répondre, et comprends avant de juger.",
  },
  {
    id: 3,
    weekNumber: 3,
    nameFr: "Clarté",
    nameEn: "Clarity",
    description: "Celui qui sait ce qui importe ne disperse pas ses jours.",
    maxim: "Nomme ce qui compte. Que chaque journée lui obéisse.",
  },
  {
    id: 4,
    weekNumber: 4,
    nameFr: "Exécution",
    nameEn: "Resolution",
    description: "Décide avec prudence ; accomplis avec constance.",
    maxim: "Une résolution sans acte est un mensonge qu'on se fait.",
  },
  {
    id: 5,
    weekNumber: 5,
    nameFr: "Capital",
    nameEn: "Frugality",
    description: "Que tes ressources croissent au lieu de se consumer.",
    maxim: "Ne dépense que ce qui sert la construction — le reste est distraction.",
  },
  {
    id: 6,
    weekNumber: 6,
    nameFr: "Travail profond",
    nameEn: "Deep Work",
    description: "L'esprit entier accomplit ce que l'esprit dispersé abandonne.",
    maxim: "Travaille avec une attention indivisible.",
  },
  {
    id: 7,
    weekNumber: 7,
    nameFr: "Intégrité",
    nameEn: "Sincerity",
    description: "Que ta parole et ta conduite soient d'un même métal.",
    maxim: "La vérité rend l'homme solide.",
  },
  {
    id: 8,
    weekNumber: 8,
    nameFr: "Responsabilité",
    nameEn: "Justice",
    description: "Assume les conséquences de tes actes sans les fuir ni les diminuer.",
    maxim: "Un homme se mesure à ce qu'il assume, pas à ce qu'il réussit.",
  },
  {
    id: 9,
    weekNumber: 9,
    nameFr: "Équilibre",
    nameEn: "Moderation",
    description: "Sache quand pousser et quand te retirer — les deux demandent du courage.",
    maxim: "L'excès d'effort détruit autant que l'excès de repos.",
  },
  {
    id: 10,
    weekNumber: 10,
    nameFr: "Respect de soi",
    nameEn: "Cleanliness",
    description: "Que ton corps, ton espace et ta mise témoignent du soin que tu te portes.",
    maxim: "Ce que tu tolères pour toi-même, tu l'acceptes pour ta vie.",
  },
  {
    id: 11,
    weekNumber: 11,
    nameFr: "Stoïcisme",
    nameEn: "Tranquility",
    description: "Ne trouble pas ton âme pour ce qui ne dépend pas de toi.",
    maxim: "Garde ta paix pour les combats qui comptent.",
  },
  {
    id: 12,
    weekNumber: 12,
    nameFr: "Liens",
    nameEn: "Bonds",
    description: "Cultive les liens qui t'élèvent ; protège-toi de ceux qui t'épuisent.",
    maxim: "L'affection véritable nourrit — elle n'exige pas que tu te perdes.",
  },
  {
    id: 13,
    weekNumber: 13,
    nameFr: "Apprentissage",
    nameEn: "Humility",
    description: "L'ignorance assumée est le début de toute maîtrise.",
    maxim: "Reconnais l'erreur sans honte, et transforme-la en sagesse.",
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
        weekNumber: sql`excluded.week_number`,
      },
    });

  console.log("13 vertus mises à jour.");
}

seedVirtues().catch((error: unknown) => {
  console.error("Failed to seed virtues.", error);
  process.exitCode = 1;
});
