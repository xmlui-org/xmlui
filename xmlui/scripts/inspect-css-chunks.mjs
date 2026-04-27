#!/usr/bin/env node
/**
 * CSS-chunk inspector for production builds.
 *
 * Walks a built `dist/` directory and reports:
 *   - Every `.css` asset emitted (size, declared `@layer` rules at top).
 *   - Every `<link rel="stylesheet">` in each `*.html`, in order.
 *   - The layer-order declaration (`@layer reset, base, components, themes, dynamic;`)
 *     and where it appears.
 *
 * Then it asserts:
 *   1. The layer-order declaration is present at the top of every CSS asset
 *      (or as the first inline <style> in HTML).
 *   2. No CSS asset is named like a metadata-only or helper chunk
 *      (e.g. `metadata-helpers.<hash>.css`, `*-helpers.<hash>.css`),
 *      which would indicate a stray per-module CSS chunk leak.
 *   3. (Soft) Reports if more than one CSS link appears in any HTML, so the
 *      reviewer can decide whether the order is safe.
 *
 * Usage:
 *   node xmlui/scripts/inspect-css-chunks.mjs <dist-dir> [<dist-dir> ...]
 *
 * Examples:
 *   node xmlui/scripts/inspect-css-chunks.mjs website/dist
 *   node xmlui/scripts/inspect-css-chunks.mjs xmlui/dist/lib packages/xmlui-pdf/dist
 *
 * Exits non-zero on any hard assertion failure.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, resolve, basename } from "node:path";

const EXPECTED_LAYER_ORDER =
  "@layer reset, base, components, themes, dynamic;";

// File-name shapes that suggest a stray per-module CSS chunk.
const SUSPICIOUS_CSS_NAMES = [
  /^metadata-helpers(\.[a-f0-9]+)?\.css$/i,
  /-helpers(\.[a-f0-9]+)?\.css$/i,
  /^ItemWithLabel(\.[a-f0-9]+)?\.css$/i,
];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function inspectCss(file) {
  const src = readFileSync(file, "utf8");
  const head = src.slice(0, 200).trim();
  const declaresLayerOrder = head.startsWith(EXPECTED_LAYER_ORDER);
  // First @layer rule mentioned (if any)
  const layerMatch = src.match(/@layer\s+([a-zA-Z0-9_,\s]+)\s*[{;]/);
  return {
    size: src.length,
    declaresLayerOrder,
    firstLayerRule: layerMatch ? layerMatch[0].trim() : null,
  };
}

const LINK_RE = /<link\b[^>]*\brel\s*=\s*["']?stylesheet["']?[^>]*>/gi;
const HREF_RE = /\bhref\s*=\s*["']([^"']+)["']/i;
const STYLE_RE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;

function inspectHtml(file) {
  const src = readFileSync(file, "utf8");
  const links = [];
  let m;
  while ((m = LINK_RE.exec(src)) !== null) {
    const hrefMatch = m[0].match(HREF_RE);
    if (hrefMatch) links.push(hrefMatch[1]);
  }
  const inlineStyles = [];
  while ((m = STYLE_RE.exec(src)) !== null) {
    inlineStyles.push(m[1].trim().slice(0, 120));
  }
  const headLayerStyle = inlineStyles.find((s) =>
    s.startsWith(EXPECTED_LAYER_ORDER),
  );
  return {
    links,
    inlineStyles,
    hasHeadLayerStyle: Boolean(headLayerStyle),
  };
}

function inspect(distDir) {
  const abs = resolve(distDir);
  if (!existsSync(abs)) {
    console.error(`  [missing] ${distDir}`);
    return { ok: false, problems: [`Directory not found: ${distDir}`] };
  }
  console.log(`\n=== ${distDir} ===`);

  const all = walk(abs);
  const cssFiles = all.filter((f) => f.endsWith(".css"));
  const htmlFiles = all.filter((f) => f.endsWith(".html"));

  const problems = [];
  const warnings = [];

  // CSS assets
  console.log(`\n  CSS assets (${cssFiles.length}):`);
  for (const f of cssFiles) {
    const info = inspectCss(f);
    const rel = relative(abs, f);
    const suspicious = SUSPICIOUS_CSS_NAMES.some((re) =>
      re.test(basename(f)),
    );
    const flag = suspicious
      ? " [LEAK?]"
      : info.declaresLayerOrder
      ? ""
      : " [no layer-order prefix]";
    console.log(
      `    - ${rel}  (${info.size} B)  first-layer=${info.firstLayerRule ?? "(none)"}${flag}`,
    );
    if (suspicious) {
      problems.push(
        `Suspicious CSS chunk name (likely per-module leak): ${rel}`,
      );
    }
    if (!info.declaresLayerOrder) {
      // Only a hard failure when there are multiple CSS chunks — that's when
      // the chunk-load order matters and the prefix is load-bearing.
      const msg = `CSS asset missing layer-order prefix: ${rel}`;
      if (cssFiles.length > 1) problems.push(msg);
      else warnings.push(msg + " (single-chunk build; safe but not insured against future splits)");
    }
  }

  // HTML files
  console.log(`\n  HTML files (${htmlFiles.length}):`);
  for (const f of htmlFiles) {
    const info = inspectHtml(f);
    const rel = relative(abs, f);
    console.log(
      `    - ${rel}  links=${info.links.length}  layerStyleInHead=${info.hasHeadLayerStyle}`,
    );
    info.links.forEach((href, i) =>
      console.log(`        [${i}] ${href}`),
    );
    if (info.links.length > 1) {
      warnings.push(
        `${rel}: ${info.links.length} stylesheet links — verify the cascade order is intentional.`,
      );
    }
    if (!info.hasHeadLayerStyle && info.links.length > 1) {
      problems.push(
        `${rel}: missing inline <style>${EXPECTED_LAYER_ORDER}</style> before multiple stylesheet links.`,
      );
    }
  }

  return { ok: problems.length === 0, problems, warnings };
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(
    "Usage: node inspect-css-chunks.mjs <dist-dir> [<dist-dir> ...]",
  );
  process.exit(2);
}

let allOk = true;
const allProblems = [];
const allWarnings = [];
for (const dir of args) {
  const { ok, problems, warnings } = inspect(dir);
  if (!ok) allOk = false;
  allProblems.push(...problems.map((p) => `[${dir}] ${p}`));
  allWarnings.push(...(warnings ?? []).map((p) => `[${dir}] ${p}`));
}

console.log("\n--- Summary ---");
if (allWarnings.length > 0) {
  console.log(`Warnings (${allWarnings.length}):`);
  for (const w of allWarnings) console.log(`  - ${w}`);
}
if (allProblems.length === 0) {
  console.log("OK: no CSS chunk anomalies detected.");
} else {
  console.error(`Found ${allProblems.length} problem(s):`);
  for (const p of allProblems) console.error(`  - ${p}`);
}

process.exit(allOk ? 0 : 1);
