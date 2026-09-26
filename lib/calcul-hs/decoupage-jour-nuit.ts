/**
 * Convertit une chaîne "HH:MM" en nombre de minutes depuis minuit (00:00).
 */
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + (m || 0);
}

export interface CreneauTravail {
  heureDebut: string;
  heureFin: string;
}

/**
 * Découpe un créneau horaire de travail en heures de jour (05:00 - 21:00) 
 * et heures de nuit (21:00 - 05:00).
 * Fonction pure.
 */
export function decouperCreneauJourNuit(
  heureDebut: string,
  heureFin: string
): { heuresJour: number; heuresNuit: number } {
  let start = timeToMinutes(heureDebut);
  let end = timeToMinutes(heureFin);

  if (end <= start) {
    end += 24 * 60;
  }

  let minutesJour = 0;
  let minutesNuit = 0;

  const DAY_START = 5 * 60;   // 300
  const DAY_END = 21 * 60;    // 1260

  for (let m = start; m < end; m++) {
    const minuteJourCycle = m % (24 * 60);

    if (minuteJourCycle >= DAY_START && minuteJourCycle < DAY_END) {
      minutesJour++;
    } else {
      minutesNuit++;
    }
  }

  return {
    heuresJour: Number((minutesJour / 60).toFixed(4)),
    heuresNuit: Number((minutesNuit / 60).toFixed(4)),
  };
}

/**
 * Extrait la répartition jour/nuit de la portion "heures supplémentaires" d'une journée,
 * sachant que les `heuresNormales` premières heures de la journée sont normales (non-sup),
 * et que les heures sup correspondent strictement à la portion FINALE chronologique des créneaux de la journée.
 * Fonction pure gérant plusieurs créneaux triés chronologiquement.
 */
export function decouperHeuresSupJournee(
  creneaux: CreneauTravail[],
  heuresNormales: number
): { heuresJour: number; heuresNuit: number } {
  // 1. Convertir tous les créneaux en une liste chronologique de minutes travaillées pour cette journée
  const minutesTravaillees: { minuteAbsolue: number; minuteJourCycle: number }[] = [];

  for (const creneau of creneaux) {
    let start = timeToMinutes(creneau.heureDebut);
    let end = timeToMinutes(creneau.heureFin);
    if (end <= start) {
      end += 24 * 60;
    }
    for (let m = start; m < end; m++) {
      minutesTravaillees.push({
        minuteAbsolue: m,
        minuteJourCycle: m % (24 * 60),
      });
    }
  }

  const normalMinutesCount = Math.round(heuresNormales * 60);
  // Les heures sup sont strictement les minutes situées après les heures normales (fin de journée)
  const supMinutes = minutesTravaillees.slice(normalMinutesCount);

  const DAY_START = 5 * 60;   // 300
  const DAY_END = 21 * 60;    // 1260

  let minutesJour = 0;
  let minutesNuit = 0;

  for (const minObj of supMinutes) {
    if (minObj.minuteJourCycle >= DAY_START && minObj.minuteJourCycle < DAY_END) {
      minutesJour++;
    } else {
      minutesNuit++;
    }
  }

  return {
    heuresJour: Number((minutesJour / 60).toFixed(4)),
    heuresNuit: Number((minutesNuit / 60).toFixed(4)),
  };
}
