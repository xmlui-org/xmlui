/**
 * Theming-sandbox diagnostics (plan #08).
 *
 * Every code is `theming-*` namespaced so it cannot collide with
 * diagnostics from other subsystems (see the master plan
 * "Diagnostic code uniqueness" convention).
 */

/**
 * Closed set of diagnostic codes the theme validator and the inline-style
 * validator can emit.
 *
 * - `invalid-theme-value` — A theme variable's resolved value does not
 *   match its declared `valueType`.
 * - `unknown-theme-variable` — A theme override targets a variable name
 *   that no component or extension declared. Warn only (never error)
 *   so late-registered third-party extensions are not punished.
 * - `raw-css-in-prop` — The `style` prop contains a CSS property that
 *   is not in the validator's rule table. Warn unless
 *   `appGlobals.allowInlineRawCss === false` and strict.
 * - `important-blocked` — A `!important` flag was used inside `style`
 *   while `appGlobals.allowInlineRawCss === false`.
 * - `url-in-style` — A `url(...)` value appeared inside `style` while
 *   `appGlobals.allowInlineRawCss === false`. URLs in styles are a
 *   documented XSS exfil channel; the framework offers `<Image src>`
 *   and theme variables for the legitimate cases.
 * - `position-fixed-blocked` — `position: fixed | sticky` appeared in
 *   the `style` prop. The legitimate use cases (Modal/Drawer/Toast/
 *   Popover) are framework-internal components.
 */
export type ThemeDiagnosticCode =
  | "invalid-theme-value"
  | "unknown-theme-variable"
  | "raw-css-in-prop"
  | "important-blocked"
  | "url-in-style"
  | "position-fixed-blocked";

/**
 * Single theming-sandbox diagnostic.
 *
 * Mirrors the entry shape eventually pushed to the trace as a
 * `kind:"theming"` `XsLogEntry` (see `inspectorUtils.ts`).
 */
export interface ThemeDiagnostic {
  /** Stable, prefix-namespaced diagnostic code. */
  code: ThemeDiagnosticCode;
  /** `"warn"` in non-strict mode; `"error"` when strict mode escalates. */
  severity: "error" | "warn";
  /** Theme variable name (without the `--xmlui-` prefix), when relevant. */
  variableName?: string;
  /** Component prop name (e.g. `"style"`, `"width"`), when relevant. */
  propName?: string;
  /** Component metadata `name`, when relevant. */
  componentName?: string;
  /** Canonical description of the expected shape (e.g. `"color"`). */
  expected?: string;
  /** The offending value, normalised for diagnostic display. */
  actual?: string;
  /** Human-readable summary. */
  message: string;
}
