---
name: big-five-auswertung
description: >
  Interpret and explain IPIP-NEO-120 Big Five results in plain German. Use whenever the user
  shares Big Five / OCEAN scores (means, percentiles, domains, facets), asks what a score means
  ("was heißt Perzentil 72?", "ist hoher Neurotizismus schlecht?", "erkläre meine Auswertung"),
  pastes a paradise-b5-hd JSON export from the app, or wants a written summary of a profile.
  Also use when writing content about the Big Five tab of the Daily Energy Map app. Never
  invents types, never gives clinical judgments, always explains both poles as trade-offs.
---

# Big-Five-Auswertung — IPIP-NEO-120 erklären

Ziel: Big-Five-Ergebnisse (Johnson IPIP-NEO-120, Public Domain) in normaler Sprache erklären —
präzise, ohne Klischees, ohne Wertung. Antwortsprache: Deutsch (außer explizit anders gewünscht).

## Grundregeln (nie überspringen)

1. **Dimensional, nicht typologisch.** Es gibt keine Big-Five-Typen. Nie „du bist ein X" sagen —
   immer „du liegst hoch/mittel/niedrig auf X".
2. **Beide Pole sind legitim.** Jede Ausprägung als Trade-off erklären: hoch = Stärke A, Kosten B;
   niedrig = Stärke C, Kosten D. Nie ein Pol als Ziel oder Defizit framen.
3. **Kein klinisches Urteil.** Besonders bei Neurotizismus: hohe Werte sind Selbstbericht über
   Reaktivität, keine Diagnose. Bei Leidensdruck → Fachhilfe empfehlen, nicht interpretieren.
4. **Facetten schlagen Domänen.** Bei Widersprüchen („E mittel, aber wie?") immer auf
   Facetten-Ebene gehen — dort liegt die eigentliche Information.
5. **Messfehler benennen.** Unterschiede unter ~5–10 Perzentilpunkten sind Rauschen.
   Perzentile der App sind Näherungen (Normal-Approximation aus Johnson-Normen).
6. **HD-Bezüge nur explorativ.** Wenn HD-Chart-Daten dabei sind (hdFeatures im Export):
   Parallelen als „explorativ, nicht validiert" markieren — nie als bestätigtes Mapping.

## Die Zahlen erklären

| Feld | Bedeutung | Formulierung für Laien |
|------|-----------|------------------------|
| Mittel x/5 | Durchschnitt der 1–5-Antworten, negativ formulierte Items vorher umgepolt | „Im Schnitt hast du hier eher zugestimmt/abgelehnt" |
| Perzentil ~x | Anteil der Johnson-Normstichprobe (>600k, Internet) unter diesem Wert | „~x % der Vergleichsgruppe liegen unter dir — Einordnung, keine Note" |
| hoch/mittel/niedrig | Banding: >~3,35 hoch, <~2,65 niedrig | „grobe Verdichtung — die echte Info steckt in Mittel + Perzentil" |
| 120/120 | Vollständigkeit; Auswertung/Export nur bei komplettem Test | „keine Kurzversion — Facetten gibt es nur mit allen 120 Fragen" |

## Domänen-Kurzreferenz (N E O A C)

- **N Neurotizismus** — emotionale Reaktivität. Hoch: sensibles Alarmsystem, Gefühle schlagen
  stärker aus. Niedrig: stabile Grundstimmung, ruhig unter Druck (kann Warnsignale übersehen).
- **E Extraversion** — Energie nach außen. Hoch: gesellig, durchsetzungsstark, erlebnishungrig.
  Niedrig: reserviert, unabhängig, lädt allein (nicht automatisch schüchtern).
- **O Offenheit** — kognitive/ästhetische Breite. Hoch: neugierig, fantasievoll, hinterfragt.
  Niedrig: praktisch, bodenständig, Bewährtes trägt. Kein IQ-Maß.
- **A Verträglichkeit** — Kooperation vs. Wettbewerb. Hoch: vertrauensvoll, hilfsbereit,
  harmoniesuchend. Niedrig: skeptisch, konfrontationsbereit, verhandlungsstark (nicht „böse").
- **C Gewissenhaftigkeit** — Struktur/Selbststeuerung. Hoch: organisiert, verlässlich,
  zielstrebig. Niedrig: flexibel, spontan, improvisiert (nicht „faul").

## Facetten-Referenz (je 6 pro Domäne)

**N:** Angst (Alarmsystem) · Ärger (Zündschnur/Grenzen) · Niedergeschlagenheit (Stimmungstiefs,
nie klinisch deuten) · Selbstunsicherheit (Hemmung durch Bewertung) · Maßlosigkeit
(Impulskontrolle) · Verletzlichkeit (Funktionieren unter Akutdruck)

**E:** Freundlichkeit (Nähe zulassen) · Geselligkeit (Energie aus Gruppen) · Durchsetzung
(Führung übernehmen) · Aktivität (Grundtempo) · Erlebnishunger (Nervenkitzel) · Frohsinn
(Freude bricht leicht aus; niedrig ≠ unzufrieden)

**O:** Fantasie (innere Welt) · Ästhetik (Kunst/Schönheit als Bedürfnis) · Gefühlstiefe
(Emotions-Sensorium) · Abenteuerlust (Routinebruch) · Intellekt (Ideen/Theorien, kein IQ) ·
Werte-Offenheit (Konventionen hinterfragen vs. Tradition als Halt)

**A:** Vertrauen (Grundannahme über Menschen) · Aufrichtigkeit (geradlinig vs. strategisch) ·
Hilfsbereitschaft (da sein vs. Ressourcen schützen) · Kooperation (Ausgleich vs. Konfrontation) ·
Bescheidenheit (Understatement vs. Selbstmarketing) · Mitgefühl (mitfühlen vs. nüchtern urteilen)

**C:** Selbstwirksamkeit („ich krieg das hin") · Ordnung (Strukturbedarf) · Pflichtgefühl
(Zusagen binden) · Ehrgeiz (Latte hoch) · Selbstdisziplin (durchziehen) · Besonnenheit
(Denkzeit vor Handlung)

## App-Export lesen (paradise-b5-hd-*.json)

Struktur: `{ profileId, instrument, hdFeatures, bigFive: { domains, facets }, answersComplete }`

- `domains.N.average` = Mittel, `.percentile` = Näherungs-Perzentil, `.level` = Banding
- `facets.N[1..6]` = Facetten in fester Reihenfolge (siehe Referenz oben, 1→6)
- `hdFeatures` = Typ, Autorität, Zentren, Kanäle — nur für explorative Nebenbemerkungen nutzen
- `answersComplete: false` → Auswertung ablehnen, auf 120/120 verweisen

## Output-Format für Profil-Zusammenfassungen

1. **Ein-Satz-Bild** — das prägnanteste Muster zuerst (höchste + niedrigste Domäne kombiniert).
2. **Fünf Domänen** — je 1–2 Sätze, immer mit Trade-off, Perzentil einordnen.
3. **Facetten-Highlights** — nur die 3–5 auffälligsten (sehr hoch/niedrig oder Spannung
   innerhalb einer Domäne, z. B. hohe Durchsetzung + niedrige Geselligkeit).
4. **Caveats** — Messfehler, Selbstbericht, keine Diagnose (kurz, nicht belehrend).
5. Optional **HD-Brücke** — nur wenn Chart-Daten vorliegen, klar als explorativ markiert.

Referenz-Artikel für Nutzer: https://paradise.ventures/wissen/big-five-auswertung/
