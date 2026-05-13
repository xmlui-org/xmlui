#!/usr/bin/env node
/**
 * Website example test coverage checker.
 *
 * Scans hand-authored documentation markdown files under
 * `website/content/docs/pages/` (excluding `reference/`) and reports
 * which files have named `xmlui-pg` codefences that lack a corresponding
 * Playwright spec file or whose spec is stale (codefence names have changed).
 *
 * Usage:
 *   node xmlui/scripts/check-example-tests.mjs [options]
 *
 * Options:
 *   --interactive-only   Only report (and fail on) files with untested
 *                        interactive examples. Display-only gaps are shown
 *                        as informational warnings but do not fail.
 *                        (Default: report all gaps, fail on any)
 *   --no-fail            Print the report but always exit 0. Useful for
 *                        informational runs in CI that should not block.
 *   --json               Output machine-readable JSON to stdout instead of
 *                        human-readable text.
 *   --watch              Watch mode: re-scan only the changed markdown file
 *                        whenever a .md file under pages/ is saved. Prints
 *                        a focused single-file report each time. Does not
 *                        exit automatically; press Ctrl-C to stop.
 *
 * Exit codes:
 *   0  No actionable gaps found (or --no-fail was passed, or --watch)
 *   1  One or more files need a new or updated spec
 */

import { readFileSync, existsSync, readdirSync, statSync, watch } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const XMLUI_ROOT = join(__dirname, "..");
const WORKSPACE_ROOT = join(XMLUI_ROOT, "..");
const PAGES_ROOT = join(WORKSPACE_ROOT, "website", "content", "docs", "pages");
const TESTS_E2E_ROOT = join(XMLUI_ROOT, "tests-e2e");

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const INTERACTIVE_ONLY = args.includes("--interactive-only");
const NO_FAIL = args.includes("--no-fail");
const JSON_OUTPUT = args.includes("--json");
const WATCH_MODE = args.includes("--watch");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Walk a directory recursively; yield absolute paths of files matching ext. */
function* walkFiles(dir, ext) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      yield* walkFiles(full, ext);
    } else if (full.endsWith(ext)) {
      yield full;
    }
  }
}

/**
 * Extract all named xmlui-pg codefences from markdown content.
 * Returns an array of { name, interactive } objects.
 *
 * "Interactive" means the codefence body contains an event-handler attribute
 * (on[A-Z]...) or a ---api section marker.
 * 
 * Codefences are considered "named" if they have either:
 *   - A name="..." attribute (preferred for display)
 *   - An id="..." attribute (stable identifier for testing)
 */
function extractNamedCodefences(content) {
  const results = [];
  // Match codefences with either name or id attribute
  const pattern = /```xmlui-pg[^\n]*(?:\bname="([^"]+)"|\bid="([^"]+)")[^\n]*\n([\s\S]*?)```/g;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    const name = match[1] || match[2]; // Use name if present, otherwise use id
    const body = match[3];
    const interactive = /\bon[A-Z]|^---api\b/m.test(body);
    results.push({ name, interactive });
  }
  return results;
}

/**
 * Extract the set of test.describe titles from a spec file.
 * Matches both single- and double-quoted names.
 */
function extractDescribeNames(content) {
  const names = new Set();
  const pattern = /test\.describe\(\s*["'`]([^"'`]+)["'`]/g;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    names.add(match[1]);
  }
  return names;
}

/**
 * Map a markdown path (absolute) to the expected spec file path (absolute).
 *
 * Conventions:
 *   pages/howto/<name>.md           → tests-e2e/how-to-examples/<name>.spec.ts
 *   pages/<name>.md                 → tests-e2e/pages/<name>.spec.ts
 *   pages/<subdir>/<name>.md        → tests-e2e/pages/<subdir>/<name>.spec.ts
 */
function markdownToSpecPath(mdPath) {
  const rel = relative(PAGES_ROOT, mdPath); // e.g. "howto/foo.md" or "layout.md"
  const withoutExt = rel.slice(0, -".md".length);
  const normalized = withoutExt.replace(/\\/g, "/");

  let specRel;
  if (normalized.startsWith("howto/")) {
    specRel = "how-to-examples/" + normalized.slice("howto/".length) + ".spec.ts";
  } else {
    specRel = "pages/" + normalized + ".spec.ts";
  }
  return join(TESTS_E2E_ROOT, specRel);
}

// ---------------------------------------------------------------------------
// Per-file scan (also used by watch mode)
// ---------------------------------------------------------------------------

/**
 * Scan a single markdown file and return its coverage status.
 * Returns null if the file should be skipped (no xmlui-pg, or reference doc).
 */
function scanFile(mdPath) {
  const relFromPages = relative(PAGES_ROOT, mdPath).replace(/\\/g, "/");
  if (relFromPages.startsWith("../reference/")) return null;

  const content = readFileSync(mdPath, "utf8");

  if (!content.includes("```xmlui-pg")) {
    return { kind: "noExamples", mdRel: relFromPages };
  }

  const examples = extractNamedCodefences(content);
  if (examples.length === 0) {
    return { kind: "noNamedExamples", mdRel: relFromPages };
  }

  const specPath = markdownToSpecPath(mdPath);
  const specRel = relative(XMLUI_ROOT, specPath).replace(/\\/g, "/");

  if (!existsSync(specPath)) {
    return { kind: "missingSpec", mdRel: relFromPages, specRel, examples };
  }

  const specContent = readFileSync(specPath, "utf8");
  const describedNames = extractDescribeNames(specContent);

  const added = examples.filter(({ name }) => !describedNames.has(name));
  const removed = [...describedNames].filter(
    (name) => !examples.some((e) => e.name === name),
  );

  if (added.length > 0 || removed.length > 0) {
    return { kind: "staleSpec", mdRel: relFromPages, specRel, added, removed, examples };
  }
  return { kind: "ok", mdRel: relFromPages, specRel };
}

// ---------------------------------------------------------------------------
// Full scan
// ---------------------------------------------------------------------------

function runFullScan() {
  const report = {
    missingSpec: [],
    staleSpec: [],
    ok: [],
    noNamedExamples: [],
    noExamples: [],
  };

  for (const mdPath of walkFiles(PAGES_ROOT, ".md")) {
    const result = scanFile(mdPath);
    if (result) report[result.kind].push(result);
  }
  return report;
}

// ---------------------------------------------------------------------------
// Helpers — output formatting
// ---------------------------------------------------------------------------

function isActionable(entry) {
  if (!INTERACTIVE_ONLY) return true;
  const examples = entry.examples ?? [];
  const addedOrAll = entry.added ?? examples;
  return addedOrAll.some((e) => e.interactive);
}

function summarizeCounts(examples) {
  const interactive = examples.filter((e) => e.interactive).length;
  const display = examples.length - interactive;
  const parts = [];
  if (interactive > 0) parts.push(`${interactive} interactive`);
  if (display > 0) parts.push(`${display} display-only`);
  return `${examples.length} named example${examples.length !== 1 ? "s" : ""}: ${parts.join(", ")}`;
}

function printReport(report) {
  const actionableMissing = report.missingSpec.filter(isActionable);
  const actionableStale = report.staleSpec.filter(isActionable);
  const hasFailures = actionableMissing.length > 0 || actionableStale.length > 0;

  if (JSON_OUTPUT) {
    console.log(
      JSON.stringify(
        {
          missingSpec: report.missingSpec,
          staleSpec: report.staleSpec,
          ok: report.ok,
          noNamedExamples: report.noNamedExamples,
          interactiveOnlyMode: INTERACTIVE_ONLY,
          actionableFailures: hasFailures,
        },
        null,
        2,
      ),
    );
    return hasFailures;
  }

  const interactiveLabel = INTERACTIVE_ONLY ? " (interactive examples only)" : "";

  if (report.missingSpec.length > 0) {
    console.log(`\n❌  Missing spec files${interactiveLabel}:\n`);
    for (const { mdRel, specRel, examples } of report.missingSpec) {
      const flag = isActionable({ mdRel, specRel, examples }) ? "❌" : "⚠️ ";
      console.log(`  ${flag}  ${mdRel}`);
      console.log(`       → expected: ${specRel}`);
      console.log(`       ${summarizeCounts(examples)}\n`);
    }
  }

  if (report.staleSpec.length > 0) {
    console.log(`\n⚠️   Stale spec files${interactiveLabel}:\n`);
    for (const { mdRel, specRel, added, removed } of report.staleSpec) {
      const flag = isActionable({ mdRel, specRel, added }) ? "❌" : "⚠️ ";
      console.log(`  ${flag}  ${mdRel}  →  ${specRel}`);
      if (added.length > 0) {
        console.log(`       + added examples (need test.describe):`);
        for (const e of added) {
          console.log(`         • "${e.name}"${e.interactive ? "" : "  [display-only]"}`);
        }
      }
      if (removed.length > 0) {
        console.log(`       - removed examples (stale test.describe to delete):`);
        for (const name of removed) console.log(`         • "${name}"`);
      }
      console.log();
    }
  }

  if (report.noNamedExamples.length > 0 && !WATCH_MODE) {
    console.log(`\nℹ️   Files with xmlui-pg codefences that lack name= attributes (untestable):\n`);
    for (const { mdRel } of report.noNamedExamples) console.log(`     ${mdRel}`);
  }

  const totalMd =
    report.missingSpec.length +
    report.staleSpec.length +
    report.ok.length +
    report.noNamedExamples.length;

  if (!WATCH_MODE) {
    console.log(`\n📊  Summary`);
    console.log(`   Scanned:        ${totalMd} files with xmlui-pg examples`);
    console.log(`   ✅ OK:           ${report.ok.length}`);
    console.log(`   ❌ Missing spec: ${report.missingSpec.length} (${actionableMissing.length} actionable)`);
    console.log(`   ⚠️  Stale spec:  ${report.staleSpec.length} (${actionableStale.length} actionable)`);
    console.log(`   ℹ️  Unnamed:     ${report.noNamedExamples.length}`);
  }

  if (!hasFailures) {
    console.log(`\n✅  All example tests are up to date${interactiveLabel}.\n`);
  } else {
    console.log(
      `\nRun the following prompts to fix the gaps:\n` +
        `  • New articles:     #add-website-example-tests\n` +
        `  • Changed articles: #update-website-example-tests\n`,
    );
  }

  return hasFailures;
}

// ---------------------------------------------------------------------------
// Watch mode
// ---------------------------------------------------------------------------

if (WATCH_MODE) {
  // Debounce map: filename → timer. Prevents double-firing on some editors
  // that write files in two steps (truncate then write).
  const debounceTimers = new Map();
  const DEBOUNCE_MS = 120;

  console.log(`\n👁  Watching ${PAGES_ROOT} for changes… (Ctrl-C to stop)\n`);

  watch(PAGES_ROOT, { recursive: true }, (eventType, filename) => {
    if (!filename || !filename.endsWith(".md")) return;

    const mdPath = resolve(PAGES_ROOT, filename);

    if (debounceTimers.has(mdPath)) {
      clearTimeout(debounceTimers.get(mdPath));
    }
    debounceTimers.set(
      mdPath,
      setTimeout(() => {
        debounceTimers.delete(mdPath);
        const relFromPages = relative(PAGES_ROOT, mdPath).replace(/\\/g, "/");
        console.log(`\n🔄  ${relFromPages} changed — re-scanning…`);

        if (!existsSync(mdPath)) {
          // File was deleted — check if spec still exists
          const specPath = markdownToSpecPath(mdPath);
          if (existsSync(specPath)) {
            const specRel = relative(XMLUI_ROOT, specPath).replace(/\\/g, "/");
            console.log(`⚠️   Markdown deleted but spec still exists: ${specRel}`);
            console.log(`    Delete it manually or run #update-website-example-tests\n`);
          } else {
            console.log(`✅  Deleted file had no spec. Nothing to do.\n`);
          }
          return;
        }

        const result = scanFile(mdPath);
        if (!result) {
          console.log(`ℹ️   Skipped (reference doc or not a pages file).\n`);
          return;
        }

        // Build a mini-report containing only this file for printReport
        const miniReport = {
          missingSpec: result.kind === "missingSpec" ? [result] : [],
          staleSpec: result.kind === "staleSpec" ? [result] : [],
          ok: result.kind === "ok" ? [result] : [],
          noNamedExamples: result.kind === "noNamedExamples" ? [result] : [],
          noExamples: [],
        };
        printReport(miniReport);
      }, DEBOUNCE_MS),
    );
  });

  // Keep the process alive
  process.stdin.resume();
  process.on("SIGINT", () => {
    console.log("\n👋  Watch stopped.\n");
    process.exit(0);
  });
} else {
  // ---------------------------------------------------------------------------
  // One-shot mode
  // ---------------------------------------------------------------------------
  const report = runFullScan();
  const hasFailures = printReport(report);

  if (hasFailures && !NO_FAIL) {
    process.exit(1);
  }
}
