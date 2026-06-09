/**
 * `xmlui check` command implementation — Plan #13 Phase 5.
 *
 * Walks a directory for `.xmlui` files and runs the full language-server
 * diagnostic suite — the same set of checks the VS Code extension surfaces in
 * the editor:
 *   - parser errors
 *   - the static build analyzer
 *   - reactive-cycle detection
 *   - type-contract verification (unknown/deprecated props, wrong types,
 *     enum violations, missing-required, unknown events/methods)
 *   - accessibility linting
 *   - versioning (deprecated/removed/experimental/internal usage)
 *
 * Findings are emitted in GNU or JSON format.
 */
import * as path from "path";
import * as fs from "fs";
import { DiagnosticSeverity, type Diagnostic } from "vscode-languageserver";
import { Project } from "../../language-server/base/project";
import {
  MetadataProvider,
  type ComponentMetadataCollection,
} from "../../language-server/services/common/metadata-utils";
import collectedComponentMetadata from "../../language-server/xmlui-metadata-generated.js";
import { getDiagnostics } from "../../language-server/services/diagnostic";

export interface CheckOptions {
  dir: string;
  format: "gnu" | "json";
  strict: boolean;
  includeRules: string[];
  excludeRules: string[];
}

type CliSeverity = "error" | "warn" | "info";

interface CliDiagnostic {
  file: string;
  /** 1-based line number. */
  line: number;
  /** 1-based column number. */
  column: number;
  severity: CliSeverity;
  message: string;
  code?: string;
  source?: string;
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

function lspSeverityToCli(severity: DiagnosticSeverity | undefined): CliSeverity {
  switch (severity) {
    case DiagnosticSeverity.Error:
      return "error";
    case DiagnosticSeverity.Warning:
      return "warn";
    default:
      // Information / Hint / undefined
      return "info";
  }
}

function codeToString(code: Diagnostic["code"]): string | undefined {
  if (code === undefined || code === null) return undefined;
  return String(code);
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

  // Key documents by their path relative to the scanned directory so that
  // output locations are stable and readable.
  const contentByUri: Record<string, string> = {};
  for (const f of files) {
    contentByUri[path.relative(absTarget, f)] = fs.readFileSync(f, "utf-8");
  }

  const metadataProvider = new MetadataProvider(
    collectedComponentMetadata as ComponentMetadataCollection,
  );

  let project: Project;
  try {
    project = Project.fromFileContets(contentByUri, metadataProvider);
  } catch (err) {
    process.stderr.write(`xmlui check: failed to build project: ${err}\n`);
    process.exit(2);
    return; // satisfy TypeScript
  }

  let diagnostics: CliDiagnostic[] = [];
  for (const uri of Object.keys(contentByUri)) {
    let lspDiags: Diagnostic[];
    try {
      lspDiags = getDiagnostics(project, uri);
    } catch (err) {
      process.stderr.write(`xmlui check: analyzer error in ${uri}: ${err}\n`);
      continue;
    }
    for (const d of lspDiags) {
      diagnostics.push({
        file: uri,
        line: (d.range?.start?.line ?? 0) + 1,
        column: (d.range?.start?.character ?? 0) + 1,
        severity: lspSeverityToCli(d.severity),
        message: d.message,
        code: codeToString(d.code),
        source: d.source,
      });
    }
  }

  // In strict mode, warn-severity findings are treated as errors.
  if (opts.strict) {
    diagnostics = diagnostics.map((d) =>
      d.severity === "warn" ? { ...d, severity: "error" } : d,
    );
  }

  if (opts.includeRules.length > 0) {
    diagnostics = diagnostics.filter(
      (d) => d.code !== undefined && opts.includeRules.includes(d.code),
    );
  }
  if (opts.excludeRules.length > 0) {
    diagnostics = diagnostics.filter(
      (d) => d.code === undefined || !opts.excludeRules.includes(d.code),
    );
  }

  // Deterministic ordering: file, then line, then column.
  diagnostics.sort(
    (a, b) =>
      a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column,
  );

  if (opts.format === "json") {
    process.stdout.write(JSON.stringify(diagnostics, null, 2) + "\n");
  } else {
    for (const d of diagnostics) {
      const loc = `${d.file}:${d.line}:${d.column}`;
      const sev =
        d.severity === "error" ? "error" : d.severity === "warn" ? "warning" : "note";
      const code = d.code ? ` [${d.code}]` : "";
      process.stdout.write(`${loc}: ${sev}: ${d.message}${code}\n`);
    }
  }

  const hasErrors = diagnostics.some((d) => d.severity === "error");
  if (hasErrors) process.exit(1);
}
