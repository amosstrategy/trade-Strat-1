/**
 * Human Design chart engine — single source of truth for mandala + ephemeris.
 * Personality @ birth UTC; Design @ exact moment when Sun was 88° earlier (solar arc).
 */
(function (global) {
  const CHART_ENGINE_VERSION = 4;

  /** Gate 41 anchor: 2° Aquarius = 302° ecliptic (Jovian / Rave Mandala standard). */
  const WHEEL_START = 302;
  const GATE_WIDTH = 360 / 64;
  const LINE_WIDTH = GATE_WIDTH / 6;
  const DESIGN_ARC_DEG = 88;
  const SOLAR_ARC_TOLERANCE = 0.02;

  const GATE_SEQUENCE = [
    41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
  ];

  const MOTOR_CENTERS = new Set(["Root", "Sacral", "Solar", "Ego"]);
  const PLANET_IDS = ["sun", "earth", "north_node", "south_node", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];

  function norm(deg) {
    return ((deg % 360) + 360) % 360;
  }

  /** Shortest signed arc from `from` to `to` in degrees (−180 … +180]. */
  function angularDiff(from, to) {
    return ((from - to + 540) % 360) - 180;
  }

  function solarArcDegrees(personalityLon, designLon) {
    return norm(personalityLon - designLon);
  }

  function hasAstronomy() {
    return typeof global.Astronomy !== "undefined";
  }

  function makeTime(date) {
    return global.Astronomy.MakeTime(date);
  }

  function sunLongitude(date) {
    const time = makeTime(date);
    return norm(global.Astronomy.SunPosition(time).elon);
  }

  function bodyLongitude(bodyName, date) {
    const time = makeTime(date);
    if (bodyName === "Sun") return sunLongitude(date);
    return norm(global.Astronomy.EclipticLongitude(global.Astronomy.Body[bodyName], time));
  }

  function meanNorthNodeLongitude(date) {
    const jd = makeTime(date).ut;
    const d = jd - 2451545.0;
    const omega = 125.04452 - 1934.136261 * d / 36525 + 0.0020708 * (d / 36525) ** 2 + (d / 36525) ** 3 / 450000;
    return norm(omega);
  }

  function longitudeToActivation(longitude) {
    const adjusted = norm(longitude - WHEEL_START);
    const bucket = Math.floor(adjusted / GATE_WIDTH) % 64;
    const gate = GATE_SEQUENCE[bucket];
    const inGate = adjusted - bucket * GATE_WIDTH;
    const line = Math.min(6, Math.floor(inGate / LINE_WIDTH) + 1);
    const inLine = inGate - (line - 1) * LINE_WIDTH;
    const colorWidth = LINE_WIDTH / 6;
    const color = Math.min(6, Math.floor(inLine / colorWidth) + 1);
    const inColor = inLine - (color - 1) * colorWidth;
    const toneWidth = colorWidth / 6;
    const tone = Math.min(6, Math.floor(inColor / toneWidth) + 1);
    const baseWidth = toneWidth / 5;
    const base = Math.min(5, Math.floor((inColor - (tone - 1) * toneWidth) / baseWidth) + 1);
    return { gate, line, color, tone, base, longitude: norm(longitude) };
  }

  function activationsAt(date) {
    const sunLon = sunLongitude(date);
    const nodeLon = meanNorthNodeLongitude(date);
    const out = {
      sun: { ...longitudeToActivation(sunLon), longitude: sunLon },
      earth: { ...longitudeToActivation(norm(sunLon + 180)), longitude: norm(sunLon + 180) },
      north_node: { ...longitudeToActivation(nodeLon), longitude: nodeLon },
      south_node: { ...longitudeToActivation(norm(nodeLon + 180)), longitude: norm(nodeLon + 180) }
    };
    ["Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"].forEach(name => {
      const id = name.toLowerCase();
      const lon = bodyLongitude(name, date);
      out[id] = { ...longitudeToActivation(lon), longitude: lon };
    });
    return out;
  }

  function findDesignMoment(birthUtc) {
    const birthMs = birthUtc.getTime();
    const birthSun = sunLongitude(birthUtc);
    const target = norm(birthSun - DESIGN_ARC_DEG);
    let lo = birthMs - 100 * 86400000;
    let hi = birthMs - 75 * 86400000;
    for (let i = 0; i < 80; i++) {
      const mid = (lo + hi) / 2;
      const midLon = sunLongitude(new Date(mid));
      const diff = angularDiff(midLon, target);
      if (Math.abs(diff) < 1e-7) return new Date(mid);
      if (diff < 0) lo = mid;
      else hi = mid;
    }
    return new Date((lo + hi) / 2);
  }

  function birthUtcFromLocal(birthDate, birthTime, tzOffsetMinutes) {
    const [y, m, d] = birthDate.split("-").map(Number);
    const [hh, mm] = (birthTime || "12:00").split(":").map(Number);
    const offset = tzOffsetMinutes ?? -new Date(y, m - 1, d, 12, 0).getTimezoneOffset();
    return new Date(Date.UTC(y, m - 1, d, hh, mm) - offset * 60000);
  }

  function gatesFromActivations(acts) {
    return [...new Set(Object.values(acts).map(a => a.gate))];
  }

  function definedCentersFromGates(gates, channels) {
    const set = new Set(gates);
    const centers = new Set();
    channels.forEach(ch => {
      if (set.has(ch.a) && set.has(ch.b)) {
        centers.add(ch.from);
        centers.add(ch.to);
      }
    });
    return [...centers];
  }

  function buildCenterGraph(definedGates, channels) {
    const gateSet = new Set(definedGates);
    const adj = new Map();
    const link = (a, b) => {
      if (!adj.has(a)) adj.set(a, new Set());
      if (!adj.has(b)) adj.set(b, new Set());
      adj.get(a).add(b);
      adj.get(b).add(a);
    };
    channels.forEach(ch => {
      if (gateSet.has(ch.a) && gateSet.has(ch.b)) link(ch.from, ch.to);
    });
    return adj;
  }

  function centerReachable(adj, fromCenters, target) {
    const queue = fromCenters.filter(c => adj.has(c));
    const seen = new Set(queue);
    while (queue.length) {
      const c = queue.shift();
      if (c === target) return true;
      for (const n of adj.get(c) || []) {
        if (!seen.has(n)) {
          seen.add(n);
          queue.push(n);
        }
      }
    }
    return false;
  }

  function motorToThroat(definedCenters, definedGates, channels) {
    if (!definedCenters.includes("Throat")) return false;
    const adj = buildCenterGraph(definedGates, channels);
    const motors = definedCenters.filter(c => MOTOR_CENTERS.has(c));
    return centerReachable(adj, motors, "Throat");
  }

  function deriveType(definedCenters, definedGates, channels) {
    if (!definedCenters.length) return "Reflector";
    const sacral = definedCenters.includes("Sacral");
    const mtt = motorToThroat(definedCenters, definedGates, channels);
    if (sacral && mtt) return "Manifesting Generator";
    if (sacral) return "Generator";
    if (mtt) return "Manifestor";
    return "Projector";
  }

  function deriveAuthority(definedCenters) {
    const set = new Set(definedCenters);
    if (set.has("Solar")) return "Emotional";
    if (set.has("Sacral")) return "Sacral";
    if (set.has("Spleen")) return "Splenic";
    if (set.has("Ego")) return "Ego Projected";
    if (set.has("G")) return "Self Projected";
    if (set.has("Ajna") || set.has("Head")) return "Mental";
    return "Lunar";
  }

  function deriveStrategy(type) {
    if (type === "Generator" || type === "Manifesting Generator") return "To Respond";
    if (type === "Projector") return "Wait for Invitation";
    if (type === "Manifestor") return "Inform";
    return "Wait Lunar Cycle";
  }

  function calculateChart(birthDate, birthTime, tzOffsetMinutes, channels) {
    if (!hasAstronomy()) return { error: "no_astronomy" };
    if (!birthDate || !birthTime) return { error: "missing_birth" };

    const birthUtc = birthUtcFromLocal(birthDate, birthTime, tzOffsetMinutes);
    const designUtc = findDesignMoment(birthUtc);
    const personality = activationsAt(birthUtc);
    const design = activationsAt(designUtc);

    const arc = solarArcDegrees(personality.sun.longitude, design.sun.longitude);
    if (Math.abs(arc - DESIGN_ARC_DEG) > SOLAR_ARC_TOLERANCE) {
      return {
        error: "design_arc_invalid",
        solarArcDegrees: arc,
        birthUtc: birthUtc.toISOString(),
        designUtc: designUtc.toISOString()
      };
    }

    const personalityGates = gatesFromActivations(personality);
    const designGates = gatesFromActivations(design);
    const definedGates = [...new Set([...personalityGates, ...designGates])].sort((a, b) => a - b);
    const definedCenters = definedCentersFromGates(definedGates, channels);
    const type = deriveType(definedCenters, definedGates, channels);
    const authority = deriveAuthority(definedCenters);
    const strategy = deriveStrategy(type);
    const profile = `${personality.sun.line}/${design.sun.line}`;

    return {
      engineVersion: CHART_ENGINE_VERSION,
      birthUtc: birthUtc.toISOString(),
      designUtc: designUtc.toISOString(),
      solarArcDegrees: arc,
      personality,
      design,
      personalityGates,
      designGates,
      definedGates,
      definedCenters,
      type,
      authority,
      strategy,
      profile,
      personalityLine: personality.sun.line,
      designLine: design.sun.line
    };
  }

  function transitsForDate(date, labels) {
    if (!hasAstronomy()) return null;
    const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));
    const acts = activationsAt(utc);
    return PLANET_IDS.map(id => {
      const a = acts[id];
      return {
        id,
        name: labels[id] || id,
        gate: a.gate,
        line: a.line,
        color: a.color,
        tone: a.tone,
        base: a.base,
        longitude: a.longitude
      };
    });
  }

  global.HDEngine = {
    CHART_ENGINE_VERSION,
    WHEEL_START,
    GATE_SEQUENCE,
    DESIGN_ARC_DEG,
    hasAstronomy,
    calculateChart,
    transitsForDate,
    longitudeToActivation,
    birthUtcFromLocal,
    solarArcDegrees,
    angularDiff
  };
})(typeof window !== "undefined" ? window : globalThis);
