import React from "react";
import { JourFerie } from "@/lib/jours-feries";
import { Pencil, Trash2, CalendarDays } from "lucide-react";

interface TableauJoursFeriesProps {
  joursFeries: JourFerie[];
  annee: number;
  onDelete?: (date: string) => void;
}

export default function TableauJoursFeries({ joursFeries, annee, onDelete }: TableauJoursFeriesProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-[#264387]" />
          <h3 className="font-bold text-gray-900 text-base">
            Jours fériés déclarés pour {annee}
          </h3>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 bg-emerald-50 text-[#1c6943] border border-emerald-200 rounded-full">
          {joursFeries.length} jours enregistrés
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-6">Date</th>
              <th className="py-3 px-6">Nom du jour férié</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {joursFeries.map((ferie) => (
              <tr key={ferie.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-3.5 px-6 font-semibold text-gray-900">
                  {new Date(ferie.date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </td>
                <td className="py-3.5 px-6">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-[#1c6943] border border-emerald-200">
                    {ferie.nom}
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
                      onClick={() => onDelete?.(ferie.date)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer ce jour férié"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
