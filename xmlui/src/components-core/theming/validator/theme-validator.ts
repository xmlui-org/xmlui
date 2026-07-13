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

import type { ThemeValueType, ThemeVarMetadata } from "../../../abstractions/ComponentDefs";
import { parseHVar } from "../hvar";
import type { ThemeDiagnostic } from "./diagnostics";
import { verifyThemeValue } from "./rule-table";

export interface ValidateThemeOptions {
  /** When `true`, severity is `"error"` rather than `"warn"`. */
  strict?: boolean;
  /** Theme variable names known by metadata/defaults but not necessarily typed. */
  knownNames?: ReadonlySet<string>;
  /** When true, keep derived diagnostics that are usually hidden from users. */
  includeDerived?: boolean;
}

/**
 * Validate a resolved theme map against the declared metadata.
 *
 * @param resolved Final theme values (after `$reference` resolution)
 *   keyed by variable name (without leading `--`).
 * @param declarations Variable name → metadata. A variable present in
 *   `resolved` but missing from both `declarations` and `knownNames`
 *   emits `unknown-theme-variable` (warn).
 */
export function validateTheme(
  resolved: ReadonlyMap<string, string>,
  declarations: ReadonlyMap<string, ThemeVarMetadata>,
  opts: ValidateThemeOptions = {},
): ThemeDiagnostic[] {
  const strict = !!opts.strict;
  const knownNames = opts.knownNames;
  const out: ThemeDiagnostic[] = [];
  for (const [name, value] of resolved) {
    if (isUnsetThemeValue(value)) continue;
    const decl = declarations.get(name);
    if (!decl) {
      if (knownNames?.has(name)) {
        const inferredValueType = inferThemeValueType(name);
        const failure = verifyThemeValue(inferredValueType, value);
        if (failure) {
          out.push({
            code: "invalid-theme-value",
            severity: strict ? "error" : "warn",
            variableName: name,
            expected: failure.expected ?? inferredValueType,
            actual: value,
            message: `Theme variable "${name}": ${failure.message}`,
          });
        }
        continue;
      }
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
    const valueType = decl.valueType ?? inferThemeValueType(name);
    const failure = verifyThemeValue(valueType, value);
    if (failure) {
      out.push({
        code: "invalid-theme-value",
        severity: strict ? "error" : "warn",
        variableName: name,
        expected: failure.expected ?? valueType,
        actual: value,
        message: `Theme variable "${name}": ${failure.message}`,
      });
    }
  }
  return opts.includeDerived ? out : suppressDerivedThemeVarDiagnostics(out);
}

function isUnsetThemeValue(value: unknown): boolean {
  return typeof value === "string" && value.trim() === "";
}

function suppressDerivedThemeVarDiagnostics(diagnostics: ThemeDiagnostic[]): ThemeDiagnostic[] {
  return suppressDerivedPaddingDiagnostics(suppressDerivedHVarDiagnostics(diagnostics));
}

function suppressDerivedHVarDiagnostics(diagnostics: ThemeDiagnostic[]): ThemeDiagnostic[] {
  const invalidNames = new Set(
    diagnostics
      .filter((diagnostic) => diagnostic.code === "invalid-theme-value" && diagnostic.variableName)
      .map((diagnostic) => diagnostic.variableName!),
  );

  return diagnostics.filter((diagnostic) => {
    if (diagnostic.code !== "invalid-theme-value" || !diagnostic.variableName) return true;
    const hvar = parseHVar(diagnostic.variableName);
    if (!hvar || (!hvar.classes.length && !hvar.traits.length && !hvar.states.length)) {
      return true;
    }
    const baseNames = [
      `${hvar.attribute}-${hvar.component}`,
      ...hvar.classes.map((className) => `${hvar.attribute}-${className}`),
    ];
    return !baseNames.some((baseName) => baseName !== diagnostic.variableName && invalidNames.has(baseName));
  });
}

const DERIVED_PADDING_RE =
  /^(padding|paddingTop|paddingRight|paddingBottom|paddingLeft|paddingHorizontal|paddingVertical)-(.+)$/;
function suppressDerivedPaddingDiagnostics(diagnostics: ThemeDiagnostic[]): ThemeDiagnostic[] {
  const invalidNames = new Set(
    diagnostics
      .filter((diagnostic) => diagnostic.code === "invalid-theme-value" && diagnostic.variableName)
      .map((diagnostic) => diagnostic.variableName!),
  );

  return diagnostics.filter((diagnostic) => {
    if (diagnostic.code !== "invalid-theme-value" || !diagnostic.variableName) return true;
    const match = DERIVED_PADDING_RE.exec(diagnostic.variableName);
    if (!match) return true;
    const attribute = match[1];
    const remainder = match[2];
    const baseRemainder = basePaddingRemainder(remainder);
    const sourceNames = new Set<string>();
    if (baseRemainder && baseRemainder !== remainder) {
      sourceNames.add(`padding-${baseRemainder}`);
    }
    if (attribute === "paddingTop" || attribute === "paddingBottom") {
      sourceNames.add(`padding-${remainder}`);
      sourceNames.add(`paddingVertical-${remainder}`);
      if (baseRemainder && baseRemainder !== remainder) {
        sourceNames.add(`paddingVertical-${baseRemainder}`);
      }
    } else if (attribute === "paddingRight" || attribute === "paddingLeft") {
      sourceNames.add(`padding-${remainder}`);
      sourceNames.add(`paddingHorizontal-${remainder}`);
      if (baseRemainder && baseRemainder !== remainder) {
        sourceNames.add(`paddingHorizontal-${baseRemainder}`);
      }
    } else if (attribute === "paddingHorizontal" || attribute === "paddingVertical") {
      sourceNames.add(`padding-${remainder}`);
      if (baseRemainder && baseRemainder !== remainder) {
        sourceNames.add(`${attribute}-${baseRemainder}`);
      }
    } else if (!baseRemainder || baseRemainder === remainder) {
      return true;
    }
    return !Array.from(sourceNames).some((sourceName) => invalidNames.has(sourceName));
  });
}

function basePaddingRemainder(remainder: string): string | undefined {
  const match = /^([A-Z][A-Za-z0-9_]*)(?:-.+)?$/.exec(remainder);
  return match?.[1];
}

const ATTRIBUTE_VALUE_TYPES: ReadonlyMap<string, ThemeValueType> = new Map([
  ["backgroundColor", "color"],
  ["borderColor", "color"],
  ["color", "color"],
  ["fill", "color"],
  ["outlineColor", "color"],
  ["textColor", "color"],
  ["textDecorationColor", "color"],
  ["caretColor", "color"],
  ["accentColor", "color"],
  ["shadow", "shadow"],
  ["boxShadow", "shadow"],
  ["textShadow", "shadow"],
  ["border", "border"],
  ["borderTop", "border"],
  ["borderRight", "border"],
  ["borderBottom", "border"],
  ["borderLeft", "border"],
  ["borderHorizontal", "border"],
  ["borderVertical", "border"],
  ["borderWidth", "length"],
  ["borderTopWidth", "length"],
  ["borderRightWidth", "length"],
  ["borderBottomWidth", "length"],
  ["borderLeftWidth", "length"],
  ["borderRadius", "length"],
  ["radiusTopLeft", "length"],
  ["radiusTopRight", "length"],
  ["radiusBottomLeft", "length"],
  ["radiusBottomRight", "length"],
  ["padding", "length"],
  ["paddingTop", "length"],
  ["paddingRight", "length"],
  ["paddingBottom", "length"],
  ["paddingLeft", "length"],
  ["paddingHorizontal", "length"],
  ["paddingVertical", "length"],
  ["margin", "length"],
  ["marginTop", "length"],
  ["marginRight", "length"],
  ["marginBottom", "length"],
  ["marginLeft", "length"],
  ["marginHorizontal", "length"],
  ["marginVertical", "length"],
  ["gap", "length"],
  ["rowGap", "length"],
  ["columnGap", "length"],
  ["width", "length"],
  ["height", "length"],
  ["minWidth", "length"],
  ["maxWidth", "length"],
  ["minHeight", "length"],
  ["maxHeight", "length"],
  ["outlineWidth", "length"],
  ["outlineOffset", "length"],
  ["fontSize", "length"],
  ["lineHeight", "lineHeight"],
  ["letterSpacing", "length"],
  ["wordSpacing", "length"],
  ["fontFamily", "fontFamily"],
  ["fontWeight", "fontWeight"],
  ["transitionDuration", "duration"],
  ["animationDuration", "duration"],
  ["transitionTimingFunction", "easing"],
  ["animationTimingFunction", "easing"],
  ["zIndex", "integer"],
]);

function inferThemeValueType(name: string): ThemeValueType | undefined {
  const denamespaced = name.substring(name.lastIndexOf(":") + 1);
  if (!/-[A-Z]/.test(denamespaced)) return undefined;
  const attribute = denamespaced.split("-")[0];
  return ATTRIBUTE_VALUE_TYPES.get(attribute);
}
