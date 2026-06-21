import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const rewriteRoot = path.join(repoRoot, "xmlui");
const oldComponentRoot = "/Users/dotneteer/source/xmlui/xmlui/src/components";
const rewriteComponentRoot = path.join(rewriteRoot, "src", "components");
const reportDir = path.join(rewriteRoot, ".compatibility-report");
const reportJson = path.join(reportDir, "component-e2e-audit-latest.json");
const reportMd = path.join(reportDir, "component-e2e-audit-latest.md");

const testCallPattern = /\btest(?:\.(?!describe\b)[A-Za-z]+)?\s*\(/g;
const sourceFilePattern = /\.spec\.tsx?$/;
const expandedComponents = new Set(
  process.argv
    .filter((arg) => arg.startsWith("--expanded="))
    .flatMap((arg) => arg.slice("--expanded=".length).split(","))
    .map((name) => name.trim())
    .filter(Boolean),
);
const expandedAll = process.argv.includes("--expanded-all");

const components = listDirectories(rewriteComponentRoot)
  .filter((name) => existsSync(path.join(oldComponentRoot, name)))
  .sort((a, b) => a.localeCompare(b));

const rows = components.map((component) => {
  const oldFolder = path.join(oldComponentRoot, component);
  const rewriteFolder = path.join(rewriteComponentRoot, component);
  const oldSpecs = listSpecFiles(oldFolder);
  const rewriteSpecs = listSpecFiles(rewriteFolder);
  const oldTests = oldSpecs.flatMap((file) => collectTests(file, oldFolder));
  const rewriteTests = rewriteSpecs.flatMap((file) => collectTests(file, rewriteFolder));
  const rewriteOldSpecs = rewriteSpecs
    .filter((file) => file.endsWith(".spec.ts"))
  const rewriteOldTests = rewriteOldSpecs.flatMap((file) => collectTests(file, rewriteFolder));
  const shouldUseExpandedCounts = expandedAll || expandedComponents.has(component);
  const expandedOldTestCount = shouldUseExpandedCounts
    ? countListedTests({
        cwd: path.join(repoRoot, "..", "xmlui", "xmlui"),
        config: "..",
        files: oldSpecs,
        fallback: oldTests.length,
      })
    : oldTests.length;
  const expandedTransferredOldTestCount = shouldUseExpandedCounts
    ? countListedTests({
        cwd: rewriteRoot,
        files: rewriteOldSpecs,
        fallback: rewriteOldTests.length,
      })
    : rewriteOldTests.length;
  const missingCount = Math.max(0, expandedOldTestCount - expandedTransferredOldTestCount);

  return {
    component,
    oldSpecCount: oldSpecs.length,
    oldTestCount: expandedOldTestCount,
    oldStaticTestCallCount: oldTests.length,
    expandedCountUsed: shouldUseExpandedCounts,
    rewriteSpecCount: rewriteSpecs.length,
    rewriteTestCount: rewriteTests.length,
    transferredOldTestCount: expandedTransferredOldTestCount,
    transferredOldStaticTestCallCount: rewriteOldTests.length,
    missingOldTestCount: missingCount,
    oldSpecs: oldSpecs.map((file) => path.relative(repoRoot, file)),
    rewriteSpecs: rewriteSpecs.map((file) => path.relative(repoRoot, file)),
    status: oldTests.length === 0
      ? "no-old-tests"
      : missingCount === 0
        ? "complete-or-overported"
        : "incomplete",
  };
});

const summary = {
  checkedComponents: rows.length,
  incompleteComponents: rows.filter((row) => row.status === "incomplete").length,
  oldTestCount: rows.reduce((sum, row) => sum + row.oldTestCount, 0),
  transferredOldTestCount: rows.reduce((sum, row) => sum + row.transferredOldTestCount, 0),
  missingOldTestCount: rows.reduce((sum, row) => sum + row.missingOldTestCount, 0),
};

writeFileSync(reportJson, `${JSON.stringify({ summary, rows }, null, 2)}\n`);
writeFileSync(reportMd, markdownReport(summary, rows));

console.log(`[component-e2e-audit] wrote ${reportJson}`);
console.log(`[component-e2e-audit] wrote ${reportMd}`);
console.log(`[component-e2e-audit] ${summary.transferredOldTestCount}/${summary.oldTestCount} old component tests accounted for by transferred old E2E specs`);

if (process.argv.includes("--fail-on-incomplete") && summary.incompleteComponents > 0) {
  process.exitCode = 1;
}

function listDirectories(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function listSpecFiles(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && sourceFilePattern.test(entry.name))
    .map((entry) => path.join(dir, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

function collectTests(file, baseDir) {
  const source = readFileSync(file, "utf8");
  return [...source.matchAll(testCallPattern)].map((match, index) => ({
    file: path.relative(baseDir, file),
    ordinal: index + 1,
    offset: match.index,
  }));
}

function countListedTests({
  cwd,
  config,
  files,
  fallback,
}) {
  if (files.length === 0) {
    return 0;
  }
  const relativeFiles = files.map((file) => path.relative(cwd, file));
  try {
    const args = ["playwright", "test"];
    if (config) {
      args.push("-c", config);
    }
    args.push(...relativeFiles, "--list");
    const output = execFileSync("npx", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const match = /Total:\s+(\d+)\s+tests?/m.exec(output);
    return match ? Number(match[1]) : fallback;
  } catch {
    return fallback;
  }
}

function markdownReport(summary, rows) {
  const lines = [
    "# Component E2E Audit",
    "",
    "This report compares old XMLUI component specs with transferred old E2E specs in the rewrite.",
    "",
    "## Summary",
    "",
    `- Checked components: ${summary.checkedComponents}`,
    `- Incomplete components: ${summary.incompleteComponents}`,
    `- Old component tests: ${summary.oldTestCount}`,
    `- Transferred old tests: ${summary.transferredOldTestCount}`,
    `- Missing old tests: ${summary.missingOldTestCount}`,
    "",
    "## Components",
    "",
    "| Component | Old tests | Transferred old tests | Missing | Status |",
    "| --- | ---: | ---: | ---: | --- |",
  ];

  for (const row of rows) {
    lines.push(
      `| ${row.component} | ${row.oldTestCount} | ${row.transferredOldTestCount} | ${row.missingOldTestCount} | ${row.status} |`,
    );
  }

  lines.push("");
  return `${lines.join("\n")}\n`;
}
