/**
 * Rule: id-undefined-form-ref
 *
 * **Status: Phase 3 stub.**
 *
 * A `<FormItem bindTo="x">` is declared inside a `<Form>` whose `data` shape
 * does not declare the field `x`, or is declared outside any `<Form>` entirely.
 *
 * Detecting this accurately requires:
 *   - Walking the markup tree to find all `<Form>` elements and their declared
 *     `data` shape.
 *   - Walking each `<FormItem>` to find its `bindTo` value.
 *   - Resolving the form hierarchy for nested forms.
 *
 * A proper implementation needs the expression scope graph from plan #01
 * (verified-type-contracts) and plan #09 (form infrastructure).
 *
 * Severity: `warn` (strict: `error`).
 */

import type { RuleContext } from "../rule-registry";
import { registerRule } from "../rule-registry";

registerRule({
  code: "id-undefined-form-ref",
  description:
    'A FormItem `bindTo` value references a field not declared by the parent Form. (Phase 3 stub — form-data scope not yet available.)',
  defaultSeverity: "warn",
  strictSeverity: "error",
  appliesTo: "markup",

  // eslint-disable-next-line require-yield
  *run(_ctx: RuleContext) {
    // Full implementation requires form-data scope analysis.
    // See plan #09 (form infrastructure) and plan #01 Step 2.2.
  },
});
