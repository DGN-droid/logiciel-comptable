"use client";

import { useState } from "react";
import { useDonnees } from "@/contexts/DonneesContext";
import { StatutAgent } from "@/lib/agents-data";
import { JourSemaine } from "@/lib/calcul-hs/types";
import ModalAjoutAgent from "@/components/ModalAjoutAgent";
import { UserPlus, Search, Pencil, Trash2 } from "lucide-react";

export default function AgentsPage() {
  const { agents, ajouterAgent } = useDonnees();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegime, setSelectedRegime] = useState("Tous");

  const handleSaveAgent = (nouveau: {
    nomComplet: string;
    matricule: string;
    poste: string;
    libelleRegime: string;
    dureeReferenceSemaine: number;
    salaireBaseMensuel: number;
    inclureHeuresSupDansPaie: boolean;
    statut: StatutAgent;
    joursTravail: JourSemaine[];
  }) => {
    ajouterAgent(nouveau);
  };

  const regimesDisponibles = ["Tous", ...Array.from(new Set(agents.map((a) => a.libelleRegime)))];

  const agentsFiltres = agents.filter((agent) => {
    const matchSearch =
      agent.nomComplet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.poste.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRegime =
      selectedRegime === "Tous" || agent.libelleRegime === selectedRegime;
    return matchSearch && matchRegime;
  });

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full flex flex-col space-y-8">
      {/* 1. En-tête de page */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#264387] tracking-tight">
            Gestion des agents
          </h1>
          <p className="mt-1 text-sm text-gray-600 font-medium">
            Entreprise : Pharmacie Centrale
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#1c6943] hover:bg-[#155435] shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4 text-white" />
            Ajouter un agent
          </button>
        </div>
      </div>

      {/* 3. Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#264387]/30 focus:border-[#264387]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm w-full md:w-auto">
            <span className="text-xs text-gray-500 font-medium">Régime :</span>
            <select
              value={selectedRegime}
              onChange={(e) => setSelectedRegime(e.target.value)}
              className="bg-transparent font-semibold text-gray-900 focus:outline-none cursor-pointer"
            >
              {regimesDisponibles.map((regime) => (
                <option key={regime} value={regime}>
                  {regime === "Tous" ? "Tous les régimes" : regime}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Tableau des agents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-base">Liste des agents</h2>
          <span className="text-xs text-gray-500 font-medium">
            {agentsFiltres.length} agent{agentsFiltres.length > 1 ? "s" : ""} affiché{agentsFiltres.length > 1 ? "s" : ""}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-6">Agent</th>
                <th className="py-3 px-4">Matricule</th>
                <th className="py-3 px-4">Poste</th>
                <th className="py-3 px-4">Régime</th>
                <th className="py-3 px-4 text-center">Durée réf.</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {agentsFiltres.map((agent) => {
                const isEquiv = agent.libelleRegime.toLowerCase().includes("équivalence") || agent.libelleRegime.toLowerCase().includes("equiv");
                const isActive = agent.statut === "Actif";

                return (
                  <tr
                    key={agent.id}
                    className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-6 font-medium text-gray-900">
                      {agent.nomComplet}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-gray-600">
                      {agent.matricule}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">{agent.poste}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md ${
                          isEquiv
                            ? "bg-emerald-50 text-[#1c6943] border border-emerald-200"
                            : "bg-blue-50 text-[#264387] border border-blue-200"
                        }`}
                      >
                        {agent.libelleRegime}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-gray-900">
                      {agent.dureeReferenceSemaine}h
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {agent.statut}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="p-1.5 text-gray-400 hover:text-[#264387] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier (factice)"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Désactiver (factice)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modale d'ajout d'agent */}
      <ModalAjoutAgent
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(nouveau) => {
          handleSaveAgent(nouveau);
        }}
      />
    </div>
  );
}
