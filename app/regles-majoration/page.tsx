"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock3, Info, Save, SlidersHorizontal } from "lucide-react";
import { useDonnees } from "@/contexts/DonneesContext";
import { ReglesMajoration } from "@/lib/calcul-hs/regles-majoration";

type ChampNumerique = Exclude<keyof ReglesMajoration, "libelleVersion" | "dateEffet">;

const champsNumeriques: Array<{
  key: ChampNumerique;
  label: string;
  suffixe: string;
  max?: number;
}> = [
  {
    key: "seuilHeuresTranche1JourOuvre",
    label: "Seuil des heures sup jour ouvré en 1ère tranche",
    suffixe: "h",
  },
  { key: "tauxJourOuvreTranche1", label: "Taux 1ère tranche jour ouvré", suffixe: "%", max: 100 },
  { key: "tauxJourOuvreTranche2", label: "Taux 2e tranche jour ouvré", suffixe: "%", max: 100 },
  { key: "tauxNuitOuvre", label: "Taux nuit ouvré", suffixe: "%", max: 100 },
  { key: "tauxJourFerie", label: "Taux jour dimanche/férié", suffixe: "%", max: 100 },
  { key: "tauxNuitFerie", label: "Taux nuit dimanche/férié", suffixe: "%", max: 100 },
];

function formatDateEffet(date: string) {
  const dateFormatee = new Date(`${date}T00:00:00`);
  if (Number.isNaN(dateFormatee.getTime())) return date;
  return dateFormatee.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function ReglesMajorationPage() {
  const { regles, modifierReglesMajoration } = useDonnees();
  const [form, setForm] = useState<ReglesMajoration>(regles);
  const [enregistre, setEnregistre] = useState(false);

  useEffect(() => {
    setForm(regles);
  }, [regles]);

  const grille = useMemo(
    () => [
      {
        categorie: "Jour ouvré",
        plage: "05h00 – 21h00",
        taux: `${regles.tauxJourOuvreTranche1} %`,
        condition: `Les ${regles.seuilHeuresTranche1JourOuvre} premières heures supplémentaires de cette catégorie dans la semaine`,
      },
      {
        categorie: "Jour ouvré",
        plage: "05h00 – 21h00",
        taux: `${regles.tauxJourOuvreTranche2} %`,
        condition: `Les heures supplémentaires de cette catégorie au-delà des ${regles.seuilHeuresTranche1JourOuvre} premières`,
      },
      {
        categorie: "Nuit ouvrée",
        plage: "21h00 – 05h00",
        taux: `${regles.tauxNuitOuvre} %`,
        condition: "Toutes les heures supplémentaires de nuit sur un jour ouvré",
      },
      {
        categorie: "Jour dimanche / férié",
        plage: "05h00 – 21h00",
        taux: `${regles.tauxJourFerie} %`,
        condition: "Toutes les heures déjà supplémentaires sur un dimanche ou un jour férié déclaré",
      },
      {
        categorie: "Nuit dimanche / férié",
        plage: "21h00 – 05h00",
        taux: `${regles.tauxNuitFerie} %`,
        condition: "Toutes les heures déjà supplémentaires de nuit sur un dimanche ou un jour férié déclaré",
      },
    ],
    [regles],
  );

  const modifierNombre = (champ: ChampNumerique, valeur: string) => {
    setEnregistre(false);
    setForm((precedent) => ({
      ...precedent,
      [champ]: valeur === "" ? 0 : Number(valeur),
    }));
  };

  const enregistrer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    modifierReglesMajoration({ ...form });
    setEnregistre(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col space-y-8 p-8">
      <header className="border-b border-gray-200/60 pb-6">
        <div className="flex items-center gap-2 text-[#264387]">
          <SlidersHorizontal className="h-6 w-6" />
          <h1 className="text-2xl font-bold tracking-tight">Règles de majoration</h1>
        </div>
        <p className="mt-1 text-sm font-medium text-gray-600">
          Version active : <span className="font-bold text-gray-900">{regles.libelleVersion}</span> · effet au {formatDateEffet(regles.dateEffet)}
        </p>
      </header>

      <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-5 text-sm text-orange-900">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
        <p className="leading-relaxed font-medium">
          Toute modification de ces règles s’applique immédiatement à tous les calculs de l’application. Ne modifiez ces valeurs qu’après validation avec le cabinet et le client.
        </p>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-5 text-sm text-[#264387]">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">Principe de déclenchement</p>
            <p className="mt-1 leading-relaxed">
              Le calcul reste hebdomadaire, du lundi au dimanche. Chaque agent possède sa propre durée réglementaire de référence. Les heures deviennent supplémentaires uniquement après le franchissement de ce seuil dans l’ordre chronologique.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={enregistrer} className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Paramètres applicables aux heures supplémentaires</h2>
            <p className="mt-1 text-xs text-gray-500">Les taux sont saisis en pourcentage et le seuil en heures.</p>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1c6943] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#155435]"
          >
            <Save className="h-4 w-4" />
            Enregistrer les règles
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-gray-800">Version de la règle</span>
            <input
              type="text"
              value={form.libelleVersion}
              onChange={(event) => {
                setEnregistre(false);
                setForm((precedent) => ({ ...precedent, libelleVersion: event.target.value }));
              }}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 focus:border-[#264387] focus:outline-none focus:ring-2 focus:ring-[#264387]/15"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-gray-800">Date d’effet</span>
            <input
              type="date"
              value={form.dateEffet}
              onChange={(event) => {
                setEnregistre(false);
                setForm((precedent) => ({ ...precedent, dateEffet: event.target.value }));
              }}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 focus:border-[#264387] focus:outline-none focus:ring-2 focus:ring-[#264387]/15"
            />
          </label>

          {champsNumeriques.map(({ key, label, suffixe, max }) => (
            <label key={key} className="block">
              <span className="text-sm font-semibold text-gray-800">{label}</span>
              <div className="relative mt-2">
                <input
                  type="number"
                  min="0"
                  max={max}
                  step="0.01"
                  value={form[key]}
                  onChange={(event) => modifierNombre(key, event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm font-semibold text-gray-900 focus:border-[#264387] focus:outline-none focus:ring-2 focus:ring-[#264387]/15"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-gray-500">
                  {suffixe}
                </span>
              </div>
            </label>
          ))}
        </div>

        {enregistre && (
          <p className="mx-6 mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-[#1c6943]">
            Les règles de majoration ont été enregistrées et sont immédiatement utilisées par les calculs.
          </p>
        )}
      </form>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <Clock3 className="mb-3 h-5 w-5 text-[#264387]" />
          <h2 className="font-bold text-gray-900">Jour et nuit</h2>
          <p className="mt-2 text-sm text-gray-600">Jour : 05h00 à 21h00.</p>
          <p className="text-sm text-gray-600">Nuit : 21h00 à 05h00.</p>
          <p className="mt-3 text-xs text-gray-500">Les créneaux qui traversent une limite sont automatiquement découpés.</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-gray-900">Jour ouvré</h2>
          <p className="mt-3 text-3xl font-bold text-[#264387]">{regles.seuilHeuresTranche1JourOuvre} h</p>
          <p className="mt-1 text-sm text-gray-600">Seuil de la première tranche de jour ouvré.</p>
          <p className="mt-3 text-xs text-gray-500">Ce compteur porte sur les heures supplémentaires de la catégorie, pas sur une position d’horloge fixe.</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-gray-900">Dimanche / férié</h2>
          <p className="mt-3 text-sm text-gray-600">Un jour férié doit être déclaré explicitement dans le calendrier.</p>
          <p className="mt-3 text-xs text-gray-500">Sa déclaration change le taux des heures supplémentaires concernées ; elle ne crée pas automatiquement des heures supplémentaires.</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Grille des taux active</h2>
          <p className="mt-1 text-xs text-gray-500">Les taux ci-dessous s’appliquent uniquement aux heures supplémentaires.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Catégorie</th>
                <th className="px-4 py-3">Plage</th>
                <th className="px-4 py-3 text-center">Majoration</th>
                <th className="px-6 py-3">Application</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grille.map((regle) => (
                <tr key={`${regle.categorie}-${regle.taux}`}>
                  <td className="px-6 py-4 font-semibold text-gray-900">{regle.categorie}</td>
                  <td className="px-4 py-4 text-gray-600">{regle.plage}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-bold text-[#1c6943]">
                      {regle.taux}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{regle.condition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/calendrier" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-[#264387] hover:bg-gray-50">
          Gérer les jours fériés <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/decompte/hebdo" className="inline-flex items-center gap-2 rounded-lg bg-[#1c6943] px-4 py-2 text-sm font-semibold text-white hover:bg-[#155435]">
          Ouvrir le décompte hebdo <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
