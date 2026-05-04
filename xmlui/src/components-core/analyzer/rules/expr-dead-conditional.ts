/**
 * Rule: expr-dead-conditional
 *
 * Detects ternary / conditional expressions whose condition is a literal
 * (`true ? a : b`, `false && x`) or an obvious tautology / contradiction
 * (`1 < 0`, `x === x` where `x` is a literal).  These almost always
 * represent debug code accidentally left behind.
 *
 * Severity: `info` (strict: `warn`).
 *
 * **Implementation scope (Phase 2):**
 * Full literal-condition detection requires walking the expression AST
 * produced by `parsers/scripting/Parser.ts`. For Wave 1 this rule performs a
 * lightweight text-pattern scan over the raw source to catch the most common
 * forms (bare `true ?`, `false ?`, `1 < 0`). A later phase will replace this
 * with a proper AST walk.
 */

import type { BuildDiagnostic } from "../diagnostics";
import type { RuleContext } from "../rule-registry";
import { registerRule } from "../rule-registry";
import { offsetToLineCol } from "./_utils";

/** Patterns that indicate a dead conditional. Each has a capture group for the offending token. */
const DEAD_PATTERNS: RegExp[] = [
  // true ? ... : ...
  /\btrue\s*\?/g,
  // false ? ... : ...
  /\bfalse\s*\?/g,
  // false && ...
  /\bfalse\s*&&/g,
  // true || ...
  /\btrue\s*\|\|/g,
  // Numeric tautology: 1 < 0, 0 > 1, 1 === 1, 0 === 0 (same literal both sides)
  /\b(\d+)\s*===\s*\1\b/g,
  /\b(\d+)\s*!==\s*\1\b/g,
];

registerRule({
  code: "expr-dead-conditional",
  description:
    "The conditional expression has a literal/tautological condition — it always evaluates the same branch.",
  defaultSeverity: "info",
  strictSeverity: "warn",
  appliesTo: "both",

  *run(ctx: RuleContext): Iterable<BuildDiagnostic> {
    const source = ctx.source;
    if (!source) return;

    const diagnostics: BuildDiagnostic[] = [];
    const seen = new Set<number>(); // deduplicate overlapping pattern matches

    for (const pattern of DEAD_PATTERNS) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(source)) !== null) {
        const offset = match.index;
        if (seen.has(offset)) continue;
        seen.add(offset);

        const { line, col } = offsetToLineCol(source, offset);
        diagnostics.push({
          code: "expr-dead-conditional",
          severity: ctx.strict ? "warn" : "info",
          file: ctx.file,
          line,
          column: col,
          length: match[0].length,
          message: `Dead conditional: condition \`${match[0].trim()}\` always evaluates to the same branch.`,
          data: { match: match[0] },
        });
      }
    }

    yield* diagnostics;
  },
});
