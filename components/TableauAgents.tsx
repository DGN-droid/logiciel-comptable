import React from "react";
import { AgentData } from "@/lib/donnees-factices";

interface TableauAgentsProps {
  agents: AgentData[];
  selectedAgentId: string;
  onSelectAgent: (agent: AgentData) => void;
}

export default function TableauAgents({
  agents,
  selectedAgentId,
  onSelectAgent,
}: TableauAgentsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 text-base">Décompte hebdomadaire par agent</h2>
        <span className="text-xs text-gray-500 font-medium">4 agents affichés</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4">Agent</th>
              <th className="py-3 px-3">Régime</th>
              <th className="py-3 px-2 text-center">Lun</th>
              <th className="py-3 px-2 text-center">Mar</th>
              <th className="py-3 px-2 text-center">Mer</th>
              <th className="py-3 px-2 text-center">Jeu</th>
              <th className="py-3 px-2 text-center">Ven</th>
              <th className="py-3 px-2 text-center">Sam</th>
              <th className="py-3 px-2 text-center">Dim</th>
              <th className="py-3 px-3 text-center">Réalisé</th>
              <th className="py-3 px-3 text-center">Seuil</th>
              <th className="py-3 px-4 text-center">HS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {agents.map((agent) => {
              const isSelected = agent.id === selectedAgentId;
              const hasHs = agent.hs > 0;

              return (
                <tr
                  key={agent.id}
                  onClick={() => onSelectAgent(agent)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-blue-50/60 border-l-4 border-[#264387]"
                      : "hover:bg-gray-50/80"
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-gray-900">{agent.nomComplet}</div>
                    <div className="text-xs text-gray-500">{agent.poste}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                      {agent.regime}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-center text-gray-600">{agent.jours.lun}h</td>
                  <td className="py-3.5 px-2 text-center text-gray-600">{agent.jours.mar}h</td>
                  <td className="py-3.5 px-2 text-center text-gray-600">{agent.jours.mer}h</td>
                  <td className="py-3.5 px-2 text-center text-gray-600">{agent.jours.jeu}h</td>
                  <td className="py-3.5 px-2 text-center text-gray-600">{agent.jours.ven}h</td>
                  <td className="py-3.5 px-2 text-center text-gray-600">{agent.jours.sam}h</td>
                  <td className="py-3.5 px-2 text-center text-gray-600">{agent.jours.dim}h</td>
                  <td className="py-3.5 px-3 text-center font-semibold text-gray-900">{agent.realise}h</td>
                  <td className="py-3.5 px-3 text-center text-gray-500">{agent.seuil}h</td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                        hasHs
                          ? "bg-orange-100 text-orange-700 border border-orange-200"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {agent.hs}h
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
