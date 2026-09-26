import { CreneauTravail, RepartitionHeures } from "./types";
import { decouperCreneauJourNuit } from "./decoupage-jour-nuit";

/**
 * Détermine si une date (YYYY-MM-DD) est un dimanche.
 */
export function estDimanche(dateStr: string): boolean {
  // Parsing rigoureux de YYYY-MM-DD en heure locale
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getDay() === 0;
}

/**
 * Détermine si une date est un jour férié ou un dimanche.
 */
export function estJourFerieOuDimanche(dateStr: string, joursFeries: string[]): boolean {
  return estDimanche(dateStr) || joursFeries.includes(dateStr);
}

/**
 * Classifie les créneaux d'une journée donnée selon les critères (jour/nuit et ouvré/férié-dimanche).
 * Fonction pure.
 */
export function classifierHeuresJournee(
  dateStr: string,
  creneaux: CreneauTravail[],
  joursFeries: string[]
): RepartitionHeures {
  const estFerieOuDim = estJourFerieOuDimanche(dateStr, joursFeries);

  let jourOuvre = 0;
  let nuitOuvre = 0;
  let jourFerie = 0;
  let nuitFerie = 0;

  for (const creneau of creneaux) {
    const { heuresJour, heuresNuit } = decouperCreneauJourNuit(
      creneau.heureDebut,
      creneau.heureFin
    );

    if (estFerieOuDim) {
      jourFerie += heuresJour;
      nuitFerie += heuresNuit;
    } else {
      jourOuvre += heuresJour;
      nuitOuvre += heuresNuit;
    }
  }

  return {
    jourOuvre: Number(jourOuvre.toFixed(4)),
    nuitOuvre: Number(nuitOuvre.toFixed(4)),
    jourFerie: Number(jourFerie.toFixed(4)),
    nuitFerie: Number(nuitFerie.toFixed(4)),
  };
}
