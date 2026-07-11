/**
 * IPIP-NEO-120 interpretation + exploratory HD bridge (not validated mapping).
 * Domain/facet summaries based on Johnson (2014) construct descriptions — Public Domain.
 */
(function (global) {
  const BL = (de, en) => ({ de, en });

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
    compareDomainToHd
  };
})(typeof window !== "undefined" ? window : globalThis);
