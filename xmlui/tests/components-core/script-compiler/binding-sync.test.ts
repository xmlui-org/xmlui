import { describe, expect, it } from "vitest";

import { createEvalContext } from "../../../src/components-core/script-runner/BindingTreeEvaluationContext";
import { evalBindingExpression } from "../../../src/components-core/script-runner/eval-tree-sync";
import {
  bindingSyncRuntime,
  compileBindingSyncExpressionSource,
  instantiateCompiledScriptArtifact,
  UnsupportedCompiledScriptNodeError,
} from "../../../src/components-core/script-compiler";

function evalInterpreted(source: string, localContext: any = {}) {
  return evalBindingExpression(
    source,
    createEvalContext({
      localContext,
      options: { defaultToOptionalMemberAccess: true },
    }),
  );
}

function evalCompiled(source: string, localContext: any = {}) {
  const artifact = compileBindingSyncExpressionSource(source, `test:${source}`);
  const instance = instantiateCompiledScriptArtifact(artifact, bindingSyncRuntime);
  return instance.execute({
    evalContext: createEvalContext({
      localContext,
      options: { defaultToOptionalMemberAccess: true },
    }),
  });
}

describe("binding-sync expression compiler", () => {
  it.each([
    ["literal", "123", {}, 123],
    ["identifier", "count", { count: 2 }, 2],
    ["null member access", "user.name", { user: null }, undefined],
    ["undefined calculated member access", "user[key]", { user: undefined, key: "name" }, undefined],
    ["nested member access", "user.address.city", { user: { address: { city: "London" } } }, "London"],
    ["nullish coalescing", "value ?? fallback", { value: null, fallback: "fallback" }, "fallback"],
    ["and short-circuit", "ready && user.name", { ready: false, user: null }, false],
    ["or short-circuit", "label || fallback", { label: "", fallback: "Untitled" }, "Untitled"],
    ["ternary", "ready ? user.name : fallback", { ready: true, user: { name: "Ada" }, fallback: "N/A" }, "Ada"],
    ["sequence", "(first, second + 1)", { first: 1, second: 2 }, 3],
    ["array literal", "[first, second, ...rest]", { first: 1, second: 2, rest: [3, 4] }, [1, 2, 3, 4]],
    ["object literal", "{ id: user.id, [key]: value }", { user: { id: 1 }, key: "name", value: "Ada" }, { id: 1, name: "Ada" }],
    ["template literal", "`Hello ${user.name}`", { user: { name: "Ada" } }, "Hello Ada"],
    ["unary", "!ready", { ready: false }, true],
    ["binary", "count * 2 + 1", { count: 3 }, 7],
  ])("matches interpreter for %s", (_name, source, localContext, expected) => {
    expect(evalInterpreted(source, localContext)).toEqual(expected);
    expect(evalCompiled(source, localContext)).toEqual(expected);
  });

  it("records dependencies on the generated artifact", () => {
    const artifact = compileBindingSyncExpressionSource("user[key] ?? fallback", "test:deps");

    expect(artifact.dependencies).toEqual(["user[key]", "fallback"]);
  });

  it("emits source mappings for compiled expression chunks", () => {
    const artifact = compileBindingSyncExpressionSource("user.name", "test:mapping");

    expect(artifact.mappings.length).toBeGreaterThan(0);
    expect(artifact.mappings[0]).toMatchObject({
      sourceId: "test:mapping",
      sourceRange: { start: 0 },
    });
  });

  it("does not notify writes for the side-effect-free subset", () => {
    const updates: string[] = [];
    const artifact = compileBindingSyncExpressionSource(
      "[user.name, count + 1, ready ? label : fallback]",
      "test:no-writes",
    );
    const instance = instantiateCompiledScriptArtifact(artifact, bindingSyncRuntime);

    const value = instance.execute({
      evalContext: createEvalContext(
        {
          localContext: {
            user: { name: "Ada" },
            count: 1,
            ready: false,
            label: "Ready",
            fallback: "Fallback",
          },
          options: { defaultToOptionalMemberAccess: true },
          onWillUpdate: (_scope, index, kind) => {
            updates.push(`will:${String(index)}:${kind}`);
          },
          onDidUpdate: (_scope, index, kind) => {
            updates.push(`did:${String(index)}:${kind}`);
          },
        },
      ),
    });

    expect(value).toEqual(["Ada", 2, "Fallback"]);
    expect(updates).toEqual([]);
  });

  it("throws unsupported-node errors instead of falling back to the interpreter", () => {
    expect(() => compileBindingSyncExpressionSource("new Date()", "test:unsupported")).toThrow(
      UnsupportedCompiledScriptNodeError,
    );
    expect(() => compileBindingSyncExpressionSource("Math.floor(1.2)", "test:unsupported")).toThrow(
      UnsupportedCompiledScriptNodeError,
    );
    expect(evalInterpreted("new Date(0)")).toBeInstanceOf(Date);
  });
});
