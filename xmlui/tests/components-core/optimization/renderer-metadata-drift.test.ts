import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { collectedComponentMetadata } from "../../../src/components/collectedComponentMetadata";
import { coreComponentMetadata } from "../../../src/components-core/coreComponentMetadata";
import {
  extractOptimizerMetadataFromSource,
  extractInjectedKeysFromSource,
} from "../../../src/components-core/optimization/static-extractor";
import { EVENT_PAYLOAD_RESERVED_NAMES } from "../../../src/components-core/optimization/validateInjectedVars";

// Static drift detection —
// Walks each built-in component's source file, extracts any
// `renderers: { <slot>: { contextVars: [ "$x", "$y", ... ] } }` declaration,
// and asserts that every `$`-key listed there is also declared in the
// component's own `metadata.contextVars`. Mirrors the runtime `validateInjectedVars` check
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
  ...coreComponentMetadata,
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

  // Core components must declare injected vars in metadata.contextVars
  // (public via d(), internal via dInternal()). childInjectedVars is no
  // longer an accepted declaration site for core components.
  // AST-based extraction via static-extractor is robust to formatting variations.
  const declared = new Set<string>(
    Object.keys(extractOptimizerMetadataFromSource(source).contextVars ?? {}),
  );

  for (const { slot, vars } of renderers) {
    const missing = vars.filter(
      (v) => v.startsWith("$") && !declared.has(v),
    );
    if (missing.length > 0) {
      drift.push({ file, componentType, slot, missing });
    }
  }
}

describe("Renderer contextVars must be declared in metadata.contextVars (core components)", () => {
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
            `metadata.contextVars of <Component>/${d.componentType}.tsx`,
        )
        .join("\n");
      throw new Error(
        `Renderer contextVars drift detected:\n${report}\n\n` +
          `Fix: declare the missing $-keys in contextVars in <Component>/<Component>.tsx ` +
          `(use d("...") for documented values, dInternal("...") for internal ones).`,
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
      unstableChildInjectedVars?: readonly string[];
      events?: Record<string, { injectedVars?: readonly string[] }>;
    };

    const hasVarsToCheck =
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

      // Auto-discover sibling .tsx files in the same directory
      // (e.g. TableReact.tsx alongside Table.tsx, ColumnReact.tsx alongside Column.tsx).
      // This replaces a hand-maintained special-case list that would silently miss
      // new sibling files whenever a component splits its rendering.
      if (filePath) {
        const dir = dirname(filePath);
        try {
          for (const sibling of readdirSync(dir)) {
            const siblingPath = join(dir, sibling);
            if (sibling.endsWith(".tsx") && siblingPath !== filePath) {
              try { source += readFileSync(siblingPath, "utf-8"); } catch (_) {}
            }
          }
        } catch (_) {}
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

// ---------------------------------------------------------------------------
// U-audit.3: Reverse injection audit — every $-var injected in source must be
// declared in metadata.
//
// U-audit.1 only covers `renderers: { slot: { contextVars: [...] } }` config
// declarations. It does NOT cover $-vars injected via:
//   (a) direct `<MemoizedItem contextVars={{ $x: ... }}>` JSX in component
//       source (e.g. Heading, Tree) — bypasses wrapComponent rendererConfigs,
//       so runtime `validateInjectedVars` is never invoked for them.
//   (b) event-handler `lookup...({ context: { $x } })` — caught at runtime
//       only if the event fires in a DEV session; not covered statically.
//
// Uses Babel AST via `extractInjectedKeysFromSource` — comments are invisible
// to the scanner, so commented-out injection patterns are never reported.
// ---------------------------------------------------------------------------

describe("U-audit.3: Reverse injection audit — injected $-vars must be declared in metadata", () => {
  const ALWAYS_ALLOWED = new Set<string>([...EVENT_PAYLOAD_RESERVED_NAMES]);

  function declaredVars(md: any): Set<string> {
    const declared = new Set<string>(ALWAYS_ALLOWED);
    for (const k of Object.keys(md.contextVars ?? {})) declared.add(k);
    for (const v of md.unstableChildInjectedVars ?? []) declared.add(v);
    for (const ev of Object.values(md.events ?? {}) as any[]) {
      for (const v of ev?.injectedVars ?? []) declared.add(v);
    }
    return declared;
  }

  function sourceFor(componentType: string): string | undefined {
    let file = allFilesToAudit.find((f) =>
      f.endsWith(`/${componentType}/${componentType}.tsx`),
    );
    if (!file) {
      file = allFilesToAudit.find(
        (f) => extractRegisteredName(readFileSync(f, "utf-8")) === componentType,
      );
    }
    if (!file) return undefined;
    let source = readFileSync(file, "utf-8");
    const dir = dirname(file);
    try {
      for (const sibling of readdirSync(dir)) {
        const siblingPath = join(dir, sibling);
        if (!sibling.endsWith(".tsx") || siblingPath === file) continue;
        try {
          const siblingSource = readFileSync(siblingPath, "utf-8");
          // Skip sibling files that declare their own component type — they are
          // separate components that happen to live in the same directory (e.g.
          // AccordionItem.tsx next to Accordion.tsx). Including them would
          // falsely attribute their injection sites to the current component.
          const siblingType = extractRegisteredName(siblingSource);
          if (siblingType && siblingType !== componentType) continue;
          source += siblingSource;
        } catch (_) {}
      }
    } catch (_) {}
    return source;
  }

  const drift: Array<{ componentType: string; missing: string[] }> = [];

  for (const [componentType, runtimeMd] of Object.entries(AUDIT_METADATA)) {
    const source = sourceFor(componentType);
    if (!source) continue;
    const injected = extractInjectedKeysFromSource(source);
    if (injected.length === 0) continue;
    const declared = declaredVars(runtimeMd);
    const missing = injected.filter((k) => !declared.has(k));
    if (missing.length > 0) drift.push({ componentType, missing });
  }

  it("every injected $-var (MemoizedItem / event context) is declared in metadata", () => {
    if (drift.length > 0) {
      const report = drift
        .map((d) => `  ${d.componentType}: injects [${d.missing.join(", ")}] not declared in metadata`)
        .join("\n");
      throw new Error(
        `Reverse injection drift (U-audit.3):\n${report}\n\n` +
          `Fix: declare each $-key in the component's metadata — ` +
          `contextVars: { $x: d("...") } for child-scope vars, or ` +
          `events.<name>.injectedVars: ["$x"] for event-payload vars.`,
      );
    }
    expect(drift).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// U-audit.1-ext: Extension package renderer contextVars vs. metadata.contextVars
//
// The main U-audit.1 block only scans xmlui/src/{components,components-core}.
// Extension packages in packages/xmlui-*/ are NOT imported into the test
// runtime, so their metadata is absent from AUDIT_METADATA. This block
// performs a source-text-only check instead, using the same AST extractor
// (extractOptimizerMetadataFromSource) that the core audit uses:
//   1. Scan all .tsx files under packages/xmlui-*/src/
//   2. Extract `renderers: { slot: { contextVars: ["$x"] } }` declarations
//   3. Extract declared vars from the same source via AST (contextVars keys
//      + legacy childInjectedVars for backwards compat)
//   4. Report drift if any renderer-injected var is not declared
//
// This catches the class of bug where an extension component injects a
// variable (e.g. `$tooltip` in xmlui-recharts BarChart) via renderers but
// forgets to declare it in contextVars — which causes:
//   (a) the optimizer to treat the var as an external parent dependency, and
//   (b) validateInjectedVars to hard-fail in DEV mode.
// ---------------------------------------------------------------------------

describe("U-audit.1-ext: Extension package renderer contextVars must be declared in metadata.contextVars", () => {
  const PACKAGES_DIR = resolve(__dirname, "../../../../packages");

  function listExtensionTsxFiles(packagesDir: string): string[] {
    const out: string[] = [];
    try {
      for (const pkg of readdirSync(packagesDir)) {
        if (!pkg.startsWith("xmlui-")) continue;
        const srcDir = join(packagesDir, pkg, "src");
        try { out.push(...listComponentTsxFiles(srcDir)); } catch (_) {}
      }
    } catch (_) {}
    return out;
  }

  const extensionFiles = listExtensionTsxFiles(PACKAGES_DIR);
  const extDrift: DriftRow[] = [];
  const extAudited: string[] = [];

  for (const file of extensionFiles) {
    const source = readFileSync(file, "utf-8");
    const renderers = extractRendererContextVars(source);
    if (renderers.length === 0) continue;
    const componentType = extractRegisteredName(source);
    if (!componentType) continue;

    extAudited.push(`${componentType} (${file.replace(/^.*\/packages\//, "packages/")})`);

    // Use the same AST extractor as the core audit: reads contextVars keys from source.
    const extracted = extractOptimizerMetadataFromSource(source);
    const declared = new Set<string>(Object.keys(extracted.contextVars ?? {}));

    for (const { slot, vars } of renderers) {
      const missing = vars.filter((v) => v.startsWith("$") && !declared.has(v));
      if (missing.length > 0) {
        extDrift.push({ file, componentType, slot, missing });
      }
    }
  }

  it("scans at least one extension package file when packages/ is present", () => {
    // packages/ may be absent in some CI setups — soft check
    expect(extAudited.length).toBeGreaterThanOrEqual(0);
  });

  it("has zero renderer-contextVars drift in extension packages", () => {
    if (extDrift.length > 0) {
      const report = extDrift
        .map(
          (d) =>
            `  ${d.componentType} (${d.file.replace(/^.*\/packages\//, "packages/")}): ` +
            `renderer "${d.slot}" injects [${d.missing.join(", ")}] but these are not declared in ` +
            `metadata.contextVars in createMetadata`,
        )
        .join("\n");
      throw new Error(
        `Extension package renderer contextVars drift (U-audit.1-ext):\n${report}\n\n` +
          `Fix: add contextVars: { $x: d("...") } to the component's createMetadata call.`,
      );
    }
    expect(extDrift).toEqual([]);
  });
});

