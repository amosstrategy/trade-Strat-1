/* Human Design chart + transit engine (Personality + Design 88° solar arc) */
(function (global) {
  // Gate 41 starts at 302° ecliptic (2° Pisces) — standard Human Design wheel anchor
  const WHEEL_START = 302;
  const GATE_SEQUENCE = [41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60];
  const LINE_WIDTH = 5.625 / 6;
  const GATE_WIDTH = 5.625;

  const BODY_DEFS = [
    { id: "sun", astro: "Sun" },
    { id: "earth", derived: lon => norm(lon + 180) },
    { id: "north_node", node: true },
    { id: "south_node", derived: lon => norm(lon + 180), from: "north_node" },
    { id: "moon", astro: "Moon" },
    { id: "mercury", astro: "Mercury" },
    { id: "venus", astro: "Venus" },
    { id: "mars", astro: "Mars" },
    { id: "jupiter", astro: "Jupiter" },
    { id: "saturn", astro: "Saturn" },
    { id: "uranus", astro: "Uranus" },
    { id: "neptune", astro: "Neptune" },
    { id: "pluto", astro: "Pluto" }
  ];

  const MOTOR_CENTERS = new Set(["Root", "Sacral", "Solar", "Ego"]);

  function norm(v) {
    return ((v % 360) + 360) % 360;
  }

  function hasAstronomy() {
    return typeof global.Astronomy !== "undefined";
  }

  function makeTime(date) {
    return global.Astronomy.MakeTime(date);
  }

  function eclipticLongitude(bodyName, date) {
    const time = makeTime(date);
    if (bodyName === "Sun") {
      return norm(global.Astronomy.SunPosition(time).elon);
    }
    const body = global.Astronomy.Body[bodyName];
    return norm(global.Astronomy.EclipticLongitude(body, time));
  }

  function meanNorthNodeLongitude(date) {
    const time = makeTime(date);
    const jd = time.ut;
    const d = jd - 2451545.0;
    const omega = 125.04452 - 1934.136261 * d / 36525 + 0.0020708 * (d / 36525) ** 2 + (d / 36525) ** 3 / 450000;
    return norm(omega);
  }

  function sunLongitude(date) {
    if (!hasAstronomy()) return null;
    return eclipticLongitude("Sun", date);
  }

  function findDesignMoment(birthUtc) {
    if (!hasAstronomy()) return null;
    const birthMs = birthUtc.getTime();
    const birthSun = sunLongitude(birthUtc);
    const target = norm(birthSun - 88);
    let lo = birthMs - 95 * 86400000;
    let hi = birthMs - 80 * 86400000;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      const midDate = new Date(mid);
      const midLon = sunLongitude(midDate);
      const diff = ((midLon - target + 180) % 360) - 180;
      if (Math.abs(diff) < 1e-5) return midDate;
      if (diff < 0) lo = mid;
      else hi = mid;
    }
    return new Date((lo + hi) / 2);
  }

  function longitudeToActivation(longitude) {
    const adjusted = norm(longitude - WHEEL_START);
    const bucket = Math.floor(adjusted / GATE_WIDTH) % 64;
    const gate = GATE_SEQUENCE[bucket];
    const inGate = adjusted % GATE_WIDTH;
    const line = Math.min(6, Math.floor(inGate / LINE_WIDTH) + 1);
    const inLine = inGate % LINE_WIDTH;
    const color = Math.min(6, Math.floor(inLine / (LINE_WIDTH / 6)) + 1);
    const inColor = inLine % (LINE_WIDTH / 6);
    const tone = Math.min(6, Math.floor(inColor / (LINE_WIDTH / 36)) + 1);
    const base = Math.min(5, Math.floor((inColor % (LINE_WIDTH / 36)) / (LINE_WIDTH / 180)) + 1);
    return { gate, line, color, tone, base, longitude: norm(longitude) };
  }

  function activationsForMoment(date) {
    if (!hasAstronomy()) return null;
    const out = {};
    const sunLon = eclipticLongitude("Sun", date);
    out.sun = { ...longitudeToActivation(sunLon), longitude: sunLon };
    out.earth = { ...longitudeToActivation(norm(sunLon + 180)), longitude: norm(sunLon + 180) };
    const nodeLon = meanNorthNodeLongitude(date);
    out.north_node = { ...longitudeToActivation(nodeLon), longitude: nodeLon };
    out.south_node = { ...longitudeToActivation(norm(nodeLon + 180)), longitude: norm(nodeLon + 180) };
    ["Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"].forEach(name => {
      const id = name.toLowerCase();
      const lon = eclipticLongitude(name, date);
      out[id] = { ...longitudeToActivation(lon), longitude: lon };
    });
    return out;
  }

  function birthUtcFromLocal(birthDate, birthTime, tzOffsetMinutes) {
    const [y, m, d] = birthDate.split("-").map(Number);
    const [hh, mm] = (birthTime || "12:00").split(":").map(Number);
    // Minutes local time is ahead of UTC (Berlin UTC+1 => 60)
    const offset = tzOffsetMinutes ?? -new Date(y, m - 1, d, 12, 0).getTimezoneOffset();
    return new Date(Date.UTC(y, m - 1, d, hh, mm) - offset * 60000);
  }

  function deriveDefinedCenters(gates, channels) {
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

  function motorToThroat(centers, channels) {
    const set = new Set(centers);
    if (!set.has("Throat")) return false;
    return channels.some(ch => {
      if (!set.has(ch.a) || !set.has(ch.b)) return false;
      const pair = [ch.from, ch.to];
      if (!pair.includes("Throat")) return false;
      const other = pair[0] === "Throat" ? pair[1] : pair[0];
      return MOTOR_CENTERS.has(other) && set.has(other);
    });
  }

  function deriveAuthority(centers) {
    const set = new Set(centers);
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

  function deriveType(centers, channels) {
    if (!centers.length) return "Reflector";
    const set = new Set(centers);
    const sacral = set.has("Sacral");
    const mtt = motorToThroat(centers, channels);
    if (sacral && mtt) return "Manifesting Generator";
    if (sacral) return "Generator";
    if (mtt) return "Manifestor";
    return "Projector";
  }

  function calculateChart(birthDate, birthTime, tzOffsetMinutes, channels, gateCenter) {
    if (!hasAstronomy()) return { error: "Astronomy engine not loaded" };
    if (!birthDate) return { error: "missing_birth_date" };
    const birthUtc = birthUtcFromLocal(birthDate, birthTime || "12:00", tzOffsetMinutes);
    const designUtc = findDesignMoment(birthUtc);
    const personality = activationsForMoment(birthUtc);
    const design = activationsForMoment(designUtc);
    if (!personality || !design) return { error: "calc_failed" };

    const personalityGates = [...new Set(Object.values(personality).map(a => a.gate))];
    const designGates = [...new Set(Object.values(design).map(a => a.gate))];
    const definedGates = [...new Set([...personalityGates, ...designGates])].sort((a, b) => a - b);
    const definedCenters = deriveDefinedCenters(definedGates, channels);
    const type = deriveType(definedCenters, channels);
    const authority = deriveAuthority(definedCenters);
    const strategy = deriveStrategy(type);
    const profile = `${personality.sun.line}/${design.sun.line}`;

    return {
      birthUtc: birthUtc.toISOString(),
      designUtc: designUtc.toISOString(),
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
      subtitle: `${type} ${profile}`
    };
  }

  function transitsForDate(date, labels, gateCenter) {
    if (!hasAstronomy()) return null;
    const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));
    const acts = activationsForMoment(utc);
    const ids = ["sun", "earth", "north_node", "south_node", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
    return ids.map(id => {
      const a = acts[id];
      const name = labels[id] || id;
      return {
        id,
        name,
        gate: a.gate,
        line: a.line,
        color: a.color,
        tone: a.tone,
        base: a.base,
        longitude: a.longitude,
        center: gateCenter ? gateCenter(a.gate) : null
      };
    });
  }

  global.HDEngine = {
    hasAstronomy,
    calculateChart,
    transitsForDate,
    longitudeToActivation,
    birthUtcFromLocal,
    GATE_SEQUENCE
  };
})(typeof window !== "undefined" ? window : globalThis);
