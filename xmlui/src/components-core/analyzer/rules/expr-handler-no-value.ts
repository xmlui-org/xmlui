/**
 * Rule: expr-handler-no-value
 *
 * Detects event handlers in markup whose value is a bare identifier (no
 * parentheses), which almost always means the developer forgot to call the
 * function.  For example:
 *
 *   `onClick="myAction"`   →  warn; suggest `onClick="myAction()"`
 *
 * A legitimate bare-identifier handler would be an expression that evaluates
 * to a function reference intended to be stored rather than called — but
 * XMLUI event attributes are always *called* by the runtime, so a bare name
 * is almost always a bug.
 *
 * Severity: `info` (strict: `warn`).
 *
 * **Implementation scope (Phase 2):**
 * This version uses a lightweight regex scan over attribute values to detect
 * the pattern `="{identifier}"` where the value is exactly one identifier.
 * A proper AST walk (Phase 2 follow-up) will be more precise.
 */

import type { BuildDiagnostic } from "../diagnostics";
import type { RuleContext } from "../rule-registry";
import { registerRule } from "../rule-registry";
import { offsetToLineCol } from "./_utils";

/**
 * Matches an event attribute binding whose value is a single bare identifier.
 * Groups: [1] = attribute name (onX…), [2] = the identifier.
 */
const BARE_HANDLER_RE =
  /\b(on[A-Z][a-zA-Z]*)="\{([A-Za-z_$][A-Za-z0-9_$]*)\}"/g;

registerRule({
  code: "expr-handler-no-value",
  description:
    'Event handler value is a bare identifier — did you mean to call it with "()"?',
  defaultSeverity: "info",
  strictSeverity: "warn",
  appliesTo: "both",

  *run(ctx: RuleContext): Iterable<BuildDiagnostic> {
    const source = ctx.source;
    if (!source) return;

    const diagnostics: BuildDiagnostic[] = [];
    BARE_HANDLER_RE.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = BARE_HANDLER_RE.exec(source)) !== null) {
      const [fullMatch, attrName, identifier] = match;
      const offset = match.index;
      const { line, col } = offsetToLineCol(source, offset);
      const suggested = `${attrName}="{${identifier}()}"`;

      diagnostics.push({
        code: "expr-handler-no-value",
        severity: ctx.strict ? "warn" : "info",
        file: ctx.file,
        line,
        column: col,
        length: fullMatch.length,
        message: `Handler \`${attrName}="{${identifier}}"\` is a bare identifier — did you mean \`${attrName}="{${identifier}()}"\`?`,
        data: { attrName, identifier },
        suggestions: [{ title: `Call the function: \`${suggested}\``, replacement: suggested }],
      });
    }

    yield* diagnostics;
  },
});
