import React from "react";
import { AgentData } from "@/lib/donnees-factices";
import { Calculator, ShieldCheck, FileSpreadsheet, Clock } from "lucide-react";

interface PanneauDetailProps {
  agent: AgentData;
}

export default function PanneauDetail({ agent }: PanneauDetailProps) {
  const tauxJourOuvreTranche1 = agent.detailsTaux.tauxJourOuvreTranche1 ?? 12;
  const tauxJourOuvreTranche2 = agent.detailsTaux.tauxJourOuvreTranche2 ?? 35;
  const tauxNuitOuvre = agent.detailsTaux.tauxNuitOuvre ?? 50;
  const tauxJourFerie = agent.detailsTaux.tauxJourFerie ?? 50;
  const tauxNuitFerie = agent.detailsTaux.tauxNuitFerie ?? 100;

  return (
    <div className="fipa-card-enter flex flex-col space-y-6 rounded-[26px] border border-gray-100 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <div className="border-b border-gray-100 pb-4">
        <div className="flex items-center space-x-2 text-[#264387] mb-1">
          <Calculator className="w-4 h-4" />
          <h3 className="font-bold text-base text-gray-900">Détail du calcul</h3>
        </div>
        <p className="text-xs text-gray-500">Analyse détaillée des heures et majorations</p>
      </div>

      <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100/60">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-gray-900 text-base">{agent.nomComplet}</h4>
          <span className="text-xs font-medium px-2 py-0.5 bg-[#264387] text-white rounded">
            {agent.regime}
          </span>
        </div>
        <p className="text-xs text-gray-600 font-medium">Poste : {agent.poste}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-100">
          <span className="block text-[11px] text-gray-500 font-medium uppercase">Réalisées</span>
          <span className="text-lg font-bold text-gray-900">{agent.realise}h</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-100">
          <span className="block text-[11px] text-gray-500 font-medium uppercase">Seuil / Réf.</span>
          <span className="text-lg font-bold text-[#264387]">{agent.seuil}h</span>
        </div>
        <div className="bg-emerald-50 p-3 rounded-lg text-center border border-emerald-100">
          <span className="block text-[11px] text-[#1c6943] font-medium uppercase">HS Totales</span>
          <span className="text-lg font-bold text-[#1c6943]">{agent.hs}h</span>
        </div>
      </div>

      <div className="space-y-3">
        <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Répartition par taux de majoration
        </h5>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center py-1.5 px-3 bg-gray-50 rounded-md">
            <span className="text-gray-600 text-xs font-medium">HS jour ({tauxJourOuvreTranche1}%)</span>
            <span className="font-bold text-gray-900 text-xs">{agent.detailsTaux.hsJour12}h</span>
          </div>
          <div className="flex justify-between items-center py-1.5 px-3 bg-gray-50 rounded-md">
            <span className="text-gray-600 text-xs font-medium">HS jour ({tauxJourOuvreTranche2}%)</span>
            <span className="font-bold text-gray-900 text-xs">{agent.detailsTaux.hsJour35}h</span>
          </div>
          <div className="flex justify-between items-center py-1.5 px-3 bg-gray-50 rounded-md">
            <span className="text-gray-600 text-xs font-medium">HS nuit ({tauxNuitOuvre}%)</span>
            <span className="font-bold text-gray-900 text-xs">{agent.detailsTaux.hsNuit50}h</span>
          </div>
          <div className="flex justify-between items-center py-1.5 px-3 bg-gray-50 rounded-md">
            <span className="text-gray-600 text-xs font-medium">Dimanche / Férié ({tauxJourFerie}%)</span>
            <span className="font-bold text-gray-900 text-xs">{agent.detailsTaux.dimFerie50}h</span>
          </div>
          <div className="flex justify-between items-center py-1.5 px-3 bg-gray-50 rounded-md">
            <span className="text-gray-600 text-xs font-medium">Nuit Dimanche / Férié ({tauxNuitFerie}%)</span>
            <span className="font-bold text-gray-900 text-xs">{agent.detailsTaux.nuitDimF100}h</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 space-y-2 text-xs">
        <h5 className="font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#1c6943]" />
          Traçabilité
        </h5>
        <div className="bg-gray-50 p-3 rounded-lg space-y-1.5 border border-gray-100 text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>Calcul généré le {agent.tracabilite.genereLe}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-gray-400" />
            <span>Import planning : {agent.tracabilite.importPlanning}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
            <span>Règle appliquée : {agent.tracabilite.regleAppliquee}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
