import React from "react";
import { getMoisGrid, moisNoms, joursSemaine } from "@/lib/jours-feries";

interface MiniCalendrierProps {
  annee: number;
  moisIndex: number; // 0 à 11
}

export default function MiniCalendrier({ annee, moisIndex }: MiniCalendrierProps) {
  const cellules = getMoisGrid(annee, moisIndex);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between">
      <div className="text-center pb-2 border-b border-gray-100 mb-2">
        <h3 className="font-bold text-sm text-[#264387]">
          {moisNoms[moisIndex]} {annee}
        </h3>
      </div>

      {/* En-tête des jours de la semaine */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {joursSemaine.map((j, idx) => (
          <span key={idx} className="text-[10px] font-bold text-gray-400">
            {j}
          </span>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {cellules.map((cell, idx) => {
          if (!cell.dayNumber) {
            return <div key={idx} className="h-7 w-7" />;
          }

          const isFerie = cell.isFerie;
          const isDimanche = cell.isDimanche;

          let cellStyle = "text-gray-700 hover:bg-gray-100";
          if (isFerie) {
            cellStyle = "bg-emerald-100 text-[#1c6943] font-bold border border-emerald-300 shadow-2xs";
          } else if (isDimanche) {
            cellStyle = "text-gray-400 italic font-medium bg-gray-50";
          }

          return (
            <div
              key={idx}
              className={`h-7 w-7 mx-auto rounded-md flex items-center justify-center text-xs transition-colors ${cellStyle}`}
              title={isFerie ? `Jour férié (${cell.dateString})` : undefined}
            >
              {cell.dayNumber}
            </div>
          );
        })}
      </div>
    </div>
  );
}
