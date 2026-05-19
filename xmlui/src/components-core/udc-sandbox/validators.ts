/**
 * UDC Sandbox — runtime validators.
 *
 * Phase 1: emit `udc-prop-undeclared` when the implementation references
 * `$props.<name>` but `<name>` is not in the declared contract.
 *
 * Part of plan #14 "UDC Sandboxing".
 */

import type { ComponentDef, CompoundComponentDef } from "../../abstractions/ComponentDefs";
import { collectPropsFromComponentDef } from "../ud-metadata";
import { pushXsLog, getCurrentTrace } from "../inspector/inspectorUtils";
import type { UdcContract } from "./contract";
import type { UdcDiagnostic } from "./diagnostics";

// ---------------------------------------------------------------------------
// Validation cache — each UDC is validated at most once per process.
// ---------------------------------------------------------------------------

const VALIDATED_UDCS = new WeakSet<CompoundComponentDef>();

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------

/**
 * Walks the implementation tree of a UDC and emits a `udc-prop-undeclared`
 * diagnostic for every `$props.<name>` reference whose `<name>` is missing
 * from the declared contract.
 *
 * No-op when:
 * - the UDC has no declared contract (legacy / inferred mode), or
 * - the same `def` has already been validated in this session.
 *
 * Severity escalates from `info` to `error` when `strictUdcSandbox` is set.
 */
export function validateUdcPropReferences(
  def: CompoundComponentDef,
  strict: boolean,
): UdcDiagnostic[] {
  const contract = def.contract as UdcContract | undefined;
  if (!contract) return [];
  if (VALIDATED_UDCS.has(def)) return [];
  VALIDATED_UDCS.add(def);

  const referenced = collectPropsFromComponentDef(def.component as ComponentDef);
  const out: UdcDiagnostic[] = [];

  for (const name of referenced) {
    if (contract.props.has(name)) continue;
    const diag: UdcDiagnostic = {
      code: "udc-prop-undeclared",
      severity: strict ? "error" : "info",
      udc: contract.name,
      message:
        `UDC "${contract.name}" reads $props.${name} but no <Prop name="${name}"> ` +
        `declaration was found.  Declare the prop or remove the reference.`,
      data: { propName: name },
    };
    out.push(diag);
    pushXsLog({
      ts: Date.now(),
      perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
      traceId: getCurrentTrace(),
      kind: "udc",
      ...diag,
    });
  }

  return out;
}
