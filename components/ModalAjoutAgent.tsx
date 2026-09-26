"use client";

import React, { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { StatutAgent } from "@/lib/agents-data";
import { JourSemaine, JOURS_SEMAINE } from "@/lib/calcul-hs/types";

const libellesJours: Record<JourSemaine, string> = {
  lun: "Lundi",
  mar: "Mardi",
  mer: "Mercredi",
  jeu: "Jeudi",
  ven: "Vendredi",
  sam: "Samedi",
  dim: "Dimanche",
};

interface ModalAjoutAgentProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agent: {
    nomComplet: string;
    matricule: string;
    poste: string;
    libelleRegime: string;
    dureeReferenceSemaine: number;
    salaireBaseMensuel: number;
    inclureHeuresSupDansPaie: boolean;
    statut: StatutAgent;
    joursTravail: JourSemaine[];
  }) => void;
}

export default function ModalAjoutAgent({ isOpen, onClose, onSave }: ModalAjoutAgentProps) {
  const [nomComplet, setNomComplet] = useState("");
  const [matricule, setMatricule] = useState("");
  const [poste, setPoste] = useState("Vendeur");
  const [libelleRegime, setLibelleRegime] = useState("Équivalence Vente");
  const [dureeReferenceSemaine, setDureeReferenceSemaine] = useState<number>(40);
  const [salaireBaseMensuel, setSalaireBaseMensuel] = useState<number>(175000);
  const [inclureHeuresSupDansPaie, setInclureHeuresSupDansPaie] = useState<boolean>(true);
  const [statut, setStatut] = useState<StatutAgent>("Actif");
  const [modeJours, setModeJours] = useState<"semaine" | "tous" | "personnalise">("semaine");
  const [joursTravail, setJoursTravail] = useState<JourSemaine[]>(["lun", "mar", "mer", "jeu", "ven"]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomComplet.trim() || !matricule.trim() || !libelleRegime.trim()) return;

    const dureeNum = Number(dureeReferenceSemaine);
    if (isNaN(dureeNum) || dureeNum < 20 || dureeNum > 60) {
      alert("La durée réglementaire hebdomadaire doit être comprise entre 20 et 60 heures.");
      return;
    }

    const salaireNum = Number(salaireBaseMensuel);
    if (isNaN(salaireNum) || salaireNum < 0) {
      alert("Le salaire de base mensuel doit être un nombre positif.");
      return;
    }

    if (joursTravail.length === 0) {
      alert("Sélectionnez au moins un jour de travail par semaine.");
      return;
    }

    onSave({
      nomComplet,
      matricule,
      poste,
      libelleRegime,
      dureeReferenceSemaine: dureeNum,
      salaireBaseMensuel: salaireNum,
      inclureHeuresSupDansPaie,
      statut,
      joursTravail,
    });

    setNomComplet("");
    setMatricule("");
    setPoste("Vendeur");
    setLibelleRegime("Équivalence Vente");
    setDureeReferenceSemaine(40);
    setSalaireBaseMensuel(175000);
    setInclureHeuresSupDansPaie(true);
    setStatut("Actif");
    setModeJours("semaine");
    setJoursTravail(["lun", "mar", "mer", "jeu", "ven"]);
    onClose();
  };

  const choisirModeJours = (mode: "semaine" | "tous" | "personnalise") => {
    setModeJours(mode);
    if (mode === "semaine") setJoursTravail(["lun", "mar", "mer", "jeu", "ven"]);
    if (mode === "tous") setJoursTravail([...JOURS_SEMAINE]);
  };

  const basculerJour = (jour: JourSemaine) => {
    setModeJours("personnalise");
    setJoursTravail((prev) => prev.includes(jour) ? prev.filter((item) => item !== jour) : [...prev, jour]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 text-[#264387]">
            <UserPlus className="w-5 h-5" />
            <h3 className="font-bold text-gray-900 text-base">Ajouter un agent</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Nom complet
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Kouassi Marc"
                value={nomComplet}
                onChange={(e) => setNomComplet(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#264387]/30 focus:border-[#264387]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Matricule
              </label>
              <input
                type="text"
                required
                placeholder="Ex: 4055"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#264387]/30 focus:border-[#264387]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Poste
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Vendeur, Comptable..."
                value={poste}
                onChange={(e) => setPoste(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#264387]/30 focus:border-[#264387]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Libellé du régime
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Équivalence Vente, Standard..."
                value={libelleRegime}
                onChange={(e) => setLibelleRegime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#264387]/30 focus:border-[#264387]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Durée réglementaire hebdo (h)
              </label>
              <input
                type="number"
                min="20"
                max="60"
                step="0.5"
                required
                value={dureeReferenceSemaine}
                onChange={(e) => setDureeReferenceSemaine(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#264387]/30 focus:border-[#264387]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Statut
              </label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value as StatutAgent)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#264387]/30 focus:border-[#264387] bg-white"
              >
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Salaire de base mensuel (FCFA)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                required
                value={salaireBaseMensuel}
                onChange={(e) => setSalaireBaseMensuel(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#264387]/30 focus:border-[#264387]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Inclure les HS dans la paie
              </label>
              <select
                value={inclureHeuresSupDansPaie ? "oui" : "non"}
                onChange={(e) => setInclureHeuresSupDansPaie(e.target.value === "oui")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#264387]/30 focus:border-[#264387] bg-white"
              >
                <option value="oui">Oui</option>
                <option value="non">Non</option>
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-4">
            <div className="mb-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Jours travaillés par semaine
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Cette préférence sera utilisée pour la saisie rapide du planning de l&apos;agent.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {([
                ["semaine", "Lundi à vendredi"],
                ["tous", "Tous les jours"],
                ["personnalise", "Personnaliser"],
              ] as const).map(([mode, label]) => (
                <label key={mode} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${modeJours === mode ? "border-[#264387] bg-blue-50 text-[#264387]" : "border-gray-200 bg-white text-gray-700"}`}>
                  <input
                    type="radio"
                    name="mode-jours-travail"
                    checked={modeJours === mode}
                    onChange={() => choisirModeJours(mode)}
                    className="accent-[#264387]"
                  />
                  {label}
                </label>
              ))}
            </div>
            {modeJours === "personnalise" && (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {JOURS_SEMAINE.map((jour) => (
                  <label key={jour} className="flex cursor-pointer items-center gap-2 rounded-md bg-white px-2.5 py-2 text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={joursTravail.includes(jour)}
                      onChange={() => basculerJour(jour)}
                      className="accent-[#1c6943]"
                    />
                    {libellesJours[jour]}
                  </label>
                ))}
              </div>
            )}
            <p className="mt-2 text-xs font-medium text-gray-500">
              {joursTravail.length} jour{joursTravail.length > 1 ? "s" : ""} sélectionné{joursTravail.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#1c6943] hover:bg-[#155435] shadow-sm transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
