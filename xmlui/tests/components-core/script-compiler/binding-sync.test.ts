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

function evalCompiledWithContext(source: string, evalContextParts: Parameters<typeof createEvalContext>[0]) {
  const artifact = compileBindingSyncExpressionSource(source, `test:${source}`);
  const instance = instantiateCompiledScriptArtifact(artifact, bindingSyncRuntime);
  return instance.execute({
    evalContext: createEvalContext(evalContextParts),
  });
}

function createCompiledInstance(source: string) {
  const artifact = compileBindingSyncExpressionSource(source, `test:${source}`);
  return instantiateCompiledScriptArtifact(artifact, bindingSyncRuntime);
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
    ["global function call", "Math.floor(value)", { value: 1.8 }, 1],
    ["method call with this", "text.toUpperCase()", { text: "ada" }, "ADA"],
    ["map arrow callback", "items.map(item => item.id)", { items: [{ id: 1 }, { id: 2 }] }, [1, 2]],
    [
      "filter/map arrow callback chain",
      "items.filter(item => item.ready).map(item => item.id)",
      { items: [{ id: 1, ready: true }, { id: 2, ready: false }] },
      [1],
    ],
    ["reduce arrow callback", "items.reduce((sum, item) => sum + item, 0)", { items: [1, 2, 3] }, 6],
    ["IIFE expression body", "(() => count + 1)()", { count: 2 }, 3],
    ["IIFE block body", "(() => { let x = count + 1; const y = x * 2; return y; })()", { count: 2 }, 6],
    ["local let shadows state", "(() => { let count = 10; return count; })()", { count: 1 }, 10],
    ["if statement then", "(() => { if (ready) return label; return fallback; })()", { ready: true, label: "Ready", fallback: "Fallback" }, "Ready"],
    ["if statement else", "(() => { if (ready) return label; else return fallback; })()", { ready: false, label: "Ready", fallback: "Fallback" }, "Fallback"],
    ["local assignment", "(() => { let x = 1; x += 2; return x; })()", {}, 3],
    ["local prefix/postfix", "(() => { let x = 1; return x++ + ++x; })()", {}, 4],
    ["while loop", "(() => { let i = 0; let sum = 0; while (i < 4) { sum += i; i++; } return sum; })()", {}, 6],
    ["do while loop", "(() => { let i = 0; do { i++; } while (i < 3); return i; })()", {}, 3],
    ["for loop", "(() => { let sum = 0; for (let i = 0; i < 4; i++) { sum += i; } return sum; })()", {}, 6],
    ["for of loop", "(() => { let sum = 0; for (let item of items) { sum += item; } return sum; })()", { items: [1, 2, 3] }, 6],
    ["for in loop", "(() => { let keys = ''; for (let key in obj) { keys += key; } return keys; })()", { obj: { a: 1, b: 2 } }, "ab"],
    ["break and continue", "(() => { let sum = 0; for (let i = 0; i < 6; i++) { if (i === 2) continue; if (i === 5) break; sum += i; } return sum; })()", {}, 8],
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

  it("notifies function-call updates for non-local receiver roots", () => {
    const updates: string[] = [];
    const localContext = { items: [1, 2] };
    const instance = createCompiledInstance("items.push(3)");

    const value = instance.execute({
      evalContext: createEvalContext({
        localContext,
        options: { defaultToOptionalMemberAccess: true },
        onWillUpdate: (_scope, index, kind) => {
          updates.push(`will:${String(index)}:${kind}`);
        },
        onDidUpdate: (_scope, index, kind) => {
          updates.push(`did:${String(index)}:${kind}`);
        },
      }),
    });

    expect(value).toBe(3);
    expect(localContext.items).toEqual([1, 2, 3]);
    expect(updates).toEqual(["will:items:function-call", "did:items:function-call"]);
  });

  it("notifies assignment and pre/post updates for non-local roots", () => {
    const updates: string[] = [];
    const localContext = { count: 1, nested: { value: 2 } };

    const value = evalCompiledWithContext(
      "(() => { count += 2; nested.value++; return count + nested.value; })()",
      {
        localContext,
        options: { defaultToOptionalMemberAccess: true },
        onWillUpdate: (_scope, index, kind) => {
          updates.push(`will:${String(index)}:${kind}`);
        },
        onDidUpdate: (_scope, index, kind) => {
          updates.push(`did:${String(index)}:${kind}`);
        },
      },
    );

    expect(value).toBe(6);
    expect(localContext).toEqual({ count: 3, nested: { value: 3 } });
    expect(updates).toEqual([
      "will:count:assignment",
      "did:count:assignment",
      "will:nested:pre-post",
      "did:nested:pre-post",
    ]);
  });

  it("notifies delete updates for non-local member roots", () => {
    const updates: string[] = [];
    const localContext = { item: { name: "Ada" } };

    const value = evalCompiledWithContext("(() => { return delete item.name; })()", {
      localContext,
      options: { defaultToOptionalMemberAccess: true },
      onWillUpdate: (_scope, index, kind) => {
        updates.push(`will:${String(index)}:${kind}`);
      },
      onDidUpdate: (_scope, index, kind) => {
        updates.push(`did:${String(index)}:${kind}`);
      },
    });

    expect(value).toBe(true);
    expect(localContext.item).toEqual({});
    expect(updates).toEqual(["will:item:assignment", "did:item:assignment"]);
  });

  it("uses the configured sync timeout for compiled loops", () => {
    expect(() =>
      evalCompiledWithContext("(() => { while (true) {} })()", {
        localContext: {},
        appContext: { xmluiConfig: { syncExecutionTimeout: 0 } },
        options: { defaultToOptionalMemberAccess: true },
      }),
    ).toThrow("Sync evaluation timeout exceeded 0 milliseconds");
  });

  it("does not notify function-call updates for arrow-local receiver roots", () => {
    const updates: string[] = [];
    const instance = createCompiledInstance("items.map(item => item.tags.join(','))");

    const value = instance.execute({
      evalContext: createEvalContext({
        localContext: { items: [{ tags: ["a", "b"] }] },
        options: { defaultToOptionalMemberAccess: true },
        onWillUpdate: (_scope, index, kind) => {
          updates.push(`will:${String(index)}:${kind}`);
        },
        onDidUpdate: (_scope, index, kind) => {
          updates.push(`did:${String(index)}:${kind}`);
        },
      }),
    });

    expect(value).toEqual(["a,b"]);
    expect(updates).toEqual(["will:items:function-call", "did:items:function-call"]);
  });

  it("rejects banned functions through the compiled runtime call helper", () => {
    expect(() => evalCompiled("setTimeout(() => 1, 0)")).toThrow("not allowed to call");
  });

  it("rejects promises returned from compiled binding calls", () => {
    expect(() => evalCompiled("load()", { load: () => Promise.resolve(1) })).toThrow(
      "Promises (async function calls) are not allowed in binding expressions.",
    );
  });

  it("throws unsupported-node errors instead of falling back to the interpreter", () => {
    expect(() => compileBindingSyncExpressionSource("new Date()", "test:unsupported")).toThrow(
      UnsupportedCompiledScriptNodeError,
    );
    expect(() => compileBindingSyncExpressionSource("(() => { try { return 1; } finally {} })()", "test:unsupported")).toThrow(
      UnsupportedCompiledScriptNodeError,
    );
    expect(evalInterpreted("new Date(0)")).toBeInstanceOf(Date);
  });
});
