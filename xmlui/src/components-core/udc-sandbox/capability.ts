/**
 * UDC Sandbox — capability gating.
 *
 * Each managed primitive (fetch, navigate, clipboard, …) calls `gateCapability`
 * before executing.  When `strictUdcSandbox` is active and the capability is
 * not in the contract, a `udc-capability-missing` diagnostic is emitted and
 * the call is blocked.
 *
 * Phase 1: stub — never blocks.
 * Phase 2 (W6): full enforcement.
 *
 * Part of plan #14 "UDC Sandboxing".
 */

import type { UdcCapability, UdcContract } from "./contract";
import type { UdcDiagnostic } from "./diagnostics";

// ---------------------------------------------------------------------------
// Capability gate
// ---------------------------------------------------------------------------

export interface CapabilityGateResult {
  /** Whether the managed primitive is allowed to proceed. */
  allowed: boolean;
  /** Diagnostic to emit when the capability is missing (if any). */
  diagnostic?: UdcDiagnostic;
}

/**
 * Checks whether a UDC is permitted to use `capability`.
 *
 * Phase 1 stub — always allows the call.
 */
export function gateCapability(
  _capability: UdcCapability,
  _contract: UdcContract,
  _strict: boolean,
): CapabilityGateResult {
  return { allowed: true };
}
