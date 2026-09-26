import { AgentPourCalcul, JourSemaine, SemainePlanning, TypeRegime } from "@/lib/calcul-hs/types";
import { StatutAgent } from "@/lib/agents-data";

export const entrepriseMock = "Pharmacie Centrale";
export const semaineMock = { libelle: "S30", dateDebut: "2026-07-27", dateFin: "2026-08-02" };

export interface AgentComplet extends AgentPourCalcul {
  matricule: string;
  poste: string;
  libelleRegime: string;
  salaireBaseMensuel: number | null;
  inclureHeuresSupDansPaie: boolean | null;
  statut: StatutAgent;
  /** Jours habituels de travail ; absent sur les anciennes données importées. */
  joursTravail?: JourSemaine[];
}

export const agentsMock: AgentComplet[] = [
  {
    id: "dupont-jean",
    nomComplet: "Dupont Jean",
    matricule: "4021",
    poste: "Vendeur",
    regime: "Equivalence" as TypeRegime,
    libelleRegime: "Équivalence Vente",
    dureeReferenceSemaine: 46,
    salaireBaseMensuel: 180000,
    inclureHeuresSupDansPaie: true,
    statut: "Actif",
  },
  {
    id: "martin-paul",
    nomComplet: "Martin Paul",
    matricule: "5122",
    poste: "Administratif",
    regime: "Standard" as TypeRegime,
    libelleRegime: "Standard",
    dureeReferenceSemaine: 40,
    salaireBaseMensuel: 220000,
    inclureHeuresSupDansPaie: true,
    statut: "Actif",
  },
  {
    id: "nguyen-linh",
    nomComplet: "Nguyen Linh",
    matricule: "3058",
    poste: "Vendeur",
    regime: "Equivalence" as TypeRegime,
    libelleRegime: "Équivalence Vente",
    dureeReferenceSemaine: 46,
    salaireBaseMensuel: 175000,
    inclureHeuresSupDansPaie: true,
    statut: "Actif",
  },
  {
    id: "benali-karim",
    nomComplet: "Benali Karim",
    matricule: "0177",
    poste: "Vendeur",
    regime: "Equivalence" as TypeRegime,
    libelleRegime: "Équivalence Vente",
    dureeReferenceSemaine: 46,
    salaireBaseMensuel: 190000,
    inclureHeuresSupDansPaie: true,
    statut: "Actif",
  },
  {
    id: "petit-camille",
    nomComplet: "Petit Camille",
    matricule: "0091",
    poste: "Administratif",
    regime: "Standard" as TypeRegime,
    libelleRegime: "Standard",
    dureeReferenceSemaine: 40,
    salaireBaseMensuel: 210000,
    inclureHeuresSupDansPaie: false,
    statut: "Inactif",
  },
];

// Plannings de la semaine S30 (27 juil. – 2 août 2026) pour chaque agent
export const planningsSemaineMock: Record<string, SemainePlanning> = {
  "dupont-jean": {
    lun: { date: "2026-07-27", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] },
    mar: { date: "2026-07-28", creneaux: [{ heureDebut: "08:00", heureFin: "15:30" }] },
    mer: { date: "2026-07-29", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] },
    jeu: { date: "2026-07-30", creneaux: [{ heureDebut: "08:00", heureFin: "17:00" }] },
    ven: { date: "2026-07-31", creneaux: [{ heureDebut: "08:00", heureFin: "16:30" }] },
    sam: { date: "2026-08-01", creneaux: [{ heureDebut: "09:00", heureFin: "16:00" }] },
    dim: { date: "2026-08-02", creneaux: [{ heureDebut: "09:00", heureFin: "17:00" }] },
  },
  "martin-paul": {
    lun: { date: "2026-07-27", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] },
    mar: { date: "2026-07-28", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] },
    mer: { date: "2026-07-29", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] },
    jeu: { date: "2026-07-30", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] },
    ven: { date: "2026-07-31", creneaux: [{ heureDebut: "08:00", heureFin: "15:30" }] },
    sam: { date: "2026-08-01", creneaux: [{ heureDebut: "09:00", heureFin: "11:30" }] },
    dim: { date: "2026-08-02", creneaux: [] },
  },
  "nguyen-linh": {
    lun: { date: "2026-07-27", creneaux: [{ heureDebut: "08:00", heureFin: "14:00" }] },
    mar: { date: "2026-07-28", creneaux: [{ heureDebut: "08:00", heureFin: "14:00" }] },
    mer: { date: "2026-07-29", creneaux: [{ heureDebut: "08:00", heureFin: "13:30" }] },
    jeu: { date: "2026-07-30", creneaux: [{ heureDebut: "08:00", heureFin: "14:30" }] },
    ven: { date: "2026-07-31", creneaux: [{ heureDebut: "08:00", heureFin: "15:00" }] },
    sam: { date: "2026-08-01", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] },
    dim: { date: "2026-08-02", creneaux: [{ heureDebut: "09:00", heureFin: "15:00" }] },
  },
  "benali-karim": {
    lun: { date: "2026-07-27", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] },
    mar: { date: "2026-07-28", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] },
    mer: { date: "2026-07-29", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] },
    jeu: { date: "2026-07-30", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] },
    ven: { date: "2026-07-31", creneaux: [{ heureDebut: "07:00", heureFin: "16:00" }] },
    sam: {
      date: "2026-08-01",
      creneaux: [
        { heureDebut: "08:00", heureFin: "13:00" },
        { heureDebut: "14:00", heureFin: "19:00" },
      ],
    },
    dim: { date: "2026-08-02", creneaux: [{ heureDebut: "09:00", heureFin: "17:00" }] },
  },
  "petit-camille": {
    lun: { date: "2026-07-27", creneaux: [] },
    mar: { date: "2026-07-28", creneaux: [] },
    mer: { date: "2026-07-29", creneaux: [] },
    jeu: { date: "2026-07-30", creneaux: [] },
    ven: { date: "2026-07-31", creneaux: [] },
    sam: { date: "2026-08-01", creneaux: [] },
    dim: { date: "2026-08-02", creneaux: [] },
  },
};

// Jours fériés déclarés (ex: Bénin 2026)
export const joursFeriesMock: string[] = [
  "2026-01-01",
  "2026-01-10",
  "2026-03-20",
  "2026-04-06",
  "2026-05-01",
  "2026-05-14",
  "2026-05-25",
  "2026-05-27",
  "2026-08-01", // Fête de l'Indépendance (samedi S30)
  "2026-08-15",
  "2026-08-25",
  "2026-10-26",
  "2026-11-01",
  "2026-12-25",
];
