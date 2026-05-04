/**
 * Rule: id-unknown-slot
 *
 * **Status: Phase 1 stub.**
 *
 * Full slot validation requires explicit slot-name metadata on
 * `ComponentMetadata`, which is not yet available. This rule skeleton is
 * registered so the code, test fixtures, and suppression directives can be
 * authored now; the actual check will be filled in when the metadata surface
 * is ready (plan #01 Step 2.2 — verified-type-contracts).
 *
 * Severity: `error` (same in strict — a slot typo silently drops content).
 */

import type { RuleContext } from "../rule-registry";
import { registerRule } from "../rule-registry";

registerRule({
  code: "id-unknown-slot",
  description:
    "The slot name used in a `slot=` attribute is not declared by the parent component. (Phase 1 stub — validation requires slot metadata.)",
  defaultSeverity: "error",
  strictSeverity: "error",
  appliesTo: "markup",

  // eslint-disable-next-line require-yield
  *run(_ctx: RuleContext) {
    // Slot validation requires explicit slot metadata on ComponentMetadata.
    // This will be implemented in a later phase (plan #01 Step 2.2).
  },
});
