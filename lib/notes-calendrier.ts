export type CategorieNote = "Paie" | "Planning" | "Client" | "Administratif" | "Autre";

export interface NotePeriode {
  id: string;
  titre: string;
  contenu: string;
  dateDebut: string;
  dateFin: string;
  categorie: CategorieNote;
}
