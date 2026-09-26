export function telechargerCSV(nomFichier: string, lignes: string[][]) {
  const contenu = "\uFEFF" + lignes
    .map((ligne) => ligne.map((cellule) => `"${String(cellule).replaceAll('"', '""')}"`).join(";"))
    .join("\r\n");
  const blob = new Blob([contenu], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = nomFichier;
  lien.click();
  URL.revokeObjectURL(url);
}
