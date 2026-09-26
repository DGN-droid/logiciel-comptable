import test from "node:test";
import assert from "node:assert";
import { calculerPaieAgent } from "./calcul-paie-agent";
import { calculerTauxHoraire } from "./calcul-taux-horaire";
import { ResultatSemaine } from "@/lib/calcul-hs/types";

test("Calcul taux horaire de base", () => {
  const taux = calculerTauxHoraire(173330);
  assert.strictEqual(taux, 1000);
});

test("Calcul paie agent avec inclureHeuresSupDansPaie = true", () => {
  const agent = {
    id: "a1",
    salaireBaseMensuel: 173330, // taux horaire = 1000 FCFA/h
    inclureHeuresSupDansPaie: true,
  };

  const resultatSemaine: ResultatSemaine = {
    agentId: "a1",
    heuresRealiseesTotales: 50,
    seuilReglementaire: 46,
    heuresSupplementairesTotales: 4,
    repartitionHeuresRealisees: { jourOuvre: 50, nuitOuvre: 0, jourFerie: 0, nuitFerie: 0 },
    repartitionHeuresSupplementaires: { jourOuvre: 4, nuitOuvre: 0, jourFerie: 0, nuitFerie: 0 },
    detailsParTaux: [
      {
        taux: 12,
        libelle: "HS Jour ouvré (12%)",
        categorie: "jourOuvre",
        nombreHeures: 4,
      },
    ],
    cumulParJour: [],
  };

  const paie = calculerPaieAgent(agent, resultatSemaine);
  assert.strictEqual(paie.salaireBaseMensuel, 173330);
  assert.strictEqual(paie.tauxHoraire, 1000);
  // 4h * 1000 * (1 + 12/100) = 4 * 1000 * 1.12 = 4480 FCFA
  assert.strictEqual(paie.montantHeuresSup, 4480);
  assert.strictEqual(paie.inclureHeuresSup, true);
  assert.strictEqual(paie.salaireTotal, 173330 + 4480);
});

test("Calcul paie agent avec inclureHeuresSupDansPaie = false", () => {
  const agent = {
    id: "a2",
    salaireBaseMensuel: 173330,
    inclureHeuresSupDansPaie: false,
  };

  const resultatSemaine: ResultatSemaine = {
    agentId: "a2",
    heuresRealiseesTotales: 50,
    seuilReglementaire: 46,
    heuresSupplementairesTotales: 4,
    repartitionHeuresRealisees: { jourOuvre: 50, nuitOuvre: 0, jourFerie: 0, nuitFerie: 0 },
    repartitionHeuresSupplementaires: { jourOuvre: 4, nuitOuvre: 0, jourFerie: 0, nuitFerie: 0 },
    detailsParTaux: [
      {
        taux: 12,
        libelle: "HS Jour ouvré (12%)",
        categorie: "jourOuvre",
        nombreHeures: 4,
      },
    ],
    cumulParJour: [],
  };

  const paie = calculerPaieAgent(agent, resultatSemaine);
  assert.strictEqual(paie.salaireBaseMensuel, 173330);
  assert.strictEqual(paie.montantHeuresSup, 4480);
  assert.strictEqual(paie.inclureHeuresSup, false);
  // Salaire total doit être égal au salaire de base sans ajout des HS
  assert.strictEqual(paie.salaireTotal, 173330);
});
