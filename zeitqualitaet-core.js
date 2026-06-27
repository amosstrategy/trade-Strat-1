/**
 * zeitqualitaet_core.js (browser port)
 * Single EphemerisEvent -> to_hd + to_astro -> Concordance.
 * HD math lives in HDEngine adapter only; no duplicate mandala wheel.
 */
(function (global) {
  const EventKind = {
    ASPECT: "aspect_perfection",
    INGRESS: "ingress",
    STATION: "station",
    LUNATION: "lunation"
  };

  const BODIES = {
    Sun: 0, Moon: 1, Mercury: 2, Venus: 3, Mars: 4,
    Jupiter: 5, Saturn: 6, Uranus: 7, Neptune: 8, Pluto: 9,
    Chiron: 15, TrueNode: 11
  };

  const HD_IGNORE = new Set(["Chiron"]);

  const ZODIAC = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];

  const ASPECTS = {
    conjunction: 0,
    semisquare: 45,
    sextile: 60,
    square: 90,
    trine: 120,
    sesquiquadrate: 135,
    opposition: 180
  };

  function norm(deg) {
    return ((deg % 360) + 360) % 360;
  }

  function angSep(a, b) {
    const d = Math.abs(norm(a - b));
    return d <= 180 ? d : 360 - d;
  }

  function signOf(longitude) {
    const lon = norm(longitude);
    const idx = Math.floor(lon / 30);
    return { sign: ZODIAC[idx], degInSign: lon - idx * 30 };
  }

  function lonSpeed(bodyNum, jdUt) {
    const eph = global.HDEphemeris;
    if (!eph?.ready) throw new Error("no_ephemeris");
    return eph.lonSpeed(jdUt, bodyNum);
  }

  function stableEventKey(payload) {
    const raw = JSON.stringify(payload);
    let h = 2166136261;
    for (let i = 0; i < raw.length; i++) {
      h ^= raw.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16).padStart(8, "0");
  }

  function createEphemerisEvent(kind, jdUt, bodyStates, detail) {
    const bodies = Object.freeze(bodyStates.map(b => Object.freeze({ ...b })));
    const detailObj = detail || {};
    const key = stableEventKey({
      kind,
      jd: Math.round(jdUt * 10000) / 10000,
      bodies: bodies.map(b => b.name).sort(),
      detail: detailObj
    });
    return Object.freeze({
      kind,
      jd_ut: jdUt,
      bodies,
      detail: detailObj,
      key
    });
  }

  function bisectionRoot(f, jd0, jd1, iters = 60) {
    let fa = f(jd0);
    let fb = f(jd1);
    if (fa === 0) return jd0;
    if (fb === 0) return jd1;
    if (fa * fb > 0) return null;
    let lo = jd0;
    let hi = jd1;
    for (let i = 0; i < iters; i++) {
      const mid = 0.5 * (lo + hi);
      const fm = f(mid);
      if (fa * fm <= 0) hi = mid;
      else {
        lo = mid;
        fa = fm;
      }
    }
    return 0.5 * (lo + hi);
  }

  function signIndex(lon) {
    return Math.floor(norm(lon) / 30);
  }

  function pushUniqueEvent(events, ev) {
    if (!events.some(e => e.key === ev.key)) events.push(ev);
  }

  function perfectionJd(b1, b2, angle, jd0, jd1, iters = 60) {
    return bisectionRoot(jd => {
      const l1 = lonSpeed(b1, jd).longitude;
      const l2 = lonSpeed(b2, jd).longitude;
      return angSep(l1, l2) - angle;
    }, jd0, jd1, iters);
  }

  function detectAspectPerfections(jdStart, jdEnd, stepDays = 0.5) {
    const names = Object.keys(BODIES);
    const events = [];
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const n1 = names[i];
        const n2 = names[j];
        const isSunMoon = (n1 === "Sun" && n2 === "Moon") || (n1 === "Moon" && n2 === "Sun");
        const b1 = BODIES[n1];
        const b2 = BODIES[n2];
        for (const [aspName, angle] of Object.entries(ASPECTS)) {
          if (isSunMoon && (angle === 0 || angle === 180)) continue;
          let jd = jdStart;
          while (jd < jdEnd) {
            const nxt = Math.min(jd + stepDays, jdEnd);
            const t = perfectionJd(b1, b2, angle, jd, nxt);
            if (t != null) {
              const s1 = lonSpeed(b1, t);
              const s2 = lonSpeed(b2, t);
              pushUniqueEvent(events, createEphemerisEvent(
                EventKind.ASPECT,
                t,
                [
                  { name: n1, longitude: s1.longitude, speed: s1.speed },
                  { name: n2, longitude: s2.longitude, speed: s2.speed }
                ],
                { aspect: aspName, angle }
              ));
            }
            jd = nxt;
          }
        }
      }
    }
    events.sort((a, b) => a.jd_ut - b.jd_ut);
    return events;
  }

  function detectIngresses(jdStart, jdEnd, stepDays = 0.25) {
    const events = [];
    for (const [name, bodyNum] of Object.entries(BODIES)) {
      let jd = jdStart;
      let idx0 = signIndex(lonSpeed(bodyNum, jd).longitude);
      while (jd < jdEnd) {
        const nxt = Math.min(jd + stepDays, jdEnd);
        const idx1 = signIndex(lonSpeed(bodyNum, nxt).longitude);
        if (idx0 !== idx1) {
          const cusp = idx1 * 30;
          const t = bisectionRoot(jdT => {
            const lon = lonSpeed(bodyNum, jdT).longitude;
            return ((lon - cusp + 540) % 360) - 180;
          }, jd, nxt);
          if (t != null) {
            const s = lonSpeed(bodyNum, t);
            const toSign = ZODIAC[idx1];
            const fromSign = ZODIAC[(idx1 + 11) % 12];
            pushUniqueEvent(events, createEphemerisEvent(
              EventKind.INGRESS,
              t,
              [{ name, longitude: s.longitude, speed: s.speed }],
              { from_sign: fromSign, to_sign: toSign, cusp }
            ));
          }
        }
        idx0 = idx1;
        jd = nxt;
      }
    }
    events.sort((a, b) => a.jd_ut - b.jd_ut);
    return events;
  }

  function detectStations(jdStart, jdEnd, stepDays = 0.5) {
    const events = [];
    for (const [name, bodyNum] of Object.entries(BODIES)) {
      if (name === "Sun" || name === "Moon" || name === "TrueNode") continue;
      let jd = jdStart;
      let sp0 = lonSpeed(bodyNum, jd).speed;
      while (jd < jdEnd) {
        const nxt = Math.min(jd + stepDays, jdEnd);
        const sp1 = lonSpeed(bodyNum, nxt).speed;
        if (sp0 === 0 || sp1 === 0 || sp0 * sp1 < 0) {
          const t = bisectionRoot(jdT => lonSpeed(bodyNum, jdT).speed, jd, nxt);
          if (t != null) {
            const before = lonSpeed(bodyNum, t - 0.001).speed;
            const after = lonSpeed(bodyNum, t + 0.001).speed;
            const direction = before > 0 && after < 0 ? "retrograde" : before < 0 && after > 0 ? "direct" : "station";
            const s = lonSpeed(bodyNum, t);
            pushUniqueEvent(events, createEphemerisEvent(
              EventKind.STATION,
              t,
              [{ name, longitude: s.longitude, speed: s.speed }],
              { direction, speed: s.speed }
            ));
          }
        }
        sp0 = sp1;
        jd = nxt;
      }
    }
    events.sort((a, b) => a.jd_ut - b.jd_ut);
    return events;
  }

  function detectLunations(jdStart, jdEnd, stepDays = 0.5) {
    const events = [];
    for (const [phase, angle] of [["new", 0], ["full", 180]]) {
      let jd = jdStart;
      while (jd < jdEnd) {
        const nxt = Math.min(jd + stepDays, jdEnd);
        const t = perfectionJd(BODIES.Sun, BODIES.Moon, angle, jd, nxt);
        if (t != null) {
          const s1 = lonSpeed(BODIES.Sun, t);
          const s2 = lonSpeed(BODIES.Moon, t);
          pushUniqueEvent(events, createEphemerisEvent(
            EventKind.LUNATION,
            t,
            [
              { name: "Sun", longitude: s1.longitude, speed: s1.speed },
              { name: "Moon", longitude: s2.longitude, speed: s2.speed }
            ],
            { phase, angle }
          ));
        }
        jd = nxt;
      }
    }
    events.sort((a, b) => a.jd_ut - b.jd_ut);
    return events;
  }

  function toHd(event, engine, chartId = null) {
    const activations = [];
    const natal = [];
    for (const b of event.bodies) {
      if (HD_IGNORE.has(b.name)) continue;
      const gl = engine.gate_of(b.longitude);
      activations.push({
        body: b.name,
        gate: gl.gate,
        line: gl.line,
        channel: engine.channel_of(gl.gate),
        center: engine.center_of(gl.gate)
      });
      if (chartId != null) {
        natal.push({ body: b.name, ...engine.natal_completion(gl.gate, chartId) });
      }
    }
    return { event_key: event.key, activations, natal };
  }

  function toAstro(event, astro = null) {
    const placements = event.bodies.map(b => {
      const { sign, degInSign } = signOf(b.longitude);
      return {
        body: b.name,
        sign,
        deg_in_sign: Math.round(degInSign * 10000) / 10000,
        longitude: Math.round(norm(b.longitude) * 10000) / 10000
      };
    });
    const patterns = astro?.pattern_membership?.(event.key) || [];
    const aspect = event.detail.aspect ?? null;
    const angle = event.detail.angle ?? null;
    return {
      event_key: event.key,
      aspect,
      angle,
      phase: event.detail.phase ?? null,
      ingress: event.detail.to_sign ? `${event.detail.from_sign} → ${event.detail.to_sign}` : null,
      station: event.detail.direction ?? null,
      placements,
      patterns
    };
  }

  function buildConcordance(event, hd, astro) {
    if (hd.event_key !== astro.event_key || hd.event_key !== event.key) {
      throw new Error("Verdrahtungsfehler: HD und Astro stammen NICHT aus demselben Event.");
    }
    const hdHas = hd.activations.length > 0;
    const astroHas = astro.aspect != null || astro.placements.length > 0;
    return {
      event_key: event.key,
      jd_ut: event.jd_ut,
      kind: event.kind,
      bodies: event.bodies.map(b => b.name),
      hd,
      astro,
      both_significant: hdHas && astroHas
    };
  }

  function jdUtToIso(jdUt) {
    const eph = global.HDEphemeris;
    if (eph?.julianDayToDate) return eph.julianDayToDate(jdUt);
    const ms = (jdUt - 2440587.5) * 86400000;
    return new Date(ms).toISOString();
  }

  function collectEventsForWindow(jdStart, jdEnd) {
    const merged = new Map();
    [
      ...detectAspectPerfections(jdStart, jdEnd),
      ...detectIngresses(jdStart, jdEnd),
      ...detectStations(jdStart, jdEnd),
      ...detectLunations(jdStart, jdEnd)
    ].forEach(ev => merged.set(ev.key, ev));
    return [...merged.values()].sort((a, b) => a.jd_ut - b.jd_ut);
  }

  function concordancesForWindow(jdStart, jdEnd, engine, astro = null, chartId = null) {
    const events = collectEventsForWindow(jdStart, jdEnd);
    return events.map(ev => {
      const hdR = toHd(ev, engine, chartId);
      const asR = toAstro(ev, astro);
      const conc = buildConcordance(ev, hdR, asR);
      return { ...conc, jd_iso: jdUtToIso(ev.jd_ut) };
    });
  }

  function windowJds(date, scope) {
    const eph = global.HDEphemeris;
    if (!eph?.ready) return null;
    const y = date.getFullYear();
    const m = date.getMonth();
    const d = date.getDate();
    let start;
    let end;
    if (scope === "week") {
      start = new Date(Date.UTC(y, m, d, 0, 0, 0));
      end = new Date(start.getTime() + 7 * 86400000);
    } else if (scope === "month") {
      start = new Date(Date.UTC(y, m, 1, 0, 0, 0));
      end = new Date(Date.UTC(y, m + 1, 1, 0, 0, 0));
    } else {
      start = new Date(Date.UTC(y, m, d, 0, 0, 0));
      end = new Date(start.getTime() + 86400000);
    }
    return { jdStart: eph.utcToJulianDay(start), jdEnd: eph.utcToJulianDay(end) };
  }

  global.ZeitqualitaetCore = {
    EventKind,
    BODIES,
    ZODIAC,
    ASPECTS,
    HD_IGNORE,
    signOf,
    detectAspectPerfections,
    detectIngresses,
    detectStations,
    detectLunations,
    toHd,
    toAstro,
    buildConcordance,
    collectEventsForWindow,
    concordancesForWindow,
    windowJds,
    jdUtToIso
  };
})(typeof window !== "undefined" ? window : globalThis);
