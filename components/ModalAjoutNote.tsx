"use client";

import { useEffect, useState } from "react";
import { X, NotebookPen } from "lucide-react";
import { CategorieNote, NotePeriode } from "@/lib/notes-calendrier";

interface ModalAjoutNoteProps {
  isOpen: boolean;
  dateInitiale: string;
  onClose: () => void;
  onSave: (note: Omit<NotePeriode, "id">) => void;
}

const categories: CategorieNote[] = ["Paie", "Planning", "Client", "Administratif", "Autre"];

export default function ModalAjoutNote({ isOpen, dateInitiale, onClose, onSave }: ModalAjoutNoteProps) {
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [dateDebut, setDateDebut] = useState(dateInitiale);
  const [dateFin, setDateFin] = useState(dateInitiale);
  const [categorie, setCategorie] = useState<CategorieNote>("Autre");

  useEffect(() => {
    if (isOpen) {
      setDateDebut(dateInitiale);
      setDateFin(dateInitiale);
    }
  }, [dateInitiale, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!titre.trim() || !contenu.trim() || dateFin < dateDebut) return;
    onSave({ titre: titre.trim(), contenu: contenu.trim(), dateDebut, dateFin, categorie });
    setTitre("");
    setContenu("");
    setCategorie("Autre");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 text-[#264387]">
            <NotebookPen className="w-5 h-5" />
            <h3 className="font-bold text-gray-900">Ajouter une note de période</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Titre</label>
            <input required value={titre} onChange={(event) => setTitre(event.target.value)} placeholder="Ex. Relance des feuilles de présence" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#264387]/30" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Début
              <input type="date" required value={dateDebut} onChange={(event) => setDateDebut(event.target.value)} className="mt-1.5 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-normal" />
            </label>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Fin
              <input type="date" required value={dateFin} onChange={(event) => setDateFin(event.target.value)} className="mt-1.5 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-normal" />
            </label>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Catégorie</label>
            <select value={categorie} onChange={(event) => setCategorie(event.target.value as CategorieNote)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              {categories.map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Note</label>
            <textarea required rows={4} value={contenu} onChange={(event) => setContenu(event.target.value)} placeholder="Informations utiles pour le suivi comptable…" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#264387]/30" />
          </div>
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200">Annuler</button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#1c6943] hover:bg-[#155435]">Enregistrer la note</button>
          </div>
        </form>
      </div>
    </div>
  );
}
