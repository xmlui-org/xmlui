import { describe, expect, it } from "vitest";

import {
  compileEventAsyncStatementSource,
  executeCompiledEventAsyncArtifact,
} from "../../../src/components-core/script-compiler";
import { ThrowStatementError } from "../../../src/components-core/EngineError";
import { createEvalContext } from "../../../src/components-core/script-runner/BindingTreeEvaluationContext";
import { processStatementQueueAsync } from "../../../src/components-core/script-runner/process-statement-async";
import { Parser } from "../../../src/parsers/scripting/Parser";

async function runCompiled(source: string, localContext: Record<string, any> = {}) {
  const evalContext = createEvalContext({
    localContext,
    options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
  });
  const artifact = compileEventAsyncStatementSource(source, `test:event:control:${source}`);
  const returnValue = await executeCompiledEventAsyncArtifact(artifact, evalContext);
  return { evalContext, localContext, returnValue };
}

async function runInterpreted(source: string, localContext: Record<string, any> = {}) {
  const evalContext = createEvalContext({
    localContext,
    options: { defaultToOptionalMemberAccess: true },
  });
  const parser = new Parser(source);
  await processStatementQueueAsync(parser.parseStatements(), evalContext);
  return { evalContext, localContext, returnValue: evalContext.mainThread?.returnValue };
}

async function expectCompiledParity(source: string, localContext: Record<string, any> = {}) {
  const compiled = await runCompiled(source, { ...localContext });
  const interpreted = await runInterpreted(source, { ...localContext });

  expect(compiled.returnValue).toEqual(interpreted.returnValue);
  expect(compiled.localContext).toEqual(interpreted.localContext);
}

describe("compiled event-async control flow", () => {
  it("executes while loops", async () => {
    await expectCompiledParity("let x = 0; while (x < 3) { x++; } return x;");
  });

  it("executes nested while loops", async () => {
    await expectCompiledParity(
      "let x = 0; while (x < 6) { let y = 0; while (y < 3) { x += y; y++; } } return x;",
    );
  });

  it("executes while loops with break", async () => {
    await expectCompiledParity("let x = 0; while (true) { x++; if (x > 3) break; } return x;");
  });

  it("executes while loops with continue", async () => {
    await expectCompiledParity(
      "let y = 0; let x = 0; while (x < 6) { x++; if (x == 3) continue; y += x; } return y;",
    );
  });

  it("executes do-while loops", async () => {
    await expectCompiledParity("let x = 0; do { x++; } while (x < 3); return x;");
    await expectCompiledParity("let x = 0; do { x++; } while (x < 0); return x;");
  });

  it("executes do-while loops with break and continue", async () => {
    await expectCompiledParity("let x = 0; do { x++; if (x > 3) break; } while (true); return x;");
    await expectCompiledParity(
      "let y = 0; let x = 0; do { x++; if (x == 3) continue; y += x; } while (x < 6); return y;",
    );
  });

  it("yields for loop body statements on each iteration", async () => {
    const order: string[] = [];
    const evalContext = createEvalContext({
      localContext: { count: 0 },
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
      onStatementCompleted: () => {
        const index = order.length / 2;
        order.push(`completed:${index}`);
        setTimeout(() => order.push(`timer:${index}`), 0);
      },
    });
    const artifact = compileEventAsyncStatementSource(
      "while (count < 3) { count = count + 1; }",
      "test:event:loop-yield",
    );

    await executeCompiledEventAsyncArtifact(artifact, evalContext);

    expect(evalContext.localContext.count).toBe(3);
    expect(order.length).toBeGreaterThanOrEqual(12);
    for (let i = 0; i < order.length; i += 2) {
      expect(order[i]).toBe(`completed:${i / 2}`);
      expect(order[i + 1]).toBe(`timer:${i / 2}`);
    }
  });

  it("executes for loops with let initializers", async () => {
    await expectCompiledParity("let y = 0; for (let i = 0; i < 4; i++) { y += i; } return y;");
  });

  it("keeps for-loop let initializers scoped to the loop", async () => {
    await expectCompiledParity("let i = 9; for (let i = 0; i < 2; i++) { } return i;");
  });

  it("executes for loops without initializers", async () => {
    await expectCompiledParity(
      "let y = 0; let i = 0; for (; i < 4; i++) { y += i; } return y;",
    );
  });

  it("executes for loops with break", async () => {
    await expectCompiledParity("let y = 0; for (let i = 0; i < 4; i++) { break; } y++; return y;");
  });

  it("executes for loops with continue", async () => {
    await expectCompiledParity(
      "let y = 0; for (let i = 0; i < 10; i++) { if (i % 3 === 0) continue; y += i; } return y;",
    );
  });

  it("yields for for-loop guard, body, and update statements", async () => {
    const order: string[] = [];
    const evalContext = createEvalContext({
      localContext: { count: 0 },
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
      onStatementCompleted: () => {
        const index = order.length / 2;
        order.push(`completed:${index}`);
        setTimeout(() => order.push(`timer:${index}`), 0);
      },
    });
    const artifact = compileEventAsyncStatementSource(
      "for (let i = 0; i < 3; i++) { count = count + 1; }",
      "test:event:for-loop-yield",
    );

    await executeCompiledEventAsyncArtifact(artifact, evalContext);

    expect(evalContext.localContext.count).toBe(3);
    expect(order.length).toBeGreaterThanOrEqual(18);
    for (let i = 0; i < order.length; i += 2) {
      expect(order[i]).toBe(`completed:${i / 2}`);
      expect(order[i + 1]).toBe(`timer:${i / 2}`);
    }
  });

  it("executes for-in loops with none, let, and const bindings", async () => {
    const localContext = { obj: { one: "1", two: 2, three: 3 } };

    await expectCompiledParity("let y; let res = ''; for (y in obj) res += obj[y]; return res;", localContext);
    await expectCompiledParity("let res = ''; for (let y in obj) res += obj[y]; return res;", localContext);
    await expectCompiledParity(
      "let res = ''; for (const y in obj) res += obj[y]; return res;",
      localContext,
    );
  });

  it("executes for-in loops with break and continue", async () => {
    const localContext = { obj: { one: "1", two: 2, three: 3 } };

    await expectCompiledParity(
      "let res = ''; for (let y in obj) { if (y === 'two') break; res += obj[y]; } return res;",
      localContext,
    );
    await expectCompiledParity(
      "let res = ''; for (let y in obj) { if (y === 'two') continue; res += obj[y]; } return res;",
      localContext,
    );
  });

  it("skips for-in loops for nullish values", async () => {
    await expectCompiledParity("let res = ''; for (let y in obj) res += obj[y]; return res;", {
      obj: null,
    });
    await expectCompiledParity("let res = ''; for (const y in obj) res += obj[y]; return res;", {
      obj: undefined,
    });
  });

  it("executes for-of loops with none, let, and const bindings", async () => {
    const localContext = { obj: [1, 2, 3] };

    await expectCompiledParity("let y; let res = ''; for (y of obj) res += y; return res;", localContext);
    await expectCompiledParity("let res = ''; for (let y of obj) res += y; return res;", localContext);
    await expectCompiledParity("let res = ''; for (const y of obj) res += y; return res;", localContext);
  });

  it("executes for-of loops with break and continue", async () => {
    const localContext = { obj: [1, 2, 3] };

    await expectCompiledParity(
      "let res = ''; for (let y of obj) { if (y === 2) break; res += y; } return res;",
      localContext,
    );
    await expectCompiledParity(
      "let res = ''; for (let y of obj) { if (y === 2) continue; res += y; } return res;",
      localContext,
    );
  });

  it("throws for non-iterable for-of values", async () => {
    await expect(runCompiled("for (y of obj) y = y;", { obj: 123 })).rejects.toThrow(
      "Object in for..of is not iterable",
    );
  });

  it("yields for for-of guard and body statements", async () => {
    const order: string[] = [];
    const evalContext = createEvalContext({
      localContext: { obj: [1, 2, 3], sum: 0 },
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
      onStatementCompleted: () => {
        const index = order.length / 2;
        order.push(`completed:${index}`);
        setTimeout(() => order.push(`timer:${index}`), 0);
      },
    });
    const artifact = compileEventAsyncStatementSource(
      "for (let item of obj) { sum += item; }",
      "test:event:for-of-yield",
    );

    await executeCompiledEventAsyncArtifact(artifact, evalContext);

    expect(evalContext.localContext.sum).toBe(6);
    expect(order.length).toBeGreaterThanOrEqual(14);
    for (let i = 0; i < order.length; i += 2) {
      expect(order[i]).toBe(`completed:${i / 2}`);
      expect(order[i + 1]).toBe(`timer:${i / 2}`);
    }
  });

  it("throws ThrowStatementError for throw statements", async () => {
    await expect(runCompiled("throw { type: 'Error' }")).rejects.toMatchObject({
      errorObject: { type: "Error" },
    });
  });

  it("preserves thrown Error objects", async () => {
    const errObj = new Error("Hello, Error!");

    await expect(runCompiled("throw errObj", { errObj })).rejects.toMatchObject({
      message: "Hello, Error!",
      errorObject: errObj,
    });
  });

  it("completes async throw expression values before throwing", async () => {
    await expect(
      runCompiled("throw getError()", {
        getError: async () => ({ type: "AsyncError" }),
      }),
    ).rejects.toMatchObject({
      errorObject: { type: "AsyncError" },
    });
  });

  it("runs the statement boundary before throwing", async () => {
    const order: string[] = [];
    const evalContext = createEvalContext({
      localContext: {},
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
      onStatementCompleted: () => {
        order.push("completed");
        setTimeout(() => order.push("timer"), 0);
      },
    });
    const artifact = compileEventAsyncStatementSource("throw 'boom'", "test:event:throw-yield");

    await expect(executeCompiledEventAsyncArtifact(artifact, evalContext)).rejects.toThrow(
      ThrowStatementError,
    );

    expect(order).toEqual(["completed", "timer"]);
  });

  it("executes switch statements with no matching case", async () => {
    await expectCompiledParity("let x = 0; let y = 0; switch (x) { case 3: y++; } return y;");
  });

  it("executes switch statements with matching cases and break", async () => {
    await expectCompiledParity(
      "let x = 0; let y = 0; switch (x) { case 0: y++; break; case 1: y++; break; } return y;",
    );
  });

  it("executes switch fallthrough", async () => {
    await expectCompiledParity(
      "let x = 1; let y = 0; switch (x) { case 0: y++; case 1: y++; case 2: y++; case 3: y++; } return y;",
    );
  });

  it("uses the first default case as the first match", async () => {
    await expectCompiledParity(
      "let x = 1; let y = 0; switch (x) { default: y++; case 1: y++; case 2: y++; } return y;",
    );
  });

  it("executes switch break inside loops without breaking the loop", async () => {
    await expectCompiledParity(
      "let x = 0; let y = 0; while (x < 4) { switch (x) { case 0: y++; break; case 1: y++; break; case 2: y++; break; case 3: y++; break; } x++; } return y;",
    );
  });

  it("continues the enclosing loop from inside a switch", async () => {
    await expectCompiledParity(
      "let x = 0; let y = 0; while (x < 4) { x++; switch (x) { case 2: continue; default: y++; } y += 10; } return y;",
    );
  });

  it("yields around switch dispatch before running matching case statements", async () => {
    const order: string[] = [];
    const evalContext = createEvalContext({
      localContext: { x: 1, y: 0 },
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
      onStatementCompleted: () => {
        const index = order.length / 2;
        order.push(`completed:${index}`);
        setTimeout(() => order.push(`timer:${index}`), 0);
      },
    });
    const artifact = compileEventAsyncStatementSource(
      "switch (x) { case 1: y++; break; }",
      "test:event:switch-yield",
    );

    await executeCompiledEventAsyncArtifact(artifact, evalContext);

    expect(evalContext.localContext.y).toBe(1);
    expect(order.slice(0, 2)).toEqual(["completed:0", "timer:0"]);
  });

  it("executes try/finally for normal completion", async () => {
    await expectCompiledParity("x = 1; try { x = 2; } finally { x = 3; }", { x: 0 });
  });

  it("executes try/catch for thrown XMLUI errors", async () => {
    await expectCompiledParity(
      "try { x = 2; throw { type: 'Error' }; } catch { x++; }",
      { x: 1 },
    );
  });

  it("binds catch variables to the original thrown object", async () => {
    await expectCompiledParity(
      "try { throw { type: 'Error' }; } catch (err) { x = err.type; }",
      { x: "" },
    );
  });

  it("runs finally after caught errors", async () => {
    await expectCompiledParity(
      "try { x = 2; throw { type: 'Error' }; } catch { x++; } finally { x++; }",
      { x: 1 },
    );
  });

  it("runs finally before rethrowing errors", async () => {
    const source = "try { x = 2; throw { type: 'Error' }; } finally { x++; }";

    await expect(runCompiled(source, { x: 1 })).rejects.toMatchObject({
      errorObject: { type: "Error" },
    });
    await expect(runInterpreted(source, { x: 1 })).rejects.toMatchObject({
      errorObject: { type: "Error" },
    });
  });

  it("runs finally for return statements", async () => {
    await expectCompiledParity("try { return 123; } finally { x = 1; }", { x: 0 });
  });

  it("lets finally return suppress pending throws", async () => {
    await expectCompiledParity("try { throw { type: 'Error' }; } finally { x = 1; return 123; }", {
      x: 0,
    });
  });

  it("runs finally for break and continue statements", async () => {
    await expectCompiledParity(
      "let x = 0; while (true) { try { break; x = -4; } finally { x = 3; } } return x;",
    );
    await expectCompiledParity(
      "let x = 0; let z = 0; while (x < 3) { try { z++; if (x === 1) continue; z++; } finally { x++; } } return z;",
    );
  });

  it("lets finally break and continue suppress pending throws", async () => {
    await expectCompiledParity(
      "while (true) { try { throw { type: 'Error' }; } finally { x = 1; break; } x = -1; }",
      { x: 0 },
    );
    await expectCompiledParity(
      "while (x < 3) { try { throw { type: 'Error' }; } finally { x++; continue; } z++; }",
      { x: 0, z: 0 },
    );
  });

  it("yields before entering try body statements", async () => {
    const order: string[] = [];
    const evalContext = createEvalContext({
      localContext: { x: 0 },
      options: { compileEventHandlers: true, defaultToOptionalMemberAccess: true },
      onStatementCompleted: () => {
        const index = order.length / 2;
        order.push(`completed:${index}`);
        setTimeout(() => order.push(`timer:${index}`), 0);
      },
    });
    const artifact = compileEventAsyncStatementSource(
      "try { x = 1; } finally { x = 2; }",
      "test:event:try-yield",
    );

    await executeCompiledEventAsyncArtifact(artifact, evalContext);

    expect(evalContext.localContext.x).toBe(2);
    expect(order.slice(0, 2)).toEqual(["completed:0", "timer:0"]);
  });
});
