/**
 * Build-time validation analyzer — public barrel.
 *
 * This module is the single import point for consumers of the analyzer:
 *   - The LSP diagnostic publisher
 *   - The Vite plugin
 *   - The standalone CLI (`xmlui check`)
 *   - Tests
 *
 * Rule packages import `registerRule` from this barrel to self-register.
 */

export type { BuildDiagnostic, BuildDiagnosticCode, BuildDiagnosticSuggestion } from "./diagnostics";
export type { AnalyzerRule, RuleContext } from "./rule-registry";
export { registerRule, getRules } from "./rule-registry";
export type { AnalyzerInput, AnalyzerInputFile } from "./walker";
export { analyze } from "./walker";
export type { SuppressionMap, SuppressionRange } from "./suppression";
export { buildSuppressionMap, isSuppressed } from "./suppression";
