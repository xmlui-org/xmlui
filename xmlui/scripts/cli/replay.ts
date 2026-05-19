#!/usr/bin/env node
/**
 * xmlui replay — Trace replay/comparison CLI (Plan #16 Phase 4 Step 4.1).
 *
 * Compares two captured `XsLogEntry` streams and reports the first divergence.
 * The trace files are JSON arrays of `XsLogEntry` objects (the shape emitted
 * by the audit OTLP/JSON sink in plan #15 and the inspector's "Save trace"
 * button).
 *
 * Usage:
 *   node xmlui/scripts/cli/replay.ts <expected.json> [actual.json]
 *
 * If `actual.json` is omitted, the harness validates the expected trace is
 * self-consistent (always reports no divergence — useful as a smoke test).
 *
 * Options:
 *   --format gnu|json   Output format (default: gnu)
 *
 * Exit codes:
 *   0  — no divergence
 *   1  — divergence detected
 *   2  — usage / IO error
 *
 * Plan reference: `dev-docs/plans/16-concurrent-determinism.md` §Step 4.1.
 */

import * as fs from "fs";
import * as path from "path";
import { replay } from "../../src/components-core/scheduler/replay";
import type { XsLogEntry } from "../../src/components-core/inspector/inspectorUtils";

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

function getOption(name: string): string | undefined {
  const idx = args.indexOf(name);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

const positional = args.filter((a) => !a.startsWith("--") && !isOptionValue(a));
const expectedPath = positional[0];
const actualPath = positional[1];
const format = (getOption("--format") ?? "gnu") as "gnu" | "json";

function isOptionValue(arg: string): boolean {
  const idx = args.indexOf(arg);
  if (idx <= 0) return false;
  return args[idx - 1] === "--format";
}

// ---------------------------------------------------------------------------
// Trace loading
// ---------------------------------------------------------------------------

function loadTrace(file: string): XsLogEntry[] {
  const abs = path.resolve(file);
  if (!fs.existsSync(abs)) {
    process.stderr.write(`xmlui replay: trace file not found: ${abs}\n`);
    process.exit(2);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(abs, "utf-8"));
  } catch (err) {
    process.stderr.write(`xmlui replay: invalid JSON in ${abs}: ${err}\n`);
    process.exit(2);
  }
  if (!Array.isArray(parsed)) {
    process.stderr.write(`xmlui replay: ${abs} must contain a JSON array of XsLogEntry objects\n`);
    process.exit(2);
  }
  return parsed as XsLogEntry[];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  if (!expectedPath) {
    process.stderr.write(
      "xmlui replay: usage: xmlui replay <expected.json> [actual.json] [--format gnu|json]\n",
    );
    process.exit(2);
  }

  const expected = loadTrace(expectedPath);
  const actual = actualPath ? loadTrace(actualPath) : undefined;

  const result = await replay({ traces: expected, actualTraces: actual });

  if (format === "json") {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  } else if (result.diverged) {
    process.stdout.write(
      `xmlui replay: divergence at entry ${result.divergenceAt}\n` +
        `  expected: ${result.expected ? JSON.stringify(result.expected) : "<missing>"}\n` +
        `  actual:   ${result.actual ? JSON.stringify(result.actual) : "<missing>"}\n`,
    );
  } else {
    process.stdout.write(`xmlui replay: no divergence (${expected.length} entries compared)\n`);
  }

  process.exit(result.diverged ? 1 : 0);
}

main().catch((err) => {
  process.stderr.write(`xmlui replay: unhandled error: ${err}\n`);
  process.exit(2);
});
