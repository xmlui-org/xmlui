/**
 * UDC Sandbox — scope gate.
 *
 * A `UdcScopeGate` decides at render time which identifiers from the parent
 * scope are allowed to flow into a sandboxed UDC.  When `strictUdcSandbox`
 * is disabled this gate is a no-op pass-through.
 *
 * Phase 2 (W6) will provide a full implementation.  This file contains the
 * interface and a stub that is safe to ship now.
 *
 * Part of plan #14 "UDC Sandboxing".
 */

import type { UdcContract } from "./contract";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

/**
 * Controls which parent-scope identifiers may be read by a sandboxed UDC.
 */
export interface UdcScopeGate {
  /**
   * Returns `true` when the identifier `name` is allowed to cross the
   * UDC boundary into the implementation scope.
   *
   * When the contract has no `props` entry for `name` and scope-leak
   * enforcement is active, the gate returns `false`.
   */
  isAllowed(name: string): boolean;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/** No-op gate — allows all identifiers.  Used when sandboxing is disabled. */
const PASS_THROUGH_GATE: UdcScopeGate = { isAllowed: () => true };

/**
 * Builds a scope gate for the given contract.
 *
 * Phase 1: always returns the no-op pass-through gate.
 * Phase 2 (W6): will return a restrictive gate when `strictUdcSandbox` is on.
 */
export function buildScopeGate(
  _contract: UdcContract,
  _strict: boolean,
): UdcScopeGate {
  return PASS_THROUGH_GATE;
}
