export type StatutAgent = "Actif" | "Inactif";

export interface Agent {
  id: string;
  nomComplet: string;
  matricule: string;
  poste: string;
  libelleRegime: string;
  dureeReferenceSemaine: number;
  salaireBaseMensuel: number | null;
  inclureHeuresSupDansPaie: boolean | null;
  statut: StatutAgent;
}

export const agentsListInitial: Agent[] = [
  {
    id: "1",
    nomComplet: "Dupont Jean",
    matricule: "4021",
    poste: "Vendeur",
    libelleRegime: "Équivalence Vente",
    dureeReferenceSemaine: 46,
    salaireBaseMensuel: 180000,
    inclureHeuresSupDansPaie: true,
    statut: "Actif",
  },
  {
    id: "2",
    nomComplet: "Martin Paul",
    matricule: "5122",
    poste: "Administratif",
    libelleRegime: "Standard",
    dureeReferenceSemaine: 40,
    salaireBaseMensuel: 220000,
    inclureHeuresSupDansPaie: true,
    statut: "Actif",
  },
  {
    id: "3",
    nomComplet: "Nguyen Linh",
    matricule: "3058",
    poste: "Vendeur",
    libelleRegime: "Équivalence Vente",
    dureeReferenceSemaine: 46,
    salaireBaseMensuel: 175000,
    inclureHeuresSupDansPaie: true,
    statut: "Actif",
  },
  {
    id: "4",
    nomComplet: "Benali Karim",
    matricule: "0177",
    poste: "Vendeur",
    libelleRegime: "Équivalence Vente",
    dureeReferenceSemaine: 46,
    salaireBaseMensuel: 190000,
    inclureHeuresSupDansPaie: true,
    statut: "Actif",
  },
  {
    id: "5",
    nomComplet: "Petit Camille",
    matricule: "0091",
    poste: "Administratif",
    libelleRegime: "Standard",
    dureeReferenceSemaine: 40,
    salaireBaseMensuel: 210000,
    inclureHeuresSupDansPaie: false,
    statut: "Inactif",
  },
];
