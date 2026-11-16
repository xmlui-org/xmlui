import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

// Pre-bundle heavy dependencies so Vite doesn't need to transform them
// on-demand during the first test page load. This reduces the cold-start
// latency of the dev server for E2E tests.
const coreDeps = [
  "react",
  "react/jsx-runtime",
  "react-dom",
  "react-dom/client",
  "react-router-dom",
  "@tanstack/react-query",
  "@tanstack/react-table",
  "@radix-ui/react-accordion",
  "@radix-ui/react-dialog",
  "@radix-ui/react-dropdown-menu",
  "@radix-ui/react-popover",
  "@radix-ui/react-radio-group",
  "@radix-ui/react-select",
  "@radix-ui/react-slider",
  "@radix-ui/react-tabs",
  "@radix-ui/react-tooltip",
  "react-hot-toast",
  "react-helmet-async",
  "react-markdown",
  "react-day-picker",
  "immer",
  "lodash-es",
  "date-fns",
  "classnames",
  "framer-motion",
  "overlayscrollbars",
  "overlayscrollbars-react",
  "js-yaml",
];

/**
 * The third-party dependencies of every extension in `extension-registry.ts`.
 *
 * Without them in `optimizeDeps.include`, Vite discovers them when the first
 * extension test imports its extension, re-optimizes, and serves the old
 * `?v=` URLs with 504 (Outdated Optimize Dep). The test bed keeps its page
 * alive between tests, so every later extension import in the run fails with
 * "Failed to fetch dynamically imported module" and the test waits out its
 * 240 s timeout. Listing them up front means no re-optimization mid-run.
 *
 * Computed from each extension's `package.json` so a new extension or
 * dependency is covered without editing this file. The server runs with this
 * directory as its cwd (`start-test-bed`; `viteConfig.ts` loads this file from
 * `process.cwd()`).
 */
function extensionDeps(): string[] {
  const here = process.cwd();
  const repoRoot = resolve(here, "../../../..");
  let registry: string;
  try {
    registry = readFileSync(resolve(here, "extension-registry.ts"), "utf8");
  } catch {
    return [];
  }
  const names = registry
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .flatMap((line) => [...line.matchAll(/"([^"]+)":\s*\(\)\s*=>\s*import\(/g)].map((m) => m[1]));
  const deps = new Set<string>();
  for (const name of names) {
    const pkgPath = resolve(repoRoot, "node_modules", name, "package.json");
    if (!existsSync(pkgPath)) continue;
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    for (const dep of Object.keys(pkg.dependencies ?? {})) {
      // xmlui itself and the workspace's own packages are source, not prebundled.
      if (dep === "xmlui" || dep.startsWith("xmlui-")) continue;
      deps.add(dep);
    }
  }
  return [...deps];
}

export default defineConfig({
  optimizeDeps: {
    include: [...new Set([...coreDeps, ...extensionDeps()])],
  },
});
