import {
  AgentPourCalcul,
  SemainePlanning,
  ResultatSemaine,
  RepartitionHeures,
  DetailHeuresSupParTaux,
} from "./types";
import { classifierHeuresJournee, estJourFerieOuDimanche } from "./classification-heures";
import { decouperHeuresSupJournee } from "./decoupage-jour-nuit";
import { REGLES_MAJORATION_PAR_DEFAUT, ReglesMajoration } from "./regles-majoration";

const JOURS_SEMAINE: (keyof SemainePlanning)[] = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];

/**
 * Calcule les heures supplémentaires et leur répartition par taux selon la convention (Bénin, Art. 66).
 * Utilise l'allocation chronologique stricte pour les heures sup d'une journée mixte.
 * Fonction pure.
 */
export function calculerHeuresSupSemaine(
  agent: AgentPourCalcul,
  planning: SemainePlanning,
  joursFeries: string[],
  regles: ReglesMajoration = REGLES_MAJORATION_PAR_DEFAUT
): ResultatSemaine {
  const seuil = agent.dureeReferenceSemaine;

  let cumulHeuresRealisees = 0;
  const repartitionRealiseesTotale: RepartitionHeures = {
    jourOuvre: 0,
    nuitOuvre: 0,
    jourFerie: 0,
    nuitFerie: 0,
  };

  const repartitionSupTotale: RepartitionHeures = {
    jourOuvre: 0,
    nuitOuvre: 0,
    jourFerie: 0,
    nuitFerie: 0,
  };

  const cumulParJour: ResultatSemaine["cumulParJour"] = [];

  // Étape 1 : Analyser chaque jour de la semaine chronologiquement (Lun -> Dim)
  const detailsJourParJour = JOURS_SEMAINE.map((key) => {
    const jour = planning[key];
    const repartitionJour = classifierHeuresJournee(jour.date, jour.creneaux, joursFeries);
    const totalJour =
      repartitionJour.jourOuvre +
      repartitionJour.nuitOuvre +
      repartitionJour.jourFerie +
      repartitionJour.nuitFerie;

    const cumulAvant = cumulHeuresRealisees;
    cumulHeuresRealisees += totalJour;
    const cumulApres = cumulHeuresRealisees;

    // Calcul de la part des heures de ce jour qui dépassent le seuil réglementaire
    let heuresNormalesCeJour = 0;
    let heuresSupCeJour = 0;

    if (cumulAvant >= seuil) {
      // Toutes les heures de ce jour sont des heures sup
      heuresSupCeJour = totalJour;
    } else if (cumulApres <= seuil) {
      // Toutes les heures de ce jour sont des heures normales
      heuresNormalesCeJour = totalJour;
    } else {
      // Le seuil est atteint au cours de cette journée
      heuresNormalesCeJour = seuil - cumulAvant;
      heuresSupCeJour = cumulApres - seuil;
    }

    // Accumulation des heures réalisées totales
    repartitionRealiseesTotale.jourOuvre += repartitionJour.jourOuvre;
    repartitionRealiseesTotale.nuitOuvre += repartitionJour.nuitOuvre;
    repartitionRealiseesTotale.jourFerie += repartitionJour.jourFerie;
    repartitionRealiseesTotale.nuitFerie += repartitionJour.nuitFerie;

    cumulParJour.push({
      date: jour.date,
      heuresJour: Number(totalJour.toFixed(4)),
      heuresCumulees: Number(cumulApres.toFixed(4)),
      depassementSeuil: Number(heuresSupCeJour.toFixed(4)),
    });

    return {
      date: jour.date,
      creneaux: jour.creneaux,
      heuresNormalesCeJour,
      heuresSupCeJour,
      totalJour,
    };
  });

  // Étape 2 : Répartition chronologique stricte des heures sup par catégorie
  for (const detail of detailsJourParJour) {
    if (detail.heuresSupCeJour <= 0 || detail.totalJour <= 0) continue;

    const estFerieOuDim = estJourFerieOuDimanche(detail.date, joursFeries);

    // Si toutes les heures du jour sont des sup (heuresNormalesCeJour == 0),
    // alors la répartition jour/nuit des sup est simplement la répartition totale du jour.
    if (detail.heuresNormalesCeJour <= 0) {
      const repJour = classifierHeuresJournee(detail.date, detail.creneaux, joursFeries);
      if (estFerieOuDim) {
        repartitionSupTotale.jourFerie += repJour.jourFerie;
        repartitionSupTotale.nuitFerie += repJour.nuitFerie;
      } else {
        repartitionSupTotale.jourOuvre += repJour.jourOuvre;
        repartitionSupTotale.nuitOuvre += repJour.nuitOuvre;
      }
    } else {
      // Le seuil a été franchi au cours de la journée : 
      // Les heures sup correspondent strictement à la portion FINALE (chronologique) des créneaux.
      const { heuresJour, heuresNuit } = decouperHeuresSupJournee(
        detail.creneaux,
        detail.heuresNormalesCeJour
      );

      if (estFerieOuDim) {
        repartitionSupTotale.jourFerie += heuresJour;
        repartitionSupTotale.nuitFerie += heuresNuit;
      } else {
        repartitionSupTotale.jourOuvre += heuresJour;
        repartitionSupTotale.nuitOuvre += heuresNuit;
      }
    }
  }

  // Arrondir proprement les totaux HS
  const totalJourOuvreSup = Number(repartitionSupTotale.jourOuvre.toFixed(4));
  const totalNuitOuvreSup = Number(repartitionSupTotale.nuitOuvre.toFixed(4));
  const totalJourFerieSup = Number(repartitionSupTotale.jourFerie.toFixed(4));
  const totalNuitFerieSup = Number(repartitionSupTotale.nuitFerie.toFixed(4));

  const heuresSupplementairesTotales = Number(
    (totalJourOuvreSup + totalNuitOuvreSup + totalJourFerieSup + totalNuitFerieSup).toFixed(4)
  );

  // Étape 3 : Application de la grille de majoration sur les heures sup
  const detailsParTaux: DetailHeuresSupParTaux[] = [];

  // 1. Jour ouvré : les 8 premières heures à 12%, au-delà à 35%
  if (totalJourOuvreSup > 0) {
    const part12 = Math.min(regles.seuilHeuresTranche1JourOuvre, totalJourOuvreSup);
    const part35 = Math.max(0, totalJourOuvreSup - regles.seuilHeuresTranche1JourOuvre);

    if (part12 > 0) {
      detailsParTaux.push({
        taux: regles.tauxJourOuvreTranche1,
        libelle: `HS Jour ouvré (${regles.tauxJourOuvreTranche1}%)`,
        categorie: "jourOuvre",
        nombreHeures: Number(part12.toFixed(4)),
      });
    }
    if (part35 > 0) {
      detailsParTaux.push({
        taux: regles.tauxJourOuvreTranche2,
        libelle: `HS Jour ouvré au-delà de ${regles.seuilHeuresTranche1JourOuvre}h (${regles.tauxJourOuvreTranche2}%)`,
        categorie: "jourOuvre",
        nombreHeures: Number(part35.toFixed(4)),
      });
    }
  }

  // 2. Nuit ouvré : 50%
  if (totalNuitOuvreSup > 0) {
    detailsParTaux.push({
      taux: regles.tauxNuitOuvre,
      libelle: `HS Nuit ouvré (${regles.tauxNuitOuvre}%)`,
      categorie: "nuitOuvre",
      nombreHeures: totalNuitOuvreSup,
    });
  }

  // 3. Jour dimanche-férié : 50%
  if (totalJourFerieSup > 0) {
    detailsParTaux.push({
      taux: regles.tauxJourFerie,
      libelle: `HS Jour dimanche/férié (${regles.tauxJourFerie}%)`,
      categorie: "jourFerie",
      nombreHeures: totalJourFerieSup,
    });
  }

  // 4. Nuit dimanche-férié : 100%
  if (totalNuitFerieSup > 0) {
    detailsParTaux.push({
      taux: regles.tauxNuitFerie,
      libelle: `HS Nuit dimanche/férié (${regles.tauxNuitFerie}%)`,
      categorie: "nuitFerie",
      nombreHeures: totalNuitFerieSup,
    });
  }

  let indexTrancheJourOuvre = 0;
  const detailsParTauxConfigures = detailsParTaux.map((detail) => {
    if (detail.categorie === "jourOuvre") {
      const tranche = indexTrancheJourOuvre;
      indexTrancheJourOuvre += 1;
      return {
        ...detail,
        taux: tranche === 0 ? regles.tauxJourOuvreTranche1 : regles.tauxJourOuvreTranche2,
        libelle:
          tranche === 0
            ? `HS Jour ouvré (${regles.tauxJourOuvreTranche1}%)`
            : `HS Jour ouvré au-delà de ${regles.seuilHeuresTranche1JourOuvre}h (${regles.tauxJourOuvreTranche2}%)`,
      };
    }

    const libellesParCategorie = {
      jourOuvre: detail.libelle,
      nuitOuvre: `HS Nuit ouvré (${regles.tauxNuitOuvre}%)`,
      jourFerie: `HS Jour dimanche/férié (${regles.tauxJourFerie}%)`,
      nuitFerie: `HS Nuit dimanche/férié (${regles.tauxNuitFerie}%)`,
    };

    return {
      ...detail,
      taux: regles[
        detail.categorie === "nuitOuvre"
          ? "tauxNuitOuvre"
          : detail.categorie === "jourFerie"
            ? "tauxJourFerie"
            : "tauxNuitFerie"
      ],
      libelle: libellesParCategorie[detail.categorie],
    };
  });

  return {
    agentId: agent.id,
    heuresRealiseesTotales: Number(cumulHeuresRealisees.toFixed(4)),
    seuilReglementaire: seuil,
    heuresSupplementairesTotales,
    repartitionHeuresRealisees: {
      jourOuvre: Number(repartitionRealiseesTotale.jourOuvre.toFixed(4)),
      nuitOuvre: Number(repartitionRealiseesTotale.nuitOuvre.toFixed(4)),
      jourFerie: Number(repartitionRealiseesTotale.jourFerie.toFixed(4)),
      nuitFerie: Number(repartitionRealiseesTotale.nuitFerie.toFixed(4)),
    },
    repartitionHeuresSupplementaires: {
      jourOuvre: totalJourOuvreSup,
      nuitOuvre: totalNuitOuvreSup,
      jourFerie: totalJourFerieSup,
      nuitFerie: totalNuitFerieSup,
    },
    detailsParTaux: detailsParTauxConfigures,
    cumulParJour,
  };
}
