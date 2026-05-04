/**
 * Accessibility module — public barrel.
 *
 * Exports the `A11yDiagnostic` type, the `A11yCode` union, and the
 * `lintComponentDef()` function. All consumers (LSP, Vite plugin, tests)
 * import from here.
 */

export type { A11yCode, A11yDiagnostic } from "./diagnostics";
export type { LintOptions } from "./linter";
export { lintComponentDef } from "./linter";
