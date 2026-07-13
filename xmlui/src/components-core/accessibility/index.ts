/**
 * Accessibility module -- public barrel.
 *
 * Exports the diagnostic type surface and the theme contrast helpers used by
 * runtime theme diagnostics.
 */

export type { A11yCode, A11yDiagnostic } from "./diagnostics";
export { checkThemeContrast, contrastRatio, parseColor } from "./contrast";
export type { ContrastPair } from "./contrast";
