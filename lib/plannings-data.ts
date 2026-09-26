export interface Creneau {
  id: string;
  debut: string; // e.g. "08:00"
  fin: string;   // e.g. "16:00"
  labelJourNuit?: string; // e.g. "traversée jour/nuit possible"
}

export interface PlanningAgentSemaine {
  id: string;
  nomComplet: string;
  poste: string;
  regime: string;
  jours: {
    lun: Creneau[];
    mar: Creneau[];
    mer: Creneau[];
    jeu: Creneau[];
    ven: Creneau[];
    sam: Creneau[];
    dim: Creneau[];
  };
}

export const planningSemaineData: PlanningAgentSemaine[] = [
  {
    id: "dupont-jean",
    nomComplet: "Dupont Jean",
    poste: "Vendeur",
    regime: "Équivalence 46h",
    jours: {
      lun: [{ id: "c1", debut: "08:00", fin: "16:00" }],
      mar: [{ id: "c2", debut: "08:00", fin: "15:30" }],
      mer: [{ id: "c3", debut: "08:00", fin: "16:00" }],
      jeu: [{ id: "c4", debut: "08:00", fin: "17:00" }],
      ven: [{ id: "c5", debut: "08:00", fin: "16:30" }],
      sam: [{ id: "c6", debut: "09:00", fin: "16:00" }],
      dim: [{ id: "c7", debut: "09:00", fin: "17:00", labelJourNuit: "Majoration dimanche" }],
    },
  },
  {
    id: "martin-paul",
    nomComplet: "Martin Paul",
    poste: "Administratif",
    regime: "Standard 40h",
    jours: {
      lun: [{ id: "c8", debut: "08:00", fin: "16:00" }],
      mar: [{ id: "c9", debut: "08:00", fin: "16:00" }],
      mer: [{ id: "c10", debut: "08:00", fin: "16:00" }],
      jeu: [{ id: "c11", debut: "08:00", fin: "16:00" }],
      ven: [{ id: "c12", debut: "08:00", fin: "15:30" }],
      sam: [{ id: "c13", debut: "09:00", fin: "11:30" }],
      dim: [], // Repos
    },
  },
  {
    id: "nguyen-linh",
    nomComplet: "Nguyen Linh",
    poste: "Vendeur",
    regime: "Équivalence 46h",
    jours: {
      lun: [{ id: "c14", debut: "08:00", fin: "14:00" }],
      mar: [{ id: "c15", debut: "08:00", fin: "14:00" }],
      mer: [{ id: "c16", debut: "08:00", fin: "13:30" }],
      jeu: [{ id: "c17", debut: "08:00", fin: "14:30" }],
      ven: [{ id: "c18", debut: "08:00", fin: "15:00" }],
      sam: [{ id: "c19", debut: "08:00", fin: "16:00" }],
      dim: [{ id: "c20", debut: "09:00", fin: "15:00", labelJourNuit: "Majoration dimanche" }],
    },
  },
  {
    id: "benali-karim",
    nomComplet: "Benali Karim",
    poste: "Vendeur",
    regime: "Équivalence 46h",
    jours: {
      lun: [{ id: "c21", debut: "08:00", fin: "16:00" }],
      mar: [{ id: "c22", debut: "08:00", fin: "16:00" }],
      mer: [{ id: "c23", debut: "08:00", fin: "16:00" }],
      jeu: [{ id: "c24", debut: "08:00", fin: "16:00" }],
      ven: [{ id: "c25", debut: "07:00", fin: "16:00" }],
      sam: [
        { id: "c26a", debut: "08:00", fin: "13:00" },
        { id: "c26b", debut: "14:00", fin: "19:00", labelJourNuit: "double créneau" },
      ],
      dim: [{ id: "c27", debut: "09:00", fin: "17:00", labelJourNuit: "Majoration dimanche" }],
    },
  },
];
