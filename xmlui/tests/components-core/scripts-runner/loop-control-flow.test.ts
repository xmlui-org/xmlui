/**
 * Loop control-flow correctness tests.
 *
 * These tests exist specifically to guard the scenarios that break when
 * switching from a queue-based loop implementation to native-execution loops.
 * Every group maps to one concrete risk:
 *
 *  Risk A – break must stop the loop at the right iteration, not the next one.
 *  Risk B – continue must skip the rest of the body but NOT skip the update
 *           expression (i++) in a for-loop.  Skipping i++ causes infinite loops.
 *  Risk C – return inside a loop must propagate out of the loop AND the
 *           enclosing function in one step.  A partially-unwound stack leaves
 *           the caller with the wrong value.
 *  Risk D – throw inside a loop must propagate out of the loop unchanged.
 *           The loop must not swallow or re-wrap the exception.
 *  Risk E – try/catch inside a loop body must allow the loop to continue after
 *           an exception is caught.  The loop must not stop after the first catch.
 *  Risk F – break/continue inside try must still execute the finally block
 *           before the loop actually breaks or continues.
 *  Risk G – break in an inner loop must not break the outer loop.
 *           continue in an inner loop must not skip an outer iteration.
 *  Risk H – the for-loop variable (let i) must be confined to the loop's
 *           block scope and must not leak into the enclosing scope after
 *           the loop exits.
 *  Risk I – edge cases: zero-iteration loops, single-iteration loops,
 *           do-while that must execute at least once even when the condition
 *           is initially false.
 *  Risk J – async path must honour the same guarantees as the sync path.
 */

import { describe, expect, it } from "vitest";

import { processStatementQueue } from "../../../src/components-core/script-runner/process-statement-sync";
import { processStatementQueueAsync } from "../../../src/components-core/script-runner/process-statement-async";
import { createEvalContext, parseStatements } from "./test-helpers";
import type { BindingTreeEvaluationContext } from "../../../src/components-core/script-runner/BindingTreeEvaluationContext";

const EVAL_TIMEOUT_MS = 30_000;
const VITEST_TIMEOUT = 60_000;

function makeCtx(localContext: Record<string, any> = {}): BindingTreeEvaluationContext {
  return createEvalContext({
    localContext,
    appContext: { appGlobals: { syncExecutionTimeout: EVAL_TIMEOUT_MS } } as any,
    timeout: EVAL_TIMEOUT_MS,
  });
}

function runSync(source: string, localContext: Record<string, any> = {}) {
  const ctx = makeCtx(localContext);
  processStatementQueue(parseStatements(source), ctx);
  return ctx.mainThread!.blocks![0].vars;
}

async function runAsync(source: string, localContext: Record<string, any> = {}) {
  const ctx = makeCtx(localContext);
  await processStatementQueueAsync(parseStatements(source), ctx);
  return ctx.mainThread!.blocks![0].vars;
}

// =============================================================================
// Risk A — break
// The loop must stop exactly at the iteration where break is hit.
// No partial execution of a skipped iteration must happen.
// =============================================================================
describe("Risk A — break exits loop at the correct iteration", () => {
  it("for-loop: break stops iteration, body before break counted", () => {
    // i goes 1,2,3,4 → break at i===5. sum = 1+2+3+4 = 10.
    // If break is delayed by one iteration, sum would be 15.
    const v = runSync(`
      let sum = 0;
      for (let i = 1; i <= 10; i++) {
        if (i === 5) break;
        sum += i;
      }
    `);
    expect(v.sum).equal(10);
  });

  it("while-loop: break on first iteration leaves sum unchanged", () => {
    const v = runSync(`
      let sum = 0;
      let i = 0;
      while (i < 10) {
        break;
        sum += i;
        i++;
      }
    `);
    expect(v.sum).equal(0);
  });

  it("while true: break is the only exit — must not run forever", () => {
    // If break doesn't work this test hangs until VITEST_TIMEOUT.
    const v = runSync(`
      let i = 0;
      while (true) {
        if (i === 7) break;
        i++;
      }
    `);
    expect(v.i).equal(7);
  }, VITEST_TIMEOUT);

  it("for-of: break leaves later items unprocessed", () => {
    // items = [10, 20, 30, 40, 50].  Stop when item===30.  sum = 10+20 = 30.
    const v = runSync(`
      let sum = 0;
      for (let item of items) {
        if (item === 30) break;
        sum += item;
      }
    `, { items: [10, 20, 30, 40, 50] });
    expect(v.sum).equal(30);
  });

  it("for-in: break stops key traversal early", () => {
    // We count how many keys were visited.  Stop after 2.
    const v = runSync(`
      let count = 0;
      for (let key in obj) {
        if (count === 2) break;
        count++;
      }
    `, { obj: { a: 1, b: 2, c: 3, d: 4, e: 5 } });
    expect(v.count).equal(2);
  });

  it("do-while: break prevents the condition from ever being checked", () => {
    // The body runs once, hits break immediately, condition is never evaluated.
    const v = runSync(`
      let count = 0;
      do {
        count++;
        break;
        count += 100;
      } while (true);
    `);
    expect(v.count).equal(1);
  });
});

// =============================================================================
// Risk B — continue
// In a for-loop, continue must jump to the UPDATE expression (i++), not to the
// condition check.  If the update is skipped, the loop variable freezes and the
// loop becomes infinite.
// =============================================================================
describe("Risk B — continue skips body but NOT the update expression", () => {
  it("for-loop: continue skips even-numbered items, i++ still runs", () => {
    // i = 1..10.  Skip even i.  sum = 1+3+5+7+9 = 25.
    // If i++ is skipped when i===2, the loop freezes at i===2 forever.
    const v = runSync(`
      let sum = 0;
      for (let i = 1; i <= 10; i++) {
        if (i % 2 === 0) continue;
        sum += i;
      }
    `);
    expect(v.sum).equal(25);
  }, VITEST_TIMEOUT);

  it("for-loop: continue at i===5 skips exactly that one iteration", () => {
    // sum = 1+2+3+4 + 6+7+8+9+10 = 50 (total 1..10 = 55, minus 5)
    const v = runSync(`
      let sum = 0;
      for (let i = 1; i <= 10; i++) {
        if (i === 5) continue;
        sum += i;
      }
    `);
    expect(v.sum).equal(50);
  }, VITEST_TIMEOUT);

  it("while-loop: continue skips body remainder, condition re-evaluated", () => {
    // i incremented before continue, so the loop still terminates.
    const v = runSync(`
      let i = 0;
      let sum = 0;
      while (i < 10) {
        i++;
        if (i % 2 === 0) continue;
        sum += i;
      }
    `);
    expect(v.sum).equal(25); // 1+3+5+7+9
  }, VITEST_TIMEOUT);

  it("for-of: continue skips the current item, iterator advances normally", () => {
    // Skip item 3. sum = 1+2+4+5 = 12.
    const v = runSync(`
      let sum = 0;
      for (let item of items) {
        if (item === 3) continue;
        sum += item;
      }
    `, { items: [1, 2, 3, 4, 5] });
    expect(v.sum).equal(12);
  });

  it("do-while: continue re-evaluates the condition", () => {
    // i incremented in body before continue.  Condition i<5 keeps the loop going.
    const v = runSync(`
      let i = 0;
      let skipped = 0;
      do {
        i++;
        if (i === 3) { skipped++; continue; }
      } while (i < 5);
    `);
    expect(v.i).equal(5);
    expect(v.skipped).equal(1);
  }, VITEST_TIMEOUT);
});

// =============================================================================
// Risk C — return inside a loop inside a function
// return must stop the loop AND return a value to the caller in a single step.
// A two-step propagation (stop loop, then return) would cause the function to
// return undefined if the outer mechanism is not correctly wired.
// =============================================================================
describe("Risk C — return propagates out of the loop and the function", () => {
  it("for-of: return early from search function returns correct value", () => {
    // findFirst returns the first match. If return does not exit the loop
    // immediately, the function would scan past the match and possibly
    // return a later value or the fallback -1.
    const v = runSync(`
      let result = -1;
      const findFirst = (arr, target) => {
        for (let item of arr) {
          if (item === target) return item;
        }
        return -1;
      };
      result = findFirst(data, 3);
    `, { data: [1, 2, 3, 4, 5] });
    expect(v.result).equal(3);
  });

  it("for-of: return -1 when target is absent", () => {
    const v = runSync(`
      let result = 0;
      const findFirst = (arr, target) => {
        for (let item of arr) {
          if (item === target) return item;
        }
        return -1;
      };
      result = findFirst(data, 99);
    `, { data: [1, 2, 3, 4, 5] });
    expect(v.result).equal(-1);
  });

  it("while: return from inside while exits both loop and function", () => {
    const v = runSync(`
      let result = -1;
      const countUntil = (limit) => {
        let n = 0;
        while (true) {
          if (n >= limit) return n;
          n++;
        }
      };
      result = countUntil(7);
    `);
    expect(v.result).equal(7);
  });

  it("nested for: return exits both inner and outer loops", () => {
    // Searches a 2-D matrix.  Returns true as soon as target is found.
    const v = runSync(`
      let result = false;
      const contains = (matrix, target) => {
        for (let row of matrix) {
          for (let cell of row) {
            if (cell === target) return true;
          }
        }
        return false;
      };
      result = contains(matrix, 5);
    `, { matrix: [[1, 2], [3, 4], [5, 6]] });
    expect(v.result).equal(true);
  });

  it("nested for: return false when target not found in matrix", () => {
    const v = runSync(`
      let result = false;
      const contains = (matrix, target) => {
        for (let row of matrix) {
          for (let cell of row) {
            if (cell === target) return true;
          }
        }
        return false;
      };
      result = contains(matrix, 99);
    `, { matrix: [[1, 2], [3, 4], [5, 6]] });
    expect(v.result).equal(false);
  });
});

// =============================================================================
// Risk D — throw inside a loop propagates correctly
// The loop must not silently swallow an unhandled exception.
// Code after the loop must NOT run when throw is not caught inside the loop.
// =============================================================================
describe("Risk D — throw propagates out of the loop unchanged", () => {
  it("for-loop: unhandled throw exits loop, outer catch receives it", () => {
    // Loop throws at i===2.  Code after the loop must not execute.
    const v = runSync(`
      let afterLoop = false;
      let caught = "";
      try {
        for (let i = 0; i < 5; i++) {
          if (i === 2) throw "loop-error";
        }
        afterLoop = true;
      } catch (e) {
        caught = e;
      }
    `);
    expect(v.afterLoop).equal(false);
    expect(v.caught).equal("loop-error");
  });

  it("for-of: throw stops iteration at the throwing item", () => {
    const v = runSync(`
      let count = 0;
      let caught = false;
      try {
        for (let item of items) {
          if (item === 3) throw "stop";
          count++;
        }
      } catch (e) {
        caught = true;
      }
    `, { items: [1, 2, 3, 4, 5] });
    expect(v.count).equal(2); // processed 1 and 2 before throwing at 3
    expect(v.caught).equal(true);
  });
});

// =============================================================================
// Risk E — catch inside loop body allows loop to continue
// After catching an exception, the loop must proceed to the next iteration.
// Incorrect propagation would either stop the loop or re-throw.
// =============================================================================
describe("Risk E — catch inside loop body, loop continues after catch", () => {
  it("for-loop: exception caught per-iteration, loop runs all 5", () => {
    // i===2 throws; catch increments errors.  Loop runs all 5 iterations.
    const v = runSync(`
      let successes = 0;
      let errors = 0;
      for (let i = 0; i < 5; i++) {
        try {
          if (i === 2) throw "bad";
          successes++;
        } catch (e) {
          errors++;
        }
      }
    `);
    expect(v.successes).equal(4);
    expect(v.errors).equal(1);
  });

  it("while-loop: loop continues after catching mid-loop exception", () => {
    const v = runSync(`
      let i = 0;
      let successes = 0;
      let errors = 0;
      while (i < 5) {
        try {
          if (i === 3) throw "oops";
          successes++;
        } catch (e) {
          errors++;
        }
        i++;
      }
    `);
    expect(v.successes).equal(4);
    expect(v.errors).equal(1);
  });

  it("for-of: every item processed even when some throw", () => {
    const v = runSync(`
      let sum = 0;
      let errors = 0;
      for (let item of items) {
        try {
          if (item < 0) throw "negative";
          sum += item;
        } catch (e) {
          errors++;
        }
      }
    `, { items: [1, -2, 3, -4, 5] });
    expect(v.sum).equal(9); // 1+3+5
    expect(v.errors).equal(2);
  });
});

// =============================================================================
// Risk F — finally inside a loop body
// The finally block must run even when break, continue, or return interrupts
// the try block.  This is the most complex interaction: the loop control-flow
// signal must be "remembered" while finally executes, then acted on afterward.
// =============================================================================
describe("Risk F — finally runs even when break/continue/return interrupt try", () => {
  it("break inside try: finally runs for the iteration that breaks", () => {
    // Iterations: i=0 (no break, finally runs), i=1 (no break, finally runs),
    // i=2 (break, finally still runs), then loop stops.
    // finallyCount = 3.
    const v = runSync(`
      let finallyCount = 0;
      for (let i = 0; i < 5; i++) {
        try {
          if (i === 2) break;
        } finally {
          finallyCount++;
        }
      }
    `);
    expect(v.finallyCount).equal(3);
  });

  it("continue inside try: finally runs on every iteration including skipped ones", () => {
    // i=0..4.  i===2 → continue.  finally runs all 5 times.
    // normalCount: body after try runs for i≠2 → 4 times.
    const v = runSync(`
      let finallyCount = 0;
      let normalCount = 0;
      for (let i = 0; i < 5; i++) {
        try {
          if (i === 2) continue;
        } finally {
          finallyCount++;
        }
        normalCount++;
      }
    `);
    expect(v.finallyCount).equal(5);
    expect(v.normalCount).equal(4);
  });

  it("return inside try: finally runs before function returns", () => {
    // The function returns 42 from inside the try.  finally must run first.
    const v = runSync(`
      let finallyRan = false;
      let result = 0;
      const fn = () => {
        for (let i = 0; i < 5; i++) {
          try {
            if (i === 2) return 42;
          } finally {
            finallyRan = true;
          }
        }
        return -1;
      };
      result = fn();
    `);
    expect(v.result).equal(42);
    expect(v.finallyRan).equal(true);
  });
});

// =============================================================================
// Risk G — nested loops: break/continue scope is limited to the innermost loop
// break in the inner loop must not affect the outer loop.
// continue in the inner loop must not skip the outer iteration.
// =============================================================================
describe("Risk G — nested loops: break/continue are scoped to the innermost loop", () => {
  it("break in inner for-loop does not stop outer loop", () => {
    // Outer: i = 0..4 (5 iterations).
    // Inner: j = 0..4, break when j===2.  Each inner run counts 2 (j=0, j=1).
    // Total count = 5 * 2 = 10.
    const v = runSync(`
      let count = 0;
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          if (j === 2) break;
          count++;
        }
      }
    `);
    expect(v.count).equal(10);
  });

  it("continue in inner for-loop does not skip outer iteration", () => {
    // Outer: i = 0..2 (3 iterations).
    // Inner: j = 0..2, continue when j===1.  Each inner run counts 2 (j=0, j=2).
    // Total count = 3 * 2 = 6.
    const v = runSync(`
      let count = 0;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (j === 1) continue;
          count++;
        }
      }
    `);
    expect(v.count).equal(6);
  });

  it("break inner while does not stop outer for-of", () => {
    const v = runSync(`
      let outerCount = 0;
      let innerTotal = 0;
      for (let outerVal of outer) {
        outerCount++;
        let j = 0;
        while (j < 5) {
          if (j === 2) break;
          innerTotal++;
          j++;
        }
      }
    `, { outer: [10, 20, 30] });
    expect(v.outerCount).equal(3);
    expect(v.innerTotal).equal(6); // 3 outer * 2 inner iterations each
  });

  it("outer for-of continues after inner loop break", () => {
    // Make sure outerCount reaches 3 even though inner breaks every time.
    const v = runSync(`
      let outerCount = 0;
      for (let item of items) {
        outerCount++;
        for (let i = 0; i < 100; i++) {
          break;
        }
      }
    `, { items: [1, 2, 3] });
    expect(v.outerCount).equal(3);
  });
});

// =============================================================================
// Risk H — loop variable block-scope: let i must not leak after the loop
// In a for-loop, the variable declared in the init (let i) lives in a block
// scope created for that loop.  After the loop exits, that scope is removed.
// If scope cleanup is wrong, i leaks into the outer scope or its value is stale.
// =============================================================================
describe("Risk H — loop variable is confined to its block scope", () => {
  it("for-loop: outer variable with same name is not corrupted by loop's i", () => {
    // outer i is set to 99 before the loop.  Loop uses its own let i.
    // After the loop, outer i must still be 99.
    const v = runSync(`
      let i = 99;
      let sum = 0;
      for (let i = 0; i < 5; i++) {
        sum += i;
      }
    `);
    // sum = 0+1+2+3+4 = 10
    expect(v.sum).equal(10);
    // The outer i declared with let is in blocks[0].vars.
    // The for-loop's i was in a child block that was popped.
    // After the loop, blocks[0].vars.i should still be 99.
    expect(v.i).equal(99);
  });

  it("for-in: loop key variable does not leak into outer scope", () => {
    const v = runSync(`
      let count = 0;
      for (let key in obj) {
        count++;
      }
    `, { obj: { a: 1, b: 2 } });
    expect(v.count).equal(2);
    // key should not exist in the outer block scope
    expect("key" in v).equal(false);
  });
});

// =============================================================================
// Risk I — edge cases: zero iterations, single iteration, do-while semantics
// =============================================================================
describe("Risk I — edge cases: zero-iteration and single-iteration loops", () => {
  it("for-loop: condition false from start → zero iterations", () => {
    const v = runSync(`
      let count = 0;
      for (let i = 10; i < 5; i++) {
        count++;
      }
    `);
    expect(v.count).equal(0);
  });

  it("while-loop: condition false from start → zero iterations", () => {
    const v = runSync(`
      let count = 0;
      while (false) {
        count++;
      }
    `);
    expect(v.count).equal(0);
  });

  it("for-of: empty array → zero iterations, sum stays at initial value", () => {
    const v = runSync(`
      let sum = 42;
      for (let item of items) {
        sum += item;
      }
    `, { items: [] });
    expect(v.sum).equal(42);
  });

  it("for-in: empty object → zero iterations", () => {
    const v = runSync(`
      let count = 0;
      for (let key in obj) {
        count++;
      }
    `, { obj: {} });
    expect(v.count).equal(0);
  });

  it("for-loop: exactly one iteration", () => {
    const v = runSync(`
      let count = 0;
      for (let i = 0; i < 1; i++) {
        count++;
      }
    `);
    expect(v.count).equal(1);
  });

  it("do-while: body executes ONCE even when condition is false from the start", () => {
    // This is the defining semantic of do-while: the body runs before the
    // condition is checked for the first time.
    const v = runSync(`
      let count = 0;
      do {
        count++;
      } while (false);
    `);
    expect(v.count).equal(1);
  });

  it("do-while: body executes ONCE when condition becomes false after first run", () => {
    const v = runSync(`
      let i = 5;
      let count = 0;
      do {
        count++;
        i++;
      } while (i < 5);
    `);
    expect(v.count).equal(1);
    expect(v.i).equal(6);
  });
});

// =============================================================================
// Risk J — async path must honour the same guarantees
// The async interpreter (processStatementQueueAsync) shares the StatementQueue
// and will be equally affected by native loop execution changes.
// A representative subset of the above scenarios is repeated here.
// =============================================================================
describe("Risk J — async path: same guarantees as sync path", () => {
  it("async for-of: break exits at correct item", async () => {
    const v = await runAsync(`
      let sum = 0;
      for (let item of items) {
        if (item === 30) break;
        sum += item;
      }
    `, { items: [10, 20, 30, 40, 50] });
    expect(v.sum).equal(30);
  });

  it("async for-of: continue skips item correctly", async () => {
    const v = await runAsync(`
      let sum = 0;
      for (let item of items) {
        if (item === 3) continue;
        sum += item;
      }
    `, { items: [1, 2, 3, 4, 5] });
    expect(v.sum).equal(12);
  });

  it("async for-loop: break inside try, finally still runs", async () => {
    const v = await runAsync(`
      let finallyCount = 0;
      for (let i = 0; i < 5; i++) {
        try {
          if (i === 2) break;
        } finally {
          finallyCount++;
        }
      }
    `);
    expect(v.finallyCount).equal(3);
  });

  it("async for-loop: continue does not skip i++", async () => {
    const v = await runAsync(`
      let sum = 0;
      for (let i = 1; i <= 10; i++) {
        if (i % 2 === 0) continue;
        sum += i;
      }
    `);
    expect(v.sum).equal(25);
  }, VITEST_TIMEOUT);

  it("async nested loops: break inner does not break outer", async () => {
    const v = await runAsync(`
      let count = 0;
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          if (j === 2) break;
          count++;
        }
      }
    `);
    expect(v.count).equal(10);
  });

  it("async: catch inside loop body, loop continues", async () => {
    const v = await runAsync(`
      let successes = 0;
      let errors = 0;
      for (let i = 0; i < 5; i++) {
        try {
          if (i === 2) throw "bad";
          successes++;
        } catch (e) {
          errors++;
        }
      }
    `);
    expect(v.successes).equal(4);
    expect(v.errors).equal(1);
  });

  it("async do-while executes body at least once", async () => {
    const v = await runAsync(`
      let count = 0;
      do {
        count++;
      } while (false);
    `);
    expect(v.count).equal(1);
  });
});
