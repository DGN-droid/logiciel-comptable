"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Info, NotebookPen, Plus, Trash2 } from "lucide-react";
import { useDonnees } from "@/contexts/DonneesContext";
import ModalAjoutFerie from "@/components/ModalAjoutFerie";
import ModalAjoutNote from "@/components/ModalAjoutNote";
import { nomsJoursFeries2026 } from "@/lib/jours-feries";

const joursSemaine = ["L", "M", "M", "J", "V", "S", "D"];

function dateLocale(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function afficherDate(dateString: string) {
  return dateLocale(dateString).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function CalendrierPage() {
  const {
    joursFeries,
    nomsJoursFeries,
    ajouterJourFerie,
    supprimerJourFerie,
    dateReference,
    setDateReference,
    notesPeriodes,
    ajouterNotePeriode,
    supprimerNotePeriode,
  } = useDonnees();
  const dateSelectionnee = dateLocale(dateReference);
  const [moisVisible, setMoisVisible] = useState(new Date(dateSelectionnee.getFullYear(), dateSelectionnee.getMonth(), 1));
  const [noteOuverte, setNoteOuverte] = useState(false);
  const [ferieOuvert, setFerieOuvert] = useState(false);

  const moisLabel = moisVisible.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const cellules = useMemo(() => {
    const premierJour = new Date(moisVisible.getFullYear(), moisVisible.getMonth(), 1);
    const decalage = premierJour.getDay() === 0 ? 6 : premierJour.getDay() - 1;
    const totalJours = new Date(moisVisible.getFullYear(), moisVisible.getMonth() + 1, 0).getDate();
    return Array.from({ length: decalage + totalJours }, (_, index) => {
      const jour = index - decalage + 1;
      if (jour < 1) return null;
      const date = new Date(moisVisible.getFullYear(), moisVisible.getMonth(), jour);
      const dateString = dateKey(date);
      return { jour, dateString, dimanche: date.getDay() === 0, ferie: joursFeries.includes(dateString) };
    });
  }, [moisVisible, joursFeries]);

  const notesDuMois = notesPeriodes.filter((note) => {
    const debutMois = dateKey(moisVisible);
    const finMois = dateKey(new Date(moisVisible.getFullYear(), moisVisible.getMonth() + 1, 0));
    return note.dateDebut <= finMois && note.dateFin >= debutMois;
  });

  const changerMois = (delta: number) => {
    setMoisVisible((mois) => new Date(mois.getFullYear(), mois.getMonth() + delta, 1));
  };

  const selectionnerDate = (dateString: string) => {
    setDateReference(dateString);
    setMoisVisible(new Date(dateLocale(dateString).getFullYear(), dateLocale(dateString).getMonth(), 1));
  };

  const joursFeriesObj = joursFeries
    .filter((date) => dateLocale(date).getFullYear() === moisVisible.getFullYear())
    .map((date, index) => ({
      id: `${date}-${index}`,
      date,
      nom: nomsJoursFeries[date] ?? nomsJoursFeries2026[date] ?? `Jour férié (${date})`,
    }));

  return (
    <div className="p-8 max-w-[1500px] mx-auto w-full flex flex-col space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#264387]"><CalendarDays className="w-6 h-6" /><h1 className="text-2xl font-bold tracking-tight">Calendrier de suivi</h1></div>
          <p className="mt-1 text-sm text-gray-600 font-medium">Dates de référence, jours fériés et notes utiles au traitement comptable</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300 shadow-sm text-sm">
            <span className="text-xs text-gray-500 font-medium">Aller à une date :</span>
            <input type="date" value={dateReference} onChange={(event) => selectionnerDate(event.target.value)} className="font-semibold text-gray-800 bg-transparent focus:outline-none" />
          </label>
          <button type="button" onClick={() => setNoteOuverte(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#1c6943] hover:bg-[#155435]"><NotebookPen className="w-4 h-4" /> Ajouter une note</button>
        </div>
      </header>

      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-sm text-[#264387]"><Info className="w-5 h-5 shrink-0 mt-0.5" /><p>La date sélectionnée devient la date de référence du dashboard. Les notes peuvent couvrir une journée ou toute une période de travail.</p></div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <button type="button" onClick={() => changerMois(-1)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" aria-label="Mois précédent"><ChevronLeft className="w-5 h-5" /></button>
            <h2 className="font-bold text-[#264387] capitalize">{moisLabel}</h2>
            <button type="button" onClick={() => changerMois(1)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" aria-label="Mois suivant"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-7 gap-2 text-center mb-2">{joursSemaine.map((jour, index) => <span key={`${jour}-${index}`} className="text-xs font-bold text-gray-400">{jour}</span>)}</div>
            <div className="grid grid-cols-7 gap-2">
              {cellules.map((cell, index) => (
                <div key={cell ? cell.dateString : `vide-${index}`} className="min-h-16 rounded-lg border border-transparent flex items-start justify-center p-1">
                  {cell && <button type="button" onClick={() => selectionnerDate(cell.dateString)} title={cell.ferie ? "Jour férié déclaré" : "Sélectionner cette date"} className={`w-full min-h-14 rounded-lg border p-2 text-left transition-colors ${cell.ferie ? "bg-emerald-50 border-emerald-300 text-[#1c6943]" : cell.dimanche ? "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100" : "border-transparent hover:bg-blue-50 text-gray-700"} ${cell.dateString === dateReference ? "ring-2 ring-[#264387] ring-offset-1" : ""}`}><span className="text-sm font-semibold">{cell.jour}</span>{cell.ferie && <span className="block text-[10px] mt-1 font-semibold">Férié</span>}</button>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between gap-3 mb-3"><div><p className="text-xs text-gray-500 uppercase font-semibold">Date sélectionnée</p><h2 className="font-bold text-gray-900 capitalize mt-1">{afficherDate(dateReference)}</h2></div><button type="button" onClick={() => setFerieOuvert(true)} className="p-2 rounded-lg text-[#1c6943] bg-emerald-50 hover:bg-emerald-100" title="Déclarer un jour férié"><Plus className="w-5 h-5" /></button></div>
            <p className="text-sm text-gray-600">{joursFeries.includes(dateReference) ? "Cette date est déclarée fériée." : "Cette date est un jour ouvré selon le calendrier déclaré."}</p>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-gray-900">Notes de la période</h2><span className="text-xs text-gray-500">{notesDuMois.length}</span></div>
            <div className="space-y-3">
              {notesDuMois.length === 0 ? <p className="text-sm text-gray-500">Aucune note pour ce mois.</p> : notesDuMois.map((note) => <article key={note.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3"><div className="flex items-start justify-between gap-2"><div><h3 className="text-sm font-semibold text-gray-900">{note.titre}</h3><p className="text-[11px] text-[#264387] mt-1">{note.categorie} · {note.dateDebut} → {note.dateFin}</p></div><button type="button" onClick={() => supprimerNotePeriode(note.id)} className="p-1 text-gray-400 hover:text-red-600" title="Supprimer la note"><Trash2 className="w-4 h-4" /></button></div><p className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">{note.contenu}</p></article>)}
            </div>
          </section>
        </aside>
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"><div><h2 className="font-bold text-gray-900">Jours fériés déclarés</h2><p className="text-xs text-gray-500 mt-1">Ils modifient uniquement le taux des heures déjà supplémentaires.</p></div><button type="button" onClick={() => setFerieOuvert(true)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[#1c6943] hover:bg-[#155435]"><Plus className="w-4 h-4" /> Ajouter</button></div>
        <div className="overflow-x-auto"><table className="w-full text-left border-collapse text-sm"><thead><tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase"><th className="py-3 px-6">Date</th><th className="py-3 px-6">Nom</th><th className="py-3 px-6 text-right">Action</th></tr></thead><tbody className="divide-y divide-gray-100">{joursFeriesObj.map((ferie) => <tr key={ferie.id}><td className="py-3 px-6 font-semibold text-gray-900">{dateLocale(ferie.date).toLocaleDateString("fr-FR", { dateStyle: "full" })}</td><td className="py-3 px-6 text-gray-600">{ferie.nom}</td><td className="py-3 px-6 text-right"><button type="button" onClick={() => supprimerJourFerie(ferie.date)} className="p-1.5 text-gray-400 hover:text-red-600" title="Supprimer ce jour férié"><Trash2 className="w-4 h-4" /></button></td></tr>)}</tbody></table></div>
      </section>

      <ModalAjoutNote isOpen={noteOuverte} dateInitiale={dateReference} onClose={() => setNoteOuverte(false)} onSave={ajouterNotePeriode} />
      <ModalAjoutFerie
        isOpen={ferieOuvert}
        dateInitiale={dateReference}
        onClose={() => setFerieOuvert(false)}
        onSave={(nom, date) => {
          ajouterJourFerie(nom, date);
          setDateReference(date);
          const dateAjoutee = dateLocale(date);
          setMoisVisible(new Date(dateAjoutee.getFullYear(), dateAjoutee.getMonth(), 1));
          setFerieOuvert(false);
        }}
      />
    </div>
  );
}
