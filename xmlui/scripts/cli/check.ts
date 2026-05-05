#!/usr/bin/env node
/**
 * xmlui check — Static analyzer CLI (Plan #13 Phase 5).
 *
 * Discovers all `.xmlui` files under a given directory, runs the build
 * validator, and reports findings in GNU or JSON format.
 *
 * Usage:
 *   node xmlui/scripts/cli/check.ts [directory] [options]
 *
 * Options:
 *   --format gnu|json   Output format (default: gnu)
 *   --strict            Treat warn-severity findings as errors
 *   --rule <code>       Include only findings with this code (repeatable)
 *   --no-rule <code>    Exclude findings with this code (repeatable)
 *
 * Exit codes:
 *   0  — no error-severity findings
 *   1  — one or more error-severity findings
 *   2  — usage / IO error
 */

import * as path from "path";
import * as fs from "fs";
import { analyze } from "../../src/components-core/analyzer/walker";
import type { BuildDiagnostic } from "../../src/components-core/analyzer/diagnostics";

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

function getFlag(name: string): boolean {
  return args.includes(name);
}

function getOption(name: string): string | undefined {
  const idx = args.indexOf(name);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

function getRepeatedOption(name: string): string[] {
  const result: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === name && i + 1 < args.length) {
      result.push(args[i + 1]);
      i++;
    }
  }
  return result;
}

const targetDir = args.find((a) => !a.startsWith("--")) ?? process.cwd();
const format = (getOption("--format") ?? "gnu") as "gnu" | "json";
const strict = getFlag("--strict");
const includeRules = getRepeatedOption("--rule");
const excludeRules = getRepeatedOption("--no-rule");

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
    // Directory not accessible — skip
  }
  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const absTarget = path.resolve(targetDir);
  if (!fs.existsSync(absTarget)) {
    process.stderr.write(`xmlui check: directory not found: ${absTarget}\n`);
    process.exit(2);
  }

  const files = walkDir(absTarget, ".xmlui");
  if (files.length === 0) {
    process.stderr.write(`xmlui check: no .xmlui files found under ${absTarget}\n`);
    process.exit(0);
  }

  const inputFiles = files.map((f) => ({
    file: path.relative(absTarget, f),
    source: fs.readFileSync(f, "utf-8"),
  }));

  let diagnostics: BuildDiagnostic[];
  try {
    diagnostics = analyze({ files: inputFiles, strict });
  } catch (err) {
    process.stderr.write(`xmlui check: analyzer error: ${err}\n`);
    process.exit(2);
  }

  // Apply rule filters
  if (includeRules.length > 0) {
    diagnostics = diagnostics.filter((d) => includeRules.includes(d.code));
  }
  if (excludeRules.length > 0) {
    diagnostics = diagnostics.filter((d) => !excludeRules.includes(d.code));
  }

  // Output
  if (format === "json") {
    process.stdout.write(JSON.stringify(diagnostics, null, 2) + "\n");
  } else {
    // GNU format: file:line:col: severity: message [code]
    for (const d of diagnostics) {
      const loc = `${d.file}:${d.line ?? 0}:${d.column ?? 0}`;
      const sev = d.severity === "error" ? "error" : d.severity === "warn" ? "warning" : "note";
      process.stdout.write(`${loc}: ${sev}: ${d.message} [${d.code}]\n`);
    }
  }

  const hasErrors = diagnostics.some((d) => d.severity === "error");
  process.exit(hasErrors ? 1 : 0);
}

main().catch((err) => {
  process.stderr.write(`xmlui check: unhandled error: ${err}\n`);
  process.exit(2);
});
