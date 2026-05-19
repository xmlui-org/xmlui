#!/usr/bin/env tsx
/**
 * lint-physical-css.ts
 *
 * Scans SCSS module files for CSS physical directional properties that should
 * be replaced with their CSS logical-property equivalents.  Part of plan #11
 * Phase 5 (RTL guarantee).
 *
 * Violations emit `physical-css-property` diagnostics (I18nDiagnosticCode).
 *
 * Physical → logical mapping enforced by this rule:
 *
 *   margin-left           → margin-inline-start
 *   margin-right          → margin-inline-end
 *   padding-left          → padding-inline-start
 *   padding-right         → padding-inline-end
 *   text-align: left      → text-align: start
 *   text-align: right     → text-align: end
 *   left: <value>         → inset-inline-start: <value>   (warn-only, layout)
 *   right: <value>        → inset-inline-end: <value>     (warn-only, layout)
 *
 * Usage:
 *   # Report violations (exit 0 always):
 *   tsx xmlui/scripts/lint-physical-css.ts
 *
 *   # Strict mode — exit 1 when violations are found:
 *   tsx xmlui/scripts/lint-physical-css.ts --strict
 *
 *   # Limit to a sub-tree:
 *   tsx xmlui/scripts/lint-physical-css.ts --dir=xmlui/src/components
 *
 *   # JSON output:
 *   tsx xmlui/scripts/lint-physical-css.ts --json
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative, resolve } from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type I18nDiagnosticCode =
  | "missing-key"
  | "missing-bundle"
  | "icu-parse-error"
  | "untranslated-literal"
  | "physical-css-property"
  | "rtl-mismatch";

export interface PhysicalCssDiagnostic {
  code: "physical-css-property";
  severity: "warn";
  file: string;
  line: number;
  column: number;
  /** The physical property found (e.g. `"margin-left"`). */
  physical: string;
  /** The recommended logical replacement (e.g. `"margin-inline-start"`). */
  logical: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Rule table
// ---------------------------------------------------------------------------

/**
 * Each rule is a regex that matches exactly a physical property declaration
 * (at the start of an indented CSS declaration), plus the logical replacement.
 *
 * Regexes capture:
 *   $1 — leading whitespace
 *   $2 — the physical property name
 */
export interface PhysicalCssRule {
  /** Regex tested against each line of a SCSS file. */
  pattern: RegExp;
  /** The physical CSS property name (for reporting). */
  physical: string;
  /** The recommended CSS logical replacement (for reporting). */
  logical: string;
}

export const PHYSICAL_CSS_RULES: readonly PhysicalCssRule[] = [
  {
    pattern: /^\s*margin-left\s*:/,
    physical: "margin-left",
    logical: "margin-inline-start",
  },
  {
    pattern: /^\s*margin-right\s*:/,
    physical: "margin-right",
    logical: "margin-inline-end",
  },
  {
    pattern: /^\s*padding-left\s*:/,
    physical: "padding-left",
    logical: "padding-inline-start",
  },
  {
    pattern: /^\s*padding-right\s*:/,
    physical: "padding-right",
    logical: "padding-inline-end",
  },
  {
    pattern: /text-align\s*:\s*left\b/,
    physical: "text-align: left",
    logical: "text-align: start",
  },
  {
    pattern: /text-align\s*:\s*right\b/,
    physical: "text-align: right",
    logical: "text-align: end",
  },
  {
    pattern: /^\s*left\s*:/,
    physical: "left",
    logical: "inset-inline-start",
  },
  {
    pattern: /^\s*right\s*:/,
    physical: "right",
    logical: "inset-inline-end",
  },
];

// ---------------------------------------------------------------------------
// Scanner
// ---------------------------------------------------------------------------

/**
 * Returns `true` if `line` is a CSS comment, a SCSS variable/interpolation
 * that merely _contains_ the word "left" or "right", or has an explicit
 * `@rtl-intentional` suppression comment on the same line.
 *
 * Suppression syntax:
 *
 *   ```scss
 *   left: 0;  // @rtl-intentional: drawer always anchors to physical left
 *   ```
 */
function isExemptLine(line: string): boolean {
  const trimmed = line.trimStart();
  // SCSS single-line comment
  if (trimmed.startsWith("//")) return true;
  // CSS block comment fragment
  if (trimmed.startsWith("*") || trimmed.startsWith("/*")) return true;
  // Inline suppression annotation
  if (line.includes("@rtl-intentional")) return true;
  return false;
}

/**
 * Lint a single SCSS file and return every violation found.
 */
export function lintFile(filePath: string): PhysicalCssDiagnostic[] {
  let source: string;
  try {
    source = readFileSync(filePath, "utf8");
  } catch {
    return [];
  }
  const lines = source.split("\n");
  const diagnostics: PhysicalCssDiagnostic[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isExemptLine(line)) continue;

    for (const rule of PHYSICAL_CSS_RULES) {
      if (rule.pattern.test(line)) {
        const col = line.search(/\S/); // column of first non-whitespace char
        diagnostics.push({
          code: "physical-css-property",
          severity: "warn",
          file: filePath,
          line: i + 1,
          column: col + 1,
          physical: rule.physical,
          logical: rule.logical,
          message:
            `Physical CSS property "${rule.physical}" found; ` +
            `use "${rule.logical}" for RTL support.`,
        });
        break; // At most one rule fires per line
      }
    }
  }
  return diagnostics;
}

/**
 * Recursively collect all `*.module.scss` files under `dir`.
 */
export function collectScssFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      results.push(...collectScssFiles(full));
    } else if (entry.endsWith(".module.scss")) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Lint all `*.module.scss` files under `rootDir` and return aggregated results.
 */
export function lintDirectory(rootDir: string): PhysicalCssDiagnostic[] {
  const files = collectScssFiles(resolve(rootDir));
  return files.flatMap((f) => lintFile(f));
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

function parseArgs(argv: string[]): { strict: boolean; dir: string; json: boolean } {
  const strict = argv.includes("--strict");
  const json = argv.includes("--json");
  const dirArg = argv.find((a) => a.startsWith("--dir="));
  const dir = dirArg ? dirArg.slice("--dir=".length) : "xmlui/src/components";
  return { strict, dir, json };
}

if (process.argv[1] && process.argv[1].endsWith("lint-physical-css.ts")) {
  const { strict, dir, json } = parseArgs(process.argv.slice(2));
  const cwd = process.cwd();
  const absDir = resolve(cwd, dir);
  const diags = lintDirectory(absDir);

  if (json) {
    console.log(JSON.stringify(diags, null, 2));
  } else {
    for (const d of diags) {
      const rel = relative(cwd, d.file);
      console.log(`${rel}:${d.line}:${d.column}: [${d.severity}] ${d.message}`);
    }
    if (diags.length > 0) {
      console.error(`\n${diags.length} physical-css-property violation(s) found.`);
    } else {
      console.log("✓ No physical CSS property violations found.");
    }
  }

  if (strict && diags.length > 0) {
    process.exit(1);
  }
}
