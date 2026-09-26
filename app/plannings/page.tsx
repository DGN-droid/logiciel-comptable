"use client";

import { useState } from "react";
import { useDonnees } from "@/contexts/DonneesContext";
import { Creneau } from "@/lib/plannings-data";
import { JourSemaine, SemainePlanning, CreneauTravail } from "@/lib/calcul-hs/types";
import ModalEditCellule from "@/components/ModalEditCellule";
import ModalImportPlanning from "@/components/ModalImportPlanning";
import { Upload, Plus, ChevronDown, Info, CheckCircle2, CircleDashed, Clock3, UserX } from "lucide-react";
import { cleSuiviJour, suiviJourParDefaut, SuiviJour, StatutSuiviJour } from "@/lib/suivi-heures";

const joursCles = [
  { key: "lun", label: "Lun" },
  { key: "mar", label: "Mar" },
  { key: "mer", label: "Mer" },
  { key: "jeu", label: "Jeu" },
  { key: "ven", label: "Ven" },
  { key: "sam", label: "Sam" },
  { key: "dim", label: "Dim" },
] as const;

const statutLibelles: Record<StatutSuiviJour, string> = {
  a_renseigner: "À contrôler",
  en_cours: "En cours",
  valide: "Validée",
  absent: "Absent",
};

const statutClasses: Record<StatutSuiviJour, string> = {
  a_renseigner: "bg-amber-50 text-amber-700 border-amber-200",
  en_cours: "bg-blue-50 text-blue-700 border-blue-200",
  valide: "bg-emerald-50 text-emerald-700 border-emerald-200",
  absent: "bg-red-50 text-red-700 border-red-200",
};

interface PlanningAgentDisplay {
  id: string;
  nomComplet: string;
  poste: string;
  regime: string;
  jours: SemainePlanning;
  joursTravail?: JourSemaine[];
}

export default function PlanningsPage() {
  const { agents, plannings, modifierPlanningAgent, suivisJours, modifierSuiviJour } = useDonnees();
  const [selectedAgentFilter, setSelectedAgentFilter] = useState("Tous");
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editCellData, setEditCellData] = useState<{
    agentId: string;
    agentNom: string;
    jourKey: keyof SemainePlanning;
    jourLabel: string;
    date: string;
    creneaux: Creneau[];
    suivi: SuiviJour;
    joursCibles: JourSemaine[];
  } | null>(null);

  const obtenirSuivi = (agentId: string, date: string) =>
    suivisJours[cleSuiviJour(agentId, date)] ?? suiviJourParDefaut(agentId, date);

  const planningList: PlanningAgentDisplay[] = agents.map((a) => ({
    id: a.id,
    nomComplet: a.nomComplet,
    poste: a.poste,
    regime: a.libelleRegime,
    joursTravail: a.joursTravail,
    jours: plannings[a.id] || {
      lun: { date: "2026-07-27", creneaux: [] },
      mar: { date: "2026-07-28", creneaux: [] },
      mer: { date: "2026-07-29", creneaux: [] },
      jeu: { date: "2026-07-30", creneaux: [] },
      ven: { date: "2026-07-31", creneaux: [] },
      sam: { date: "2026-08-01", creneaux: [] },
      dim: { date: "2026-08-02", creneaux: [] },
    },
  }));

  const agentsFiltres = planningList.filter(
    (p) => selectedAgentFilter === "Tous" || p.id === selectedAgentFilter
  );

  const joursCiblesPourAgent = (agent: PlanningAgentDisplay): JourSemaine[] => {
    if (agent.joursTravail && agent.joursTravail.length > 0) return agent.joursTravail;
    const joursAvecHoraire = joursCles
      .filter((jour) => agent.jours[jour.key].creneaux.length > 0)
      .map((jour) => jour.key);
    return joursAvecHoraire.length > 0 ? joursAvecHoraire : joursCles.map((jour) => jour.key);
  };

  const handleSaveCellule = (
    nouveauxCreneaux: Creneau[],
    suivi: { statut: StatutSuiviJour; note: string },
    appliquerTousLesJours: boolean,
  ) => {
    if (!editCellData) return;
    const creneauxTravail: CreneauTravail[] = nouveauxCreneaux.map((c) => ({
      heureDebut: c.debut,
      heureFin: c.fin,
    }));

    const agentPlanning = planningList.find((agent) => agent.id === editCellData.agentId);
    const joursAEnregistrer = appliquerTousLesJours ? editCellData.joursCibles : [editCellData.jourKey];

    joursAEnregistrer.forEach((jour) => {
      const suiviJour = jour === editCellData.jourKey
        ? suivi
        : { statut: "a_renseigner" as StatutSuiviJour, note: "" };
      const date = agentPlanning?.jours[jour].date ?? editCellData.date;

      modifierPlanningAgent(
        editCellData.agentId,
        jour,
        suiviJour.statut === "absent" ? [] : creneauxTravail,
      );
      modifierSuiviJour(editCellData.agentId, date, suiviJour.statut, suiviJour.note);
    });
    setEditCellData(null);
  };

  const suiviVisible = agentsFiltres.flatMap((agent) =>
    joursCles.map((jour) => obtenirSuivi(agent.id, agent.jours[jour.key].date)),
  );
  const nombreJoursValides = suiviVisible.filter((suivi) => suivi.statut === "valide").length;
  const nombreJoursEnCours = suiviVisible.filter((suivi) => suivi.statut === "en_cours").length;
  const nombreJoursAbsents = suiviVisible.filter((suivi) => suivi.statut === "absent").length;
  const nombreJoursAControler = suiviVisible.filter((suivi) => suivi.statut === "a_renseigner").length;

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full flex flex-col space-y-8">
      {/* 1. En-tête de page */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#264387] tracking-tight">
            Plannings
          </h1>
          <p className="mt-1 text-sm text-gray-600 font-medium">
            Entreprise : Pharmacie Centrale — Saisie et validation des heures réellement travaillées
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <Upload className="w-4 h-4 text-gray-500" />
            Importer un fichier
          </button>
          <button
            type="button"
            onClick={() => {
              const premier = planningList[0];
              if (!premier) return;
              const creneauxModal: Creneau[] = premier.jours.lun.creneaux.map((c, i) => ({
                id: String(i + 1),
                debut: c.heureDebut,
                fin: c.heureFin,
              }));
              setEditCellData({
                agentId: premier.id,
                agentNom: premier.nomComplet,
                jourKey: "lun",
                jourLabel: "Lundi",
                date: premier.jours.lun.date,
                creneaux: creneauxModal,
                suivi: obtenirSuivi(premier.id, premier.jours.lun.date),
                joursCibles: joursCiblesPourAgent(premier),
              });
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#1c6943] hover:bg-[#155435] shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 text-white" />
            Ajouter une entrée
          </button>
        </div>
      </div>

      {/* 2. Ligne de filtres */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 text-gray-700">
          <span className="text-xs text-gray-500 font-medium">Semaine :</span>
          <span className="font-semibold text-gray-900">S30 · 27 juil. – 2 août 2026</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </div>

        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 text-gray-700">
          <span className="text-xs text-gray-500 font-medium">Agent :</span>
          <select
            value={selectedAgentFilter}
            onChange={(e) => setSelectedAgentFilter(e.target.value)}
            className="bg-transparent font-semibold text-gray-900 focus:outline-none cursor-pointer"
          >
            <option value="Tous">Tous les agents</option>
            {planningList.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nomComplet}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 6. Bandeau d'info */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-xs text-[#264387]">
        <Info className="w-5 h-5 text-[#264387] shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          Les heures entre 05:00 et 21:00 sont comptées comme heures de jour, celles entre 21:00 et 05:00 comme heures de nuit. Une plage à cheval sur ces horaires sera automatiquement répartie lors du calcul.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <CircleDashed className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">À contrôler</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-800">{nombreJoursAControler}</p>
          <p className="text-xs text-amber-700">journées non renseignées</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <Clock3 className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">En cours</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-800">{nombreJoursEnCours}</p>
          <p className="text-xs text-blue-700">journées ouvertes</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Validées</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-800">{nombreJoursValides}</p>
          <p className="text-xs text-emerald-700">journées contrôlées</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-red-700">
            <UserX className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Absences</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-red-800">{nombreJoursAbsents}</p>
          <p className="text-xs text-red-700">journées déclarées absentes</p>
        </div>
      </div>

      {/* 3. Tableau "Planning de la semaine" */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-base">Planning de la semaine (S30)</h2>
          <span className="text-xs text-gray-500 font-medium">
            Cliquez sur une cellule pour renseigner les heures réellement travaillées et le statut de la journée
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-5">Agent</th>
                <th className="py-3 px-3">Régime</th>
                {joursCles.map((j) => (
                  <th key={j.key} className="py-3 px-3 text-center">
                    {j.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {agentsFiltres.map((agent) => {
                const isEquiv = agent.regime.toLowerCase().includes("équivalence") || agent.regime.toLowerCase().includes("equiv");

                return (
                  <tr key={agent.id} className="hover:bg-gray-50/45 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-medium text-gray-900">{agent.nomComplet}</div>
                      <div className="text-xs text-gray-500">{agent.poste}</div>
                    </td>
                    <td className="py-4 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-md ${
                          isEquiv
                            ? "bg-emerald-50 text-[#1c6943] border border-emerald-200"
                            : "bg-blue-50 text-[#264387] border border-blue-200"
                        }`}
                      >
                        {agent.regime}
                      </span>
                    </td>
                    {joursCles.map((j) => {
                      const jour = agent.jours[j.key];
                      const creneauxJour = jour.creneaux;
                      const suivi = obtenirSuivi(agent.id, jour.date);
                      const isEmpty = creneauxJour.length === 0;
                      const creneauxModal: Creneau[] = creneauxJour.map((c, i) => ({
                        id: String(i + 1),
                        debut: c.heureDebut,
                        fin: c.heureFin,
                      }));

                      return (
                        <td
                          key={j.key}
                          title={suivi.note || statutLibelles[suivi.statut]}
                          onClick={() =>
                            setEditCellData({
                              agentId: agent.id,
                              agentNom: agent.nomComplet,
                              jourKey: j.key,
                              jourLabel: j.label,
                              date: jour.date,
                              creneaux: creneauxModal,
                              suivi,
                              joursCibles: joursCiblesPourAgent(agent),
                            })
                          }
                          className="py-4 px-3 text-center cursor-pointer hover:bg-blue-50/60 transition-colors group"
                        >
                          {isEmpty ? (
                            <span className="text-gray-300 font-bold">—</span>
                          ) : (
                            <div className="flex flex-col items-center justify-center space-y-0.5">
                              {creneauxJour.map((c: CreneauTravail, idx: number) => (
                                <div key={idx} className="w-full">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                                      idx > 0
                                        ? "bg-gray-100 text-gray-700 text-[11px]"
                                        : "bg-gray-100 text-gray-800 group-hover:bg-white group-hover:shadow-2xs"
                                    }`}
                                  >
                                    {c.heureDebut}–{c.heureFin}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          <span className={`inline-block rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${statutClasses[suivi.statut]}`}>
                            {statutLibelles[suivi.statut]}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale d'édition d'une cellule */}
      {editCellData && (
        <ModalEditCellule
          isOpen={!!editCellData}
          onClose={() => setEditCellData(null)}
          agentNom={editCellData.agentNom}
          jourNom={editCellData.jourLabel}
          creneauxInitiaux={editCellData.creneaux}
          suiviInitial={editCellData.suivi}
          joursCiblesNombre={editCellData.joursCibles.length}
          onSave={handleSaveCellule}
        />
      )}

      {/* Modale d'import de planning */}
      <ModalImportPlanning
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}
