export interface AgentData {
  id: string;
  nomComplet: string;
  poste: string;
  regime: string;
  jours: {
    lun: number;
    mar: number;
    mer: number;
    jeu: number;
    ven: number;
    sam: number;
    dim: number;
  };
  realise: number;
  seuil: number;
  hs: number;
  detailsTaux: {
    hsJour12: number;
    hsJour35: number;
    hsNuit50: number;
    dimFerie50: number;
    nuitDimF100: number;
    tauxJourOuvreTranche1?: number;
    tauxJourOuvreTranche2?: number;
    tauxNuitOuvre?: number;
    tauxJourFerie?: number;
    tauxNuitFerie?: number;
  };
  tracabilite: {
    genereLe: string;
    importPlanning: string;
    regleAppliquee: string;
  };
}

export const agentsFactices: AgentData[] = [
  {
    id: "dupont-jean",
    nomComplet: "Dupont Jean",
    poste: "Vendeur",
    regime: "Équiv. 46h",
    jours: { lun: 8, mar: 7.5, mer: 8, jeu: 9, ven: 8.5, sam: 7, dim: 8 },
    realise: 56,
    seuil: 46,
    hs: 10,
    detailsTaux: {
      hsJour12: 8,
      hsJour35: 2,
      hsNuit50: 0,
      dimFerie50: 0,
      nuitDimF100: 0,
    },
    tracabilite: {
      genereLe: "2026-08-02 09:14",
      importPlanning: "S30.xlsx",
      regleAppliquee: "R-46/EQT",
    },
  },
  {
    id: "martin-paul",
    nomComplet: "Martin Paul",
    poste: "Administratif",
    regime: "Standard 40h",
    jours: { lun: 8, mar: 8, mer: 8, jeu: 8, ven: 7.5, sam: 2.5, dim: 0 },
    realise: 42,
    seuil: 40,
    hs: 2,
    detailsTaux: {
      hsJour12: 2,
      hsJour35: 0,
      hsNuit50: 0,
      dimFerie50: 0,
      nuitDimF100: 0,
    },
    tracabilite: {
      genereLe: "2026-08-02 09:14",
      importPlanning: "S30.xlsx",
      regleAppliquee: "R-40/STD",
    },
  },
  {
    id: "nguyen-linh",
    nomComplet: "Nguyen Linh",
    poste: "Vendeur",
    regime: "Équiv. 46h",
    jours: { lun: 6, mar: 6, mer: 5.5, jeu: 6.5, ven: 7, sam: 8, dim: 6 },
    realise: 45,
    seuil: 46,
    hs: 0,
    detailsTaux: {
      hsJour12: 0,
      hsJour35: 0,
      hsNuit50: 0,
      dimFerie50: 0,
      nuitDimF100: 0,
    },
    tracabilite: {
      genereLe: "2026-08-02 09:14",
      importPlanning: "S30.xlsx",
      regleAppliquee: "R-46/EQT",
    },
  },
  {
    id: "benali-karim",
    nomComplet: "Benali Karim",
    poste: "Vendeur",
    regime: "Équiv. 46h",
    jours: { lun: 8, mar: 8, mer: 8, jeu: 8, ven: 9, sam: 10, dim: 8 },
    realise: 59,
    seuil: 46,
    hs: 13,
    detailsTaux: {
      hsJour12: 8,
      hsJour35: 5,
      hsNuit50: 0,
      dimFerie50: 0,
      nuitDimF100: 0,
    },
    tracabilite: {
      genereLe: "2026-08-02 09:14",
      importPlanning: "S30.xlsx",
      regleAppliquee: "R-46/EQT",
    },
  },
];
