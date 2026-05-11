# Refactoring Plan: Native Loop Execution

**Date:** 2026-05-11  
**Branch:** `claude/lucid-hertz-ef7df7`  
**Expected gain:** 3–10× speedup for loop-heavy code  
**Risk level:** Medium — requires new signal propagation mechanism  

---

## Context

XMLUI's scripting engine is a tree-walking interpreter that executes statements by
placing them into a `StatementQueue` and processing them one by one. Currently every
loop iteration is implemented by re-inserting the loop guard back into the queue,
which means a loop of N iterations produces ~5·N queue operations.

The goal is to replace queue-based iteration with a **native JavaScript `while` loop**
inside the interpreter itself.  Instead of round-tripping through the queue for every
iteration, the interpreter runs all iterations in one native call, which V8 can
execute far more efficiently.

The key challenge is control-flow signals.  `break`, `continue`, `return`, and
`throw` inside a loop body must still work correctly.  Currently they are
communicated via queue labels (`clearToLabel`).  After this refactoring they will
be communicated via a new **`LoopSignal`** value returned from the body executor.

---

## Files that will change

| File | What changes |
|------|-------------|
| `src/components-core/script-runner/statement-queue.ts` | Add `LoopSignal` type |
| `src/components-core/script-runner/process-statement-common.ts` | Add `executeBodySync` / `executeBodyAsync` helpers |
| `src/components-core/script-runner/process-statement-sync.ts` | Replace `T_FOR_STATEMENT`, `T_FOR_OF_STATEMENT`, `T_FOR_IN_STATEMENT`, `T_WHILE_STATEMENT`, `T_DO_WHILE_STATEMENT` cases |
| `src/components-core/script-runner/process-statement-async.ts` | Same cases, async variants |

No changes to the parser, AST types, `evalBinding`, or any public API.

---

## New concept: LoopSignal

A `LoopSignal` is a small object that a loop body returns to its enclosing loop
when it needs to interrupt normal iteration.  It replaces the current mechanism
where `break`/`continue` write a `clearToLabel` into the queue.

```typescript
// In statement-queue.ts (or a new loop-signal.ts)

export type LoopSignal =
  | { kind: "break" }
  | { kind: "continue" }
  | { kind: "return" }    // return already stores value in thread.returnValue
  | { kind: "throw"; error: unknown };  // unhandled exception from body
```

The body executor returns `undefined` for "keep going normally", or one of the
four signals above.

---

## Phase 1 — Add `executeBodySync` / `executeBodyAsync`

**Goal:** extract the body-execution logic into a standalone helper that can return
a `LoopSignal`.  No loop types are changed yet; this phase only adds the helper.

### What to implement

Add to `process-statement-common.ts`:

```typescript
/**
 * Executes the statements of a loop body in a sub-queue, returns a LoopSignal
 * if the body performed break/continue/return/throw, or undefined if it ran
 * to completion normally.
 */
export function executeBodySync(
  bodyStatement: Statement,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
  loopScope: LoopScope,
): LoopSignal | undefined { ... }

export async function executeBodyAsync(
  bodyStatement: Statement,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
  loopScope: LoopScope,
): Promise<LoopSignal | undefined> { ... }
```

**Internally**, each helper:
1. Creates a temporary mini-queue containing only `bodyStatement`.
2. Runs it with the existing `processStatementQueue` sub-call.
3. After the sub-call, inspects the thread state to determine what signal to return:
   - If `thread.returnValue !== SENTINEL` → signal `"return"`.
   - If the mini-queue was cleared to the `loopScope.breakLabel` → signal `"break"`.
   - If cleared to `loopScope.continueLabel` → signal `"continue"`.
   - If an exception escaped → signal `"throw"`.
   - Otherwise → `undefined` (normal completion).

> **Why a sub-queue instead of a direct recursive call?**  The existing statement
> handlers (`processStatement`) already know how to run blocks, try/catch/finally,
> and nested control flow — they push items into a queue and drive them.  Reusing
> that machinery means try/finally inside a loop body works without any extra code.
> The only new thing is detecting what happened *after* the sub-queue finishes.

### Test milestone

All 44 tests in `loop-control-flow.test.ts` must still pass after adding the helper
(it is not yet used, so this is a no-op check).  The helper itself gets its own unit
tests verifying each signal type.

---

## Phase 2 — Replace `T_FOR_OF_STATEMENT` (sync, then async)

**Goal:** migrate the simplest loop type first to validate the signal mechanism
end-to-end before touching the more complex `for` loop.

`for...of` is the simplest because:
- The iterator is already captured in `execInfo.iterator` in the current code.
- There is no update expression (unlike `for`).
- The loop variable is set once per iteration.

### New implementation sketch

```typescript
case T_FOR_OF_STATEMENT: {
  // --- Evaluate the iterable once
  const iterableObj = evalBinding(statement.expr, evalContext, thread);
  if (iterableObj == null || typeof iterableObj[Symbol.iterator] !== "function") {
    throw new Error("Object in for..of is not iterable");
  }

  // --- Create loop infrastructure (same as before)
  const loopScope = createLoopScope(thread, 1);
  thread.blocks ??= [];
  thread.blocks.push({ vars: {} });   // block for the loop variable

  const iter = iterableObj[Symbol.iterator]();

  nativeLoop: while (true) {
    const next = iter.next();
    if (next.done) break nativeLoop;

    // --- Set the loop variable for this iteration
    const block = innermostBlockScope(thread)!;
    // clear the variable from the previous iteration (re-declare for let/const)
    block.vars = {};
    block.constVars = undefined;
    setLoopVariable(statement, block, next.value, evalContext, thread);

    // --- Execute body; get signal
    const signal = executeBodySync(statement.body, evalContext, thread, loopScope);

    if (signal === undefined) continue nativeLoop;   // normal completion
    if (signal.kind === "continue") continue nativeLoop;
    if (signal.kind === "break") break nativeLoop;
    if (signal.kind === "return") {
      releaseLoopScope(thread);
      return { clearToLabel: -1 };   // propagate return up the outer queue
    }
    if (signal.kind === "throw") throw signal.error;
  }

  releaseLoopScope(thread);
  break;   // break out of the switch, not the loop
}
```

> **Why `block.vars = {}` at the start of each iteration?**  A `let` variable
> declared in the loop header (`for (let item of ...)`) must be a fresh binding
> per iteration.  The current queue-based code creates a new block scope each
> iteration via the queue; with native execution we reuse the same block object
> but clear its contents.

### Test milestone

- All 44 control-flow tests pass.
- `loop-performance.test.ts` `for-of` scaling ratio drops (expect 2–5× improvement).
- Run the full `npm run test:unit` suite — zero regressions.

---

## Phase 3 — Replace `T_FOR_IN_STATEMENT`

`for...in` is structurally identical to `for...of` but uses `Object.keys()` with
an index instead of a JS iterator.  The implementation mirrors Phase 2 exactly,
replacing `iter.next()` with `keys[keyIndex++]`.

### Test milestone

Same as Phase 2.  The `for-in` scaling tests in `loop-performance.test.ts` improve.

---

## Phase 4 — Replace `T_WHILE_STATEMENT` and `T_DO_WHILE_STATEMENT`

These have no loop variable, so there is no block-scope management per iteration.
The body is called the same way via `executeBodySync`.

```typescript
case T_WHILE_STATEMENT: {
  const loopScope = createLoopScope(thread);

  nativeLoop: while (true) {
    const condition = !!evalBinding(statement.cond, evalContext, thread);
    if (!condition) break nativeLoop;

    const signal = executeBodySync(statement.body, evalContext, thread, loopScope);

    if (signal === undefined || signal.kind === "continue") continue nativeLoop;
    if (signal.kind === "break") break nativeLoop;
    if (signal.kind === "return") { releaseLoopScope(thread); return { clearToLabel: -1 }; }
    if (signal.kind === "throw") throw signal.error;
  }

  releaseLoopScope(thread);
  break;
}
```

`do-while` is the same but the body runs before the first condition check.

### Test milestone

`while` and `do-while` scaling tests improve.  All 44 control-flow tests pass.

---

## Phase 5 — Replace `T_FOR_STATEMENT`

`for` is the most complex loop because it has three parts: init, condition, and
update.  The critical correctness requirement is that **the update expression must
run even when `continue` is encountered**.

```typescript
case T_FOR_STATEMENT: {
  // --- Run init once (let i = 0)
  if (statement.init) {
    const loopBlockForInit: BlockScope = { vars: {} };
    thread.blocks ??= [];
    thread.blocks.push(loopBlockForInit);
    processInitStatement(statement.init, evalContext, thread);
    // Note: we do NOT pop this block — it lives for the entire loop
    // so that i is visible throughout the body and update.
  } else {
    thread.blocks ??= [];
    thread.blocks.push({ vars: {} });
  }

  const loopScope = createLoopScope(thread, 1);

  nativeLoop: while (true) {
    // --- Check condition
    if (statement.cond && !evalBinding(statement.cond, evalContext, thread)) {
      break nativeLoop;
    }

    // --- Execute body
    const signal = executeBodySync(statement.body, evalContext, thread, loopScope);

    // --- Update expression runs for both normal completion AND continue
    if (signal === undefined || signal.kind === "continue") {
      if (statement.upd) evalBinding(statement.upd, evalContext, thread);
      continue nativeLoop;
    }
    if (signal.kind === "break") break nativeLoop;
    if (signal.kind === "return") { releaseLoopScope(thread); return { clearToLabel: -1 }; }
    if (signal.kind === "throw") throw signal.error;
  }

  releaseLoopScope(thread);
  break;
}
```

> **Why does `continue` still run the update?**  In JavaScript (and XMLUI),
> `continue` in a `for` loop means "skip the rest of the body and go to the
> next iteration", and the next iteration begins with the update expression.
> If the update is skipped, a loop like `for (let i=0; i<n; i++) { if (x) continue; }`
> would freeze at `i=0` forever.  The Risk B tests in `loop-control-flow.test.ts`
> catch this specific bug.

### Test milestone

All for-loop scaling tests improve.  All 44 control-flow tests pass.
Run `npm run test:unit` — zero regressions across all ~250 tests.

---

## Phase 6 — Async variants

Repeat Phases 2–5 for `process-statement-async.ts`, replacing each loop case
with the async-native version using `executeBodyAsync`.

The structure is identical; only `evalBinding` becomes `await evalBindingAsync`
and `executeBodySync` becomes `await executeBodyAsync`.

### Test milestone

All Risk J async tests pass.  Full test suite passes.

---

## Phase 7 — Cleanup and performance measurement

1. Delete the old `guard`-based loop paths from `process-statement-common.ts`
   (`provideLoopBody`, and the `guard: true` branches in each loop case) — they
   are no longer reachable.

2. Run `loop-performance.test.ts` and record the new numbers into a second
   baseline file: `loop-performance-after-native-loops.md`.

3. Compare the two baseline files.  Target: for-loop and for-of scaling ratios
   remain < 25× (the regression guard), and absolute times drop 3–10×.

4. Run the full `npm run test:unit` one final time.

---

## Risk register

| Risk | Severity | Mitigation |
|------|----------|-----------|
| `continue` in `for` skips `i++` → infinite loop | High | Phase 5 explicitly runs update before `continue nativeLoop`. Risk B tests catch this. |
| `finally` inside loop body not running on break/continue | High | `executeBodySync` uses the existing queue sub-call which already handles try/finally via the queue mechanism. Risk F tests catch this. |
| Inner break leaking to outer loop | Medium | Each loop creates its own `loopScope`. The signal is consumed by the innermost `nativeLoop` that created it. Risk G tests catch this. |
| Async path diverges from sync path | Medium | Phase 6 mirrors Phase 5 exactly. Risk J tests catch divergence. |
| Loop variable leaking between iterations | Low | `block.vars = {}` at the start of each for-of/for-in iteration. Risk H tests catch this. |
| Return inside nested loops | Medium | Each loop propagates `signal.kind === "return"` upward. Risk C matrix test catches this. |
| Performance regression (slower than before) | Low | The `ratio < 25×` assertions in `loop-performance.test.ts` act as a floor. If native loops are somehow slower, the ratio would approach the old quadratic range and fail. |

---

## Test files that act as guards throughout

| File | Purpose |
|------|---------|
| `loop-control-flow.test.ts` | 44 tests covering all 10 risk categories (A–J). Must stay green after every phase. |
| `loop-performance.test.ts` | 20 tests. Correctness + scaling ratio guards. Ratios must stay < 25×. |
| Full `npm run test:unit` | ~250 tests. Zero regressions expected. Must run after each phase. |

---

## Implementation order summary

```
Phase 1  Add LoopSignal type + executeBodySync/Async helpers
Phase 2  for...of (sync)
Phase 3  for...in (sync)
Phase 4  while / do-while (sync)
Phase 5  for (sync)  ← most complex, do last among sync
Phase 6  All loop types (async)
Phase 7  Delete dead code, measure, document
```

Each phase ends with a full test run.  Do not start the next phase until all
tests are green.
