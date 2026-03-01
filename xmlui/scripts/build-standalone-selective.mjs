#!/usr/bin/env node

/**
 * build-standalone-selective.mjs
 *
 * Builds a standalone XMLUI bundle excluding specific component groups.
 * Uses the same vite build --mode standalone as the normal build, but
 * injects VITE_USED_COMPONENTS_* env vars to exclude unused groups.
 *
 * Usage:
 *   # Exclude specific chunks (from xmlui build --analyze output)
 *   node scripts/build-standalone-selective.mjs --exclude accordionitem,avatar,badge,...
 *
 *   # Build with exclusions from a file (one chunk ID per line)
 *   node scripts/build-standalone-selective.mjs --exclude-file exclusions.txt
 *
 *   # Dry run — just print the env vars that would be set
 *   node scripts/build-standalone-selective.mjs --exclude tree,colorpicker --dry-run
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");

// Load manifest
const manifestPath = resolve(__dirname, "chunk-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

function getEnvOverrides(excludeChunks) {
  const overrides = {};
  for (const chunkId of excludeChunks) {
    const envVar = manifest.chunkEnvVars[chunkId];
    if (envVar) {
      overrides[envVar] = "false";
    } else {
      console.warn(`Warning: unknown chunk ID "${chunkId}", skipping`);
    }
  }
  return overrides;
}

function buildWithExclusions(excludeChunks, dryRun) {
  const overrides = getEnvOverrides(excludeChunks);

  console.log(`Excluding ${excludeChunks.length} of ${Object.keys(manifest.chunkEnvVars).length} component groups`);
  console.log(`Env overrides (${Object.keys(overrides).length}):`);
  for (const [k, v] of Object.entries(overrides).sort()) {
    console.log(`  ${k}=${v}`);
  }

  if (dryRun) {
    console.log("\nDry run — no build performed.");
    return;
  }

  // Set env vars and run vite build
  const env = { ...process.env, ...overrides };

  console.log("\nRunning: vite build --mode standalone");
  execSync("npx vite build --mode standalone", {
    cwd: ROOT,
    stdio: "inherit",
    env,
  });

  console.log("\nDone. Output in dist/standalone/");
}

// --- CLI ---
const args = process.argv.slice(2);

let excludeChunks = [];
let dryRun = args.includes("--dry-run");

if (args.includes("--exclude")) {
  const idx = args.indexOf("--exclude");
  const excludeStr = args[idx + 1];
  if (!excludeStr) {
    console.error("Usage: --exclude chunk1,chunk2,...");
    process.exit(1);
  }
  excludeChunks = excludeStr.split(",").map(s => s.trim()).filter(Boolean);
} else if (args.includes("--exclude-file")) {
  const idx = args.indexOf("--exclude-file");
  const filePath = args[idx + 1];
  if (!filePath) {
    console.error("Usage: --exclude-file <path>");
    process.exit(1);
  }
  excludeChunks = readFileSync(filePath, "utf-8")
    .split("\n")
    .map(s => s.trim())
    .filter(s => s && !s.startsWith("#"));
} else {
  console.log(`Usage:
  node scripts/build-standalone-selective.mjs --exclude chunk1,chunk2,...
  node scripts/build-standalone-selective.mjs --exclude-file exclusions.txt
  node scripts/build-standalone-selective.mjs --exclude tree,colorpicker --dry-run

Chunk IDs (from chunk-manifest.json):
  ${Object.keys(manifest.chunkEnvVars).sort().join(", ")}
`);
  process.exit(0);
}

buildWithExclusions(excludeChunks, dryRun);
