/**
 * OEJTS interpretation layer — Jungian deutung with optional HD parallels in parentheses.
 * Jung concepts: public domain. HD parallels: mechanical chart read, not 1:1 claims.
 */
(function (global) {
  const BL = (de, en) => ({ de, en });

  const POLE_JUNG = {
    E: BL(
      "Extraversion (Jung): Libido fließt nach aussen — du lädst dich durch Kontakt, Austausch und sichtbare Beteiligung auf. Denken wird oft laut sortiert.",
      "Extraversion (Jung): Libido flows outward — you recharge through contact, exchange, and visible participation. Thinking is often sorted aloud."
    ),
    I: BL(
      "Introversion (Jung): Libido zieht nach innen — du brauchst Raum, um Eindrücke zu verdauen. Klarheit entsteht oft erst in Ruhe, bevor du nach aussen gehst.",
      "Introversion (Jung): Libido turns inward — you need space to digest impressions. Clarity often comes in stillness before you go outward."
    ),
    S: BL(
      "Sensing (Jung): Die Sinnesfunktion vertraut dem Konkreten — was messbar, erfahrbar und jetzt ist. Details und Bewährung zählen.",
      "Sensing (Jung): The sensing function trusts the concrete — what is measurable, experiential, and present. Details and proven reality matter."
    ),
    N: BL(
      "Intuition (Jung): Die Intuitionsfunktion liest Muster, Möglichkeiten und Zusammenhänge jenseits des Offensichtlichen — das «Noch nicht Sichtbare».",
      "Intuition (Jung): The intuitive function reads patterns, possibilities, and connections beyond the obvious — the not-yet-visible."
    ),
    F: BL(
      "Feeling (Jung): Die Gefühlsfunktion wertet über Beziehung, Harmonie und menschliche Wirkung — nicht «emotional», sondern wertorientiert.",
      "Feeling (Jung): The feeling function evaluates through relationship, harmony, and human impact — not «emotional», but values-oriented."
    ),
    T: BL(
      "Thinking (Jung): Die Denkfunktion ordnet über Logik, Struktur und unpersönliche Klarheit — fair, analysierbar, kausal.",
      "Thinking (Jung): The thinking function orders through logic, structure, and impersonal clarity — fair, analyzable, causal."
    ),
    J: BL(
      "Judging (Jung/MBTI): Bevorzugt Abschluss, Plan und Entscheidung — lieber Klarheit als offene Enden.",
      "Judging (Jung/MBTI): Prefers closure, plan, and decision — clarity over open endings."
    ),
    P: BL(
      "Perceiving (Jung/MBTI): Bevorzugt Offenheit, Sammeln und Anpassen — lieber Optionen halten als zu früh festlegen.",
      "Perceiving (Jung/MBTI): Prefers openness, gathering, and adapting — keeping options over fixing too early."
    )
  };

  const COMM_JUNG = {
    E: BL(
      "Kommunikation: du denkst mit anderen, sprichst zum Sortieren, brauchst Resonanz im Raum.",
      "Communication: you think with others, speak to sort, need resonance in the room."
    ),
    I: BL(
      "Kommunikation: du brauchst Vorlauf, hörst tief zu, teilst erst wenn es innerlich reif ist.",
      "Communication: you need lead time, listen deeply, share only when inwardly ripe."
    )
  };

  const DECIDE_JUNG = {
    F: BL(
      "Entscheiden: über Werte, Wirkung auf Menschen und «stimmt das für mich?».",
      "Deciding: via values, impact on people, and «does this fit me?»."
    ),
    T: BL(
      "Entscheiden: über Kriterien, Logik und «macht das Sinn?» — auch wenn es unpersönlich wirkt.",
      "Deciding: via criteria, logic, and «does this make sense?» — even when it feels impersonal."
    ),
    J: BL(
      "Tempo: lieber entscheiden und committen, dann umsetzen.",
      "Pace: prefer to decide and commit, then execute."
    ),
    P: BL(
      "Tempo: lieber sammeln und probieren, Entscheidung verschieben bis mehr da ist.",
      "Pace: prefer to gather and try, delay decision until more is present."
    )
  };

  const LEARN_JUNG = {
    S: BL(
      "Lernen: Schritt für Schritt, Beispiele, Praxis, Wiederholung — «zeig es mir».",
      "Learning: step by step, examples, practice, repetition — «show me»."
    ),
    N: BL(
      "Lernen: Überblick zuerst, Metaphern, Theorie, dann Details — «warum?».",
      "Learning: overview first, metaphors, theory, then details — «why?»."
    )
  };

  function hasCenter(hd, c) {
    return hd?.definedCenters?.includes(c);
  }

  function hdType(hd) {
    return hd?.type || "";
  }

  function parallelEI(pref, hd) {
    if (!hd?.hasChart) return null;
    const t = hdType(hd);
    if (pref === "E") {
      if (t === "Manifestor" || t === "Manifesting Generator")
        return BL("HD: Manifestor/MG — Motor zur Kehle, nach aussen sichtbar handeln/sprechen", "HD: Manifestor/MG — motor to throat, act/speak visibly outward");
      if (hasCenter(hd, "Throat") && hasCenter(hd, "Sacral"))
        return BL("HD: definierte Kehle + Sakral — Ausdruck folgt koerperlicher Response", "HD: defined Throat + Sacral — expression follows bodily response");
      if (hasCenter(hd, "Throat"))
        return BL("HD: definierte Kehle — konsistenter Ausdruckskanal", "HD: defined Throat — consistent expression channel");
      return BL("HD: eher nach aussen gerichtete Sozialenergie moeglich — pruefe definierte Kehle/Motor", "HD: more outward social energy possible — check defined Throat/motor");
    }
    if (pref === "I") {
      if (t === "Projector")
        return BL("HD: Projektor — Strategie «Einladung abwarten», Energie nach innen vor Anerkennung", "HD: Projector — strategy «wait for invitation», inward before recognition");
      if (t === "Reflector")
        return BL("HD: Reflektor — Mondzyklus, Sampling statt konstantem Fixpunkt", "HD: Reflector — lunar cycle, sampling not fixed output");
      if (!hasCenter(hd, "Throat"))
        return BL("HD: offene Kehle — Stimme oft situativ, nicht dauerhaft «sendend»", "HD: open Throat — voice often situational, not always «broadcasting»");
      return BL("HD: Introversions-Rhythmus — Ruhe entlaedt offene Zentren", "HD: introversion rhythm — rest discharges open centers");
    }
    return null;
  }

  function parallelSN(pref, hd) {
    if (!hd?.hasChart) return null;
    if (pref === "S") {
      if (hasCenter(hd, "Sacral"))
        return BL("HD: Sakral — Response auf das reale Hier-und-jetzt", "HD: Sacral — response to real here-and-now");
      if (hasCenter(hd, "Spleen"))
        return BL("HD: Milz — koerperliches Jetzt, Instinkt im Moment", "HD: Spleen — bodily now, instinct in the moment");
      if (hd.personalityLine === 3 || hd.designLine === 3)
        return BL("HD: Profil-Linie 3 — lernen durch direkte Erfahrung", "HD: profile line 3 — learn through direct experience");
      return BL("HD: konkrete Tore/Kanaele im Chart pruefen — Sensing oft am Koerper verankert", "HD: check concrete gates/channels — sensing often body-anchored");
    }
    if (pref === "N") {
      if (hasCenter(hd, "Head") || hasCenter(hd, "Ajna"))
        return BL("HD: Kopf/Ajna definiert — Inspiration und mentale Modelle", "HD: defined Head/Ajna — inspiration and mental models");
      if (hasCenter(hd, "G") === false)
        return BL("HD: offenes G — Richtung/Identitaet aus Umgebung und Moeglichkeiten", "HD: open G — direction/identity from environment and possibilities");
      if ([1, 4, 5].includes(hd.personalityLine) || [1, 4, 5].includes(hd.designLine))
        return BL("HD: Linie 1/4/5 — Muster, Netzwerk oder Projektion von Moeglichkeiten", "HD: lines 1/4/5 — patterns, network, or projecting possibilities");
      return BL("HD: abstrakte Tore (z.B. 61, 11, 43) im Gate-Pool suchen", "HD: look for abstract gates (e.g. 61, 11, 43) in gate pool");
    }
    return null;
  }

  function parallelTF(pref, hd) {
    if (!hd?.hasChart) return null;
    const auth = hd.authority || "";
    if (pref === "F") {
      if (auth === "Emotional")
        return BL("HD: emotionale Autoritaet — ganze Welle abwarten", "HD: emotional authority — wait the full wave");
      if (hasCenter(hd, "Solar") && !auth.includes("Emotional"))
        return BL("HD: Solarplexus definiert — Stimmungsfeld faerbt Entscheidungen", "HD: defined Solar Plexus — mood field colors decisions");
      if (auth === "Sacral")
        return BL("HD: Sakral-Autoritaet — koerperliches «uh-huh/uhn-uhn», wertet ueber Resonanz", "HD: sacral authority — bodily uh-huh/uhn-uhn, values via resonance");
      return BL("HD: offener Solarplexus — Fremdstimmungen verstaerken (nicht automatisch «deins»)", "HD: open Solar — amplifies others' moods (not automatically «yours»)");
    }
    if (pref === "T") {
      if (auth === "Splenic")
        return BL("HD: Milz-Autoritaet — einmaliges koerperliches Ja/Nein", "HD: splenic authority — one-time bodily yes/no");
      if (auth === "Mental")
        return BL("HD: mentale Autoritaet — Klarheit durch Gespraech/Umgebung, nicht allein im Kopf", "HD: mental authority — clarity through dialogue/environment, not alone in head");
      if (hasCenter(hd, "Ajna"))
        return BL("HD: definiertes Ajna — feste Meinungs- und Konzeptspur", "HD: defined Ajna — fixed opinion/concept track");
      if (auth === "Ego Projected" || hasCenter(hd, "Ego"))
        return BL("HD: Ego/Willens-Autoritaet — Commitment und Ressourcenlogik", "HD: ego/will authority — commitment and resource logic");
      return BL("HD: Thinking oft ueber definiertes Ajna oder projizierte Autoritaet", "HD: thinking often via defined Ajna or projected authority");
    }
    return null;
  }

  function parallelJP(pref, hd) {
    if (!hd?.hasChart) return null;
    const strat = hd.strategy || "";
    const t = hdType(hd);
    if (pref === "J") {
      if (strat === "Inform")
        return BL("HD: Manifestor — informieren, dann abschliessen/handeln", "HD: Manifestor — inform, then close/act");
      if (strat === "To Respond" && hasCenter(hd, "Sacral"))
        return BL("HD: Generator — Sakral-Ja = Commitment, klares Ende der Response", "HD: Generator — sacral yes = commitment, clear end to response");
      if (hasCenter(hd, "Ego"))
        return BL("HD: definiertes Ego — Versprechen und Abschluss bewusst setzen", "HD: defined Ego — promises and closure set consciously");
      return BL("HD: Struktur ueber Strategie/Autoritaet statt offene Enden", "HD: structure via strategy/authority over open endings");
    }
    if (pref === "P") {
      if (strat === "Wait for Invitation")
        return BL("HD: Projektor — warten, bis der Moment/ die Einladung reif ist", "HD: Projector — wait until moment/invitation is ripe");
      if (strat === "Wait Lunar Cycle")
        return BL("HD: Reflektor — 28-Tage-Zyklus, kein sofortiges Fixieren", "HD: Reflector — 28-day cycle, no instant fixing");
      const openCount = 9 - (hd.definedCenters?.length || 0);
      if (openCount >= 5)
        return BL(`HD: ${openCount} offene Zentren — flexibles Sampling, viel Raum lassen`, `HD: ${openCount} open centers — flexible sampling, leave room`);
      return BL("HD: Perceiving-Rhythmus — nicht jedes Tor/Zentrum muss sofort entschieden sein", "HD: perceiving rhythm — not every gate/center must be decided now");
    }
    return null;
  }

  const PARALLEL_FN = { E: parallelEI, I: parallelEI, S: parallelSN, N: parallelSN, F: parallelTF, T: parallelTF, J: parallelJP, P: parallelJP };

  function mergeParallel(jungBL, parallelBL) {
    if (!parallelBL || (!parallelBL.de && !parallelBL.en)) return jungBL;
    return { de: `${jungBL.de} (${parallelBL.de})`, en: `${jungBL.en} (${parallelBL.en})` };
  }

  function typeFunctionNote(type) {
    const notes = {
      INTJ: BL("Dominant: introvertierte Intuition · Hilfsfunktion: extravertiertes Denken — Vision strukturieren.", "Dominant: introverted intuition · Auxiliary: extraverted thinking — structure vision."),
      INTP: BL("Dominant: introvertiertes Denken · Hilfsfunktion: extravertierte Intuition — Modelle oeffnen.", "Dominant: introverted thinking · Auxiliary: extraverted intuition — open models."),
      ENTJ: BL("Dominant: extravertiertes Denken · Hilfsfunktion: introvertierte Intuition — Richtung durchsetzen.", "Dominant: extraverted thinking · Auxiliary: introverted intuition — drive direction."),
      ENTP: BL("Dominant: extravertierte Intuition · Hilfsfunktion: introvertiertes Denken — Ideen challengen.", "Dominant: extraverted intuition · Auxiliary: introverted thinking — challenge ideas."),
      INFJ: BL("Dominant: introvertierte Intuition · Hilfsfunktion: extravertiertes Fühlen — Bedeutung fuer Menschen.", "Dominant: introverted intuition · Auxiliary: extraverted feeling — meaning for people."),
      INFP: BL("Dominant: introvertiertes Fühlen · Hilfsfunktion: extravertierte Intuition — Werte leben.", "Dominant: introverted feeling · Auxiliary: extraverted intuition — live values."),
      ENFJ: BL("Dominant: extravertiertes Fühlen · Hilfsfunktion: introvertierte Intuition — andere entfalten.", "Dominant: extraverted feeling · Auxiliary: introverted intuition — unfold others."),
      ENFP: BL("Dominant: extravertierte Intuition · Hilfsfunktion: introvertiertes Fühlen — Moeglichkeiten verbinden.", "Dominant: extraverted intuition · Auxiliary: introverted feeling — connect possibilities."),
      ISTJ: BL("Dominant: introvertierte Sensierung · Hilfsfunktion: extravertiertes Denken — Bewaehrtes ordnen.", "Dominant: introverted sensing · Auxiliary: extraverted thinking — order what works."),
      ISFJ: BL("Dominant: introvertierte Sensierung · Hilfsfunktion: extravertiertes Fühlen — Fuersorge im Detail.", "Dominant: introverted sensing · Auxiliary: extraverted feeling — care in detail."),
      ESTJ: BL("Dominant: extravertiertes Denken · Hilfsfunktion: introvertierte Sensierung — Systeme laufen lassen.", "Dominant: extraverted thinking · Auxiliary: introverted sensing — run systems."),
      ESFJ: BL("Dominant: extravertiertes Fühlen · Hilfsfunktion: introvertierte Sensierung — Gruppe stabilisieren.", "Dominant: extraverted feeling · Auxiliary: introverted sensing — stabilize group."),
      ISTP: BL("Dominant: introvertiertes Denken · Hilfsfunktion: extravertierte Sensierung — Praxis, Coolness.", "Dominant: introverted thinking · Auxiliary: extraverted sensing — craft, coolness."),
      ISFP: BL("Dominant: introvertiertes Fühlen · Hilfsfunktion: extravertierte Sensierung — Aesthetik im Moment.", "Dominant: introverted feeling · Auxiliary: extraverted sensing — aesthetics in moment."),
      ESTP: BL("Dominant: extravertierte Sensierung · Hilfsfunktion: introvertiertes Denken — handeln, anpassen.", "Dominant: extraverted sensing · Auxiliary: introverted thinking — act, adapt."),
      ESFP: BL("Dominant: extravertierte Sensierung · Hilfsfunktion: introvertiertes Fühlen — Freude teilen.", "Dominant: extraverted sensing · Auxiliary: introverted feeling — share joy.")
    };
    return notes[type] || BL("Vier Buchstaben = vier Praeferenzen — keine starre Schublade.", "Four letters = four preferences — not a rigid box.");
  }

  function typeHdParallel(type, hd) {
    if (!hd?.hasChart) return null;
    const t = hdType(hd);
    const pairs = [];
    const first = type[0];
    if (first === "E" && (t === "Manifestor" || t === "Manifesting Generator"))
      pairs.push(BL("E + Manifestor/MG", "E + Manifestor/MG"));
    if (first === "I" && (t === "Projector" || t === "Reflector"))
      pairs.push(BL("I + Projektion/Reflektion", "I + Projector/Reflector"));
    if (type[1] === "N" && (hasCenter(hd, "Head") || hasCenter(hd, "Ajna")))
      pairs.push(BL("N + Kopf/Ajna definiert", "N + defined Head/Ajna"));
    if (type[1] === "S" && (hasCenter(hd, "Sacral") || hasCenter(hd, "Spleen")))
      pairs.push(BL("S + Sakral/Milz", "S + Sacral/Spleen"));
    if (type[2] === "F" && hd.authority === "Emotional")
      pairs.push(BL("F + emotionale Autoritaet", "F + emotional authority"));
    if (type[2] === "T" && (hd.authority === "Splenic" || hasCenter(hd, "Ajna")))
      pairs.push(BL("T + Milz/Ajna", "T + Splenic/Ajna"));
    if (type[3] === "J" && (hd.strategy === "Inform" || hd.strategy === "To Respond"))
      pairs.push(BL("J + klare Strategie (Inform/Respond)", "J + clear strategy (Inform/Respond)"));
    if (type[3] === "P" && (hd.strategy === "Wait for Invitation" || hd.strategy === "Wait Lunar Cycle"))
      pairs.push(BL("P + Warten (Einladung/Mond)", "P + waiting (invitation/lunar)"));
    if (!pairs.length)
      return BL("Kein offensichtliches 1:1 — beide Lens trotzdem nebeneinander lesen.", "No obvious 1:1 — read both lenses side by side anyway.");
    return BL(
      "Moegliche Resonanzen: " + pairs.map(p => p.de).join(" · "),
      "Possible resonances: " + pairs.map(p => p.en).join(" · ")
    );
  }

  function buildInterpretation(result, hd, display) {
    const prefs = result.preferences;
    const dims = ["EI", "SN", "TF", "JP"].map(key => {
      const meta = global.OEJTS.DIMENSION_META[key];
      const pref = prefs[key];
      const pole = pref;
      const jungCore = POLE_JUNG[pole];
      const parallel = PARALLEL_FN[pole](pole, hd);
      return {
        key,
        pref: pole,
        label: mergeParallel(jungCore, parallel),
        communication: key === "EI" ? mergeParallel(COMM_JUNG[pole], parallel) : null,
        parallel
      };
    });

    const comm = mergeParallel(COMM_JUNG[prefs.EI], parallelEI(prefs.EI, hd));
    const decideParallels = [parallelTF(prefs.TF, hd), parallelJP(prefs.JP, hd)].filter(Boolean);
    const decideParallel = decideParallels.length
      ? BL(decideParallels.map(x => x.de).join(" · "), decideParallels.map(x => x.en).join(" · "))
      : null;
    const decide = mergeParallel(
      BL(
        `${DECIDE_JUNG[prefs.TF].de} ${DECIDE_JUNG[prefs.JP].de}`,
        `${DECIDE_JUNG[prefs.TF].en} ${DECIDE_JUNG[prefs.JP].en}`
      ),
      decideParallel
    );
    const learn = mergeParallel(LEARN_JUNG[prefs.SN], parallelSN(prefs.SN, hd));

    const chartNotes = [];
    if (hd?.hasChart) {
      const typeTxt = display?.typeLabel || hd.type || "—";
      const authTxt = display?.authorityLabel || hd.authority || "—";
      const stratTxt = display?.strategyLabel || hd.strategy || "—";
      chartNotes.push(BL(
        `HD-Typ: ${typeTxt} · Profil ${hd.profile || "—"} · Autoritaet ${authTxt} · Strategie ${stratTxt}.`,
        `HD type: ${typeTxt} · Profile ${hd.profile || "—"} · Authority ${authTxt} · Strategy ${stratTxt}.`
      ));
      const defCenters = display?.definedCentersLabels?.length
        ? display.definedCentersLabels.join(", ")
        : (hd.definedCenters?.join(", ") || "");
      if (defCenters) {
        chartNotes.push(BL(
          `Definierte Zentren: ${defCenters} — stabile, wiederkehrende Energie.`,
          `Defined centers: ${defCenters} — stable, recurring energy.`
        ));
      }
      const openLabels = display?.openCentersLabels;
      const open = openLabels?.length
        ? openLabels.join(", ")
        : ["Head", "Ajna", "Throat", "G", "Ego", "Spleen", "Solar", "Sacral", "Root"].filter(c => !hd.definedCenters?.includes(c)).join(", ");
      if (open) {
        chartNotes.push(BL(
          `Offene Zentren: ${open} — hier nimmst du Feldenergie auf (nicht «dein Fixpunkt»).`,
          `Open centers: ${open} — here you take in field energy (not «your fixed point»).`
        ));
      }
    }

    return {
      dims,
      typeFunctions: typeFunctionNote(result.type),
      typeHdParallel: typeHdParallel(result.type, hd),
      communication: comm,
      decision: decide,
      learning: learn,
      chartNotes,
      dimensionDeutung: {
        EI: mergeParallel(POLE_JUNG[prefs.EI], parallelEI(prefs.EI, hd)),
        SN: mergeParallel(POLE_JUNG[prefs.SN], parallelSN(prefs.SN, hd)),
        TF: mergeParallel(POLE_JUNG[prefs.TF], parallelTF(prefs.TF, hd)),
        JP: mergeParallel(POLE_JUNG[prefs.JP], parallelJP(prefs.JP, hd))
      }
    };
  }

  function buildHdSnapshot(profile, record) {
    if (!profile?.chartComputed || !record?.chart) return { hasChart: false };
    const c = record.chart;
    return {
      hasChart: true,
      type: c.type || "",
      authority: c.authority || "",
      strategy: c.strategy || "",
      profile: c.profile || profile.profileKey || "",
      personalityLine: c.personalityLine || profile.personalityLine,
      designLine: c.designLine || profile.designLine,
      definedCenters: [...(c.definedCenters || profile.definedCenters || [])],
      definedGates: c.definedGates || profile.definedGates || []
    };
  }

  global.OEJTSInterpret = {
    buildInterpretation,
    buildHdSnapshot,
    mergeParallel,
    POLE_JUNG
  };
})(typeof window !== "undefined" ? window : globalThis);
