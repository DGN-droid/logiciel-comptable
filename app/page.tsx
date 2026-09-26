"use client";

import { useState, useMemo } from "react";
import { useDonnees } from "@/contexts/DonneesContext";
import { calculerHeuresSupSemaine } from "@/lib/calcul-hs/calcul-semaine";
import { AgentComplet, entrepriseMock, semaineMock } from "@/lib/donnees-mock";
import { ResultatSemaine } from "@/lib/calcul-hs/types";
import { telechargerCSV } from "@/lib/export-csv";
import { cleSuiviJour, suiviJourParDefaut } from "@/lib/suivi-heures";
import KpiCard from "@/components/KpiCard";
import PanneauDetail from "@/components/PanneauDetail";
import { Download, CheckCircle2, ChevronDown } from "lucide-react";

interface AgentDashboardRow {
  agent: AgentComplet;
  resultat: ResultatSemaine;
  joursHeures: {
    lun: number;
    mar: number;
    mer: number;
    jeu: number;
    ven: number;
    sam: number;
    dim: number;
  };
  suivi: {
    validees: number;
    aControler: number;
    absentes: number;
  };
}

const joursSemaine: Array<keyof AgentDashboardRow["joursHeures"]> = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];

function dateLocale(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

interface DashboardFilterProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function DashboardFilter({ label, value, options, onChange }: DashboardFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-white hover:border-[#264387]/40 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-xs text-gray-500 font-medium">{label} :</span>
        <span className="font-semibold text-gray-900 capitalize">{value}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-20 min-w-full w-max max-w-[260px] rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-blue-50 ${option === value ? "bg-blue-50 font-semibold text-[#264387]" : "text-gray-700"}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { agents, plannings, joursFeries, suivisJours, regles, dateReference, setDateReference } = useDonnees();
  const [selectedEntreprise, setSelectedEntreprise] = useState(entrepriseMock);
  const [selectedService, setSelectedService] = useState("Tous");
  const [selectedRegime, setSelectedRegime] = useState("Tous");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [semaineCloturee, setSemaineCloturee] = useState(false);
  const planningEstDisponible = dateReference >= semaineMock.dateDebut && dateReference <= semaineMock.dateFin;

  // Calculer les résultats pour tous les agents actifs (ou tous)
  const agentsActifs = useMemo(() => agents.filter((a) => a.statut === "Actif"), [agents]);

  const agentRows: AgentDashboardRow[] = useMemo(() => {
    return agentsActifs.map((agent) => {
      const planning = planningEstDisponible ? plannings[agent.id] || {
        lun: { date: "", creneaux: [] },
        mar: { date: "", creneaux: [] },
        mer: { date: "", creneaux: [] },
        jeu: { date: "", creneaux: [] },
        ven: { date: "", creneaux: [] },
        sam: { date: "", creneaux: [] },
        dim: { date: "", creneaux: [] },
      } : {
        lun: { date: "", creneaux: [] },
        mar: { date: "", creneaux: [] },
        mer: { date: "", creneaux: [] },
        jeu: { date: "", creneaux: [] },
        ven: { date: "", creneaux: [] },
        sam: { date: "", creneaux: [] },
        dim: { date: "", creneaux: [] },
      };

      const resultat = calculerHeuresSupSemaine(agent, planning, joursFeries, regles);

      // Calculer les heures par jour pour l'affichage dans le tableau
      const calculHeuresJour = (creneaux: { heureDebut: string; heureFin: string }[]) => {
        let total = 0;
        for (const c of creneaux) {
          const [dh, dm] = c.heureDebut.split(":").map(Number);
          const [fh, fm] = c.heureFin.split(":").map(Number);
          let start = dh * 60 + (dm || 0);
          let end = fh * 60 + (fm || 0);
          if (end <= start) end += 24 * 60;
          total += (end - start) / 60;
        }
        return Number(total.toFixed(1));
      };

      return {
        agent,
        resultat,
        joursHeures: {
          lun: calculHeuresJour(planning.lun.creneaux),
          mar: calculHeuresJour(planning.mar.creneaux),
          mer: calculHeuresJour(planning.mer.creneaux),
          jeu: calculHeuresJour(planning.jeu.creneaux),
          ven: calculHeuresJour(planning.ven.creneaux),
          sam: calculHeuresJour(planning.sam.creneaux),
          dim: calculHeuresJour(planning.dim.creneaux),
        },
        suivi: joursSemaine.reduce(
          (compteur, jour) => {
            const date = planning[jour].date;
            const suivi = date
              ? suivisJours[cleSuiviJour(agent.id, date)] ?? suiviJourParDefaut(agent.id, date)
              : suiviJourParDefaut(agent.id, "");
            if (suivi.statut === "valide") compteur.validees += 1;
            if (suivi.statut === "a_renseigner") compteur.aControler += 1;
            if (suivi.statut === "absent") compteur.absentes += 1;
            return compteur;
          },
          { validees: 0, aControler: 0, absentes: 0 },
        ),
      };
    });
  }, [agentsActifs, plannings, joursFeries, suivisJours, planningEstDisponible, regles]);

  const servicesDisponibles = useMemo(
    () => ["Tous", ...Array.from(new Set(agentsActifs.map((agent) => agent.poste))).sort()],
    [agentsActifs]
  );
  const regimesDisponibles = useMemo(
    () => ["Tous", ...Array.from(new Set(agentsActifs.map((agent) => agent.libelleRegime))).sort()],
    [agentsActifs]
  );

  const agentRowsFiltres = useMemo(
    () => agentRows.filter(
      ({ agent }) =>
        (selectedService === "Tous" || agent.poste === selectedService) &&
        (selectedRegime === "Tous" || agent.libelleRegime === selectedRegime)
    ),
    [agentRows, selectedService, selectedRegime]
  );

  const libelleSemaine = semaineMock.libelle;
  const libelleDateReference = dateLocale(dateReference).toLocaleDateString("fr-FR", { dateStyle: "full" });
  const entreprisesDisponibles = [entrepriseMock];

  // Sélectionner le premier agent si l'actuel n'existe plus
  const activeSelectedId = useMemo(() => {
    if (agentRowsFiltres.some((r) => r.agent.id === selectedAgentId)) {
      return selectedAgentId;
    }
    return agentRowsFiltres[0]?.agent.id || "";
  }, [agentRowsFiltres, selectedAgentId]);

  const currentRow = agentRowsFiltres.find((r) => r.agent.id === activeSelectedId) || agentRowsFiltres[0];

  // Calculs KPI globaux
  const totalHsSemaine = useMemo(() => {
    const sum = agentRowsFiltres.reduce((acc, row) => acc + row.resultat.heuresSupplementairesTotales, 0);
    return Number(sum.toFixed(1));
  }, [agentRowsFiltres]);

  const agentsEnHsCount = useMemo(() => {
    return agentRowsFiltres.filter((row) => row.resultat.heuresSupplementairesTotales > 0).length;
  }, [agentRowsFiltres]);

  const seuilsLabel = useMemo(() => {
    const comptes = new Map<number, number>();
    for (const { agent } of agentRowsFiltres) {
      comptes.set(agent.dureeReferenceSemaine, (comptes.get(agent.dureeReferenceSemaine) || 0) + 1);
    }
    return Array.from(comptes.entries())
      .sort(([seuilA], [seuilB]) => seuilB - seuilA)
      .map(([seuil, nombre]) => `${nombre} ${nombre > 1 ? "agents" : "agent"} à ${seuil} h`)
      .join(" · ") || "Aucun agent";
  }, [agentRowsFiltres]);

  const ventilationParTaux = useMemo(() => {
    const heuresParTaux = new Map<number, number>();
    for (const { resultat } of agentRowsFiltres) {
      for (const detail of resultat.detailsParTaux) {
        heuresParTaux.set(detail.taux, (heuresParTaux.get(detail.taux) || 0) + detail.nombreHeures);
      }
    }
    const tauxConfigures = Array.from(
      new Set([
        regles.tauxJourOuvreTranche1,
        regles.tauxJourOuvreTranche2,
        regles.tauxNuitOuvre,
        regles.tauxJourFerie,
        regles.tauxNuitFerie,
      ])
    );
    const couleurs = ["#264387", "#1c6943", "#f59e0b", "#dc2626", "#7c3aed"];
    return tauxConfigures.map((taux, index) => ({
      label: `${taux}%`,
      value: totalHsSemaine > 0 ? ((heuresParTaux.get(taux) || 0) / totalHsSemaine) * 100 : 0,
      color: couleurs[index % couleurs.length],
    }));
  }, [agentRowsFiltres, totalHsSemaine, regles]);

  const exporterDashboard = () => {
    telechargerCSV(`${libelleSemaine}-decompte.csv`, [
      ["Agent", "Poste", "Référence hebdomadaire", "Heures réalisées", "Heures supplémentaires"],
      ...agentRowsFiltres.map(({ agent, resultat }) => [
        agent.nomComplet,
        agent.poste,
        `${agent.dureeReferenceSemaine} h`,
        `${resultat.heuresRealiseesTotales} h`,
        `${resultat.heuresSupplementairesTotales} h`,
      ]),
    ]);
  };

  // Adapter le ResultatSemaine au format attendu par PanneauDetail
  const agentDetailForPanel = useMemo(() => {
    if (!currentRow) return null;
    const { agent, resultat } = currentRow;

    // Extraire les taux de detailsParTaux
    const getTauxHeures = (categorie: string, index = 0) => {
      const found = resultat.detailsParTaux.filter((d) => d.categorie === categorie)[index];
      return found?.nombreHeures || 0;
    };

    return {
      id: agent.id,
      nomComplet: agent.nomComplet,
      poste: agent.poste,
      regime: agent.libelleRegime,
      jours: { lun: 0, mar: 0, mer: 0, jeu: 0, ven: 0, sam: 0, dim: 0 },
      realise: resultat.heuresRealiseesTotales,
      seuil: resultat.seuilReglementaire,
      hs: resultat.heuresSupplementairesTotales,
      detailsTaux: {
        hsJour12: getTauxHeures("jourOuvre", 0),
        hsJour35: getTauxHeures("jourOuvre", 1),
        hsNuit50: getTauxHeures("nuitOuvre"),
        dimFerie50: getTauxHeures("jourFerie"),
        nuitDimF100: getTauxHeures("nuitFerie"),
        tauxJourOuvreTranche1: regles.tauxJourOuvreTranche1,
        tauxJourOuvreTranche2: regles.tauxJourOuvreTranche2,
        tauxNuitOuvre: regles.tauxNuitOuvre,
        tauxJourFerie: regles.tauxJourFerie,
        tauxNuitFerie: regles.tauxNuitFerie,
      },
      tracabilite: {
        genereLe: new Date().toISOString().replace("T", " ").substring(0, 16),
        importPlanning: `${libelleSemaine}.xlsx`,
        regleAppliquee: `Seuil hebdomadaire ${resultat.seuilReglementaire} h`,
      },
    };
  }, [currentRow, libelleSemaine, regles]);

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full flex flex-col space-y-8">
      {/* 1. En-tête de page */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#264387] tracking-tight">
            Tableau de bord
          </h1>
          <p className="mt-1 text-sm text-gray-600 font-medium">
            Suivi des heures supplémentaires · {entrepriseMock} — date de référence : {libelleDateReference}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={exporterDashboard}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-gray-500" />
            Exporter Excel
          </button>
          <button
            type="button"
            onClick={() => setSemaineCloturee((cloturee) => !cloturee)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#1c6943] hover:bg-[#155435] shadow-sm transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            {semaineCloturee ? "Semaine clôturée" : "Clôturer la semaine"}
          </button>
        </div>
      </div>

      {/* 2. Rangée de 4 cartes KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Total HS semaine"
          value={`${totalHsSemaine.toString().replace(".", ",")} h`}
          badgeText="+8,2 % vs S29"
          badgePositive={true}
        />
        <KpiCard
          title="Agents en HS"
          value={`${agentsEnHsCount} / ${agentRowsFiltres.length}`}
          subText="sur effectif total actif"
        />
        <KpiCard
          title="Seuils appliqués"
          value={seuilsLabel}
          subText="selon les références des agents filtrés"
        />
        <KpiCard
          title="Ventilation par taux"
          value={totalHsSemaine > 0 ? "100%" : "0%"}
          isProgressBar={true}
          progressSegments={ventilationParTaux}
        />
      </div>

      {/* 3. Filtres de la période */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-3 text-sm">
        <DashboardFilter label="Entreprise" value={selectedEntreprise} options={entreprisesDisponibles} onChange={setSelectedEntreprise} />
        <label className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-white hover:border-[#264387]/40 transition-colors">
          <span className="text-xs text-gray-500 font-medium">Date :</span>
          <input type="date" value={dateReference} max={new Date().toISOString().slice(0, 10)} onChange={(event) => setDateReference(event.target.value)} className="font-semibold text-gray-900 bg-transparent focus:outline-none cursor-pointer" />
        </label>
        <DashboardFilter label="Service" value={selectedService} options={servicesDisponibles} onChange={setSelectedService} />
        <DashboardFilter label="Régime" value={selectedRegime} options={regimesDisponibles} onChange={setSelectedRegime} />
        <p className="w-full text-xs text-gray-500 mt-1">La semaine est déterminée automatiquement à partir de la date sélectionnée.</p>
      </div>

      {!planningEstDisponible && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
          Aucun planning n’est chargé pour cette date. Les indicateurs sont volontairement à zéro jusqu’à l’import ou la saisie du planning correspondant.
        </div>
      )}

      {/* 4 & 5. Section Principale : Tableau (70%) et Panneau latéral (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Tableau (7 cols / ~70%) */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-base">Décompte hebdomadaire par agent</h2>
            <span className="text-xs text-gray-500 font-medium">{agentRowsFiltres.length} agents affichés</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Agent</th>
                  <th className="py-3 px-3">Régime</th>
                  <th className="py-3 px-3 text-center">Suivi</th>
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
                {agentRowsFiltres.map(({ agent, resultat, joursHeures, suivi }) => {
                  const isSelected = agent.id === activeSelectedId;
                  const hasHs = resultat.heuresSupplementairesTotales > 0;

                  return (
                    <tr
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
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
                          {agent.libelleRegime}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${suivi.validees === 7 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                            {suivi.validees}/7 validées
                          </span>
                          {suivi.aControler > 0 && <span className="text-[10px] text-amber-700">{suivi.aControler} à contrôler</span>}
                          {suivi.absentes > 0 && <span className="text-[10px] text-red-700">{suivi.absentes} absent{suivi.absentes > 1 ? "s" : ""}</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-center text-gray-600">{joursHeures.lun}h</td>
                      <td className="py-3.5 px-2 text-center text-gray-600">{joursHeures.mar}h</td>
                      <td className="py-3.5 px-2 text-center text-gray-600">{joursHeures.mer}h</td>
                      <td className="py-3.5 px-2 text-center text-gray-600">{joursHeures.jeu}h</td>
                      <td className="py-3.5 px-2 text-center text-gray-600">{joursHeures.ven}h</td>
                      <td className="py-3.5 px-2 text-center text-gray-600">{joursHeures.sam}h</td>
                      <td className="py-3.5 px-2 text-center text-gray-600">{joursHeures.dim}h</td>
                      <td className="py-3.5 px-3 text-center font-semibold text-gray-900">
                        {resultat.heuresRealiseesTotales}h
                      </td>
                      <td className="py-3.5 px-3 text-center text-gray-500">
                        {resultat.seuilReglementaire}h
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            hasHs
                              ? "bg-orange-100 text-orange-700 border border-orange-200"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {resultat.heuresSupplementairesTotales}h
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panneau latéral (4 cols / ~30%) */}
        <div className="lg:col-span-4 sticky top-6">
          {agentDetailForPanel && <PanneauDetail agent={agentDetailForPanel as any} />}
        </div>
      </div>
    </div>
  );
}
