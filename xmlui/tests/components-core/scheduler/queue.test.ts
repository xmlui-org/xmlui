import { describe, expect, it } from "vitest";

import { createScheduler } from "../../../src/components-core/scheduler";

describe("createScheduler", () => {
  it("runs concurrent tasks immediately", async () => {
    const calls: string[] = [];
    const scheduler = createScheduler("concurrent");
    await scheduler.enqueue({
      traceId: "t",
      spanId: "s",
      enqueuedAt: 1,
      label: "a",
      handler: async () => {
        calls.push("a");
      },
    });
    await scheduler.drain("t");
    expect(calls).toEqual(["a"]);
  });

  it("drains fifo tasks in enqueue order", async () => {
    const calls: string[] = [];
    const scheduler = createScheduler("fifo");
    const promises = [];
    for (const label of ["a", "b"]) {
      promises.push(scheduler.enqueue({
        traceId: "t",
        spanId: label,
        enqueuedAt: calls.length,
        label,
        handler: async () => {
          calls.push(label);
        },
      }));
    }
    await Promise.all(promises);
    await scheduler.drain("t");
    expect(calls).toEqual(["a", "b"]);
  });

  it("allows different fifo traces to drain independently", async () => {
    const calls: string[] = [];
    const scheduler = createScheduler("fifo");
    const a = scheduler.enqueue({
      traceId: "a",
      spanId: "a1",
      enqueuedAt: 1,
      label: "a1",
      handler: async () => {
        await Promise.resolve();
        calls.push("a1");
      },
    });
    const b = scheduler.enqueue({
      traceId: "b",
      spanId: "b1",
      enqueuedAt: 2,
      label: "b1",
      handler: async () => {
        calls.push("b1");
      },
    });
    await Promise.all([a, b]);
    expect(calls).toEqual(["b1", "a1"]);
  });

  it("reports reordered concurrent completions", async () => {
    const diagnostics: any[] = [];
    const resolvers: Array<() => void> = [];
    const scheduler = createScheduler("concurrent", {
      onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
    });
    const first = scheduler.enqueue({
      traceId: "t",
      spanId: "first",
      enqueuedAt: 1,
      label: "first",
      handler: () => new Promise<void>((resolve) => resolvers.push(resolve)),
    });
    const second = scheduler.enqueue({
      traceId: "t",
      spanId: "second",
      enqueuedAt: 2,
      label: "second",
      handler: async () => undefined,
    });
    await second;
    resolvers[0]();
    await first;
    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: "determinism-handler-reordered",
        traceId: "t",
      }),
    ]);
  });

  it("rejects fifo tasks beyond maxQueuedPerTrace", async () => {
    const diagnostics: any[] = [];
    const scheduler = createScheduler("fifo", {
      maxQueuedPerTrace: 1,
      onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
    });
    const hold = scheduler.enqueue({
      traceId: "t",
      spanId: "first",
      enqueuedAt: 1,
      label: "first",
      handler: () => new Promise<void>(() => undefined),
    });
    const rejected = scheduler.enqueue({
      traceId: "t",
      spanId: "second",
      enqueuedAt: 2,
      label: "second",
      handler: async () => undefined,
    });
    await expect(rejected).rejects.toThrow("maxQueuedPerTrace");
    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: "determinism-convergence-failed",
        traceId: "t",
      }),
    ]);
    void hold.catch(() => undefined);
  });
});
