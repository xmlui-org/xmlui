import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { collectedComponentMetadata } from "../../../src/components/collectedComponentMetadata";
import { DataLoaderMd } from "../../../src/components-core/loader/DataLoader";

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

const allFiles = listComponentTsxFiles(COMPONENTS_DIR);
const COMPONENTS_CORE_DIR = resolve(__dirname, "../../../src/components-core");
const allCoreFiles = listComponentTsxFiles(COMPONENTS_CORE_DIR);
const allFilesToAudit = [...allFiles, ...allCoreFiles];

/** Combined metadata map for audit purposes — includes all registered components + internal ones */
const AUDIT_METADATA: Record<string, any> = {
  ...collectedComponentMetadata,
  DataLoader: DataLoaderMd,
};

interface DriftRow {
  file: string;
  componentType: string;
  slot: string;
  missing: string[];
}

const drift: DriftRow[] = [];
const audited: string[] = [];

for (const file of allFilesToAudit) {
  const source = readFileSync(file, "utf-8");
  const renderers = extractRendererContextVars(source);
  if (renderers.length === 0) continue;
  const componentType = extractRegisteredName(source);
  if (!componentType) continue;
  audited.push(`${componentType} (${file.replace(/^.*\/src\//, "")})`);

  const optEntry = AUDIT_METADATA[componentType];
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

describe("Renderer contextVars must be declared in inline childInjectedVars or metadata.contextVars", () => {
  it("audits at least one component (sanity check)", () => {
    // Replicate the spirit of drift-test.js by confirming file counts
    // console.log(`Found ${allFiles.length} comp files and ${allCoreFiles.length} core files.`);
    expect(allFiles.length).toBeGreaterThan(0);
    expect(allCoreFiles.length).toBeGreaterThan(0);
    expect(audited.length).toBeGreaterThan(0);
  });

  it("has zero drift across all built-in components with static renderer contextVars", () => {
    if (drift.length > 0) {
      const report = drift
        .map(
          (d) =>
            `  ${d.componentType} (${d.file.replace(/^.*\/components\//, "components/")}): ` +
            `renderer "${d.slot}" injects [${d.missing.join(", ")}] not declared in ` +
            `optimization.childInjectedVars in <Component>/${d.componentType}.tsx or metadata.contextVars`,
        )
        .join("\n");
      throw new Error(
        `Renderer contextVars drift detected (Group S follow-up):\n${report}\n\n` +
          `Fix: add the missing $-keys to optimization.childInjectedVars in <Component>/<Component>.tsx ` +
          `in the component's createMetadata call.`,
      );
    }
    expect(drift).toEqual([]);
  });
});

describe("childInjectedVars / injectedVars vars have a string-literal presence in source (U-audit.2)", () => {
  // Map component names to their source code using the same file scan as above
  const componentToSourceMap = new Map<string, { file: string; source: string }>();

  for (const file of allFilesToAudit) {
    const source = readFileSync(file, "utf-8");
    const componentType = extractRegisteredName(source);
    if (componentType) {
      componentToSourceMap.set(componentType, { file, source });
    }
  }

  // DataLoader is internal (not in allFilesToAudit) — add manually
  const dataLoaderFile = resolve(__dirname, "../../../src/components-core/loader/DataLoader.tsx");
  componentToSourceMap.set("DataLoader", {
    file: dataLoaderFile,
    source: readFileSync(dataLoaderFile, "utf-8"),
  });

  for (const [componentType, runtimeMd] of Object.entries(AUDIT_METADATA)) {
    const entry = runtimeMd as {
      childInjectedVars?: readonly string[];
      unstableChildInjectedVars?: readonly string[];
      events?: Record<string, { injectedVars?: readonly string[] }>;
    };

    const hasVarsToCheck =
      (entry.childInjectedVars?.length ?? 0) > 0 ||
      (entry.unstableChildInjectedVars?.length ?? 0) > 0 ||
      Object.values(entry.events ?? {}).some((e) => (e.injectedVars?.length ?? 0) > 0);

    if (!hasVarsToCheck) continue;

    it(`${componentType}: has string literals for all inline injected variables`, () => {
      const sourceInfo = componentToSourceMap.get(componentType);

      let source = sourceInfo?.source;
      let filePath = sourceInfo?.file;

      if (!source) {
        const potentialFile = allFilesToAudit.find((f) =>
          f.endsWith(`/${componentType}/${componentType}.tsx`),
        );
        if (potentialFile) {
          source = readFileSync(potentialFile, "utf-8");
          filePath = potentialFile;
        }
      }

      // If source file not found — skip (component may be in extensions or core)
      if (!source) return;

      // Special cases: vars live across multiple related files
      if (componentType === "Table" || componentType === "Column") {
        const tableReactFile = filePath!.replace("Column/Column.tsx", "Table/TableReact.tsx");
        try { source += readFileSync(tableReactFile, "utf-8"); } catch (_) {}
        const columnReactFile = filePath!.replace(".tsx", "React.tsx");
        try { source += readFileSync(columnReactFile, "utf-8"); } catch (_) {}
      } else if (componentType === "RadioGroup") {
        const radioReactFile = filePath!.replace(".tsx", "React.tsx");
        try { source += readFileSync(radioReactFile, "utf-8"); } catch (_) {}
      } else if (componentType === "Checkbox") {
        const toggleFile = filePath!.replace("Checkbox/Checkbox.tsx", "Toggle/Toggle.tsx");
        try { source += readFileSync(toggleFile, "utf-8"); } catch (_) {}
      }

      function checkVars(vars: readonly string[], label: string): void {
        const missing: string[] = [];
        for (const v of vars) {
          const escapedV = v.replace("$", "\\\\$");
          const regex = new RegExp(`${escapedV}(?![a-zA-Z0-9_])`);
          if (
            !source!.includes(`"${v}"`) &&
            !source!.includes(`'${v}'`) &&
            !source!.includes(`\`${v}\``) &&
            !source!.includes(`${v}:`) &&
            !regex.test(source!)
          ) {
            missing.push(v);
          }
        }
        if (missing.length > 0) {
          throw new Error(
            `[U-audit.2] String literal presence check failed for ${componentType} (${label}) in ${filePath}:\n` +
            `  Missing: [${missing.join(", ")}]\n\n` +
            `Fix: Either use the variable in the component source, or remove it from createMetadata optimization block.`,
          );
        }
      }

      if (entry.childInjectedVars?.length) checkVars(entry.childInjectedVars, "childInjectedVars");
      if (entry.unstableChildInjectedVars?.length) checkVars(entry.unstableChildInjectedVars, "unstableChildInjectedVars");

      if (entry.events) {
        for (const [eventName, eventEntry] of Object.entries(entry.events)) {
          if (eventEntry.injectedVars?.length) {
            checkVars(eventEntry.injectedVars, `events.${eventName}.injectedVars`);
          }
        }
      }
    });
  }
});

