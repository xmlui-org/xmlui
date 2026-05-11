# Loop Performance Baseline — Before Optimization

**Date:** 2026-05-11  
**Branch:** claude/lucid-hertz-ef7df7  
**Machine:** macOS 25.4.0 (Apple Silicon, development machine)  
**Node:** run via `npm run test:unit` from `xmlui/`  
**Commit:** pre-Direction-4 (plain `Array`-based `StatementQueue`)

---

## What These Numbers Measure

Each row shows how long the XMLUI scripting engine takes to **interpret** a loop written in XMLUI's scripting language. The engine walks an AST (Abstract Syntax Tree) node by node — it does not compile the code to native JavaScript. The times below reflect that interpretation overhead.

`processed` = total number of queue items processed (each statement in the script becomes one or more queue items).  
`unshifted` = total number of items prepended to the front of the queue (every loop iteration generates this).  
`maxQueue` = the largest the queue ever got during execution — this is the key number for understanding queue behavior.

---

## Raw Numbers (single run, warm JIT)

### for-loop (sync)

The script: `let sum = 0; for (let i = 1; i <= N; i++) { sum += i; }`

| N | Time (ms) | processed stmts | unshifted items | maxQueue |
|---|-----------|-----------------|-----------------|----------|
| 1 000 | 2.00 | 5 004 | 5 002 | 4 |
| 10 000 | 19.47 | 50 004 | 50 002 | 4 |

**Scaling ratio 10K/1K: 9.7× — LINEAR**

---

### for-of loop (sync)

The script: `let sum = 0; for (let item of items) { sum += item; }`

| N | Time (ms) | processed stmts | unshifted items | maxQueue |
|---|-----------|-----------------|-----------------|----------|
| 1 000 | 1.39 | 4 003 | 4 001 | 3 |
| 10 000 | 13.71 | 40 003 | 40 001 | 3 |

**Scaling ratio 10K/1K: 9.8× — LINEAR**

---

### while loop (sync)

The script: `let i = 1; let sum = 0; while (i <= N) { sum += i; i++; }`

| N | Time (ms) | processed stmts | unshifted items | maxQueue |
|---|-----------|-----------------|-----------------|----------|
| 1 000 | 2.52 | 5 003 | 5 000 | 4 |
| 10 000 | 20.67 | 50 003 | 50 000 | 4 |

**Scaling ratio 10K/1K: 8.2× — LINEAR**

---

### do-while loop (sync)

The script: `let i = 1; let sum = 0; do { sum += i; i++; } while (i <= N);`

| N | Time (ms) | processed stmts | unshifted items | maxQueue |
|---|-----------|-----------------|-----------------|----------|
| 1 000 | 2.34 | 5 003 | 5 000 | 4 |
| 10 000 | 21.07 | 50 003 | 50 000 | 4 |

*(No scaling test written for do-while — add if needed.)*

---

### for-in loop (sync)

The script: `let count = 0; for (let key in obj) { count++; }`

| Keys | Time (ms) | processed stmts | unshifted items | maxQueue |
|------|-----------|-----------------|-----------------|----------|
| 500 | 0.85 | 2 003 | 2 001 | 3 |
| 2 000 | 3.03 | 8 003 | 8 001 | 3 |

**Scaling ratio 2K/500 (4× more keys): 3.6× — LINEAR**

---

### for-of loop (async)

The script: `let sum = 0; for (let item of items) { sum += item; }` — run through the async engine.

| N | Time (ms) | processed stmts | unshifted items | maxQueue |
|---|-----------|-----------------|-----------------|----------|
| 1 000 | 3.70 | 4 003 | 4 001 | 3 |
| 10 000 | 26.90 | 40 003 | 40 001 | 3 |

**Scaling ratio 10K/1K: 7.3× — LINEAR**

---

### Nested for-loops (sync)

The script: `let sum = 0; for (let i = 0; i < OUTER; i++) { for (let j = 0; j < INNER; j++) { sum++; } }`

| OUTER×INNER | Body executions | Time (ms) | processed stmts | unshifted items | maxQueue |
|-------------|-----------------|-----------|-----------------|-----------------|----------|
| 50×50 | 2 500 | 4.00 | 12 854 | 12 852 | 7 |
| 100×100 | 10 000 | 16.32 | 50 704 | 50 702 | 7 |

**Scaling ratio (4× more body execs): 4.1× — LINEAR**

---

## Key Finding: Queue Does NOT Grow

The most important observation from this baseline is that `maxQueue` is **3–7 regardless of iteration count**. This disproves the original claim in the JIT proposal that the queue causes O(n²) behavior via `Array.unshift()`.

The real situation: the queue is always small (3–7 items), so `Array.shift()` and `Array.unshift()` on a 3–7 element array are effectively O(1) in V8. The implementation is already **O(n)** with respect to iteration count.

The actual performance bottleneck is the **constant-factor overhead** per iteration: each loop iteration requires processing 4–5 queue items, each of which involves function dispatch, object creation, and scope-chain traversal. This makes XMLUI loops roughly **10–30× slower** than equivalent native JavaScript — a constant multiplier, not a growing one.

---

## What Direction 4 Will Change

Direction 4 replaces the `Array` inside `StatementQueue` with a proper deque (double-ended queue) that has O(1) front-insert and front-remove operations regardless of size. Given that the queue is already small, the expected gain is:

- **If current bottleneck is array operations:** modest improvement (5–20%), since V8 already handles small arrays fast.
- **If future code paths create larger queues** (e.g., large switch statements, deeply nested blocks): the deque prevents any future regression to O(n²) and makes the queue operations truly O(1) regardless of content.
- **The regression-guard tests** (ratio < 25×) will catch any future change that accidentally makes loops quadratic.

For the claimed 50–500× improvement, Direction 1 (JIT compilation to native functions) is required.
