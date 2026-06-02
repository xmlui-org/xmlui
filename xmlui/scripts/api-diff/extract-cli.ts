#!/usr/bin/env tsx
/**
 * Extract API surface CLI (plan #12 Phase 3 §3.3 companion).
 *
 * Reads the built component metadata from
 * `xmlui/dist/metadata/xmlui-metadata.cjs` and writes a deterministic
 * `ApiSurface` JSON to the path supplied via `--out`.
 *
 * Assumes the caller has run `npm run build:xmlui-metadata` (the
 * release-guard workflow chains it before invoking this script).
 *
 * Usage:
 *   tsx xmlui/scripts/api-diff/extract-cli.ts --out path/to/surface.json [--version 1.2.3]
 */

import { writeFileSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, readFileSync } from "node:fs";
import { extractApiSurface, serializeApiSurface } from "./extract";
import type { ComponentMetadata } from "../../src/abstractions/ComponentDefs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Args {
  out: string;
  version: string;
}

function parseArgs(argv: string[]): Args {
  const out: Partial<Args> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--out") out.out = argv[++i];
    else if (argv[i] === "--version") out.version = argv[++i];
  }
  if (!out.out) {
    console.error("[extract-cli] --out is required");
    process.exit(2);
  }
  if (!out.version) {
    // Default to the version recorded in xmlui/package.json so snapshots
    // round-trip through versioning bumps cleanly.
    try {
      const pkgPath = resolve(__dirname, "../../package.json");
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version?: string };
      out.version = pkg.version ?? "0.0.0";
    } catch {
      out.version = "0.0.0";
    }
  }
  return out as Args;
}

async function loadRegistry(): Promise<Record<string, ComponentMetadata>> {
  const cjsPath = resolve(__dirname, "../../dist/metadata/xmlui-metadata.cjs");
  if (!existsSync(cjsPath)) {
    console.error(
      `[extract-cli] metadata bundle not found at ${cjsPath} — run "npm run build:xmlui-metadata" first.`,
    );
    process.exit(2);
  }
  const mod: any = await import(cjsPath);
  const registry: Record<string, ComponentMetadata> | undefined =
    mod.collectedComponentMetadata ?? mod.default?.collectedComponentMetadata;
  if (!registry || typeof registry !== "object") {
    console.error(`[extract-cli] could not locate "collectedComponentMetadata" export in ${cjsPath}`);
    process.exit(2);
  }
  return registry;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const registry = await loadRegistry();
  const surface = extractApiSurface(registry, args.version);
  const outPath = resolve(args.out);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, serializeApiSurface(surface), "utf8");
  console.log(`[extract-cli] wrote ${Object.keys(surface.components).length} components to ${outPath}`);
}

main().catch((err) => {
  console.error("[extract-cli] fatal:", err);
  process.exit(2);
});
