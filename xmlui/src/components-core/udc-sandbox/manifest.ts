/**
 * UDC Sandbox — manifest types and loader.
 *
 * A `udc.manifest.json` file (shipped alongside a packaged UDC) pins the
 * contract to a specific digest so that downstream apps can detect drift.
 *
 * Wave 6: JSON manifest shape plus contract drift comparison helpers.
 *
 * Part of plan #14 "UDC Sandboxing".
 */

import type { UdcCapability, UdcContract } from "./contract";
import type { UdcDiagnostic } from "./diagnostics";

// ---------------------------------------------------------------------------
// Manifest schema
// ---------------------------------------------------------------------------

export interface UdcManifest {
  /** UDC name as declared in the `<Component name="…">` element. */
  name: string;
  /** Package/component version that shipped the manifest. */
  version: string;
  /** Schema version of this manifest format. Defaults to 1 for early manifests. */
  schemaVersion?: 1;
  /** Optional SHA-256 digest of the serialised contract for drift detection. */
  contractDigest?: string;
  /** Frozen snapshot of the contract, embedded for offline verification. */
  contract: SerializedUdcContract;
  trust?: "trusted" | "untrusted";
}

/** Wire-format snapshot of a `UdcContract` (plain JSON, no `Map`/`Set`). */
export interface SerializedUdcContract {
  props: Array<{ name: string; type?: string; required?: boolean; defaultValue?: unknown }>;
  events: string[];
  methods: string[];
  slots: Array<string | { name: string; provides?: string[] }>;
  capabilities: UdcCapability[];
  trust?: "trusted" | "untrusted";
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

export function serializeContract(contract: UdcContract): SerializedUdcContract {
  return {
    props: Array.from(contract.props.values()).sort((a, b) => a.name.localeCompare(b.name)),
    events: Array.from(contract.events).sort(),
    methods: Array.from(contract.methods).sort(),
    slots: Array.from(contract.slots)
      .sort()
      .map((name) => {
        const provides = contract.slotProvides?.get(name);
        return provides?.size ? { name, provides: Array.from(provides).sort() } : name;
      }),
    capabilities: Array.from(contract.capabilities).sort(),
    trust: contract.trust,
  };
}

export function compareManifest(
  manifest: UdcManifest,
  contract: UdcContract,
  strict: boolean,
): UdcDiagnostic[] {
  const actual = serializeContract(contract);
  const expected = {
    ...manifest.contract,
    trust: manifest.trust ?? manifest.contract.trust ?? "trusted",
  };
  const expectedJson = JSON.stringify(normalizeSerializedContract(expected));
  const actualJson = JSON.stringify(normalizeSerializedContract(actual));
  if (expectedJson === actualJson && manifest.name === contract.name) {
    return [];
  }
  return [
    {
      code: "udc-manifest-mismatch",
      severity: strict ? "error" : "warn",
      udc: contract.name,
      message:
        `UDC "${contract.name}" does not match its udc.manifest.json contract. ` +
        `Regenerate or update the manifest before publishing.`,
      data: {
        manifestName: manifest.name,
        expected: normalizeSerializedContract(expected),
        actual: normalizeSerializedContract(actual),
      },
    },
  ];
}

function normalizeSerializedContract(contract: SerializedUdcContract): SerializedUdcContract {
  return {
    props: [...(contract.props ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    events: [...(contract.events ?? [])].sort(),
    methods: [...(contract.methods ?? [])].sort(),
    slots: [...(contract.slots ?? [])]
      .map((slot) =>
        typeof slot === "string"
          ? slot
          : { name: slot.name, provides: [...(slot.provides ?? [])].sort() },
      )
      .sort((a, b) =>
        (typeof a === "string" ? a : a.name).localeCompare(typeof b === "string" ? b : b.name),
      ),
    capabilities: [...(contract.capabilities ?? [])].sort(),
    trust: contract.trust ?? "trusted",
  };
}
