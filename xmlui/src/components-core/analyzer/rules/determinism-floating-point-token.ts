/**
 * Rule: determinism-floating-point-token
 *
 * Detects `style=` / `vars=` attribute values that perform floating-point
 * arithmetic inline (e.g. `style="margin: {0.1 + 0.2}rem"`), which produces
 * trailing-precision values that vary marginally across rendering engines.
 *
 * Authors should either use a spacing token (`$space-1_5`) or precompute the
 * value. The framework routes spacing tokens through `serializeSpacing()`
 * (`components-core/utils/serializeSpacing.ts`), which rounds to 4 decimal
 * places; ad-hoc arithmetic inside markup bypasses that helper.
 *
 * Severity: `info` (strict: `warn`).
 *
 * Plan reference: `dev-docs/plans/16-concurrent-determinism.md` §Step 3.1.
 */

import type { BuildDiagnostic } from "../diagnostics";
import type { RuleContext } from "../rule-registry";
import { registerRule } from "../rule-registry";
import { offsetToLineCol } from "./_utils";

/**
 * Matches `style="…"` or `vars="…"` attributes. Group 1 is the attribute
 * name; group 2 is the attribute value (without the surrounding quotes).
 */
const STYLE_OR_VARS_RE = /\b(style|vars)="([^"]*)"/g;

/**
 * Matches a `{ … }` expression block whose body contains decimal-literal
 * arithmetic — at least one decimal literal followed by a binary operator
 * followed by another numeric literal (decimal or integer).
 *
 * The expression block must be balanced with respect to braces inside the
 * attribute value; we let the outer regex pull the candidate, then validate
 * the body with this pattern.
 */
const DECIMAL_ARITH_RE =
  /\{[^{}]*?\b\d+\.\d+\b\s*[+\-*/]\s*\d+(?:\.\d+)?[^{}]*?\}|\{[^{}]*?\b\d+(?:\.\d+)?\s*[+\-*/]\s*\d+\.\d+\b[^{}]*?\}/;

registerRule({
  code: "determinism-floating-point-token",
  description:
    "Inline floating-point arithmetic in `style=` / `vars=` produces non-deterministic values across engines.",
  defaultSeverity: "info",
  strictSeverity: "warn",
  appliesTo: "markup",

  *run(ctx: RuleContext): Iterable<BuildDiagnostic> {
    const source = ctx.source;
    if (!source) return;

    const diagnostics: BuildDiagnostic[] = [];
    STYLE_OR_VARS_RE.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = STYLE_OR_VARS_RE.exec(source)) !== null) {
      const [fullMatch, attrName, attrValue] = match;
      if (!DECIMAL_ARITH_RE.test(attrValue)) continue;

      const offset = match.index;
      const { line, col } = offsetToLineCol(source, offset);

      diagnostics.push({
        code: "determinism-floating-point-token",
        severity: ctx.strict ? "warn" : "info",
        file: ctx.file,
        line,
        column: col,
        length: fullMatch.length,
        message:
          `Inline floating-point arithmetic in \`${attrName}=\` may produce non-deterministic ` +
          `values across engines. Precompute the value or use a spacing token (e.g. \`$space-1_5\`).`,
        data: { attrName, attrValue },
      });
    }

    yield* diagnostics;
  },
});
