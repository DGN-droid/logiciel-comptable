"use client";

import React, { useEffect, useState } from "react";
import { Clock, Plus, Trash, X } from "lucide-react";
import { Creneau } from "@/lib/plannings-data";
import { StatutSuiviJour } from "@/lib/suivi-heures";

interface SuiviInitial {
  statut: StatutSuiviJour;
  note: string;
}

interface ModalEditCelluleProps {
  isOpen: boolean;
  onClose: () => void;
  agentNom: string;
  jourNom: string;
  creneauxInitiaux: Creneau[];
  suiviInitial: SuiviInitial;
  joursCiblesNombre: number;
  onSave: (creneaux: Creneau[], suivi: SuiviInitial, appliquerTousLesJours: boolean) => void;
}

const statuts: Array<{ value: StatutSuiviJour; label: string; description: string }> = [
  { value: "a_renseigner", label: "À renseigner", description: "La journée n’a pas encore été contrôlée" },
  { value: "en_cours", label: "En cours", description: "La journée n’est pas encore terminée" },
  { value: "valide", label: "Journée validée", description: "Les heures ont été vérifiées" },
  { value: "absent", label: "Absent", description: "Aucune heure travaillée ce jour" },
];

export default function ModalEditCellule({
  isOpen,
  onClose,
  agentNom,
  jourNom,
  creneauxInitiaux,
  suiviInitial,
  joursCiblesNombre,
  onSave,
}: ModalEditCelluleProps) {
  const [creneaux, setCreneaux] = useState<Creneau[]>(creneauxInitiaux);
  const [statut, setStatut] = useState<StatutSuiviJour>(suiviInitial.statut);
  const [note, setNote] = useState(suiviInitial.note);
  const [appliquerTousLesJours, setAppliquerTousLesJours] = useState(false);

  useEffect(() => {
    setCreneaux([...creneauxInitiaux]);
    setStatut(suiviInitial.statut);
    setNote(suiviInitial.note);
    setAppliquerTousLesJours(false);
  }, [creneauxInitiaux, suiviInitial, isOpen]);

  if (!isOpen) return null;

  const ajouterCreneau = () => {
    setCreneaux((prev) => [
      ...prev,
      { id: Date.now().toString(), debut: "08:00", fin: "16:00" },
    ]);
  };

  const supprimerCreneau = (id: string) => {
    setCreneaux((prev) => prev.filter((creneau) => creneau.id !== id));
  };

  const modifierCreneau = (id: string, champ: "debut" | "fin", valeur: string) => {
    setCreneaux((prev) => prev.map((creneau) => (
      creneau.id === id ? { ...creneau, [champ]: valeur } : creneau
    )));
  };

  const enregistrer = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(creneaux, { statut, note }, appliquerTousLesJours);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <div className="flex items-center gap-2 text-[#264387]">
            <Clock className="h-5 w-5" />
            <h3 className="text-base font-bold text-gray-900">Suivi de la journée</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={enregistrer} className="space-y-5 p-6">
          <div className="space-y-1 rounded-lg border border-blue-100 bg-blue-50/60 p-3.5">
            <p className="text-xs font-medium text-blue-900"><span className="font-bold">Agent :</span> {agentNom}</p>
            <p className="text-xs font-medium text-blue-900"><span className="font-bold">Jour :</span> {jourNom}</p>
          </div>

          <div>
            <label htmlFor="statut-suivi" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Statut de la journée
            </label>
            <select
              id="statut-suivi"
              value={statut}
              onChange={(event) => setStatut(event.target.value as StatutSuiviJour)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:border-[#264387] focus:outline-none focus:ring-1 focus:ring-[#264387]"
            >
              {statuts.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <p className="mt-1 text-xs text-gray-500">{statuts.find((option) => option.value === statut)?.description}</p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Heures réellement déclarées
            </label>
            {creneaux.length === 0 && (
              <p className="rounded-lg border border-dashed border-gray-300 px-3 py-3 text-sm text-gray-500">
                Aucun créneau déclaré pour cette journée.
              </p>
            )}
            {creneaux.map((creneau) => (
              <div key={creneau.id} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="grid flex-1 grid-cols-2 gap-2">
                  <label>
                    <span className="mb-1 block text-[10px] text-gray-500">Début</span>
                    <input type="time" required value={creneau.debut} onChange={(event) => modifierCreneau(creneau.id, "debut", event.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#264387]" />
                  </label>
                  <label>
                    <span className="mb-1 block text-[10px] text-gray-500">Fin</span>
                    <input type="time" required value={creneau.fin} onChange={(event) => modifierCreneau(creneau.id, "fin", event.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#264387]" />
                  </label>
                </div>
                <button type="button" onClick={() => supprimerCreneau(creneau.id)} className="mt-4 p-2 text-gray-400 transition-colors hover:text-red-600" title="Supprimer ce créneau">
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={ajouterCreneau} className="inline-flex items-center gap-1.5 pt-1 text-xs font-semibold text-[#264387] transition-colors hover:text-[#1c6943]">
              <Plus className="h-4 w-4" />
              Ajouter un créneau
            </button>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700">Note du comptable</span>
            <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Ex. heures confirmées avec le responsable..." className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#264387] focus:outline-none focus:ring-1 focus:ring-[#264387]/20" />
          </label>

          {joursCiblesNombre > 1 && (
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
              <input
                type="checkbox"
                checked={appliquerTousLesJours}
                onChange={(event) => setAppliquerTousLesJours(event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#1c6943]"
              />
              <span>
                <span className="block text-sm font-semibold text-[#1c6943]">Appliquer le même horaire aux {joursCiblesNombre} jours travaillés</span>
                <span className="mt-0.5 block text-xs text-emerald-800">Les horaires seront copiés sur les jours habituels de cet agent. Leur validation pourra ensuite être faite jour par jour.</span>
              </span>
            </label>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200">Annuler</button>
            <button type="submit" className="rounded-lg bg-[#1c6943] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#155435]">Enregistrer la journée</button>
          </div>
        </form>
      </div>
    </div>
  );
}
