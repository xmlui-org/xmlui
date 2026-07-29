/**
 * Node-only loader for UDC manifests.
 *
 * Kept separate from manifest.ts so browser/standalone bundles do not resolve
 * Node built-ins while importing the browser-safe manifest comparison helpers.
 */

import * as fs from "node:fs";
import path from "node:path";
import type { UdcContract } from "./contract";
import type { UdcManifest } from "./manifest";
import { validateManifestShape } from "./manifest";

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

  const candidatePaths: string[] = [];
  if (sourceFile) {
    candidatePaths.push(path.join(path.dirname(sourceFile), "udc.manifest.json"));
    candidatePaths.push(path.join(path.dirname(sourceFile), `${udcName}.udc.manifest.json`));
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
