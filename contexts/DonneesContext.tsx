"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { agentsMock, planningsSemaineMock, joursFeriesMock, AgentComplet, semaineMock } from "@/lib/donnees-mock";
import { nomsJoursFeries2026 } from "@/lib/jours-feries";
import { JourSemaine, SemainePlanning, CreneauTravail, TypeRegime } from "@/lib/calcul-hs/types";
import { StatutAgent } from "@/lib/agents-data";
import { NotePeriode } from "@/lib/notes-calendrier";
import { REGLES_MAJORATION_PAR_DEFAUT, ReglesMajoration } from "@/lib/calcul-hs/regles-majoration";
import { cleSuiviJour, SuiviJour, StatutSuiviJour } from "@/lib/suivi-heures";

interface DonneesContextType {
  agents: AgentComplet[];
  plannings: Record<string, SemainePlanning>;
  joursFeries: string[];
  nomsJoursFeries: Record<string, string>;
  suivisJours: Record<string, SuiviJour>;
  modifierSuiviJour: (agentId: string, date: string, statut: StatutSuiviJour, note: string) => void;
  regles: ReglesMajoration;
  modifierReglesMajoration: (nouvellesRegles: ReglesMajoration) => void;
  dateReference: string;
  setDateReference: (date: string) => void;
  notesPeriodes: NotePeriode[];
  ajouterNotePeriode: (note: Omit<NotePeriode, "id">) => void;
  supprimerNotePeriode: (id: string) => void;
  ajouterAgent: (agent: {
    nomComplet: string;
    matricule: string;
    poste: string;
    libelleRegime: string;
    dureeReferenceSemaine: number;
    salaireBaseMensuel: number | null;
    inclureHeuresSupDansPaie: boolean | null;
    statut: StatutAgent;
    joursTravail: JourSemaine[];
  }) => void;
  modifierConfigurationPaie: (
    agentId: string,
    salaireBaseMensuel: number | null,
    inclureHeuresSupDansPaie: boolean | null,
  ) => void;
  modifierPlanningAgent: (
    agentId: string,
    jour: keyof SemainePlanning,
    creneaux: CreneauTravail[]
  ) => void;
  ajouterJourFerie: (nom: string, date: string) => void;
  supprimerJourFerie: (date: string) => void;
}

const DonneesContext = createContext<DonneesContextType | undefined>(undefined);

export function DonneesProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<AgentComplet[]>(agentsMock);
  const [plannings, setPlannings] = useState<Record<string, SemainePlanning>>(planningsSemaineMock);
  const [joursFeries, setJoursFeries] = useState<string[]>(joursFeriesMock);
  const [nomsJoursFeries, setNomsJoursFeries] = useState<Record<string, string>>(nomsJoursFeries2026);
  const [suivisJours, setSuivisJours] = useState<Record<string, SuiviJour>>({});
  const [regles, setRegles] = useState<ReglesMajoration>(REGLES_MAJORATION_PAR_DEFAUT);
  const [dateReference, setDateReference] = useState(semaineMock.dateFin);
  const [notesPeriodes, setNotesPeriodes] = useState<NotePeriode[]>([]);
  const [notesChargees, setNotesChargees] = useState(false);
  const [suivisCharges, setSuivisCharges] = useState(false);
  const [feriesCharges, setFeriesCharges] = useState(false);

  useEffect(() => {
    try {
      const notesSauvegardees = window.localStorage.getItem("fipa_notes_periodes");
      if (notesSauvegardees) setNotesPeriodes(JSON.parse(notesSauvegardees) as NotePeriode[]);
      const suivisSauvegardes = window.localStorage.getItem("fipa_suivis_jours");
      if (suivisSauvegardes) setSuivisJours(JSON.parse(suivisSauvegardes) as Record<string, SuiviJour>);
      const feriesSauvegardes = window.localStorage.getItem("fipa_jours_feries");
      if (feriesSauvegardes) setJoursFeries(JSON.parse(feriesSauvegardes) as string[]);
      const nomsFeriesSauvegardes = window.localStorage.getItem("fipa_noms_jours_feries");
      if (nomsFeriesSauvegardes) setNomsJoursFeries(JSON.parse(nomsFeriesSauvegardes) as Record<string, string>);
    } catch {
      // Les notes restent disponibles en mémoire si le stockage local est indisponible.
    } finally {
      setNotesChargees(true);
      setSuivisCharges(true);
      setFeriesCharges(true);
    }
  }, []);

  useEffect(() => {
    if (notesChargees) window.localStorage.setItem("fipa_notes_periodes", JSON.stringify(notesPeriodes));
  }, [notesPeriodes, notesChargees]);

  useEffect(() => {
    if (suivisCharges) window.localStorage.setItem("fipa_suivis_jours", JSON.stringify(suivisJours));
  }, [suivisJours, suivisCharges]);

  useEffect(() => {
    if (feriesCharges) {
      window.localStorage.setItem("fipa_jours_feries", JSON.stringify(joursFeries));
      window.localStorage.setItem("fipa_noms_jours_feries", JSON.stringify(nomsJoursFeries));
    }
  }, [joursFeries, nomsJoursFeries, feriesCharges]);

  const ajouterAgent = (nouveau: {
    nomComplet: string;
    matricule: string;
    poste: string;
    libelleRegime: string;
    dureeReferenceSemaine: number;
    salaireBaseMensuel: number | null;
    inclureHeuresSupDansPaie: boolean | null;
    statut: StatutAgent;
    joursTravail: JourSemaine[];
  }) => {
    const id = Date.now().toString();
    const nouvelAgent: AgentComplet = {
      id,
      nomComplet: nouveau.nomComplet,
      matricule: nouveau.matricule,
      poste: nouveau.poste,
      libelleRegime: nouveau.libelleRegime,
      regime: (nouveau.dureeReferenceSemaine === 40 ? "Standard" : "Equivalence") as TypeRegime,
      dureeReferenceSemaine: nouveau.dureeReferenceSemaine,
      salaireBaseMensuel: nouveau.salaireBaseMensuel,
      inclureHeuresSupDansPaie: nouveau.inclureHeuresSupDansPaie,
      statut: nouveau.statut,
      joursTravail: [...nouveau.joursTravail],
    };

    setAgents((prev) => [nouvelAgent, ...prev]);

    // Initialiser un planning vide pour la semaine S30 pour ce nouvel agent
    const planningVide: SemainePlanning = {
      lun: { date: "2026-07-27", creneaux: [] },
      mar: { date: "2026-07-28", creneaux: [] },
      mer: { date: "2026-07-29", creneaux: [] },
      jeu: { date: "2026-07-30", creneaux: [] },
      ven: { date: "2026-07-31", creneaux: [] },
      sam: { date: "2026-08-01", creneaux: [] },
      dim: { date: "2026-08-02", creneaux: [] },
    };
    setPlannings((prev) => ({
      ...prev,
      [id]: planningVide,
    }));
  };

  const modifierConfigurationPaie = (
    agentId: string,
    salaireBaseMensuel: number | null,
    inclureHeuresSupDansPaie: boolean | null,
  ) => {
    setAgents((prev) => prev.map((agent) => (
      agent.id === agentId
        ? { ...agent, salaireBaseMensuel, inclureHeuresSupDansPaie }
        : agent
    )));
  };

  const modifierPlanningAgent = (
    agentId: string,
    jour: keyof SemainePlanning,
    creneaux: CreneauTravail[]
  ) => {
    setPlannings((prev) => {
      const agentPlanning = prev[agentId] || {
        lun: { date: "2026-07-27", creneaux: [] },
        mar: { date: "2026-07-28", creneaux: [] },
        mer: { date: "2026-07-29", creneaux: [] },
        jeu: { date: "2026-07-30", creneaux: [] },
        ven: { date: "2026-07-31", creneaux: [] },
        sam: { date: "2026-08-01", creneaux: [] },
        dim: { date: "2026-08-02", creneaux: [] },
      };
      return {
        ...prev,
        [agentId]: {
          ...agentPlanning,
          [jour]: {
            ...agentPlanning[jour],
            creneaux,
          },
        },
      };
    });
  };

  const ajouterJourFerie = (nom: string, date: string) => {
    const nomPropre = nom.trim() || nomsJoursFeries2026[date] || `Jour férié (${date})`;
    setJoursFeries((prev) => {
      if (prev.includes(date)) return prev;
      return [...prev, date].sort();
    });
    setNomsJoursFeries((prev) => ({ ...prev, [date]: nomPropre }));
  };

  const supprimerJourFerie = (date: string) => {
    setJoursFeries((prev) => prev.filter((d) => d !== date));
    setNomsJoursFeries((prev) => {
      const suivant = { ...prev };
      delete suivant[date];
      return suivant;
    });
  };

  const modifierSuiviJour = (
    agentId: string,
    date: string,
    statut: StatutSuiviJour,
    note: string,
  ) => {
    const maintenant = new Date().toISOString();
    setSuivisJours((prev) => ({
      ...prev,
      [cleSuiviJour(agentId, date)]: {
        agentId,
        date,
        statut,
        note,
        modifieLe: maintenant,
      },
    }));
  };

  const modifierReglesMajoration = (nouvellesRegles: ReglesMajoration) => {
    setRegles({ ...nouvellesRegles });
  };

  const ajouterNotePeriode = (note: Omit<NotePeriode, "id">) => {
    setNotesPeriodes((prev) => [...prev, { ...note, id: Date.now().toString() }].sort((a, b) => a.dateDebut.localeCompare(b.dateDebut)));
  };

  const supprimerNotePeriode = (id: string) => {
    setNotesPeriodes((prev) => prev.filter((note) => note.id !== id));
  };

  return (
    <DonneesContext.Provider
      value={{
        agents,
        plannings,
        joursFeries,
        nomsJoursFeries,
        suivisJours,
        modifierSuiviJour,
        regles,
        modifierReglesMajoration,
        dateReference,
        setDateReference,
        notesPeriodes,
        ajouterNotePeriode,
        supprimerNotePeriode,
        ajouterAgent,
        modifierConfigurationPaie,
        modifierPlanningAgent,
        ajouterJourFerie,
        supprimerJourFerie,
      }}
    >
      {children}
    </DonneesContext.Provider>
  );
}

export function useDonnees() {
  const context = useContext(DonneesContext);
  if (!context) {
    throw new Error("useDonnees doit être utilisé à l'intérieur d'un DonneesProvider");
  }
  return context;
}
