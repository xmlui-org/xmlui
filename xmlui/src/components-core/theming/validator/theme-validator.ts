/**
 * Theme validator (plan #08, Step 1.2).
 *
 * Runs over a resolved theme map (variable name → string value)
 * paired with the declared metadata. Produces one `ThemeDiagnostic`
 * per violation; the caller decides whether to keep the offending
 * declaration (non-strict) or drop it (strict).
 *
 * The validator is intentionally side-effect free: pushing entries
 * to the trace, console, or toast pipeline is the caller's job.
 */

import type { ThemeVarMetadata } from "../../../abstractions/ComponentDefs";
import type { ThemeDiagnostic } from "./diagnostics";
import { verifyThemeValue } from "./rule-table";

export interface ValidateThemeOptions {
  /** When `true`, severity is `"error"` rather than `"warn"`. */
  strict?: boolean;
}

/**
 * Validate a resolved theme map against the declared metadata.
 *
 * @param resolved Final theme values (after `$reference` resolution)
 *   keyed by variable name (without leading `--`).
 * @param declarations Variable name → metadata. A variable present in
 *   `resolved` but missing here emits `unknown-theme-variable` (warn).
 */
export function validateTheme(
  resolved: ReadonlyMap<string, string>,
  declarations: ReadonlyMap<string, ThemeVarMetadata>,
  opts: ValidateThemeOptions = {},
): ThemeDiagnostic[] {
  const strict = !!opts.strict;
  const out: ThemeDiagnostic[] = [];
  for (const [name, value] of resolved) {
    const decl = declarations.get(name);
    if (!decl) {
      // Unknown variables are *always* warn — late-registered
      // third-party extension packages can declare variables after
      // the initial validation pass.
      out.push({
        code: "unknown-theme-variable",
        severity: "warn",
        variableName: name,
        actual: value,
        message: `Theme variable "${name}" is not declared by any component.`,
      });
      continue;
    }
    // Closed enum takes priority over `valueType`.
    if (decl.availableValues && decl.availableValues.length > 0) {
      if (!decl.availableValues.includes(value)) {
        out.push({
          code: "invalid-theme-value",
          severity: strict ? "error" : "warn",
          variableName: name,
          expected: decl.availableValues.join(" | "),
          actual: value,
          message:
            `Theme variable "${name}" got ${JSON.stringify(value)}; ` +
            `expected one of: ${decl.availableValues.join(", ")}.`,
        });
      }
      continue;
    }
    const failure = verifyThemeValue(decl.valueType, value);
    if (failure) {
      out.push({
        code: "invalid-theme-value",
        severity: strict ? "error" : "warn",
        variableName: name,
        expected: failure.expected ?? decl.valueType,
        actual: value,
        message: `Theme variable "${name}": ${failure.message}`,
      });
    }
  }
  return out;
}
