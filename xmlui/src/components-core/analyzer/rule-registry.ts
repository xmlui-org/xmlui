/**
 * Analyzer rule registry.
 *
 * Rules are registered once at module-load time (by importing their module).
 * The walker calls `getRules()` to obtain the current rule list before a run.
 */

import type { BuildDiagnostic } from "./diagnostics";
import type { ComponentRegistry } from "../../components/ComponentProvider";

// ---------------------------------------------------------------------------
// Rule context — passed to every rule's `run` function
// ---------------------------------------------------------------------------

export interface RuleContext {
  /** Workspace-relative or absolute path of the source file being analyzed. */
  file: string;
  /** Raw source text of the file (used for offset → line/col conversion). */
  source: string;
  /**
   * Parsed markup AST of the file, if available.
   * Typed as `unknown` here; rule implementations cast to the concrete AST type
   * produced by `parsers/xmlui-parser/`.
   */
  markupAst?: unknown;
  /**
   * Parsed expression AST, if a bare expression file is being analyzed.
   * Typed as `unknown`; rule implementations cast to the AST type produced by
   * `parsers/scripting/`.
   */
  exprAst?: unknown;
  /** The merged component registry (core + extensions + in-app UDCs). */
  componentRegistry?: ComponentRegistry;
  /** When `true`, every rule's default severity is escalated one step (up to `error`). */
  strict: boolean;
}

// ---------------------------------------------------------------------------
// Rule definition
// ---------------------------------------------------------------------------

export interface AnalyzerRule {
  /** Prefix-namespaced code that this rule produces (must match the diagnostic codes it emits). */
  code: string;
  /** One-sentence description shown in `xmlui check --list` and in the IDE. */
  description: string;
  /** Severity applied when `strict === false`. */
  defaultSeverity: "error" | "warn" | "info";
  /** Severity applied when `strict === true` (must be ≥ `defaultSeverity`). */
  strictSeverity: "error" | "warn" | "info";
  /** Which AST the rule needs. Determines which files the walker feeds it. */
  appliesTo: "markup" | "expression" | "both";
  /**
   * Run the rule against the provided context.
   * Must be a pure, synchronous function — no I/O, no side effects.
   */
  run: (ctx: RuleContext) => Iterable<BuildDiagnostic>;
}

// ---------------------------------------------------------------------------
// Registry (module-level singleton)
// ---------------------------------------------------------------------------

const _rules = new Map<string, AnalyzerRule>();

/**
 * Register a rule. Throws if a rule with the same `code` is already registered.
 * Call this once at module initialisation time (top-level or inside an IIFE).
 */
export function registerRule(rule: AnalyzerRule): void {
  if (_rules.has(rule.code)) {
    throw new Error(`[analyzer] Rule "${rule.code}" is already registered.`);
  }
  _rules.set(rule.code, rule);
}

/** Return all currently registered rules in registration order. */
export function getRules(): readonly AnalyzerRule[] {
  return Array.from(_rules.values());
}
