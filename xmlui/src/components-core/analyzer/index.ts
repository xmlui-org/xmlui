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
 *
 * Importing this barrel automatically side-effect-registers all built-in
 * rules via their respective module imports below.
 */

export type { BuildDiagnostic, BuildDiagnosticCode, BuildDiagnosticSuggestion } from "./diagnostics";
export type { AnalyzerRule, RuleContext } from "./rule-registry";
export { registerRule, getRules } from "./rule-registry";
export type { AnalyzerInput, AnalyzerInputFile } from "./walker";
export { analyze } from "./walker";
export type { SuppressionMap, SuppressionRange } from "./suppression";
export { buildSuppressionMap, isSuppressed } from "./suppression";

// --- Built-in rules (side-effect imports register each rule)
// Phase 1: Identifier rules
import "./rules/id-unknown-component";
import "./rules/id-unknown-prop";
import "./rules/id-unknown-event";
import "./rules/id-unknown-slot";
// Phase 2: Expression rules
import "./rules/expr-unused-var";
import "./rules/expr-unbound-identifier";
import "./rules/expr-dead-conditional";
import "./rules/expr-handler-no-value";
// Phase 3: Cross-binding rules
import "./rules/id-undefined-component-ref";
import "./rules/id-undefined-form-ref";
// W1-5: Theming rules
import "./rules/theming-missing-prefix";
