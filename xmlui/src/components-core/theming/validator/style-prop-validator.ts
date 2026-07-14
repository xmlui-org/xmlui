/**
 * Inline-style validator (plan #08, Steps 2.1 + 2.2).
 *
 * Two surfaces:
 *
 * 1. `validateInlineStyle(ctx)` — single-value layout prop check.
 *    Used by `valueExtractor` for `width`, `height`, `padding*`,
 *    `margin*`, `gap`, `border*`, `borderRadius`, `boxShadow`,
 *    `opacity`, `zIndex`, etc. Returns the (possibly clamped) value
 *    plus diagnostics.
 *
 * 2. `validateStyleString(raw)` — token funnel for the catch-all
 *    `style` prop. Parses each `property: value;` declaration and
 *    delegates to the rule table. Banned declarations
 *    (`position: fixed|sticky`, `url(...)` when `allowInlineRawCss`
 *    is false, `!important` when `allowInlineRawCss` is false) are
 *    flagged and (in strict mode) dropped from the returned string.
 */

import type { ThemeValueType } from "../../../abstractions/ComponentDefs";
import type { ThemeDiagnostic } from "./diagnostics";
import { lookupThemeRule, verifyThemeValue } from "./rule-table";

export interface InlineStyleContext {
  /** Component metadata `name` (used in diagnostics). */
  componentName?: string;
  /** Prop name (e.g. `"width"`, `"padding"`, `"zIndex"`). */
  propName: string;
  /** Expected `ThemeValueType` for this prop. */
  valueType?: ThemeValueType;
  /** Raw value the user passed. */
  rawValue: string | number | undefined;
}

export interface InlineStyleOptions {
  /** When `true`, escalate severity to `"error"` and drop the value on failure. */
  strict?: boolean;
  /** When `false`, ban `url(...)` and `!important` from the `style` prop. */
  allowRawCss?: boolean;
  /** Ceiling for `zIndex` clamping. Defaults to `9999`. */
  maxZIndex?: number;
}

export interface InlineStyleResult<V> {
  /** The validated value. Cleared to `undefined` when strict mode drops it. */
  value: V;
  /** Diagnostics produced during validation. */
  diagnostics: ThemeDiagnostic[];
}

/**
 * Validate a single layout-prop value against the prop's declared
 * `ThemeValueType`.
 */
export function validateInlineStyle(
  ctx: InlineStyleContext,
  opts: InlineStyleOptions = {},
): InlineStyleResult<string | number | undefined> {
  const strict = !!opts.strict;
  const diagnostics: ThemeDiagnostic[] = [];
  const raw = ctx.rawValue;
  if (raw === undefined || raw === null || raw === "") {
    return { value: undefined, diagnostics };
  }
  // zIndex ceiling — applies in strict and non-strict modes.
  if (ctx.propName === "zIndex" && typeof raw === "number") {
    const ceiling = opts.maxZIndex ?? 9999;
    if (raw > ceiling) {
      diagnostics.push({
        code: "invalid-theme-value",
        severity: "warn",
        propName: ctx.propName,
        componentName: ctx.componentName,
        expected: `<= ${ceiling}`,
        actual: String(raw),
        message: `zIndex ${raw} exceeds the configured ceiling (${ceiling}); clamped.`,
      });
      return { value: ceiling, diagnostics };
    }
  }
  const failure = verifyThemeValue(ctx.valueType, raw);
  if (failure) {
    diagnostics.push({
      code: "invalid-theme-value",
      severity: strict ? "error" : "warn",
      propName: ctx.propName,
      componentName: ctx.componentName,
      expected: failure.expected ?? ctx.valueType,
      actual: String(raw),
      message: `Prop "${ctx.propName}": ${failure.message}`,
    });
    if (strict) return { value: undefined, diagnostics };
  }
  return { value: raw, diagnostics };
}

// --- `style` prop token funnel -------------------------------------------

/**
 * CSS property names structurally banned from the `style` prop. The
 * legitimate use cases for fixed/sticky positioning are framework
 * components (`Modal`, `Drawer`, `Toast`, `Popover`).
 */
const BANNED_POSITION_VALUES: ReadonlySet<string> = new Set(["fixed", "sticky"]);

/**
 * Mapping of CSS property names → `ThemeValueType`. Properties not
 * in this map are accepted in non-strict mode with a one-shot warn
 * (`raw-css-in-prop`) and dropped only when both `strict` and
 * `!allowRawCss`.
 */
const STYLE_PROP_TYPES: ReadonlyMap<string, ThemeValueType> = new Map([
  ["color", "color"],
  ["background", "string"],
  ["background-color", "color"],
  ["border-color", "color"],
  ["outline-color", "color"],
  ["fill", "color"],
  ["stroke", "color"],
  ["width", "length"],
  ["height", "length"],
  ["min-width", "length"],
  ["max-width", "length"],
  ["min-height", "length"],
  ["max-height", "length"],
  ["padding", "length"],
  ["padding-top", "length"],
  ["padding-right", "length"],
  ["padding-bottom", "length"],
  ["padding-left", "length"],
  ["margin", "length"],
  ["margin-top", "length"],
  ["margin-right", "length"],
  ["margin-bottom", "length"],
  ["margin-left", "length"],
  ["gap", "length"],
  ["row-gap", "length"],
  ["column-gap", "length"],
  ["top", "length"],
  ["right", "length"],
  ["bottom", "length"],
  ["left", "length"],
  ["border-radius", "length"],
  ["border", "border"],
  ["border-top", "border"],
  ["border-right", "border"],
  ["border-bottom", "border"],
  ["border-left", "border"],
  ["border-width", "length"],
  ["box-shadow", "shadow"],
  ["text-shadow", "shadow"],
  ["opacity", "number"],
  ["z-index", "integer"],
  ["font-family", "fontFamily"],
  ["font-weight", "fontWeight"],
  ["font-size", "length"],
  ["line-height", "lineHeight"],
  ["letter-spacing", "length"],
  ["transition-duration", "duration"],
  ["transition-timing-function", "easing"],
  ["animation-duration", "duration"],
  ["animation-timing-function", "easing"],
]);

const URL_RE = /\burl\s*\(/i;

export interface ValidateStyleStringContext {
  componentName?: string;
}

export interface ValidateStyleStringResult {
  /** The (possibly filtered, in strict mode) style string. */
  value: string;
  diagnostics: ThemeDiagnostic[];
}

/**
 * Parse the catch-all `style` prop into declarations and validate each.
 *
 * - `position: fixed|sticky` → `position-fixed-blocked`
 *   (warn / drop in strict).
 * - `url(...)` value → `url-in-style` when `!allowRawCss`.
 * - `!important` flag → `important-blocked` when `!allowRawCss`.
 * - Unknown properties → `raw-css-in-prop` (warn in non-strict,
 *   drop in strict + !allowRawCss).
 * - Known properties with invalid values → `invalid-theme-value`.
 */
export function validateStyleString(
  raw: string,
  ctx: ValidateStyleStringContext = {},
  opts: InlineStyleOptions = {},
): ValidateStyleStringResult {
  const strict = !!opts.strict;
  const allowRawCss = opts.allowRawCss ?? true;
  const diagnostics: ThemeDiagnostic[] = [];
  if (typeof raw !== "string" || raw.trim() === "") {
    return { value: raw ?? "", diagnostics };
  }
  const declarations = splitDeclarations(raw);
  const kept: string[] = [];
  for (const decl of declarations) {
    const colonIx = decl.indexOf(":");
    if (colonIx < 0) {
      // Malformed segment — keep verbatim, no diagnostic
      // (preserves existing behaviour for trailing comments etc.).
      kept.push(decl);
      continue;
    }
    const propName = decl.slice(0, colonIx).trim().toLowerCase();
    let value = decl.slice(colonIx + 1).trim();
    if (!propName || !value) {
      kept.push(decl);
      continue;
    }

    // `!important` handling.
    let hadImportant = false;
    const impMatch = value.match(/!\s*important\s*$/i);
    if (impMatch) {
      hadImportant = true;
      value = value.slice(0, impMatch.index).trim();
    }
    if (hadImportant && !allowRawCss) {
      diagnostics.push({
        code: "important-blocked",
        severity: strict ? "error" : "warn",
        propName,
        componentName: ctx.componentName,
        actual: decl,
        message: `"!important" flag is not allowed in the style prop.`,
      });
      if (strict) continue;
    }

    // `url(...)` handling.
    if (!allowRawCss && URL_RE.test(value)) {
      diagnostics.push({
        code: "url-in-style",
        severity: strict ? "error" : "warn",
        propName,
        componentName: ctx.componentName,
        actual: value,
        message: `url(...) is not allowed in the style prop; use <Image> or a theme variable.`,
      });
      if (strict) continue;
    }

    // position: fixed | sticky
    if (propName === "position" && BANNED_POSITION_VALUES.has(value.toLowerCase())) {
      diagnostics.push({
        code: "position-fixed-blocked",
        severity: strict ? "error" : "warn",
        propName,
        componentName: ctx.componentName,
        actual: value,
        message:
          `position: ${value} is not allowed in the style prop; use <Modal>, <Drawer>, <Toast>, or <Popover>.`,
      });
      if (strict) continue;
    }

    const valueType = STYLE_PROP_TYPES.get(propName);
    if (!valueType) {
      diagnostics.push({
        code: "raw-css-in-prop",
        severity: strict && !allowRawCss ? "error" : "warn",
        propName,
        componentName: ctx.componentName,
        actual: decl,
        message: `Style property "${propName}" is not validated; consider a typed theme variable.`,
      });
      if (strict && !allowRawCss) continue;
      kept.push(buildDeclaration(propName, value, hadImportant && allowRawCss));
      continue;
    }

    const rule = lookupThemeRule(valueType);
    if (rule) {
      const failure = rule.verify(value);
      if (failure) {
        diagnostics.push({
          code: "invalid-theme-value",
          severity: strict ? "error" : "warn",
          propName,
          componentName: ctx.componentName,
          expected: failure.expected ?? valueType,
          actual: value,
          message: `Style "${propName}": ${failure.message}`,
        });
        if (strict) continue;
      }
    }
    kept.push(buildDeclaration(propName, value, hadImportant && allowRawCss));
  }
  return { value: kept.join("; "), diagnostics };
}

function splitDeclarations(input: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (ch === ";" && depth === 0) {
      const seg = input.slice(start, i).trim();
      if (seg) out.push(seg);
      start = i + 1;
    }
  }
  const tail = input.slice(start).trim();
  if (tail) out.push(tail);
  return out;
}

function buildDeclaration(prop: string, value: string, important: boolean): string {
  return `${prop}: ${value}${important ? " !important" : ""}`;
}
