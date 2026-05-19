#!/usr/bin/env node
/**
 * xmlui udc audit — UDC sandbox audit report (Plan #14 Step 4.2).
 *
 * Walks `.xmlui` files under a directory, enumerates every compound
 * component (`<Component>` root), and prints its UDC contract: trust mode,
 * declared capabilities, props/events/methods, and slot context vars.
 *
 * Intended for reviewers who need to see — in one place — every UDC's
 * declared capabilities and trust posture before promoting a build to
 * production.  Pair with `--fail-on-untrusted` in CI to gate merges that
 * introduce `trust="untrusted"` components without explicit approval.
 *
 * Usage:
 *   node xmlui/scripts/cli/udc-audit.ts [directory] [options]
 *
 * Options:
 *   --format gnu|json     Output format (default: gnu)
 *   --fail-on-untrusted   Exit 1 when any UDC declares `trust="untrusted"`
 *
 * Exit codes:
 *   0 — clean (or only trusted UDCs found)
 *   1 — at least one untrusted UDC found AND --fail-on-untrusted was passed
 *   2 — usage / IO error
 */

import * as fs from "fs";
import * as path from "path";

import { parseXmlUiMarkup } from "../../src/parsers/xmlui-parser/parser";
import { nodeToComponentDef } from "../../src/parsers/xmlui-parser/transform";
import type {
  CompoundComponentDef,
  ComponentDef,
} from "../../src/abstractions/ComponentDefs";
import type { UdcContract } from "../../src/components-core/udc-sandbox";

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const targetDir = args.find((a) => !a.startsWith("--")) ?? process.cwd();
const format = (args.includes("--format")
  ? args[args.indexOf("--format") + 1]
  : "gnu") as "gnu" | "json";
const failOnUntrusted = args.includes("--fail-on-untrusted");

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------

function walkDir(dir: string, ext: string): string[] {
  const results: string[] = [];
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "node_modules" && !entry.name.startsWith(".")) {
        results.push(...walkDir(full, ext));
      } else if (entry.isFile() && entry.name.endsWith(ext)) {
        results.push(full);
      }
    }
  } catch {
    // skip unreadable
  }
  return results;
}

// ---------------------------------------------------------------------------
// Report record
// ---------------------------------------------------------------------------

interface UdcReportEntry {
  file: string;
  name: string;
  trust: "trusted" | "untrusted";
  capabilitiesDeclared: boolean;
  capabilities: string[];
  props: string[];
  events: string[];
  methods: string[];
  slots: Array<{ name: string; provides: string[] }>;
}

function isCompound(def: ComponentDef | CompoundComponentDef | null): def is CompoundComponentDef {
  return !!def && (def as CompoundComponentDef).component !== undefined;
}

function extractContract(def: CompoundComponentDef): UdcContract | undefined {
  return (def as any).contract as UdcContract | undefined;
}

function buildEntry(file: string, def: CompoundComponentDef): UdcReportEntry | null {
  const contract = extractContract(def);
  if (!contract) return null;
  return {
    file,
    name: contract.name ?? def.name ?? "<anonymous>",
    trust: contract.trust ?? "trusted",
    capabilitiesDeclared: contract.capabilitiesDeclared === true,
    capabilities: Array.from(contract.capabilities ?? []).sort(),
    props: Array.from(contract.props?.keys?.() ?? []).sort(),
    events: Array.from(contract.events?.keys?.() ?? []).sort(),
    methods: Array.from(contract.methods?.keys?.() ?? []).sort(),
    slots: Array.from(contract.slots?.entries?.() ?? []).map(([name, slot]) => ({
      name,
      provides: Array.from((slot as any).provides ?? []).sort(),
    })),
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const absTarget = path.resolve(targetDir);
  if (!fs.existsSync(absTarget)) {
    process.stderr.write(`xmlui udc audit: directory not found: ${absTarget}\n`);
    process.exit(2);
  }

  const files = walkDir(absTarget, ".xmlui");
  const entries: UdcReportEntry[] = [];

  for (const file of files) {
    let source: string;
    try {
      source = fs.readFileSync(file, "utf-8");
    } catch {
      continue;
    }
    const parsed = parseXmlUiMarkup(source);
    if (parsed.errors.length > 0 || !parsed.node) continue;
    const getText = (n: any) => source.substring(n.start ?? 0, n.end ?? 0);
    const def = nodeToComponentDef(parsed.node, getText, file);
    if (!isCompound(def)) continue;
    const entry = buildEntry(path.relative(absTarget, file), def);
    if (entry) entries.push(entry);
  }

  if (format === "json") {
    process.stdout.write(JSON.stringify(entries, null, 2) + "\n");
  } else {
    if (entries.length === 0) {
      process.stdout.write("xmlui udc audit: no UDCs with contracts found.\n");
    }
    for (const e of entries) {
      const caps = e.capabilitiesDeclared
        ? e.capabilities.length > 0
          ? e.capabilities.join(",")
          : "<none>"
        : "<implicit:all>";
      process.stdout.write(
        `${e.file}: ${e.name} trust=${e.trust} capabilities=${caps} ` +
          `props=${e.props.length} events=${e.events.length} ` +
          `methods=${e.methods.length} slots=${e.slots.length}\n`,
      );
    }
  }

  const untrustedCount = entries.filter((e) => e.trust === "untrusted").length;
  if (failOnUntrusted && untrustedCount > 0) {
    process.stderr.write(
      `xmlui udc audit: ${untrustedCount} untrusted UDC(s) found (--fail-on-untrusted).\n`,
    );
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  process.stderr.write(`xmlui udc audit: unhandled error: ${err}\n`);
  process.exit(2);
});
