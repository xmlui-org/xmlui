import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { OPTIMIZER_METADATA } from "../../../src/components-core/optimization/optimizer-metadata";

// Static drift detection — 
// Walks each built-in component's source file, extracts any
// `renderers: { <slot>: { contextVars: [ "$x", "$y", ... ] } }` declaration,
// and asserts that every `$`-key listed there is also declared in either
// `OPTIMIZER_METADATA[type].childInjectedVars` or the component's own
// `metadata.contextVars`. Mirrors the runtime `validateInjectedVars` check
// but runs at CI / PR time so drift surfaces with sub-second feedback
// instead of waiting for an E2E run that happens to exercise the slot.
//
// Limitation: we only audit STATIC `contextVars: [...]` arrays. Renderers
// that use a callback (e.g. `contextVars: (vars) => vars` in
// `Checkbox.tsx`) cannot be statically analysed and are skipped — their
// shape is determined at runtime by the caller.

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMPONENTS_DIR = resolve(__dirname, "../../../src/components");

function listComponentTsxFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) {
      out.push(...listComponentTsxFiles(p));
    } else if (
      entry.endsWith(".tsx") &&
      !entry.endsWith(".spec.ts") &&
      !entry.endsWith(".spec.tsx") &&
      !entry.endsWith("React.tsx") &&
      !entry.includes(".test.")
    ) {
      out.push(p);
    }
  }
  return out;
}

/**
 * Extract every static `<slot>: { contextVars: [ "$x", ... ] }` block from
 * a component source file's `renderers: { ... }` config. Returns a list of
 * (slot, vars[]) tuples. Dynamic-callback contextVars (e.g.
 * `contextVars: (vars) => vars`) are skipped — they cannot be audited
 * statically.
 */
function extractRendererContextVars(
  source: string,
): Array<{ slot: string; vars: string[] }> {
  const out: Array<{ slot: string; vars: string[] }> = [];
  const renderersMatch = source.match(/renderers:\s*\{([\s\S]*?)\n\s*\},/);
  if (!renderersMatch) return out;
  const body = renderersMatch[1];
  const slotRe = /(\w+):\s*\{[\s\S]*?contextVars:\s*\[([^\]]*)\]/g;
  let m: RegExpExecArray | null;
  while ((m = slotRe.exec(body)) !== null) {
    const slot = m[1];
    const vars = m[2]
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter((s) => s.length > 0);
    out.push({ slot, vars });
  }
  return out;
}

/**
 * Identify the registered component name. Components register themselves
 * via `wrapComponent(<NAME_CONST>, ...)` or similar; resolve the const to
 * its string literal so we can look it up in OPTIMIZER_METADATA.
 */
function extractRegisteredName(source: string): string | undefined {
  // Common patterns:
  //   const COMP = "AutoComplete";  // followed by wrapComponent(COMP, ...) or COMP referenced elsewhere
  //   const COMP_NAME = "X";
  // We look for any `const <ID> = "<Name>"` near the top of the file.
  const constMatch = source.match(
    /const\s+COMP(?:_NAME)?\s*=\s*["']([^"']+)["']/,
  );
  if (constMatch) return constMatch[1];
  // Fallback: createMetadata is sometimes used directly with displayName.
  const dn = source.match(/displayName:\s*["']([^"']+)["']/);
  if (dn) return dn[1];
  return undefined;
}

interface DriftRow {
  file: string;
  componentType: string;
  slot: string;
  missing: string[];
}

const allFiles = listComponentTsxFiles(COMPONENTS_DIR);
const drift: DriftRow[] = [];
const audited: string[] = [];

for (const file of allFiles) {
  const source = readFileSync(file, "utf-8");
  const renderers = extractRendererContextVars(source);
  if (renderers.length === 0) continue;
  const componentType = extractRegisteredName(source);
  if (!componentType) continue;
  audited.push(`${componentType} (${file.replace(/^.*\/components\//, "components/")})`);

  const optEntry = (OPTIMIZER_METADATA as Record<string, any>)[componentType];
  const declared = new Set<string>();
  if (optEntry?.childInjectedVars) {
    for (const v of optEntry.childInjectedVars) declared.add(v);
  }
  // Also include `contextVars: { $x: d(...) }` keys from createMetadata.
  const ctxBlock = source.match(/contextVars:\s*\{([\s\S]*?)\n\s*\},/);
  if (ctxBlock) {
    for (const m of ctxBlock[1].matchAll(/(\$\w+)\s*:/g)) declared.add(m[1]);
  }

  for (const { slot, vars } of renderers) {
    const missing = vars.filter(
      (v) => v.startsWith("$") && !declared.has(v),
    );
    if (missing.length > 0) {
      drift.push({ file, componentType, slot, missing });
    }
  }
}

describe("Renderer contextVars must be declared in OPTIMIZER_METADATA or metadata.contextVars", () => {
  it("audits at least one component (sanity check)", () => {
    // If audited is empty, the regex / file walker is broken — fail loudly.
    expect(audited.length).toBeGreaterThan(0);
  });

  it("has zero drift across all built-in components with static renderer contextVars", () => {
    if (drift.length > 0) {
      const report = drift
        .map(
          (d) =>
            `  ${d.componentType} (${d.file.replace(/^.*\/components\//, "components/")}): ` +
            `renderer "${d.slot}" injects [${d.missing.join(", ")}] not declared in ` +
            `OPTIMIZER_METADATA.${d.componentType}.childInjectedVars or metadata.contextVars`,
        )
        .join("\n");
      throw new Error(
        `Renderer contextVars drift detected (Group S follow-up):\n${report}\n\n` +
          `Fix: add the missing $-keys to OPTIMIZER_METADATA.<Component>.childInjectedVars ` +
          `in xmlui/src/components-core/optimization/optimizer-metadata.ts.`,
      );
    }
    expect(drift).toEqual([]);
  });
});
