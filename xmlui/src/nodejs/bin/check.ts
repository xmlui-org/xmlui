/**
 * `xmlui check` command implementation — Plan #13 Phase 5.
 *
 * Walks a directory for `.xmlui` files, runs the build validator, and
 * outputs findings in GNU or JSON format.
 */
import * as path from "path";
import * as fs from "fs";
import { analyze } from "../../components-core/analyzer/walker";
import type { BuildDiagnostic } from "../../components-core/analyzer/diagnostics";

export interface CheckOptions {
  dir: string;
  format: "gnu" | "json";
  strict: boolean;
  includeRules: string[];
  excludeRules: string[];
}

function walkDir(dir: string, ext: string): string[] {
  const results: string[] = [];
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (
        entry.isDirectory() &&
        entry.name !== "node_modules" &&
        !entry.name.startsWith(".")
      ) {
        results.push(...walkDir(full, ext));
      } else if (entry.isFile() && entry.name.endsWith(ext)) {
        results.push(full);
      }
    }
  } catch {
    // Not accessible — skip
  }
  return results;
}

export async function check(opts: CheckOptions): Promise<void> {
  const absTarget = path.resolve(opts.dir);
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
    diagnostics = analyze({ files: inputFiles, strict: opts.strict });
  } catch (err) {
    process.stderr.write(`xmlui check: analyzer error: ${err}\n`);
    process.exit(2);
    return; // satisfy TypeScript
  }

  if (opts.includeRules.length > 0) {
    diagnostics = diagnostics.filter((d) => opts.includeRules.includes(d.code));
  }
  if (opts.excludeRules.length > 0) {
    diagnostics = diagnostics.filter((d) => !opts.excludeRules.includes(d.code));
  }

  if (opts.format === "json") {
    process.stdout.write(JSON.stringify(diagnostics, null, 2) + "\n");
  } else {
    for (const d of diagnostics) {
      const loc = `${d.file}:${d.line ?? 0}:${d.column ?? 0}`;
      const sev = d.severity === "error" ? "error" : d.severity === "warn" ? "warning" : "note";
      process.stdout.write(`${loc}: ${sev}: ${d.message} [${d.code}]\n`);
    }
  }

  const hasErrors = diagnostics.some((d) => d.severity === "error");
  if (hasErrors) process.exit(1);
}
