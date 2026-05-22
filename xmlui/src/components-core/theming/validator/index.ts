/**
 * Theming-sandbox validator (plan #08).
 *
 * Entry points:
 * - {@link validateTheme} — validate a resolved theme map.
 * - {@link validateInlineStyle} — validate one layout-prop value.
 * - {@link validateStyleString} — validate the catch-all `style` prop.
 * - {@link lookupThemeRule} / {@link verifyThemeValue} — direct rule
 *   access for callers that already hold a `ThemeValueType`.
 */

export type { ThemeDiagnostic, ThemeDiagnosticCode } from "./diagnostics";
export { validateTheme } from "./theme-validator";
export type { ValidateThemeOptions } from "./theme-validator";
export {
  validateInlineStyle,
  validateStyleString,
} from "./style-prop-validator";
export type {
  InlineStyleContext,
  InlineStyleOptions,
  InlineStyleResult,
  ValidateStyleStringContext,
  ValidateStyleStringResult,
} from "./style-prop-validator";
export { lookupThemeRule, verifyThemeValue } from "./rule-table";
