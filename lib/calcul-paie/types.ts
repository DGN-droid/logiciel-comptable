export interface DetailMontantTaux {
  taux: number; // 12, 35, 50, 100
  libelle: string;
  nombreHeures: number;
  montant: number; // en FCFA
}

export interface ResultatPaie {
  agentId: string;
  salaireBaseMensuel: number;
  tauxHoraire: number;
  montantHeuresSup: number;
  inclureHeuresSup: boolean;
  salaireTotal: number;
  detailMontantParTaux: DetailMontantTaux[];
}
