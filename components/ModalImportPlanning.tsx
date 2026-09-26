"use client";

import React, { useState } from "react";
import { X, UploadCloud, FileSpreadsheet, FileText } from "lucide-react";

interface ModalImportPlanningProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalImportPlanning({ isOpen, onClose }: ModalImportPlanningProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 text-[#264387]">
            <UploadCloud className="w-5 h-5" />
            <h3 className="font-bold text-gray-900 text-base">Importer un planning</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-xs text-gray-600">
            Importez un planning au format <span className="font-semibold text-gray-900">Excel (.xlsx)</span> ou <span className="font-semibold text-gray-900">Word (.docx)</span> pour alimenter automatiquement les heures de la semaine.
          </p>

          {/* Zone de dépôt factice */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-3 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#264387] flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Glissez-déposez votre fichier ici, ou{" "}
                <span className="text-[#1c6943] underline">parcourez</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">Formats acceptés : .xlsx, .docx (Max 10 Mo)</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200">
                <FileSpreadsheet className="w-3.5 h-3.5" /> .xlsx
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-200">
                <FileText className="w-3.5 h-3.5" /> .docx
              </span>
            </div>
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
              type="button"
              disabled
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gray-300 cursor-not-allowed shadow-sm"
              title="Veuillez sélectionner un fichier"
            >
              Importer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
