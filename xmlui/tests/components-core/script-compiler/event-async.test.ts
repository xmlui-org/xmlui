import { describe, expect, it } from "vitest";

import {
  compileEventAsyncStatementSource,
  compileEventAsyncStatements,
  executeCompiledEventAsyncArtifact,
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
    expect(artifact.js).toContain('runtime.unsupported("event-async"');
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

  it("throws a structured unsupported error when executed", async () => {
    const artifact = compileEventAsyncStatementSource("count = count + 1;", "Main.xmlui#event-3");

    await expect(
      executeCompiledEventAsyncArtifact(artifact, {
        localContext: { count: 1 },
        options: { compileEventHandlers: true },
      } as any),
    ).rejects.toThrow(UnsupportedCompiledScriptNodeError);
  });
});
