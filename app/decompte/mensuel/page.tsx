"use client";

import { useMemo } from "react";
import Link from "next/link";
import { BarChart3, CalendarDays, Info } from "lucide-react";
import { useDonnees } from "@/contexts/DonneesContext";
import { calculerHeuresSupSemaine } from "@/lib/calcul-hs/calcul-semaine";
import { calculerPaieAgent } from "@/lib/calcul-paie/calcul-paie-agent";

function formatFCFA(value: number) {
  return `${Math.round(value).toLocaleString("fr-FR")} FCFA`;
}

function formatHeures(value: number) {
  return `${value.toString().replace(".", ",")} h`;
}

export default function DecompteMensuelPage() {
  const { agents, plannings, joursFeries, regles } = useDonnees();

  const lignes = useMemo(
    () =>
      agents
        .filter((agent) => agent.statut === "Actif")
        .map((agent) => {
          const resultatSemaine = calculerHeuresSupSemaine(agent, plannings[agent.id], joursFeries, regles);
          return {
            agent,
            resultatSemaine,
            paie: calculerPaieAgent(agent, resultatSemaine),
          };
        }),
    [agents, plannings, joursFeries, regles]
  );

  const totalRealise = lignes.reduce((total, ligne) => total + ligne.resultatSemaine.heuresRealiseesTotales, 0);
  const totalHS = lignes.reduce((total, ligne) => total + ligne.resultatSemaine.heuresSupplementairesTotales, 0);
  const totalPaie = lignes.reduce((total, ligne) => total + ligne.paie.salaireTotal, 0);

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full flex flex-col space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#264387]">
            <BarChart3 className="w-6 h-6" />
            <h1 className="text-2xl font-bold tracking-tight">Décompte mensuel</h1>
          </div>
          <p className="mt-1 text-sm text-gray-600 font-medium">Synthèse de la période · août 2026</p>
        </div>
        <Link
          href="/decompte/hebdo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[#264387] bg-white border border-gray-300 hover:bg-gray-50"
        >
          <CalendarDays className="w-4 h-4" />
          Voir le détail hebdomadaire
        </Link>
      </header>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-sm text-amber-900">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <p>
          La période contient actuellement les données de la semaine S30. Cette page présente une synthèse mensuelle préparatoire ; le cumul de plusieurs semaines sera alimenté lorsque les autres plannings du mois seront disponibles.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Heures réalisées</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatHeures(Number(totalRealise.toFixed(2)))}</p>
          <p className="text-xs text-gray-500 mt-2">Cumul des agents actifs</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Heures supplémentaires</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">{formatHeures(Number(totalHS.toFixed(2)))}</p>
          <p className="text-xs text-gray-500 mt-2">Après application des seuils hebdomadaires</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Masse salariale simulée</p>
          <p className="text-2xl font-bold text-[#1c6943] mt-2">{formatFCFA(totalPaie)}</p>
          <p className="text-xs text-gray-500 mt-2">Salaire de base et HS incluses selon l’agent</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Synthèse mensuelle par agent</h2>
          <span className="text-xs text-gray-500">S30 · 27 juil. – 2 août 2026</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-6">Agent</th>
                <th className="py-3 px-4 text-center">Référence</th>
                <th className="py-3 px-4 text-center">Réalisé</th>
                <th className="py-3 px-4 text-center">HS</th>
                <th className="py-3 px-4 text-right">Montant HS</th>
                <th className="py-3 px-6 text-right">Salaire total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lignes.map(({ agent, resultatSemaine, paie }) => (
                <tr key={agent.id} className="hover:bg-gray-50/80">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{agent.nomComplet}</div>
                    <div className="text-xs text-gray-500">{agent.poste}</div>
                  </td>
                  <td className="py-4 px-4 text-center font-semibold">{agent.dureeReferenceSemaine}h</td>
                  <td className="py-4 px-4 text-center">{formatHeures(resultatSemaine.heuresRealiseesTotales)}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${resultatSemaine.heuresSupplementairesTotales > 0 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-400"}`}>
                      {formatHeures(resultatSemaine.heuresSupplementairesTotales)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-orange-700">{formatFCFA(paie.montantHeuresSup)}</td>
                  <td className="py-4 px-6 text-right font-mono font-bold text-[#1c6943]">{formatFCFA(paie.salaireTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
