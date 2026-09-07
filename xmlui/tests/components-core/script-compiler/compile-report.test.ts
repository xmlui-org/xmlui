import { describe, expect, it } from "vitest";

import { createCompileDiagnostic } from "../../../src/components-core/script-compiler/diagnostics";
import {
  formatCompileReport,
  formatStrictViolationReport,
} from "../../../src/components-core/script-compiler/compile-report";
import { fixHintForNodeType } from "../../../src/components-core/script-compiler/fix-hints";
import { compileEventAsyncStatementSource } from "../../../src/components-core/script-compiler";
import { compileBindingSyncExpressionSource } from "../../../src/components-core/script-compiler/targets/binding-sync";
import * as T from "../../../src/parsers/scripting/ScriptingNodeTypes";

/**
 * Phase 2.2 of `.plan/strict-compilation-mode.md`.
 *
 * The compact diagnostic identifies the block but not the code, the cure, or the owner —
 * and `#event-690` is an internal counter, so on a large file it narrows nothing. These
 * pin the three things that were missing.
 */
function diagnosticFor(compile: () => unknown, sourceId: string) {
  try {
    compile();
    throw new Error("expected the compiler to refuse this");
  } catch (error) {
    return createCompileDiagnostic(error, { sourceId });
  }
}

const HANDLER_SOURCE = ["const id = $props.id;", "const rows = await load(id);", "return rows;"].join(
  "\n",
);

describe("the report shows the source, not just a position", () => {
  const diagnostic = diagnosticFor(
    () => compileEventAsyncStatementSource(HANDLER_SOURCE, "/src/List.xmlui#event-690"),
    "/src/List.xmlui#event-690",
  );
  const report = formatCompileReport(diagnostic, {
    sourceText: HANDLER_SOURCE,
    fileName: "/src/List.xmlui",
    owner: "Button onClick",
    strict: true,
  });

  it("quotes the offending line with a caret under the construct", () => {
    expect(report).toContain("2 | const rows = await load(id);");
    // --- The caret sits under `await`, not at the start of the line. Compared against
    // --- the rendered snippet line so the gutter width is accounted for by construction.
    const lines = report.split("\n");
    const snippetLine = lines.find((line) => line.includes("const rows = await"))!;
    const caretLine = lines.find((line) => line.includes("^"))!;
    expect(caretLine.indexOf("^")).toBe(snippetLine.indexOf("await"));
    expect(caretLine).toContain("await expression");
  });

  it("names the owner and the file, not only the internal source id", () => {
    expect(report).toContain("/src/List.xmlui:2:14");
    expect(report).toContain("Button onClick");
    expect(report).toContain("source id: /src/List.xmlui#event-690");
  });

  it("says what to write instead", () => {
    expect(report).toContain("XMLUI awaits");
    expect(report).toContain("Remove the keyword");
  });

  it("names the switch that made this an error and how to relax it", () => {
    expect(report).toContain("compile-unsupported-node");
    expect(report).toContain('"strictCompilation" is on');
    expect(report).toContain('Set "strictCompilation": false');
  });

  it("does not threaten a build when strict mode is off", () => {
    const lenient = formatCompileReport(diagnostic, { sourceText: HANDLER_SOURCE });
    expect(lenient).toContain("will run interpreted");
    expect(lenient).not.toContain("strictCompilation");
  });

  it("wraps to a readable width", () => {
    for (const line of report.split("\n")) {
      expect(line.length).toBeLessThanOrEqual(95);
    }
  });
});

describe("a caret is omitted rather than guessed", () => {
  it("renders without a snippet when the source text is unavailable", () => {
    const diagnostic = diagnosticFor(
      () => compileEventAsyncStatementSource(HANDLER_SOURCE, "x#event-1"),
      "x#event-1",
    );
    const report = formatCompileReport(diagnostic, { owner: "Button onClick", strict: true });
    expect(report).not.toContain("^");
    expect(report).toContain("await expression is not supported");
  });
});

describe("a violation with no compiler error behind it reads differently", () => {
  const report = formatStrictViolationReport(
    {
      door: "statement-sync",
      sourceText: "return $item.status === 'done';",
      sourceRange: { startLine: 12, startColumn: 4 } as any,
    },
    { fileName: "/src/List.xmlui", owner: "Table rowDisabledPredicate", strict: true },
  );

  it("says the code was never compiled, rather than blaming a construct", () => {
    // --- The distinction that matters: "fix your code" and "this call site never asked"
    // --- have different fixes and different owners.
    expect(report).toContain("ran interpreted");
    expect(report).toContain("No construct was refused here");
    expect(report).toContain("never handed to the compiler");
  });

  it("names the door, so the reason is actionable", () => {
    expect(report).toContain("synchronous interpreter, which has no compiled target");
  });

  it("still locates and attributes it", () => {
    expect(report).toContain("/src/List.xmlui:12:5");
    expect(report).toContain("Table rowDisabledPredicate");
  });
});

describe("fix hints", () => {
  it("cover the constructs an app is most likely to hit", () => {
    for (const nodeType of [
      T.T_AWAIT_EXPRESSION,
      T.T_ARROW_EXPRESSION,
      T.T_DESTRUCTURE,
      T.T_SPREAD_EXPRESSION,
    ]) {
      expect(fixHintForNodeType(nodeType)).toBeTruthy();
    }
  });

  it("say nothing rather than something useless", () => {
    // --- A filler hint is worse than none: it costs a reader attention and returns
    // --- nothing. Node types without a concrete answer are deliberately absent.
    expect(fixHintForNodeType(T.T_BINARY_EXPRESSION)).toBeUndefined();
    expect(fixHintForNodeType(undefined)).toBeUndefined();
  });

  it("reach the diagnostic, so every consumer gets them", () => {
    // --- A destructured *named function* parameter, which both targets still refuse.
    // --- This case used to be `rows.map(({ id }) => id)`; Phase 3.2 taught binding-sync
    // --- destructured arrow parameters, so that one compiles now.
    const diagnostic = diagnosticFor(
      () => compileEventAsyncStatementSource("function pick({ a }) { return a; } return pick(o);", "y#fn"),
      "y#fn",
    );
    expect(diagnostic.fix).toContain("read its fields in the body");
  });
});
