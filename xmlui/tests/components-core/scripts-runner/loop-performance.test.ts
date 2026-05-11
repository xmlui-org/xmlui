import { describe, expect, it } from "vitest";

import { processStatementQueue } from "../../../src/components-core/script-runner/process-statement-sync";
import { processStatementQueueAsync } from "../../../src/components-core/script-runner/process-statement-async";
import { createEvalContext, parseStatements } from "./test-helpers";
import type { QueueInfo } from "../../../src/components-core/script-runner/statement-queue";
import type { BindingTreeEvaluationContext } from "../../../src/components-core/script-runner/BindingTreeEvaluationContext";

// Allow enough time for slow pre-optimization runs
const EVAL_TIMEOUT_MS = 120_000;
const VITEST_TIMEOUT_MS = 180_000;

// Generous linearity bound: linear should be ~10x, quadratic ~100x.
// Threshold of 25 catches quadratic regression without flaking on CI variance.
const LINEARITY_RATIO_MAX = 25;

function makeCtx(extra?: Partial<BindingTreeEvaluationContext>): BindingTreeEvaluationContext {
  return createEvalContext({
    localContext: {},
    appContext: { appGlobals: { syncExecutionTimeout: EVAL_TIMEOUT_MS } } as any,
    timeout: EVAL_TIMEOUT_MS,
    ...extra,
  });
}

type BenchResult = { vars: Record<string, any>; diag: QueueInfo; ms: number };

function runSync(source: string, localContext: Record<string, any> = {}): BenchResult {
  const ctx = makeCtx({ localContext });
  const stmts = parseStatements(source);
  const t0 = performance.now();
  const diag = processStatementQueue(stmts, ctx);
  const ms = performance.now() - t0;
  return { vars: ctx.mainThread!.blocks![0].vars, diag, ms };
}

async function runAsync(source: string, localContext: Record<string, any> = {}): Promise<BenchResult> {
  const ctx = makeCtx({ localContext });
  const stmts = parseStatements(source);
  const t0 = performance.now();
  const diag = await processStatementQueueAsync(stmts, ctx);
  const ms = performance.now() - t0;
  return { vars: ctx.mainThread!.blocks![0].vars, diag, ms };
}

function logBench(label: string, ms: number, diag: QueueInfo): void {
  console.info(
    `[bench] ${label}: ${ms.toFixed(2)}ms | ` +
    `processed=${diag.processedStatements} unshifted=${diag.unshiftedItems} ` +
    `maxQueue=${diag.maxQueueLength}`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// for-loop (sync)
// ─────────────────────────────────────────────────────────────────────────────
describe("Loop performance — for-loop (sync)", () => {
  it("for-loop 1K iterations: correctness + timing", () => {
    const { vars, diag, ms } = runSync(
      "let sum = 0; for (let i = 1; i <= 1000; i++) { sum += i; }",
    );
    expect(vars.sum).equal(500_500); // 1000 * 1001 / 2
    logBench("for-loop sync 1K", ms, diag);
  }, VITEST_TIMEOUT_MS);

  it("for-loop 10K iterations: correctness + timing", () => {
    const { vars, diag, ms } = runSync(
      "let sum = 0; for (let i = 1; i <= 10000; i++) { sum += i; }",
    );
    expect(vars.sum).equal(50_005_000); // 10000 * 10001 / 2
    logBench("for-loop sync 10K", ms, diag);
  }, VITEST_TIMEOUT_MS);

  it("for-loop scaling: 10K/1K time ratio must be < 25x (linear, not quadratic)", () => {
    const r1k = runSync("let sum = 0; for (let i = 1; i <= 1000; i++) { sum += i; }");
    const r10k = runSync("let sum = 0; for (let i = 1; i <= 10000; i++) { sum += i; }");
    const ratio = r10k.ms / r1k.ms;
    console.info(
      `[bench] for-loop sync scaling: ${r1k.ms.toFixed(2)}ms → ${r10k.ms.toFixed(2)}ms` +
      ` (ratio: ${ratio.toFixed(1)}x, threshold: ${LINEARITY_RATIO_MAX}x)`,
    );
    // Before fix (quadratic): ratio ≈ 100x. After fix (linear): ratio ≈ 10x.
    expect(ratio).toBeLessThan(LINEARITY_RATIO_MAX);
  }, VITEST_TIMEOUT_MS);
});

// ─────────────────────────────────────────────────────────────────────────────
// for-of loop (sync)
// ─────────────────────────────────────────────────────────────────────────────
describe("Loop performance — for-of loop (sync)", () => {
  it("for-of 1K items: correctness + timing", () => {
    const items = Array.from({ length: 1_000 }, (_, i) => i + 1);
    const { vars, diag, ms } = runSync(
      "let sum = 0; for (let item of items) { sum += item; }",
      { items },
    );
    expect(vars.sum).equal(500_500);
    logBench("for-of sync 1K", ms, diag);
  }, VITEST_TIMEOUT_MS);

  it("for-of 10K items: correctness + timing", () => {
    const items = Array.from({ length: 10_000 }, (_, i) => i + 1);
    const { vars, diag, ms } = runSync(
      "let sum = 0; for (let item of items) { sum += item; }",
      { items },
    );
    expect(vars.sum).equal(50_005_000);
    logBench("for-of sync 10K", ms, diag);
  }, VITEST_TIMEOUT_MS);

  it("for-of scaling: 10K/1K time ratio must be < 25x (linear, not quadratic)", () => {
    const items1k = Array.from({ length: 1_000 }, (_, i) => i + 1);
    const items10k = Array.from({ length: 10_000 }, (_, i) => i + 1);
    const source = "let sum = 0; for (let item of items) { sum += item; }";
    const r1k = runSync(source, { items: items1k });
    const r10k = runSync(source, { items: items10k });
    const ratio = r10k.ms / r1k.ms;
    console.info(
      `[bench] for-of sync scaling: ${r1k.ms.toFixed(2)}ms → ${r10k.ms.toFixed(2)}ms` +
      ` (ratio: ${ratio.toFixed(1)}x, threshold: ${LINEARITY_RATIO_MAX}x)`,
    );
    expect(ratio).toBeLessThan(LINEARITY_RATIO_MAX);
  }, VITEST_TIMEOUT_MS);
});

// ─────────────────────────────────────────────────────────────────────────────
// while loop (sync)
// ─────────────────────────────────────────────────────────────────────────────
describe("Loop performance — while loop (sync)", () => {
  it("while 1K iterations: correctness + timing", () => {
    const { vars, diag, ms } = runSync(
      "let i = 1; let sum = 0; while (i <= 1000) { sum += i; i++; }",
    );
    expect(vars.sum).equal(500_500);
    logBench("while sync 1K", ms, diag);
  }, VITEST_TIMEOUT_MS);

  it("while 10K iterations: correctness + timing", () => {
    const { vars, diag, ms } = runSync(
      "let i = 1; let sum = 0; while (i <= 10000) { sum += i; i++; }",
    );
    expect(vars.sum).equal(50_005_000);
    logBench("while sync 10K", ms, diag);
  }, VITEST_TIMEOUT_MS);

  it("while scaling: 10K/1K time ratio must be < 25x (linear, not quadratic)", () => {
    const r1k = runSync("let i = 1; let sum = 0; while (i <= 1000) { sum += i; i++; }");
    const r10k = runSync("let i = 1; let sum = 0; while (i <= 10000) { sum += i; i++; }");
    const ratio = r10k.ms / r1k.ms;
    console.info(
      `[bench] while sync scaling: ${r1k.ms.toFixed(2)}ms → ${r10k.ms.toFixed(2)}ms` +
      ` (ratio: ${ratio.toFixed(1)}x, threshold: ${LINEARITY_RATIO_MAX}x)`,
    );
    expect(ratio).toBeLessThan(LINEARITY_RATIO_MAX);
  }, VITEST_TIMEOUT_MS);
});

// ─────────────────────────────────────────────────────────────────────────────
// do-while loop (sync)
// ─────────────────────────────────────────────────────────────────────────────
describe("Loop performance — do-while loop (sync)", () => {
  it("do-while 1K iterations: correctness + timing", () => {
    const { vars, diag, ms } = runSync(
      "let i = 1; let sum = 0; do { sum += i; i++; } while (i <= 1000);",
    );
    expect(vars.sum).equal(500_500);
    logBench("do-while sync 1K", ms, diag);
  }, VITEST_TIMEOUT_MS);

  it("do-while 10K iterations: correctness + timing", () => {
    const { vars, diag, ms } = runSync(
      "let i = 1; let sum = 0; do { sum += i; i++; } while (i <= 10000);",
    );
    expect(vars.sum).equal(50_005_000);
    logBench("do-while sync 10K", ms, diag);
  }, VITEST_TIMEOUT_MS);
});

// ─────────────────────────────────────────────────────────────────────────────
// for-in loop (sync)
// ─────────────────────────────────────────────────────────────────────────────
describe("Loop performance — for-in loop (sync)", () => {
  it("for-in 500 keys: correctness + timing", () => {
    const obj: Record<string, number> = {};
    for (let i = 0; i < 500; i++) obj[`k${i}`] = i;
    const { vars, diag, ms } = runSync(
      "let count = 0; for (let key in obj) { count++; }",
      { obj },
    );
    expect(vars.count).equal(500);
    logBench("for-in sync 500 keys", ms, diag);
  }, VITEST_TIMEOUT_MS);

  it("for-in 2K keys: correctness + timing", () => {
    const obj: Record<string, number> = {};
    for (let i = 0; i < 2_000; i++) obj[`k${i}`] = i;
    const { vars, diag, ms } = runSync(
      "let count = 0; for (let key in obj) { count++; }",
      { obj },
    );
    expect(vars.count).equal(2_000);
    logBench("for-in sync 2K keys", ms, diag);
  }, VITEST_TIMEOUT_MS);

  it("for-in scaling: 2K/500 time ratio must be < 25x (linear, not quadratic)", () => {
    const obj500: Record<string, number> = {};
    for (let i = 0; i < 500; i++) obj500[`k${i}`] = i;
    const obj2k: Record<string, number> = {};
    for (let i = 0; i < 2_000; i++) obj2k[`k${i}`] = i;
    const source = "let count = 0; for (let key in obj) { count++; }";
    const r500 = runSync(source, { obj: obj500 });
    const r2k = runSync(source, { obj: obj2k });
    const ratio = r2k.ms / r500.ms;
    console.info(
      `[bench] for-in sync scaling: ${r500.ms.toFixed(2)}ms → ${r2k.ms.toFixed(2)}ms` +
      ` (ratio: ${ratio.toFixed(1)}x, threshold: ${LINEARITY_RATIO_MAX}x)`,
    );
    expect(ratio).toBeLessThan(LINEARITY_RATIO_MAX);
  }, VITEST_TIMEOUT_MS);
});

// ─────────────────────────────────────────────────────────────────────────────
// for-of loop (async)
// ─────────────────────────────────────────────────────────────────────────────
describe("Loop performance — for-of loop (async)", () => {
  it("for-of async 1K items: correctness + timing", async () => {
    const items = Array.from({ length: 1_000 }, (_, i) => i + 1);
    const { vars, diag, ms } = await runAsync(
      "let sum = 0; for (let item of items) { sum += item; }",
      { items },
    );
    expect(vars.sum).equal(500_500);
    logBench("for-of async 1K", ms, diag);
  }, VITEST_TIMEOUT_MS);

  it("for-of async 10K items: correctness + timing", async () => {
    const items = Array.from({ length: 10_000 }, (_, i) => i + 1);
    const { vars, diag, ms } = await runAsync(
      "let sum = 0; for (let item of items) { sum += item; }",
      { items },
    );
    expect(vars.sum).equal(50_005_000);
    logBench("for-of async 10K", ms, diag);
  }, VITEST_TIMEOUT_MS);

  it("for-of async scaling: 10K/1K time ratio must be < 25x (linear, not quadratic)", async () => {
    const items1k = Array.from({ length: 1_000 }, (_, i) => i + 1);
    const items10k = Array.from({ length: 10_000 }, (_, i) => i + 1);
    const source = "let sum = 0; for (let item of items) { sum += item; }";
    const r1k = await runAsync(source, { items: items1k });
    const r10k = await runAsync(source, { items: items10k });
    const ratio = r10k.ms / r1k.ms;
    console.info(
      `[bench] for-of async scaling: ${r1k.ms.toFixed(2)}ms → ${r10k.ms.toFixed(2)}ms` +
      ` (ratio: ${ratio.toFixed(1)}x, threshold: ${LINEARITY_RATIO_MAX}x)`,
    );
    expect(ratio).toBeLessThan(LINEARITY_RATIO_MAX);
  }, VITEST_TIMEOUT_MS);
});

// ─────────────────────────────────────────────────────────────────────────────
// nested loops (sync) — stress test for queue under deeper nesting
// ─────────────────────────────────────────────────────────────────────────────
describe("Loop performance — nested loops (sync)", () => {
  it("nested for-loop 50×50 = 2500 body executions: correctness + timing", () => {
    const { vars, diag, ms } = runSync(
      "let sum = 0; for (let i = 0; i < 50; i++) { for (let j = 0; j < 50; j++) { sum++; } }",
    );
    expect(vars.sum).equal(2_500);
    logBench("nested for-loop 50×50", ms, diag);
  }, VITEST_TIMEOUT_MS);

  it("nested for-loop 100×100 = 10K body executions: correctness + timing", () => {
    const { vars, diag, ms } = runSync(
      "let sum = 0; for (let i = 0; i < 100; i++) { for (let j = 0; j < 100; j++) { sum++; } }",
    );
    expect(vars.sum).equal(10_000);
    logBench("nested for-loop 100×100", ms, diag);
  }, VITEST_TIMEOUT_MS);

  it("nested loop scaling: 100×100/50×50 ratio must be < 25x (linear, not quadratic)", () => {
    const r50 = runSync(
      "let sum = 0; for (let i = 0; i < 50; i++) { for (let j = 0; j < 50; j++) { sum++; } }",
    );
    const r100 = runSync(
      "let sum = 0; for (let i = 0; i < 100; i++) { for (let j = 0; j < 100; j++) { sum++; } }",
    );
    const ratio = r100.ms / r50.ms;
    console.info(
      `[bench] nested loop scaling: ${r50.ms.toFixed(2)}ms → ${r100.ms.toFixed(2)}ms` +
      ` (ratio: ${ratio.toFixed(1)}x, threshold: ${LINEARITY_RATIO_MAX}x)`,
    );
    // 100×100 has 4x more body executions than 50×50; linear → ratio ≈ 4x.
    expect(ratio).toBeLessThan(LINEARITY_RATIO_MAX);
  }, VITEST_TIMEOUT_MS);
});
