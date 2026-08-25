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
import { parse } from "@babel/parser";

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

  const ast = parse(src, {
    sourceType: "module",
    plugins: ["typescript", "jsx", "importAttributes"],
  });

  for (const node of ast.program.body) {
    switch (node.type) {
      case "ImportDeclaration":
        if (hasRuntimeImport(node)) {
          specs.add(node.source.value);
        }
        break;

      case "ExportNamedDeclaration":
        if (node.source && hasRuntimeExport(node)) {
          specs.add(node.source.value);
        }
        break;

      case "ExportAllDeclaration":
        if (node.exportKind !== "type") {
          specs.add(node.source.value);
        }
        break;
    }
  }

  collectDynamicImports(ast.program, specs);
  return [...specs];
}

function hasRuntimeImport(node) {
  if (node.importKind === "type") return false;
  if (node.specifiers.length === 0) return true; // Side-effect import.
  return node.specifiers.some((specifier) => specifier.importKind !== "type");
}

function hasRuntimeExport(node) {
  if (node.exportKind === "type") return false;
  if (node.specifiers.length === 0) return true;
  return node.specifiers.some((specifier) => specifier.exportKind !== "type");
}

function collectDynamicImports(node, specs) {
  if (!node || typeof node !== "object") return;

  if (node.type === "CallExpression" && node.callee?.type === "Import") {
    const source = node.arguments?.[0];
    if (source?.type === "StringLiteral") {
      specs.add(source.value);
    }
  }

  if (node.type === "ImportExpression") {
    const source = node.source;
    if (source?.type === "StringLiteral") {
      specs.add(source.value);
    }
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === "loc" || key === "start" || key === "end") continue;
    if (Array.isArray(value)) {
      value.forEach((child) => collectDynamicImports(child, specs));
    } else {
      collectDynamicImports(value, specs);
    }
  }
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
