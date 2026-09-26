import test from "node:test";
import assert from "node:assert";
import { decouperCreneauJourNuit } from "./decoupage-jour-nuit";
import { calculerHeuresSupSemaine } from "./calcul-semaine";
import { AgentPourCalcul, SemainePlanning } from "./types";

// Test 1 : Découpage créneau jour / nuit chevauchant (ex: 16:00 - 00:00)
test("Decoupage créneau jour / nuit chevauchant", () => {
  const { heuresJour, heuresNuit } = decouperCreneauJourNuit("16:00", "00:00");
  // 16:00 à 21:00 = 5h de jour
  // 21:00 à 00:00 = 3h de nuit
  assert.strictEqual(heuresJour, 5);
  assert.strictEqual(heuresNuit, 3);
});

// Test 2 : Agent à 40h sans heures supplémentaires
test("Agent 40h sans heures sup (8h/jour du lundi au vendredi)", () => {
  const agent: AgentPourCalcul = {
    id: "a1",
    nomComplet: "Test Agent",
    regime: "Standard",
    dureeReferenceSemaine: 40,
  };

  const planningVide: SemainePlanning = {
    lun: { date: "2026-07-27", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] },
    mar: { date: "2026-07-28", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] },
    mer: { date: "2026-07-29", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] },
    jeu: { date: "2026-07-30", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] },
    ven: { date: "2026-07-31", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] },
    sam: { date: "2026-08-01", creneaux: [] },
    dim: { date: "2026-08-02", creneaux: [] },
  };

  const resultat = calculerHeuresSupSemaine(agent, planningVide, []);
  assert.strictEqual(resultat.heuresRealiseesTotales, 40);
  assert.strictEqual(resultat.heuresSupplementairesTotales, 0);
  assert.strictEqual(resultat.detailsParTaux.length, 0);
});

// Test 3 : Agent à 46h avec heures sup de jour ouvré (< 8h, donc majoration 12%)
test("Agent 46h avec heures sup jour ouvré (< 8h)", () => {
  const agent: AgentPourCalcul = {
    id: "a2",
    nomComplet: "Agent Vente",
    regime: "Equivalence",
    dureeReferenceSemaine: 46,
  };

  const planning: SemainePlanning = {
    lun: { date: "2026-07-27", creneaux: [{ heureDebut: "08:00", heureFin: "18:00" }] }, // 10h
    mar: { date: "2026-07-28", creneaux: [{ heureDebut: "08:00", heureFin: "18:00" }] }, // 10h
    mer: { date: "2026-07-29", creneaux: [{ heureDebut: "08:00", heureFin: "18:00" }] }, // 10h
    jeu: { date: "2026-07-30", creneaux: [{ heureDebut: "08:00", heureFin: "18:00" }] }, // 10h
    ven: { date: "2026-07-31", creneaux: [{ heureDebut: "08:00", heureFin: "18:00" }] }, // 10h
    sam: { date: "2026-08-01", creneaux: [] },
    dim: { date: "2026-08-02", creneaux: [] },
  }; // Total = 50h, soit 4h de dépassement au-dessus de 46h

  const resultat = calculerHeuresSupSemaine(agent, planning, []);
  assert.strictEqual(resultat.heuresRealiseesTotales, 50);
  assert.strictEqual(resultat.heuresSupplementairesTotales, 4);
  assert.strictEqual(resultat.detailsParTaux.length, 1);
  assert.strictEqual(resultat.detailsParTaux[0].taux, 12);
  assert.strictEqual(resultat.detailsParTaux[0].nombreHeures, 4);
});

// Test 4 : Cas avec un jour férié déclaré
test("Prise en compte d'un jour férié (majoration dimanche/férié)", () => {
  const agent: AgentPourCalcul = {
    id: "a3",
    nomComplet: "Agent Férié",
    regime: "Standard",
    dureeReferenceSemaine: 40,
  };

  const planning: SemainePlanning = {
    lun: { date: "2026-07-27", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] }, // 8h
    mar: { date: "2026-07-28", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] }, // 8h
    mer: { date: "2026-07-29", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] }, // 8h
    jeu: { date: "2026-07-30", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] }, // 8h
    ven: { date: "2026-07-31", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] }, // 8h
    sam: { date: "2026-08-01", creneaux: [{ heureDebut: "08:00", heureFin: "14:00" }] }, // 6h (férié)
    dim: { date: "2026-08-02", creneaux: [] },
  };

  const resultat = calculerHeuresSupSemaine(agent, planning, ["2026-08-01"]);
  assert.strictEqual(resultat.heuresRealiseesTotales, 46);
  assert.strictEqual(resultat.heuresSupplementairesTotales, 6);
  const detailFerie = resultat.detailsParTaux.find((d) => d.taux === 50 && d.categorie === "jourFerie");
  assert.ok(detailFerie);
  assert.strictEqual(detailFerie?.nombreHeures, 6);
});

// Test 5 : Seuil hebdomadaire (40h) franchi PENDANT un créneau chevauchant la limite jour/nuit (21:00)
test("Seuil franchi pendant un créneau chevauchant jour/nuit (allocation chronologique)", () => {
  const agent: AgentPourCalcul = {
    id: "a4",
    nomComplet: "Agent Mixte Jour/Nuit",
    regime: "Standard",
    dureeReferenceSemaine: 40,
  };

  const planning: SemainePlanning = {
    lun: { date: "2026-07-27", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] }, // 8h
    mar: { date: "2026-07-28", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] }, // 8h
    mer: { date: "2026-07-29", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] }, // 8h
    jeu: { date: "2026-07-30", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] }, // 8h
    ven: { date: "2026-07-31", creneaux: [{ heureDebut: "14:00", heureFin: "00:00" }] }, // 10h (14h-22h = normal, 22h-00h = sup nuit)
    sam: { date: "2026-08-01", creneaux: [] },
    dim: { date: "2026-08-02", creneaux: [] },
  };

  const resultat = calculerHeuresSupSemaine(agent, planning, []);
  assert.strictEqual(resultat.heuresRealiseesTotales, 42);
  assert.strictEqual(resultat.heuresSupplementairesTotales, 2);
  
  const detailNuit = resultat.detailsParTaux.find((d) => d.taux === 50 && d.categorie === "nuitOuvre");
  assert.ok(detailNuit);
  assert.strictEqual(detailNuit?.nombreHeures, 2);
});

// Test 6 : Agent avec deux créneaux séparés le même jour, seuil franchi entre les deux créneaux
test("Seuil franchi entre deux créneaux distincts le même jour", () => {
  const agent: AgentPourCalcul = {
    id: "a5",
    nomComplet: "Agent Deux Créneaux",
    regime: "Standard",
    dureeReferenceSemaine: 40,
  };

  // Lun-Jeu : 8h/jour = 32h.
  // Ven : Matin 08:00-12:00 (4h) -> cumul 36h (< 40h, normal).
  //       Après-midi 13:00-21:00 (8h) -> cumul atteint 40h à 17:00 (4h de normal, 4h de sup de 17h à 21h).
  // Total vendredi = 12h. Heures sup = 4h (17:00-21:00, entièrement de jour ouvré).
  const planning: SemainePlanning = {
    lun: { date: "2026-07-27", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] }, // 8h
    mar: { date: "2026-07-28", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] }, // 8h
    mer: { date: "2026-07-29", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] }, // 8h
    jeu: { date: "2026-07-30", creneaux: [{ heureDebut: "08:00", heureFin: "16:00" }] }, // 8h
    ven: {
      date: "2026-07-31",
      creneaux: [
        { heureDebut: "08:00", heureFin: "12:00" }, // 4h
        { heureDebut: "13:00", heureFin: "21:00" }, // 8h
      ],
    },
    sam: { date: "2026-08-01", creneaux: [] },
    dim: { date: "2026-08-02", creneaux: [] },
  };

  const resultat = calculerHeuresSupSemaine(agent, planning, []);
  assert.strictEqual(resultat.heuresRealiseesTotales, 44);
  assert.strictEqual(resultat.heuresSupplementairesTotales, 4);

  const detailJourOuvre = resultat.detailsParTaux.find((d) => d.taux === 12 && d.categorie === "jourOuvre");
  assert.ok(detailJourOuvre);
  assert.strictEqual(detailJourOuvre?.nombreHeures, 4);
});

// Test de validation croisée avec le fichier Excel réel fourni par le cabinet La FIPA (agent Chantal, semaine du 29/06/2026) — si ce test échoue après une modification du moteur de calcul, cela signifie que le calcul ne correspond plus aux chiffres déjà validés par le client. Ne jamais modifier ce test pour le faire passer sans revalider d'abord avec le client.
test("Cas réel client - Chantal, semaine 29 juin 2026 (validation croisée avec Excel du cabinet)", () => {
  const agent: AgentPourCalcul = {
    id: "chantal-reel",
    nomComplet: "Chantal (cas de validation client)",
    regime: "Equivalence",
    dureeReferenceSemaine: 46,
  };

  const planning: SemainePlanning = {
    lun: { date: "2026-06-29", creneaux: [{ heureDebut: "08:00", heureFin: "15:00" }] },
    mar: { date: "2026-06-30", creneaux: [{ heureDebut: "08:00", heureFin: "15:00" }] },
    mer: { date: "2026-07-01", creneaux: [{ heureDebut: "08:00", heureFin: "15:00" }] },
    jeu: { date: "2026-07-02", creneaux: [{ heureDebut: "08:00", heureFin: "15:00" }] },
    ven: { date: "2026-07-03", creneaux: [{ heureDebut: "08:00", heureFin: "15:00" }] },
    sam: { date: "2026-07-04", creneaux: [{ heureDebut: "15:00", heureFin: "22:00" }] },
    dim: { date: "2026-07-05", creneaux: [{ heureDebut: "15:00", heureFin: "22:00" }] },
  };

  const resultat = calculerHeuresSupSemaine(agent, planning, []);

  // Vérités terrain issues du fichier Excel réel du cabinet (validé par le client)
  assert.strictEqual(resultat.heuresRealiseesTotales, 49);
  assert.strictEqual(resultat.seuilReglementaire, 46);
  assert.strictEqual(resultat.heuresSupplementairesTotales, 3);

  const hsJourFerie = resultat.detailsParTaux.find((d) => d.categorie === "jourFerie");
  const hsNuitFerie = resultat.detailsParTaux.find((d) => d.categorie === "nuitFerie");

  assert.ok(hsJourFerie, "Devrait avoir des HS jour férié/dimanche");
  assert.strictEqual(hsJourFerie?.nombreHeures, 2);
  assert.strictEqual(hsJourFerie?.taux, 50);

  assert.ok(hsNuitFerie, "Devrait avoir des HS nuit férié/dimanche");
  assert.strictEqual(hsNuitFerie?.nombreHeures, 1);
  assert.strictEqual(hsNuitFerie?.taux, 100);

  // Aucune HS ne doit être classée en jour/nuit "ouvré" pour ce cas précis
  const hsJourOuvre = resultat.detailsParTaux.find((d) => d.categorie === "jourOuvre");
  const hsNuitOuvre = resultat.detailsParTaux.find((d) => d.categorie === "nuitOuvre");
  assert.strictEqual(hsJourOuvre, undefined);
  assert.strictEqual(hsNuitOuvre, undefined);
});

test("Regles de majoration personnalisables", () => {
  const agent: AgentPourCalcul = {
    id: "regles-personnalisees",
    nomComplet: "Agent Regles",
    regime: "Equivalence",
    dureeReferenceSemaine: 46,
  };

  const planning: SemainePlanning = {
    lun: { date: "2026-07-27", creneaux: [{ heureDebut: "08:00", heureFin: "19:00" }] },
    mar: { date: "2026-07-28", creneaux: [{ heureDebut: "08:00", heureFin: "19:00" }] },
    mer: { date: "2026-07-29", creneaux: [{ heureDebut: "08:00", heureFin: "19:00" }] },
    jeu: { date: "2026-07-30", creneaux: [{ heureDebut: "08:00", heureFin: "19:00" }] },
    ven: { date: "2026-07-31", creneaux: [{ heureDebut: "08:00", heureFin: "19:00" }] },
    sam: { date: "2026-08-01", creneaux: [] },
    dim: { date: "2026-08-02", creneaux: [] },
  };

  const resultatParDefaut = calculerHeuresSupSemaine(agent, planning, []);
  const resultatPersonnalise = calculerHeuresSupSemaine(agent, planning, [], {
    seuilHeuresTranche1JourOuvre: 5,
    tauxJourOuvreTranche1: 20,
    tauxJourOuvreTranche2: 60,
    tauxNuitOuvre: 55,
    tauxJourFerie: 65,
    tauxNuitFerie: 110,
    libelleVersion: "R-CLIENT-TEST",
    dateEffet: "2026-09-21",
  });

  assert.strictEqual(resultatParDefaut.heuresSupplementairesTotales, 9);
  assert.strictEqual(resultatPersonnalise.heuresSupplementairesTotales, 9);
  assert.deepStrictEqual(
    resultatPersonnalise.detailsParTaux.map((detail) => ({ taux: detail.taux, heures: detail.nombreHeures })),
    [
      { taux: 20, heures: 5 },
      { taux: 60, heures: 4 },
    ],
  );
  assert.deepStrictEqual(
    resultatParDefaut.detailsParTaux.map((detail) => ({ taux: detail.taux, heures: detail.nombreHeures })),
    [
      { taux: 12, heures: 8 },
      { taux: 35, heures: 1 },
    ],
  );
});
