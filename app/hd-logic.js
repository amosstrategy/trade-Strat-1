/**
 * Human Design app logic — profile database, chart pipeline, view model, bodygraph.
 */
(function (global) {
  const CHART_ENGINE_VERSION = 7;
  const PROFILE_DB_KEY = "hd-profile-db-v2";
  const LEGACY_DB_KEYS = ["hd-profile-db-v1", "hd-profile-meta-v1"];

  const HD_LOGIC_DB = {
    views: {
      full: {
        id: "full",
        label: { de: "Chart + Transite", en: "Chart + transits" },
        transitPanel: true
      },
      chartOnly: {
        id: "chartOnly",
        label: { de: "Nur Chart", en: "Chart only" },
        transitPanel: false
      }
    }
  };

  function birthFingerprint(birth) {
    if (!birth?.birthDate || !birth?.birthTime) return null;
    return `${birth.birthDate}|${birth.birthTime}|${birth.tzOffsetMinutes ?? ""}`;
  }

  /** Chart record stored in profile DB — raw engine output + display fields from UI formatters. */
  function chartRecordFromEngine(result, displayFields) {
    if (!result || result.error) return null;
    return {
      personalityGates: result.personalityGates,
      designGates: result.designGates,
      definedGates: result.definedGates,
      definedCenters: result.definedCenters,
      personality: result.personality,
      design: result.design,
      profileKey: result.profile,
      personalityLine: result.personalityLine,
      designLine: result.designLine,
      solarArcDegrees: result.solarArcDegrees,
      subtitle: displayFields?.subtitle || null,
      authority: displayFields?.authority || null,
      strategy: displayFields?.strategy || null,
      chartComputed: true,
      engineVersion: CHART_ENGINE_VERSION,
      savedAt: new Date().toISOString()
    };
  }

  function createChartPipeline({ calculateChart }) {
    return {
      compute(birth, channels) {
        if (!birth?.birthDate || !birth?.birthTime) return { error: "missing_birth" };
        return calculateChart(birth.birthDate, birth.birthTime, birth.tzOffsetMinutes, channels);
      },
      toRecord(engineResult, displayFields) {
        return chartRecordFromEngine(engineResult, displayFields);
      }
    };
  }

  function buildChartLayer(profile, channelDefs) {
    if (!profile.chartComputed) {
      return {
        personalityGates: [],
        designGates: [],
        allGates: [],
        gateSet: new Set(),
        nativeChannels: [],
        definedCenters: [],
        gateCount: 0,
        centerCount: 0,
        channelCount: 0
      };
    }
    const personalityGates = [...(profile.personalityGates || [])];
    const designGates = [...(profile.designGates || [])];
    const personality = new Set(personalityGates);
    const design = new Set(designGates);
    const allGates = [...new Set([...personality, ...design])];
    const gateSet = new Set(profile.definedGates || allGates);
    const nativeChannels = channelDefs
      .filter(ch => gateSet.has(ch.a) && gateSet.has(ch.b))
      .map(ch => ({ ...ch, completedByTransit: false, nativeChannel: true }));
    return {
      personalityGates,
      designGates,
      allGates,
      gateSet,
      nativeChannels,
      definedCenters: profile.definedCenters || [],
      gateCount: allGates.length,
      centerCount: (profile.definedCenters || []).length,
      channelCount: nativeChannels.length
    };
  }

  function buildTransitLayer(profile, transits, channelDefs) {
    const transitGates = new Set(transits.map(t => t.gate));
    const personal = new Set(profile.definedGates || []);
    const activatedChannels = [];
    channelDefs.forEach(channel => {
      const personalA = personal.has(channel.a);
      const personalB = personal.has(channel.b);
      const transitA = transitGates.has(channel.a);
      const transitB = transitGates.has(channel.b);
      const completedByTransit = (personalA && transitB) || (personalB && transitA);
      const nativeChannel = personalA && personalB;
      if (completedByTransit || nativeChannel) {
        activatedChannels.push({ ...channel, completedByTransit, nativeChannel });
      }
    });
    return {
      transits,
      gates: [...transitGates],
      gateSet: transitGates,
      activatedChannels,
      completedChannels: activatedChannels.filter(ch => ch.completedByTransit),
      planetCount: transits.length,
      gateCount: transitGates.size,
      channelCount: activatedChannels.length
    };
  }

  function composeDisplay(showTransits, chart, transit, fullDisplay, chartDisplay) {
    const view = showTransits ? HD_LOGIC_DB.views.full : HD_LOGIC_DB.views.chartOnly;
    if (showTransits) {
      return {
        ...fullDisplay,
        view,
        mode: "full",
        transits: transit.transits,
        transitGates: transit.gateSet,
        activatedChannels: transit.activatedChannels,
        completedChannels: transit.completedChannels
      };
    }
    return {
      ...chartDisplay,
      view,
      mode: "chartOnly",
      transits: [],
      transitGates: new Set(),
      activatedChannels: chart.nativeChannels,
      completedChannels: []
    };
  }

  function buildHydrationCSS(chart, transit, showTransits, bodygraphChannels, centerSvgId) {
    const personality = new Set(chart.personalityGates);
    const design = new Set(chart.designGates);
    const transitGates = showTransits ? transit.gateSet : new Set();
    const chartGateSet = chart.gateSet;

    const personalityOnly = new Set([...personality].filter(g => !design.has(g) && !transitGates.has(g)));
    const designOnly = new Set([...design].filter(g => !personality.has(g) && !transitGates.has(g)));
    const bothSides = new Set([...personality].filter(g => design.has(g) && !transitGates.has(g)));
    const transitOnly = new Set([...transitGates].filter(g => !personality.has(g) && !design.has(g)));
    const transitOverlap = new Set([...chartGateSet].filter(g => transitGates.has(g)));

    const pOnlyChan = [];
    const dOnlyChan = [];
    const bothChan = [];
    const nativeChan = [];

    for (const [x, y] of bodygraphChannels) {
      const pA = chartGateSet.has(x);
      const pB = chartGateSet.has(y);
      const tA = transitGates.has(x);
      const tB = transitGates.has(y);
      if (showTransits) {
        if (tA && tB && pA && pB) bothChan.push([x, y]);
        else if (tA && tB) dOnlyChan.push([x, y]);
        else if (pA && pB) pOnlyChan.push([x, y]);
      } else if (pA && pB) {
        nativeChan.push([x, y]);
      }
    }

    const rules = [];
    rules.push(":root{--profile:#a89488;--gate:#9aa3b0;--gate-stroke:#d4b06a;--gate-text:#c5cdd8;--center:#8b95a3;--center-stroke:#6fcf97;--center-defined:#d7a4ff;--d:#5bdcb8;--p:#d7a4ff;--design:#5bdcb8}");
    rules.push(".go{stroke:var(--gate-stroke);stroke-width:1.4}");
    rules.push("text{fill:var(--gate-text)}");

    const gateAB = set => [...set].flatMap(n => [`#Gate${n}-a`, `#Gate${n}-b`]);
    const intAB = (arr, s) => arr.map(([x, y]) => `#Integration${x}-${y}-${s}`);
    const emitInt = arr => {
      arr.forEach(([x, y]) => {
        if (x === 20 && y === 57) return;
        rules.push(`#Integration${x}-${y}-a,#Integration${x}-${y}-b,#Integration${x}-${y}-outline{display:block;}`);
      });
    };

    if (showTransits) {
      const tSel = [...gateAB(transitOnly), ...intAB(dOnlyChan, "a"), ...intAB(dOnlyChan, "b")];
      if (tSel.length) rules.push(`${tSel.join(",")}{fill:var(--d)}`);
      emitInt(dOnlyChan);
      const pSel = [...gateAB(personalityOnly), ...gateAB(designOnly), ...intAB(pOnlyChan, "a"), ...intAB(pOnlyChan, "b")];
      if (pSel.length) rules.push(`${pSel.join(",")}{fill:var(--p)}`);
      emitInt(pOnlyChan);
      const bothA = [[...transitOverlap].map(n => `#Gate${n}-a`), ...intAB(bothChan, "a")].flat();
      const bothB = [[...transitOverlap].map(n => `#Gate${n}-b`), ...intAB(bothChan, "b")].flat();
      if (bothA.length) rules.push(`${bothA.join(",")}{fill:var(--d)}`);
      if (bothB.length) rules.push(`${bothB.join(",")}{fill:var(--p)}`);
      emitInt(bothChan);
      [...designOnly].forEach(g => {
        if (!personality.has(g)) rules.push(`#Gate${g}-a,#Gate${g}-b{fill:var(--design)}`);
      });
    } else {
      if (personalityOnly.size) rules.push(`${gateAB(personalityOnly).join(",")}{fill:var(--p)}`);
      if (designOnly.size) rules.push(`${gateAB(designOnly).join(",")}{fill:var(--design)}`);
      if (bothSides.size) {
        rules.push(`${[...bothSides].map(n => `#Gate${n}-a`).join(",")}{fill:var(--design)}`);
        rules.push(`${[...bothSides].map(n => `#Gate${n}-b`).join(",")}{fill:var(--p)}`);
      }
      emitInt(nativeChan);
    }

    const activeGates = showTransits ? new Set([...chartGateSet, ...transitGates]) : chartGateSet;
    if (activeGates.size) {
      rules.push([...activeGates].map(n => `#GateTextBg${n}`).join(",") + "{fill:#1a2230;stroke:#fff;stroke-width:1.2}");
      rules.push([...activeGates].map(n => `#GateText${n}`).join(",") + "{fill:#fff;font-weight:800}");
    }

    const centers = chart.definedCenters.map(c => `[id="${centerSvgId[c]}"]>path:first-of-type`);
    if (centers.length) rules.push(`${centers.join(",")}{fill:var(--center-defined)}`);

    return rules.join("");
  }

  function buildDayModel(profile, transits, channelDefs, showTransits, scoreFns) {
    const chart = buildChartLayer(profile, channelDefs);
    const transit = buildTransitLayer(profile, transits, channelDefs);
    const display = composeDisplay(
      showTransits,
      chart,
      transit,
      scoreFns.full(profile, transit),
      scoreFns.chart(profile, chart)
    );
    return { chart, transit, display, showTransits, view: display.view };
  }

  function createProfileStore(storage) {
    const loadJSON = storage.loadJSON;
    const saveJSON = storage.saveJSON;

    function loadDb() {
      return loadJSON(PROFILE_DB_KEY, null);
    }

    function saveDb(db) {
      saveJSON(PROFILE_DB_KEY, db);
    }

    function migrateBirthOnly(defaults) {
      let db = loadDb();
      if (db) return db;

      db = {};
      const legacyV1 = loadJSON("hd-profile-db-v1", null);
      const legacyMeta = loadJSON("hd-profile-meta-v1", {});

      if (legacyV1) {
        Object.values(legacyV1).forEach(rec => {
          db[rec.id] = { id: rec.id, name: rec.name, tone: rec.tone, birth: rec.birth || null, chart: null };
        });
      }

      Object.keys(defaults).forEach(id => {
        if (!db[id]) {
          db[id] = {
            id,
            name: defaults[id].name,
            tone: defaults[id].tone,
            birth: legacyV1?.[id]?.birth || legacyMeta[id] || null,
            chart: null
          };
        }
      });

      saveDb(db);
      return db;
    }

    function chartIsValid(record) {
      if (!record?.chart?.chartComputed) return false;
      if (record.chart.engineVersion !== CHART_ENGINE_VERSION) return false;
      if (!record.birth?.birthDate || !record.birth?.birthTime) return false;
      const fp = birthFingerprint(record.birth);
      if (record.chart.birthFingerprint && record.chart.birthFingerprint !== fp) return false;
      if (record.chart.solarArcDegrees != null && Math.abs(record.chart.solarArcDegrees - 88) > 0.02) return false;
      return true;
    }

    function chartIsStale(record) {
      return !!(record?.chart?.chartComputed && !chartIsValid(record));
    }

    function emptyDisplay(record, defaults) {
      const base = defaults[record.id] || { id: record.id, name: record.id };
      const stale = chartIsStale(record);
      return {
        ...base,
        id: record.id,
        name: record.name || base.name,
        tone: record.tone || base.tone,
        personalityGates: [],
        designGates: [],
        definedGates: [],
        definedCenters: [],
        chartComputed: false,
        chartStale: stale,
        hasBirthData: !!(record.birth?.birthDate && record.birth?.birthTime),
        subtitle: stale
          ? { de: "Chart veraltet — bitte neu berechnen & speichern", en: "Chart outdated — please recalculate & save" }
          : { de: "Noch kein Chart gespeichert", en: "No chart saved yet" },
        authority: { de: "—", en: "—" },
        strategy: { de: "—", en: "—" }
      };
    }

    function recordToDisplay(record, defaults) {
      if (!chartIsValid(record)) return emptyDisplay(record, defaults);
      const c = record.chart;
      const base = defaults[record.id] || { id: record.id, name: record.id };
      return {
        ...base,
        id: record.id,
        name: record.name || base.name,
        tone: record.tone || base.tone,
        personalityGates: c.personalityGates,
        designGates: c.designGates,
        definedGates: c.definedGates,
        definedCenters: c.definedCenters,
        personality: c.personality,
        design: c.design,
        subtitle: c.subtitle,
        authority: c.authority,
        strategy: c.strategy,
        profileKey: c.profileKey,
        personalityLine: c.personalityLine,
        designLine: c.designLine,
        solarArcDegrees: c.solarArcDegrees,
        chartComputed: true,
        chartStale: false,
        hasBirthData: true,
        birthSavedAt: record.birth?.savedAt || c.savedAt
      };
    }

    return {
      KEY: PROFILE_DB_KEY,
      CHART_ENGINE_VERSION,
      migrateBirthOnly,
      getAllDisplay(defaults) {
        const db = migrateBirthOnly(defaults);
        const out = {};
        Object.values(db).forEach(record => {
          out[record.id] = recordToDisplay(record, defaults);
        });
        Object.keys(defaults).forEach(id => {
          if (!out[id]) out[id] = emptyDisplay({ id, name: defaults[id].name, tone: defaults[id].tone, birth: null, chart: null }, defaults);
        });
        return out;
      },
      getRecord(id, defaults) {
        migrateBirthOnly(defaults);
        const db = loadDb() || {};
        return db[id] || { id, name: defaults[id]?.name, tone: defaults[id]?.tone, birth: null, chart: null };
      },
      savePerson(id, { birth, chart, name, tone }) {
        const db = loadDb() || {};
        const fp = birthFingerprint(birth);
        const chartData = chart ? { ...chart, birthFingerprint: fp, engineVersion: CHART_ENGINE_VERSION, savedAt: new Date().toISOString() } : null;
        db[id] = {
          id,
          name,
          tone,
          birth: birth ? { ...birth, savedAt: new Date().toISOString() } : db[id]?.birth || null,
          chart: chartData
        };
        saveDb(db);
        return db[id];
      },
      clearPerson(id, defaults) {
        const db = loadDb() || {};
        if (defaults[id]) {
          db[id] = { id, name: defaults[id].name, tone: defaults[id].tone, birth: null, chart: null };
        } else {
          delete db[id];
        }
        saveDb(db);
      },
      addCustomPerson(id, name, tone) {
        const db = loadDb() || {};
        db[id] = { id, name, tone, birth: null, chart: null };
        saveDb(db);
        return db[id];
      },
      listRecords(defaults) {
        const db = migrateBirthOnly(defaults);
        return Object.values(db).sort((a, b) => String(a.name || a.id).localeCompare(String(b.name || b.id)));
      },
      updateMeta(id, { name, tone }) {
        const db = loadDb() || {};
        if (!db[id]) return null;
        if (name != null) db[id].name = name;
        if (tone != null) db[id].tone = tone;
        saveDb(db);
        return db[id];
      },
      getDbSnapshot() {
        return loadDb() || {};
      },
      importDb(data) {
        if (!data || typeof data !== "object" || Array.isArray(data)) return false;
        saveDb(data);
        return true;
      },
      chartIsValid,
      chartIsStale,
      birthFingerprint
    };
  }

  global.HDLogic = {
    DB: HD_LOGIC_DB,
    CHART_ENGINE_VERSION,
    PROFILE_DB_KEY,
    createChartPipeline,
    createProfileStore,
    buildChartLayer,
    buildTransitLayer,
    composeDisplay,
    buildHydrationCSS,
    buildDayModel,
    birthFingerprint,
    chartRecordFromEngine
  };
})(typeof window !== "undefined" ? window : globalThis);
