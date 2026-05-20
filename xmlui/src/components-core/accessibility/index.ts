/**
 * Accessibility module — public barrel.
 *
 * Exports the `A11yDiagnostic` type, the `A11yCode` union, and the
 * `lintComponentDef()` function. All consumers (LSP, Vite plugin, tests)
 * import from here.
 */

export type { A11yCode, A11yDiagnostic } from "./diagnostics";
export type { LintOptions, A11yRegistry } from "./linter";
export { lintComponentDef } from "./linter";
export { checkThemeContrast, contrastRatio, parseColor } from "./contrast";
export type { ContrastPair } from "./contrast";
export { focusableElements, useFocusScope } from "./useFocusScope";
export { clearFocusScopesForTests, popFocusScope, pushFocusScope, topFocusScope } from "./focusScopeStack";
