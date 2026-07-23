import { describe, expect, it } from "vitest";

import {
  compileEventAsyncStatementSource,
  compileEventAsyncStatements,
  executeCompiledEventAsyncArtifact,
  executeCompiledEventAsyncHandler,
  serializeCompiledScriptArtifact,
  UnsupportedCompiledScriptNodeError,
} from "../../../src/components-core/script-compiler";
import { Parser } from "../../../src/parsers/scripting/Parser";

describe("event-async compiled script target", () => {
  it("creates a serializable event-async artifact from statements", () => {
    const artifact = compileEventAsyncStatementSource("count = count + 1;", "Main.xmlui#event-1");

    expect(artifact).toMatchObject({
      target: "event-async",
      sourceId: "Main.xmlui#event-1",
      sourceText: "count = count + 1;",
      dependencies: [],
      diagnostics: [],
    });
    expect(artifact.js).toContain("return (async () =>");
    expect(serializeCompiledScriptArtifact(artifact)).not.toContain("nativeFn");
  });

  it("preserves source range and mapping information", () => {
    const parser = new Parser("count = count + 1;");
    const statements = parser.parseStatements();
    const artifact = compileEventAsyncStatements(statements, {
      sourceId: "Main.xmlui#event-2",
      sourceText: "count = count + 1;",
    });

    expect(artifact.sourceRange).toMatchObject({
      start: 0,
      end: 17,
      startLine: 1,
      endLine: 1,
    });
    expect(artifact.mappings[0]).toMatchObject({
      sourceId: "Main.xmlui#event-2",
      sourceRange: { start: 0, end: 17 },
    });
  });

  it("executes the supported statement subset", async () => {
    const artifact = compileEventAsyncStatementSource("count = count + 1;", "Main.xmlui#event-3");
    const evalContext = {
      localContext: { count: 1 },
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
    } as any;

    await executeCompiledEventAsyncArtifact(artifact, evalContext);

    expect(evalContext.localContext.count).toBe(2);
  });

  it("skips yield checks for simple expression statements", () => {
    const artifact = compileEventAsyncStatementSource("value + 1;", "Main.xmlui#event-simple-expr");

    expect(artifact.js).toContain(
      "runtime.afterStatement(evalContext, undefined, { checkYield: false })",
    );
  });

  it("keeps yield checks for expression statements with calls", () => {
    const artifact = compileEventAsyncStatementSource("getValue();", "Main.xmlui#event-call-expr");

    expect(artifact.js).toContain("runtime.afterStatement(evalContext);");
    expect(artifact.js).not.toContain(
      "runtime.afterStatement(evalContext, undefined, { checkYield: false })",
    );
  });

  it("keeps yield checks for bare event handler references", () => {
    const artifact = compileEventAsyncStatementSource("selectItem", "Main.xmlui#event-bare-ref");

    expect(artifact.js).toContain("runtime.afterStatement(evalContext);");
    expect(artifact.js).not.toContain(
      "runtime.afterStatement(evalContext, undefined, { checkYield: false })",
    );
  });

  it("skips yield checks for simple declarations but keeps them for call initializers", () => {
    const simpleArtifact = compileEventAsyncStatementSource(
      "let value = count + 1;",
      "Main.xmlui#event-simple-decl",
    );
    const callArtifact = compileEventAsyncStatementSource(
      "let value = getValue();",
      "Main.xmlui#event-call-decl",
    );

    expect(simpleArtifact.js).toContain(
      "runtime.afterStatement(evalContext, undefined, { checkYield: false })",
    );
    expect(callArtifact.js).toContain("runtime.afterStatement(evalContext);");
    expect(callArtifact.js).not.toContain(
      "runtime.afterStatement(evalContext, undefined, { checkYield: false })",
    );
  });

  it("throws a structured unsupported error for unsupported nodes", () => {
    expect(() =>
      compileEventAsyncStatementSource("count = enabled ? 1 : 2;", "Main.xmlui#event-4"),
    ).toThrow(UnsupportedCompiledScriptNodeError);
  });

  it("throws a structured unsupported error for non-serializable literals", () => {
    expect(() =>
      compileEventAsyncStatementSource(
        "(value) => { if (/[^a-z0-9_]/.test(value)) return 'Invalid'; return null; }",
        "Main.xmlui#event-regexp",
      ),
    ).toThrow(UnsupportedCompiledScriptNodeError);
  });

  it("prefers a parse-time artifact over runtime AST compilation", async () => {
    const artifact = compileEventAsyncStatementSource("count = count + 1;", "Main.xmlui#event-5");
    const unsupportedStatements = new Parser("count = enabled ? 1 : 2;").parseStatements();
    const evalContext = {
      localContext: { count: 1, enabled: true },
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
    } as any;

    await executeCompiledEventAsyncHandler(
      unsupportedStatements,
      evalContext,
      undefined,
      artifact,
      "Main.xmlui#event-unsupported",
      "count = enabled ? 1 : 2;",
    );

    expect(evalContext.localContext.count).toBe(2);
  });

  it("runtime-compiles and cache keys statement handlers when no artifact exists", async () => {
    const unsupportedStatements = new Parser("count = enabled ? 1 : 2;").parseStatements();
    const evalContext = {
      localContext: { count: 1, enabled: true },
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
    } as any;

    await expect(
      executeCompiledEventAsyncHandler(
        unsupportedStatements,
        evalContext,
        undefined,
        undefined,
        "Main.xmlui#event-runtime",
        "count = enabled ? 1 : 2;",
      ),
    ).rejects.toBeInstanceOf(UnsupportedCompiledScriptNodeError);
  });
});
