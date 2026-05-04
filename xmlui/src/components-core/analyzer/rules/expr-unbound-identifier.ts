/**
 * Rule: expr-unbound-identifier
 *
 * **Status: Phase 2 stub.**
 *
 * An identifier in an expression that cannot be resolved to:
 *   - a `var` in scope
 *   - a registered component id
 *   - an `App.*` global
 *   - a framework-provided context variable ($cancel, $error, $event, …)
 *   - a registered global function
 *
 * Detecting this requires the full expression scope graph from the scripting
 * parser (plan #01 verified-type-contracts).
 *
 * Severity: `error` (same in strict).
 */

import type { RuleContext } from "../rule-registry";
import { registerRule } from "../rule-registry";

registerRule({
  code: "expr-unbound-identifier",
  description:
    "An identifier in an expression cannot be resolved to any declared variable or scope entry. (Phase 2 stub — scope analysis not yet available.)",
  defaultSeverity: "error",
  strictSeverity: "error",
  appliesTo: "both",

  // eslint-disable-next-line require-yield
  *run(_ctx: RuleContext) {
    // Full implementation requires expression scope analysis.
    // See plan #01 (verified-type-contracts) Step 2.1.
  },
});
