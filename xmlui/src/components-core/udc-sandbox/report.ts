/**
 * UDC Sandbox — runtime report aggregator (plan #14 Step 4.2 data layer).
 *
 * Aggregates `kind:"udc"` entries from the live `pushXsLog` buffer so the
 * Inspector "UDC permissions" panel (and CI tooling) can render a
 * per-UDC summary of declared capabilities, trust posture, and any
 * sandbox violations observed during the session.
 *
 * Mirrors the pattern used by `collectVersioningReport()` in plan #12
 * so devtools panels can consume both with a uniform shape.
 */

import type { UdcDiagCode } from "./diagnostics";

export interface UdcFinding {
  code: UdcDiagCode | string;
  severity: "error" | "warn" | "info";
  udc: string;
  trust?: "trusted" | "untrusted";
  message: string;
  /** Extra structured context (capabilities, identifier, etc.). */
  data?: unknown;
  ts?: number;
}

export interface UdcReport {
  /** Findings grouped by UDC name (declared `<Component name="...">`). */
  byUdc: Record<string, UdcFinding[]>;
  /** All findings in trace order. */
  findings: UdcFinding[];
  /** Severity totals across the whole session. */
  totals: { info: number; warn: number; error: number; all: number };
  /** Distinct codes observed, sorted alphabetically. */
  codes: string[];
}

/**
 * Aggregates `kind:"udc"` entries from the live inspector trace buffer.
 *
 * Safe to call from any environment.  Returns an empty report when
 * `window._xsLogs` is not present (server-side rendering, tests without
 * a JSDOM, etc.).
 */
export function collectUdcReport(): UdcReport {
  const report: UdcReport = {
    byUdc: {},
    findings: [],
    totals: { info: 0, warn: 0, error: 0, all: 0 },
    codes: [],
  };
  if (typeof window === "undefined") return report;
  const buf = (window as unknown as { _xsLogs?: unknown[] })._xsLogs;
  if (!Array.isArray(buf)) return report;

  const codes = new Set<string>();
  for (const raw of buf) {
    if (!raw || typeof raw !== "object") continue;
    const entry = raw as Record<string, unknown>;
    if (entry.kind !== "udc") continue;

    const udc = typeof entry.udc === "string" ? entry.udc : "(unknown)";
    const severity = (entry.severity as UdcFinding["severity"]) ?? "info";
    const finding: UdcFinding = {
      code: String(entry.code ?? "udc-unknown"),
      severity,
      udc,
      trust: entry.trust as UdcFinding["trust"],
      message: typeof entry.message === "string" ? entry.message : "",
      data: entry.data,
      ts: typeof entry.ts === "number" ? entry.ts : undefined,
    };
    report.findings.push(finding);
    (report.byUdc[udc] ??= []).push(finding);
    codes.add(finding.code);
    report.totals.all++;
    if (severity === "error") report.totals.error++;
    else if (severity === "warn") report.totals.warn++;
    else report.totals.info++;
  }
  report.codes = Array.from(codes).sort();
  return report;
}

/**
 * Render the report as a Markdown audit summary suitable for pasting into
 * a CI log or issue tracker.  Empty reports render as a single line.
 */
export function formatUdcAuditReport(report: UdcReport): string {
  if (report.totals.all === 0) {
    return "UDC sandbox audit: no violations recorded.";
  }
  const lines: string[] = [];
  lines.push("# UDC sandbox audit");
  lines.push("");
  lines.push(
    `Total: ${report.totals.all} ` +
      `(error: ${report.totals.error}, warn: ${report.totals.warn}, info: ${report.totals.info})`,
  );
  lines.push("");
  const names = Object.keys(report.byUdc).sort();
  for (const name of names) {
    const items = report.byUdc[name];
    const trust = items.find((f) => f.trust)?.trust ?? "trusted";
    lines.push(`## ${name} (${items.length}) — trust: ${trust}`);
    lines.push("");
    for (const f of items) {
      lines.push(`- **${f.severity}** \`${f.code}\` — ${f.message}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
