/**
 * Analyzer walker.
 *
 * Drives the registered rules over an array of source files and collects
 * all emitted `BuildDiagnostic` entries into a flat array.
 *
 * When `markupAst` is not supplied by the caller the walker parses the raw
 * `.xmlui` source itself via `xmlUiMarkupToComponent`. This allows callers
 * (LSP, Vite plugin, `xmlui check` CLI, tests) to invoke `analyze({files})`
 * with only `{file, source}` and have the markup-walking rules fire.
 */

import type { BuildDiagnostic } from "./diagnostics";
import type { ComponentRegistry } from "../../components/ComponentProvider";
import { getRules } from "./rule-registry";
import type { RuleContext } from "./rule-registry";
import { xmlUiMarkupToComponent } from "../xmlui-parser";
import type { ComponentDef, CompoundComponentDef } from "../../abstractions/ComponentDefs";
import { buildSuppressionMap, isSuppressed } from "./suppression";

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
  componentRegistry?: ComponentRegistry;
  /**
   * When `true`, every rule's `strictSeverity` overrides its `defaultSeverity`.
   * Controlled by `App.xmluiConfig.strictBuildValidation`.
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
    const suppressions = buildSuppressionMap(fileEntry.source);
    // Lazy-parse the markup AST when the caller did not pre-supply one.
    // Parser failures must not abort analysis — they're already surfaced
    // through the parser's own diagnostic channel.
    let markupAst = fileEntry.markupAst;
    if (markupAst === undefined && fileEntry.source) {
      markupAst = parseMarkupSafely(fileEntry.source, fileEntry.file);
    }

    const ctx: RuleContext = {
      file: fileEntry.file,
      source: fileEntry.source,
      markupAst,
      exprAst: fileEntry.exprAst,
      componentRegistry: input.componentRegistry as ComponentRegistry,
      strict: input.strict,
    };

    for (const rule of rules) {
      try {
        for (const diag of rule.run(ctx)) {
          if (diag.line !== undefined && isSuppressed(diag.code, diag.line, suppressions)) {
            continue;
          }
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

/**
 * Parse the raw `.xmlui` source via `xmlUiMarkupToComponent` and unwrap the
 * `ComponentDef` root that the rules expect.
 *
 * - Returns `undefined` when parsing fails, when the file is empty, or when
 *   the parser produces a `CompoundComponentDef` (which wraps a real root in
 *   `.component`).
 * - Never throws — analyzer must remain side-effect-free regardless of input.
 */
function parseMarkupSafely(source: string, file: string): ComponentDef | undefined {
  try {
    const result = xmlUiMarkupToComponent(source, file);
    if (!result || !result.component || result.errors.length > 0) return undefined;
    const root = result.component as ComponentDef | CompoundComponentDef;
    // Compound components nest the actual root under `.component`.
    if ((root as CompoundComponentDef).component) {
      return (root as CompoundComponentDef).component as ComponentDef;
    }
    return root as ComponentDef;
  } catch {
    return undefined;
  }
}
