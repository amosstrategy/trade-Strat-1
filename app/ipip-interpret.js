/**
 * IPIP-NEO-120 interpretation + exploratory HD bridge (not validated mapping).
 * Domain/facet summaries based on Johnson (2014) construct descriptions — Public Domain.
 */
(function (global) {
  const BL = (de, en) => ({ de, en });

  // Plain-language reading help for the score fields shown in the results UI.
  const FIELD_EXPLAIN = {
    mean: BL(
      "«Mittel x/5»: Durchschnitt deiner Antworten (1–5) für diesen Bereich. 3 = neutral beantwortet. Über 3 = eher zugestimmt, unter 3 = eher abgelehnt. Negativ formulierte Fragen werden vorher automatisch umgepolt.",
      "«Mean x/5»: average of your answers (1–5) for this area. 3 = answered neutrally. Above 3 = mostly agreed, below 3 = mostly disagreed. Reverse-keyed items are flipped automatically first."
    ),
    percentile: BL(
      "«Perzentil ~x»: Schätzung, wie viel Prozent einer großen Vergleichsstichprobe (Johnson, Internet-Norm, >600.000 Personen) niedriger liegen als du. Perzentil 70 heißt: ~70 % liegen darunter, ~30 % darüber. Es ist eine Einordnung, keine Note.",
      "«Percentile ~x»: estimate of how many percent of a large comparison sample (Johnson internet norms, >600,000 people) score lower than you. Percentile 70 means ~70% below, ~30% above. It is a placement, not a grade."
    ),
    level: BL(
      "«hoch / mittel / niedrig»: grobe Einteilung des Mittelwerts (über ~3,35 = hoch, unter ~2,65 = niedrig, dazwischen = mittel). Kein Wert ist «besser» — jede Ausprägung hat Stärken und Kosten.",
      "«high / average / low»: rough banding of the mean (above ~3.35 = high, below ~2.65 = low, in between = average). No score is «better» — every level has strengths and costs."
    ),
    facets: BL(
      "Jede Domäne besteht aus 6 Facetten (je 4 Fragen). Zwei Menschen mit gleichem Domänen-Wert können völlig verschiedene Facetten-Profile haben — die Facetten sind die eigentliche Auflösung des Tests.",
      "Each domain consists of 6 facets (4 questions each). Two people with the same domain score can have completely different facet profiles — the facets are the real resolution of this test."
    )
  };

  // 30 facet explanations in plain language (Johnson 2014 constructs, own wording).
  const FACET_EXPLAIN = {
    N: {
      1: BL("Angst: Wie leicht dein inneres Alarmsystem anspringt. Hoch = du siehst Risiken früh (und manchmal zu viele). Niedrig = du bleibst ruhig, übersiehst aber eher Warnsignale.",
            "Anxiety: how easily your inner alarm system fires. High = you spot risks early (sometimes too many). Low = you stay calm but may miss warning signs."),
      2: BL("Ärger: Wie schnell Frust und Reizbarkeit hochkochen. Hoch = kurze Zündschnur, klares Signal für verletzte Grenzen. Niedrig = langmütig, schluckt aber manchmal zu viel.",
            "Anger: how quickly frustration and irritability flare. High = short fuse, clear signal for crossed boundaries. Low = patient, but may swallow too much."),
      3: BL("Depression/Niedergeschlagenheit: Wie oft gedrückte Stimmung und Selbstzweifel auftauchen. Hoch = Stimmungstiefs sind vertraut. Niedrig = stabile Grundstimmung. (Kein klinisches Urteil!)",
            "Depression/low mood: how often dejection and self-doubt show up. High = low moods are familiar. Low = stable baseline mood. (Not a clinical judgment!)"),
      4: BL("Selbstunsicherheit: Wie stark dich Bewertung durch andere hemmt. Hoch = soziale Situationen kosten Überwindung. Niedrig = wenig Lampenfieber vor fremden Augen.",
            "Self-consciousness: how much evaluation by others inhibits you. High = social situations take effort. Low = little stage fright in front of strangers."),
      5: BL("Maßlosigkeit: Wie schwer Versuchungen zu widerstehen sind (Essen, Kaufen, Scrollen…). Hoch = Impulse gewinnen öfter. Niedrig = gute Impulskontrolle.",
            "Immoderation: how hard temptations are to resist (food, buying, scrolling…). High = impulses win more often. Low = good impulse control."),
      6: BL("Verletzlichkeit: Wie gut du unter akutem Druck funktionierst. Hoch = Stress kann dich kurzfristig überfluten. Niedrig = du bleibst im Chaos handlungsfähig.",
            "Vulnerability: how well you function under acute pressure. High = stress can flood you briefly. Low = you stay operational in chaos.")
    },
    E: {
      1: BL("Freundlichkeit/Wärme: Wie schnell du Nähe zulässt und auf Menschen zugehst. Hoch = du wirkst zugänglich und herzlich. Niedrig = reserviert, Nähe braucht Zeit.",
            "Friendliness/warmth: how quickly you allow closeness and approach people. High = approachable and warm. Low = reserved, closeness takes time."),
      2: BL("Geselligkeit: Wie viel Energie dir Gruppen und Trubel geben. Hoch = je mehr los ist, desto lebendiger wirst du. Niedrig = kleine Runden oder allein ist dir lieber.",
            "Gregariousness: how much energy groups and buzz give you. High = the more happening, the more alive you feel. Low = small circles or solitude preferred."),
      3: BL("Durchsetzung: Wie selbstverständlich du Führung und das Wort übernimmst. Hoch = du gibst Richtung vor. Niedrig = du lässt andere vorangehen und wirkst im Hintergrund.",
            "Assertiveness: how naturally you take charge and speak up. High = you set direction. Low = you let others lead and work in the background."),
      4: BL("Aktivität: Dein Grundtempo. Hoch = immer in Bewegung, volle Agenda. Niedrig = gemächlicher Rhythmus, bewusst leere Slots.",
            "Activity level: your base tempo. High = always in motion, full agenda. Low = unhurried rhythm, deliberately empty slots."),
      5: BL("Erlebnishunger: Wie stark dich Nervenkitzel und Neues ziehen. Hoch = Reiz, Risiko, Abenteuer. Niedrig = du brauchst keinen Kick, Vertrautes trägt.",
            "Excitement-seeking: how strongly thrill and novelty pull you. High = stimulation, risk, adventure. Low = no kick needed, the familiar carries you."),
      6: BL("Frohsinn: Wie leicht Freude, Lachen und Begeisterung bei dir ausbrechen. Hoch = ansteckende gute Laune. Niedrig = ernster Grundton — sagt nichts über Zufriedenheit!",
            "Cheerfulness: how easily joy, laughter, enthusiasm break out. High = contagious good mood. Low = more serious baseline — says nothing about contentment!")
    },
    O: {
      1: BL("Fantasie: Wie lebendig deine innere Welt ist. Hoch = Tagträume, Szenarien, Kopfkino als Ressource. Niedrig = du bleibst im Konkreten verankert.",
            "Imagination: how vivid your inner world is. High = daydreams, scenarios, mental cinema as a resource. Low = anchored in the concrete."),
      2: BL("Ästhetik: Wie stark Kunst, Musik, Schönheit dich berühren. Hoch = Schönheit ist ein echtes Bedürfnis. Niedrig = Funktion schlägt Form.",
            "Artistic interests: how strongly art, music, beauty move you. High = beauty is a real need. Low = function beats form."),
      3: BL("Gefühlstiefe: Wie bewusst und differenziert du Emotionen (eigene wie fremde) wahrnimmst. Hoch = feines Sensorium. Niedrig = Gefühle laufen eher unbeachtet mit.",
            "Emotionality: how consciously and finely you register emotions (yours and others'). High = fine sensorium. Low = feelings run mostly unnoticed."),
      4: BL("Abenteuerlust (Neues): Wie gern du Routinen brichst — Reisen, Essen, Wege. Hoch = Abwechslung als Grundnahrung. Niedrig = Bewährtes gibt dir Kraft und Effizienz.",
            "Adventurousness: how gladly you break routines — travel, food, paths. High = variety as staple. Low = the proven gives you strength and efficiency."),
      5: BL("Intellekt: Wie sehr dich Ideen, Theorien und Denk-Herausforderungen anziehen. Hoch = du spielst gern mit Abstraktem. Niedrig = pragmatisch, Hauptsache es funktioniert. (Kein IQ-Maß!)",
            "Intellect: how much ideas, theories, mental challenges attract you. High = you enjoy playing with abstractions. Low = pragmatic, as long as it works. (Not an IQ measure!)"),
      6: BL("Liberalismus (Werte-Offenheit): Wie bereit du bist, Autoritäten und Konventionen in Frage zu stellen. Hoch = hinterfragt Regeln grundsätzlich. Niedrig = Tradition und Ordnung geben Halt.",
            "Liberalism (value openness): how ready you are to question authority and convention. High = questions rules on principle. Low = tradition and order give stability.")
    },
    A: {
      1: BL("Vertrauen: Deine Grundannahme über Menschen. Hoch = du gehst von guten Absichten aus. Niedrig = du prüfst erst — schützt vor Ausnutzung, kostet aber Nähe.",
            "Trust: your default assumption about people. High = you assume good intentions. Low = you verify first — protects against exploitation, costs closeness."),
      2: BL("Aufrichtigkeit: Wie geradlinig du agierst. Hoch = kein Taktieren, keine Manipulation. Niedrig = du kannst strategisch auftreten und Eindrücke steuern.",
            "Morality/straightforwardness: how direct you operate. High = no scheming, no manipulation. Low = you can act strategically and manage impressions."),
      3: BL("Hilfsbereitschaft: Wie selbstverständlich du für andere da bist. Hoch = Helfen erfüllt dich. Niedrig = du hilfst gezielt, achtest aber auf deine Ressourcen.",
            "Altruism: how naturally you show up for others. High = helping fulfills you. Low = you help selectively and guard your resources."),
      4: BL("Kooperation: Wie du mit Konflikt umgehst. Hoch = du suchst den Ausgleich, gibst nach. Niedrig = du gehst Konfrontation nicht aus dem Weg und setzt dich durch.",
            "Cooperation: how you handle conflict. High = you seek accommodation, yield. Low = you don't avoid confrontation and push through."),
      5: BL("Bescheidenheit: Wie sehr du dich selbst in den Vordergrund stellst. Hoch = understatement, Bühne für andere. Niedrig = gesundes Selbstmarketing fällt dir leicht.",
            "Modesty: how much you put yourself forward. High = understatement, stage for others. Low = healthy self-promotion comes easily."),
      6: BL("Mitgefühl: Wie stark fremdes Leid dich bewegt. Hoch = du fühlst mit und willst lindern. Niedrig = du urteilst nüchtern nach Fakten statt nach Rührung.",
            "Sympathy: how strongly others' suffering moves you. High = you feel with them and want to ease it. Low = you judge soberly by facts, not by being moved.")
    },
    C: {
      1: BL("Selbstwirksamkeit: Dein Zutrauen, Dinge hinzubekommen. Hoch = «ich krieg das hin» als Grundgefühl. Niedrig = mehr Selbstzweifel vor Aufgaben — oft gepaart mit Gründlichkeit.",
            "Self-efficacy: your confidence in getting things done. High = «I can handle this» as baseline. Low = more self-doubt before tasks — often paired with thoroughness."),
      2: BL("Ordnung: Wie viel Struktur du in deiner Umgebung brauchst und erzeugst. Hoch = System, Listen, aufgeräumt. Niedrig = kreatives Chaos stört dich nicht.",
            "Orderliness: how much structure you need and create around you. High = systems, lists, tidy. Low = creative chaos doesn't bother you."),
      3: BL("Pflichtgefühl: Wie bindend Zusagen und Regeln für dich sind. Hoch = dein Wort gilt, immer. Niedrig = Regeln sind Empfehlungen — Flexibilität vor Prinzip.",
            "Dutifulness: how binding promises and rules are for you. High = your word holds, always. Low = rules are suggestions — flexibility over principle."),
      4: BL("Ehrgeiz: Wie hoch du die Latte legst. Hoch = mehr als erwartet liefern, Ziele treiben dich. Niedrig = gut genug ist gut genug — entspannter, aber weniger Zug.",
            "Achievement-striving: how high you set the bar. High = deliver more than expected, goals drive you. Low = good enough is good enough — relaxed, less drive."),
      5: BL("Selbstdisziplin: Wie gut du Angefangenes gegen Widerstand durchziehst. Hoch = du beendest, was du beginnst. Niedrig = Anlaufschwierigkeiten und offene Enden sind vertraut.",
            "Self-discipline: how well you push through resistance to finish. High = you finish what you start. Low = slow starts and loose ends are familiar."),
      6: BL("Besonnenheit: Wie lange du denkst, bevor du handelst. Hoch = erst prüfen, dann springen. Niedrig = schnell entscheiden, notfalls korrigieren — gut für Tempo, riskant bei Tragweite.",
            "Cautiousness: how long you think before acting. High = check first, then leap. Low = decide fast, correct later — great for speed, risky for high stakes.")
    }
  };

  const DOMAIN_SUMMARY = {
    N: BL(
      "Neurotizismus misst emotionale Reaktivität — Sorgen, Stress, Stimmungsschwankungen. Hoch ≠ «krank», sondern sensitiveres Alarmsystem.",
      "Neuroticism measures emotional reactivity — worry, stress, mood shifts. High ≠ «ill», but a more sensitive alarm system."
    ),
    E: BL(
      "Extraversion misst Energie nach aussen — Geselligkeit, Durchsetzung, positive Emotion. Niedrig = eher introvertiert, nicht «schüchtern per se».",
      "Extraversion measures outward energy — sociability, assertiveness, positive emotion. Low = more introverted, not necessarily «shy»."
    ),
    O: BL(
      "Offenheit misst Neugier, Fantasie, intellektuelle und ästhetische Interessen — nicht «offen für alles», sondern kognitive/expressive Breite.",
      "Openness measures curiosity, imagination, intellectual and aesthetic interests — cognitive/expressive breadth, not «open to everything»."
    ),
    A: BL(
      "Verträglichkeit misst Kooperation, Vertrauen, Mitgefühl — niedrig kann wettbewerbsorientiert sein, nicht «böse».",
      "Agreeableness measures cooperation, trust, sympathy — low can mean competitive, not «mean»."
    ),
    C: BL(
      "Gewissenhaftigkeit misst Ordnung, Pflicht, Selbstdisziplin, Vorsicht — niedrig = flexibler/spontaner, nicht «faul per se».",
      "Conscientiousness measures order, duty, self-discipline, caution — low = more flexible/spontaneous, not necessarily «lazy»."
    )
  };

  function buildHdSnapshot(profile, record) {
    const chart = record?.chart;
    if (!chart?.definedCenters?.length) {
      return { hasChart: false };
    }
    return {
      hasChart: true,
      type: chart.type,
      authority: chart.authority,
      strategy: chart.strategy,
      profile: chart.profile,
      definedCenters: chart.definedCenters || [],
      channels: chart.channels || [],
      personalityLine: chart.personalityLine,
      designLine: chart.designLine
    };
  }

  function compareDomainToHd(domain, level, hd) {
    if (!hd?.hasChart) return null;
    const high = level === "high";
    const low = level === "low";
    if (domain === "N") {
      if (high && hd.definedCenters.includes("Solar"))
        return BL(
          "Explorativ: hoher Neurotizismus + definierte Solarplexus-Welle im HD — beide betonen emotionale Amplitude; HD fokussiert Timing/Wartezeit, Big Five misst Trait-Niveau.",
          "Exploratory: high Neuroticism + defined Solar Plexus in HD — both emphasize emotional amplitude; HD focuses on timing/wait, Big Five measures trait level."
        );
      if (low && !hd.definedCenters.includes("Solar"))
        return BL(
          "Explorativ: niedriger Neurotizismus + offener Solarplexus — weniger trait-mäßige emotionale Schwankung; HD würde Umgebungs-Emotion stärker betonen.",
          "Exploratory: low Neuroticism + open Solar Plexus — less trait-level emotional volatility; HD would emphasize environmental emotion more."
        );
    }
    if (domain === "E") {
      if (high && (hd.type === "Manifestor" || hd.type === "Manifesting Generator"))
        return BL(
          "Explorativ: hohe Extraversion + Manifestor/MG — sichtbare Initiation nach aussen; unterschiedliche Modelle, ähnliche Alltagsbeobachtung möglich.",
          "Exploratory: high Extraversion + Manifestor/MG — visible outward initiation; different models, similar everyday observation possible."
        );
      if (low && hd.type === "Projector")
        return BL(
          "Explorativ: niedrige Extraversion + Projektor — Energieökonomie nach innen/Einladung; kein 1:1, aber beide können «selektiv sichtbar» sein.",
          "Exploratory: low Extraversion + Projector — energy economy inward/invitation; not 1:1, but both can feel «selectively visible»."
        );
    }
    if (domain === "O") {
      if (high && hd.definedCenters.includes("Head"))
        return BL(
          "Explorativ: hohe Offenheit + definiertes Kopf-Zentrum — Ideendruck/Inspirationsdruck im HD vs. Trait-Neugier im Big Five.",
          "Exploratory: high Openness + defined Head center — mental pressure/inspiration in HD vs. trait curiosity in Big Five."
        );
    }
    if (domain === "A") {
      if (high && hd.definedCenters.includes("G"))
        return BL(
          "Explorativ: hohe Verträglichkeit + definiertes G/Identitätszentrum — Richtung/Loyalität im HD vs. kooperativer Trait.",
          "Exploratory: high Agreeableness + defined G/Identity center — direction/loyalty in HD vs. cooperative trait."
        );
    }
    if (domain === "C") {
      if (high && hd.definedCenters.includes("Root"))
        return BL(
          "Explorativ: hohe Gewissenhaftigkeit + definierter Wurzel-Druck — HD: körperlicher Antriebsdruck; Big Five: strukturiertes Arbeiten.",
          "Exploratory: high Conscientiousness + defined Root pressure — HD: bodily drive pressure; Big Five: structured work style."
        );
      if (low && hd.type === "Generator")
        return BL(
          "Explorativ: niedrigere Gewissenhaftigkeit + Generator — HD betont Response statt Plan; Big Five misst Ordnungs-/Pflicht-Tendenz separat.",
          "Exploratory: lower Conscientiousness + Generator — HD emphasizes response over plan; Big Five measures order/duty tendency separately."
        );
    }
    return null;
  }

  function buildInterpretation(result, hd, lang) {
    const domainNotes = {};
    IPIP.DOMAIN_ORDER.forEach(domain => {
      const d = result.domains[domain];
      domainNotes[domain] = {
        summary: DOMAIN_SUMMARY[domain],
        compare: compareDomainToHd(domain, d.level, hd)
      };
    });

    const bridgeNotes = [];
    if (hd?.hasChart) {
      IPIP.DOMAIN_ORDER.forEach(domain => {
        const note = compareDomainToHd(domain, result.domains[domain].level, hd);
        if (note) bridgeNotes.push(note);
      });
      if (!bridgeNotes.length) {
        bridgeNotes.push(BL(
          "Keine starken explorativen Parallelen in der Heuristik — HD und Big Five bleiben getrennte Modelle. Für Forschung: dimensional vergleichen, nicht kategorial.",
          "No strong exploratory parallels in the heuristic — HD and Big Five remain separate models. For research: compare dimensionally, not categorically."
        ));
      }
    } else {
      bridgeNotes.push(BL(
        "HD-Chart unter «Eingabe» speichern, um explorativen Vergleich zu aktivieren.",
        "Save HD chart under «Input» to enable exploratory comparison."
      ));
    }

    return { domainNotes, bridgeNotes };
  }

  global.IPIPInterpret = {
    buildHdSnapshot,
    buildInterpretation,
    compareDomainToHd,
    FIELD_EXPLAIN,
    FACET_EXPLAIN,
    DOMAIN_SUMMARY
  };
})(typeof window !== "undefined" ? window : globalThis);
