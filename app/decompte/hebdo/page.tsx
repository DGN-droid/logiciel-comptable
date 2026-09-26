"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarRange, Clock3, FileText, Info } from "lucide-react";
import { useDonnees } from "@/contexts/DonneesContext";
import { calculerHeuresSupSemaine } from "@/lib/calcul-hs/calcul-semaine";

const jours = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function formatHeures(value: number) {
  return `${value.toString().replace(".", ",")} h`;
}

export default function DecompteHebdomadairePage() {
  const { agents, plannings, joursFeries, regles } = useDonnees();
  const [selectedAgentId, setSelectedAgentId] = useState("");

  const lignes = useMemo(
    () =>
      agents
        .filter((agent) => agent.statut === "Actif")
        .map((agent) => ({
          agent,
          resultat: calculerHeuresSupSemaine(agent, plannings[agent.id], joursFeries, regles),
        })),
    [agents, plannings, joursFeries, regles]
  );

  const selectedId = lignes.some((ligne) => ligne.agent.id === selectedAgentId)
    ? selectedAgentId
    : lignes[0]?.agent.id ?? "";
  const selected = lignes.find((ligne) => ligne.agent.id === selectedId) ?? lignes[0];

  const totalHS = lignes.reduce((total, ligne) => total + ligne.resultat.heuresSupplementairesTotales, 0);
  const totalRealise = lignes.reduce((total, ligne) => total + ligne.resultat.heuresRealiseesTotales, 0);
  const agentsEnHS = lignes.filter((ligne) => ligne.resultat.heuresSupplementairesTotales > 0).length;

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full flex flex-col space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#264387]">
            <FileText className="w-6 h-6" />
            <h1 className="text-2xl font-bold tracking-tight">Décompte hebdomadaire</h1>
          </div>
          <p className="mt-1 text-sm text-gray-600 font-medium">
            Semaine S30 · du lundi 27 juillet au dimanche 2 août 2026
          </p>
        </div>
        <Link
          href="/plannings"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#1c6943] hover:bg-[#155435]"
        >
          <CalendarRange className="w-4 h-4" />
          Vérifier les plannings
        </Link>
      </header>

      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-sm text-[#264387]">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <p>
          Les heures sont cumulées dans l’ordre du lundi au dimanche. Le seuil propre à chaque agent
          déclenche les heures supplémentaires, qui sont ensuite ventilées par jour/nuit et ouvré/dimanche-férié.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Heures réalisées</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatHeures(Number(totalRealise.toFixed(2)))}</p>
          <p className="text-xs text-gray-500 mt-2">Total de la semaine pour les agents actifs</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Heures supplémentaires</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">{formatHeures(Number(totalHS.toFixed(2)))}</p>
          <p className="text-xs text-gray-500 mt-2">Après franchissement du seuil individuel</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Agents concernés</p>
          <p className="text-2xl font-bold text-[#1c6943] mt-2">{agentsEnHS} / {lignes.length}</p>
          <p className="text-xs text-gray-500 mt-2">Agents actifs avec au moins une HS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Résultat par agent</h2>
            <span className="text-xs text-gray-500">{lignes.length} agents actifs</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Agent</th>
                  <th className="py-3 px-3">Référence</th>
                  {jours.map((jour) => <th key={jour} className="py-3 px-2 text-center">{jour}</th>)}
                  <th className="py-3 px-3 text-center">Réalisé</th>
                  <th className="py-3 px-3 text-center">HS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lignes.map(({ agent, resultat }) => (
                  <tr
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`cursor-pointer transition-colors ${selectedId === agent.id ? "bg-blue-50/60" : "hover:bg-gray-50/80"}`}
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-medium text-gray-900">{agent.nomComplet}</div>
                      <div className="text-xs text-gray-500">{agent.poste}</div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-semibold text-gray-700">{agent.dureeReferenceSemaine}h</td>
                    {resultat.cumulParJour.map((jour, index) => (
                      <td key={`${agent.id}-${jour.date}`} className="py-3.5 px-2 text-center text-gray-600">
                        {formatHeures(jour.heuresJour)}
                      </td>
                    ))}
                    <td className="py-3.5 px-3 text-center font-semibold text-gray-900">{formatHeures(resultat.heuresRealiseesTotales)}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${resultat.heuresSupplementairesTotales > 0 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-400"}`}>
                        {formatHeures(resultat.heuresSupplementairesTotales)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <aside className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2 text-[#264387] mb-1">
                <Clock3 className="w-4 h-4" />
                <h2 className="font-bold text-gray-900">Détail du calcul</h2>
              </div>
              <p className="text-sm font-semibold text-gray-900">{selected.agent.nomComplet}</p>
              <p className="text-xs text-gray-500">{selected.agent.libelleRegime} · seuil {selected.resultat.seuilReglementaire}h</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-[11px] text-gray-500 uppercase">Réalisé</p>
                <p className="text-lg font-bold">{formatHeures(selected.resultat.heuresRealiseesTotales)}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <p className="text-[11px] text-[#1c6943] uppercase">HS</p>
                <p className="text-lg font-bold text-[#1c6943]">{formatHeures(selected.resultat.heuresSupplementairesTotales)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Répartition par taux</h3>
              <div className="space-y-2">
                {selected.resultat.detailsParTaux.length === 0 ? (
                  <p className="text-sm text-gray-500">Aucune heure supplémentaire cette semaine.</p>
                ) : selected.resultat.detailsParTaux.map((detail) => (
                  <div key={`${detail.categorie}-${detail.taux}`} className="flex items-center justify-between px-3 py-2 rounded-md bg-gray-50 text-sm">
                    <span className="text-gray-600">{detail.libelle}</span>
                    <span className="font-bold text-gray-900">{formatHeures(detail.nombreHeures)}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
