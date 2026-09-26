export type TypeRegime = "Standard" | "Equivalence";

export type JourSemaine = "lun" | "mar" | "mer" | "jeu" | "ven" | "sam" | "dim";

export const JOURS_SEMAINE: JourSemaine[] = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];

export interface AgentPourCalcul {
  id: string;
  nomComplet: string;
  regime: TypeRegime;
  dureeReferenceSemaine: number; // ex: 40 ou 46
}

export interface CreneauTravail {
  heureDebut: string; // "HH:MM", ex: "08:00"
  heureFin: string;   // "HH:MM", ex: "16:00"
}

export interface JourPlanning {
  date: string;       // "YYYY-MM-DD"
  creneaux: CreneauTravail[];
}

export type SemainePlanning = {
  lun: JourPlanning;
  mar: JourPlanning;
  mer: JourPlanning;
  jeu: JourPlanning;
  ven: JourPlanning;
  sam: JourPlanning;
  dim: JourPlanning;
};

export type CategorieHeure = 
  | "jourOuvre" 
  | "nuitOuvre" 
  | "jourFerie" 
  | "nuitFerie";

export interface RepartitionHeures {
  jourOuvre: number;
  nuitOuvre: number;
  jourFerie: number;
  nuitFerie: number;
}

export interface DetailHeuresSupParTaux {
  taux: number; // 12, 35, 50, 100
  libelle: string;
  categorie: CategorieHeure;
  nombreHeures: number;
}

export interface ResultatSemaine {
  agentId: string;
  heuresRealiseesTotales: number;
  seuilReglementaire: number;
  heuresSupplementairesTotales: number;
  repartitionHeuresRealisees: RepartitionHeures;
  repartitionHeuresSupplementaires: RepartitionHeures;
  detailsParTaux: DetailHeuresSupParTaux[];
  cumulParJour: {
    date: string;
    heuresJour: number;
    heuresCumulees: number;
    depassementSeuil: number;
  }[];
}
