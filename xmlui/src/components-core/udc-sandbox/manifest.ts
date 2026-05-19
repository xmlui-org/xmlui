/**
 * UDC Sandbox — manifest types and loader.
 *
 * A `udc.manifest.json` file (shipped alongside a packaged UDC) pins the
 * contract to a specific digest so that downstream apps can detect drift.
 *
 * Phase 1: types only; `loadManifest` is a stub.
 * Phase 3 (W7): full digest verification.
 *
 * Part of plan #14 "UDC Sandboxing".
 */

import type { UdcContract } from "./contract";

// ---------------------------------------------------------------------------
// Manifest schema
// ---------------------------------------------------------------------------

export interface UdcManifest {
  /** UDC name as declared in the `<Component name="…">` element. */
  name: string;
  /** Schema version of this manifest format. */
  schemaVersion: 1;
  /** SHA-256 digest of the serialised contract for drift detection. */
  contractDigest: string;
  /** Frozen snapshot of the contract, embedded for offline verification. */
  contract: SerializedUdcContract;
}

/** Wire-format snapshot of a `UdcContract` (plain JSON, no `Map`/`Set`). */
export interface SerializedUdcContract {
  props: Array<{ name: string; type?: string; required?: boolean; defaultValue?: unknown }>;
  events: string[];
  methods: string[];
  slots: string[];
  capabilities: string[];
  trust: "trusted" | "untrusted";
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

/**
 * Loads a `udc.manifest.json` for the given UDC.
 *
 * Phase 1 stub — always returns `null` (no manifest found).
 */
export async function loadManifest(
  _udcName: string,
  _contract: UdcContract,
): Promise<UdcManifest | null> {
  return null;
}
