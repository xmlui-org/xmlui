/**
 * @vitest-environment jsdom
 *
 * Tests for the runtime echo / dedup / report helpers
 * (plan #12 Phase 1 §1.2 + Phase 4 §4.1).
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  _resetVersioningDedup,
  collectVersioningReport,
  emitVersioningDiagnostics,
  formatMigrationPlan,
} from "../../../src/components-core/versioning/runtime";

beforeEach(() => {
  _resetVersioningDedup();
  // Re-initialise the trace buffer the way AppContent does in xsVerbose mode.
  if (typeof window !== "undefined") {
    (window as any)._xsLogs = [];
  }
});

describe("emitVersioningDiagnostics", () => {
  it("pushes one entry per diagnostic on first emit", () => {
    const count = emitVersioningDiagnostics([
      {
        code: "deprecated-component",
        severity: "warn",
        componentName: "Old",
        message: "old.",
      },
    ]);
    expect(count).toBe(1);
    expect((window as any)._xsLogs).toHaveLength(1);
    expect((window as any)._xsLogs[0].kind).toBe("versioning");
  });

  it("deduplicates by (componentName, propName, code) per session", () => {
    const diag = {
      code: "deprecated-prop" as const,
      severity: "warn" as const,
      componentName: "Button",
      propName: "text",
      message: "deprecated",
    };
    expect(emitVersioningDiagnostics([diag])).toBe(1);
    expect(emitVersioningDiagnostics([diag, diag])).toBe(0);
    expect((window as any)._xsLogs).toHaveLength(1);
  });

  it("does not dedupe across different codes", () => {
    emitVersioningDiagnostics([
      {
        code: "deprecated-prop",
        severity: "warn",
        componentName: "Button",
        propName: "text",
        message: "a",
      },
      {
        code: "removed-prop",
        severity: "warn",
        componentName: "Button",
        propName: "text",
        message: "b",
      },
    ]);
    expect((window as any)._xsLogs).toHaveLength(2);
  });
});

describe("collectVersioningReport + formatMigrationPlan", () => {
  it("groups findings by component name and counts severities", () => {
    emitVersioningDiagnostics([
      {
        code: "deprecated-component",
        severity: "warn",
        componentName: "Old",
        message: "Old is deprecated.",
      },
      {
        code: "deprecated-prop",
        severity: "warn",
        componentName: "Button",
        propName: "text",
        message: "Use label.",
      },
      {
        code: "experimental-use",
        severity: "info",
        componentName: "Beta",
        message: "Experimental.",
      },
    ]);
    const r = collectVersioningReport();
    expect(r.totals.all).toBe(3);
    expect(r.totals.warn).toBe(2);
    expect(r.totals.info).toBe(1);
    expect(Object.keys(r.byComponent).sort()).toEqual(["Beta", "Button", "Old"]);
    expect(r.byComponent.Button[0].propName).toBe("text");
  });

  it("formatMigrationPlan emits a markdown checklist", () => {
    emitVersioningDiagnostics([
      {
        code: "deprecated-prop",
        severity: "warn",
        componentName: "Button",
        propName: "text",
        message: "Use label.",
      },
    ]);
    const md = formatMigrationPlan(collectVersioningReport());
    expect(md).toContain("# Versioning migration plan");
    expect(md).toContain("## Button");
    expect(md).toMatch(/- \[ \] \[warn\/deprecated-prop\]/);
    expect(md).toContain("prop `text`");
  });
});
