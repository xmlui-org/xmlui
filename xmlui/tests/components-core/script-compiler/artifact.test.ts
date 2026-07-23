import { describe, expect, it } from "vitest";

import { createEvalContext } from "../../../src/components-core/script-runner/BindingTreeEvaluationContext";
import {
  createCompiledScriptArtifact,
  createCompiledScriptFunctionBody,
  createCompiledScriptMapping,
  deserializeCompiledScriptArtifact,
  instantiateCompiledScriptArtifact,
  serializeCompiledScriptArtifact,
  sourceRangeFromNode,
  throwUnsupportedCompiledScriptNode,
  UnsupportedCompiledScriptNodeError,
} from "../../../src/components-core/script-compiler";

describe("compiled script artifacts", () => {
  it("derives source ranges from scripting tokens", () => {
    const range = sourceRangeFromNode({
      startToken: {
        text: "count",
        type: "Identifier" as any,
        startPosition: 4,
        endPosition: 8,
        startLine: 2,
        endLine: 2,
        startColumn: 5,
        endColumn: 9,
      },
      endToken: {
        text: "1",
        type: "DecimalLiteral" as any,
        startPosition: 11,
        endPosition: 12,
        startLine: 2,
        endLine: 2,
        startColumn: 12,
        endColumn: 13,
      },
    });

    expect(range).toEqual({
      start: 4,
      end: 12,
      startLine: 2,
      startColumn: 5,
      endLine: 2,
      endColumn: 13,
    });
  });

  it("keeps artifacts serializable and instantiates native functions separately", () => {
    const artifact = createCompiledScriptArtifact({
      target: "binding-sync",
      sourceId: "Main.xmlui#expr-1",
      sourceText: "{count + 1}",
      astNodeId: 42,
      dependencies: ["count"],
      js: "return runtime.resolve('count') + 1;",
      mappings: [
        createCompiledScriptMapping(7, 12, "Main.xmlui", {
          start: 1,
          end: 10,
          startLine: 1,
          startColumn: 2,
          endLine: 1,
          endColumn: 11,
        }),
      ],
    });

    const serialized = serializeCompiledScriptArtifact(artifact);
    expect(serialized).not.toContain("nativeFn");

    const deserialized = deserializeCompiledScriptArtifact(serialized);
    const instance = instantiateCompiledScriptArtifact<number>(deserialized, {
      resolve: (name: string) => ({ count: 2 })[name],
    });

    expect(instance.execute({ evalContext: createEvalContext({}) })).toBe(3);
    expect(deserialized.mappings[0]).toMatchObject({
      sourceId: "Main.xmlui",
      sourceRange: { start: 1, end: 10 },
    });
    expect(JSON.parse(serializeCompiledScriptArtifact(instance.artifact))).not.toHaveProperty(
      "nativeFn",
    );
  });

  it("adds inline source map comments for runtime fallback debugging", () => {
    const artifact = createCompiledScriptArtifact({
      target: "binding-sync",
      sourceId: "/src/Main.xmlui#expr-1",
      sourceUrl: "/@xmlui-source/src/Main.xmlui",
      sourceText: "count + 1",
      js: "return 3;",
      mappings: [
        createCompiledScriptMapping(7, 8, "/src/Main.xmlui#expr-1", {
          start: 10,
          end: 15,
          startLine: 2,
          startColumn: 4,
          endLine: 2,
          endColumn: 9,
        }),
      ],
      sources: [
        {
          id: "/src/Main.xmlui#expr-1",
          url: "/@xmlui-source/src/Main.xmlui",
          sourceText: '<Text value="{count + 1}" />',
        },
      ],
    });

    const body = createCompiledScriptFunctionBody(artifact, { sourceMapMode: "inline" });

    expect(body).toContain(
      "//# sourceURL=/@xmlui-source/__compiled/%2Fsrc%2FMain.xmlui%23expr-1.js",
    );
    expect(body).toContain("//# sourceMappingURL=data:application/json;charset=utf-8;base64,");
  });

  it("prefers external source map URLs when requested", () => {
    const artifact = createCompiledScriptArtifact({
      target: "event-async",
      sourceId: "/src/Main.xmlui#event-1",
      sourceUrl: "/@xmlui-source/src/Main.xmlui",
      js: "return undefined;",
    });

    const body = createCompiledScriptFunctionBody(artifact, {
      sourceMapMode: "external",
      sourceMapUrl: "/@xmlui-source/src/Main.xmlui.map",
    });

    expect(body).toContain(
      "//# sourceURL=/@xmlui-source/__compiled/%2Fsrc%2FMain.xmlui%23event-1.js",
    );
    expect(body).toContain("//# sourceMappingURL=/@xmlui-source/src/Main.xmlui.map");
    expect(body).not.toContain("base64");
  });

  it("throws a structured error for unsupported nodes", () => {
    expect(() =>
      throwUnsupportedCompiledScriptNode(
        {
          type: "NewExpression" as any,
          startToken: {
            text: "new",
            type: "New" as any,
            startPosition: 0,
            endPosition: 3,
            startLine: 1,
            endLine: 1,
            startColumn: 1,
            endColumn: 4,
          },
          endToken: {
            text: ")",
            type: "RPar" as any,
            startPosition: 10,
            endPosition: 11,
            startLine: 1,
            endLine: 1,
            startColumn: 11,
            endColumn: 12,
          },
        },
        "Main.xmlui#expr-2",
      ),
    ).toThrow(UnsupportedCompiledScriptNodeError);
  });
});
