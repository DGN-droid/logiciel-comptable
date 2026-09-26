import { ResultatSemaine } from "@/lib/calcul-hs/types";
import { calculerTauxHoraire } from "./calcul-taux-horaire";
import { ResultatPaie, DetailMontantTaux } from "./types";

export interface AgentPourPaie {
  id: string;
  salaireBaseMensuel: number | null;
  inclureHeuresSupDansPaie: boolean | null;
}

export function calculerPaieAgent(
  agent: AgentPourPaie,
  resultatSemaine: ResultatSemaine
): ResultatPaie {
  const salaireBaseMensuel = agent.salaireBaseMensuel ?? 0;
  const tauxHoraire = calculerTauxHoraire(salaireBaseMensuel);
  const inclureHeuresSup = agent.inclureHeuresSupDansPaie === true;

  let montantHeuresSup = 0;
  const detailMontantParTaux: DetailMontantTaux[] = [];

  for (const detail of resultatSemaine.detailsParTaux) {
    // montant = nombreHeures × tauxHoraire × (1 + taux/100)
    const montantTranche = detail.nombreHeures * tauxHoraire * (1 + detail.taux / 100);
    const montantArrondi = Number(montantTranche.toFixed(2));
    montantHeuresSup += montantTranche;

    detailMontantParTaux.push({
      taux: detail.taux,
      libelle: detail.libelle,
      nombreHeures: detail.nombreHeures,
      montant: montantArrondi,
    });
  }

  const montantHsTotal = Number(montantHeuresSup.toFixed(2));
  const salaireTotal = Number(
    (salaireBaseMensuel + (inclureHeuresSup ? montantHsTotal : 0)).toFixed(2)
  );

  return {
    agentId: agent.id,
    salaireBaseMensuel,
    tauxHoraire,
    montantHeuresSup: montantHsTotal,
    inclureHeuresSup,
    salaireTotal,
    detailMontantParTaux,
  };
}
