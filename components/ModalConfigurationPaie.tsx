"use client";

import { FormEvent, useEffect, useState } from "react";
import { Settings2, X } from "lucide-react";
import { AgentComplet } from "@/lib/donnees-mock";

interface ModalConfigurationPaieProps {
  isOpen: boolean;
  agent: AgentComplet | null;
  onClose: () => void;
  onSave: (salaireBaseMensuel: number | null, inclureHeuresSupDansPaie: boolean | null) => void;
}

export default function ModalConfigurationPaie({ isOpen, agent, onClose, onSave }: ModalConfigurationPaieProps) {
  const [salaire, setSalaire] = useState<number | "">("");
  const [inclureHs, setInclureHs] = useState<boolean | null>(null);

  useEffect(() => {
    if (!agent) return;
    setSalaire(agent.salaireBaseMensuel ?? "");
    setInclureHs(agent.inclureHeuresSupDansPaie);
  }, [agent, isOpen]);

  if (!isOpen || !agent) return null;

  const enregistrer = (event: FormEvent) => {
    event.preventDefault();
    if (salaire === "" || Number(salaire) < 0) {
      alert("Renseignez un salaire de base mensuel valide.");
      return;
    }
    if (inclureHs === null) {
      alert("Indiquez si les heures supplémentaires doivent être incluses dans la paie.");
      return;
    }
    onSave(Number(salaire), inclureHs);
    onClose();
  };

  const retirerConfiguration = () => {
    onSave(null, null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <div className="flex items-center gap-2 text-[#264387]">
            <Settings2 className="h-5 w-5" />
            <h3 className="text-base font-bold text-gray-900">Configurer la paie</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={enregistrer} className="space-y-4 p-6">
          <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3">
            <p className="text-xs font-semibold text-blue-900">Agent : {agent.nomComplet}</p>
            <p className="mt-1 text-xs text-blue-800">Cette configuration sera utilisée uniquement dans le calcul de paie.</p>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700">Salaire de base mensuel (FCFA) <span className="text-red-500">*</span></span>
            <input
              type="number"
              min="0"
              step="1000"
              required
              value={salaire}
              onChange={(event) => setSalaire(event.target.value === "" ? "" : Number(event.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-[#264387] focus:outline-none focus:ring-2 focus:ring-[#264387]/20"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700">Inclure les HS dans la paie <span className="text-red-500">*</span></span>
            <select
              required
              value={inclureHs === null ? "" : inclureHs ? "oui" : "non"}
              onChange={(event) => setInclureHs(event.target.value === "" ? null : event.target.value === "oui")}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:border-[#264387] focus:outline-none focus:ring-2 focus:ring-[#264387]/20"
            >
              <option value="">Sélectionner</option>
              <option value="oui">Oui</option>
              <option value="non">Non</option>
            </select>
          </label>

          <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <button type="button" onClick={retirerConfiguration} className="text-xs font-semibold text-red-600 hover:text-red-700">
              Marquer comme non définie
            </button>
            <div className="flex items-center gap-3">
              <button type="button" onClick={onClose} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200">Annuler</button>
              <button type="submit" className="rounded-lg bg-[#1c6943] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#155435]">Enregistrer</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
