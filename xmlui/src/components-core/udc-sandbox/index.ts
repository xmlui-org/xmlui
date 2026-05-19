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
export {
  ALL_UDC_CAPABILITIES,
  isUdcCapability,
  parseCapabilityList,
  parseProvidesList,
} from "./contract";
export type { UdcScopeGate } from "./scope";
export { UdcScopeError, buildScopeGate } from "./scope";
export type { CapabilityGateResult } from "./capability";
export {
  UdcCapabilityError,
  assertCapability,
  capabilityForAppMember,
  capabilityForRootIdentifier,
  gateCapability,
  narrowCapabilities,
} from "./capability";
export type { SerializedUdcContract, UdcManifest } from "./manifest";
export { compareManifest, loadManifest, serializeContract } from "./manifest";
export { validateUdcPropReferences } from "./validators";
