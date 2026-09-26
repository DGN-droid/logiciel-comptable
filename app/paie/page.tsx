"use client";

import { useMemo, useState } from "react";
import { useDonnees } from "@/contexts/DonneesContext";
import { calculerHeuresSupSemaine } from "@/lib/calcul-hs/calcul-semaine";
import { calculerPaieAgent } from "@/lib/calcul-paie/calcul-paie-agent";
import { telechargerCSV } from "@/lib/export-csv";
import { Wallet, Info, CheckCircle2, Download, Settings2 } from "lucide-react";
import ModalConfigurationPaie from "@/components/ModalConfigurationPaie";

function formatFCFA(montant: number): string {
  return `${Math.round(montant).toLocaleString("fr-FR")} FCFA`;
}

export default function PaiePage() {
  const { agents, plannings, joursFeries, regles, modifierConfigurationPaie } = useDonnees();
  const [agentPaieAConfigurer, setAgentPaieAConfigurer] = useState<string | null>(null);
  const [selectedRegime, setSelectedRegime] = useState("Tous");

  const regimesDisponibles = useMemo(() => ["Tous", ...Array.from(new Set(agents.map((agent) => agent.libelleRegime)))], [agents]);
  const agentsActifs = useMemo(
    () => agents.filter((agent) => agent.statut === "Actif" && (selectedRegime === "Tous" || agent.libelleRegime === selectedRegime)),
    [agents, selectedRegime],
  );

  const lignesPaie = useMemo(() => {
    return agentsActifs.map((agent) => {
      const planning = plannings[agent.id] || {
        lun: { date: "", creneaux: [] },
        mar: { date: "", creneaux: [] },
        mer: { date: "", creneaux: [] },
        jeu: { date: "", creneaux: [] },
        ven: { date: "", creneaux: [] },
        sam: { date: "", creneaux: [] },
        dim: { date: "", creneaux: [] },
      };

      const resultatSemaine = calculerHeuresSupSemaine(agent, planning, joursFeries, regles);
      const resultatPaie = calculerPaieAgent(agent, resultatSemaine);

      return {
        agent,
        resultatSemaine,
        resultatPaie,
      };
    });
  }, [agentsActifs, plannings, joursFeries, regles]);

  const totalSalaires = useMemo(() => {
    return lignesPaie.reduce((acc, ligne) => acc + (ligne.agent.salaireBaseMensuel === null ? 0 : ligne.resultatPaie.salaireTotal), 0);
  }, [lignesPaie]);

  const totalHsMontant = useMemo(() => {
    return lignesPaie.reduce((acc, ligne) => acc + (ligne.agent.salaireBaseMensuel === null ? 0 : ligne.resultatPaie.montantHeuresSup), 0);
  }, [lignesPaie]);

  const [paieValidee, setPaieValidee] = useState(false);

  const exporterPaie = () => {
    telechargerCSV("paie-s30.csv", [
      ["Agent", "Salaire de base", "Heures supplémentaires", "Montant HS", "Inclure HS", "Salaire total"],
      ...lignesPaie.map(({ agent, resultatSemaine, resultatPaie }) => [
        agent.nomComplet,
        agent.salaireBaseMensuel === null ? "Paie non définie" : `${resultatPaie.salaireBaseMensuel} FCFA`,
        `${resultatSemaine.heuresSupplementairesTotales} h`,
        agent.salaireBaseMensuel === null ? "Paie non définie" : `${resultatPaie.montantHeuresSup} FCFA`,
        agent.inclureHeuresSupDansPaie === null ? "Non définie" : agent.inclureHeuresSupDansPaie ? "Oui" : "Non",
        agent.salaireBaseMensuel === null ? "Paie non définie" : `${resultatPaie.salaireTotal} FCFA`,
      ]),
    ]);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full flex flex-col space-y-8">
      {/* 1. En-tête de page */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#264387] tracking-tight flex items-center gap-2">
            <Wallet className="w-7 h-7 text-[#1c6943]" />
            Calcul de la paie (Simulateur)
          </h1>
          <p className="mt-1 text-sm text-gray-600 font-medium">
            Entreprise : Pharmacie Centrale — Synthèse des salaires et incorporation des heures supplémentaires
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={exporterPaie}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-gray-500" />
            Exporter Paie Excel
          </button>
          <button
            type="button"
            onClick={() => setPaieValidee((validee) => !validee)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#1c6943] hover:bg-[#155435] shadow-sm transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            {paieValidee ? "Paie validée" : "Valider la paie"}
          </button>
        </div>
      </div>

      {/* Bandeau d'information requis */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-xs text-[#264387]">
        <Info className="w-5 h-5 text-[#264387] shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          Le taux horaire est calculé sur une base de 173,33 heures/mois (hypothèse à confirmer avec le cabinet).
        </p>
      </div>

      <div className="fipa-card-enter flex flex-wrap items-center gap-3 rounded-[24px] border border-gray-100 bg-white p-4 text-sm shadow-sm">
        <label className="fipa-filter-control">
          <span className="text-xs font-medium text-gray-500">Régime :</span>
          <select
            value={selectedRegime}
            onChange={(event) => setSelectedRegime(event.target.value)}
            className="cursor-pointer bg-transparent font-semibold text-gray-900 focus:outline-none"
            aria-label="Filtrer la paie par régime"
          >
            {regimesDisponibles.map((regime) => (
              <option key={regime} value={regime}>{regime === "Tous" ? "Tous les régimes" : regime}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Synthèse cartes KPI */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="fipa-card-enter flex flex-col justify-between rounded-[30px] border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:border-[#264387]/20 hover:shadow-lg">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Agents actifs</span>
          <span className="text-2xl font-bold text-gray-900 mt-2">{agentsActifs.length}</span>
        </div>
        <div className="fipa-card-enter flex flex-col justify-between rounded-[30px] border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:border-[#264387]/20 hover:shadow-lg">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Montant HS</span>
          <span className="text-2xl font-bold text-orange-600 mt-2">{formatFCFA(totalHsMontant)}</span>
        </div>
        <div className="fipa-card-enter flex flex-col justify-between rounded-[30px] border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:border-[#264387]/20 hover:shadow-lg">
          <span className="text-xs text-[#1c6943] font-semibold uppercase tracking-wider">Masse Salariale Totale</span>
          <span className="text-2xl font-bold text-[#1c6943] mt-2">{formatFCFA(totalSalaires)}</span>
        </div>
      </div>

      {/* Tableau de paie */}
      <div className="fipa-card-enter overflow-hidden rounded-[26px] border border-gray-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-base">État récapitulatif de la paie par agent</h2>
          <span className="text-xs text-gray-500 font-medium">{lignesPaie.length} agents affichés</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-6">Agent</th>
                <th className="py-3 px-4 text-right">Salaire de base</th>
                <th className="py-3 px-4 text-center">HS totales</th>
                <th className="py-3 px-4 text-right">Montant HS calculé</th>
                <th className="py-3 px-4 text-center">Inclure HS</th>
                <th className="py-3 px-6 text-right font-bold text-gray-900">Salaire total</th>
                <th className="py-3 px-6 text-right">Configuration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lignesPaie.map(({ agent, resultatSemaine, resultatPaie }) => {
                const hasHs = resultatSemaine.heuresSupplementairesTotales > 0;
                const paieDefinie = agent.salaireBaseMensuel !== null && agent.inclureHeuresSupDansPaie !== null;

                return (
                  <tr key={agent.id} className="fipa-list-row hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{agent.nomComplet}</div>
                      <div className="text-xs text-gray-500">{agent.poste} · {paieDefinie ? `Taux : ${formatFCFA(resultatPaie.tauxHoraire)}/h` : "Paie non définie"}</div>
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-gray-800">
                      {paieDefinie ? formatFCFA(resultatPaie.salaireBaseMensuel) : <span className="font-sans text-xs text-gray-400">Paie non définie</span>}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          hasHs
                            ? "bg-orange-100 text-orange-700 border border-orange-200"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {resultatSemaine.heuresSupplementairesTotales}h
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-orange-700 font-medium">
                      {paieDefinie ? formatFCFA(resultatPaie.montantHeuresSup) : <span className="font-sans text-xs text-gray-400">—</span>}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          agent.inclureHeuresSupDansPaie === true
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {agent.inclureHeuresSupDansPaie === null ? "Non définie" : agent.inclureHeuresSupDansPaie ? "Oui" : "Non"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-[#1c6943] text-base">
                      {paieDefinie ? formatFCFA(resultatPaie.salaireTotal) : <span className="font-sans text-xs text-gray-400">Paie non définie</span>}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => setAgentPaieAConfigurer(agent.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#264387] hover:bg-blue-50"
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                        {paieDefinie ? "Modifier" : "Configurer"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ModalConfigurationPaie
        isOpen={agentPaieAConfigurer !== null}
        agent={agents.find((agent) => agent.id === agentPaieAConfigurer) ?? null}
        onClose={() => setAgentPaieAConfigurer(null)}
        onSave={(salaireBaseMensuel, inclureHeuresSupDansPaie) => {
          if (agentPaieAConfigurer) {
            modifierConfigurationPaie(agentPaieAConfigurer, salaireBaseMensuel, inclureHeuresSupDansPaie);
          }
        }}
      />
    </div>
  );
}
