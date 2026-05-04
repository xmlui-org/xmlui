/**
 * Rule: expr-unused-var
 *
 * **Status: Phase 2 stub.**
 *
 * A `var` declared on a component or page that is never referenced in any
 * descendant expression. Detecting this accurately requires building a
 * scope graph from the expression AST across the whole component tree —
 * infrastructure that lands in plan #01 (verified-type-contracts).
 *
 * Severity: `info` (strict: `warn`).
 */

import type { RuleContext } from "../rule-registry";
import { registerRule } from "../rule-registry";

registerRule({
  code: "expr-unused-var",
  description:
    "A `var` is declared but never referenced in any descendant expression. (Phase 2 stub — scope analysis not yet available.)",
  defaultSeverity: "info",
  strictSeverity: "warn",
  appliesTo: "both",

  // eslint-disable-next-line require-yield
  *run(_ctx: RuleContext) {
    // Full implementation requires cross-expression scope tracking.
    // See plan #01 (verified-type-contracts) Step 2.2.
  },
});
