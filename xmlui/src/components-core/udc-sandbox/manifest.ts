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
 * Looks for a sibling `udc.manifest.json` file next to the UDC source file
 * (when `sourceFile` is provided) or in `searchDirs` (when supplied).  When
 * the manifest is found, it is parsed, basic-validated, and returned.
 *
 * Designed to run in node-style environments (CLI, Vite plugin, LSP).
 * In browser bundles `fs`/`path` are unavailable; the function then returns
 * `null` rather than throwing, so callers can stay environment-agnostic.
 */
export async function loadManifest(
  udcName: string,
  contract: UdcContract,
  options?: {
    sourceFile?: string;
    searchDirs?: string[];
  },
): Promise<UdcManifest | null> {
  void contract;
  const sourceFile = options?.sourceFile;
  const searchDirs = options?.searchDirs ?? [];

  let fs: typeof import("fs") | undefined;
  let path: typeof import("path") | undefined;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    fs = require("fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    path = require("path");
  } catch {
    return null;
  }
  if (!fs || !path) return null;

  const candidatePaths: string[] = [];
  if (sourceFile) {
    candidatePaths.push(path.join(path.dirname(sourceFile), "udc.manifest.json"));
    candidatePaths.push(
      path.join(path.dirname(sourceFile), `${udcName}.udc.manifest.json`),
    );
  }
  for (const dir of searchDirs) {
    candidatePaths.push(path.join(dir, "udc.manifest.json"));
    candidatePaths.push(path.join(dir, `${udcName}.udc.manifest.json`));
  }

  for (const p of candidatePaths) {
    let raw: string;
    try {
      if (!fs.existsSync(p)) continue;
      raw = fs.readFileSync(p, "utf-8");
    } catch {
      continue;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }
    const manifest = validateManifestShape(parsed, udcName);
    if (manifest) return manifest;
  }
  return null;
}

function validateManifestShape(value: unknown, expectedName: string): UdcManifest | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (typeof v.name !== "string" || typeof v.version !== "string") return null;
  if (!v.contract || typeof v.contract !== "object") return null;
  // Accept either a single-UDC manifest or a multi-UDC manifest with
  // `udcs: [{ name, version, contract, ... }]`; only return when the named
  // entry matches `expectedName`.
  if (v.name === expectedName) {
    return v as unknown as UdcManifest;
  }
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
