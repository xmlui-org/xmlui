/**
 * Rule: id-undefined-component-ref
 *
 * **Status: Phase 3 stub.**
 *
 * An expression references a component by its `uid` (e.g., `myButton.flash()`)
 * but no component with that id is declared anywhere in the same `<App>` scope.
 *
 * Accurate detection requires a two-pass analysis:
 *   1. Collect all declared `uid` values in the component tree (pass 1).
 *   2. Identify identifier references in expressions that look like component
 *      ids and verify each against the collected set (pass 2).
 *
 * This depends on plan #01 (verified-type-contracts) ref-tracking, which is
 * not yet implemented.
 *
 * Severity: `error` (same in strict).
 */

import type { RuleContext } from "../rule-registry";
import { registerRule } from "../rule-registry";

registerRule({
  code: "id-undefined-component-ref",
  description:
    "An expression references a component id that is not declared in the current scope. (Phase 3 stub — ref tracking not yet available.)",
  defaultSeverity: "error",
  strictSeverity: "error",
  appliesTo: "both",

  // eslint-disable-next-line require-yield
  *run(_ctx: RuleContext) {
    // Full implementation requires cross-tree ref tracking.
    // See plan #01 (verified-type-contracts) Step 1.4.
  },
});
