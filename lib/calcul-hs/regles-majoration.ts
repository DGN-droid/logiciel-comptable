export interface ReglesMajoration {
  seuilHeuresTranche1JourOuvre: number;
  tauxJourOuvreTranche1: number;
  tauxJourOuvreTranche2: number;
  tauxNuitOuvre: number;
  tauxJourFerie: number;
  tauxNuitFerie: number;
  libelleVersion: string;
  dateEffet: string;
}

export const REGLES_MAJORATION_PAR_DEFAUT: ReglesMajoration = {
  seuilHeuresTranche1JourOuvre: 8,
  tauxJourOuvreTranche1: 12,
  tauxJourOuvreTranche2: 35,
  tauxNuitOuvre: 50,
  tauxJourFerie: 50,
  tauxNuitFerie: 100,
  libelleVersion: "R-STANDARD-V1",
  dateEffet: new Date().toISOString().slice(0, 10),
};
