/**
 * Rule: determinism-iteration-order-symbol
 *
 * Detects iteration over an object that may contain symbol-keyed entries
 * without going through the `orderedKeys()` helper. Symbol iteration order
 * is engine-defined and varies across renderers; the helper documents a
 * canonical order (numeric strings ascending, then non-numeric strings in
 * insertion order, then symbols sorted by `description`).
 *
 * XMLUI's own data flow uses string keys throughout, so this rule is
 * **preventative**: it fires when markup uses `Object.getOwnPropertySymbols`,
 * `Reflect.ownKeys`, or constructs a fresh `Symbol(...)` and feeds the
 * result back into an `<Items>` / iteration site.
 *
 * Severity: `info` (strict: `warn`).
 *
 * Plan reference: `dev-docs/plans/16-concurrent-determinism.md` §Step 3.2.
 */

import type { BuildDiagnostic } from "../diagnostics";
import type { RuleContext } from "../rule-registry";
import { registerRule } from "../rule-registry";
import { offsetToLineCol } from "./_utils";

/**
 * Matches markup that calls one of the symbol-aware reflection APIs inside
 * an expression block (`{ ... }`). The helper functions are namespaced on
 * the `Object` / `Reflect` / `Symbol` globals; any reference inside a
 * markup expression triggers the rule.
 */
const SYMBOL_ITERATION_RE =
  /\{[^{}]*?\b(Object\.getOwnPropertySymbols|Reflect\.ownKeys|Symbol\s*\()[^{}]*?\}/g;

registerRule({
  code: "determinism-iteration-order-symbol",
  description:
    "Iterating an object with symbol keys without `orderedKeys()` yields engine-defined order.",
  defaultSeverity: "info",
  strictSeverity: "warn",
  appliesTo: "markup",

  *run(ctx: RuleContext): Iterable<BuildDiagnostic> {
    const source = ctx.source;
    if (!source) return;

    const diagnostics: BuildDiagnostic[] = [];
    SYMBOL_ITERATION_RE.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = SYMBOL_ITERATION_RE.exec(source)) !== null) {
      const [fullMatch, callee] = match;
      const offset = match.index;
      const { line, col } = offsetToLineCol(source, offset);

      diagnostics.push({
        code: "determinism-iteration-order-symbol",
        severity: ctx.strict ? "warn" : "info",
        file: ctx.file,
        line,
        column: col,
        length: fullMatch.length,
        message:
          `\`${callee}\` exposes symbol keys whose iteration order is engine-defined. ` +
          `Route the keys through \`orderedKeys()\` before iterating.`,
        data: { callee },
      });
    }

    yield* diagnostics;
  },
});
