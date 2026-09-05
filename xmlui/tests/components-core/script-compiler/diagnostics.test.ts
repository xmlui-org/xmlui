import { describe, expect, it, vi } from "vitest";

import {
  createCompileDiagnostic,
  describeCompileDiagnostic,
  formatCompileDiagnostic,
  reportCompileDiagnostic,
  UnsupportedCompiledScriptNodeError,
} from "../../../src/components-core/script-compiler";
import {
  T_AWAIT_EXPRESSION,
  T_LITERAL,
} from "../../../src/parsers/scripting/ScriptingNodeTypes";

const SOURCE_RANGE = { start: 40, end: 52, startLine: 4, startColumn: 11 };

function unsupported(nodeType: number, sourceId = "/src/Globals.xs#function-roleHint") {
  return new UnsupportedCompiledScriptNodeError(String(nodeType), sourceId, SOURCE_RANGE);
}

describe("compile diagnostics", () => {
  it("codes an unsupported construct", () => {
    const diagnostic = createCompileDiagnostic(unsupported(T_AWAIT_EXPRESSION), {
      sourceId: "ignored-when-the-error-knows",
    });

    expect(diagnostic).toMatchObject({
      code: "compile-unsupported-node",
      severity: "warn",
      sourceId: "/src/Globals.xs#function-roleHint",
      construct: "await expression",
      line: 4,
      // --- Source ranges are 0-based; diagnostics quote columns the way an editor does.
      column: 12,
    });
  });

  it("codes a literal the interpreted path cannot carry", () => {
    expect(createCompileDiagnostic(unsupported(T_LITERAL), { sourceId: "x" }).code).toBe(
      "compile-unserializable-literal",
    );
  });

  it("codes a fallback that happened while running", () => {
    expect(
      createCompileDiagnostic(unsupported(T_AWAIT_EXPRESSION), {
        sourceId: "x",
        phase: "runtime",
      }).code,
    ).toBe("compile-runtime-fallback");
  });

  it("codes any other compilation failure", () => {
    const diagnostic = createCompileDiagnostic(new Error("source vanished"), {
      sourceId: "/src/Main.xmlui#event-2",
    });

    expect(diagnostic).toMatchObject({
      code: "compile-source-unavailable",
      sourceId: "/src/Main.xmlui#event-2",
      detail: "source vanished",
    });
  });

  it("formats the reported form with code, source, construct, and position", () => {
    const formatted = formatCompileDiagnostic(
      createCompileDiagnostic(unsupported(T_AWAIT_EXPRESSION), { sourceId: "x" }),
    );

    expect(formatted).toContain("compile-unsupported-node: /src/Globals.xs#function-roleHint");
    expect(formatted).toContain("await expression");
    expect(formatted).toContain("at line 4, column 12");
    expect(formatted).toContain("falling back to interpretation");
  });

  it("keeps the stored reason compact and code-led", () => {
    const reason = describeCompileDiagnostic(
      createCompileDiagnostic(unsupported(T_AWAIT_EXPRESSION), { sourceId: "x" }),
    );

    expect(reason.startsWith("compile-unsupported-node: ")).toBe(true);
    expect(reason).not.toContain("\n");
  });

  it("omits the position when the error carries none", () => {
    const diagnostic = createCompileDiagnostic(
      new UnsupportedCompiledScriptNodeError(String(T_AWAIT_EXPRESSION), "x"),
      { sourceId: "x" },
    );

    expect(diagnostic.line).toBeUndefined();
    expect(formatCompileDiagnostic(diagnostic)).not.toContain("at line");
  });
});

describe("runtime reporting", () => {
  const diagnostic = createCompileDiagnostic(unsupported(T_AWAIT_EXPRESSION), { sourceId: "x" });

  it("stays off the console unless reporting is asked for", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      reportCompileDiagnostic(diagnostic);
      expect(warn).not.toHaveBeenCalled();

      reportCompileDiagnostic(diagnostic, { report: true });
      expect(warn).toHaveBeenCalledTimes(1);
      expect(String(warn.mock.calls[0][0])).toContain("compile-unsupported-node");
    } finally {
      warn.mockRestore();
    }
  });

  it("records the diagnostic on the Inspector trace either way", () => {
    const globalWithWindow = globalThis as any;
    const hadWindow = typeof globalWithWindow.window !== "undefined";
    globalWithWindow.window ??= {};
    globalWithWindow.window._xsLogs = [];
    try {
      reportCompileDiagnostic(diagnostic);

      const compileEntries = globalWithWindow.window._xsLogs.filter(
        (entry: any) => entry.kind === "compile",
      );
      expect(compileEntries).toHaveLength(1);
      expect(compileEntries[0]).toMatchObject({
        kind: "compile",
        code: "compile-unsupported-node",
        severity: "warn",
        construct: "await expression",
      });
    } finally {
      if (hadWindow) {
        delete globalWithWindow.window._xsLogs;
      } else {
        delete globalWithWindow.window;
      }
    }
  });
});
