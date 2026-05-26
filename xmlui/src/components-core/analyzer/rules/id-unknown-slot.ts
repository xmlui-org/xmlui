/**
 * Rule: id-unknown-slot
 *
 * **Status: registered no-op (out of scope for this plan).**
 *
 * Validating slot names requires explicit slot-name metadata on
 * `ComponentMetadata`, which the framework does not yet expose. Adding that
 * metadata is a separate effort: it would entail auditing every component
 * that implements slots and surfacing each slot in its metadata.
 *
 * The rule is registered now so consumers can wire suppression directives,
 * `xmlui.config.json` severities, and rule lookups against the same code.
 * When the slot-metadata surface lands, the rule body is filled in without
 * affecting registry consumers.
 *
 * Severity: `error` (same in strict — a slot typo silently drops content).
 */

import type { RuleContext } from "../rule-registry";
import { registerRule } from "../rule-registry";

registerRule({
  code: "id-unknown-slot",
  description:
    "The slot name used in a `slot=` attribute is not declared by the parent component. (Registered no-op — pending explicit slot metadata on ComponentMetadata.)",
  defaultSeverity: "error",
  strictSeverity: "error",
  appliesTo: "markup",

  // eslint-disable-next-line require-yield
  *run(_ctx: RuleContext) {
    // Slot validation is intentionally a no-op until slot metadata is
    // added to ComponentMetadata. See dev-docs/plans/13 closing notes.
  },
});
