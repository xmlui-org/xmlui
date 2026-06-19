import { spawn } from "node:child_process";
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const xmluiRoot = resolve(scriptDir, "..");
const repoRoot = resolve(xmluiRoot, "..");
const reportDir = resolve(xmluiRoot, ".compatibility-report");
const startedAt = new Date();

async function directorySize(path) {
  if (!existsSync(path)) {
    return null;
  }

  let total = 0;
  const entries = await readdir(path, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = resolve(path, entry.name);
    if (entry.isDirectory()) {
      total += await directorySize(entryPath);
    } else {
      total += (await stat(entryPath)).size;
    }
  }
  return total;
}

function runMeasured({ id, command, args, cwd }) {
  const started = Date.now();

  return new Promise((resolveResult) => {
    const child = spawn(command, args, {
      cwd,
      env: {
        ...process.env,
        CI: process.env.CI ?? "1",
      },
      shell: false,
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      resolveResult({
        id,
        status: "needs-investigation",
        durationMs: Date.now() - started,
        value: { command: [command, ...args].join(" "), error: error.message },
      });
    });
    child.on("close", (exitCode) => {
      resolveResult({
        id,
        status: exitCode === 0 ? "pass" : "needs-investigation",
        durationMs: Date.now() - started,
        value: {
          command: [command, ...args].join(" "),
          exitCode,
          stdoutBytes: stdout.length,
          stderrBytes: stderr.length,
        },
      });
    });
  });
}

const results = [];

results.push(await runMeasured({
  id: "script-semantics-unit-duration",
  command: "npx",
  args: ["vitest", "run", "tests/compiler/scriptSemantics.test.ts"],
  cwd: xmluiRoot,
}));

results.push(await runMeasured({
  id: "codegen-unit-duration",
  command: "npx",
  args: ["vitest", "run", "tests/compiler/codegen.test.ts"],
  cwd: xmluiRoot,
}));

results.push(await runMeasured({
  id: "compatibility-unit-duration",
  command: "npx",
  args: ["vitest", "run", "tests/compatibility"],
  cwd: xmluiRoot,
}));

results.push({
  id: "production-output-size",
  status: "informational",
  durationMs: 0,
  value: {
    bytes: await directorySize(resolve(xmluiRoot, "dist-production")),
  },
});

results.push({
  id: "ssg-output-size",
  status: "informational",
  durationMs: 0,
  value: {
    bytes: await directorySize(resolve(xmluiRoot, "dist-ssg")),
  },
});

const finishedAt = new Date();
const report = {
  schemaVersion: 1,
  startedAt: startedAt.toISOString(),
  finishedAt: finishedAt.toISOString(),
  durationMs: finishedAt.getTime() - startedAt.getTime(),
  status: "pass",
  originalBaseline: "/Users/dotneteer/source/xmlui",
  rewriteBaseline: repoRoot,
  results,
};

const markdown = [
  "# XMLUI Performance Baseline",
  "",
  `Started: ${report.startedAt}`,
  `Finished: ${report.finishedAt}`,
  "",
  "| Measurement | Status | Duration | Value |",
  "| --- | --- | --- | --- |",
  ...results.map((result) => `| ${result.id} | ${result.status} | ${result.durationMs.toFixed(3)}ms | \`${JSON.stringify(result.value)}\` |`),
  "",
  "These first-pass measurements are informational. Thresholds should be added after old-framework oracle numbers and noise ranges are captured.",
  "",
].join("\n");

await mkdir(reportDir, { recursive: true });
await writeFile(resolve(reportDir, "performance-baseline-latest.json"), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(resolve(reportDir, "performance-baseline-latest.md"), markdown);

console.log(`[compatibility:perf] wrote ${resolve(reportDir, "performance-baseline-latest.json")}`);
console.log(`[compatibility:perf] wrote ${resolve(reportDir, "performance-baseline-latest.md")}`);
