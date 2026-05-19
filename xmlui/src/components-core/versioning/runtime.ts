/**
 * Runtime echo for versioning diagnostics.
 *
 * `emitVersioningDiagnostics()` forwards a batch of `VersioningDiagnostic`
 * entries to the Inspector trace buffer as `kind: "versioning"` log
 * entries. A per-session dedup set ensures the same `(componentName,
 * propName, code)` tuple emits at most once per page session — hot loops
 * (e.g. `Map`-typed children) do not flood the trace.
 *
 * The Inspector "Versioning" tab (plan #12 Step 4.1) reads these entries
 * directly from `window._xsLogs`.
 */

import { pushXsLog } from "../inspector/inspectorUtils";
import type { VersioningDiagnostic } from "./diagnostics";

const SESSION_DEDUP = new Set<string>();

/** Test-only: clears the session dedup cache. */
export function _resetVersioningDedup(): void {
  SESSION_DEDUP.clear();
}

export function emitVersioningDiagnostics(diagnostics: readonly VersioningDiagnostic[]): number {
  let emitted = 0;
  for (const d of diagnostics) {
    const key = `${d.componentName ?? "?"}|${d.propName ?? d.eventName ?? d.methodName ?? "*"}|${d.code}`;
    if (SESSION_DEDUP.has(key)) continue;
    SESSION_DEDUP.add(key);
    pushXsLog({
      ts: Date.now(),
      kind: "versioning",
      code: d.code,
      severity: d.severity,
      componentName: d.componentName,
      propName: d.propName,
      eventName: d.eventName,
      methodName: d.methodName,
      deprecatedSince: d.deprecatedSince,
      removedIn: d.removedIn,
      replacement: d.replacement,
      message: d.message,
    });
    emitted++;
  }
  return emitted;
}

/**
 * Aggregates `kind:"versioning"` entries from the live trace buffer,
 * grouped by component name. Powers the Inspector "Versioning" tab
 * (plan #12 Step 4.1) and the "Copy migration plan" button.
 */
export interface VersioningFinding {
  code: string;
  severity: string;
  componentName?: string;
  propName?: string;
  eventName?: string;
  methodName?: string;
  message: string;
  deprecatedSince?: string;
  removedIn?: string;
  replacement?: string;
}

export interface VersioningReport {
  byComponent: Record<string, VersioningFinding[]>;
  totals: { info: number; warn: number; error: number; all: number };
}

export function collectVersioningReport(): VersioningReport {
  const report: VersioningReport = {
    byComponent: {},
    totals: { info: 0, warn: 0, error: 0, all: 0 },
  };
  if (typeof window === "undefined") return report;
  const buf = (window as any)._xsLogs;
  if (!Array.isArray(buf)) return report;
  for (const entry of buf) {
    if (!entry || entry.kind !== "versioning") continue;
    const key = entry.componentName ?? "(unknown)";
    const list = (report.byComponent[key] ??= []);
    list.push({
      code: entry.code,
      severity: entry.severity,
      componentName: entry.componentName,
      propName: entry.propName,
      eventName: entry.eventName,
      methodName: entry.methodName,
      message: entry.message,
      deprecatedSince: entry.deprecatedSince,
      removedIn: entry.removedIn,
      replacement: entry.replacement,
    });
    report.totals.all++;
    if (entry.severity === "info") report.totals.info++;
    else if (entry.severity === "warn") report.totals.warn++;
    else if (entry.severity === "error") report.totals.error++;
  }
  return report;
}

/**
 * Render the report as a Markdown migration plan suitable for
 * pasting into an issue tracker.
 */
export function formatMigrationPlan(report: VersioningReport): string {
  const lines: string[] = [];
  lines.push(`# Versioning migration plan`);
  lines.push("");
  lines.push(
    `Total: ${report.totals.all} ` +
      `(error: ${report.totals.error}, warn: ${report.totals.warn}, info: ${report.totals.info})`,
  );
  lines.push("");
  const names = Object.keys(report.byComponent).sort();
  for (const name of names) {
    const items = report.byComponent[name];
    lines.push(`## ${name} (${items.length})`);
    for (const it of items) {
      const target =
        it.propName != null
          ? `prop \`${it.propName}\``
          : it.eventName != null
            ? `event \`${it.eventName}\``
            : it.methodName != null
              ? `method \`${it.methodName}\``
              : "";
      const tag = `[${it.severity}/${it.code}]`;
      lines.push(`- [ ] ${tag} ${target ? target + " — " : ""}${it.message}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
