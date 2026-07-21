import { describe, expect, it } from "vitest";

import { createEvalContext } from "../../../src/components-core/script-runner/BindingTreeEvaluationContext";
import {
  createCompiledScriptArtifact,
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

