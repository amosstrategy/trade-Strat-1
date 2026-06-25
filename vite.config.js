import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const fusionBrowserInternal = fileURLToPath(new URL("./node_modules/@fusionstrings/swisseph-wasm/browser/swisseph_wasm.internal.js", import.meta.url));
const fusionInternalImpl = fileURLToPath(new URL("./node_modules/@fusionstrings/swisseph-wasm/esm/lib/swisseph_wasm.internal.js", import.meta.url));

export default defineConfig({
  plugins: [
    {
      name: "fusionstrings-browser-internal-resolver",
      resolveId(source, importer) {
        if (source === "./swisseph_wasm.internal.js" && importer && importer.endsWith("/node_modules/@fusionstrings/swisseph-wasm/browser/swisseph_wasm.js")) {
          return fusionInternalImpl;
        }
        return null;
      }
    }
  ],
  resolve: {
    alias: {
      [fusionBrowserInternal]: fusionInternalImpl
    }
  },
  define: {
    process: '({ argv: ["browser", "browser"], env: {}, versions: {}, cwd: () => "/" })'
  }
});
