#!/usr/bin/env node
/**
 * Metadata-purity guard.
 *
 * Walks the transitive import graph of the metadata-only entry points and
 * fails if any reachable module is a `.tsx` React component or a
 * `.module.scss` style sheet. Such leaks cause `vite-plugin-lib-inject-css`
 * to emit a stray per-module CSS chunk that can invert the `@layer` cascade
 * order in production builds.
 *
 * See `xmlui/dev-docs/plans/css-layer-order-rootcause.md`.
 *
 * Usage:
 *   node scripts/check-metadata-purity.mjs
 *
 * Exits non-zero on any violation.
 */

import { readFileSync, existsSync, statSync } from "node:fs";
import { dirname, join, resolve, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const SRC = resolve(ROOT, "src");

// Entry points that must remain free of React component / SCSS imports.
//
// `metadata-helpers.ts` is imported by virtually every component file (each
// `*Md = createMetadata(...)` declaration pulls it in). It MUST stay pure:
// any `.tsx` / `.module.scss` reachable from here will leak into a per-module
// CSS chunk for the lib build via `vite-plugin-lib-inject-css`.
//
// `collectedComponentMetadata.ts` (the metadata-build entry) intentionally
// imports component .tsx files. The metadata Vite mode tree-shakes their
// CSS via `moduleSideEffects: false`, so it isn't subject to this guard.
const ENTRY_POINTS = [
  resolve(SRC, "components/metadata-helpers.ts"),
];

// Pattern matchers for "forbidden" reachable files.
const isForbidden = (file) =>
  file.endsWith(".module.scss") ||
  file.endsWith(".module.css") ||
  // Any .tsx file is a React component (JSX) and should never be reached.
  file.endsWith(".tsx");

// Strip TS-style import/export specifiers from a file's source.
const IMPORT_RE =
  /(?:^|\n)\s*(?:import|export)(?:\s+type)?\s+(?:[^'"`]*?\sfrom\s+)?["']([^"']+)["']/g;
const DYNAMIC_IMPORT_RE = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;

const RESOLVE_EXTS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"];
const RESOLVE_INDEX = ["index.ts", "index.tsx", "index.js", "index.jsx"];

function tryResolve(spec, fromDir) {
  if (!spec.startsWith(".") && !spec.startsWith("/")) return null; // package import
  const base = resolve(fromDir, spec);

  // Exact path with extension
  if (existsSync(base) && statSync(base).isFile()) return base;

  // Try appending known extensions
  for (const ext of RESOLVE_EXTS) {
    const candidate = base + ext;
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }

  // SCSS / CSS literal imports
  for (const ext of [".scss", ".css", ".sass"]) {
    const candidate = base + ext;
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }

  // Directory with index file
  if (existsSync(base) && statSync(base).isDirectory()) {
    for (const idx of RESOLVE_INDEX) {
      const candidate = join(base, idx);
      if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
    }
  }

  return null;
}

function collectImports(file) {
  const src = readFileSync(file, "utf8");
  const specs = new Set();
  for (const re of [IMPORT_RE, DYNAMIC_IMPORT_RE]) {
    let m;
    while ((m = re.exec(src)) !== null) specs.add(m[1]);
  }
  return [...specs];
}

function walk(entry) {
  const visited = new Set();
  const queue = [entry];
  // For each visited file, store the parent that pulled it in (for diagnostics).
  const parents = new Map();

  while (queue.length) {
    const file = queue.shift();
    if (visited.has(file)) continue;
    visited.add(file);

    // We only crawl source-controlled TS/JS files. SCSS / CSS / JSON have no imports
    // we care about for this guard.
    const ext = extname(file);
    if (![".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"].includes(ext)) continue;

    let specs;
    try {
      specs = collectImports(file);
    } catch {
      continue;
    }
    const fromDir = dirname(file);
    for (const spec of specs) {
      // Strip query strings (e.g. ?raw, ?url)
      const cleanSpec = spec.split("?")[0];
      const resolved = tryResolve(cleanSpec, fromDir);
      if (!resolved) continue;
      if (!visited.has(resolved)) {
        parents.set(resolved, file);
        queue.push(resolved);
      }
    }
  }

  return { visited, parents };
}

function chain(parents, file) {
  const path = [file];
  let cur = parents.get(file);
  while (cur) {
    path.push(cur);
    cur = parents.get(cur);
  }
  return path.reverse();
}

let hadFailure = false;

for (const entry of ENTRY_POINTS) {
  if (!existsSync(entry)) {
    console.error(`Entry point not found: ${entry}`);
    hadFailure = true;
    continue;
  }
  const { visited, parents } = walk(entry);
  const violations = [...visited].filter(isForbidden);
  if (violations.length === 0) {
    console.log(
      `[ok] ${relative(ROOT, entry)}: ${visited.size} files, no React/SCSS leaks.`,
    );
    continue;
  }
  hadFailure = true;
  console.error(`\n[FAIL] ${relative(ROOT, entry)}`);
  console.error(
    `  ${violations.length} forbidden module(s) reachable from this metadata entry:`,
  );
  for (const v of violations.slice(0, 20)) {
    console.error(`    - ${relative(ROOT, v)}`);
    const path = chain(parents, v);
    for (let i = 0; i < path.length; i++) {
      console.error(
        `        ${"  ".repeat(i)}${i === 0 ? "from" : "←"} ${relative(ROOT, path[i])}`,
      );
    }
  }
  if (violations.length > 20) {
    console.error(`    ... and ${violations.length - 20} more`);
  }
}

if (hadFailure) {
  console.error(
    "\nMetadata graph must not reach React (.tsx) or CSS-module (.module.scss) files.",
  );
  console.error(
    "See xmlui/dev-docs/plans/css-layer-order-rootcause.md for the rationale.",
  );
  process.exit(1);
}

console.log("\nAll metadata entry points are pure.");
