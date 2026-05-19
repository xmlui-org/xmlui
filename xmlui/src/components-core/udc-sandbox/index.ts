/**
 * UDC Sandbox — barrel export.
 *
 * Public surface of the `udc-sandbox` module.
 * Part of plan #14 "UDC Sandboxing".
 */

export type { UdcDiagCode, UdcDiagnostic } from "./diagnostics";
export type {
  UdcCapability,
  UdcContract,
  UdcEventDecl,
  UdcMethodDecl,
  UdcPropDecl,
  UdcSlotDecl,
} from "./contract";
export { emptyContract } from "./contract";
export type { UdcScopeGate } from "./scope";
export { buildScopeGate } from "./scope";
export type { CapabilityGateResult } from "./capability";
export { gateCapability } from "./capability";
export type { SerializedUdcContract, UdcManifest } from "./manifest";
export { loadManifest } from "./manifest";
export { validateUdcPropReferences } from "./validators";
