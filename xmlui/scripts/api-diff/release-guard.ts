#!/usr/bin/env tsx
/**
 * Release-guard CLI (plan #12 Phase 3 §3.3).
 *
 * Reads two `ApiSurface` JSON snapshots (previous and current), diffs
 * them, scans `.changeset/*.md` for staged entries, and prints a
 * Markdown report describing whether the staged changesets satisfy
 * the recommended bump.
 *
 * Usage:
 *   tsx xmlui/scripts/api-diff/release-guard.ts \
 *     --prev path/to/prev-surface.json \
 *     --next path/to/next-surface.json \
 *     [--changesets .changeset] \
 *     [--package xmlui] \
 *     [--allow-patch]
 *
 * Exit codes:
 *   0  staged changesets cover the required bump (or `--allow-patch`)
 *   1  staged changesets are insufficient
 *   2  invalid invocation / I/O error
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { diffApiSurfaces } from "./diff";
import { suggestChangeset, type ChangesetEntry } from "./suggest-changeset";
import type { ApiSurface } from "./extract";
import type { BumpType } from "./diff";

interface Args {
  prev: string;
  next: string;
  changesets: string;
  packageName: string;
  allowPatch: boolean;
}

function parseArgs(argv: string[]): Args {
  const out: Partial<Args> = {
    changesets: ".changeset",
    packageName: "xmlui",
    allowPatch: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "--prev":
        out.prev = argv[++i];
        break;
      case "--next":
        out.next = argv[++i];
        break;
      case "--changesets":
        out.changesets = argv[++i];
        break;
      case "--package":
        out.packageName = argv[++i];
        break;
      case "--allow-patch":
        out.allowPatch = true;
        break;
      default:
        if (arg.startsWith("--")) {
          console.error(`[release-guard] unknown flag: ${arg}`);
          process.exit(2);
        }
    }
  }
  if (!out.prev || !out.next) {
    console.error("[release-guard] --prev and --next are required");
    process.exit(2);
  }
  return out as Args;
}

function loadSurface(path: string): ApiSurface {
  const text = readFileSync(resolve(path), "utf8");
  return JSON.parse(text) as ApiSurface;
}

function loadChangesets(dir: string): ChangesetEntry[] {
  const root = resolve(dir);
  if (!existsSync(root)) return [];
  const out: ChangesetEntry[] = [];
  for (const file of readdirSync(root)) {
    if (!file.endsWith(".md") || file.toLowerCase() === "readme.md") continue;
    const full = join(root, file);
    const text = readFileSync(full, "utf8");
    const fm = parseFrontmatter(text);
    if (!fm) continue;
    out.push({ file, packages: fm.packages, body: fm.body });
  }
  return out;
}

function parseFrontmatter(
  text: string,
): { packages: Record<string, BumpType>; body: string } | null {
  const trimmed = text.replace(/^\uFEFF/, "");
  if (!trimmed.startsWith("---")) return null;
  const end = trimmed.indexOf("\n---", 3);
  if (end === -1) return null;
  const yamlBlock = trimmed.slice(3, end).trim();
  const body = trimmed.slice(end + 4).trim();
  const packages: Record<string, BumpType> = {};
  for (const rawLine of yamlBlock.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const m = line.match(/^"?([^":]+)"?\s*:\s*(patch|minor|major)\s*$/);
    if (!m) continue;
    packages[m[1].trim()] = m[2] as BumpType;
  }
  return { packages, body };
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const prev = loadSurface(args.prev);
  const next = loadSurface(args.next);
  const diff = diffApiSurfaces(prev, next);

  const changesets = loadChangesets(args.changesets);
  const result = suggestChangeset(diff, changesets, {
    allowPatch: args.allowPatch,
    packageName: args.packageName,
  });

  console.log(`# Release-guard report — package \`${args.packageName}\``);
  console.log("");
  console.log(`Required bump: **${result.required}**`);
  console.log(`Covered: **${result.covered ? "yes" : "no"}**`);
  if (args.allowPatch) console.log("(`--allow-patch` override is active)");
  console.log("");
  console.log(result.report);

  if (!result.covered && !args.allowPatch) {
    process.exit(1);
  }
}

main();
