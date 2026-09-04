import { describe, expect, it } from "vitest";

import {
  compileEventAsyncStatementSource,
  executeCompiledEventAsyncArtifact,
} from "../../../src/components-core/script-compiler";
import { Parser } from "../../../src/parsers/scripting/Parser";
import { processStatementQueueAsync } from "../../../src/components-core/script-runner/process-statement-async";

/**
 * Parity harness for plan #3879: every snippet is executed twice — once through the
 * interpreter, once through the compiled artifact — and both the returned value and
 * the resulting local context must agree. A construct that only *compiles* is not
 * enough; it has to mean the same thing either way.
 */
type ParityCase = {
  /** Statement source, written as the body of an event handler. */
  source: string;
  /** Initial local context; each run gets its own deep copy. */
  context?: Record<string, any>;
  /** Expected shared result, asserted against both runs. */
  expected: unknown;
};

function cloneContext(context: Record<string, any>): Record<string, any> {
  // --- Not `structuredClone`: several cases put host functions in the context.
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [
      key,
      typeof value === "function" ? value : JSON.parse(JSON.stringify(value ?? null)),
    ]),
  );
}

function createEvalContext(context: Record<string, any>) {
  return {
    localContext: cloneContext(context),
    options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
  } as any;
}

async function runInterpreted(source: string, context: Record<string, any>) {
  const statements = new Parser(source).parseStatements();
  const evalContext = createEvalContext(context);
  await processStatementQueueAsync(statements, evalContext);
  // --- The interpreter parks a handler's return value on the thread; the compiled
  // --- path returns it directly (the dispatcher normalises both, see
  // --- `container/event-handlers.ts`).
  return {
    value: evalContext.mainThread?.returnValue,
    context: evalContext.localContext,
  };
}

async function runCompiled(source: string, context: Record<string, any>, sourceId: string) {
  const artifact = compileEventAsyncStatementSource(source, sourceId);
  const evalContext = createEvalContext(context);
  const value = await executeCompiledEventAsyncArtifact(artifact, evalContext);
  return { value, context: evalContext.localContext, artifact };
}

function itRunsBothWays(name: string, testCase: ParityCase) {
  it(name, async () => {
    const context = testCase.context ?? {};
    const interpreted = await runInterpreted(testCase.source, context);
    const compiled = await runCompiled(testCase.source, context, `parity#${name}`);

    expect(compiled.value).toEqual(testCase.expected);
    expect(interpreted.value).toEqual(testCase.expected);
    expect(compiled.context).toEqual(interpreted.context);
  });
}

describe("compiled event handlers — conditional expressions", () => {
  // --- The five declaration bodies quoted verbatim in the bug report; each one
  // --- fell back to interpretation before conditional expressions were supported.
  itRunsBothWays("compiles a single-return ternary (testCaseTypeLabel)", {
    source: "return value === 1 ? 'Automata' : 'Manualis';",
    context: { value: 1 },
    expected: "Automata",
  });

  itRunsBothWays("compiles a ternary over a status code (suiteFactTone)", {
    source: "return status === 2 ? 'warn' : 'neutral';",
    context: { status: 3 },
    expected: "neutral",
  });

  itRunsBothWays("compiles a ternary with a compound condition (submitterLabel)", {
    source: "return myName && name === myName ? 'Me' : name;",
    context: { name: "Ada", myName: "Ada" },
    expected: "Me",
  });

  itRunsBothWays("compiles a ternary whose branch calls a function (toneIconColor)", {
    source: "return tone === 'neutral' ? '$color-primary-500' : fallback(tone);",
    context: { tone: "warn", fallback: (value: string) => `tone-${value}` },
    expected: "tone-warn",
  });

  itRunsBothWays("compiles nested ternaries (roleLabel)", {
    source: "return role === 2 ? 'Admin' : (role === 1 ? 'Editor' : 'Viewer');",
    context: { role: 1 },
    expected: "Editor",
  });

  itRunsBothWays("compiles a ternary in a declaration initializer", {
    source: "const label = flag ? 'on' : 'off'; return label;",
    context: { flag: false },
    expected: "off",
  });

  itRunsBothWays("compiles a ternary inside a template literal", {
    source: "return `state: ${flag ? 'on' : 'off'}`;",
    context: { flag: true },
    expected: "state: on",
  });

  itRunsBothWays("compiles a ternary passed as a call argument", {
    source: "return wrap(flag ? 1 : 2);",
    context: { flag: false, wrap: (value: number) => value * 10 },
    expected: 20,
  });

  it("does not evaluate the untaken branch", async () => {
    const source = "return flag ? safe() : boom();";
    const context = {
      flag: true,
      safe: () => "ok",
      boom: () => {
        throw new Error("untaken branch was evaluated");
      },
    };

    const compiled = await runCompiled(source, context, "parity#lazy-branch");
    const interpreted = await runInterpreted(source, context);

    expect(compiled.value).toBe("ok");
    expect(interpreted.value).toBe("ok");
  });
});

describe("compiled event handlers — sequence expressions", () => {
  itRunsBothWays("evaluates every operand and yields the last", {
    source: "let a = 0; const b = ((a = a + 1), (a = a + 2), a + 10); return [a, b];",
    expected: [3, 13],
  });
});

describe("compiled event handlers — new expressions", () => {
  itRunsBothWays("constructs an allowed class", {
    source: "const d = new Date(0); return d.getTime();",
    expected: 0,
  });

  itRunsBothWays("constructs with arguments", {
    source: "const e = new Error('boom'); return e.message;",
    expected: "boom",
  });

  itRunsBothWays("throws a constructed error object", {
    source: "try { throw new Error('nope'); } catch (err) { return err.message; }",
    expected: "nope",
  });
});

describe("compiled event handlers — spread operands", () => {
  itRunsBothWays("spreads into an array literal", {
    source: "return [0, ...items, 9];",
    context: { items: [1, 2] },
    expected: [0, 1, 2, 9],
  });

  itRunsBothWays("spreads into a call", {
    source: "return pick(...items);",
    context: { items: [3, 7], pick: (a: number, b: number) => a + b },
    expected: 10,
  });

  itRunsBothWays("spreads into an object literal", {
    source: "return { ...base, b: 2 };",
    context: { base: { a: 1 } },
    expected: { a: 1, b: 2 },
  });

  itRunsBothWays("spreads into a new expression", {
    source: "const d = new Date(...parts); return d.getFullYear();",
    context: { parts: [2020, 0, 1] },
    expected: 2020,
  });

  it("rejects a non-array spread operand the same way the interpreter does", async () => {
    const source = "return [...value];";
    const context = { value: 42 };

    await expect(runCompiled(source, context, "parity#bad-spread")).rejects.toThrow(
      "Spread operator within an array literal expects an array operand.",
    );
    await expect(runInterpreted(source, context)).rejects.toThrow(
      "Spread operator within an array literal expects an array operand.",
    );
  });
});

describe("compiled event handlers — arrow callbacks over the new constructs", () => {
  itRunsBothWays("compiles a ternary inside an array callback", {
    source: "return rows.map(row => row.id === target ? 'hit' : 'miss');",
    context: { target: 2, rows: [{ id: 1 }, { id: 2 }] },
    expected: ["miss", "hit"],
  });

  itRunsBothWays("compiles a ternary inside a filter predicate", {
    source: "return rows.filter(row => (row.tag ? row.tag : 'none') === 'none');",
    context: { rows: [{ id: 1, tag: "a" }, { id: 2 }] },
    expected: [{ id: 2 }],
  });

  it("keeps an arrow callback with a ternary on the native compiled path", () => {
    const artifact = compileEventAsyncStatementSource(
      "return rows.some(row => row.id === target ? true : false);",
      "parity#native-arrow-ternary",
    );

    // --- `runtime.arrow(` marks the lazy fallback that hands the callback body back
    // --- to the interpreter; a natively compiled callback never emits it.
    expect(artifact.js).not.toContain("runtime.arrow(");
    expect(artifact.js).toContain("=>");
  });
});
