/**
 * Analyzer walker.
 *
 * Drives the registered rules over an array of source files and collects
 * all emitted `BuildDiagnostic` entries into a flat array.
 *
 * The walker does **not** parse source files itself — callers supply the
 * pre-parsed ASTs (or raw source strings that will be parsed on demand in
 * later phases). In Step 0 the markup/expression AST fields are left as
 * `undefined`; rules that inspect them will simply emit nothing.
 */

import type { BuildDiagnostic } from "./diagnostics";
import type { ComponentRegistry } from "../../components/ComponentProvider";
import { getRules } from "./rule-registry";
import type { RuleContext } from "./rule-registry";

export interface AnalyzerInputFile {
  /** Workspace-relative or absolute path of the source file. */
  file: string;
  /** Raw source text. */
  source: string;
  /**
   * Pre-parsed markup AST.  When supplied the walker passes it directly to
   * rules; when omitted the walker leaves `markupAst` as `undefined`.
   * (Step 0 callers may omit this; Phase 1 callers will supply it.)
   */
  markupAst?: unknown;
  /** Pre-parsed expression AST (optional; see `markupAst` note above). */
  exprAst?: unknown;
}

export interface AnalyzerInput {
  files: ReadonlyArray<AnalyzerInputFile>;
  componentRegistry: ComponentRegistry;
  /**
   * When `true`, every rule's `strictSeverity` overrides its `defaultSeverity`.
   * Controlled by `App.appGlobals.strictBuildValidation`.
   */
  strict: boolean;
}

/**
 * Run all registered analyzer rules over the supplied files.
 *
 * Returns a flat array of `BuildDiagnostic` entries, one per finding.
 * The array is empty when no rules are registered or when all rules emit
 * nothing.
 */
export function analyze(input: AnalyzerInput): BuildDiagnostic[] {
  const rules = getRules();
  const diagnostics: BuildDiagnostic[] = [];

  for (const fileEntry of input.files) {
    const ctx: RuleContext = {
      file: fileEntry.file,
      source: fileEntry.source,
      markupAst: fileEntry.markupAst,
      exprAst: fileEntry.exprAst,
      componentRegistry: input.componentRegistry,
      strict: input.strict,
    };

    for (const rule of rules) {
      try {
        for (const diag of rule.run(ctx)) {
          diagnostics.push(diag);
        }
      } catch (err) {
        // A rule crash must not abort the whole analysis run — emit a
        // synthetic diagnostic instead so the caller can surface it.
        diagnostics.push({
          code: "internal-rule-error",
          severity: "error",
          file: fileEntry.file,
          line: 1,
          column: 1,
          length: 0,
          message: `Analyzer rule "${rule.code}" threw an unexpected error: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }
  }

  return diagnostics;
}
