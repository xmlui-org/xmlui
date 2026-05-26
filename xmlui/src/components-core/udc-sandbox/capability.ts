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

export class UdcCapabilityError extends Error {
  readonly diagnostic: UdcDiagnostic;

  constructor(diagnostic: UdcDiagnostic) {
    super(diagnostic.message);
    this.name = "UdcCapabilityError";
    this.diagnostic = diagnostic;
  }
}

export type UdcCapabilityReporter = (diagnostic: UdcDiagnostic) => void;

/**
 * Checks whether a UDC is permitted to use `capability`.
 *
 * Phase 1 stub — always allows the call.
 */
export function gateCapability(
  capability: UdcCapability,
  contract: UdcContract,
  strict: boolean,
): CapabilityGateResult {
  if (contract.capabilities.has(capability)) {
    return { allowed: true };
  }
  return {
    allowed: false,
    diagnostic: {
      code: "udc-capability-missing",
      severity: strict ? "error" : "warn",
      udc: contract.name,
      message:
        `UDC "${contract.name}" tried to use the "${capability}" capability, ` +
        `but it is not listed in the component's capabilities declaration.`,
      data: { capability },
    },
  };
}

export function assertCapability(
  capability: UdcCapability,
  contract: UdcContract,
  strict: boolean,
  report?: UdcCapabilityReporter,
): void {
  const result = gateCapability(capability, contract, strict);
  if (result.allowed) return;
  report?.(result.diagnostic!);
  if (strict) {
    throw new UdcCapabilityError(result.diagnostic!);
  }
}

export function narrowCapabilities(
  contract: UdcContract,
  requested: ReadonlySet<UdcCapability>,
  strict: boolean = false,
): { contract: UdcContract; diagnostics: UdcDiagnostic[] } {
  const diagnostics: UdcDiagnostic[] = [];
  const narrowed = new Set<UdcCapability>();
  for (const capability of requested) {
    if (contract.capabilities.has(capability)) {
      narrowed.add(capability);
    } else {
      diagnostics.push({
        code: "udc-capability-undeclared",
        severity: "error",
        udc: contract.name,
        message:
          `UDC "${contract.name}" was instantiated with capability "${capability}", ` +
          `but the component declaration does not include it.`,
        data: { capability },
      });
    }
  }
  return {
    contract: {
      ...contract,
      capabilities: narrowed,
      capabilitiesDeclared: true,
    },
    diagnostics,
  };
}

export function capabilityForAppMember(member: string): UdcCapability | undefined {
  switch (member) {
    case "fetch":
      return "fetch";
    case "randomBytes":
      return "randomBytes";
    case "now":
    case "mark":
    case "measure":
      return "mark";
    case "environment":
      return "environment";
    default:
      return undefined;
  }
}

export function capabilityForRootIdentifier(name: string): UdcCapability | undefined {
  switch (name) {
    case "navigate":
      return "navigate";
    case "Clipboard":
      return "clipboard";
    case "Log":
      return "log";
    default:
      return undefined;
  }
}
