export type StatutSuiviJour = "a_renseigner" | "en_cours" | "valide" | "absent";

export interface SuiviJour {
  agentId: string;
  date: string;
  statut: StatutSuiviJour;
  note: string;
  modifieLe: string;
}

export function cleSuiviJour(agentId: string, date: string) {
  return `${agentId}:${date}`;
}

export function suiviJourParDefaut(agentId: string, date: string): SuiviJour {
  return {
    agentId,
    date,
    statut: "a_renseigner",
    note: "",
    modifieLe: "",
  };
}
