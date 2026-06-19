import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const xmluiRoot = resolve(scriptDir, "..");
const repoRoot = resolve(xmluiRoot, "..");
const reportDir = resolve(xmluiRoot, ".compatibility-report");
const startedAt = new Date();

const commands = [
  {
    id: "unit-compiler",
    surface: "compiler-runtime",
    command: "npm",
    args: ["run", "test"],
    cwd: xmluiRoot,
    required: true,
  },
  {
    id: "compatibility-unit",
    surface: "compatibility",
    command: "npx",
    args: ["vitest", "run", "tests/compatibility"],
    cwd: xmluiRoot,
    required: true,
  },
  {
    id: "metadata",
    surface: "metadata",
    command: "npm",
    args: ["run", "build:metadata"],
    cwd: xmluiRoot,
    required: true,
  },
  {
    id: "production",
    surface: "production",
    command: "npm",
    args: ["run", "build:production"],
    cwd: xmluiRoot,
    required: true,
  },
  {
    id: "ssg",
    surface: "ssg",
    command: "npm",
    args: ["run", "build:ssg"],
    cwd: xmluiRoot,
    required: true,
  },
  {
    id: "docs-reference",
    surface: "docs",
    command: "npm",
    args: ["run", "build:docs-reference"],
    cwd: xmluiRoot,
    required: true,
  },
  {
    id: "vscode-build",
    surface: "vscode",
    command: "npm",
    args: ["--workspace", "xmlui-vscode", "run", "build"],
    cwd: repoRoot,
    required: true,
  },
  {
    id: "vscode-test",
    surface: "vscode",
    command: "npm",
    args: ["--workspace", "xmlui-vscode", "run", "test"],
    cwd: repoRoot,
    required: true,
  },
  {
    id: "extension-test",
    surface: "extension",
    command: "npm",
    args: ["--workspace", "xmlui-counter-badge", "run", "test"],
    cwd: repoRoot,
    required: true,
  },
  {
    id: "extension-build",
    surface: "extension",
    command: "npm",
    args: ["--workspace", "xmlui-counter-badge", "run", "build"],
    cwd: repoRoot,
    required: true,
  },
  {
    id: "extension-metadata",
    surface: "extension",
    command: "npm",
    args: ["--workspace", "xmlui-counter-badge", "run", "build:metadata"],
    cwd: repoRoot,
    required: true,
  },
  {
    id: "e2e",
    surface: "e2e",
    command: "npm",
    args: ["run", "test:e2e"],
    cwd: xmluiRoot,
    required: true,
  },
];

function trimOutput(value) {
  const max = 8000;
  if (value.length <= max) {
    return value;
  }
  return `${value.slice(0, 2000)}\n\n... output truncated ...\n\n${value.slice(-5000)}`;
}

function runCommand(item) {
  const started = Date.now();

  return new Promise((resolveResult) => {
    const child = spawn(item.command, item.args, {
      cwd: item.cwd,
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
      process.stdout.write(chunk);
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk;
      process.stderr.write(chunk);
    });

    child.on("error", (error) => {
      resolveResult({
        ...item,
        status: "needs-investigation",
        exitCode: null,
        durationMs: Date.now() - started,
        stdout: trimOutput(stdout),
        stderr: trimOutput(`${stderr}\n${error.stack ?? error.message}`),
      });
    });

    child.on("close", (exitCode) => {
      resolveResult({
        ...item,
        status: exitCode === 0 ? "pass" : "needs-investigation",
        exitCode,
        durationMs: Date.now() - started,
        stdout: trimOutput(stdout),
        stderr: trimOutput(stderr),
      });
    });
  });
}

function markdownReport(report) {
  const rows = report.results
    .map((result) => `| ${result.id} | ${result.surface} | ${result.status} | ${result.exitCode ?? "n/a"} | ${(result.durationMs / 1000).toFixed(1)}s |`)
    .join("\n");

  const failures = report.results
    .filter((result) => result.status !== "pass")
    .map((result) => [
      `### ${result.id}`,
      "",
      `Command: \`${[result.command, ...result.args].join(" ")}\``,
      `Working directory: \`${result.cwd}\``,
      `Status: \`${result.status}\``,
      `Exit code: \`${result.exitCode ?? "n/a"}\``,
      "",
      "```text",
      result.stderr || result.stdout || "No output captured.",
      "```",
    ].join("\n"))
    .join("\n\n");

  return [
    "# XMLUI Compatibility Sweep",
    "",
    `Started: ${report.startedAt}`,
    `Finished: ${report.finishedAt}`,
    `Duration: ${(report.durationMs / 1000).toFixed(1)}s`,
    `Status: ${report.status}`,
    "",
    "| Check | Surface | Status | Exit | Duration |",
    "| --- | --- | --- | --- | --- |",
    rows,
    "",
    "## Failed or Investigate",
    "",
    failures || "No failures.",
    "",
  ].join("\n");
}

await mkdir(reportDir, { recursive: true });

const results = [];
for (const command of commands) {
  console.log(`\n[compatibility:sweep] ${command.id}`);
  results.push(await runCommand(command));
}

const finishedAt = new Date();
const report = {
  schemaVersion: 1,
  startedAt: startedAt.toISOString(),
  finishedAt: finishedAt.toISOString(),
  durationMs: finishedAt.getTime() - startedAt.getTime(),
  status: results.every((result) => result.status === "pass") ? "pass" : "needs-investigation",
  originalBaseline: "/Users/dotneteer/source/xmlui",
  rewriteBaseline: repoRoot,
  results,
};

const jsonPath = resolve(reportDir, "compatibility-sweep-latest.json");
const markdownPath = resolve(reportDir, "compatibility-sweep-latest.md");
await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(markdownPath, markdownReport(report));

console.log(`\n[compatibility:sweep] wrote ${jsonPath}`);
console.log(`[compatibility:sweep] wrote ${markdownPath}`);

if (report.status !== "pass") {
  process.exitCode = 1;
}
