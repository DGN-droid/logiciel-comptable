export interface JourFerie {
  id: string;
  date: string; // Format "YYYY-MM-DD"
  nom: string;
  annee: number;
}

/**
 * Données factices : Jours fériés du Bénin en 2026
 * Note : Ces dates sont des exemples factices à valider avec le client.
 */
export const joursFeries2026: JourFerie[] = [
  { id: "1", date: "2026-01-01", nom: "Nouvel An", annee: 2026 },
  { id: "2", date: "2026-01-10", nom: "Fête Nationale du Vodoun", annee: 2026 },
  { id: "3", date: "2026-03-20", nom: "Korité", annee: 2026 },
  { id: "4", date: "2026-04-06", nom: "Lundi de Pâques", annee: 2026 },
  { id: "5", date: "2026-05-01", nom: "Fête du Travail", annee: 2026 },
  { id: "6", date: "2026-05-14", nom: "Ascension", annee: 2026 },
  { id: "7", date: "2026-05-25", nom: "Lundi de Pentecôte", annee: 2026 },
  { id: "8", date: "2026-05-27", nom: "Tabaski", annee: 2026 },
  { id: "9", date: "2026-08-01", nom: "Fête de l'Indépendance", annee: 2026 },
  { id: "10", date: "2026-08-15", nom: "Assomption", annee: 2026 },
  { id: "11", date: "2026-08-25", nom: "Maouloud", annee: 2026 },
  { id: "12", date: "2026-10-26", nom: "Fête des Forces armées", annee: 2026 },
  { id: "13", date: "2026-11-01", nom: "Toussaint", annee: 2026 },
  { id: "14", date: "2026-12-25", nom: "Noël", annee: 2026 },
]; 

export const nomsJoursFeries2026: Record<string, string> = Object.fromEntries(
  joursFeries2026.map((jour) => [jour.date, jour.nom]),
);

export const moisNoms = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export const joursSemaine = ["L", "M", "M", "J", "V", "S", "D"];

/**
 * Calcule la structure des jours pour un mois donné (année 2026)
 * Retourne un tableau d'objets représentant les cellules de la grille (jours du mois + padding début/fin)
 */
export function getMoisGrid(annee: number, moisIndex: number) {
  // premier jour du mois (0 = Dimanche, 1 = Lundi, etc.)
  const premierJour = new Date(annee, moisIndex, 1);
  let startingDayOfWeek = premierJour.getDay(); // 0 is Sunday
  // Convertir pour que Lundi = 0, ..., Dimanche = 6
  startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

  const dernierJour = new Date(annee, moisIndex + 1, 0);
  const totalJours = dernierJour.getDate();

  const cellules = [];

  // Jours vides avant le 1er du mois
  for (let i = 0; i < startingDayOfWeek; i++) {
    cellules.push({ dayNumber: null, dateString: null, isDimanche: false, isFerie: false });
  }

  // Jours du mois
  for (let d = 1; d <= totalJours; d++) {
    const monthStr = String(moisIndex + 1).padStart(2, "0");
    const dayStr = String(d).padStart(2, "0");
    const dateString = `${annee}-${monthStr}-${dayStr}`;

    const dateObj = new Date(annee, moisIndex, d);
    const isDimanche = dateObj.getDay() === 0;
    const isFerie = joursFeries2026.some((f) => f.date === dateString);

    cellules.push({
      dayNumber: d,
      dateString,
      isDimanche,
      isFerie,
    });
  }

  return cellules;
}
