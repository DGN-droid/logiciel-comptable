// HYPOTHÈSE À VALIDER AVEC LE CLIENT : 173.33h = base mensuelle standard (40h/semaine × 52 semaines / 12 mois). À ajuster si le cabinet utilise une autre convention.
export const BASE_HEURES_MENSUELLES = 173.33;

export function calculerTauxHoraire(salaireBaseMensuel: number): number {
  if (salaireBaseMensuel <= 0) return 0;
  return Number((salaireBaseMensuel / BASE_HEURES_MENSUELLES).toFixed(4));
}
