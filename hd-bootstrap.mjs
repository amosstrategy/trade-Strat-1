/**
 * Swiss Ephemeris bootstrap — matches Jovian / openhumandesign-library calculations.
 */
import initSwiss from "./vendor/swisseph.js";

const Planet = {
  Sun: 0, Moon: 1, Mercury: 2, Venus: 3, Mars: 4,
  Jupiter: 5, Saturn: 6, Uranus: 7, Neptune: 8, Pluto: 9
};
const LunarPoint = { TrueNode: 11 };

const FLAG_SWISS = 2;
const FLAG_SPEED = 256;
const CALC_FLAGS = FLAG_SWISS | FLAG_SPEED;

const wasmLocal = new URL("./vendor/swisseph.wasm", import.meta.url).href;
const wasmCdn = "https://cdn.jsdelivr.net/npm/@swisseph/browser@1.1.1/dist/swisseph.wasm";
const epheCdn = "https://cdn.jsdelivr.net/gh/aloistr/swisseph/ephe";
const EPHE_FILES = ["sepl_18.se1", "semo_18.se1", "seas_18.se1"];
const BOOT_TIMEOUT_MS = 45000;
const FETCH_TIMEOUT_MS = 20000;

/** file:// cannot load WASM/ephe via fetch — use CDN. */
const useCdnAssets = globalThis.location?.protocol === "file:";

let mod;

function dispatch(name, detail) {
  globalThis.dispatchEvent(new CustomEvent(name, { detail }));
}

async function fetchWithTimeout(url, ms = FETCH_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: "force-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return new Uint8Array(await res.arrayBuffer());
  } finally {
    clearTimeout(timer);
  }
}

function wasmUrl() {
  return useCdnAssets ? wasmCdn : wasmLocal;
}

async function loadEphemerisFiles() {
  mod.FS.mkdir("/ephe");
  for (let i = 0; i < EPHE_FILES.length; i++) {
    const name = EPHE_FILES[i];
    dispatch("hd-ephemeris-progress", { step: i + 1, total: EPHE_FILES.length, file: name });
    let buf;
    if (useCdnAssets) {
      buf = await fetchWithTimeout(`${epheCdn}/${name}`);
    } else {
      const localUrl = new URL(`./vendor/ephe/${name}`, import.meta.url).href;
      try {
        buf = await fetchWithTimeout(localUrl);
      } catch {
        buf = await fetchWithTimeout(`${epheCdn}/${name}`);
      }
    }
    mod.FS.writeFile(`/ephe/${name}`, buf);
  }
  const pathPtr = mod.allocateUTF8("/ephe");
  mod.ccall("swe_set_ephe_path_wrap", null, ["number"], [pathPtr]);
  mod._free(pathPtr);
}

async function boot() {
  dispatch("hd-ephemeris-progress", { step: 0, total: EPHE_FILES.length, file: useCdnAssets ? "wasm (cdn)" : "wasm" });
  const url = wasmUrl();
  mod = await initSwiss({
    locateFile(path) {
      return path === "swisseph.wasm" ? url : path;
    }
  });
  await loadEphemerisFiles();
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timeout (${ms / 1000}s)`)), ms))
  ]);
}

try {
  await withTimeout(boot(), BOOT_TIMEOUT_MS, "Swiss Ephemeris");
} catch (err) {
  const message = err?.name === "AbortError"
    ? "Download-Timeout — Internetverbindung prüfen"
    : String(err?.message || err);
  console.error("Swiss Ephemeris init failed:", err);
  globalThis.HDEphemeris = { ready: false, error: message };
  dispatch("hd-ephemeris-error", { error: message });
  throw err;
}

function julianDayUtc(date) {
  const h = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  return mod.ccall(
    "swe_julday_wrap",
    "number",
    ["number", "number", "number", "number", "number"],
    [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), h, 1]
  );
}

function calcLongitude(jd, body) {
  const xxPtr = mod._malloc(6 * 8);
  const serrPtr = mod._malloc(256);
  const ret = mod.ccall(
    "swe_calc_ut_wrap",
    "number",
    ["number", "number", "number", "number", "number"],
    [jd, body, CALC_FLAGS, xxPtr, serrPtr]
  );
  if (ret < 0) {
    const msg = mod.UTF8ToString(serrPtr);
    mod._free(xxPtr);
    mod._free(serrPtr);
    throw new Error(msg || `swe_calc_ut failed (${ret})`);
  }
  const lon = mod.getValue(xxPtr, "double");
  mod._free(xxPtr);
  mod._free(serrPtr);
  return lon;
}

function norm(deg) {
  return ((deg % 360) + 360) % 360;
}

function longitudeForBody(jd, bodyId) {
  let body;
  switch (bodyId) {
    case "sun": body = Planet.Sun; break;
    case "moon": body = Planet.Moon; break;
    case "mercury": body = Planet.Mercury; break;
    case "venus": body = Planet.Venus; break;
    case "mars": body = Planet.Mars; break;
    case "jupiter": body = Planet.Jupiter; break;
    case "saturn": body = Planet.Saturn; break;
    case "uranus": body = Planet.Uranus; break;
    case "neptune": body = Planet.Neptune; break;
    case "pluto": body = Planet.Pluto; break;
    case "north_node": body = LunarPoint.TrueNode; break;
    case "south_node": body = LunarPoint.TrueNode; break;
    default: throw new Error(`unknown body ${bodyId}`);
  }
  const lon = calcLongitude(jd, body);
  return bodyId === "south_node" ? norm(lon + 180) : norm(lon);
}

globalThis.HDEphemeris = {
  ready: true,
  engine: "swiss-ephemeris",
  utcToJulianDay: julianDayUtc,
  longitudeForBody,
  norm
};

dispatch("hd-ephemeris-ready");
