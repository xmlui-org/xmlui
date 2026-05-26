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
import type { UdcDiagnostic } from "./diagnostics";

export class UdcScopeError extends Error {
  readonly diagnostic: UdcDiagnostic;

  constructor(diagnostic: UdcDiagnostic) {
    super(diagnostic.message);
    this.name = "UdcScopeError";
    this.diagnostic = diagnostic;
  }
}

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
  canRead(name: string): boolean;
  createDiagnostic(name: string): UdcDiagnostic;
  assertCanRead(name: string): void;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/** No-op gate — allows all identifiers.  Used when sandboxing is disabled. */
const PASS_THROUGH_GATE: UdcScopeGate = {
  isAllowed: () => true,
  canRead: () => true,
  createDiagnostic: (name) => ({
    code: "udc-scope-leak",
    severity: "info",
    udc: "<unknown>",
    message: `UDC parent-scope read "${name}" is allowed because no sandbox contract is active.`,
    data: { identifier: name },
  }),
  assertCanRead: () => undefined,
};

/**
 * Builds a scope gate for the given contract.
 *
 * Phase 1: always returns the no-op pass-through gate.
 * Phase 2 (W6): will return a restrictive gate when `strictUdcSandbox` is on.
 */
export function buildScopeGate(
  contract: UdcContract,
  strict: boolean,
  slotContext: Iterable<string> = [],
): UdcScopeGate {
  if (!contract) return PASS_THROUGH_GATE;

  const allowed = new Set<string>([
    "$props",
    "emitEvent",
    "hasEventHandler",
    "updateState",
    "App",
    "Log",
    "Clipboard",
    "navigate",
    ...slotContext,
  ]);

  return {
    isAllowed: (name) => allowed.has(name),
    canRead: (name) => allowed.has(name),
    createDiagnostic: (name) => ({
      code: "udc-scope-leak",
      severity: strict ? "error" : "info",
      udc: contract.name,
      message:
        `UDC "${contract.name}" read "${name}" from its parent scope, but "${name}" ` +
        `is not part of the declared UDC contract.`,
      data: { identifier: name },
    }),
    assertCanRead(name) {
      if (allowed.has(name)) return;
      const diagnostic = this.createDiagnostic(name);
      if (strict) {
        throw new UdcScopeError(diagnostic);
      }
    },
  };
}
